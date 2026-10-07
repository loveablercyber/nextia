import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSlidingWindowLimiter, requestIp } from './operational-guards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENT_NAMES = new Set(['campaign_view','configurator_started','segment_selected','preview_created','preview_viewed','preview_edited','pricing_viewed','addon_selected','lead_identified','checkout_started','purchase_completed']);
const STEPS = new Set(['landing','segment','configuration','preview','pricing','contact','checkout','complete']);
let schemaPromise;
const publicLimiter = createSlidingWindowLimiter({ windowMs: 60_000, maxEntries: 10_000 });

export function isAcquisitionApiPath(pathname) {
  return pathname.startsWith('/api/acquisition/') || pathname.startsWith('/api/admin/acquisition/');
}

export async function ensureAcquisitionSchema(client) {
  if (!schemaPromise) {
    schemaPromise = client.query("SELECT to_regclass('public.acquisition_campaigns') ready").then(async (result) => {
      if (!result.rows[0]?.ready) await client.query(await readFile(join(__dirname, 'database/migrations/0014_acquisition_funnel.sql'), 'utf8'));
    });
  }
  try { await schemaPromise; } catch (error) { schemaPromise = undefined; throw error; }
}

function sha256(value) { return createHash('sha256').update(String(value)).digest('hex'); }
function clean(value, max = 160) { return String(value || '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function email(value) { const result = clean(value, 254).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) ? result : ''; }
function phone(value) { const result = String(value || '').replace(/\D/g, '').slice(0, 15); return result.length >= 10 ? result : ''; }
function tokenFrom(req) { return clean(req.headers['x-funnel-token'] || String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''), 200); }
function publicKeyFrom(pathname) { return pathname.match(/\/sessions\/([0-9a-f-]{36})(?:\/|$)/i)?.[1] || ''; }
function error(statusCode, message, code = 'INVALID_REQUEST') { const value = new Error(message); value.statusCode = statusCode; value.code = code; return value; }

function chooseVariant(rows) {
  const active = rows.filter((row) => row.active && Number(row.weight) > 0);
  const total = active.reduce((sum, row) => sum + Number(row.weight), 0);
  if (!active.length || total <= 0) throw error(409, 'A campanha não possui variante ativa.', 'NO_ACTIVE_VARIANT');
  let point = Math.random() * total;
  return active.find((row) => (point -= Number(row.weight)) <= 0) || active.at(-1);
}

async function loadSession(client, req, pathname, lock = false) {
  const key = publicKeyFrom(pathname);
  const token = tokenFrom(req);
  if (!key || !token) throw error(401, 'Sessão de prévia não autorizada.', 'FUNNEL_TOKEN_REQUIRED');
  const result = await client.query(`SELECT s.*,c.slug campaign_slug,v.code variant_code
    FROM public.acquisition_funnel_sessions s
    JOIN public.acquisition_campaigns c ON c.id=s.campaign_id
    JOIN public.acquisition_campaign_variants v ON v.id=s.variant_id
    WHERE s.public_key=$1 ${lock ? 'FOR UPDATE OF s' : ''}`, [key]);
  const session = result.rows[0];
  if (!session || session.access_token_hash !== sha256(token)) throw error(404, 'Sessão não encontrada.', 'FUNNEL_SESSION_NOT_FOUND');
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await client.query("UPDATE public.acquisition_funnel_sessions SET status='expired',updated_at=NOW() WHERE id=$1 AND status<>'converted'", [session.id]);
    throw error(410, 'Esta prévia expirou. Crie uma nova para continuar.', 'FUNNEL_SESSION_EXPIRED');
  }
  return session;
}

async function appendEvent(client, session, name, properties = {}, eventKey = null) {
  if (!EVENT_NAMES.has(name)) throw error(400, 'Evento do funil inválido.');
  await client.query(`INSERT INTO public.acquisition_funnel_events(session_id,campaign_id,variant_id,event_name,event_key,properties)
    VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(session_id,event_key) WHERE event_key IS NOT NULL DO NOTHING`,
  [session.id, session.campaign_id, session.variant_id, name, eventKey, JSON.stringify(properties)]);
}

