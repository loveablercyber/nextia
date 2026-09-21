import { describe, expect, it, vi } from 'vitest';
import { createSlidingWindowLimiter, fetchWithTimeout, requestIp, resolveRequestId } from './operational-guards.js';

describe('operational guards', () => {
  it('preserves a safe request id and replaces unsafe values', () => {
    expect(resolveRequestId('request-123')).toBe('request-123');
    expect(resolveRequestId('bad value')).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('resolves the first forwarded address', () => {
    expect(requestIp({ headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' } })).toBe('203.0.113.1');
  });

  it('enforces a bounded sliding window', () => {
    vi.useFakeTimers();
    const limiter = createSlidingWindowLimiter({ windowMs: 1_000 });
    expect(limiter.allow('login:a', 2)).toBe(true);
    expect(limiter.allow('login:a', 2)).toBe(true);
    expect(limiter.allow('login:a', 2)).toBe(false);
    vi.advanceTimersByTime(1_001);
    expect(limiter.allow('login:a', 2)).toBe(true);
    vi.useRealTimers();
  });

  it('adds a timeout signal without replacing an explicit signal', async () => {
    const originalFetch = globalThis.fetch;
    const fake = vi.fn(async (_input, init) => ({ ok: true, signal: init.signal }));
    globalThis.fetch = fake;
    try {
      await fetchWithTimeout('https://example.test');
      expect(fake.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
      const controller = new AbortController();
      await fetchWithTimeout('https://example.test', { signal: controller.signal });
      expect(fake.mock.calls[1][1].signal).toBe(controller.signal);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
