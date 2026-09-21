const PRIVATE_PREFIXES = ['/admin', '/painel', '/parceiro', '/tecnico', '/checkout', '/perfil', '/login', '/cadastro', '/recuperar-senha', '/redefinir-senha', '/suporte/ticket', '/demo'];

export function normalizeSeoPath(value) {
  const raw = String(value || '/').split('?')[0].split('#')[0] || '/';
  const normalized = `/${raw.replace(/^\/+|\/+$/g, '')}`;
  return normalized === '/' ? '/' : normalized.toLowerCase();
}

export function isPrivateSeoPath(pathname) {
  const path = normalizeSeoPath(pathname);
  return PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function resolveSeoRedirect(pathname, redirects = []) {
  const path = normalizeSeoPath(pathname);
  const match = redirects.find((item) => normalizeSeoPath(item.from) === path);
  return match ? { status: Number(match.status) === 302 ? 302 : 301, location: normalizeSeoPath(match.to) } : null;
}

export function resolveSeoEntry(pathname, entries = []) {
  const path = normalizeSeoPath(pathname);
  return entries.find((entry) => normalizeSeoPath(entry.path) === path) || null;
}

export function isKnownPublicSeoPath(pathname, manifest) {
  const path = normalizeSeoPath(pathname);
  if (isPrivateSeoPath(path)) return true;
  return Boolean(resolveSeoEntry(path, manifest?.entries || []) || resolveSeoRedirect(path, manifest?.redirects || []));
}

export function buildSitemapXml(entries, baseUrl = 'https://nextia.dev.br') {
  const origin = String(baseUrl).replace(/\/$/, '');
  const rows = entries
    .filter((entry) => entry.indexable !== false && !entry.redirect && (!entry.canonicalUrl || new URL(entry.canonicalUrl, origin).pathname === normalizeSeoPath(entry.path)))
    .sort((a, b) => a.path.localeCompare(b.path, 'pt-BR'))
    .map((entry) => {
      const lastmod = entry.updatedAt ? `<lastmod>${escapeXml(entry.updatedAt)}</lastmod>` : '';
      const changefreq = entry.changefreq ? `<changefreq>${escapeXml(entry.changefreq)}</changefreq>` : '';
      const priority = entry.priority ? `<priority>${escapeXml(String(entry.priority))}</priority>` : '';
      return `  <url><loc>${escapeXml(`${origin}${normalizeSeoPath(entry.path)}`)}</loc>${lastmod}${changefreq}${priority}</url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
}

export function injectSeoIntoHtml(html, entry, baseUrl = 'https://nextia.dev.br') {
  if (!entry) return html;
  const origin = String(baseUrl).replace(/\/$/, '');
  const canonical = entry.canonicalUrl || `${origin}${normalizeSeoPath(entry.path)}`;
  const title = escapeHtml(entry.title || 'Nextia');
  const description = escapeHtml(entry.description || 'Soluções digitais e tecnologia para empresas.');
  const robots = entry.indexable === false ? 'noindex, nofollow' : 'index, follow';
  let output = String(html);
  output = replaceOrInsert(output, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  output = replaceOrInsert(output, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}" />`);
  output = replaceOrInsert(output, /<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${robots}" />`);
  output = replaceOrInsert(output, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${entry.type === 'article' ? 'article' : 'website'}" />`);
  output = replaceOrInsert(output, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
  output = replaceOrInsert(output, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${description}" />`);
  if (entry.image) {
    const imageUrl = String(entry.image).startsWith('http') ? entry.image : `${origin}${entry.image}`;
    output = replaceOrInsert(output, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`);
  }
  return output;
}

function replaceOrInsert(html, pattern, tag) {
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function escapeXml(value) {
  return escapeHtml(value);
}
