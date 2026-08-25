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
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, length: data.length, sample: data.slice(0, 120) });
      });
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('=== Smoke Test Produção: https://nextia.dev.br ===\n');
  for (const u of urls) {
    const res = await check(u);
    console.log(`[HTTP ${res.status}] ${res.url}`);
    if (res.sample) console.log(`  Preview: ${res.sample}`);
    if (res.error) console.log(`  Error: ${res.error}`);
    console.log();
  }
}

run();
