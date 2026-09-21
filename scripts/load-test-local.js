const baseUrl = process.env.LOAD_TEST_BASE_URL || 'http://127.0.0.1:4178';
const parsed = new URL(baseUrl);
if (!['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname)) {
  throw new Error('O teste de carga só pode apontar para localhost. Use um harness aprovado para staging.');
}

const scenarios = [
  { path: '/', requests: 60, concurrency: 6 },
  { path: '/health', requests: 40, concurrency: 4 },
];

async function runScenario({ path, requests, concurrency }) {
  const durations = [];
  let errors = 0;
  let next = 0;
  async function worker() {
    while (next < requests) {
      next += 1;
      const started = performance.now();
      try {
        const response = await fetch(new URL(path, baseUrl), { signal: AbortSignal.timeout(5_000) });
        await response.arrayBuffer();
        if (!response.ok) errors += 1;
      } catch {
        errors += 1;
      } finally {
        durations.push(performance.now() - started);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  durations.sort((a, b) => a - b);
  const percentile = (ratio) => durations[Math.min(durations.length - 1, Math.floor(durations.length * ratio))];
  return { path, requests, concurrency, errors, p50_ms: Math.round(percentile(0.5)), p95_ms: Math.round(percentile(0.95)), max_ms: Math.round(durations.at(-1)) };
}

const results = [];
for (const scenario of scenarios) results.push(await runScenario(scenario));
console.log(JSON.stringify({ baseUrl, results }, null, 2));
if (results.some((result) => result.errors > 0)) process.exitCode = 1;
