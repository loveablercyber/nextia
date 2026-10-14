import { describe, expect, it, vi } from 'vitest';
import { handleSitePlatformApi } from './site-platform-api.js';

describe('Evolution webhook database lifecycle', () => {
  it('keeps the PostgreSQL client open until webhook processing finishes', async () => {
    const events = [];
    let releaseBody;
    const body = new Promise((resolve) => {
      releaseBody = resolve;
    });
    const client = {
      connect: vi.fn(async () => events.push('connect')),
      query: vi.fn(async () => ({ rows: [{ ready: 'site_instances' }] })),
      end: vi.fn(async () => events.push('end')),
    };
    const readJson = vi.fn(async () => {
      events.push('read:start');
      const payload = await body;
      events.push('read:end');
      return payload;
    });
    const json = vi.fn((_res, status, payload) => {
      events.push(`json:${status}`);
      return payload;
    });

    const pending = handleSitePlatformApi(
      { method: 'POST', headers: {} },
      {},
      new URL('https://nextia.dev.br/api/webhooks/evolution'),
      { dbClient: () => client, getSessionProfile: vi.fn(), json, readJson },
    );

    await vi.waitFor(() => expect(readJson).toHaveBeenCalledOnce());
    expect(client.end).not.toHaveBeenCalled();

    releaseBody({});
    await expect(pending).resolves.toEqual({
      error: 'Webhook não autorizado.',
      code: 'EVOLUTION_WEBHOOK_UNAUTHORIZED',
    });

    expect(events.indexOf('json:401')).toBeLessThan(events.indexOf('end'));
    expect(client.end).toHaveBeenCalledOnce();
  });
});
