import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildSitemapXml } from '../seo-routing.js';

const root = process.cwd();
const read = (path) => readFile(join(root, path), 'utf8');
const value = (block, field) => block.match(new RegExp(`\\b${field}:\\s*['\"]([^'\"]+)['\"]`))?.[1] || '';

function recordBlocks(source, startText, endText) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start + startText.length);
  const body = source.slice(start, end < 0 ? source.length : end);
  const matches = [...body.matchAll(/^  (?:(['"])([^'"]+)\1|([a-zA-Z][\w-]*)): \{\r?$/gm)];
  return matches.map((match, index) => ({
    key: match[2] || match[3],
    block: body.slice(match.index, matches[index + 1]?.index ?? body.length),
  }));
}

function arrayBlocks(source, startText, endText) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start + startText.length);
  const body = source.slice(start, end < 0 ? source.length : end);
  const matches = [...body.matchAll(/^  \{\r?$/gm)];
  return matches.map((match, index) => body.slice(match.index, matches[index + 1]?.index ?? body.length));
}

const staticEntries = [
  ['/', 'Sites profissionais e tecnologia para empresas | Nextia', 'Criação de sites profissionais, automação, suporte de TI, redes, Wi-Fi, câmeras e backup para empresas em Bauru e todo o Brasil.', 'weekly', '1.0'],
  ['/sites', 'Criação de Sites Profissionais | Nextia', 'Sites profissionais, responsivos e preparados para apresentar sua empresa e captar oportunidades.', 'monthly', '0.9'],
  ['/landing-pages', 'Landing Pages Profissionais | Nextia', 'Landing pages responsivas e orientadas a conversão para campanhas e serviços reais.', 'monthly', '0.8'],
  ['/lojas-virtuais', 'Lojas Virtuais | Nextia', 'Lojas virtuais profissionais com catálogo, checkout e integrações adequadas ao seu negócio.', 'monthly', '0.8'],
  ['/sistemas', 'Sistemas Sob Medida | Nextia', 'Sistemas sob medida para organizar processos e integrar a operação da sua empresa.', 'monthly', '0.8'],
  ['/automacao-ia', 'Automação e Inteligência Artificial | Nextia', 'Automação responsável de processos e atendimento com inteligência artificial.', 'monthly', '0.9'],
  ['/chatbot', 'Chatbots para Empresas | Nextia', 'Chatbots para triagem e atendimento integrados aos processos da empresa.', 'monthly', '0.8'],
  ['/automacao-whatsapp', 'Automação de WhatsApp | Nextia', 'Automação de atendimento no WhatsApp com fluxos controlados e encaminhamento humano.', 'monthly', '0.8'],
  ['/techcare', 'Nextia TechCare | Suporte de TI', 'Suporte técnico contínuo para computadores, sistemas e operação da empresa.', 'monthly', '0.9'],
  ['/suporte-ti', 'Suporte de TI para Empresas | Nextia', 'Suporte de TI para manter equipamentos, usuários e sistemas operando com segurança.', 'monthly', '0.8'],
  ['/suporte-remoto', 'Suporte Remoto de TI | Nextia', 'Atendimento remoto para diagnóstico e suporte técnico de TI.', 'monthly', '0.7'],
  ['/manutencao-computadores', 'Manutenção de Computadores | Nextia', 'Manutenção e suporte técnico para computadores de empresas e profissionais.', 'monthly', '0.7'],
  ['/manutencao-notebooks', 'Manutenção de Notebooks | Nextia', 'Diagnóstico, manutenção e suporte técnico para notebooks.', 'monthly', '0.7'],
  ['/redes-wifi', 'Redes e Wi-Fi para Empresas | Nextia', 'Projeto, instalação e melhoria de redes e Wi-Fi corporativo.', 'monthly', '0.8'],
  ['/cabeamento', 'Cabeamento Estruturado | Nextia', 'Cabeamento estruturado e organização de infraestrutura de rede para empresas.', 'monthly', '0.7'],
  ['/cameras-seguranca', 'Câmeras de Segurança | Nextia', 'Instalação e suporte para sistemas de câmeras e monitoramento.', 'monthly', '0.8'],
  ['/backup', 'Backup e Proteção de Dados | Nextia', 'Soluções de backup e proteção para arquivos importantes da empresa.', 'monthly', '0.8'],
  ['/solucoes', 'Soluções de Tecnologia por Segmento | Nextia', 'Conheça soluções digitais e de tecnologia organizadas pelas necessidades de cada segmento.', 'weekly', '0.9'],
  ['/modelos', 'Modelos de Sites Profissionais | Nextia', 'Veja modelos de sites profissionais e escolha uma base para personalizar seu projeto.', 'weekly', '0.9'],
  ['/portfolio', 'Portfólio de Projetos | Nextia', 'Projetos publicados pela Nextia somente com autorização e informações verificadas.', 'monthly', '0.6'],
  ['/portfolio/carolsol', 'CarolSol — Case de ecossistema digital | Nextia', 'Conheça o ecossistema digital CarolSol desenvolvido pela Nextia, com portal, e-commerce, plataforma de cursos, projeto social e gestão integrada.', 'monthly', '0.7'],
  ['/planos', 'Planos e Preços | Nextia', 'Compare os planos digitais da Nextia e escolha a estrutura adequada ao seu negócio.', 'weekly', '0.8'],
  ['/como-funciona', 'Como funciona a Nextia', 'Conheça o processo de diagnóstico, desenvolvimento, entrega e acompanhamento da Nextia.', 'monthly', '0.7'],
  ['/projeto-personalizado', 'Projeto Personalizado | Nextia', 'Solicite uma avaliação para um projeto digital ou sistema alinhado às necessidades da sua empresa.', 'monthly', '0.7'],
  ['/contato', 'Contato | Nextia', 'Entre em contato com a Nextia para falar sobre tecnologia, suporte ou um novo projeto.', 'monthly', '0.7'],
  ['/orcamento', 'Solicitar Orçamento | Nextia', 'Informe as necessidades do projeto para receber uma avaliação comercial da Nextia.', 'monthly', '0.7'],
  ['/conteudos', 'Conteúdos sobre tecnologia para empresas | Nextia', 'Guias e conteúdos revisados pela equipe Nextia sobre presença digital, automação responsável e operação de TI.', 'weekly', '0.7'],
  ['/parceiros', 'Programa de Parceiros | Nextia', 'Conheça o programa de parceiros da Nextia e as regras para indicações comerciais.', 'monthly', '0.5'],
  ['/termos', 'Termos de Uso | Nextia', 'Termos de uso dos serviços e canais digitais da Nextia.', 'yearly', '0.2'],
  ['/privacidade', 'Política de Privacidade | Nextia', 'Política de privacidade e tratamento de dados pessoais da Nextia.', 'yearly', '0.2'],
  ['/cookies', 'Política de Cookies | Nextia', 'Informações sobre o uso de cookies nos canais digitais da Nextia.', 'yearly', '0.2'],
].map(([path, title, description, changefreq, priority]) => ({ path, title, description, changefreq, priority, indexable: true, type: 'website' }));

const [citiesSource, localSource, nicheSource, segmentsSource, templatesSource] = await Promise.all([
  read('src/data/cities.ts'), read('src/data/localServices.ts'), read('src/data/localNicheServices.ts'), read('src/data/segments.ts'), read('src/data/templates.ts'),
]);

const entries = [...staticEntries];
const activeCityKeys = new Set();
for (const { key, block } of recordBlocks(citiesSource, 'export const CITIES_DATA', '};')) {
  if (value(block, 'operationalStatus') !== 'active' || value(block, 'contentStatus') !== 'validated') continue;
  activeCityKeys.add(key);
  entries.push({ path: `/${key}`, title: value(block, 'metaTitle'), description: value(block, 'metaDescription'), changefreq: 'weekly', priority: '0.9', indexable: true, type: 'website' });
}
for (const { key, block } of recordBlocks(localSource, 'export const LOCAL_SERVICES_DATA', 'const SERVICE_ALIASES')) {
  if (value(block, 'status') !== 'published' || !activeCityKeys.has(key.split('/')[0])) continue;
  entries.push({ path: `/${key}`, title: value(block, 'metaTitle'), description: value(block, 'metaDescription'), changefreq: 'weekly', priority: '0.8', indexable: true, type: 'website' });
}
for (const { key, block } of recordBlocks(nicheSource, 'export const LOCAL_NICHE_SERVICES', 'export const PUBLISHED_LOCAL_NICHE_SLUGS')) {
  if (value(block, 'status') !== 'published' || !value(block, 'publicationReason') || !activeCityKeys.has(key.split('/')[0])) continue;
  entries.push({ path: `/${key}`, title: value(block, 'title'), description: value(block, 'description'), changefreq: 'monthly', priority: '0.7', indexable: true, type: 'website' });
}
for (const { key, block } of recordBlocks(segmentsSource, 'export const SEGMENTS', 'export const PUBLISHED_SEGMENT_SLUGS')) {
  if (value(block, 'status') !== 'published') continue;
  entries.push({ path: `/solucoes/${key}`, title: value(block, 'seoTitle'), description: value(block, 'metaDescription'), changefreq: 'weekly', priority: '0.8', indexable: true, type: 'website' });
}
for (const block of arrayBlocks(templatesSource, 'export const templates', 'export const templateCategories')) {
  const slug = value(block, 'slug');
  const name = value(block, 'name');
  const category = value(block, 'category');
  const description = value(block, 'description');
  const image = value(block, 'coverImage');
  const demoUrl = value(block, 'demoUrl');
  if (!slug || !description || !image || !demoUrl || demoUrl === '#') continue;
  entries.push({ path: `/modelos/${slug}`, title: `Modelo de Site para ${category} | ${name} | Nextia`, description, image, changefreq: 'monthly', priority: '0.7', indexable: true, type: 'website' });
  entries.push({ path: demoUrl, title: `Demonstração do modelo ${name} | Nextia`, description: 'Demonstração interativa de um modelo de site da Nextia.', image, indexable: false, type: 'website' });
}

entries.push(
  { path: '/cases', title: 'Cases | Nextia', description: 'Cases verificados da Nextia serão publicados somente com autorização.', indexable: false, type: 'website' },
  { path: '/solicitar-servico', title: 'Solicitar serviço | Nextia', description: 'Formulário para solicitar atendimento da Nextia.', indexable: false, type: 'website' },
  { path: '/parceiros/cadastro', title: 'Cadastro de parceiro | Nextia', description: 'Cadastro no programa de parceiros da Nextia.', indexable: false, type: 'website' },
);

const uniqueEntries = [...new Map(entries.map((entry) => [entry.path, entry])).values()];
const redirects = [
  { from: '/sites-prontos', to: '/modelos', status: 301 },
  { from: '/templates', to: '/modelos', status: 301 },
  ...uniqueEntries.filter((entry) => entry.path.startsWith('/modelos/')).map((entry) => ({ from: entry.path.replace('/modelos/', '/templates/'), to: entry.path, status: 301 })),
  ...uniqueEntries.filter((entry) => activeCityKeys.has(entry.path.split('/')[1])).map((entry) => ({ from: `/cidade${entry.path}`, to: entry.path, status: 301 })),
];
const manifest = { version: 1, generatedAt: new Date().toISOString(), entries: uniqueEntries, redirects };
await writeFile(join(root, 'public/seo-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(join(root, 'public/sitemap.xml'), buildSitemapXml(uniqueEntries), 'utf8');
console.log(`SEO manifest: ${uniqueEntries.filter((entry) => entry.indexable !== false).length} páginas indexáveis, ${uniqueEntries.length} rotas públicas e ${redirects.length} redirects.`);
