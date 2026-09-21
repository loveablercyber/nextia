import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await readFile(join(root, 'public/seo-manifest.json'), 'utf8'));
const known = new Set([...manifest.entries.map((entry) => entry.path), ...manifest.redirects.map((entry) => entry.from)]);
const operationalPrefixes = ['/admin','/painel','/parceiro','/tecnico','/checkout','/perfil','/login','/cadastro','/recuperar-senha','/redefinir-senha','/suporte/ticket','/ref/'];

async function files(directory) {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes:true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) result.push(...await files(path));
    else if (['.ts','.tsx'].includes(extname(item.name))) result.push(path);
  }
  return result;
}

const links = new Set();
for (const file of await files(join(root, 'src'))) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/(?:to|href)=["'](\/[^"'#?]*)/g)) links.add(match[1].replace(/\/$/, '') || '/');
}
const broken = [...links].filter((path) => !known.has(path) && !operationalPrefixes.some((prefix) => path === prefix || path.startsWith(prefix)));
if (broken.length) {
  console.error(`Links internos estáticos sem rota/redirect conhecido:\n${broken.map((path) => `- ${path}`).join('\n')}`);
  process.exitCode = 1;
} else console.log(`Auditoria de links: ${links.size} destinos estáticos válidos; 0 quebrados.`);
