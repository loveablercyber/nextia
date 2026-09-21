import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  calculateMilestoneProgress,
  handleProjectOperationsApi,
  isAllowedProjectFile,
  isClientVisible,
  normalizeVisibility,
  safeFileName,
} from './project-operations.js';

function responseRecorder() {
  const calls = [];
  return {
    calls,
    json: (_res, status, body) => { calls.push({ status, body }); return { status, body }; },
  };
}

describe('Etapa 9 project domain', () => {
  it('calculates progress only from valid milestones', () => {
    expect(calculateMilestoneProgress([{ status: 'concluido' }, { status: 'pendente' }, { status: 'cancelado' }])).toBe(50);
    expect(calculateMilestoneProgress([])).toBe(0);
  });

  it('normalizes and evaluates client visibility', () => {
    expect(normalizeVisibility('invalid', 'internal')).toBe('internal');
    expect(isClientVisible('both')).toBe(true);
    expect(isClientVisible('client')).toBe(true);
    expect(isClientVisible('internal')).toBe(false);
  });

  it('sanitizes traversal and control characters from file names', () => {
    expect(safeFileName('../folder\\evil\u0000.pdf')).toBe('.._folder_evil.pdf');
  });

  it('validates content signatures instead of trusting MIME only', () => {
    expect(isAllowedProjectFile('application/pdf', Buffer.from('%PDF-1.7'))).toBe(true);
    expect(isAllowedProjectFile('application/pdf', Buffer.from('MZ executable'))).toBe(false);
    expect(isAllowedProjectFile('image/png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
  });
});

describe('Etapa 9 authorization integration', () => {
  const session = { id: '11111111-1111-1111-1111-111111111111', role: 'client', name: 'Cliente A', email: 'a@example.com' };
  const otherProjectId = '22222222-2222-4222-8222-222222222222';
  const otherFileId = '33333333-3333-4333-8333-333333333333';
  const otherTaskId = '44444444-4444-4444-8444-444444444444';
  const otherDeliverableId = '55555555-5555-4555-8555-555555555555';

  it('scopes project detail by the authenticated client (project IDOR)', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'GET' }, {}, new URL(`https://test/api/app/project/workspace?projectId=${otherProjectId}`), { client, session, json: output.json, readJson: vi.fn() });
    expect(output.calls[0].status).toBe(404);
    expect(client.query.mock.calls[0][1]).toEqual([otherProjectId, false, session.id]);
  });

  it('scopes file access by owner and visibility (file IDOR)', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'GET' }, {}, new URL(`https://test/api/app/project/file/access?fileId=${otherFileId}`), { client, session, json: output.json, readJson: vi.fn() });
    expect(output.calls[0].status).toBe(404);
    expect(client.query.mock.calls[0][1]).toEqual([otherFileId, session.id]);
    expect(client.query.mock.calls[0][0]).toContain("f.visibility IN ('client','both')");
  });

  it('does not let a client complete another client task (task IDOR)', async () => {
    const client = { query: vi.fn(async (sql) => ({ rows: String(sql).startsWith('UPDATE') ? [] : [] })) };
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'POST' }, {}, new URL('https://test/api/app/project/task/complete'), { client, session, json: output.json, readJson: async () => ({ taskId: otherTaskId }) });
    expect(output.calls[0].status).toBe(404);
    const update = client.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE public.project_tasks'));
    expect(update[1]).toEqual([otherTaskId, session.id]);
  });

  it('does not let a client review another client deliverable (deliverable IDOR)', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'POST' }, {}, new URL('https://test/api/app/project/deliverable/review'), { client, session, json: output.json, readJson: async () => ({ deliverableId: otherDeliverableId, result: 'approved' }) });
    expect(output.calls[0].status).toBe(404);
    const select = client.query.mock.calls.find(([sql]) => String(sql).includes('FROM public.project_deliverables d'));
    expect(select[1]).toEqual([otherDeliverableId, session.id]);
  });

  it('does not create comments in a project outside the client scope', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'POST' }, {}, new URL('https://test/api/app/project/comment'), { client, session, json: output.json, readJson: async () => ({ projectId: otherProjectId, body: 'x' }) });
    expect(output.calls[0].status).toBe(404);
    expect(client.query).toHaveBeenCalledTimes(1);
  });

  it('does not create a request without an owned project and quota', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'POST' }, {}, new URL('https://test/api/app/project/change-request'), { client, session, json: output.json, readJson: async () => ({ projectId: otherProjectId, title: 'Ajuste', description: 'Detalhes' }) });
    expect(output.calls[0].status).toBe(409);
    const update = client.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE public.projects'));
    expect(update[1]).toEqual([otherProjectId, session.id]);
  });

  it('blocks client access to admin project endpoints (RBAC)', async () => {
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'GET' }, {}, new URL('https://test/api/admin/app/project/detail?projectId=x'), { client: { query: vi.fn() }, session, json: output.json, readJson: vi.fn() });
    expect(output.calls[0].status).toBe(403);
  });

  it('returns only client-visible workspace queries', async () => {
    const projectId = '66666666-6666-4666-8666-666666666666';
    const project = { id: projectId, user_id: session.id, status: 'em-desenvolvimento', briefing: {} };
    const client = { query: vi.fn(async (sql) => String(sql).includes('FROM public.projects p') ? { rows: [project] } : { rows: [] }) };
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'GET' }, {}, new URL(`https://test/api/app/project/workspace?projectId=${projectId}`), { client, session, json: output.json, readJson: vi.fn() });
    expect(output.calls[0].status).toBe(200);
    const visibilityQueries = client.query.mock.calls.filter(([sql]) => String(sql).includes("visibility IN ('client','both')"));
    expect(visibilityQueries.length).toBeGreaterThanOrEqual(5);
  });

  it('records deliverable approval, project event and outbox atomically', async () => {
    const client = { query: vi.fn(async (sql) => {
      const text = String(sql);
      if (text.includes('FROM public.project_deliverables d')) return { rows: [{ id: otherDeliverableId, project_id: otherProjectId, title: 'Versão', version_id: '77777777-7777-4777-8777-777777777777', user_id: session.id }] };
      if (text.includes('INSERT INTO public.project_deliverable_approvals')) return { rows: [{ id: 'a1', result: 'approved' }] };
      if (text.includes('INSERT INTO public.project_events')) return { rows: [{ id: 'e1' }] };
      return { rows: [] };
    }) };
    const output = responseRecorder();
    await handleProjectOperationsApi({ method: 'POST' }, {}, new URL('https://test/api/app/project/deliverable/review'), { client, session, json: output.json, readJson: async () => ({ deliverableId: otherDeliverableId, result: 'approved' }) });
    expect(output.calls[0].status).toBe(200);
    expect(client.query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO public.outbox_events'))).toBe(true);
    expect(client.query.mock.calls.at(-1)[0]).toBe('COMMIT');
  });
});

describe('Etapa 9 migration contract', () => {
  const migration = readFileSync(join(process.cwd(), 'database/migrations/0009_project_operations.sql'), 'utf8');

  it('is incremental and contains the mandatory operational entities', () => {
    expect(migration).not.toMatch(/DROP\s+TABLE|TRUNCATE/i);
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.project_tasks');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.project_deliverables');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.project_deliverable_approvals');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.project_comments');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.project_events');
  });
});
