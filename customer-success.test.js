import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  calculateMrrCents,
  deriveCustomerState,
  handleCustomerSuccessRoute,
  mapProviderSubscriptionStatus,
  normalizeCancellationReason,
  shouldSuggestExpansion,
  syncProviderSubscription,
  syncRecurringPayment,
} from './customer-success.js';

function recorder() {
  const calls = [];
  return { calls, json: (_res, status, body) => { calls.push({ status, body }); return { status, body }; } };
}

const clientSession = { id: '11111111-1111-4111-8111-111111111111', role: 'client' };
const adminSession = { id: '99999999-9999-4999-8999-999999999999', role: 'admin' };
const contractId = '22222222-2222-4222-8222-222222222222';

describe('Etapa 10 business rules', () => {
  it('maps only known gateway subscription states', () => {
    expect(mapProviderSubscriptionStatus('authorized')).toBe('active');
    expect(mapProviderSubscriptionStatus('paused')).toBe('paused');
    expect(mapProviderSubscriptionStatus('cancelled')).toBe('cancelled');
    expect(mapProviderSubscriptionStatus('pending')).toBe('pending');
    expect(mapProviderSubscriptionStatus('unknown')).toBeNull();
  });

  it('calculates MRR only from active monthly BRL subscriptions', () => {
    expect(calculateMrrCents([
      { status: 'active', billing_cycle: 'monthly', currency: 'BRL', monthly_amount_cents: 9900 },
      { status: 'past_due', billing_cycle: 'monthly', currency: 'BRL', monthly_amount_cents: 9900 },
      { status: 'active', billing_cycle: 'annual', currency: 'BRL', monthly_amount_cents: 9900 },
      { status: 'active', billing_cycle: 'monthly', currency: 'USD', monthly_amount_cents: 9900 },
    ])).toBe(9900);
  });

  it('derives customer state from real commercial facts', () => {
    expect(deriveCustomerState({ activeSubscriptions: 1 })).toBe('active');
    expect(deriveCustomerState({ historicalServices: 2 })).toBe('former');
    expect(deriveCustomerState({})).toBe('inactive');
  });

  it('requires a note for cancellation reason other', () => {
    expect(() => normalizeCancellationReason('other', '')).toThrow('Descreva');
    expect(normalizeCancellationReason('other', 'Mudança interna')).toEqual({ code: 'other', note: 'Mudança interna' });
  });

  it('does not suggest owned, duplicated or temporarily dismissed offers', () => {
    expect(shouldSuggestExpansion({ alreadyOwned: true })).toBe(false);
    expect(shouldSuggestExpansion({ openOpportunity: true })).toBe(false);
    expect(shouldSuggestExpansion({ openSuggestion: true })).toBe(false);
    expect(shouldSuggestExpansion({ dismissedUntil: new Date(Date.now() + 60_000).toISOString() })).toBe(false);
    expect(shouldSuggestExpansion({})).toBe(true);
  });
});

describe('Etapa 10 ownership and RBAC', () => {
  it('scopes every client overview dataset to the authenticated customer', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const output = recorder();
    await handleCustomerSuccessRoute({ method: 'GET' }, {}, new URL('https://test/api/customer-success/overview'), { client, session: clientSession, json: output.json, readJson: vi.fn() });
    expect(output.calls[0].status).toBe(200);
    expect(client.query).toHaveBeenCalledTimes(5);
    for (const call of client.query.mock.calls) expect(call[1][0]).toBe(clientSession.id);
  });

  it('does not let a client request cancellation for another customer subscription', async () => {
    const client = { query: vi.fn(async (sql) => String(sql) === 'BEGIN' || String(sql) === 'ROLLBACK' ? { rows: [] } : { rows: [] }) };
    const output = recorder();
    await handleCustomerSuccessRoute({ method: 'POST' }, {}, new URL(`https://test/api/customer-success/subscriptions/${contractId}/cancel`), { client, session: clientSession, json: output.json, readJson: async () => ({ reason: 'price' }) });
    expect(output.calls[0].status).toBe(404);
    const update = client.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE public.commercial_plan_contracts'));
    expect(update[1].slice(0, 2)).toEqual([contractId, clientSession.id]);
    expect(String(update[0])).toContain('user_id=$2');
  });

  it('blocks clients from administrative customer-success data', async () => {
    const output = recorder();
    await handleCustomerSuccessRoute({ method: 'GET' }, {}, new URL('https://test/api/admin/customer-success/overview'), { client: { query: vi.fn() }, session: clientSession, json: output.json, readJson: vi.fn() });
    expect(output.calls[0].status).toBe(403);
  });

  it('records cancellation request, retention signal, audit and outbox atomically', async () => {
    const contract = { id: contractId, user_id: clientSession.id, status: 'active', version: 1, cancellation_requested_at: new Date('2026-09-16T10:00:00Z') };
    const client = { query: vi.fn(async (sql) => {
      const text = String(sql);
      if (text.includes('UPDATE public.commercial_plan_contracts')) return { rows: [contract] };
      if (text.includes('INSERT INTO public.retention_signals')) return { rows: [{ id: '33333333-3333-4333-8333-333333333333' }] };
      if (text.includes('INSERT INTO public.subscription_events')) return { rows: [{ id: 'event' }] };
      return { rows: [], rowCount: 1 };
    }) };
    const output = recorder();
    await handleCustomerSuccessRoute({ method: 'POST' }, {}, new URL(`https://test/api/customer-success/subscriptions/${contractId}/cancel`), { client, session: clientSession, json: output.json, readJson: async () => ({ reason: 'price' }) });
    expect(output.calls[0].status).toBe(202);
    expect(client.query.mock.calls.some(([sql]) => String(sql).includes("'SUBSCRIPTION_CANCELLATION_REQUESTED'"))).toBe(true);
    expect(client.query.mock.calls.filter(([sql]) => String(sql).includes('INSERT INTO public.outbox_events')).length).toBeGreaterThanOrEqual(2);
    expect(client.query.mock.calls.at(-1)[0]).toBe('COMMIT');
  });

  it('uses the official catalog price when converting an expansion suggestion', async () => {
    const client = { query: vi.fn(async (sql) => {
      const text = String(sql);
      if (text.includes('FROM public.expansion_suggestions s JOIN')) return { rows: [{ id: contractId, customer_id: clientSession.id, suggested_service_slug: 'backup', service_name: 'Backup', price_cents: 14900, reason: 'Complementar', status: 'reviewed' }] };
      if (text.includes('FROM public.crm_opportunities')) return { rows: [] };
      if (text.includes('FROM public.crm_pipeline_stages')) return { rows: [{ stage_id: '44444444-4444-4444-8444-444444444444', pipeline_id: '55555555-5555-4555-8555-555555555555' }] };
      if (text.includes('INSERT INTO public.crm_opportunities')) return { rows: [{ id: '66666666-6666-4666-8666-666666666666' }] };
      if (text.includes('UPDATE public.expansion_suggestions')) return { rows: [{ id: contractId, status: 'converted_to_opportunity' }] };
      return { rows: [], rowCount: 1 };
    }) };
    const output = recorder();
    await handleCustomerSuccessRoute({ method: 'PATCH' }, {}, new URL('https://test/api/admin/customer-success/expansion'), { client, session: adminSession, json: output.json, readJson: async () => ({ id: contractId, status: 'converted_to_opportunity', estimatedValueCents: 1 }) });
    expect(output.calls[0].status).toBe(200);
    const insert = client.query.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO public.crm_opportunities'));
    expect(insert[1][6]).toBe(14900);
  });
});

