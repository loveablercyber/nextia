import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSlidingWindowLimiter } from './operational-guards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CANCELLATION_REASONS = new Set(['price','no_need','priority_changed','dissatisfaction','technical_issue','competitor','business_closed','other']);
const mutationRateLimit = createSlidingWindowLimiter();
let schemaPromise;

export function isUuid(value) {
  return UUID_PATTERN.test(String(value || ''));
}

export function mapProviderSubscriptionStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'authorized') return 'active';
  if (normalized === 'paused') return 'paused';
  if (['cancelled','canceled'].includes(normalized)) return 'cancelled';
  if (['expired','ended'].includes(normalized)) return normalized;
  if (['pending','pending_contingency'].includes(normalized)) return 'pending';
  return null;
}

export function normalizeCancellationReason(reason, note) {
  const code = CANCELLATION_REASONS.has(String(reason)) ? String(reason) : '';
  const cleanNote = String(note || '').trim().slice(0, 1000);
  if (!code) throw Object.assign(new Error('Motivo de cancelamento inválido.'), { statusCode: 400 });
  if (code === 'other' && !cleanNote) throw Object.assign(new Error('Descreva o motivo em “Outro”.'), { statusCode: 400 });
  return { code, note: cleanNote || null };
}

export function calculateMrrCents(subscriptions) {
  return subscriptions
    .filter((item) => item.status === 'active' && item.billing_cycle === 'monthly' && item.currency === 'BRL')
    .reduce((total, item) => total + Math.max(0, Number(item.monthly_amount_cents) || 0), 0);
}

export function deriveCustomerState({ activeSubscriptions = 0, activeServices = 0, historicalServices = 0 }) {
  if (activeSubscriptions > 0 || activeServices > 0) return 'active';
  if (historicalServices > 0) return 'former';
  return 'inactive';
}

export function shouldSuggestExpansion({ alreadyOwned, openOpportunity, openSuggestion, dismissedUntil }) {
  if (alreadyOwned || openOpportunity || openSuggestion) return false;
  return !dismissedUntil || new Date(dismissedUntil).getTime() <= Date.now();
}

export function isCustomerSuccessApiPath(pathname) {
  return pathname.startsWith('/api/customer-success') || pathname.startsWith('/api/admin/customer-success');
}

export async function ensureCustomerSuccessSchema(client) {
  if (!schemaPromise) {
    schemaPromise = client.query(`SELECT to_regclass('public.subscription_events') ready`).then(async (result) => {
      if (!result.rows[0]?.ready) {
        const sql = await readFile(join(__dirname, 'database/migrations/0010_customer_success.sql'), 'utf8');
        await client.query(sql);
      }
    });
  }
  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = undefined;
    throw error;
  }
}

function limitedMutation(key) {
  return mutationRateLimit.allow(key, 20);
}

async function appendOutbox(client, aggregateType, aggregateId, eventType, payload, key) {
  return client.query(
    `INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key)
     VALUES($1,$2,$3,$4,$5) ON CONFLICT(idempotency_key) DO NOTHING`,
    [aggregateType, aggregateId, eventType, JSON.stringify(payload), key],
  );
}

export async function recordSubscriptionEvent(client, data) {
  return client.query(
    `INSERT INTO public.subscription_events
      (subscription_id,event_type,from_status,to_status,provider_event_id,provider_resource_id,actor_user_id,metadata,occurred_at)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9::timestamptz,NOW()))
     ON CONFLICT(subscription_id,provider_event_id,event_type) WHERE provider_event_id IS NOT NULL DO NOTHING
     RETURNING *`,
    [data.subscriptionId, data.eventType, data.fromStatus || null, data.toStatus || null, data.providerEventId || null,
      data.providerResourceId || null, data.actorId || null, JSON.stringify(data.metadata || {}), data.occurredAt || null],
  );
}