export async function handleAcquisitionApi(req, res, url, deps) {
  const { dbClient, getSessionProfile, json, readJson } = deps;
  const client = dbClient();
  await client.connect();
  try {
    await ensureAcquisitionSchema(client);
    if (!url.pathname.startsWith('/api/admin/') && !publicLimiter.allow(`acquisition:${requestIp(req)}`, url.pathname === '/api/acquisition/sessions' ? 10 : 60)) {
      return json(res, 429, { error: 'Muitas tentativas. Aguarde um minuto e tente novamente.', code: 'RATE_LIMITED' });
    }

    const campaignMatch = url.pathname.match(/^\/api\/acquisition\/campaigns\/([a-z0-9-]+)$/);
    if (campaignMatch && req.method === 'GET') {
      const result = await client.query(`SELECT c.id,c.slug,c.name,c.service_slug,c.headline,c.subheadline,c.settings,
        COALESCE(json_agg(json_build_object('code',v.code,'name',v.name,'weight',v.weight,'content',v.content) ORDER BY v.code) FILTER(WHERE v.id IS NOT NULL),'[]') variants,
        (SELECT row_to_json(p) FROM (SELECT mode,minimum_cents,maximum_cents,suggested_cents,activation_cents,monthly_cents,suggestions FROM public.acquisition_pricing_rules WHERE campaign_id=c.id AND active=TRUE LIMIT 1) p) pricing
        FROM public.acquisition_campaigns c LEFT JOIN public.acquisition_campaign_variants v ON v.campaign_id=c.id AND v.active=TRUE
        WHERE c.slug=$1 AND c.status='active' AND (c.starts_at IS NULL OR c.starts_at<=NOW()) AND (c.ends_at IS NULL OR c.ends_at>NOW()) GROUP BY c.id`, [campaignMatch[1]]);
      return result.rows[0] ? json(res, 200, { campaign: result.rows[0] }) : json(res, 404, { error: 'Campanha indisponível.' });
    }

    if (url.pathname === '/api/acquisition/sessions' && req.method === 'POST') {
      const body = await readJson(req);
      const campaign = (await client.query(`SELECT * FROM public.acquisition_campaigns WHERE slug=$1 AND status='active' AND (starts_at IS NULL OR starts_at<=NOW()) AND (ends_at IS NULL OR ends_at>NOW())`, [clean(body.campaignSlug, 80)])).rows[0];
      if (!campaign) return json(res, 404, { error: 'Campanha indisponível.' });
      const variants = (await client.query('SELECT * FROM public.acquisition_campaign_variants WHERE campaign_id=$1 AND active=TRUE ORDER BY code', [campaign.id])).rows;
      const variant = chooseVariant(variants);
      const rawToken = randomBytes(32).toString('base64url');
      const attribution = body.attribution && typeof body.attribution === 'object' ? body.attribution : {};
      const result = await client.query(`INSERT INTO public.acquisition_funnel_sessions(access_token_hash,campaign_id,variant_id,attribution)
        VALUES($1,$2,$3,$4) RETURNING id,public_key,status,current_step,expires_at`, [sha256(rawToken), campaign.id, variant.id, JSON.stringify(attribution)]);
      const session = { ...result.rows[0], campaign_id: campaign.id, variant_id: variant.id };
      await appendEvent(client, session, 'campaign_view', { path: clean(body.path, 240) }, 'campaign_view');
      return json(res, 201, { sessionKey: session.public_key, accessToken: rawToken, expiresAt: session.expires_at, variant: { code: variant.code, content: variant.content } });
    }

    if (url.pathname.match(/^\/api\/acquisition\/sessions\/[0-9a-f-]{36}$/i) && req.method === 'GET') {
      const session = await loadSession(client, req, url.pathname);
      const preview = (await client.query('SELECT segment_slug,template_slug,business_name,theme,content,revision,expires_at FROM public.acquisition_preview_projects WHERE session_id=$1', [session.id])).rows[0] || null;
      const pricing = (await client.query('SELECT mode,minimum_cents,maximum_cents,suggested_cents,activation_cents,monthly_cents,suggestions FROM public.acquisition_pricing_rules WHERE campaign_id=$1 AND active=TRUE LIMIT 1', [session.campaign_id])).rows[0] || null;
      return json(res, 200, { session: { publicKey: session.public_key, status: session.status, currentStep: session.current_step, configuration: session.configuration, selectedAddons: session.selected_addons, selectedAmountCents: session.selected_amount_cents, variantCode: session.variant_code, expiresAt: session.expires_at }, preview, pricing });
    }

    if (url.pathname.match(/^\/api\/acquisition\/sessions\/[0-9a-f-]{36}$/i) && req.method === 'PATCH') {
      const body = await readJson(req);
      const session = await loadSession(client, req, url.pathname);
      const step = STEPS.has(body.currentStep) ? body.currentStep : session.current_step;
      const configuration = body.configuration && typeof body.configuration === 'object' ? body.configuration : session.configuration;
      const statusByStep = { landing:'started', segment:'configuring', configuration:'configuring', preview:'previewed', pricing:'priced', contact:'identified', checkout:'checkout', complete:'converted' };
      await client.query(`UPDATE public.acquisition_funnel_sessions SET current_step=$2,status=$3,configuration=$4,last_activity_at=NOW(),updated_at=NOW() WHERE id=$1`, [session.id, step, statusByStep[step], JSON.stringify(configuration)]);
      return json(res, 200, { saved: true, currentStep: step });
    }

    if (url.pathname.match(/^\/api\/acquisition\/sessions\/[0-9a-f-]{36}\/preview$/i) && (req.method === 'POST' || req.method === 'PATCH')) {
      const body = await readJson(req);
      const session = await loadSession(client, req, url.pathname);
      const allowedSegments = Array.isArray((await client.query('SELECT settings FROM public.acquisition_campaigns WHERE id=$1', [session.campaign_id])).rows[0]?.settings?.allowedSegments) ? (await client.query('SELECT settings FROM public.acquisition_campaigns WHERE id=$1', [session.campaign_id])).rows[0].settings.allowedSegments : [];
      const segmentSlug = clean(body.segmentSlug, 80);
      if (!allowedSegments.includes(segmentSlug)) throw error(400, 'Segmento não permitido nesta campanha.');
      const templateSlug = clean(body.templateSlug || `site-${segmentSlug}`, 100);
      const businessName = clean(body.businessName, 100);
      if (businessName.length < 2) throw error(400, 'Informe o nome do negócio.');
      const color = /^#[0-9a-f]{6}$/i.test(body.theme?.primaryColor) ? body.theme.primaryColor : '#1677ff';
      const content = { headline: clean(body.content?.headline || `${businessName}, mais perto dos seus clientes`, 120), description: clean(body.content?.description || 'Uma presença digital profissional, rápida e preparada para gerar oportunidades.', 280), cta: clean(body.content?.cta || 'Falar com a equipe', 50), services: Array.isArray(body.content?.services) ? body.content.services.slice(0, 6).map((item) => clean(item, 60)).filter(Boolean) : [] };
      const result = await client.query(`INSERT INTO public.acquisition_preview_projects(session_id,segment_slug,template_slug,business_name,theme,content,expires_at)
        VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(session_id) DO UPDATE SET segment_slug=EXCLUDED.segment_slug,template_slug=EXCLUDED.template_slug,business_name=EXCLUDED.business_name,theme=EXCLUDED.theme,content=EXCLUDED.content,revision=acquisition_preview_projects.revision+1,updated_at=NOW() RETURNING segment_slug,template_slug,business_name,theme,content,revision,expires_at`, [session.id, segmentSlug, templateSlug, businessName, JSON.stringify({ primaryColor: color }), JSON.stringify(content), session.expires_at]);
      await client.query("UPDATE public.acquisition_funnel_sessions SET current_step='preview',status='previewed',configuration=configuration||$2::jsonb,last_activity_at=NOW(),updated_at=NOW() WHERE id=$1", [session.id, JSON.stringify({ segmentSlug, templateSlug, businessName })]);
      await appendEvent(client, session, req.method === 'POST' ? 'preview_created' : 'preview_edited', { segmentSlug, templateSlug, revision: result.rows[0].revision }, req.method === 'POST' ? 'preview_created' : null);
      return json(res, req.method === 'POST' ? 201 : 200, { preview: result.rows[0] });
    }

    if (url.pathname.match(/^\/api\/acquisition\/sessions\/[0-9a-f-]{36}\/pricing$/i) && req.method === 'POST') {
      const body = await readJson(req);
      const session = await loadSession(client, req, url.pathname);
      const pricing = (await client.query('SELECT * FROM public.acquisition_pricing_rules WHERE campaign_id=$1 AND active=TRUE LIMIT 1', [session.campaign_id])).rows[0];
      if (!pricing) throw error(409, 'Preço da campanha não configurado.');
      const requested = Math.round(Number(body.amountCents || pricing.suggested_cents));
      const amount = Math.max(Number(pricing.minimum_cents), Math.min(Number(pricing.maximum_cents || requested), requested));
      const addons = Array.isArray(body.addonCodes) ? [...new Set(body.addonCodes.map((item) => clean(item, 80)).filter(Boolean))].slice(0, 12) : [];
      const addonRows = addons.length ? (await client.query('SELECT code,name,amount_cents,billing_cycle FROM public.commercial_addons WHERE active=TRUE AND code=ANY($1)', [addons])).rows : [];
      const activationAddons = addonRows.filter((item) => item.billing_cycle !== 'monthly').reduce((sum, item) => sum + Number(item.amount_cents), 0);
      const monthlyAddons = addonRows.filter((item) => item.billing_cycle === 'monthly').reduce((sum, item) => sum + Number(item.amount_cents), 0);
      const validAddonCodes = addonRows.map((item) => item.code);
      await client.query("UPDATE public.acquisition_funnel_sessions SET selected_amount_cents=$2,selected_addons=$3,current_step='pricing',status='priced',last_activity_at=NOW(),updated_at=NOW() WHERE id=$1", [session.id, amount, JSON.stringify(validAddonCodes)]);
      await appendEvent(client, session, 'pricing_viewed', { amountCents: amount, addonCount: addonRows.length }, 'pricing_viewed');
      return json(res, 200, { currency: 'BRL', selectedAmountCents: amount, minimumCents: Number(pricing.minimum_cents), activationTotalCents: amount + activationAddons, monthlyTotalCents: Number(pricing.monthly_cents) + monthlyAddons, addons: addonRows });
    }

    if (url.pathname.match(/^\/api\/acquisition\/sessions\/[0-9a-f-]{36}\/contact$/i) && req.method === 'POST') {
      const body = await readJson(req);
      const session = await loadSession(client, req, url.pathname);
      const name = clean(body.name, 100);
      const contactEmail = email(body.email);
      const contactPhone = phone(body.phone);
      if (!name || (!contactEmail && !contactPhone)) throw error(400, 'Informe nome e um e-mail ou telefone válido.');
      let leadId = null;
      if (body.consentRecovery === true) {
        await client.query(`INSERT INTO public.acquisition_abandonment_contacts(session_id,name,email,phone,consented_at)
          VALUES($1,$2,$3,$4,NOW()) ON CONFLICT(session_id) DO UPDATE SET name=EXCLUDED.name,email=EXCLUDED.email,phone=EXCLUDED.phone,consented_at=NOW(),revoked_at=NULL,recovery_status='eligible',updated_at=NOW()`, [session.id, name, contactEmail || null, contactPhone || null]);
        leadId = session.lead_id || null;
        if (!leadId) {
          const attribution = session.attribution || {};
          const preview = (await client.query('SELECT segment_slug,template_slug,business_name FROM public.acquisition_preview_projects WHERE session_id=$1', [session.id])).rows[0];
          const lead = await client.query(`INSERT INTO public.crm_leads(public_code,name,email,phone,whatsapp,company_name,segment_slug,service_slug,template_slug,source,source_detail,utm_source,utm_medium,utm_campaign,utm_content,utm_term,first_touch_source,first_touch_at,last_touch_source,last_touch_at,landing_page,conversion_page,referrer,metadata)
            VALUES($1,$2,$3,$4,$4,$5,$6,'sites-prontos',$7,'campaign','acquisition_preview',$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING id`,
          [`LEAD-CAMP-${randomUUID().slice(0,8).toUpperCase()}`,name,contactEmail||null,contactPhone||null,preview?.business_name||null,preview?.segment_slug||null,preview?.template_slug||null,attribution.utm_source||null,attribution.utm_medium||null,attribution.utm_campaign||null,attribution.utm_content||null,attribution.utm_term||null,attribution.first_touch_source||null,attribution.first_touch_at||null,attribution.last_touch_source||null,attribution.last_touch_at||null,attribution.landing_page||null,attribution.conversion_page||null,attribution.referrer||null,JSON.stringify({ acquisitionSessionId: session.id, campaign: session.campaign_slug, variant: session.variant_code })]);
          leadId = lead.rows[0]?.id || null;
        }
      }
      await client.query("UPDATE public.acquisition_funnel_sessions SET consent_recovery=$2,lead_id=COALESCE($3,lead_id),current_step='contact',status='identified',last_activity_at=NOW(),updated_at=NOW() WHERE id=$1", [session.id, body.consentRecovery === true, leadId]);
      await appendEvent(client, session, 'lead_identified', { channel: contactEmail ? 'email' : 'phone' }, 'lead_identified');
      return json(res, 200, { saved: true });
    }

    if (url.pathname.match(/^\/api\/acquisition\/sessions\/[0-9a-f-]{36}\/events$/i) && req.method === 'POST') {
      const body = await readJson(req);
      const session = await loadSession(client, req, url.pathname);
      await appendEvent(client, session, clean(body.name, 60), body.properties && typeof body.properties === 'object' ? body.properties : {}, clean(body.eventKey, 100) || null);
      await client.query('UPDATE public.acquisition_funnel_sessions SET last_activity_at=NOW(),updated_at=NOW() WHERE id=$1', [session.id]);
      return json(res, 202, { accepted: true });
    }

    if (url.pathname === '/api/admin/acquisition/metrics' && req.method === 'GET') {
      const profile = await getSessionProfile(req, client);
      if (!profile) return json(res, 401, { error: 'Autenticação necessária.' });
      if (profile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
      const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 30));
      const [summary, variants, events] = await Promise.all([
        client.query(`SELECT COUNT(*)::int sessions,COUNT(*) FILTER(WHERE status='converted')::int conversions,COUNT(*) FILTER(WHERE status IN ('abandoned','expired'))::int abandoned FROM public.acquisition_funnel_sessions WHERE created_at>=NOW()-($1||' days')::interval`, [days]),
        client.query(`SELECT c.slug campaign,v.code variant,COUNT(*)::int sessions,COUNT(*) FILTER(WHERE s.status='converted')::int conversions FROM public.acquisition_funnel_sessions s JOIN public.acquisition_campaigns c ON c.id=s.campaign_id JOIN public.acquisition_campaign_variants v ON v.id=s.variant_id WHERE s.created_at>=NOW()-($1||' days')::interval GROUP BY c.slug,v.code ORDER BY c.slug,v.code`, [days]),
        client.query(`SELECT event_name,COUNT(*)::int total FROM public.acquisition_funnel_events WHERE occurred_at>=NOW()-($1||' days')::interval GROUP BY event_name ORDER BY total DESC`, [days]),
      ]);
      return json(res, 200, { periodDays: days, summary: summary.rows[0], variants: variants.rows, events: events.rows });
    }

    if (url.pathname === '/api/admin/acquisition/recovery/sweep' && req.method === 'POST') {
      const profile = await getSessionProfile(req, client);
      if (!profile) return json(res, 401, { error: 'Autenticação necessária.' });
      if (profile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
      await client.query('BEGIN');
      try {
        const stale = await client.query(`UPDATE public.acquisition_funnel_sessions s SET status='abandoned',updated_at=NOW()
          WHERE s.status IN ('previewed','priced','identified','checkout') AND s.consent_recovery=TRUE AND s.last_activity_at<NOW()-INTERVAL '1 hour'
            AND NOT EXISTS(SELECT 1 FROM public.acquisition_provisioning_jobs j WHERE j.session_id=s.id AND j.status='completed')
          RETURNING s.id,s.public_key`);
        for (const row of stale.rows) {
          await client.query("UPDATE public.acquisition_abandonment_contacts SET recovery_status='queued',updated_at=NOW() WHERE session_id=$1 AND revoked_at IS NULL AND recovery_status='eligible'", [row.id]);
          await client.query(`INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key)
            VALUES('acquisition_session',$1,'acquisition.recovery_requested',$2,$3) ON CONFLICT(idempotency_key) DO NOTHING`, [row.id, JSON.stringify({ sessionId: row.id, publicKey: row.public_key }), `acquisition.recovery:${row.id}`]);
        }
        await client.query(`INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) VALUES($1,'acquisition.recovery_sweep','acquisition_campaign','all',$2)`, [profile.id, JSON.stringify({ queued: stale.rowCount })]);
        await client.query('COMMIT');
        return json(res, 200, { queued: stale.rowCount });
      } catch (cause) { await client.query('ROLLBACK'); throw cause; }
    }

    if (url.pathname === '/api/admin/acquisition/campaigns' && req.method === 'GET') {
      const profile = await getSessionProfile(req, client);
      if (!profile) return json(res, 401, { error: 'Autenticação necessária.' });
      if (profile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
      const result = await client.query(`SELECT c.id,c.slug,c.name,c.status,c.service_slug,c.headline,c.subheadline,c.starts_at,c.ends_at,c.settings,c.updated_at,
        COALESCE(json_agg(json_build_object('code',v.code,'name',v.name,'weight',v.weight,'active',v.active,'content',v.content) ORDER BY v.code) FILTER(WHERE v.id IS NOT NULL),'[]') variants,
        (SELECT row_to_json(p) FROM (SELECT mode,minimum_cents,maximum_cents,suggested_cents,activation_cents,monthly_cents,suggestions FROM public.acquisition_pricing_rules WHERE campaign_id=c.id AND active=TRUE LIMIT 1) p) pricing
        FROM public.acquisition_campaigns c LEFT JOIN public.acquisition_campaign_variants v ON v.campaign_id=c.id GROUP BY c.id ORDER BY c.created_at DESC`);
      return json(res, 200, { campaigns: result.rows });
    }

    const adminCampaignMatch = url.pathname.match(/^\/api\/admin\/acquisition\/campaigns\/([0-9a-f-]{36})$/i);
    if (adminCampaignMatch && req.method === 'PATCH') {
      const profile = await getSessionProfile(req, client);
      if (!profile) return json(res, 401, { error: 'Autenticação necessária.' });
      if (profile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
      const body = await readJson(req);
      const status = ['draft','active','paused','archived'].includes(body.status) ? body.status : null;
      const minimum = Math.round(Number(body.pricing?.minimumCents));
      const maximum = Math.round(Number(body.pricing?.maximumCents));
      const suggested = Math.round(Number(body.pricing?.suggestedCents));
      if (!status || !Number.isInteger(minimum) || minimum < 0 || !Number.isInteger(maximum) || maximum < minimum || !Number.isInteger(suggested) || suggested < minimum || suggested > maximum) throw error(400, 'Status ou limites econômicos inválidos.');
      await client.query('BEGIN');
      try {
        const campaign = (await client.query(`UPDATE public.acquisition_campaigns SET status=$2,headline=$3,subheadline=$4,updated_at=NOW() WHERE id=$1 RETURNING *`, [adminCampaignMatch[1], status, clean(body.headline, 180), clean(body.subheadline, 320)])).rows[0];
        if (!campaign) { await client.query('ROLLBACK'); return json(res, 404, { error: 'Campanha não encontrada.' }); }
        await client.query(`UPDATE public.acquisition_pricing_rules SET minimum_cents=$2,maximum_cents=$3,suggested_cents=$4,updated_at=NOW() WHERE campaign_id=$1 AND active=TRUE`, [campaign.id, minimum, maximum, suggested]);
        await client.query(`INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) VALUES($1,'acquisition.campaign_updated','acquisition_campaign',$2,$3)`, [profile.id, campaign.id, JSON.stringify({ status, minimumCents: minimum, maximumCents: maximum, suggestedCents: suggested })]);
        await client.query('COMMIT');
        return json(res, 200, { campaign });
      } catch (cause) { await client.query('ROLLBACK'); throw cause; }
    }

    return json(res, 404, { error: 'Rota de aquisição não encontrada.' });
  } catch (cause) {
    if (cause?.statusCode) return json(res, cause.statusCode, { error: cause.message, code: cause.code });
    throw cause;
  } finally {
    await client.end();
  }
}
