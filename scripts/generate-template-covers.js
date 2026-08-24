import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_IMAGES = [
  {
    slug: 'restaurante-premium',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'salao-elegance',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'servicos-profissionais',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'loja-catalogo',
    url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'clinica-estetica',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'contabilidade',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'imobiliaria',
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'oficina-mecanica',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'imobiliaria-premium',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'loja-moda-premium',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'loja-gourmet',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'loja-tech-store',
    url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop',
  },
];

const targetDir = path.resolve(__dirname, '../public/images/templates');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} ao baixar ${url}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log(`[Cover Generator] Baixando ${TEMPLATE_IMAGES.length} capas em alta definição para ${targetDir}...`);
  for (const item of TEMPLATE_IMAGES) {
    const dest = path.join(targetDir, `${item.slug}.webp`);
    try {
      await downloadImage(item.url, dest);
      const size = fs.statSync(dest).size;
      console.log(`  ✓ ${item.slug}.webp salvo com sucesso (${Math.round(size / 1024)} KB)`);
    } catch (err) {
      console.error(`  ✗ Erro em ${item.slug}:`, err.message);
    }
  }
  console.log('[Cover Generator] Concluído!');
}

run();