async function openRetentionSignal(client, { customerId, subscriptionId, type, severity = 'medium', reason, evidence = {}, nextAction = null }) {
  const result = await client.query(
    `INSERT INTO public.retention_signals(customer_id,subscription_id,signal_type,severity,reason,evidence,next_action)
     VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING RETURNING *`,
    [customerId, subscriptionId || null, type, severity, reason, JSON.stringify(evidence), nextAction],
  );
  if (result.rows[0]) {
    await appendOutbox(client, 'retention_signal', result.rows[0].id, 'retention.signal_detected', {
      signalId: result.rows[0].id, customerId, subscriptionId, type, severity,
    }, `retention.signal:${result.rows[0].id}`);
  }
  return result.rows[0] || null;
}

export async function syncProviderSubscription(client, { contractId, resourceId, providerEventId, providerData }) {
  const locked = await client.query('SELECT * FROM public.commercial_plan_contracts WHERE id=$1 FOR UPDATE', [contractId]);
  const contract = locked.rows[0];
  if (!contract || (contract.subscription_id && String(contract.subscription_id) !== String(resourceId))) return { ignored: true };
  const nextStatus = mapProviderSubscriptionStatus(providerData.status) || contract.status;
  const currentStart = providerData.date_created || providerData.start_date || null;
  const nextBilling = providerData.next_payment_date || providerData.auto_recurring?.free_trial?.first_invoice_offset || null;
  const updated = await client.query(
    `UPDATE public.commercial_plan_contracts SET status=$2,subscription_id=$3,
       current_period_start=COALESCE($4::timestamptz,current_period_start),next_billing_at=COALESCE($5::timestamptz,next_billing_at),
       paused_at=CASE WHEN $2='paused' THEN COALESCE(paused_at,NOW()) ELSE paused_at END,
       cancelled_at=CASE WHEN $2='cancelled' THEN COALESCE(cancelled_at,$6::timestamptz,NOW()) ELSE cancelled_at END,
       ended_at=CASE WHEN $2 IN ('expired','ended') THEN COALESCE(ended_at,$6::timestamptz,NOW()) ELSE ended_at END,
       activated_at=CASE WHEN $2='active' THEN COALESCE(activated_at,NOW()) ELSE activated_at END,
       version=version+1,updated_at=NOW() WHERE id=$1 RETURNING *`,
    [contractId, nextStatus, String(resourceId), currentStart, typeof nextBilling === 'string' ? nextBilling : null, providerData.date_modified || null],
  );
  const eventType = nextStatus === 'active' && contract.status === 'active' ? 'subscription.synced' : `subscription.${nextStatus}`;
  const event = await recordSubscriptionEvent(client, {
    subscriptionId: contractId, eventType, fromStatus: contract.status, toStatus: nextStatus,
    providerEventId, providerResourceId: resourceId, occurredAt: providerData.date_modified || null,
    metadata: { providerStatus: providerData.status, source: 'mercado_pago' },
  });
  if (event.rows[0]) await appendOutbox(client, 'subscription', contractId, eventType, {
    subscriptionId: contractId, customerId: contract.user_id, fromStatus: contract.status, toStatus: nextStatus,
  }, `${eventType}:${providerEventId}`);
  return { contract: updated.rows[0], duplicate: !event.rows[0] };
}

