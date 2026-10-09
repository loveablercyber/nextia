import { randomUUID } from 'node:crypto';
import { createSlidingWindowLimiter, requestIp } from './operational-guards.js';

const SITE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_SEGMENTS = new Set(['contabilidade','advocacia','clinicas','restaurantes','hoteis','saloes-de-beleza','prestadores-de-servicos','lojas']);
const publicContactLimiter = createSlidingWindowLimiter({ windowMs: 60_000 });

export function isSitePlatformApiPath(pathname) {
  return pathname.startsWith('/api/sites') || pathname.startsWith('/api/public/sites/');
}

export async function ensureSitePlatformSchema(client) {
  const result = await client.query("SELECT to_regclass('public.site_instances') ready");
  if (!result.rows[0]?.ready) {
    const cause = new Error('A plataforma de sites ainda não foi migrada. Execute as migrations pendentes.');
    cause.statusCode = 503;
    cause.code = 'SITE_PLATFORM_MIGRATION_REQUIRED';
    throw cause;
  }
}

function clean(value, max = 160) {
  return String(value || '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanContent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const serialized = JSON.stringify(value);
  if (Buffer.byteLength(serialized, 'utf8') > 256 * 1024) return null;
  return value;
}

async function organizationForOwner(client, userId, name) {
  const membership = await client.query(`SELECT o.id FROM public.organizations o
    JOIN public.organization_members m ON m.organization_id=o.id
    WHERE m.user_id=$1 AND m.status='active' ORDER BY (m.role='owner') DESC,o.created_at LIMIT 1`, [userId]);
  if (membership.rows[0]) return membership.rows[0].id;
  const slug = `org-${String(userId).slice(0, 8)}`;
  const organization = await client.query(`INSERT INTO public.organizations(slug,name,owner_user_id)
    VALUES($1,$2,$3) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,updated_at=NOW() RETURNING id`, [slug, clean(name, 100) || 'Minha empresa', userId]);
  await client.query(`INSERT INTO public.organization_members(organization_id,user_id,role,status)
    VALUES($1,$2,'owner','active') ON CONFLICT(organization_id,user_id) DO UPDATE SET role='owner',status='active',updated_at=NOW()`, [organization.rows[0].id, userId]);
  return organization.rows[0].id;
}

export async function provisionSiteFromPreview(client, { preview, session, userId, engagementId }) {
  await ensureSitePlatformSchema(client);
  const organizationId = await organizationForOwner(client, userId, preview.business_name);
  const site = await client.query(`INSERT INTO public.site_instances(
      organization_id,acquisition_preview_id,engagement_id,public_key,slug,business_name,segment_slug,template_slug,
      lifecycle_status,selected_plan_id,demo_experience_plan_id,theme,content_revision,demo_expires_at
    ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'demo',$9,'pro',$10,$11,$12)
    ON CONFLICT(acquisition_preview_id) DO UPDATE SET organization_id=EXCLUDED.organization_id,
      engagement_id=EXCLUDED.engagement_id,business_name=EXCLUDED.business_name,segment_slug=EXCLUDED.segment_slug,
      template_slug=EXCLUDED.template_slug,lifecycle_status='demo',selected_plan_id=EXCLUDED.selected_plan_id,
      theme=EXCLUDED.theme,content_revision=EXCLUDED.content_revision,demo_expires_at=EXCLUDED.demo_expires_at,updated_at=NOW()
    RETURNING *`, [organizationId,preview.id,engagementId,preview.share_key,`site-${String(preview.id).slice(0,8)}`,
      preview.business_name,preview.segment_slug,preview.template_slug,session.selected_plan_id,JSON.stringify(preview.theme || {}),
      Math.max(1,Number(preview.revision)||1),preview.expires_at]);
  const current = site.rows[0];
  await client.query(`INSERT INTO public.site_content(site_id,content,updated_by)
    VALUES($1,$2,$3) ON CONFLICT(site_id) DO UPDATE SET content=EXCLUDED.content,updated_by=EXCLUDED.updated_by,updated_at=NOW()`,
  [current.id, JSON.stringify(preview.content || {}), userId]);
  await client.query(`INSERT INTO public.site_content_revisions(site_id,revision,segment_slug,template_slug,theme,content,reason,created_by)
    VALUES($1,$2,$3,$4,$5,$6,'demo_created',$7) ON CONFLICT(site_id,revision) DO NOTHING`,
  [current.id,current.content_revision,current.segment_slug,current.template_slug,JSON.stringify(current.theme),JSON.stringify(preview.content || {}),userId]);
  await client.query(`INSERT INTO public.site_modules(site_id,module_code,enabled,source)
    SELECT $1,m.code,TRUE,'demo' FROM public.module_definitions m
    WHERE m.active=TRUE AND m.demo_available=TRUE AND (cardinality(m.eligible_segments)=0 OR $2=ANY(m.eligible_segments))
    ON CONFLICT(site_id,module_code) DO UPDATE SET enabled=TRUE,source='demo',updated_at=NOW()`, [current.id,current.segment_slug]);
  await client.query(`DELETE FROM public.site_modules sm USING public.module_definitions m
    WHERE sm.site_id=$1 AND sm.module_code=m.code AND cardinality(m.eligible_segments)>0 AND NOT ($2=ANY(m.eligible_segments))`, [current.id,current.segment_slug]);
  await client.query('DELETE FROM public.site_addons WHERE site_id=$1', [current.id]);
  if (Array.isArray(session.selected_addons) && session.selected_addons.length) {
    await client.query(`INSERT INTO public.site_addons(site_id,addon_code,status)
      SELECT $1,code,'selected' FROM public.commercial_addons WHERE code=ANY($2)
      ON CONFLICT(site_id,addon_code) DO UPDATE SET status='selected',updated_at=NOW()`, [current.id,session.selected_addons]);
  }
  return current;
}

async function requireSite(client, profile, siteId, lock = false) {
  if (!profile || !SITE_ID.test(siteId)) return null;
  const result = await client.query(`SELECT si.*,m.role,sc.content
    FROM public.site_instances si
    JOIN public.organization_members m ON m.organization_id=si.organization_id AND m.user_id=$2 AND m.status='active'
    LEFT JOIN public.site_content sc ON sc.site_id=si.id
    WHERE si.id=$1 ${lock ? 'FOR UPDATE OF si' : ''}`, [siteId,profile.id]);
  return result.rows[0] || null;
}

async function sitePayload(client, site) {
  const [modules, addons] = await Promise.all([
    client.query(`SELECT m.code,m.name,m.description,m.category,sm.enabled,sm.source,sm.configuration
      FROM public.module_definitions m LEFT JOIN public.site_modules sm ON sm.module_code=m.code AND sm.site_id=$1
      WHERE m.active=TRUE AND (cardinality(m.eligible_segments)=0 OR $2=ANY(m.eligible_segments)) ORDER BY m.sort_order,m.name`, [site.id,site.segment_slug]),
    client.query(`SELECT a.code,a.name,a.description,a.amount_cents,a.billing_cycle,sa.status
      FROM public.site_addons sa JOIN public.commercial_addons a ON a.code=sa.addon_code WHERE sa.site_id=$1 ORDER BY a.name`, [site.id]),
  ]);
  return { ...site, modules: modules.rows, addons: addons.rows, demoUrl: `/demonstracao/${site.public_key}` };
}

export async function handleSitePlatformApi(req, res, url, deps) {
  const { dbClient, getSessionProfile, json, readJson } = deps;
  const client = dbClient();
  await client.connect();
  try {
    await ensureSitePlatformSchema(client);

    const publicContactMatch = url.pathname.match(/^\/api\/public\/sites\/([0-9a-f-]{36})\/contact$/i);
    if (publicContactMatch && req.method === 'POST') {
      if (!publicContactLimiter.allow(`site-contact:${publicContactMatch[1]}:${requestIp(req)}`, 10)) {
        return json(res,429,{error:'Muitas mensagens em pouco tempo. Aguarde um minuto e tente novamente.',code:'RATE_LIMITED'});
      }
      const body = await readJson(req);
      const name = clean(body.name,100);
      const email = clean(body.email,180).toLowerCase();
      const phone = clean(body.phone,40);
      const message = clean(body.message,4000);
      const subject = clean(body.subject,160) || 'Contato pelo site';
      if (name.length < 2 || (!email && !phone) || message.length < 3 || body.consent !== true) {
        return json(res,400,{error:'Informe nome, e-mail ou telefone, mensagem e aceite o uso dos dados para atendimento.'});
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res,400,{error:'Informe um e-mail válido.'});
      const site = (await client.query(`SELECT si.id,si.business_name FROM public.site_instances si
        JOIN public.site_modules sm ON sm.site_id=si.id AND sm.module_code='contact-form' AND sm.enabled=TRUE
        WHERE si.public_key=$1 AND (si.lifecycle_status='active' OR (si.lifecycle_status='demo' AND si.demo_expires_at>NOW()))`, [publicContactMatch[1]])).rows[0];
      if (!site) return json(res,404,{error:'Formulário indisponível neste site.',code:'SITE_CONTACT_UNAVAILABLE'});
      await client.query('BEGIN');
      try {
        let contact = (await client.query(`SELECT id FROM public.site_contacts WHERE site_id=$1
          AND (($2<>'' AND LOWER(email)=$2) OR ($3<>'' AND phone=$3)) ORDER BY updated_at DESC LIMIT 1`, [site.id,email,phone])).rows[0];
        if (contact) {
          await client.query(`UPDATE public.site_contacts SET name=$2,email=NULLIF($3,''),phone=NULLIF($4,''),consent_at=NOW(),updated_at=NOW() WHERE id=$1`, [contact.id,name,email,phone]);
        } else {
          contact = (await client.query(`INSERT INTO public.site_contacts(site_id,name,email,phone,consent_at)
            VALUES($1,$2,NULLIF($3,''),NULLIF($4,''),NOW()) RETURNING id`, [site.id,name,email,phone])).rows[0];
        }
        const conversation = (await client.query(`INSERT INTO public.site_conversations(site_id,contact_id,public_code,channel,subject)
          VALUES($1,$2,$3,'web_form',$4) RETURNING id,public_code`, [site.id,contact.id,`MSG-${randomUUID().slice(0,8).toUpperCase()}`,subject])).rows[0];
        await client.query(`INSERT INTO public.site_messages(conversation_id,direction,sender_contact_id,body,delivery_status)
          VALUES($1,'inbound',$2,$3,'received')`, [conversation.id,contact.id,message]);
        await client.query(`INSERT INTO public.notifications(user_id,title,message,type)
          SELECT m.user_id,'Nova mensagem pelo site',$2,'info' FROM public.organization_members m
          JOIN public.site_instances si ON si.organization_id=m.organization_id
          WHERE si.id=$1 AND m.status='active'`, [site.id,`${name} enviou uma mensagem para ${site.business_name}.`]);
        await client.query('COMMIT');
        return json(res,201,{received:true,reference:conversation.public_code,message:'Mensagem recebida. A equipe poderá responder pelos dados informados.'});
      } catch (cause) { await client.query('ROLLBACK'); throw cause; }
    }

    const publicMatch = url.pathname.match(/^\/api\/public\/sites\/([0-9a-f-]{36})$/i);
    if (publicMatch && req.method === 'GET') {
      await client.query(`UPDATE public.site_instances SET lifecycle_status='archived',updated_at=NOW()
        WHERE public_key=$1 AND lifecycle_status='demo' AND demo_expires_at<=NOW()`, [publicMatch[1]]);
      const result = await client.query(`SELECT si.id,si.public_key,si.business_name,si.segment_slug,si.segment_subtype,si.template_slug,
          si.lifecycle_status,si.selected_plan_id,si.demo_experience_plan_id,si.theme,si.content_revision revision,
          si.demo_expires_at expires_at,sc.content
        FROM public.site_instances si JOIN public.site_content sc ON sc.site_id=si.id
        WHERE si.public_key=$1 AND (si.lifecycle_status='active' OR (si.lifecycle_status='demo' AND si.demo_expires_at>NOW()))`, [publicMatch[1]]);
      if (!result.rows[0]) return json(res,404,{error:'Site não encontrado ou demonstração expirada.',code:'SITE_UNAVAILABLE'});
      const site = result.rows[0];
      const modules = (await client.query('SELECT module_code code,enabled FROM public.site_modules WHERE site_id=$1 ORDER BY module_code', [site.id])).rows;
      return json(res,200,{site:{...site,modules},preview:{...site,modules}});
    }

    const profile = await getSessionProfile(req, client);
    if (!profile) return json(res,401,{error:'Autenticação necessária.'});

    if (url.pathname === '/api/sites/me' && req.method === 'GET') {
      const result = await client.query(`SELECT si.*,m.role,sc.content
        FROM public.site_instances si JOIN public.organization_members m ON m.organization_id=si.organization_id
        LEFT JOIN public.site_content sc ON sc.site_id=si.id
        WHERE m.user_id=$1 AND m.status='active' ORDER BY si.updated_at DESC`, [profile.id]);
      return json(res,200,{sites:await Promise.all(result.rows.map((site)=>sitePayload(client,site)))});
    }

    const siteMatch = url.pathname.match(/^\/api\/sites\/([0-9a-f-]{36})$/i);
    if (siteMatch && req.method === 'GET') {
      const site = await requireSite(client,profile,siteMatch[1]);
      return site ? json(res,200,{site:await sitePayload(client,site)}) : json(res,404,{error:'Site não encontrado.'});
    }

    const conversationsMatch = url.pathname.match(/^\/api\/sites\/([0-9a-f-]{36})\/conversations$/i);
    if (conversationsMatch && req.method === 'GET') {
      const site = await requireSite(client,profile,conversationsMatch[1]);
      if (!site) return json(res,404,{error:'Site não encontrado.'});
      const result = await client.query(`SELECT c.id,c.public_code,c.channel,c.subject,c.status,c.last_message_at,c.created_at,
          ct.name contact_name,ct.email contact_email,ct.phone contact_phone,
          (SELECT body FROM public.site_messages sm WHERE sm.conversation_id=c.id ORDER BY sm.created_at DESC LIMIT 1) last_message,
          (SELECT COUNT(*)::int FROM public.site_messages sm WHERE sm.conversation_id=c.id) message_count
        FROM public.site_conversations c JOIN public.site_contacts ct ON ct.id=c.contact_id
        WHERE c.site_id=$1 ORDER BY c.last_message_at DESC LIMIT 200`, [site.id]);
      return json(res,200,{conversations:result.rows});
    }

    const conversationMatch = url.pathname.match(/^\/api\/sites\/([0-9a-f-]{36})\/conversations\/([0-9a-f-]{36})$/i);
    if (conversationMatch && req.method === 'GET') {
      const site = await requireSite(client,profile,conversationMatch[1]);
      if (!site) return json(res,404,{error:'Site não encontrado.'});
      const conversation = (await client.query(`SELECT c.*,ct.name contact_name,ct.email contact_email,ct.phone contact_phone
        FROM public.site_conversations c JOIN public.site_contacts ct ON ct.id=c.contact_id
        WHERE c.id=$1 AND c.site_id=$2`, [conversationMatch[2],site.id])).rows[0];
      if (!conversation) return json(res,404,{error:'Conversa não encontrada.'});
      const messages = (await client.query(`SELECT id,direction,body,delivery_status,created_at FROM public.site_messages
        WHERE conversation_id=$1 ORDER BY created_at`, [conversation.id])).rows;
      return json(res,200,{conversation,messages});
    }

    const replyMatch = url.pathname.match(/^\/api\/sites\/([0-9a-f-]{36})\/conversations\/([0-9a-f-]{36})\/messages$/i);
    if (replyMatch && req.method === 'POST') {
      const body = await readJson(req);
      const message = clean(body.message,4000);
      if (message.length < 2) return json(res,400,{error:'Escreva uma resposta antes de enviar.'});
      const site = await requireSite(client,profile,replyMatch[1]);
      if (!site) return json(res,404,{error:'Site não encontrado.'});
      if (!['owner','admin','editor','attendant'].includes(site.role)) return json(res,403,{error:'Sem permissão para responder mensagens.'});
      const conversation = (await client.query('SELECT id,channel FROM public.site_conversations WHERE id=$1 AND site_id=$2', [replyMatch[2],site.id])).rows[0];
      if (!conversation) return json(res,404,{error:'Conversa não encontrada.'});
      await client.query('BEGIN');
      try {
        const sent = (await client.query(`INSERT INTO public.site_messages(conversation_id,direction,sender_user_id,body,delivery_status)
          VALUES($1,'outbound',$2,$3,'queued') RETURNING id,direction,body,delivery_status,created_at`, [conversation.id,profile.id,message])).rows[0];
        await client.query(`UPDATE public.site_conversations SET status='pending',last_message_at=NOW(),updated_at=NOW() WHERE id=$1`, [conversation.id]);
        await client.query(`INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key)
          VALUES('site_conversation',$1,'site.message_reply_requested',$2,$3) ON CONFLICT(idempotency_key) DO NOTHING`,
        [conversation.id,JSON.stringify({siteId:site.id,conversationId:conversation.id,messageId:sent.id,channel:conversation.channel}),`site.message_reply_requested:${sent.id}`]);
        await client.query('COMMIT');
        return json(res,201,{message:sent,delivery:{status:'queued',providerRequired:true,notice:'A resposta foi registrada. O envio externo requer um provedor de e-mail ou WhatsApp configurado.'}});
      } catch (cause) { await client.query('ROLLBACK'); throw cause; }
    }

    if (conversationMatch && req.method === 'PATCH') {
      const body = await readJson(req);
      const status = clean(body.status,20);
      if (!['open','pending','resolved','archived'].includes(status)) return json(res,400,{error:'Status inválido.'});
      const site = await requireSite(client,profile,conversationMatch[1]);
      if (!site) return json(res,404,{error:'Site não encontrado.'});
      if (!['owner','admin','editor','attendant'].includes(site.role)) return json(res,403,{error:'Sem permissão para alterar esta conversa.'});
      const result = await client.query(`UPDATE public.site_conversations SET status=$3,updated_at=NOW()
        WHERE id=$1 AND site_id=$2 RETURNING id,status`, [conversationMatch[2],site.id,status]);
      return result.rows[0] ? json(res,200,{conversation:result.rows[0]}) : json(res,404,{error:'Conversa não encontrada.'});
    }

    const contentMatch = url.pathname.match(/^\/api\/sites\/([0-9a-f-]{36})\/content$/i);
    if (contentMatch && req.method === 'PATCH') {
      const body = await readJson(req);
      const content = cleanContent(body.content);
      if (!content) return json(res,400,{error:'Conteúdo inválido ou muito grande.'});
      await client.query('BEGIN');
      try {
        const site = await requireSite(client,profile,contentMatch[1],true);
        if (!site) { await client.query('ROLLBACK'); return json(res,404,{error:'Site não encontrado.'}); }
        if (!['owner','admin','editor'].includes(site.role)) { await client.query('ROLLBACK'); return json(res,403,{error:'Sem permissão para editar este site.'}); }
        if (body.revision !== undefined && Number(body.revision) !== Number(site.content_revision)) {
          await client.query('ROLLBACK'); return json(res,409,{error:'O site foi alterado em outra sessão. Recarregue antes de salvar.',code:'REVISION_CONFLICT'});
        }
        const revision = Number(site.content_revision)+1;
        const theme = body.theme && typeof body.theme==='object' && !Array.isArray(body.theme) ? body.theme : site.theme;
        const businessName = clean(body.businessName || site.business_name,100);
        await client.query('UPDATE public.site_instances SET content_revision=$2,theme=$3,business_name=$4,updated_at=NOW() WHERE id=$1', [site.id,revision,JSON.stringify(theme),businessName]);
        await client.query(`INSERT INTO public.site_content(site_id,content,updated_by) VALUES($1,$2,$3)
          ON CONFLICT(site_id) DO UPDATE SET content=EXCLUDED.content,updated_by=EXCLUDED.updated_by,updated_at=NOW()`, [site.id,JSON.stringify(content),profile.id]);
        await client.query(`INSERT INTO public.site_content_revisions(site_id,revision,segment_slug,template_slug,theme,content,reason,created_by)
          VALUES($1,$2,$3,$4,$5,$6,'manual_save',$7)`, [site.id,revision,site.segment_slug,site.template_slug,JSON.stringify(theme),JSON.stringify(content),profile.id]);
        await client.query('COMMIT');
        return json(res,200,{saved:true,revision});
      } catch (cause) { await client.query('ROLLBACK'); throw cause; }
    }

    const segmentMatch = url.pathname.match(/^\/api\/sites\/([0-9a-f-]{36})\/change-segment$/i);
    if (segmentMatch && req.method === 'POST') {
      const body = await readJson(req);
      const segment = clean(body.segmentSlug,80);
      const template = clean(body.templateSlug,100);
      const content = cleanContent(body.content);
      if (!ALLOWED_SEGMENTS.has(segment) || !template || !content || body.replaceContent !== true) {
        return json(res,400,{error:'Troca de segmento inválida. O novo conteúdo completo é obrigatório.'});
      }
      await client.query('BEGIN');
      try {
        const site = await requireSite(client,profile,segmentMatch[1],true);
        if (!site) { await client.query('ROLLBACK'); return json(res,404,{error:'Site não encontrado.'}); }
        if (!['owner','admin','editor'].includes(site.role)) { await client.query('ROLLBACK'); return json(res,403,{error:'Sem permissão para alterar este site.'}); }
        const revision = Number(site.content_revision)+1;
        const theme = body.theme && typeof body.theme==='object' ? body.theme : site.theme;
        await client.query(`UPDATE public.site_instances SET segment_slug=$2,segment_subtype=$3,template_slug=$4,theme=$5,
          content_revision=$6,updated_at=NOW() WHERE id=$1`, [site.id,segment,clean(body.segmentSubtype,80)||null,template,JSON.stringify(theme),revision]);
        await client.query(`INSERT INTO public.site_content(site_id,content,updated_by) VALUES($1,$2,$3)
          ON CONFLICT(site_id) DO UPDATE SET content=EXCLUDED.content,updated_by=EXCLUDED.updated_by,updated_at=NOW()`, [site.id,JSON.stringify(content),profile.id]);
        await client.query(`INSERT INTO public.site_content_revisions(site_id,revision,segment_slug,template_slug,theme,content,reason,created_by)
          VALUES($1,$2,$3,$4,$5,$6,'segment_changed',$7)`, [site.id,revision,segment,template,JSON.stringify(theme),JSON.stringify(content),profile.id]);
        await client.query(`DELETE FROM public.site_modules sm USING public.module_definitions m WHERE sm.site_id=$1
          AND sm.module_code=m.code AND cardinality(m.eligible_segments)>0 AND NOT ($2=ANY(m.eligible_segments))`, [site.id,segment]);
        await client.query(`INSERT INTO public.site_modules(site_id,module_code,enabled,source)
          SELECT $1,m.code,TRUE,'demo' FROM public.module_definitions m WHERE m.active=TRUE AND m.demo_available=TRUE
          AND (cardinality(m.eligible_segments)=0 OR $2=ANY(m.eligible_segments))
          ON CONFLICT(site_id,module_code) DO UPDATE SET enabled=TRUE,source='demo',updated_at=NOW()`, [site.id,segment]);
        await client.query(`INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,metadata)
          VALUES($1,'site.segment_changed','site_instance',$2,$3)`, [profile.id,site.id,JSON.stringify({from:site.segment_slug,to:segment,revision})]);
        await client.query('COMMIT');
        return json(res,200,{saved:true,revision,segmentSlug:segment,templateSlug:template});
      } catch (cause) { await client.query('ROLLBACK'); throw cause; }
    }

    const moduleMatch = url.pathname.match(/^\/api\/sites\/([0-9a-f-]{36})\/modules\/([a-z0-9-]+)$/i);
    if (moduleMatch && req.method === 'PUT') {
      const body = await readJson(req);
      const site = await requireSite(client,profile,moduleMatch[1]);
      if (!site) return json(res,404,{error:'Site não encontrado.'});
      if (!['owner','admin'].includes(site.role)) return json(res,403,{error:'Sem permissão para alterar módulos.'});
      const definition = (await client.query(`SELECT * FROM public.module_definitions WHERE code=$1 AND active=TRUE
        AND (cardinality(eligible_segments)=0 OR $2=ANY(eligible_segments))`, [moduleMatch[2],site.segment_slug])).rows[0];
      if (!definition) return json(res,404,{error:'Módulo indisponível para este segmento.'});
      const enabled = body.enabled === true;
      if (site.lifecycle_status !== 'demo' && enabled) {
        const entitled = (await client.query(`SELECT 1 FROM public.plan_module_entitlements WHERE plan_id=$1 AND module_code=$2 AND enabled=TRUE`, [site.selected_plan_id,moduleMatch[2]])).rowCount > 0;
        if (!entitled) return json(res,409,{error:'Este módulo não está incluído no plano atual.',code:'MODULE_NOT_ENTITLED'});
      }
      await client.query(`INSERT INTO public.site_modules(site_id,module_code,enabled,source,configuration)
        VALUES($1,$2,$3,$4,$5) ON CONFLICT(site_id,module_code) DO UPDATE SET enabled=EXCLUDED.enabled,
        configuration=EXCLUDED.configuration,updated_at=NOW()`, [site.id,moduleMatch[2],enabled,site.lifecycle_status==='demo'?'demo':'plan',JSON.stringify(body.configuration && typeof body.configuration==='object' ? body.configuration : {})]);
      return json(res,200,{saved:true,moduleCode:moduleMatch[2],enabled});
    }

    return json(res,404,{error:'Rota de sites não encontrada.'});
  } catch (cause) {
    const status = Number(cause?.statusCode) || 500;
    return json(res,status,{error:status>=500?'Não foi possível processar o site agora.':cause.message,code:cause?.code || 'SITE_PLATFORM_ERROR',requestId:randomUUID()});
  } finally {
    await client.end();
  }
}