describe('Etapa 10 gateway synchronization', () => {
  it('syncs provider status and deduplicates the commercial event', async () => {
    const client = { query: vi.fn(async (sql) => {
      const text = String(sql);
      if (text.startsWith('SELECT * FROM public.commercial_plan_contracts')) return { rows: [{ id: contractId, user_id: clientSession.id, status: 'pending', subscription_id: 'mp-sub' }] };
      if (text.includes('UPDATE public.commercial_plan_contracts')) return { rows: [{ id: contractId, status: 'active' }] };
      if (text.includes('INSERT INTO public.subscription_events')) return { rows: [{ id: 'event' }] };
      return { rows: [], rowCount: 1 };
    }) };
    const result = await syncProviderSubscription(client, { contractId, resourceId: 'mp-sub', providerEventId: 'evt-1', providerData: { status: 'authorized', next_payment_date: '2026-10-16T10:00:00Z' } });
    expect(result.contract.status).toBe('active');
    expect(client.query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO public.outbox_events'))).toBe(true);
  });

  it('rejects a recurring payment whose amount differs from the contract', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [{ id: contractId, currency: 'BRL', monthly_amount_cents: 9900 }] }) };
    await expect(syncRecurringPayment(client, { contractId, resourceId: 'pay', providerEventId: 'evt', providerData: { status: 'approved', currency_id: 'BRL', transaction_amount: 1 } })).rejects.toMatchObject({ code: 'RENEWAL_AMOUNT_MISMATCH' });
  });

  it('marks failed recurring payment as past_due without cancelling the subscription', async () => {
    const contract = { id: contractId, user_id: clientSession.id, status: 'active', currency: 'BRL', monthly_amount_cents: 9900 };
    const client = { query: vi.fn(async (sql) => {
      const text = String(sql);
      if (text.startsWith('SELECT * FROM public.commercial_plan_contracts')) return { rows: [contract] };
      if (text.startsWith('SELECT id FROM public.subscription_events')) return { rows: [] };
      if (text.includes('INSERT INTO public.subscription_events')) return { rows: [{ id: 'event' }] };
      if (text.includes('INSERT INTO public.retention_signals')) return { rows: [{ id: '33333333-3333-4333-8333-333333333333' }] };
      return { rows: [], rowCount: 1 };
    }) };
    const result = await syncRecurringPayment(client, { contractId, resourceId: 'pay', providerEventId: 'evt', providerData: { status: 'rejected', currency_id: 'BRL', transaction_amount: 99 } });
    expect(result.failed).toBe(true);
    const statusUpdate = client.query.mock.calls.find(([sql]) => String(sql).includes("status='past_due'"));
    expect(statusUpdate).toBeTruthy();
    expect(client.query.mock.calls.some(([sql]) => String(sql).includes("status='cancelled'"))).toBe(false);
  });
});

describe('Etapa 10 migration contract', () => {
  const sql = readFileSync(join(process.cwd(), 'database/migrations/0010_customer_success.sql'), 'utf8');
  it('is incremental and keeps the existing subscription source', () => {
    expect(sql).not.toMatch(/DROP\s+TABLE|TRUNCATE/i);
    expect(sql).toContain('ALTER TABLE public.commercial_plan_contracts');
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS public\.subscriptions\b/i);
  });
  it('contains history, retention, expansion and feedback with foreign keys', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.subscription_events');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.retention_signals');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.expansion_suggestions');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.customer_feedback');
    expect(sql).toContain('REFERENCES public.profiles(id)');
  });
});