export async function syncRecurringPayment(client, { contractId, resourceId, providerEventId, providerData, nextBillingAt = null }) {
  const locked = await client.query('SELECT * FROM public.commercial_plan_contracts WHERE id=$1 FOR UPDATE', [contractId]);
  const contract = locked.rows[0];
  if (!contract) return { ignored: true };
  const amountCents = Math.round(Number(providerData.transaction_amount || 0) * 100);
  if (providerData.currency_id !== contract.currency || amountCents !== Number(contract.monthly_amount_cents)) {
    throw Object.assign(new Error('Valor ou moeda divergente na renovação.'), { statusCode: 409, code: 'RENEWAL_AMOUNT_MISMATCH' });
  }
  const approved = providerData.status === 'approved';
  const existing = await client.query("SELECT id FROM public.subscription_events WHERE subscription_id=$1 AND provider_event_id=$2 AND event_type IN ('subscription.renewed','subscription.payment_failed')", [contractId, providerEventId]);
  if (existing.rows[0]) return { duplicate: true, contract };
  if (approved) {
    const approvedAt = providerData.date_approved || providerData.date_created || null;
    const invoiceNumber = `REC-${String(resourceId).slice(0, 48)}`;
    const invoice = await client.query(
      `INSERT INTO public.invoices(user_id,order_id,invoice_number,description,total_cents,currency,status,type,due_date,paid_at)
       VALUES($1,$2,$3,$4,$5,$6,'paid','mensalidade',COALESCE($7::timestamptz,NOW()),COALESCE($7::timestamptz,NOW()))
       ON CONFLICT(invoice_number) DO UPDATE SET status='paid',paid_at=COALESCE(invoices.paid_at,EXCLUDED.paid_at),updated_at=NOW()
       RETURNING id`,
      [contract.user_id, contract.order_id, invoiceNumber, `Renovação ${contract.plan_name}`, amountCents, contract.currency, approvedAt],
    );
    await client.query(
      `INSERT INTO public.payment_transactions(invoice_id,user_id,provider,provider_transaction_id,amount_cents,currency,status,payment_method,metadata)
       VALUES($1,$2,'mercadopago',$3,$4,$5,'approved',$6,$7)
       ON CONFLICT(provider,provider_transaction_id) DO UPDATE SET status='approved',updated_at=NOW()`,
      [invoice.rows[0].id, contract.user_id, String(resourceId), amountCents, contract.currency, providerData.payment_method_id || null, JSON.stringify({ providerStatus: providerData.status, recurring: true })],
    );
    await client.query(
      `UPDATE public.commercial_plan_contracts SET status='active',current_period_start=COALESCE($2::timestamptz,current_period_start),
       current_period_end=COALESCE($3::timestamptz,current_period_end),next_billing_at=COALESCE($3::timestamptz,next_billing_at),version=version+1,updated_at=NOW() WHERE id=$1`,
      [contractId, approvedAt, nextBillingAt],
    );
    await recordSubscriptionEvent(client, { subscriptionId: contractId, eventType: 'subscription.renewed', fromStatus: contract.status, toStatus: 'active', providerEventId, providerResourceId: resourceId, occurredAt: approvedAt, metadata: { amountCents, currency: contract.currency, nextBillingAt } });
    await appendOutbox(client, 'subscription', contractId, 'subscription.renewed', { subscriptionId: contractId, customerId: contract.user_id, amountCents, nextBillingAt }, `subscription.renewed:${providerEventId}`);
    return { renewed: true };
  }
  await client.query("UPDATE public.commercial_plan_contracts SET status='past_due',version=version+1,updated_at=NOW() WHERE id=$1", [contractId]);
  await recordSubscriptionEvent(client, { subscriptionId: contractId, eventType: 'subscription.payment_failed', fromStatus: contract.status, toStatus: 'past_due', providerEventId, providerResourceId: resourceId, metadata: { providerStatus: providerData.status } });
  await openRetentionSignal(client, { customerId: contract.user_id, subscriptionId: contractId, type: 'payment_failed', severity: 'high', reason: 'Pagamento recorrente não aprovado pelo gateway.', evidence: { providerEventId, providerStatus: providerData.status }, nextAction: 'Revisar cobrança no gateway e contatar o cliente conforme preferências.' });
  await appendOutbox(client, 'subscription', contractId, 'subscription.payment_failed', { subscriptionId: contractId, customerId: contract.user_id, providerStatus: providerData.status }, `subscription.payment_failed:${providerEventId}`);
  return { failed: true };
}

