import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { AutomationEngine, safeSecretEquals } from './automation-engine.js';
import { AutomationError, isUuid, sanitizeForLog, validateAction, validateConditionTree } from './automation-core.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
let schemaPromise;

export function isAutomationApiPath(pathname) {
  return pathname.startsWith('/api/admin/automations')
    || pathname.startsWith('/api/admin/automation-runs')
    || pathname.startsWith('/api/admin/automation-dead-letter')
    || pathname.startsWith('/api/admin/ai')
    || pathname.startsWith('/api/admin/approvals')
    || pathname === '/api/internal/automation/process';
}

export async function ensureAutomationSchema(client) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const check = await client.query(
        `SELECT table_name AS name FROM information_schema.tables
         WHERE table_schema='public' AND table_name IN ('automations','automation_runs','approval_requests','ai_runs')
         UNION ALL
         SELECT column_name AS name FROM information_schema.columns
         WHERE table_schema='public' AND table_name='automations' AND column_name='next_trigger_at'`,
      );
      if (check.rowCount === 5) return;
      const sql = await readFile(join(__dirname, 'database/migrations/0008_automation_foundation.sql'), 'utf8');
      await client.query(sql);
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
}

function fail(message, status = 400, code = 'VALIDATION_ERROR') {
  throw new AutomationError(message, { status, code, retryable: false });
}

function uuid(value, label) {
  if (!isUuid(value)) fail(`${label} inválido.`);
  return value;
}

function text(value, label, max = 500, required = false) {
  const normalized = String(value ?? '').trim();
  if (required && !normalized) fail(`${label} é obrigatório.`);
  return normalized.slice(0, max) || null;
}

function validateTrigger(triggerType, triggerConfig) {
  const type = String(triggerType || 'event');
  if (!['event','schedule','manual','webhook','temporal'].includes(type)) fail('Tipo de trigger inválido.');
  const config = triggerConfig && typeof triggerConfig === 'object' ? triggerConfig : {};
  if (type === 'event') {
    const events = Array.isArray(config.events) ? config.events : config.event ? [config.event] : [];
    if (events.length === 0 || events.length > 20 || events.some((event) => !/^[a-z][a-z0-9_.-]{2,100}$/.test(String(event)))) {
      fail('Informe eventos válidos para o trigger.');
    }
    return { type, config: { events: [...new Set(events.map(String))] } };
  }
  if (type === 'schedule') {
    const intervalMinutes = Number(config.intervalMinutes);
    if (!Number.isInteger(intervalMinutes) || intervalMinutes < 1 || intervalMinutes > 525600) fail('Intervalo do agendamento inválido.');
    return { type, config: { intervalMinutes } };
  }
  return { type, config };
}

function validateActions(actions) {
  if (!Array.isArray(actions) || actions.length === 0 || actions.length > 20) fail('Informe entre 1 e 20 ações.');
  const normalized = actions.map(validateAction);
  if (new Set(normalized.map((action) => action.id)).size !== normalized.length) fail('Identificadores de ação devem ser únicos.');
  return normalized;
}

async function audit(client, actorId, action, entityType, entityId, metadata = {}) {
  await client.query(
    `INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5)`,
    [actorId, action, entityType, String(entityId), JSON.stringify(sanitizeForLog(metadata))],
  );
}

