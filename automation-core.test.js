import { describe, expect, it } from 'vitest';
import { buildMinimalAiContext, evaluateConditions, retryDelaySeconds, sanitizeForLog, validateAction, validateConditionTree } from './automation-core.js';
import { AutomationEngine, safeSecretEquals } from './automation-engine.js';
import { safeProviderUrl, validateStructuredValue } from './ai-service.js';

describe('automation core', () => {
  it('evaluates nested AND/OR conditions deterministically', () => {
    const result = evaluateConditions({ operator: 'and', rules: [
      { field: 'lead.status', operator: 'eq', value: 'qualified' },
      { operator: 'or', rules: [{ field: 'lead.score', operator: 'gte', value: 70 }, { field: 'lead.source', operator: 'eq', value: 'referral' }] },
    ] }, { lead: { status: 'qualified', score: 75, source: 'website' } });
    expect(result.matched).toBe(true);
  });

  it('redacts credentials and personal contact data from logs', () => {
    expect(sanitizeForLog({ apiKey: 'secret', email: 'ana@example.com', phone: '+55 11 99999-9999' })).toEqual({ apiKey: '[REDACTED]', email: '[EMAIL]', phone: '[PHONE]' });
  });

  it('only sends purpose-allowlisted fields to AI', () => {
    expect(buildMinimalAiContext('support_triage', { subject: 'Erro', message: 'Tela falha', password: 'x', cpf: '123' })).toEqual({ subject: 'Erro', message: 'Tela falha' });
  });

  it('uses a bounded retry schedule', () => {
    expect([1,2,3,4,8].map(retryDelaySeconds)).toEqual([30,120,600,1800,3600]);
  });

  it('rejects unknown actions and invalid condition trees', () => {
    expect(() => validateAction({ id: 'x', type: 'delete_database' })).toThrow();
    expect(() => validateConditionTree({ operator: 'xor', rules: [] })).toThrow();
  });

  it('performs dry-run without executing database actions', async () => {
    const engine = new AutomationEngine({ query: () => { throw new Error('database must not be called'); } });
    const result = await engine.dryRun({ conditions_snapshot: { operator: 'and', rules: [] }, actions_snapshot: [{ id: 'n', type: 'notify_admins' }] }, { eventType: 'lead.created' });
    expect(result.matched).toBe(true);
    expect(result.actions).toEqual([{ id: 'n', type: 'notify_admins', wouldExecute: true }]);
  });

  it('requires a configured non-empty secret', () => {
    expect(safeSecretEquals('', '')).toBe(false);
    expect(safeSecretEquals('same-secret', 'same-secret')).toBe(true);
    expect(safeSecretEquals('wrong', 'same-secret')).toBe(false);
  });

  it('blocks private AI provider destinations', () => {
    expect(() => safeProviderUrl('http://localhost:11434/v1')).toThrow();
    expect(() => safeProviderUrl('https://192.168.1.10/v1')).toThrow();
    expect(safeProviderUrl('https://api.example.com/v1')).toBe('https://api.example.com/v1/chat/completions');
  });

  it('rejects AI output that does not match the prompt schema', () => {
    expect(() => validateStructuredValue({ confidence: 0.8 }, { type: 'object', required: ['classification'] })).toThrow();
    expect(() => validateStructuredValue({ classification: 'qualified' }, { type: 'object', required: ['classification'], properties: { classification: { type: 'string' } } })).not.toThrow();
  });

  it('retries a transient worker failure with the configured backoff', async () => {
    const calls = [];
    const client = { query: async (sql, params) => {
      calls.push({ sql, params });
      if (sql.startsWith('SELECT value')) throw Object.assign(new Error('temporary'), { retryable: true });
      return { rows: [], rowCount: 0 };
    } };
    const outcome = await new AutomationEngine(client, { maxAttempts: 3 }).processEvent({ id: 'event-1', attempts: 1 });
    expect(outcome).toBe('retry');
    expect(calls.at(-1).sql).toContain("status='retry'");
    expect(calls.at(-1).params[1]).toBe(30);
  });

  it('dead-letters an event after the retry limit', async () => {
    const calls = [];
    const client = { query: async (sql, params) => {
      calls.push({ sql, params });
      if (sql.startsWith('SELECT value')) throw Object.assign(new Error('still unavailable'), { retryable: true });
      return { rows: [], rowCount: 0 };
    } };
    const outcome = await new AutomationEngine(client, { maxAttempts: 3 }).processEvent({ id: 'event-2', attempts: 3 });
    expect(outcome).toBe('dead_letter');
    expect(calls.at(-1).sql).toContain("status='dead_letter'");
  });
});
