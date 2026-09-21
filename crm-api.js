import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

let crmSchemaPromise;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEAD_STATUSES = new Set(['new', 'contact', 'qualified', 'won', 'lost', 'archived']);
const ACTIVITY_TYPES = new Set(['note', 'task', 'follow_up', 'call', 'email', 'whatsapp', 'meeting', 'proposal', 'other']);

function httpError(statusCode, message, code = 'CRM_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function requiredString(value, label, max = 300) {
  const normalized = String(value || '').trim();
  if (!normalized) throw httpError(400, `${label} e obrigatorio.`, 'VALIDATION_ERROR');
  return normalized.slice(0, max);
}

function optionalString(value, max = 5000) {
  const normalized = String(value || '').trim();
  return normalized ? normalized.slice(0, max) : null;
}

function uuid(value, label) {
  const normalized = String(value || '').trim();
  if (!UUID_RE.test(normalized)) throw httpError(400, `${label} invalido.`, 'VALIDATION_ERROR');
  return normalized;
}

function positiveInt(value, fallback, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) return fallback;
  return Math.min(number, max);
}

function moneyToCents(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0) throw httpError(400, 'Valor monetario invalido.', 'VALIDATION_ERROR');
  return Math.round(number * 100);
}

async function audit(client, actorId, action, entityType, entityId, metadata = {}) {
  await client.query(
    `INSERT INTO public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
     VALUES ($1,$2,$3,$4,$5)`,
    [actorId, action, entityType, String(entityId), JSON.stringify(metadata)],
  );
}

async function emitEvent(client, aggregateType, aggregateId, eventType, payload = {}, idempotencyKey = null) {
  await client.query(
    `INSERT INTO public.outbox_events(aggregate_type, aggregate_id, event_type, payload, idempotency_key)
     VALUES ($1,$2,$3,$4,$5) ON CONFLICT (idempotency_key) DO NOTHING`,
    [aggregateType, aggregateId, eventType, JSON.stringify(payload), idempotencyKey || `${eventType}:${aggregateId}`],
  );
}

