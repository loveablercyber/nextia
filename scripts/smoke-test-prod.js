import https from 'https';

const urls = [
  'https://nextia.dev.br/api/health',
  'https://nextia.dev.br/api/catalog/services',
  'https://nextia.dev.br/api/catalog/plans',
  'https://nextia.dev.br/api/catalog/store-templates',
  'https://nextia.dev.br/api/catalog/addons?service=sites-prontos',
  'https://nextia.dev.br/api/catalog/addons?service=lojas-virtuais',
];

async function check(url) {
  return new Promise((resolve) => {
    const request = https.get(url, { timeout: 10_000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, length: data.length, sample: data.slice(0, 120) });
      });
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });
    request.on('timeout', () => request.destroy(new Error('Timeout após 10 segundos')));
  });
}

async function run() {
  console.log('=== Smoke Test Produção: https://nextia.dev.br ===\n');
  let failures = 0;
  for (const u of urls) {
    const res = await check(u);
    console.log(`[HTTP ${res.status}] ${res.url}`);
    if (res.sample) console.log(`  Preview: ${res.sample}`);
    if (res.error) console.log(`  Error: ${res.error}`);
    if (typeof res.status !== 'number' || res.status < 200 || res.status >= 400) failures += 1;
    console.log();
  }
  if (failures > 0) process.exitCode = 1;
}

run();
