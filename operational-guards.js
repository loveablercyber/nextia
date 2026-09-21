import { randomUUID } from 'node:crypto';

export function resolveRequestId(value) {
  const candidate = String(value || '').trim();
  return /^[A-Za-z0-9._:-]{8,128}$/.test(candidate) ? candidate : randomUUID();
}

export function createSlidingWindowLimiter({ windowMs = 60_000, maxEntries = 5_000 } = {}) {
  const windows = new Map();
  return {
    allow(key, limit) {
      const now = Date.now();
      const normalizedKey = String(key || 'unknown');
      const recent = (windows.get(normalizedKey) || []).filter((timestamp) => now - timestamp < windowMs);
      if (recent.length >= limit) return false;
      recent.push(now);
      windows.set(normalizedKey, recent);
      if (windows.size > maxEntries) {
        for (const [candidate, timestamps] of windows) {
          if (!timestamps.some((timestamp) => now - timestamp < windowMs)) windows.delete(candidate);
        }
      }
      return true;
    },
    size() {
      return windows.size;
    },
  };
}

export function requestIp(req) {
  return String(req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

export function fetchWithTimeout(input, init = {}, timeoutMs = 15_000) {
  if (init.signal) return fetch(input, init);
  return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}