export async function ensureCrmSchema(client) {
  if (!crmSchemaPromise) {
    crmSchemaPromise = (async () => {
      const requiredTables = ['crm_leads', 'crm_opportunities', 'crm_activities', 'crm_proposals'];
      const check = await client.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = ANY($1)`,
        [requiredTables],
      );
      if (check.rows.length === requiredTables.length) return;

      const migrationSql = readFileSync(join(process.cwd(), 'database', 'migrations', '0006_crm_module.sql'), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(migrationSql);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    })().catch((error) => {
      crmSchemaPromise = undefined;
      throw error;
    });
  }
  return crmSchemaPromise;
}

export function isCrmApiPath(pathname) {
  return pathname.startsWith('/api/admin/crm/');
}

export async function handleCrmApi(req, res, url, dependencies) {
  const { dbClient, getSessionProfile, json, readJson, calculateCommercialSelection } = dependencies;
  const client = dbClient();
  let mutationTransaction = false;
  await client.connect();
  try {
    await ensureCrmSchema(client);
    const sessionProfile = await getSessionProfile(req, client);
    if (!sessionProfile) return json(res, 401, { error: 'Nao autenticado.' });
    if (sessionProfile.role !== 'admin') return json(res, 403, { error: 'Acesso restrito a administradores.' });
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method || 'GET')) {
      await client.query('BEGIN');
      mutationTransaction = true;
    }
    const response = await crmRouter(req, res, url, { client, sessionProfile, json, readJson, calculateCommercialSelection });
    if (mutationTransaction) {
      await client.query('COMMIT');
      mutationTransaction = false;
    }
    return response;
  } catch (error) {
    if (mutationTransaction) await client.query('ROLLBACK').catch(() => undefined);
    console.error('[CRM API]', error);
    return json(res, error.statusCode || 500, {
      error: error.statusCode ? error.message : 'Falha interna no CRM.',
      code: error.code || 'CRM_INTERNAL_ERROR',
    });
  } finally {
    await client.end();
  }
}

async function crmRouter(req, res, url, context) {
  const { client, sessionProfile, json, readJson, calculateCommercialSelection } = context;
  const pathname = url.pathname;

  if (pathname === '/api/admin/crm/leads' && req.method === 'GET') {
    const page = positiveInt(url.searchParams.get('page'), 1, 100000);
    const limit = positiveInt(url.searchParams.get('limit'), 50, 100);
    const status = url.searchParams.get('status');
    const search = optionalString(url.searchParams.get('search'), 200);
    const source = optionalString(url.searchParams.get('source'), 100);
    const where = ['l.archived_at IS NULL'];
    const values = [];
    if (status && status !== 'all') {
      if (!LEAD_STATUSES.has(status)) throw httpError(400, 'Status de lead invalido.');
      values.push(status);
      where.push(`l.status = $${values.length}`);
    }
    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      where.push(`(LOWER(l.name) LIKE $${values.length} OR LOWER(COALESCE(l.email,'')) LIKE $${values.length}
        OR LOWER(COALESCE(l.company_name,'')) LIKE $${values.length} OR LOWER(l.public_code) LIKE $${values.length})`);
    }
    if (source) {
      values.push(source);
      where.push(`l.source = $${values.length}`);
    }
    const clause = `WHERE ${where.join(' AND ')}`;
    const [countResult, leadsResult] = await Promise.all([
      client.query(`SELECT COUNT(*)::int AS total FROM public.crm_leads l ${clause}`, values),
      client.query(
        `SELECT l.*, owner.name AS assigned_name,
                (SELECT COUNT(*)::int FROM public.crm_opportunities o WHERE o.lead_id=l.id) AS opportunity_count,
                (SELECT COUNT(*)::int FROM public.crm_activities a WHERE a.lead_id=l.id AND a.status='pending') AS pending_activities,
                (SELECT COUNT(*)::int FROM public.crm_lead_duplicate_candidates d WHERE d.lead_id=l.id AND d.status='pending') AS possible_duplicate_count
         FROM public.crm_leads l
         LEFT JOIN public.profiles owner ON owner.id=l.assigned_user_id
         ${clause} ORDER BY l.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, (page - 1) * limit],
      ),
    ]);
    return json(res, 200, { leads: leadsResult.rows, total: countResult.rows[0].total, page, limit });
  }

  const leadDetail = pathname.match(/^\/api\/admin\/crm\/leads\/([0-9a-f-]+)$/i);
  if (leadDetail && req.method === 'GET') {
    const leadId = uuid(leadDetail[1], 'Lead');
    const [lead, opportunities, activities, history, duplicates] = await Promise.all([
      client.query(`SELECT l.*, p.name AS assigned_name FROM public.crm_leads l LEFT JOIN public.profiles p ON p.id=l.assigned_user_id WHERE l.id=$1`, [leadId]),
      client.query(`SELECT o.*, s.name AS stage_name, s.color AS stage_color FROM public.crm_opportunities o JOIN public.crm_pipeline_stages s ON s.id=o.stage_id WHERE o.lead_id=$1 ORDER BY o.created_at DESC`, [leadId]),
      client.query(`SELECT * FROM public.crm_activities WHERE lead_id=$1 ORDER BY created_at DESC LIMIT 100`, [leadId]),
      client.query(`SELECT h.*, p.name AS actor_name FROM public.crm_lead_history h LEFT JOIN public.profiles p ON p.id=h.actor_id WHERE h.lead_id=$1 ORDER BY h.created_at DESC LIMIT 100`, [leadId]),
      client.query(`SELECT d.*, l.public_code, l.name, l.email, l.phone FROM public.crm_lead_duplicate_candidates d JOIN public.crm_leads l ON l.id=d.candidate_lead_id WHERE d.lead_id=$1 AND d.status='pending'`, [leadId]),
    ]);
    if (!lead.rows[0]) throw httpError(404, 'Lead nao encontrado.', 'NOT_FOUND');
    return json(res, 200, { lead: lead.rows[0], opportunities: opportunities.rows, activities: activities.rows, history: history.rows, duplicateCandidates: duplicates.rows });
  }

  if (pathname === '/api/admin/crm/leads/create' && req.method === 'POST') {
    const body = await readJson(req);
    const name = requiredString(body.name, 'Nome');
    const email = optionalString(body.email, 320)?.toLowerCase();
    const phone = optionalString(body.phone || body.whatsapp, 40);
    if (!email && !phone) throw httpError(400, 'Informe e-mail ou telefone.', 'VALIDATION_ERROR');
    const leadId = randomUUID();
    const publicCode = `LEAD-${randomUUID().slice(0, 8).toUpperCase()}`;
    try {
      const result = await client.query(
        `INSERT INTO public.crm_leads
          (id, public_code, name, email, phone, whatsapp, company_name, city_slug, segment_slug, service_slug,
           template_slug, plan_slug, source, source_detail, assigned_user_id, notes, first_touch_source,
           first_touch_at, last_touch_source, last_touch_at)
         VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$12,NOW(),$12,NOW()) RETURNING *`,
        [leadId, publicCode, name, email, phone, optionalString(body.companyName, 300), optionalString(body.citySlug, 120),
          optionalString(body.segmentSlug, 120), optionalString(body.serviceSlug, 160), optionalString(body.templateSlug, 160),
          optionalString(body.planSlug, 160), optionalString(body.source, 100) || 'manual', optionalString(body.sourceDetail, 500),
          body.assignedUserId ? uuid(body.assignedUserId, 'Responsavel') : sessionProfile.id, optionalString(body.notes)],
      );
      await client.query(`INSERT INTO public.crm_lead_history(lead_id, action, to_status, actor_id) VALUES ($1,'created','new',$2)`, [leadId, sessionProfile.id]);
      await flagDuplicates(client, leadId);
      await audit(client, sessionProfile.id, 'crm.lead.created', 'crm_lead', leadId, { publicCode });
      await emitEvent(client, 'crm_lead', leadId, 'lead.created', { publicCode });
      return json(res, 201, { lead: result.rows[0] });
    } catch (error) {
      throw error;
    }
  }

  if (pathname === '/api/admin/crm/leads/update' && req.method === 'PUT') {
    const body = await readJson(req);
    const leadId = uuid(body.id, 'Lead');
    const current = await client.query(`SELECT * FROM public.crm_leads WHERE id=$1 AND archived_at IS NULL`, [leadId]);
    if (!current.rows[0]) throw httpError(404, 'Lead nao encontrado.', 'NOT_FOUND');
    const status = body.status === undefined ? current.rows[0].status : String(body.status);
    if (!LEAD_STATUSES.has(status) || status === 'archived') throw httpError(400, 'Status de lead invalido.');
    const result = await client.query(
      `UPDATE public.crm_leads SET
        name=$2, email=$3, phone=$4, whatsapp=$4, company_name=$5, city_slug=$6, segment_slug=$7,
        service_slug=$8, template_slug=$9, plan_slug=$10, status=$11, score=$12, notes=$13,
        assigned_user_id=$14, qualified_at=CASE WHEN $11='qualified' THEN COALESCE(qualified_at,NOW()) ELSE qualified_at END,
        converted_at=CASE WHEN $11='won' THEN COALESCE(converted_at,NOW()) ELSE converted_at END, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [leadId, requiredString(body.name ?? current.rows[0].name, 'Nome'), optionalString(body.email ?? current.rows[0].email, 320)?.toLowerCase(),
        optionalString(body.phone ?? current.rows[0].phone, 40), optionalString(body.companyName ?? current.rows[0].company_name, 300),
        optionalString(body.citySlug ?? current.rows[0].city_slug, 120), optionalString(body.segmentSlug ?? current.rows[0].segment_slug, 120),
        optionalString(body.serviceSlug ?? current.rows[0].service_slug, 160), optionalString(body.templateSlug ?? current.rows[0].template_slug, 160),
        optionalString(body.planSlug ?? current.rows[0].plan_slug, 160), status, Math.max(0, Math.min(100, Number(body.score ?? current.rows[0].score))),
        optionalString(body.notes ?? current.rows[0].notes), body.assignedUserId ? uuid(body.assignedUserId, 'Responsavel') : current.rows[0].assigned_user_id],
    );
    if (status !== current.rows[0].status) {
      await client.query(`INSERT INTO public.crm_lead_history(lead_id, action, from_status, to_status, actor_id) VALUES ($1,'status_changed',$2,$3,$4)`, [leadId, current.rows[0].status, status, sessionProfile.id]);
    }
    await flagDuplicates(client, leadId);
    await audit(client, sessionProfile.id, 'crm.lead.updated', 'crm_lead', leadId, { status });
    await emitEvent(client, 'crm_lead', leadId, status === 'qualified' && current.rows[0].status !== 'qualified' ? 'lead.qualified' : 'lead.updated', { status }, `lead.${status === 'qualified' && current.rows[0].status !== 'qualified' ? 'qualified' : 'updated'}:${leadId}:${result.rows[0].updated_at}`);
    return json(res, 200, { lead: result.rows[0] });
  }

  if (pathname === '/api/admin/crm/leads/delete' && req.method === 'DELETE') {
    const body = await readJson(req);
    const leadId = uuid(body.id, 'Lead');
    const result = await client.query(
      `UPDATE public.crm_leads SET status='archived', archived_at=NOW(), updated_at=NOW()
       WHERE id=$1 AND archived_at IS NULL RETURNING id`, [leadId],
    );
    if (!result.rows[0]) throw httpError(404, 'Lead nao encontrado.', 'NOT_FOUND');
    await client.query(`INSERT INTO public.crm_lead_history(lead_id, action, to_status, actor_id) VALUES ($1,'archived','archived',$2)`, [leadId, sessionProfile.id]);
    await audit(client, sessionProfile.id, 'crm.lead.archived', 'crm_lead', leadId);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/crm/leads/assign' && req.method === 'POST') {
    const body = await readJson(req);
    const leadId = uuid(body.leadId, 'Lead');
    const assignedUserId = body.assignedUserId ? uuid(body.assignedUserId, 'Responsavel') : null;
    const result = await client.query(`UPDATE public.crm_leads SET assigned_user_id=$2, updated_at=NOW() WHERE id=$1 AND archived_at IS NULL RETURNING *`, [leadId, assignedUserId]);
    if (!result.rows[0]) throw httpError(404, 'Lead nao encontrado.', 'NOT_FOUND');
    await audit(client, sessionProfile.id, 'crm.lead.assigned', 'crm_lead', leadId, { assignedUserId });
    await emitEvent(client, 'crm_lead', leadId, 'lead.assigned', { assignedUserId }, `lead.assigned:${leadId}:${result.rows[0].updated_at}`);
    return json(res, 200, { lead: result.rows[0] });
  }

  if (pathname === '/api/admin/crm/opportunities' && req.method === 'GET') {
    const values = [];
    const where = [];
    const page = positiveInt(url.searchParams.get('page'), 1, 100000);
    const limit = positiveInt(url.searchParams.get('limit'), 50, 100);
    const status = url.searchParams.get('status');
    if (status) { values.push(status); where.push(`o.status=$${values.length}`); }
    const pipelineId = url.searchParams.get('pipelineId');
    if (pipelineId) { values.push(uuid(pipelineId, 'Pipeline')); where.push(`o.pipeline_id=$${values.length}`); }
    const filterSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const countResult = await client.query(`SELECT COUNT(*)::int AS total FROM public.crm_opportunities o ${filterSql}`, values);
    const result = await client.query(
      `SELECT o.*, o.estimated_value_cents / 100.0 AS estimated_value,
              COALESCE(l.name, customer.name) AS lead_name, l.email AS lead_email, l.company_name AS lead_company,
              s.name AS stage_name, s.slug AS stage_slug, s.color AS stage_color, s.position AS stage_position,
              p.name AS pipeline_name, owner.name AS assigned_name
       FROM public.crm_opportunities o
       LEFT JOIN public.crm_leads l ON l.id=o.lead_id
       LEFT JOIN public.profiles customer ON customer.id=o.customer_profile_id
       JOIN public.crm_pipeline_stages s ON s.id=o.stage_id
       JOIN public.crm_pipelines p ON p.id=o.pipeline_id
       LEFT JOIN public.profiles owner ON owner.id=o.assigned_user_id
       ${filterSql}
       ORDER BY s.position, o.updated_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, (page - 1) * limit],
    );
    return json(res, 200, { opportunities: result.rows, total: countResult.rows[0].total, page, limit });
  }

  if (pathname === '/api/admin/crm/opportunities/create' && req.method === 'POST') {
    const body = await readJson(req);
    const leadId = body.leadId ? uuid(body.leadId, 'Lead') : null;
    const customerProfileId = body.customerProfileId ? uuid(body.customerProfileId, 'Cliente') : null;
    if (!leadId && !customerProfileId) throw httpError(400, 'Selecione um lead ou cliente.');
    const stageId = body.stageId ? uuid(body.stageId, 'Estagio') : null;
    const stage = await client.query(
      `SELECT s.*, p.id AS pipeline_id FROM public.crm_pipeline_stages s JOIN public.crm_pipelines p ON p.id=s.pipeline_id
       WHERE ${stageId ? 's.id=$1' : "p.is_default=TRUE AND s.slug='new'"} AND s.is_active=TRUE LIMIT 1`,
      stageId ? [stageId] : [],
    );
    if (!stage.rows[0] || stage.rows[0].is_terminal) throw httpError(400, 'Estagio inicial invalido.');
    const inherited = leadId ? await client.query(`SELECT service_slug, template_slug, plan_slug, addons, source, assigned_user_id FROM public.crm_leads WHERE id=$1 AND archived_at IS NULL`, [leadId]) : { rows: [{}] };
    if (leadId && !inherited.rows[0]) throw httpError(404, 'Lead nao encontrado.', 'NOT_FOUND');
    const opportunityId = randomUUID();
    const publicCode = `OPP-${randomUUID().slice(0, 8).toUpperCase()}`;
    try {
      const result = await client.query(
        `INSERT INTO public.crm_opportunities
          (id, public_code, lead_id, customer_profile_id, pipeline_id, stage_id, title, service_slug,
           template_slug, plan_slug, addon_codes, estimated_value_cents, probability, expected_close_date,
           assigned_user_id, source, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
        [opportunityId, publicCode, leadId, customerProfileId, stage.rows[0].pipeline_id, stage.rows[0].id,
          requiredString(body.title, 'Titulo'), optionalString(body.serviceSlug ?? inherited.rows[0].service_slug, 160),
          optionalString(body.templateSlug ?? inherited.rows[0].template_slug, 160), optionalString(body.planSlug ?? inherited.rows[0].plan_slug, 160),
          JSON.stringify(Array.isArray(body.addonCodes) ? body.addonCodes : (inherited.rows[0].addons || [])), moneyToCents(body.expectedValue),
          Number.isInteger(Number(body.probability)) ? Math.max(0, Math.min(100, Number(body.probability))) : stage.rows[0].default_probability,
          optionalString(body.expectedCloseDate, 10), body.assignedUserId ? uuid(body.assignedUserId, 'Responsavel') : inherited.rows[0].assigned_user_id || sessionProfile.id,
          optionalString(body.source ?? inherited.rows[0].source, 100), optionalString(body.notes)],
      );
      await client.query(`INSERT INTO public.crm_opportunity_stage_history(opportunity_id,to_stage_id,changed_by,metadata) VALUES ($1,$2,$3,'{"reason":"created"}')`, [opportunityId, stage.rows[0].id, sessionProfile.id]);
      if (leadId) await client.query(`UPDATE public.crm_leads SET status=CASE WHEN status='new' THEN 'qualified' ELSE status END, qualified_at=COALESCE(qualified_at,NOW()), updated_at=NOW() WHERE id=$1`, [leadId]);
      await audit(client, sessionProfile.id, 'crm.opportunity.created', 'crm_opportunity', opportunityId, { publicCode });
      await emitEvent(client, 'crm_opportunity', opportunityId, 'opportunity.created', { leadId });
      return json(res, 201, { opportunity: result.rows[0] });
    } catch (error) {
      throw error;
    }
  }

  if (pathname === '/api/admin/crm/opportunities/move-stage' && req.method === 'POST') {
    const body = await readJson(req);
    const opportunityId = uuid(body.opportunityId, 'Oportunidade');
    const newStageId = uuid(body.newStageId, 'Estagio');
    try {
      const current = await client.query(`SELECT * FROM public.crm_opportunities WHERE id=$1 FOR UPDATE`, [opportunityId]);
      if (!current.rows[0]) throw httpError(404, 'Oportunidade nao encontrada.', 'NOT_FOUND');
      const stage = await client.query(`SELECT * FROM public.crm_pipeline_stages WHERE id=$1 AND pipeline_id=$2 AND is_active=TRUE`, [newStageId, current.rows[0].pipeline_id]);
      if (!stage.rows[0]) throw httpError(400, 'O estagio nao pertence ao pipeline da oportunidade.');
      if (stage.rows[0].is_lost && !body.lostReasonId) throw httpError(400, 'Motivo de perda obrigatorio.', 'LOST_REASON_REQUIRED');
      const lostReasonId = body.lostReasonId ? uuid(body.lostReasonId, 'Motivo de perda') : null;
      const nextStatus = stage.rows[0].is_won ? 'won' : stage.rows[0].is_lost ? 'lost' : 'open';
      const updated = await client.query(
        `UPDATE public.crm_opportunities SET stage_id=$2, status=$3, probability=$4,
           won_at=CASE WHEN $3='won' THEN NOW() ELSE NULL END, lost_at=CASE WHEN $3='lost' THEN NOW() ELSE NULL END,
           lost_reason_id=$5, lost_notes=$6, stage_entered_at=NOW(), version=version+1, updated_at=NOW()
         WHERE id=$1 AND version=$7 RETURNING *`,
        [opportunityId, newStageId, nextStatus, stage.rows[0].default_probability, lostReasonId,
          optionalString(body.lostNotes), current.rows[0].version],
      );
      if (!updated.rows[0]) throw httpError(409, 'A oportunidade foi alterada por outro usuario. Atualize a tela.', 'VERSION_CONFLICT');
      await client.query(`INSERT INTO public.crm_opportunity_stage_history(opportunity_id,from_stage_id,to_stage_id,changed_by,metadata) VALUES ($1,$2,$3,$4,$5)`,
        [opportunityId, current.rows[0].stage_id, newStageId, sessionProfile.id, JSON.stringify({ lostReasonId, lostNotes: optionalString(body.lostNotes) })]);
      if (current.rows[0].lead_id && nextStatus !== 'open') {
        await client.query(`UPDATE public.crm_leads SET status=$2, converted_at=CASE WHEN $2='won' THEN COALESCE(converted_at,NOW()) ELSE converted_at END, updated_at=NOW() WHERE id=$1`, [current.rows[0].lead_id, nextStatus]);
      }
      await audit(client, sessionProfile.id, 'crm.opportunity.stage_changed', 'crm_opportunity', opportunityId, { fromStageId: current.rows[0].stage_id, toStageId: newStageId });
      await emitEvent(client, 'crm_opportunity', opportunityId, 'opportunity.stage_changed', { newStageId, status: nextStatus }, `opportunity.stage_changed:${opportunityId}:${updated.rows[0].version}`);
      if (nextStatus === 'won' || nextStatus === 'lost') {
        await emitEvent(client, 'crm_opportunity', opportunityId, `deal.${nextStatus}`, { newStageId }, `deal.${nextStatus}:${opportunityId}`);
      }
      return json(res, 200, { opportunity: updated.rows[0] });
    } catch (error) {
      throw error;
    }
  }

  if (pathname === '/api/admin/crm/pipelines' && req.method === 'GET') {
    const result = await client.query(
      `SELECT p.*, COALESCE(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'slug',s.slug,'position',s.position,
        'color',s.color,'is_won',s.is_won,'is_lost',s.is_lost,'default_probability',s.default_probability)
        ORDER BY s.position) FILTER (WHERE s.id IS NOT NULL), '[]'::jsonb) AS stages
       FROM public.crm_pipelines p LEFT JOIN public.crm_pipeline_stages s ON s.pipeline_id=p.id AND s.is_active=TRUE
       WHERE p.is_active=TRUE GROUP BY p.id ORDER BY p.sort_order, p.name`,
    );
    return json(res, 200, { pipelines: result.rows });
  }

  if (pathname === '/api/admin/crm/stages' && req.method === 'GET') {
    const result = await client.query(`SELECT s.* FROM public.crm_pipeline_stages s JOIN public.crm_pipelines p ON p.id=s.pipeline_id WHERE s.is_active=TRUE AND p.is_active=TRUE ORDER BY p.sort_order,s.position`);
    return json(res, 200, { stages: result.rows });
  }

  if (pathname === '/api/admin/crm/lost-reasons' && req.method === 'GET') {
    const result = await client.query(`SELECT * FROM public.crm_lost_reasons WHERE is_active=TRUE ORDER BY sort_order,label`);
    return json(res, 200, { reasons: result.rows });
  }

  if (pathname === '/api/admin/crm/activities' && req.method === 'GET') {
    const values = [];
    const where = [];
    const status = url.searchParams.get('status');
    if (status) { values.push(status); where.push(`a.status=$${values.length}`); }
    if (url.searchParams.get('overdue') === 'true') where.push(`a.status='pending' AND a.scheduled_at < NOW()`);
    const result = await client.query(
      `SELECT a.*, l.name AS lead_name, l.public_code AS lead_code, o.title AS opportunity_title, p.name AS assigned_name
       FROM public.crm_activities a LEFT JOIN public.crm_leads l ON l.id=a.lead_id
       LEFT JOIN public.crm_opportunities o ON o.id=a.opportunity_id LEFT JOIN public.profiles p ON p.id=a.assigned_user_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY CASE WHEN a.status='pending' THEN 0 ELSE 1 END, a.scheduled_at NULLS LAST, a.created_at DESC LIMIT 250`, values,
    );
    return json(res, 200, { activities: result.rows });
  }

  if (pathname === '/api/admin/crm/activities/create' && req.method === 'POST') {
    const body = await readJson(req);
    const type = String(body.type || 'task');
    if (!ACTIVITY_TYPES.has(type)) throw httpError(400, 'Tipo de atividade invalido.');
    const leadId = body.leadId ? uuid(body.leadId, 'Lead') : null;
    const opportunityId = body.opportunityId ? uuid(body.opportunityId, 'Oportunidade') : null;
    if (!leadId && !opportunityId) throw httpError(400, 'Selecione um lead ou oportunidade.');
    const result = await client.query(
      `INSERT INTO public.crm_activities(lead_id,opportunity_id,type,title,description,scheduled_at,assigned_user_id,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [leadId, opportunityId, type, requiredString(body.title, 'Titulo'), optionalString(body.description),
        body.scheduledAt ? new Date(body.scheduledAt) : null, body.assignedUserId ? uuid(body.assignedUserId, 'Responsavel') : sessionProfile.id, sessionProfile.id],
    );
    if (leadId) await client.query(`UPDATE public.crm_leads SET last_contact_at=NOW(), first_contact_at=COALESCE(first_contact_at,NOW()), status=CASE WHEN status='new' THEN 'contact' ELSE status END, updated_at=NOW() WHERE id=$1`, [leadId]);
    await audit(client, sessionProfile.id, 'crm.activity.created', 'crm_activity', result.rows[0].id, { type });
    await emitEvent(client, 'crm_activity', result.rows[0].id, 'activity.created', { leadId, opportunityId, type });
    return json(res, 201, { activity: result.rows[0] });
  }

  if (pathname === '/api/admin/crm/activities/complete' && req.method === 'POST') {
    const body = await readJson(req);
    const activityId = uuid(body.id, 'Atividade');
    const result = await client.query(`UPDATE public.crm_activities SET status='completed', outcome=$2, completed_at=NOW(), updated_at=NOW() WHERE id=$1 AND status='pending' RETURNING *`, [activityId, optionalString(body.outcome)]);
    if (!result.rows[0]) throw httpError(404, 'Atividade pendente nao encontrada.', 'NOT_FOUND');
    await audit(client, sessionProfile.id, 'crm.activity.completed', 'crm_activity', activityId);
    await emitEvent(client, 'crm_activity', activityId, 'activity.completed', { leadId: result.rows[0].lead_id, opportunityId: result.rows[0].opportunity_id });
    return json(res, 200, { activity: result.rows[0] });
  }

  if (pathname === '/api/admin/crm/proposals' && req.method === 'GET') {
    const page = positiveInt(url.searchParams.get('page'), 1, 100000);
    const limit = positiveInt(url.searchParams.get('limit'), 50, 100);
    await client.query(`UPDATE public.crm_proposals SET status='expired', updated_at=NOW() WHERE status IN ('sent','viewed') AND valid_until < CURRENT_DATE`);
    const [countResult, result] = await Promise.all([
      client.query('SELECT COUNT(*)::int AS total FROM public.crm_proposals'),
      client.query(
      `SELECT pr.*, o.title AS opportunity_title, o.public_code AS opportunity_code,
              COALESCE(l.name, customer.name) AS lead_name, l.email AS lead_email, l.profile_id AS lead_profile_id,
              q.id AS pricing_quote_id, q.expires_at AS pricing_quote_expires_at, q.consumed AS pricing_quote_consumed,
              co.id AS order_id, co.status AS order_status, pt.status AS payment_status
       FROM public.crm_proposals pr JOIN public.crm_opportunities o ON o.id=pr.opportunity_id
       LEFT JOIN public.crm_leads l ON l.id=o.lead_id LEFT JOIN public.profiles customer ON customer.id=o.customer_profile_id
       LEFT JOIN LATERAL (SELECT * FROM public.commercial_pricing_quotes q0 WHERE q0.crm_proposal_id=pr.id ORDER BY q0.created_at DESC LIMIT 1) q ON TRUE
       LEFT JOIN public.commercial_orders co ON co.pricing_quote_id=q.id
       LEFT JOIN public.invoices i ON i.order_id=co.id
       LEFT JOIN LATERAL (SELECT status FROM public.payment_transactions pt0 WHERE pt0.invoice_id=i.id ORDER BY pt0.created_at DESC LIMIT 1) pt ON TRUE
       ORDER BY pr.created_at DESC LIMIT $1 OFFSET $2`, [limit, (page - 1) * limit],
      ),
    ]);
    return json(res, 200, { proposals: result.rows, total: countResult.rows[0].total, page, limit });
  }

  if (pathname === '/api/admin/crm/proposals/create' && req.method === 'POST') {
    if (typeof calculateCommercialSelection !== 'function') throw httpError(503, 'Catalogo comercial indisponivel.', 'CATALOG_UNAVAILABLE');
    const body = await readJson(req);
    const opportunityId = uuid(body.opportunityId, 'Oportunidade');
    const opportunity = await client.query(
      `SELECT o.*, l.template_slug AS lead_template_slug, l.plan_slug AS lead_plan_slug, l.addons AS lead_addons
       FROM public.crm_opportunities o LEFT JOIN public.crm_leads l ON l.id=o.lead_id WHERE o.id=$1`, [opportunityId],
    );
    if (!opportunity.rows[0]) throw httpError(404, 'Oportunidade nao encontrada.', 'NOT_FOUND');
    const row = opportunity.rows[0];
    const serviceSlug = requiredString(body.serviceSlug || row.service_slug, 'Servico', 160);
    const addonCodes = Array.isArray(body.addonCodes) ? body.addonCodes.map((item) => String(item)) : (row.addon_codes || row.lead_addons || []);
    const selection = await calculateCommercialSelection(client, {
      serviceSlug,
      planId: optionalString(body.planId || row.plan_slug || row.lead_plan_slug, 160),
      templateId: optionalString(body.templateId || row.template_slug || row.lead_template_slug, 160),
      addonCodes,
      domain: null,
    });
    const discountCents = moneyToCents(body.discount || 0);
    const maximumDiscount = Math.floor(selection.oneTimeTotalCents * 0.2);
    if (discountCents > maximumDiscount) throw httpError(400, 'Desconto acima do limite administrativo de 20%.', 'DISCOUNT_LIMIT');
    if (selection.oneTimeTotalCents <= 0) throw httpError(409, 'O catalogo nao possui valor inicial para este servico.', 'PRICE_REQUIRED');
    const validUntil = optionalString(body.validUntil, 10);
    if (!validUntil || Number.isNaN(Date.parse(`${validUntil}T00:00:00Z`))) throw httpError(400, 'Validade da proposta invalida.');
    const version = await client.query(`SELECT COALESCE(MAX(version_number),0)+1 AS next FROM public.crm_proposals WHERE opportunity_id=$1`, [opportunityId]);
    const proposalId = randomUUID();
    const result = await client.query(
      `INSERT INTO public.crm_proposals
        (id,public_code,opportunity_id,version_number,title,service_slug,template_slug,plan_id,addon_codes,
         one_time_items,monthly_items,subtotal_cents,discount_cents,total_cents,monthly_total_cents,
         conditions,notes,valid_until,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
      [proposalId, `PROP-${randomUUID().slice(0, 8).toUpperCase()}`, opportunityId, version.rows[0].next,
        requiredString(body.title || `Proposta - ${row.title}`, 'Titulo'), serviceSlug, selection.template?.slug || null,
        selection.plan?.id || null, JSON.stringify(addonCodes), JSON.stringify(selection.oneTimeItems), JSON.stringify(selection.monthlyItems),
        selection.oneTimeTotalCents, discountCents, selection.oneTimeTotalCents - discountCents, selection.monthlyTotalCents,
        optionalString(body.conditions), optionalString(body.notes), validUntil, sessionProfile.id],
    );
    await client.query(`INSERT INTO public.crm_proposal_history(proposal_id,action,actor_id,metadata) VALUES ($1,'created',$2,$3)`, [proposalId, sessionProfile.id, JSON.stringify({ pricingVersion: 'catalog-current' })]);
    await audit(client, sessionProfile.id, 'crm.proposal.created', 'crm_proposal', proposalId, { opportunityId });
    await emitEvent(client, 'crm_proposal', proposalId, 'proposal.created', { opportunityId });
    return json(res, 201, { proposal: result.rows[0] });
  }

  if (pathname === '/api/admin/crm/proposals/send' && req.method === 'POST') {
    const body = await readJson(req);
    const proposalId = uuid(body.id, 'Proposta');
    const result = await client.query(
      `UPDATE public.crm_proposals SET status='sent', sent_at=COALESCE(sent_at,NOW()), updated_at=NOW()
       WHERE id=$1 AND status='draft' AND valid_until >= CURRENT_DATE RETURNING *`, [proposalId],
    );
    if (!result.rows[0]) throw httpError(409, 'Somente proposta em rascunho e valida pode ser enviada.');
    await client.query(`INSERT INTO public.crm_proposal_history(proposal_id,action,actor_id) VALUES ($1,'sent',$2)`, [proposalId, sessionProfile.id]);
    await emitEvent(client, 'crm_proposal', proposalId, 'proposal.sent', { publicCode: result.rows[0].public_code });
    return json(res, 200, { proposal: result.rows[0] });
  }

  if (pathname === '/api/admin/crm/proposals/accept' && req.method === 'POST') {
    const body = await readJson(req);
    const proposalId = uuid(body.id, 'Proposta');
    const result = await client.query(
      `UPDATE public.crm_proposals SET status='accepted', accepted_at=NOW(), updated_at=NOW()
       WHERE id=$1 AND status IN ('sent','viewed') AND valid_until >= CURRENT_DATE RETURNING *`, [proposalId],
    );
    if (!result.rows[0]) throw httpError(409, 'A proposta nao esta enviada, ja foi encerrada ou expirou.');
    await client.query(`INSERT INTO public.crm_proposal_history(proposal_id,action,actor_id,metadata) VALUES ($1,'accepted_manual',$2,'{"source":"admin"}')`, [proposalId, sessionProfile.id]);
    await emitEvent(client, 'crm_proposal', proposalId, 'proposal.accepted', { source: 'admin' });
    return json(res, 200, { proposal: result.rows[0] });
  }

  if (pathname === '/api/admin/crm/proposals/checkout' && req.method === 'POST') {
    const body = await readJson(req);
    const proposalId = uuid(body.id, 'Proposta');
    const proposal = await client.query(
      `SELECT pr.*, o.lead_id, o.customer_profile_id, l.profile_id AS lead_profile_id
       FROM public.crm_proposals pr JOIN public.crm_opportunities o ON o.id=pr.opportunity_id
       LEFT JOIN public.crm_leads l ON l.id=o.lead_id WHERE pr.id=$1`, [proposalId],
    );
    const row = proposal.rows[0];
    if (!row) throw httpError(404, 'Proposta nao encontrada.', 'NOT_FOUND');
    if (row.status !== 'accepted' || new Date(`${row.valid_until}T23:59:59`) < new Date()) throw httpError(409, 'Aceite uma proposta valida antes de gerar o checkout.');
    const customerId = row.customer_profile_id || row.lead_profile_id;
    if (!customerId) throw httpError(409, 'Vincule o lead a uma conta de cliente antes de gerar o checkout.', 'CUSTOMER_ACCOUNT_REQUIRED');
    const existing = await client.query(
      `SELECT id, expires_at FROM public.commercial_pricing_quotes
       WHERE crm_proposal_id=$1 AND user_id=$2 AND consumed=FALSE AND expires_at>NOW() ORDER BY created_at DESC LIMIT 1`, [proposalId, customerId],
    );
    if (existing.rows[0]) return json(res, 200, { quoteId: existing.rows[0].id, checkoutPath: `/checkout?quote=${existing.rows[0].id}`, expiresAt: existing.rows[0].expires_at, reused: true });
    const quoteId = randomUUID();
    const expiresAt = new Date(Math.min(Date.now() + 24 * 60 * 60 * 1000, new Date(`${row.valid_until}T23:59:59`).getTime()));
    let remainingDiscount = Number(row.discount_cents || 0);
    const oneTimeItems = (Array.isArray(row.one_time_items) ? row.one_time_items : []).map((item) => {
      const originalAmount = Math.max(0, Number(item.amountCents || 0));
      const appliedDiscount = Math.min(originalAmount, remainingDiscount);
      remainingDiscount -= appliedDiscount;
      return {
        ...item,
        name: appliedDiscount > 0 ? `${item.name} (desconto comercial aplicado)` : item.name,
        amountCents: originalAmount - appliedDiscount,
      };
    });
    await client.query(
      `INSERT INTO public.commercial_pricing_quotes
        (id,user_id,service_slug,template_slug,plan_id,addon_codes,one_time_items,monthly_items,
         one_time_total_cents,monthly_total_cents,pricing_version,normalized_selection,expires_at,crm_proposal_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'crm-proposal-v1',$11,$12,$13)`,
      [quoteId, customerId, row.service_slug, row.template_slug, row.plan_id, JSON.stringify(row.addon_codes || []),
        JSON.stringify(oneTimeItems), JSON.stringify(row.monthly_items || []), row.total_cents, row.monthly_total_cents,
        JSON.stringify({ serviceSlug: row.service_slug, serviceName: row.title, planId: row.plan_id, templateSlug: row.template_slug,
          addonCodes: row.addon_codes || [], proposalId }), expiresAt.toISOString(), proposalId],
    );
    await client.query(`INSERT INTO public.crm_proposal_history(proposal_id,action,actor_id,metadata) VALUES ($1,'checkout_quote_created',$2,$3)`, [proposalId, sessionProfile.id, JSON.stringify({ quoteId })]);
    await audit(client, sessionProfile.id, 'crm.proposal.checkout_quote_created', 'crm_proposal', proposalId, { quoteId, customerId });
    return json(res, 201, { quoteId, checkoutPath: `/checkout?quote=${quoteId}`, expiresAt: expiresAt.toISOString() });
  }

  if (pathname === '/api/admin/crm/dashboard' && req.method === 'GET') {
    const days = positiveInt(url.searchParams.get('days'), 30, 3650);
    const dimensionQuery = (column) => client.query(
      `SELECT COALESCE(NULLIF(${column},''),'nao_informado') AS key,
              COUNT(*)::int AS leads,
              COUNT(*) FILTER (WHERE status='won' OR converted_at IS NOT NULL)::int AS conversions
       FROM public.crm_leads
       WHERE archived_at IS NULL AND created_at>=NOW()-($1::int * INTERVAL '1 day')
       GROUP BY 1 ORDER BY leads DESC LIMIT 10`,
      [days],
    );
    const [leadStatuses, newLeads, stages, won, lost, activities, sources, cities, segments, services] = await Promise.all([
      client.query(`SELECT status, COUNT(*)::int AS count FROM public.crm_leads WHERE archived_at IS NULL GROUP BY status`),
      client.query(`SELECT COUNT(*)::int AS count FROM public.crm_leads WHERE created_at >= NOW()-($1::int * INTERVAL '1 day')`, [days]),
      client.query(`SELECT s.name,s.color,COUNT(o.id)::int AS count,COALESCE(SUM(o.estimated_value_cents),0)::bigint/100.0 AS value FROM public.crm_pipeline_stages s LEFT JOIN public.crm_opportunities o ON o.stage_id=s.id AND o.status='open' WHERE s.is_active=TRUE GROUP BY s.id ORDER BY s.position`),
      client.query(`SELECT COUNT(*)::int AS count,COALESCE(SUM(estimated_value_cents),0)::bigint/100.0 AS value FROM public.crm_opportunities WHERE status='won' AND won_at >= NOW()-($1::int * INTERVAL '1 day')`, [days]),
      client.query(`SELECT COUNT(*)::int AS count FROM public.crm_opportunities WHERE status='lost' AND lost_at >= NOW()-($1::int * INTERVAL '1 day')`, [days]),
      client.query(`SELECT COUNT(*) FILTER (WHERE status='pending')::int AS pending, COUNT(*) FILTER (WHERE status='pending' AND scheduled_at<NOW())::int AS overdue, COUNT(*) FILTER (WHERE status='completed' AND completed_at>=NOW()-($1::int * INTERVAL '1 day'))::int AS completed FROM public.crm_activities`, [days]),
      client.query(`SELECT COALESCE(NULLIF(source,''),'direto') AS source,COUNT(*)::int AS count FROM public.crm_leads WHERE created_at>=NOW()-($1::int * INTERVAL '1 day') GROUP BY 1 ORDER BY count DESC LIMIT 10`, [days]),
      dimensionQuery('city_slug'),
      dimensionQuery('segment_slug'),
      dimensionQuery('service_slug'),
    ]);
    const byStatus = Object.fromEntries(leadStatuses.rows.map((row) => [row.status, row.count]));
    const pipelineValue = stages.rows.reduce((sum, row) => sum + Number(row.value), 0);
    return json(res, 200, {
      leads: { byStatus, newInPeriod: newLeads.rows[0].count },
      opportunities: { byStage: stages.rows, won: won.rows[0], lost: lost.rows[0].count, pipelineValue },
      activities: { pending: activities.rows[0].pending, overdue: activities.rows[0].overdue, completedInPeriod: activities.rows[0].completed },
      topSources: sources.rows, period: { days },
      regionalBreakdown: {
        cities: cities.rows,
        segments: segments.rows,
        services: services.rows,
      },
    });
  }

  if (pathname === '/api/admin/crm/team' && req.method === 'GET') {
    const result = await client.query(`SELECT id,name,email,role FROM public.profiles WHERE role='admin' ORDER BY name`);
    return json(res, 200, { users: result.rows });
  }

  return json(res, 404, { error: 'Rota CRM nao encontrada.' });
}

async function flagDuplicates(client, leadId) {
  await client.query(
    `INSERT INTO public.crm_lead_duplicate_candidates(lead_id,candidate_lead_id,match_reason)
     SELECT current.id, candidate.id,
       CASE WHEN current.email_normalized<>'' AND current.email_normalized=candidate.email_normalized
                  AND current.phone_normalized<>'' AND current.phone_normalized=candidate.phone_normalized
            THEN 'email_phone'
            WHEN current.email_normalized<>'' AND current.email_normalized=candidate.email_normalized THEN 'email'
            ELSE 'phone' END
     FROM public.crm_leads current JOIN public.crm_leads candidate ON candidate.id<>current.id
      AND candidate.archived_at IS NULL
      AND ((current.email_normalized<>'' AND current.email_normalized=candidate.email_normalized)
        OR (current.phone_normalized<>'' AND current.phone_normalized=candidate.phone_normalized))
     WHERE current.id=$1 ON CONFLICT (lead_id,candidate_lead_id) DO NOTHING`, [leadId],
  );
}
