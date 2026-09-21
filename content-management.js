import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATUSES = new Set(['draft', 'review', 'published', 'archived']);
const PILLARS = new Set(['presenca-digital', 'automacao-responsavel', 'operacao-ti']);
const TRANSITIONS = {
  draft: new Set(['review']),
  review: new Set(['draft', 'published']),
  published: new Set(['archived']),
  archived: new Set(['draft']),
};
let schemaPromise;

export function isContentApiPath(pathname) {
  return pathname === '/api/content' || pathname.startsWith('/api/content/') || pathname === '/api/admin/content' || pathname.startsWith('/api/admin/content/');
}

export function normalizeContentSlug(input) {
  return String(input || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
}

export function validateSafeMarkdown(input) {
  const text = String(input || '');
  if (/<\/?[a-z][^>]*>/i.test(text) || /(?:javascript|vbscript|data):/i.test(text)) throw httpError(400, 'HTML, scripts e URLs inseguras não são permitidos no conteúdo.');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].trim();
    if (!(target.startsWith('/') || /^https:\/\//i.test(target) || /^mailto:[^\s@]+@[^\s@]+$/i.test(target))) throw httpError(400, 'Link inválido no conteúdo. Use caminho interno, HTTPS ou e-mail válido.');
  }
  return text.slice(0, 100_000);
}

export function canTransitionContent(from, to) {
  return Boolean(TRANSITIONS[from]?.has(to));
}

export function contentToSeoEntry(row) {
  return {
    path: `/conteudos/${row.slug}`,
    title: row.seo_title || `${row.title} | Nextia`,
    description: row.seo_description || row.excerpt,
    image: row.og_image_url || undefined,
    canonicalUrl: row.canonical_url || undefined,
    type: 'article',
    indexable: row.indexing_policy === 'index',
    updatedAt: new Date(row.updated_at).toISOString().slice(0, 10),
    changefreq: 'monthly',
    priority: '0.6',
  };
}

export async function ensureContentSchema(client) {
  if (!schemaPromise) {
    schemaPromise = client.query(`SELECT to_regclass('public.content_entries') ready`).then(async (result) => {
      if (!result.rows[0]?.ready) await client.query(await readFile(join(__dirname, 'database/migrations/0011_seo_content.sql'), 'utf8'));
    });
  }
  try { await schemaPromise; } catch (error) { schemaPromise = undefined; throw error; }
}

export async function getPublishedContentSeoEntries(client) {
  await ensureContentSchema(client);
  const result = await client.query(`SELECT slug,title,excerpt,seo_title,seo_description,canonical_url,og_image_url,indexing_policy,updated_at FROM public.content_entries WHERE status='published' ORDER BY published_at DESC`);
  return result.rows.map(contentToSeoEntry);
}

export async function getPublishedContentSeoEntry(client, slug) {
  await ensureContentSchema(client);
  const result = await client.query(`SELECT slug,title,excerpt,seo_title,seo_description,canonical_url,og_image_url,CASE WHEN status='archived' THEN 'noindex' ELSE indexing_policy END indexing_policy,updated_at FROM public.content_entries WHERE slug=$1 AND (status='published' OR (status='archived' AND archive_policy='keep_noindex'))`, [normalizeContentSlug(slug)]);
  return result.rows[0] ? contentToSeoEntry(result.rows[0]) : null;
}

export async function handleContentApi(req, res, url, deps) {
  const { dbClient, getSessionProfile, json, readJson } = deps;
  const client = dbClient();
  await client.connect();
  try {
    await ensureContentSchema(client);
    if (url.pathname === '/api/content' && req.method === 'GET') {
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 12));
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const pillar = String(url.searchParams.get('pillar') || '');
      const params = [];
      let filter = `status='published'`;
      if (pillar) { params.push(pillar); filter += ` AND pillar=$${params.length}`; }
      params.push(limit, (page - 1) * limit);
      const result = await client.query(`SELECT id,title,slug,excerpt,author_name_snapshot,pillar,topic,og_image_url,published_at,updated_at FROM public.content_entries WHERE ${filter} ORDER BY published_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
      return json(res, 200, { contents: result.rows, page, limit });
    }
    const publicMatch = url.pathname.match(/^\/api\/content\/([a-z0-9-]+)$/);
    if (publicMatch && req.method === 'GET') {
      const result = await client.query(`SELECT id,title,slug,excerpt,content_markdown,author_name_snapshot,pillar,topic,seo_title,seo_description,canonical_url,og_image_url,CASE WHEN status='archived' THEN 'noindex' ELSE indexing_policy END indexing_policy,related_service_slug,related_paths,cta_label,cta_path,published_at,updated_at FROM public.content_entries WHERE slug=$1 AND (status='published' OR (status='archived' AND archive_policy='keep_noindex'))`, [publicMatch[1]]);
      return result.rows[0] ? json(res, 200, { content: result.rows[0] }) : json(res, 404, { error: 'Conteúdo não encontrado.' });
    }

    const session = await getSessionProfile(req, client);
    if (!session) return json(res, 401, { error: 'Autenticação necessária.' });
    if (session.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });

    if (url.pathname === '/api/admin/content' && req.method === 'GET') {
      const result = await client.query(`SELECT c.*,p.name author_name FROM public.content_entries c LEFT JOIN public.profiles p ON p.id=c.author_id ORDER BY c.updated_at DESC LIMIT 200`);
      return json(res, 200, { contents: result.rows });
    }
    if (url.pathname === '/api/admin/content' && req.method === 'POST') {
      const body = await readJson(req);
      const data = validatePayload(body, false);
      const result = await client.query(`INSERT INTO public.content_entries(title,slug,excerpt,content_markdown,author_id,author_name_snapshot,pillar,topic,publication_reason,seo_title,seo_description,canonical_url,og_image_url,indexing_policy,archive_policy,related_service_slug,related_paths,cta_label,cta_path,review_due_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *`, [data.title,data.slug,data.excerpt,data.contentMarkdown,session.id,data.authorName,data.pillar,data.topic,data.publicationReason,data.seoTitle,data.seoDescription,data.canonicalUrl,data.ogImageUrl,data.indexingPolicy,data.archivePolicy,data.relatedServiceSlug,JSON.stringify(data.relatedPaths),data.ctaLabel,data.ctaPath,data.reviewDueAt]);
      await history(client, result.rows[0].id, null, 'draft', session.id, 'Conteúdo criado como rascunho.');
      return json(res, 201, { content: result.rows[0] });
    }
    const itemMatch = url.pathname.match(/^\/api\/admin\/content\/([0-9a-f-]+)$/i);
    if (itemMatch && req.method === 'PATCH') {
      const current = (await client.query('SELECT * FROM public.content_entries WHERE id=$1', [itemMatch[1]])).rows[0];
      if (!current) return json(res, 404, { error: 'Conteúdo não encontrado.' });
      if (current.status === 'published') return json(res, 409, { error: 'Arquive o conteúdo antes de editar uma versão publicada.' });
      const body = await readJson(req);
      if (Number(body.version) !== current.version) return json(res, 409, { error: 'O conteúdo foi alterado em outra sessão. Recarregue antes de salvar.' });
      const data = validatePayload({ ...current, ...body }, false);
      const result = await client.query(`UPDATE public.content_entries SET title=$2,slug=$3,excerpt=$4,content_markdown=$5,author_name_snapshot=$6,pillar=$7,topic=$8,publication_reason=$9,seo_title=$10,seo_description=$11,canonical_url=$12,og_image_url=$13,indexing_policy=$14,archive_policy=$15,related_service_slug=$16,related_paths=$17,cta_label=$18,cta_path=$19,review_due_at=$20,version=version+1,updated_at=NOW() WHERE id=$1 RETURNING *`, [itemMatch[1],data.title,data.slug,data.excerpt,data.contentMarkdown,data.authorName,data.pillar,data.topic,data.publicationReason,data.seoTitle,data.seoDescription,data.canonicalUrl,data.ogImageUrl,data.indexingPolicy,data.archivePolicy,data.relatedServiceSlug,JSON.stringify(data.relatedPaths),data.ctaLabel,data.ctaPath,data.reviewDueAt]);
      return json(res, 200, { content: result.rows[0] });
    }
    const transitionMatch = url.pathname.match(/^\/api\/admin\/content\/([0-9a-f-]+)\/transition$/i);
    if (transitionMatch && req.method === 'POST') {
      const body = await readJson(req);
      const target = String(body.status || '');
      const current = (await client.query('SELECT * FROM public.content_entries WHERE id=$1 FOR UPDATE', [transitionMatch[1]])).rows[0];
      if (!current) return json(res, 404, { error: 'Conteúdo não encontrado.' });
      if (!STATUSES.has(target) || !canTransitionContent(current.status, target)) return json(res, 409, { error: `Transição ${current.status} → ${target} não permitida.` });
      if (target === 'review' || target === 'published') validatePayload(current, target === 'published');
      if (Number(body.version) !== current.version) return json(res, 409, { error: 'O conteúdo foi alterado em outra sessão. Recarregue antes de mudar o status.' });
      const result = await client.query(`UPDATE public.content_entries SET status=$2,submitted_for_review_at=CASE WHEN $2='review' THEN NOW() ELSE submitted_for_review_at END,published_at=CASE WHEN $2='published' THEN COALESCE(published_at,NOW()) ELSE published_at END,archived_at=CASE WHEN $2='archived' THEN NOW() ELSE NULL END,version=version+1,updated_at=NOW() WHERE id=$1 AND version=$3 RETURNING *`, [transitionMatch[1], target, current.version]);
      if (!result.rows[0]) return json(res, 409, { error: 'Conflito de versão ao alterar o status.' });
      await history(client, current.id, current.status, target, session.id, String(body.notes || '').slice(0, 1000) || null);
      if (target === 'review') await appendOutbox(client, current.id, 'content.review_requested', { contentId: current.id, title: current.title }, `content.review:${current.id}:${result.rows[0].version}`);
      return json(res, 200, { content: result.rows[0] });
    }
    return json(res, 404, { error: 'Rota de conteúdo não encontrada.' });
  } catch (error) {
    if (error?.code === '23505') return json(res, 409, { error: 'Já existe conteúdo com este slug.' });
    if (error?.statusCode) return json(res, error.statusCode, { error: error.message });
    throw error;
  } finally { await client.end(); }
}

function validatePayload(input, publishing) {
  const field = (camel, snake = camel) => input[camel] ?? input[snake];
  const title = String(field('title') || '').trim().slice(0, 160);
  const slug = normalizeContentSlug(field('slug') || title);
  const excerpt = String(field('excerpt') || '').trim().slice(0, 320);
  const contentMarkdown = validateSafeMarkdown(field('contentMarkdown', 'content_markdown'));
  const pillar = String(field('pillar') || '');
  const topic = String(field('topic') || '').trim().slice(0, 120);
  const publicationReason = String(field('publicationReason', 'publication_reason') || '').trim().slice(0, 500);
  const seoTitle = String(field('seoTitle', 'seo_title') || '').trim().slice(0, 160);
  const seoDescription = String(field('seoDescription', 'seo_description') || '').trim().slice(0, 320);
  const indexingPolicy = field('indexingPolicy', 'indexing_policy') === 'noindex' ? 'noindex' : 'index';
  const relatedPaths = Array.isArray(field('relatedPaths', 'related_paths')) ? field('relatedPaths', 'related_paths').slice(0, 10).map(String) : [];
  if (!title || !slug || !PILLARS.has(pillar) || !topic || !publicationReason) throw httpError(400, 'Título, slug, pilar, tema e justificativa editorial são obrigatórios.');
  if (relatedPaths.some((path) => !/^\/[a-z0-9][a-z0-9/_-]*$/.test(path))) throw httpError(400, 'Relações devem usar caminhos internos válidos.');
  if (publishing && (excerpt.length < 60 || contentMarkdown.trim().length < 300 || !seoTitle || seoDescription.length < 70)) throw httpError(400, 'Publicação exige resumo, conteúdo útil e metadata completos.');
  const canonicalUrl = safeOptionalUrl(field('canonicalUrl', 'canonical_url'), true);
  const ogImageUrl = safeOptionalUrl(field('ogImageUrl', 'og_image_url'), false);
  const ctaPath = String(field('ctaPath', 'cta_path') || '/orcamento').trim();
  if (!/^\/[a-z0-9][a-z0-9/?&=_-]*$/.test(ctaPath)) throw httpError(400, 'CTA deve apontar para rota interna existente.');
  return { title,slug,excerpt,contentMarkdown,pillar,topic,publicationReason,seoTitle,seoDescription,canonicalUrl,ogImageUrl,indexingPolicy,archivePolicy:field('archivePolicy','archive_policy')==='not_found'?'not_found':'keep_noindex',relatedServiceSlug:String(field('relatedServiceSlug','related_service_slug')||'').trim().slice(0,120)||null,relatedPaths,ctaLabel:String(field('ctaLabel','cta_label')||'Solicitar uma avaliação').trim().slice(0,100),ctaPath,authorName:String(field('authorName','author_name_snapshot')||'Equipe Nextia').trim().slice(0,120),reviewDueAt:field('reviewDueAt','review_due_at')||null };
}

function safeOptionalUrl(input, canonical) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  if (raw.startsWith('/')) return raw.slice(0, 500);
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || (canonical && !['nextia.dev.br', 'www.nextia.dev.br'].includes(url.hostname))) throw new Error();
    return url.toString().slice(0, 500);
  } catch { throw httpError(400, canonical ? 'Canonical externo não autorizado.' : 'URL de imagem inválida.'); }
}

async function history(client, contentId, from, to, userId, notes) {
  await client.query('INSERT INTO public.content_status_history(content_id,from_status,to_status,changed_by,notes) VALUES($1,$2,$3,$4,$5)', [contentId,from,to,userId,notes]);
}

async function appendOutbox(client, contentId, eventType, payload, key) {
  await client.query(`INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key) VALUES('content',$1,$2,$3,$4) ON CONFLICT(idempotency_key) DO NOTHING`, [contentId,eventType,JSON.stringify(payload),key]);
}

function httpError(statusCode, message) { return Object.assign(new Error(message), { statusCode }); }