async function automationWithVersion(client, id) {
  const result = await client.query(
    `SELECT a.*,v.trigger_snapshot,v.conditions_snapshot,v.actions_snapshot
     FROM public.automations a JOIN public.automation_versions v ON v.automation_id=a.id AND v.version=a.current_version
     WHERE a.id=$1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function handleAutomationApi(req, res, url, context) {
  const { dbClient, getSessionProfile, json, readJson } = context;
  const client = dbClient();
  await client.connect();
  try {
    await ensureAutomationSchema(client);
    if (url.pathname === '/api/internal/automation/process') {
      if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
      if (!safeSecretEquals(req.headers['x-automation-secret'], process.env.AUTOMATION_INTERNAL_SECRET)) {
        return json(res, 401, { error: 'Credencial interna inválida.' });
      }
      const engine = new AutomationEngine(client, { maxAttempts: process.env.AUTOMATION_MAX_ATTEMPTS });
      const result = await engine.processBatch(process.env.AUTOMATION_BATCH_SIZE || 10);
      return json(res, 200, result);
    }

    const session = await getSessionProfile(req, client);
    if (!session) return json(res, 401, { error: 'Não autenticado.' });
    if (session.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });

    const response = await routeAdmin(req, url, client, session, readJson);
    return json(res, response.status || 200, response.body);
  } catch (error) {
    if (error instanceof AutomationError) return json(res, error.status || 400, { error: error.message, code: error.code });
    const incidentId = randomUUID();
    console.error('[AUTOMATION_API]', { incidentId, code: error.code, message: String(error.message || error).slice(0, 1000) });
    return json(res, 500, { error: 'Não foi possível processar a solicitação de automação.', incidentId });
  } finally {
    await client.end();
  }
}

async function routeAdmin(req, url, client, session, readJson) {
  const { pathname, searchParams } = url;

  if (pathname === '/api/admin/automations/dashboard' && req.method === 'GET') {
    const [automations, runs, queue, approvals, settings] = await Promise.all([
      client.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='active')::int active FROM public.automations`),
      client.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='completed')::int completed,COUNT(*) FILTER(WHERE status='failed')::int failed FROM public.automation_runs WHERE created_at>=CURRENT_DATE`),
      client.query(`SELECT COUNT(*) FILTER(WHERE status IN ('pending','retry','processing'))::int pending,COUNT(*) FILTER(WHERE status='dead_letter')::int dead_letter FROM public.outbox_events`),
      client.query(`SELECT COUNT(*)::int pending FROM public.approval_requests WHERE status='pending'`),
      client.query(`SELECT key,value FROM public.automation_settings ORDER BY key`),
    ]);
    return { body: { automations: automations.rows[0], runsToday: runs.rows[0], queue: queue.rows[0], approvals: approvals.rows[0], settings: settings.rows } };
  }

  if (pathname === '/api/admin/automations' && req.method === 'GET') {
    const result = await client.query(
      `SELECT a.*,COALESCE(stats.runs,0)::int runs,COALESCE(stats.completed,0)::int completed,COALESCE(stats.failed,0)::int failed
       FROM public.automations a LEFT JOIN LATERAL (
         SELECT COUNT(*) runs,COUNT(*) FILTER(WHERE status='completed') completed,COUNT(*) FILTER(WHERE status='failed') failed
         FROM public.automation_runs r WHERE r.automation_id=a.id
       ) stats ON TRUE WHERE ($1::text IS NULL OR a.status=$1) ORDER BY a.created_at`,
      [searchParams.get('status')],
    );
    return { body: { automations: result.rows } };
  }

  if (pathname === '/api/admin/automations' && req.method === 'POST') {
    const body = await readJson(req);
    const trigger = validateTrigger(body.triggerType, body.triggerConfig);
    const conditions = validateConditionTree(body.conditions || { operator: 'and', rules: [] });
    const actions = validateActions(body.actions);
    const riskLevel = Math.max(0, Math.min(3, Number(body.riskLevel || 0)));
    await client.query('BEGIN');
    try {
      const created = await client.query(
        `INSERT INTO public.automations(name,description,status,trigger_type,trigger_config,conditions,current_version,risk_level,requires_approval,dry_run,created_by,updated_by,next_trigger_at)
         VALUES($1,$2,'draft',$3,$4,$5,1,$6,$7,$8,$9,$9,CASE WHEN $3='schedule' THEN NOW() ELSE NULL END) RETURNING *`,
        [text(body.name, 'Nome', 200, true), text(body.description, 'Descrição', 2000), trigger.type, JSON.stringify(trigger.config),
          JSON.stringify(conditions), riskLevel, body.requiresApproval === true, body.dryRun !== false, session.id],
      );
      const automation = created.rows[0];
      await client.query(
        `INSERT INTO public.automation_versions(automation_id,version,trigger_snapshot,conditions_snapshot,actions_snapshot,created_by)
         VALUES($1,1,$2,$3,$4,$5)`,
        [automation.id, JSON.stringify(trigger.config), JSON.stringify(conditions), JSON.stringify(actions), session.id],
      );
      await audit(client, session.id, 'automation.created', 'automation', automation.id, { riskLevel, dryRun: automation.dry_run });
      await client.query('COMMIT');
      return { status: 201, body: { automation: await automationWithVersion(client, automation.id) } };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  const automationMatch = pathname.match(/^\/api\/admin\/automations\/([0-9a-f-]+)$/i);
  if (automationMatch && req.method === 'GET') {
    const automation = await automationWithVersion(client, uuid(automationMatch[1], 'Automação'));
    if (!automation) fail('Automação não encontrada.', 404, 'NOT_FOUND');
    return { body: { automation } };
  }

  if (automationMatch && req.method === 'PATCH') {
    const id = uuid(automationMatch[1], 'Automação');
    const current = await automationWithVersion(client, id);
    if (!current) fail('Automação não encontrada.', 404, 'NOT_FOUND');
    const body = await readJson(req);
    const trigger = validateTrigger(body.triggerType ?? current.trigger_type, body.triggerConfig ?? current.trigger_snapshot);
    const conditions = validateConditionTree(body.conditions ?? current.conditions_snapshot);
    const actions = validateActions(body.actions ?? current.actions_snapshot);
    const nextVersion = Number(current.current_version) + 1;
    await client.query('BEGIN');
    try {
      await client.query(
        `UPDATE public.automations SET name=$2,description=$3,trigger_type=$4,trigger_config=$5,conditions=$6,current_version=$7,
           risk_level=$8,requires_approval=$9,dry_run=$10,updated_by=$11,updated_at=NOW(),
           next_trigger_at=CASE WHEN $4='schedule' THEN COALESCE(next_trigger_at,NOW()) ELSE NULL END WHERE id=$1`,
        [id, text(body.name ?? current.name, 'Nome', 200, true), text(body.description ?? current.description, 'Descrição', 2000),
          trigger.type, JSON.stringify(trigger.config), JSON.stringify(conditions), nextVersion,
          Math.max(0, Math.min(3, Number(body.riskLevel ?? current.risk_level))), body.requiresApproval ?? current.requires_approval,
          body.dryRun ?? current.dry_run, session.id],
      );
      await client.query(
        `INSERT INTO public.automation_versions(automation_id,version,trigger_snapshot,conditions_snapshot,actions_snapshot,created_by)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [id, nextVersion, JSON.stringify(trigger.config), JSON.stringify(conditions), JSON.stringify(actions), session.id],
      );
      await audit(client, session.id, 'automation.updated', 'automation', id, { fromVersion: current.current_version, toVersion: nextVersion });
      await client.query('COMMIT');
      return { body: { automation: await automationWithVersion(client, id) } };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  const stateMatch = pathname.match(/^\/api\/admin\/automations\/([0-9a-f-]+)\/(activate|pause|test|run)$/i);
  if (stateMatch && req.method === 'POST') {
    const id = uuid(stateMatch[1], 'Automação');
    const action = stateMatch[2];
    if (action === 'test') {
      const automation = await automationWithVersion(client, id);
      if (!automation) fail('Automação não encontrada.', 404, 'NOT_FOUND');
      const body = await readJson(req);
      const result = await new AutomationEngine(client).dryRun(automation, body);
      await audit(client, session.id, 'automation.tested', 'automation', id, { matched: result.matched });
      return { body: { dryRun: result } };
    }
    if (action === 'run') {
      const automation = await automationWithVersion(client, id);
      if (!automation) fail('Automação não encontrada.', 404, 'NOT_FOUND');
      if (automation.trigger_type !== 'manual' || automation.status !== 'active') fail('Somente automação manual ativa pode ser executada.', 409, 'MANUAL_RUN_UNAVAILABLE');
      const body = await readJson(req);
      const eventId = randomUUID();
      await client.query(
        `INSERT INTO public.outbox_events(id,aggregate_type,aggregate_id,event_type,payload,idempotency_key)
         VALUES($1,'automation',$2,'automation.manual.requested',$3,$4)`,
        [eventId, id, JSON.stringify({ automationId: id, input: sanitizeForLog(body.payload || {}) }), `automation.manual:${id}:${eventId}`],
      );
      await audit(client, session.id, 'automation.executed_manually', 'automation', id, { eventId });
      return { status: 202, body: { eventId, status: 'queued' } };
    }
    const status = action === 'activate' ? 'active' : 'paused';
    const result = await client.query("UPDATE public.automations SET status=$2,updated_by=$3,updated_at=NOW(),next_trigger_at=CASE WHEN $2='active' AND trigger_type='schedule' THEN COALESCE(next_trigger_at,NOW()) ELSE next_trigger_at END WHERE id=$1 AND status<>'archived' RETURNING *", [id, status, session.id]);
    if (!result.rows[0]) fail('Automação não encontrada.', 404, 'NOT_FOUND');
    await audit(client, session.id, `automation.${action}d`, 'automation', id);
    return { body: { automation: result.rows[0] } };
  }

  if (pathname === '/api/admin/automations/settings' && req.method === 'PATCH') {
    const body = await readJson(req);
    const allowed = new Set(['automation.enabled','automation.external_actions_enabled','ai.enabled','whatsapp.enabled','email.enabled','webhooks.allowed_hosts','ai.max_calls_per_minute','webhooks.max_calls_per_minute']);
    if (!allowed.has(body.key)) fail('Configuração não permitida.');
    const value = body.key === 'webhooks.allowed_hosts'
      ? (Array.isArray(body.value) ? body.value.filter((host) => /^[a-z0-9.-]+$/i.test(host)).slice(0, 50) : fail('Lista de hosts inválida.'))
      : body.key.endsWith('max_calls_per_minute')
        ? Math.max(1, Math.min(1000, Number(body.value) || fail('Limite inválido.')))
      : body.value === true;
    await client.query(
      `INSERT INTO public.automation_settings(key,value,updated_by,updated_at) VALUES($1,$2,$3,NOW())
       ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_by=EXCLUDED.updated_by,updated_at=NOW()`,
      [body.key, JSON.stringify(value), session.id],
    );
    await audit(client, session.id, 'automation.setting_changed', 'automation_setting', body.key, { value });
    return { body: { ok: true } };
  }

  if (pathname === '/api/admin/automation-runs' && req.method === 'GET') {
    const limit = Math.max(1, Math.min(200, Number(searchParams.get('limit') || 100)));
    const result = await client.query(
      `SELECT r.*,a.name automation_name,e.event_type
       FROM public.automation_runs r JOIN public.automations a ON a.id=r.automation_id
       LEFT JOIN public.outbox_events e ON e.id=r.trigger_event_id
       WHERE ($1::text IS NULL OR r.status=$1) ORDER BY r.created_at DESC LIMIT $2`,
      [searchParams.get('status'), limit],
    );
    return { body: { runs: result.rows } };
  }

  const runMatch = pathname.match(/^\/api\/admin\/automation-runs\/([0-9a-f-]+)$/i);
  if (runMatch && req.method === 'GET') {
    const id = uuid(runMatch[1], 'Execução');
    const [run, actions, approvals, aiRuns] = await Promise.all([
      client.query(`SELECT r.*,a.name automation_name,e.event_type FROM public.automation_runs r JOIN public.automations a ON a.id=r.automation_id LEFT JOIN public.outbox_events e ON e.id=r.trigger_event_id WHERE r.id=$1`, [id]),
      client.query('SELECT * FROM public.automation_action_runs WHERE automation_run_id=$1 ORDER BY created_at', [id]),
      client.query('SELECT * FROM public.approval_requests WHERE automation_run_id=$1 ORDER BY created_at', [id]),
      client.query('SELECT * FROM public.ai_runs WHERE automation_run_id=$1 ORDER BY created_at', [id]),
    ]);
    if (!run.rows[0]) fail('Execução não encontrada.', 404, 'NOT_FOUND');
    return { body: { run: run.rows[0], actions: actions.rows, approvals: approvals.rows, aiRuns: aiRuns.rows } };
  }

  const retryRun = pathname.match(/^\/api\/admin\/automation-runs\/([0-9a-f-]+)\/retry$/i);
  if (retryRun && req.method === 'POST') {
    const id = uuid(retryRun[1], 'Execução');
    const run = await client.query('SELECT trigger_event_id FROM public.automation_runs WHERE id=$1 AND status=\'failed\'', [id]);
    if (!run.rows[0]?.trigger_event_id) fail('Execução não pode ser reprocessada.', 409, 'RUN_NOT_RETRYABLE');
    await client.query('BEGIN');
    try {
      await client.query("UPDATE public.automation_runs SET status='queued',error_code=NULL,error_message=NULL,finished_at=NULL WHERE id=$1", [id]);
      await client.query("UPDATE public.automation_action_runs SET status='queued',error_code=NULL,error_message=NULL,finished_at=NULL WHERE automation_run_id=$1 AND status='failed'", [id]);
      await client.query("UPDATE public.outbox_events SET status='retry',available_at=NOW(),dead_lettered_at=NULL,discarded_at=NULL,last_error=NULL WHERE id=$1", [run.rows[0].trigger_event_id]);
      await audit(client, session.id, 'automation.run_retried', 'automation_run', id);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    return { body: { ok: true } };
  }

  if (pathname === '/api/admin/automation-dead-letter' && req.method === 'GET') {
    const result = await client.query("SELECT id,event_type,aggregate_type,aggregate_id,attempts,last_error,correlation_id,created_at,dead_lettered_at FROM public.outbox_events WHERE status='dead_letter' ORDER BY dead_lettered_at DESC LIMIT 200");
    return { body: { events: result.rows } };
  }

  const deadLetterAction = pathname.match(/^\/api\/admin\/automation-dead-letter\/([0-9a-f-]+)\/(retry|discard)$/i);
  if (deadLetterAction && req.method === 'POST') {
    const id = uuid(deadLetterAction[1], 'Evento');
    const retry = deadLetterAction[2] === 'retry';
    const result = await client.query(
      retry
        ? "UPDATE public.outbox_events SET status='retry',attempts=0,available_at=NOW(),dead_lettered_at=NULL,last_error=NULL WHERE id=$1 AND status='dead_letter' RETURNING id"
        : "UPDATE public.outbox_events SET status='discarded',discarded_at=NOW() WHERE id=$1 AND status='dead_letter' RETURNING id",
      [id],
    );
    if (!result.rows[0]) fail('Evento não encontrado na dead-letter.', 404, 'NOT_FOUND');
    await audit(client, session.id, `automation.dead_letter_${deadLetterAction[2]}`, 'outbox_event', id);
    return { body: { ok: true } };
  }

  if (pathname === '/api/admin/approvals' && req.method === 'GET') {
    await client.query("UPDATE public.approval_requests SET status='expired' WHERE status='pending' AND expires_at<=NOW()");
    const result = await client.query(
      `SELECT ap.*,a.name automation_name,ar.action_type FROM public.approval_requests ap
       JOIN public.automation_runs r ON r.id=ap.automation_run_id JOIN public.automations a ON a.id=r.automation_id
       LEFT JOIN public.automation_action_runs ar ON ar.id=ap.action_run_id
       WHERE ($1::text IS NULL OR ap.status=$1) ORDER BY ap.created_at DESC LIMIT 200`,
      [searchParams.get('status') || 'pending'],
    );
    return { body: { approvals: result.rows } };
  }

  const approvalAction = pathname.match(/^\/api\/admin\/approvals\/([0-9a-f-]+)\/(approve|reject|edit)$/i);
  if (approvalAction && req.method === 'POST') {
    const id = uuid(approvalAction[1], 'Aprovação');
    const body = await readJson(req);
    const approved = approvalAction[2] === 'approve';
    if (approvalAction[2] === 'edit') {
      if (!body.payload || typeof body.payload !== 'object' || Array.isArray(body.payload)) fail('Conteúdo editado inválido.');
      const edited = await client.query(
        `UPDATE public.approval_requests SET payload=$2,review_notes=$3 WHERE id=$1 AND status='pending' AND (expires_at IS NULL OR expires_at>NOW()) RETURNING *`,
        [id, JSON.stringify(body.payload), text(body.notes, 'Observação', 2000)],
      );
      if (!edited.rows[0]) fail('Aprovação indisponível ou expirada.', 409, 'APPROVAL_NOT_PENDING');
      await audit(client, session.id, 'automation.approval_edited', 'approval_request', id);
      return { body: { approval: edited.rows[0] } };
    }
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE public.approval_requests SET status=$2,reviewed_by=$3,reviewed_at=NOW(),review_notes=$4
         WHERE id=$1 AND status='pending' AND (expires_at IS NULL OR expires_at>NOW()) RETURNING *`,
        [id, approved ? 'approved' : 'rejected', session.id, text(body.notes, 'Observação', 2000)],
      );
      if (!result.rows[0]) fail('Aprovação indisponível ou expirada.', 409, 'APPROVAL_NOT_PENDING');
      if (approved) {
        await client.query(
          `INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key,correlation_id)
           VALUES('approval',$1,'automation.approval.approved',$2,$3,(SELECT correlation_id FROM public.automation_runs WHERE id=$4))
           ON CONFLICT(idempotency_key) DO NOTHING`,
          [id, JSON.stringify({ approvalId: id }), `approval-approved:${id}`, result.rows[0].automation_run_id],
        );
      } else {
        await client.query("UPDATE public.automation_action_runs SET status='cancelled',finished_at=NOW() WHERE id=$1", [result.rows[0].action_run_id]);
        await client.query("UPDATE public.automation_runs SET status='cancelled',finished_at=NOW() WHERE id=$1", [result.rows[0].automation_run_id]);
      }
      await audit(client, session.id, `automation.approval_${approvalAction[2]}`, 'approval_request', id, { notes: body.notes || null });
      await client.query('COMMIT');
      return { body: { approval: result.rows[0] } };
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (pathname === '/api/admin/ai/overview' && req.method === 'GET') {
    const [runs, providers, prompts] = await Promise.all([
      client.query(`SELECT COUNT(*)::int calls,COUNT(*) FILTER(WHERE status='completed')::int completed,COUNT(*) FILTER(WHERE status='failed')::int failed,COALESCE(SUM(tokens_input+tokens_output),0)::bigint tokens,COALESCE(SUM(cost_estimate),0)::numeric cost,COALESCE(AVG(latency_ms),0)::int avg_latency_ms FROM public.ai_runs WHERE created_at>=CURRENT_DATE`),
      client.query('SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE enabled)::int enabled FROM public.ai_providers'),
      client.query('SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE active)::int active FROM public.ai_prompt_versions'),
    ]);
    return { body: { runsToday: runs.rows[0], providers: providers.rows[0], prompts: prompts.rows[0] } };
  }

  if (pathname === '/api/admin/ai/providers' && req.method === 'GET') {
    const result = await client.query('SELECT provider_key,display_name,provider_type,base_url,api_key_env,enabled,timeout_ms,created_at,updated_at FROM public.ai_providers ORDER BY provider_key');
    return { body: { providers: result.rows } };
  }

  if (pathname === '/api/admin/ai/providers' && req.method === 'POST') {
    const body = await readJson(req);
    const providerKey = text(body.providerKey, 'Identificador', 80, true).toLowerCase();
    if (!/^[a-z0-9_-]+$/.test(providerKey)) fail('Identificador de provider inválido.');
    const baseUrl = text(body.baseUrl, 'URL', 500, true);
    let parsed;
    try { parsed = new URL(baseUrl); } catch { fail('URL do provider inválida.'); }
    if (parsed.protocol !== 'https:') fail('Provider deve utilizar HTTPS.');
    const apiKeyEnv = text(body.apiKeyEnv, 'Variável de credencial', 100, true);
    if (!/^(NEXTIA_AI_[A-Z0-9_]+|OPENAI_API_KEY|ANTHROPIC_API_KEY)$/.test(apiKeyEnv)) fail('Variável de credencial não permitida.');
    const result = await client.query(
      `INSERT INTO public.ai_providers(provider_key,display_name,provider_type,base_url,api_key_env,enabled,timeout_ms,created_by,updated_by)
       VALUES($1,$2,'openai_compatible',$3,$4,$5,$6,$7,$7)
       ON CONFLICT(provider_key) DO UPDATE SET display_name=EXCLUDED.display_name,base_url=EXCLUDED.base_url,api_key_env=EXCLUDED.api_key_env,enabled=EXCLUDED.enabled,timeout_ms=EXCLUDED.timeout_ms,updated_by=EXCLUDED.updated_by,updated_at=NOW()
       RETURNING provider_key,display_name,provider_type,base_url,api_key_env,enabled,timeout_ms`,
      [providerKey, text(body.displayName, 'Nome', 200, true), baseUrl, apiKeyEnv, body.enabled === true, Math.max(1000, Math.min(120000, Number(body.timeoutMs || 15000))), session.id],
    );
    await audit(client, session.id, 'ai.provider_saved', 'ai_provider', providerKey, { enabled: body.enabled === true });
    return { status: 201, body: { provider: result.rows[0] } };
  }

  if (pathname === '/api/admin/ai/models' && req.method === 'GET') {
    const result = await client.query('SELECT * FROM public.ai_models ORDER BY priority,model_key');
    return { body: { models: result.rows } };
  }

  if (pathname === '/api/admin/ai/models' && req.method === 'POST') {
    const body = await readJson(req);
    const modelKey = text(body.modelKey, 'Modelo', 100, true).toLowerCase();
    if (!/^[a-z0-9_.-]+$/.test(modelKey)) fail('Identificador de modelo inválido.');
    const result = await client.query(
      `INSERT INTO public.ai_models(model_key,provider_key,external_model_id,capabilities,enabled,priority,max_context,supports_tools,supports_json,cost_metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT(model_key) DO UPDATE SET provider_key=EXCLUDED.provider_key,external_model_id=EXCLUDED.external_model_id,capabilities=EXCLUDED.capabilities,enabled=EXCLUDED.enabled,priority=EXCLUDED.priority,max_context=EXCLUDED.max_context,supports_tools=EXCLUDED.supports_tools,supports_json=EXCLUDED.supports_json,cost_metadata=EXCLUDED.cost_metadata,updated_at=NOW() RETURNING *`,
      [modelKey, text(body.providerKey, 'Provider', 80, true), text(body.externalModelId, 'ID externo', 200, true), JSON.stringify(Array.isArray(body.capabilities) ? body.capabilities.slice(0, 20) : []),
        body.enabled === true, Math.max(1, Number(body.priority || 100)), body.maxContext ? Number(body.maxContext) : null, body.supportsTools === true, body.supportsJson !== false,
        JSON.stringify(body.costMetadata && typeof body.costMetadata === 'object' ? body.costMetadata : {})],
    );
    await audit(client, session.id, 'ai.model_saved', 'ai_model', modelKey, { enabled: body.enabled === true });
    return { status: 201, body: { model: result.rows[0] } };
  }

  if (pathname === '/api/admin/ai/prompts' && req.method === 'GET') {
    const result = await client.query('SELECT * FROM public.ai_prompt_versions ORDER BY prompt_key,version DESC');
    return { body: { prompts: result.rows } };
  }

  if (pathname === '/api/admin/ai/prompts' && req.method === 'POST') {
    const body = await readJson(req);
    const promptKey = text(body.promptKey, 'Prompt', 100, true).toLowerCase();
    if (!/^[a-z0-9_.-]+$/.test(promptKey)) fail('Identificador de prompt inválido.');
    await client.query('BEGIN');
    try {
      const version = await client.query('SELECT COALESCE(MAX(version),0)+1 next FROM public.ai_prompt_versions WHERE prompt_key=$1', [promptKey]);
      if (body.active === true) await client.query('UPDATE public.ai_prompt_versions SET active=FALSE WHERE prompt_key=$1', [promptKey]);
      const result = await client.query(
        `INSERT INTO public.ai_prompt_versions(prompt_key,purpose,version,system_template,input_schema,output_schema,active,created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [promptKey, text(body.purpose, 'Finalidade', 100, true), version.rows[0].next, text(body.systemTemplate, 'Instrução de sistema', 10000, true),
          JSON.stringify(body.inputSchema && typeof body.inputSchema === 'object' ? body.inputSchema : {}), JSON.stringify(body.outputSchema && typeof body.outputSchema === 'object' ? body.outputSchema : {}), body.active === true, session.id],
      );
      await audit(client, session.id, 'ai.prompt_created', 'ai_prompt', result.rows[0].id, { promptKey, version: result.rows[0].version });
      await client.query('COMMIT');
      return { status: 201, body: { prompt: result.rows[0] } };
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (pathname === '/api/admin/ai/runs' && req.method === 'GET') {
    const result = await client.query('SELECT * FROM public.ai_runs WHERE ($1::text IS NULL OR status=$1) ORDER BY created_at DESC LIMIT 200', [searchParams.get('status')]);
    return { body: { runs: result.rows } };
  }

  const feedbackMatch = pathname.match(/^\/api\/admin\/ai\/runs\/([0-9a-f-]+)\/feedback$/i);
  if (feedbackMatch && req.method === 'POST') {
    const body = await readJson(req);
    if (!['correct','incorrect','edited'].includes(body.feedback)) fail('Feedback inválido.');
    const result = await client.query('UPDATE public.ai_runs SET feedback=$2 WHERE id=$1 RETURNING id,feedback', [uuid(feedbackMatch[1], 'Execução de IA'), body.feedback]);
    if (!result.rows[0]) fail('Execução de IA não encontrada.', 404, 'NOT_FOUND');
    await audit(client, session.id, 'ai.feedback_recorded', 'ai_run', result.rows[0].id, { feedback: body.feedback });
    return { body: { run: result.rows[0] } };
  }

  return { status: 404, body: { error: 'Rota de automação não encontrada.' } };
}