async function clientOverview(client, customerId, page, limit) {
  const offset = (page - 1) * limit;
  const contracts = await client.query(`SELECT id,plan_id,plan_name,service_slug,status,billing_cycle,monthly_amount_cents,currency,current_period_start,current_period_end,next_billing_at,cancellation_requested_at,cancel_at,cancelled_at,created_at FROM public.commercial_plan_contracts WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [customerId, limit, offset]);
  const events = await client.query(`SELECT e.* FROM public.subscription_events e JOIN public.commercial_plan_contracts c ON c.id=e.subscription_id WHERE c.user_id=$1 ORDER BY e.occurred_at DESC,e.id DESC LIMIT $2`, [customerId, limit]);
  const services = await client.query(`SELECT id,service_slug,service_name_snapshot,status,activated_at,completed_at,created_at FROM public.service_engagements WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`, [customerId, limit]);
  const feedback = await client.query(`SELECT id,rating,comment,context,created_at FROM public.customer_feedback WHERE customer_id=$1 ORDER BY created_at DESC LIMIT $2`, [customerId, limit]);
  const counts = await client.query(`SELECT
      (SELECT COUNT(*) FROM public.commercial_plan_contracts WHERE user_id=$1 AND status='active')::int active_subscriptions,
      (SELECT COUNT(*) FROM public.service_engagements WHERE user_id=$1 AND status NOT IN ('completed','cancelled','suspended'))::int active_services,
      (SELECT COUNT(*) FROM public.service_engagements WHERE user_id=$1)::int historical_services`, [customerId]);
  const facts = counts.rows[0] || {};
  return { subscriptions: contracts.rows, subscriptionEvents: events.rows, services: services.rows, feedback: feedback.rows, customerState: deriveCustomerState({ activeSubscriptions: facts.active_subscriptions, activeServices: facts.active_services, historicalServices: facts.historical_services }), pagination: { page, limit } };
}

async function adminOverview(client, page, limit) {
  const offset = (page - 1) * limit;
  const summary = await client.query(`SELECT COUNT(*) FILTER(WHERE status='active')::int active,COUNT(*) FILTER(WHERE status='past_due')::int past_due,COUNT(*) FILTER(WHERE status='cancelled')::int cancelled,COALESCE(SUM(monthly_amount_cents) FILTER(WHERE status='active' AND billing_cycle='monthly' AND currency='BRL'),0)::bigint mrr_cents FROM public.commercial_plan_contracts`);
  const contracts = await client.query(`SELECT c.*,p.name customer_name,p.email customer_email FROM public.commercial_plan_contracts c JOIN public.profiles p ON p.id=c.user_id ORDER BY c.updated_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
  const risks = await client.query(`SELECT r.*,p.name customer_name,p.email customer_email,c.plan_name FROM public.retention_signals r JOIN public.profiles p ON p.id=r.customer_id LEFT JOIN public.commercial_plan_contracts c ON c.id=r.subscription_id WHERE r.status IN ('open','acknowledged') ORDER BY CASE r.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,r.detected_at DESC LIMIT $1`, [limit]);
  const suggestions = await client.query(`SELECT s.*,p.name customer_name,p.email customer_email,cs.name current_service_name,ss.name suggested_service_name FROM public.expansion_suggestions s JOIN public.profiles p ON p.id=s.customer_id LEFT JOIN public.commercial_services cs ON cs.slug=s.current_service_slug JOIN public.commercial_services ss ON ss.slug=s.suggested_service_slug ORDER BY s.created_at DESC LIMIT $1`, [limit]);
  return { summary: summary.rows[0], subscriptions: contracts.rows, risks: risks.rows, suggestions: suggestions.rows, pagination: { page, limit } };
}

async function customerTimeline(client, customerId, limit) {
  const profile = await client.query("SELECT id,name,email,company FROM public.profiles WHERE id=$1 AND role='client'", [customerId]);
  if (!profile.rows[0]) return null;
  const services = await client.query('SELECT id,service_slug,service_name_snapshot,status,created_at,activated_at,completed_at FROM public.service_engagements WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2', [customerId, limit]);
  const subscriptions = await client.query('SELECT * FROM public.commercial_plan_contracts WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2', [customerId, limit]);
  const payments = await client.query('SELECT id,status,amount_cents,currency,created_at FROM public.payment_transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2', [customerId, limit]);
  const projects = await client.query('SELECT id,name,status,created_at,updated_at FROM public.projects WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2', [customerId, limit]);
  const support = await client.query('SELECT id,subject,status,created_at,updated_at FROM public.support_tickets WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2', [customerId, limit]);
  const activities = await client.query('SELECT id,type,title,status,scheduled_at,completed_at,created_at FROM public.crm_activities WHERE customer_profile_id=$1 ORDER BY created_at DESC LIMIT $2', [customerId, limit]);
  const suggestions = await client.query('SELECT id,suggested_service_slug,suggestion_type,status,reason,opportunity_id,created_at FROM public.expansion_suggestions WHERE customer_id=$1 ORDER BY created_at DESC LIMIT $2', [customerId, limit]);
  return { customer: profile.rows[0], services: services.rows, subscriptions: subscriptions.rows, payments: payments.rows, projects: projects.rows, support: support.rows, activities: activities.rows, suggestions: suggestions.rows };
}

export async function handleCustomerSuccessRoute(req, res, url, { client, session, json, readJson }) {
  if (!session) return json(res, 401, { error: 'Autenticação necessária.' });
  const adminRoute = url.pathname.startsWith('/api/admin/');
  if (adminRoute && session.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit')) || 25));

  if (url.pathname === '/api/customer-success/overview' && req.method === 'GET') return json(res, 200, await clientOverview(client, session.id, page, limit));
  if (url.pathname === '/api/admin/customer-success/overview' && req.method === 'GET') return json(res, 200, await adminOverview(client, page, limit));
  if (url.pathname === '/api/admin/customer-success/customer' && req.method === 'GET') {
    const customerId = url.searchParams.get('customerId');
    if (!isUuid(customerId)) return json(res, 400, { error: 'Cliente inválido.' });
    const data = await customerTimeline(client, customerId, limit);
    return data ? json(res, 200, data) : json(res, 404, { error: 'Cliente não encontrado.' });
  }

  if (req.method !== 'GET' && !limitedMutation(`${session.id}:${url.pathname}`)) return json(res, 429, { error: 'Muitas solicitações. Aguarde um minuto.' });

  const cancelMatch = url.pathname.match(/^\/api\/customer-success\/subscriptions\/([^/]+)\/cancel$/);
  if (cancelMatch && req.method === 'POST') {
    if (!isUuid(cancelMatch[1])) return json(res, 400, { error: 'Assinatura inválida.' });
    const body = await readJson(req);
    const reason = normalizeCancellationReason(body.reason, body.note);
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE public.commercial_plan_contracts SET cancellation_requested_at=COALESCE(cancellation_requested_at,NOW()),
         cancellation_reason_code=$3,cancellation_reason_note=$4,cancellation_requested_by=$2,version=version+1,updated_at=NOW()
         WHERE id=$1 AND user_id=$2 AND status IN ('active','past_due','paused') AND cancellation_requested_at IS NULL RETURNING *`,
        [cancelMatch[1], session.id, reason.code, reason.note],
      );
      const contract = result.rows[0];
      if (!contract) {
        const existing = (await client.query('SELECT cancellation_requested_at FROM public.commercial_plan_contracts WHERE id=$1 AND user_id=$2', [cancelMatch[1], session.id])).rows[0];
        await client.query('ROLLBACK');
        return existing?.cancellation_requested_at
          ? json(res, 200, { message: 'Solicitação de cancelamento já registrada.' })
          : json(res, 404, { error: 'Assinatura elegível não encontrada.' });
      }
      await recordSubscriptionEvent(client, { subscriptionId: contract.id, eventType: 'subscription.cancellation_requested', fromStatus: contract.status, toStatus: contract.status, actorId: session.id, metadata: { reason: reason.code, note: reason.note, effect: 'awaiting_commercial_review' } });
      await openRetentionSignal(client, { customerId: session.id, subscriptionId: contract.id, type: 'cancellation_requested', severity: 'high', reason: `Cancelamento solicitado: ${reason.code}.`, evidence: { note: reason.note }, nextAction: 'Analisar solicitação e política comercial aplicável.' });
      await appendOutbox(client, 'subscription', contract.id, 'subscription.cancellation_requested', { subscriptionId: contract.id, customerId: session.id, reason: reason.code }, `subscription.cancellation_requested:${contract.id}:${contract.cancellation_requested_at?.toISOString?.() || contract.cancellation_requested_at}`);
      await client.query(`INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) VALUES($1,'SUBSCRIPTION_CANCELLATION_REQUESTED','subscription',$2,$3)`, [session.id, contract.id, JSON.stringify({ reason: reason.code })]);
      await client.query('COMMIT');
      return json(res, 202, { subscription: contract, message: 'Solicitação registrada para análise.' });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  const reactivateMatch = url.pathname.match(/^\/api\/customer-success\/subscriptions\/([^/]+)\/reactivate$/);
  if (reactivateMatch && req.method === 'POST') {
    if (!isUuid(reactivateMatch[1])) return json(res, 400, { error: 'Assinatura inválida.' });
    const contract = (await client.query("SELECT * FROM public.commercial_plan_contracts WHERE id=$1 AND user_id=$2 AND status IN ('cancelled','paused','past_due')", [reactivateMatch[1], session.id])).rows[0];
    if (!contract) return json(res, 404, { error: 'Assinatura elegível não encontrada.' });
    const key = `subscription.reactivation_requested:${contract.id}:${contract.version}`;
    await recordSubscriptionEvent(client, { subscriptionId: contract.id, eventType: 'subscription.reactivation_requested', fromStatus: contract.status, toStatus: contract.status, actorId: session.id, metadata: { effect: 'awaiting_gateway_and_commercial_review' } });
    await appendOutbox(client, 'subscription', contract.id, 'subscription.reactivation_requested', { subscriptionId: contract.id, customerId: session.id }, key);
    return json(res, 202, { message: 'Solicitação de reativação registrada para análise.' });
  }

  if (url.pathname === '/api/customer-success/feedback' && req.method === 'POST') {
    const body = await readJson(req);
    const rating = body.rating == null ? null : Number(body.rating);
    const comment = String(body.comment || '').trim().slice(0, 2000) || null;
    if ((rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) || (rating === null && !comment)) return json(res, 400, { error: 'Informe nota de 1 a 5 ou comentário.' });
    const engagementId = isUuid(body.engagementId) ? body.engagementId : null;
    if (engagementId) {
      const owned = await client.query('SELECT 1 FROM public.service_engagements WHERE id=$1 AND user_id=$2', [engagementId, session.id]);
      if (!owned.rows[0]) return json(res, 404, { error: 'Serviço não encontrado.' });
    }
    const result = await client.query(`INSERT INTO public.customer_feedback(customer_id,engagement_id,rating,comment,context) VALUES($1,$2,$3,$4,'post_sale') RETURNING *`, [session.id, engagementId, rating, comment]);
    return json(res, 201, { feedback: result.rows[0] });
  }

  if (url.pathname === '/api/admin/customer-success/retention/refresh' && req.method === 'POST') {
    const result = await client.query(
      `INSERT INTO public.retention_signals(customer_id,subscription_id,signal_type,severity,reason,evidence,next_action)
       SELECT user_id,id,'renewal_approaching','medium','Próxima cobrança em até 7 dias.',jsonb_build_object('nextBillingAt',next_billing_at),'Revisar estado da assinatura antes de qualquer contato.'
       FROM public.commercial_plan_contracts WHERE status='active' AND next_billing_at BETWEEN NOW() AND NOW()+INTERVAL '7 days'
       ON CONFLICT DO NOTHING RETURNING id,customer_id,subscription_id,signal_type`,
    );
    for (const signal of result.rows) {
      await appendOutbox(client, 'retention_signal', signal.id, 'retention.signal_detected', { signalId: signal.id, customerId: signal.customer_id, subscriptionId: signal.subscription_id, type: signal.signal_type }, `retention.signal:${signal.id}`);
    }
    return json(res, 200, { created: result.rowCount });
  }

  if (url.pathname === '/api/admin/customer-success/retention' && req.method === 'PATCH') {
    const body = await readJson(req);
    if (!isUuid(body.id) || !['acknowledged','resolved','dismissed'].includes(body.status)) return json(res, 400, { error: 'Atualização inválida.' });
    const result = await client.query(`UPDATE public.retention_signals SET status=$2,assigned_user_id=COALESCE($3,assigned_user_id),next_action=COALESCE($4,next_action),resolved_at=CASE WHEN $2 IN ('resolved','dismissed') THEN NOW() ELSE NULL END,updated_at=NOW() WHERE id=$1 RETURNING *`, [body.id, body.status, isUuid(body.assignedUserId) ? body.assignedUserId : session.id, String(body.nextAction || '').trim().slice(0, 1000) || null]);
    return result.rows[0] ? json(res, 200, { signal: result.rows[0] }) : json(res, 404, { error: 'Sinal não encontrado.' });
  }

  if (url.pathname === '/api/admin/customer-success/expansion/generate' && req.method === 'POST') {
    const result = await client.query(
      `INSERT INTO public.expansion_suggestions(customer_id,rule_id,current_service_slug,suggested_service_slug,suggestion_type,reason,priority)
       SELECT DISTINCT e.user_id,r.id,r.current_service_slug,r.suggested_service_slug,r.suggestion_type,r.reason,r.priority
       FROM public.expansion_rules r JOIN public.service_engagements e ON e.service_slug=r.current_service_slug
       WHERE r.active=TRUE AND e.status NOT IN ('cancelled','suspended')
         AND NOT EXISTS (SELECT 1 FROM public.service_engagements owned WHERE owned.user_id=e.user_id AND owned.service_slug=r.suggested_service_slug AND owned.status NOT IN ('cancelled','suspended'))
         AND NOT EXISTS (SELECT 1 FROM public.commercial_plan_contracts c WHERE c.user_id=e.user_id AND c.service_slug=r.suggested_service_slug AND c.status IN ('active','pending','subscription_pending'))
         AND NOT EXISTS (SELECT 1 FROM public.crm_opportunities o WHERE o.customer_profile_id=e.user_id AND o.service_slug=r.suggested_service_slug AND o.status='open')
         AND NOT EXISTS (SELECT 1 FROM public.expansion_suggestions s WHERE s.customer_id=e.user_id AND s.suggested_service_slug=r.suggested_service_slug AND (s.status IN ('suggested','reviewed') OR (s.status='dismissed' AND s.dismissed_until>NOW())))
       ON CONFLICT DO NOTHING RETURNING id,customer_id,suggested_service_slug,suggestion_type`,
    );
    for (const suggestion of result.rows) {
      await appendOutbox(client, 'expansion_suggestion', suggestion.id, 'upsell.suggested', { suggestionId: suggestion.id, customerId: suggestion.customer_id, serviceSlug: suggestion.suggested_service_slug, type: suggestion.suggestion_type }, `upsell.suggested:${suggestion.id}`);
    }
    return json(res, 200, { created: result.rowCount });
  }

  if (url.pathname === '/api/admin/customer-success/expansion' && req.method === 'PATCH') {
    const body = await readJson(req);
    if (!isUuid(body.id) || !['reviewed','dismissed','converted_to_opportunity'].includes(body.status)) return json(res, 400, { error: 'Atualização inválida.' });
    if (body.status !== 'converted_to_opportunity') {
      const result = await client.query(`UPDATE public.expansion_suggestions SET status=$2,reviewed_by=$3,reviewed_at=NOW(),dismissed_until=CASE WHEN $2='dismissed' THEN NOW()+INTERVAL '90 days' ELSE dismissed_until END,updated_at=NOW() WHERE id=$1 AND status IN ('suggested','reviewed') RETURNING *`, [body.id, body.status, session.id]);
      return result.rows[0] ? json(res, 200, { suggestion: result.rows[0] }) : json(res, 404, { error: 'Sugestão não encontrada.' });
    }
    await client.query('BEGIN');
    try {
      const suggestion = (await client.query(`SELECT s.*,cs.name service_name,cs.price_cents FROM public.expansion_suggestions s JOIN public.commercial_services cs ON cs.slug=s.suggested_service_slug WHERE s.id=$1 AND s.status IN ('suggested','reviewed') FOR UPDATE OF s`, [body.id])).rows[0];
      if (!suggestion) { await client.query('ROLLBACK'); return json(res, 404, { error: 'Sugestão não encontrada.' }); }
      let opportunity = (await client.query("SELECT id FROM public.crm_opportunities WHERE customer_profile_id=$1 AND service_slug=$2 AND status='open' ORDER BY created_at LIMIT 1", [suggestion.customer_id, suggestion.suggested_service_slug])).rows[0];
      if (!opportunity) {
        const stage = (await client.query(`SELECT s.id stage_id,s.pipeline_id FROM public.crm_pipeline_stages s JOIN public.crm_pipelines p ON p.id=s.pipeline_id WHERE p.is_default=TRUE AND p.is_active=TRUE AND s.is_active=TRUE ORDER BY s.position LIMIT 1`)).rows[0];
        if (!stage) throw Object.assign(new Error('Pipeline comercial padrão não configurado.'), { statusCode: 409 });
        opportunity = (await client.query(
          `INSERT INTO public.crm_opportunities(public_code,customer_profile_id,pipeline_id,stage_id,title,service_slug,estimated_value_cents,assigned_user_id,source,status,notes)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,'customer_success','open',$9) RETURNING *`,
          [`OPP-${randomUUID().slice(0,8).toUpperCase()}`, suggestion.customer_id, stage.pipeline_id, stage.stage_id, `Expansão — ${suggestion.service_name}`, suggestion.suggested_service_slug, Number(suggestion.price_cents || 0), suggestion.assigned_user_id || session.id, suggestion.reason],
        )).rows[0];
      }
      const updated = await client.query(`UPDATE public.expansion_suggestions SET status='converted_to_opportunity',opportunity_id=$2,reviewed_by=$3,reviewed_at=NOW(),updated_at=NOW() WHERE id=$1 RETURNING *`, [suggestion.id, opportunity.id, session.id]);
      await appendOutbox(client, 'expansion_suggestion', suggestion.id, 'upsell.converted', { suggestionId: suggestion.id, opportunityId: opportunity.id, customerId: suggestion.customer_id }, `upsell.converted:${suggestion.id}`);
      await client.query(`INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) VALUES($1,'EXPANSION_CONVERTED','expansion_suggestion',$2,$3)`, [session.id, suggestion.id, JSON.stringify({ opportunityId: opportunity.id })]);
      await client.query('COMMIT');
      return json(res, 200, { suggestion: updated.rows[0], opportunity });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  return json(res, 404, { error: 'Recurso de pós-venda não encontrado.' });
}

export async function handleCustomerSuccessApi(req, res, url, dependencies) {
  const { dbClient, ensureCommercialSchema, ensureAutomation, getSessionProfile, json, readJson } = dependencies;
  const client = dbClient();
  await client.connect();
  try {
    if (ensureCommercialSchema) await ensureCommercialSchema(client);
    if (ensureAutomation) await ensureAutomation(client);
    await ensureCustomerSuccessSchema(client);
    const session = await getSessionProfile(req, client);
    return await handleCustomerSuccessRoute(req, res, url, { client, session, json, readJson });
  } catch (error) {
    if (error?.statusCode) return json(res, error.statusCode, { error: error.message, code: error.code || 'CUSTOMER_SUCCESS_ERROR' });
    throw error;
  } finally {
    await client.end();
  }
}
