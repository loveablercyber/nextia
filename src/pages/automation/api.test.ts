import { afterEach, describe, expect, it, vi } from 'vitest';
import { automationApi } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('automationApi', () => {
  it('returns a valid JSON response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })));

    await expect(automationApi<{ ok: boolean }>('/api/test')).resolves.toEqual({ ok: true });
  });

  it('preserves the API error message from a JSON response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Instância indisponível.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })));

    await expect(automationApi('/api/test')).rejects.toThrow('Instância indisponível.');
  });

  it('does not expose a JSON.parse error when a proxy returns HTML', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html><body>Bad gateway</body></html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    })));

    await expect(automationApi('/api/test')).rejects.toThrow(
      'O servidor ou proxy não conseguiu concluir a operação (HTTP 502). Consulte os logs do serviço Nextia.',
    );
  });

  it('rejects a successful response that is not valid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok', { status: 200 })));

    await expect(automationApi('/api/test')).rejects.toThrow('A API retornou uma resposta inválida (HTTP 200).');
  });
});
