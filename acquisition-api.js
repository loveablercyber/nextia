import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSlidingWindowLimiter, requestIp } from './operational-guards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENT_NAMES = new Set(['campaign_view','configurator_started','segment_selected','preview_created','preview_viewed','preview_edited','pricing_viewed','addon_selected','lead_identified','demo_created','checkout_started','purchase_completed']);
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

function cleanServices(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map((item) => typeof item === 'string'
    ? { title: clean(item, 70), description: '' }
    : { title: clean(item?.title, 70), description: clean(item?.description, 220) })
    .filter((item) => item.title);
}

function cleanPreviewContent(value, businessName) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    eyebrow: clean(source.eyebrow, 80),
    headline: clean(source.headline || `${businessName}, mais perto dos seus clientes`, 140),
    description: clean(source.description || 'Uma presença digital profissional, rápida e preparada para gerar oportunidades.', 320),
    cta: clean(source.cta || 'Falar com a equipe', 50),
    aboutTitle: clean(source.aboutTitle, 100),
    aboutText: clean(source.aboutText, 420),
    servicesTitle: clean(source.servicesTitle || 'Soluções para você', 100),
    services: cleanServices(source.services),
    bookingTitle: clean(source.bookingTitle || 'Agende seu atendimento', 100),
    bookingText: clean(source.bookingText, 280),
    bookingButton: clean(source.bookingButton || 'Consultar horários', 50),
    phone: clean(source.phone, 30),
    whatsapp: String(source.whatsapp || '').replace(/\D/g, '').slice(0, 15),
    address: clean(source.address, 160),
  };
}

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
  const { dbClient, getSessionProfile, json, readJson, hashPassword, signToken, sessionCookie } = deps;
  const client = dbClient();
  await client.connect();
  try {
    await ensureAcquisitionSchema(client);
    if (!url.pathname.startsWith('/api/admin/') && !publicLimiter.allow(`acquisition:${requestIp(req)}`, url.pathname === '/api/acquisition/sessions' ? 10 : 60)) {
      return json(res, 429, { error: 'Muitas tentativas. Aguarde um minuto e tente novamente.', code: 'RATE_LIMITED' });
    }

    const publicDemoMatch = url.pathname.match(/^\/api\/acquisition\/demos\/([0-9a-f-]{36})$/i);
    if (publicDemoMatch && req.method === 'GET') {
      await client.query("UPDATE public.acquisition_preview_projects SET demo_status='expired',updated_at=NOW() WHERE share_key=$1 AND demo_status='active' AND expires_at<=NOW()", [publicDemoMatch[1]]);
      const result = await client.query(`SELECT p.segment_slug,p.template_slug,p.business_name,p.theme,p.content,p.revision,p.expires_at
        FROM public.acquisition_preview_projects p WHERE p.share_key=$1 AND p.demo_status='active' AND p.expires_at>NOW()`, [publicDemoMatch[1]]);
      if (!result.rows[0]) return json(res, 404, { error: 'Demonstração não encontrada ou expirada.', code: 'DEMO_EXPIRED' });
      return json(res, 200, { preview: result.rows[0] });
    }

    if (url.pathname === '/api/acquisition/my-demo' && req.method === 'GET') {
      const profile = await getSessionProfile(req, client);
      if (!profile) return json(res, 401, { error: 'Autenticação necessária.' });
      const result = await client.query(`SELECT p.share_key,p.business_name,p.segment_slug,p.expires_at,p.demo_status,p.engagement_id,
          s.public_key session_key,s.selected_plan_id,e.plan_name_snapshot,e.activation_amount_cents,e.monthly_amount_cents,
          COALESCE((SELECT json_agg(json_build_object('code',a.code,'name',a.name,'amount_cents',a.amount_cents,'billing_cycle',a.billing_cycle) ORDER BY a.name)
            FROM public.commercial_addons a WHERE a.code IN (SELECT jsonb_array_elements_text(s.selected_addons))),'[]') addons
        FROM public.acquisition_preview_projects p JOIN public.acquisition_funnel_sessions s ON s.id=p.session_id
        LEFT JOIN public.service_engagements e ON e.id=p.engagement_id
        WHERE p.owner_user_id=$1 ORDER BY p.created_at DESC LIMIT 1`, [profile.id]);
      const demo = result.rows[0];
      if (!demo) return json(res, 200, { demo: null });
      if (demo.demo_status === 'active' && new Date(demo.expires_at).getTime() <= Date.now()) {
        await client.query("UPDATE public.acquisition_preview_projects SET demo_status='expired',updated_at=NOW() WHERE share_key=$1", [demo.share_key]);
        if (demo.engagement_id) await client.query("UPDATE public.service_engagements SET status='demo_expired',updated_at=NOW() WHERE id=$1 AND status='demo_active'", [demo.engagement_id]);
        demo.demo_status = 'expired';
      }
      const availableAddons = (await client.query(`SELECT code,name,description,amount_cents,billing_cycle FROM public.commercial_addons
        WHERE active=TRUE AND (service_slug IS NULL OR service_slug='sites-prontos') AND $1=ANY(eligible_segments) ORDER BY name`, [demo.segment_slug])).rows;
      return json(res, 200, { demo: { ...demo, active: demo.demo_status === 'active' && new Date(demo.expires_at).getTime() > Date.now(), availableAddons, demoUrl: `/demonstracao/${demo.share_key}`, checkoutUrl: `/checkout?service=sites-prontos&plan=${encodeURIComponent(demo.selected_plan_id || '')}&funnel=${demo.session_key}` } });
    }

    if (url.pathname === '/api/acquisition/my-demo/configuration' && req.method === 'POST') {
      const profile = await getSessionProfile(req, client);
      if (!profile) return json(res, 401, { error: 'Autenticação necessária.' });
      const body = await readJson(req);
      const codes = Array.isArray(body.addonCodes) ? [...new Set(body.addonCodes.map((item) => clean(item,80)).filter(Boolean))].slice(0,12) : [];
      const record = (await client.query(`SELECT p.id preview_id,p.segment_slug,p.engagement_id,p.expires_at,p.demo_status,s.id session_id,s.selected_plan_id
        FROM public.acquisition_preview_projects p JOIN public.acquisition_funnel_sessions s ON s.id=p.session_id
        WHERE p.owner_user_id=$1 ORDER BY p.created_at DESC LIMIT 1 FOR UPDATE OF p,s`, [profile.id])).rows[0];
      if (!record) return json(res, 404, { error: 'Demonstração não encontrada.' });
      if (record.demo_status !== 'active' || new Date(record.expires_at).getTime() <= Date.now()) return json(res, 410, { error: 'Esta demonstração expirou.', code: 'DEMO_EXPIRED' });
      const plan = (await client.query('SELECT id,name,activation_amount_cents,monthly_amount_cents FROM public.commercial_plans WHERE id=$1 AND active=TRUE', [record.selected_plan_id])).rows[0];
      if (!plan) return json(res, 409, { error: 'Plano da demonstração indisponível.' });
      const addonRows = codes.length ? (await client.query(`SELECT code,name,description,amount_cents,billing_cycle FROM public.commercial_addons
        WHERE active=TRUE AND code=ANY($1) AND (service_slug IS NULL OR service_slug='sites-prontos') AND $2=ANY(eligible_segments)`, [codes,record.segment_slug])).rows : [];
      const validCodes = addonRows.map((item)=>item.code);
      const activationTotal = Number(plan.activation_amount_cents)+addonRows.filter((item)=>item.billing_cycle!=='monthly').reduce((sum,item)=>sum+Number(item.amount_cents),0);
      const monthlyTotal = Number(plan.monthly_amount_cents)+addonRows.filter((item)=>item.billing_cycle==='monthly').reduce((sum,item)=>sum+Number(item.amount_cents),0);
      await client.query('BEGIN');
      try {
        await client.query('UPDATE public.acquisition_funnel_sessions SET selected_addons=$2,selected_amount_cents=$3,last_activity_at=NOW(),updated_at=NOW() WHERE id=$1',[record.session_id,JSON.stringify(validCodes),Number(plan.activation_amount_cents)]);
        if (record.engagement_id) await client.query('UPDATE public.service_engagements SET activation_amount_cents=$2,monthly_amount_cents=$3,updated_at=NOW() WHERE id=$1',[record.engagement_id,activationTotal,monthlyTotal]);
        await client.query('COMMIT');
        return json(res,200,{saved:true,addons:addonRows,activationTotalCents:activationTotal,monthlyTotalCents:monthlyTotal});
      } catch (cause) { await client.query('ROLLBACK'); throw cause; }
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
      return json(res, 200, { session: { publicKey: session.public_key, status: session.status, currentStep: session.current_step, configuration: session.configuration, selectedAddons: session.selected_addons, selectedAmountCents: session.selected_amount_cents, selectedPlanId: session.selected_plan_id, variantCode: session.variant_code, expiresAt: session.expires_at }, preview, pricing });
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
      const content = cleanPreviewContent(body.content, businessName);
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
      const planId = clean(body.planId, 30);
      const plan = (await client.query('SELECT id,name,monthly_amount_cents,activation_amount_cents FROM public.commercial_plans WHERE id=$1 AND active=TRUE', [planId])).rows[0];
      if (!plan) throw error(400, 'Escolha um plano válido.', 'INVALID_PLAN');
      const preview = (await client.query('SELECT segment_slug FROM public.acquisition_preview_projects WHERE session_id=$1', [session.id])).rows[0];
      if (!preview) throw error(409, 'Crie a prévia antes de selecionar o plano.', 'PREVIEW_REQUIRED');
      const addons = Array.isArray(body.addonCodes) ? [...new Set(body.addonCodes.map((item) => clean(item, 80)).filter(Boolean))].slice(0, 12) : [];
      const addonRows = addons.length ? (await client.query(`SELECT code,name,description,amount_cents,billing_cycle FROM public.commercial_addons
        WHERE active=TRUE AND code=ANY($1) AND (service_slug IS NULL OR service_slug='sites-prontos')
          AND $2=ANY(eligible_segments)`, [addons, preview.segment_slug])).rows : [];
      const activationAddons = addonRows.filter((item) => item.billing_cycle !== 'monthly').reduce((sum, item) => sum + Number(item.amount_cents), 0);
      const monthlyAddons = addonRows.filter((item) => item.billing_cycle === 'monthly').reduce((sum, item) => sum + Number(item.amount_cents), 0);
      const validAddonCodes = addonRows.map((item) => item.code);
      await client.query("UPDATE public.acquisition_funnel_sessions SET selected_plan_id=$2,selected_amount_cents=$3,selected_addons=$4,current_step='pricing',status='priced',last_activity_at=NOW(),updated_at=NOW() WHERE id=$1", [session.id, plan.id, Number(plan.activation_amount_cents), JSON.stringify(validAddonCodes)]);
      await appendEvent(client, session, 'pricing_viewed', { planId: plan.id, activationCents: Number(plan.activation_amount_cents), addonCount: addonRows.length }, 'pricing_viewed');
      return json(res, 200, { currency: 'BRL', selectedPlanId: plan.id, planName: plan.name, selectedAmountCents: Number(plan.activation_amount_cents), activationTotalCents: Number(plan.activation_amount_cents) + activationAddons, monthlyTotalCents: Number(plan.monthly_amount_cents) + monthlyAddons, addons: addonRows });
    }

    if (url.pathname.match(/^\/api\/acquisition\/sessions\/[0-9a-f-]{36}\/demo-account$/i) && req.method === 'POST') {
      const body = await readJson(req);
      const session = await loadSession(client, req, url.pathname, true);
      if (body.acceptedTerms !== true) throw error(400, 'Aceite os termos para criar a conta e a demonstração.', 'TERMS_REQUIRED');
      const name = clean(body.name, 100);
      const contactEmail = email(body.email);
      const contactPhone = phone(body.phone);
      if (name.length < 2 || !contactEmail) throw error(400, 'Informe nome e e-mail válido.');
      if (!session.selected_plan_id) throw error(409, 'Escolha um plano antes de criar a demonstração.', 'PLAN_REQUIRED');
      const preview = (await client.query('SELECT * FROM public.acquisition_preview_projects WHERE session_id=$1 FOR UPDATE', [session.id])).rows[0];
      if (!preview) throw error(409, 'Crie a prévia antes de continuar.', 'PREVIEW_REQUIRED');
      const plan = (await client.query('SELECT * FROM public.commercial_plans WHERE id=$1 AND active=TRUE', [session.selected_plan_id])).rows[0];
      if (!plan) throw error(409, 'O plano selecionado não está disponível.', 'PLAN_UNAVAILABLE');
      const currentProfile = await getSessionProfile(req, client);
      const existing = (await client.query('SELECT id,email FROM public.profiles WHERE lower(email)=lower($1)', [contactEmail])).rows[0];
      if (existing && currentProfile?.id !== existing.id) throw error(409, 'Este e-mail já possui uma conta.', 'ACCOUNT_EXISTS');
      if (currentProfile && currentProfile.email && currentProfile.email.toLowerCase() !== contactEmail) throw error(409, 'Use o mesmo e-mail da conta conectada.', 'ACCOUNT_EMAIL_MISMATCH');

      let userId = existing?.id || currentProfile?.id || null;
      let temporaryPassword = null;
      let accountCreated = false;
      let authToken = null;
      await client.query('BEGIN');
      try {
        if (!userId) {
          userId = randomUUID();
          temporaryPassword = `Nx!${randomBytes(9).toString('base64url')}`;
          const initials = name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0,2).join('').toUpperCase() || 'NX';
          await client.query(`INSERT INTO public.profiles(id,email,name,company,phone,role,avatar_initials) VALUES($1,$2,$3,$4,$5,'client',$6)`, [userId, contactEmail, name, preview.business_name, contactPhone || '', initials]);
          await client.query(`INSERT INTO public.local_auth_users(id,password_hash,must_change_password,temporary_password_expires_at) VALUES($1,$2,TRUE,NOW()+INTERVAL '24 hours')`, [userId, hashPassword(temporaryPassword)]);
          authToken = signToken({ sub: userId, exp: Math.floor(Date.now()/1000) + 7*24*60*60 });
          accountCreated = true;
        }
        const addonRows = session.selected_addons?.length ? (await client.query('SELECT amount_cents,billing_cycle FROM public.commercial_addons WHERE active=TRUE AND code=ANY($1)', [session.selected_addons])).rows : [];
        const activationTotal = Number(plan.activation_amount_cents) + addonRows.filter((item)=>item.billing_cycle!=='monthly').reduce((sum,item)=>sum+Number(item.amount_cents),0);
        const monthlyTotal = Number(plan.monthly_amount_cents) + addonRows.filter((item)=>item.billing_cycle==='monthly').reduce((sum,item)=>sum+Number(item.amount_cents),0);
        const engagement = await client.query(`INSERT INTO public.service_engagements(public_code,user_id,service_slug,service_name_snapshot,service_category,segment_slug,segment_name_snapshot,template_slug_snapshot,template_name_snapshot,plan_id,plan_name_snapshot,workflow_key,execution_mode,status,source_kind,activation_amount_cents,monthly_amount_cents,demo_session_id)
          VALUES($1,$2,'sites-prontos','Site profissional','digital',$3,$4,$5,$6,$7,$8,'site_ready_v1','client_admin','demo_active','demo',$9,$10,$11)
          ON CONFLICT(demo_session_id) WHERE demo_session_id IS NOT NULL DO UPDATE SET user_id=EXCLUDED.user_id,plan_id=EXCLUDED.plan_id,plan_name_snapshot=EXCLUDED.plan_name_snapshot,activation_amount_cents=EXCLUDED.activation_amount_cents,monthly_amount_cents=EXCLUDED.monthly_amount_cents,updated_at=NOW() RETURNING id`,
        [`DEMO-${randomUUID().slice(0,8).toUpperCase()}`,userId,preview.segment_slug,clean(preview.segment_slug.replace(/-/g,' '),80),preview.template_slug,preview.business_name,plan.id,plan.name,activationTotal,monthlyTotal,session.id]);
        await client.query(`UPDATE public.acquisition_preview_projects SET owner_user_id=$2,engagement_id=$3,demo_status='active',expires_at=LEAST(expires_at,NOW()+INTERVAL '7 days'),updated_at=NOW() WHERE id=$1`, [preview.id,userId,engagement.rows[0].id]);
        await client.query(`UPDATE public.acquisition_funnel_sessions SET user_id=$2,consent_recovery=$3,accepted_terms_at=NOW(),demo_created_at=COALESCE(demo_created_at,NOW()),current_step='complete',last_activity_at=NOW(),updated_at=NOW() WHERE id=$1`, [session.id,userId,body.consentRecovery===true]);
        if (body.consentRecovery === true) await client.query(`INSERT INTO public.acquisition_abandonment_contacts(session_id,name,email,phone,consented_at) VALUES($1,$2,$3,$4,NOW()) ON CONFLICT(session_id) DO UPDATE SET name=EXCLUDED.name,email=EXCLUDED.email,phone=EXCLUDED.phone,consented_at=NOW(),revoked_at=NULL,updated_at=NOW()`, [session.id,name,contactEmail,contactPhone||null]);
        await appendEvent(client, session, 'demo_created', { planId: plan.id, segment: preview.segment_slug }, 'demo_created');
        await client.query('COMMIT');
        const headers = authToken ? { 'Set-Cookie': sessionCookie(authToken) } : {};
        return json(res, 201, { demoUrl:`/demonstracao/${preview.share_key}`,expiresAt:preview.expires_at,dashboardUrl:'/painel',email:contactEmail,temporaryPassword,accountCreated,planName:plan.name,activationTotalCents:activationTotal,monthlyTotalCents:monthlyTotal }, headers);
      } catch (cause) { await client.query('ROLLBACK'); throw cause; }
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
