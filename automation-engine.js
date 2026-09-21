import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { AIService } from './ai-service.js';
import {
  AutomationError,
  evaluateConditions,
  isUuid,
  retryDelaySeconds,
  sanitizeForLog,
  validateAction,
} from './automation-core.js';

const DEFAULT_MAX_ATTEMPTS = 5;
const EXTERNAL_ACTIONS = new Set(['call_webhook']);

function settingEnabled(value) {
  return value === true || value === 'true' || value?.enabled === true;
}

function payloadObject(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { throw new AutomationError('Payload de evento inválido.', { code: 'INVALID_EVENT_PAYLOAD' }); }
}

function eventContext(event) {
  const payload = payloadObject(event.payload);
  return {
    event: { id: event.id, type: event.event_type, aggregateType: event.aggregate_type, aggregateId: event.aggregate_id },
    payload,
    ...payload,
  };
}

async function resolveCrmRelations(client, event) {
  const payload = payloadObject(event.payload);
  let leadId = payload.leadId || payload.lead_id || null;
  let opportunityId = payload.opportunityId || payload.opportunity_id || null;
  let customerProfileId = payload.customerId || payload.customer_id || payload.customerProfileId || null;
  const aggregateId = isUuid(event.aggregate_id) ? event.aggregate_id : null;
  if (!leadId && event.aggregate_type === 'crm_lead') leadId = aggregateId;
  if (!opportunityId && event.aggregate_type === 'crm_opportunity') opportunityId = aggregateId;
  if (event.aggregate_type === 'crm_proposal' && aggregateId) {
    const result = await client.query(
      `SELECT p.opportunity_id,o.lead_id FROM public.crm_proposals p
       JOIN public.crm_opportunities o ON o.id=p.opportunity_id WHERE p.id=$1`,
      [aggregateId],
    );
    opportunityId ||= result.rows[0]?.opportunity_id || null;
    leadId ||= result.rows[0]?.lead_id || null;
  }
  if (!leadId && opportunityId) {
    const result = await client.query('SELECT lead_id,customer_profile_id FROM public.crm_opportunities WHERE id=$1', [opportunityId]);
    leadId = result.rows[0]?.lead_id || null;
    customerProfileId ||= result.rows[0]?.customer_profile_id || null;
  }
  return {
    leadId: isUuid(leadId) ? leadId : null,
    opportunityId: isUuid(opportunityId) ? opportunityId : null,
    customerProfileId: isUuid(customerProfileId) ? customerProfileId : null,
  };
}

async function getSetting(client, key, fallback = null) {
  const result = await client.query('SELECT value FROM public.automation_settings WHERE key=$1', [key]);
  return result.rows[0]?.value ?? fallback;
}

export class AutomationEngine {
  constructor(client, { workerId = `worker-${randomUUID()}`, fetchImpl = globalThis.fetch, maxAttempts = DEFAULT_MAX_ATTEMPTS } = {}) {
    this.client = client;
    this.workerId = workerId;
    this.fetchImpl = fetchImpl;
    this.maxAttempts = Math.max(1, Math.min(10, Number(maxAttempts) || DEFAULT_MAX_ATTEMPTS));
  }

  async claimEvents(limit = 10) {
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10));
    await this.client.query('BEGIN');
    try {
      await this.client.query(
        `UPDATE public.outbox_events SET status='retry',locked_at=NULL,locked_by=NULL,available_at=NOW()
         WHERE status='processing' AND locked_at < NOW()-INTERVAL '10 minutes' AND attempts < $1`,
        [this.maxAttempts],
      );
      await this.client.query(
        `UPDATE public.outbox_events SET status='dead_letter',dead_lettered_at=NOW(),locked_at=NULL,locked_by=NULL
         WHERE status='processing' AND locked_at < NOW()-INTERVAL '10 minutes' AND attempts >= $1`,
        [this.maxAttempts],
      );
      const result = await this.client.query(
        `WITH candidates AS (
           SELECT id FROM public.outbox_events
           WHERE status IN ('pending','retry') AND available_at<=NOW()
           ORDER BY priority,available_at,created_at
           FOR UPDATE SKIP LOCKED LIMIT $1
         )
         UPDATE public.outbox_events e
         SET status='processing',locked_at=NOW(),locked_by=$2,attempts=e.attempts+1
         FROM candidates c WHERE e.id=c.id RETURNING e.*`,
        [safeLimit, this.workerId],
      );
      await this.client.query('COMMIT');
      return result.rows;
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  async processBatch(limit = 10) {
    await this.enqueueDueSchedules();
    const events = await this.claimEvents(limit);
    const summary = { claimed: events.length, completed: 0, retried: 0, deadLettered: 0 };
    for (const event of events) {
      const outcome = await this.processEvent(event);
      if (outcome === 'completed') summary.completed += 1;
      else if (outcome === 'retry') summary.retried += 1;
      else summary.deadLettered += 1;
    }
    return summary;
  }

  async enqueueDueSchedules(limit = 25) {
    await this.client.query('BEGIN');
    try {
      const due = await this.client.query(
        `SELECT id,trigger_config,next_trigger_at FROM public.automations
         WHERE status='active' AND trigger_type='schedule' AND next_trigger_at<=NOW()
         ORDER BY next_trigger_at FOR UPDATE SKIP LOCKED LIMIT $1`,
        [Math.max(1, Math.min(100, Number(limit) || 25))],
      );
      for (const automation of due.rows) {
        const interval = Math.max(1, Math.min(525600, Number(automation.trigger_config?.intervalMinutes) || 60));
        const slot = new Date(automation.next_trigger_at).toISOString();
        await this.client.query(
          `INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key)
           VALUES('automation',$1,'automation.schedule.due',$2,$3) ON CONFLICT(idempotency_key) DO NOTHING`,
          [automation.id, JSON.stringify({ automationId: automation.id, scheduledFor: slot }), `automation.schedule:${automation.id}:${slot}`],
        );
        await this.client.query('UPDATE public.automations SET next_trigger_at=GREATEST(NOW(),next_trigger_at)+($2*INTERVAL \'1 minute\') WHERE id=$1', [automation.id, interval]);
      }
      await this.client.query('COMMIT');
      return due.rowCount;
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  async processEvent(event) {
    try {
      if (!settingEnabled(await getSetting(this.client, 'automation.enabled', true))) {
        await this.releaseEvent(event.id, 60);
        return 'retry';
      }
      if (event.event_type === 'automation.approval.approved') {
        const approvalId = payloadObject(event.payload).approvalId;
        await this.executeApprovedAction(approvalId);
      } else {
        const directAutomationId = ['automation.schedule.due','automation.manual.requested'].includes(event.event_type) ? payloadObject(event.payload).automationId : null;
        const automations = await this.client.query(
          `SELECT a.*,v.actions_snapshot,v.conditions_snapshot
           FROM public.automations a
           JOIN public.automation_versions v ON v.automation_id=a.id AND v.version=a.current_version
           WHERE a.status='active' AND (
             (a.trigger_type='event' AND ((a.trigger_config->'events') ? $1 OR a.trigger_config->>'event'=$1))
             OR (a.trigger_type IN ('schedule','manual') AND a.id=$2)
           )
           ORDER BY a.created_at,a.id`,
          [event.event_type, isUuid(directAutomationId) ? directAutomationId : null],
        );
        for (const automation of automations.rows) await this.runAutomation(automation, event);
      }
      await this.client.query(
        `UPDATE public.outbox_events SET status='completed',processed_at=NOW(),locked_at=NULL,locked_by=NULL,last_error=NULL WHERE id=$1 AND locked_by=$2`,
        [event.id, this.workerId],
      );
      return 'completed';
    } catch (error) {
      const retryable = error.retryable !== false;
      const attempts = Number(event.attempts || 1);
      if (retryable && attempts < this.maxAttempts) {
        const delay = retryDelaySeconds(attempts);
        await this.client.query(
          `UPDATE public.outbox_events SET status='retry',available_at=NOW()+($2*INTERVAL '1 second'),locked_at=NULL,locked_by=NULL,last_error=$3 WHERE id=$1`,
          [event.id, delay, String(error.message || error).slice(0, 1000)],
        );
        return 'retry';
      }
      await this.client.query(
        `UPDATE public.outbox_events SET status='dead_letter',dead_lettered_at=NOW(),locked_at=NULL,locked_by=NULL,last_error=$2 WHERE id=$1`,
        [event.id, String(error.message || error).slice(0, 1000)],
      );
      return 'dead_letter';
    }
  }

  async releaseEvent(eventId, delaySeconds) {
    await this.client.query(
      `UPDATE public.outbox_events SET status='retry',available_at=NOW()+($2*INTERVAL '1 second'),locked_at=NULL,locked_by=NULL WHERE id=$1`,
      [eventId, delaySeconds],
    );
  }

  async dryRun(automation, payload = {}) {
    const fakeEvent = {
      id: randomUUID(), event_type: payload.eventType || 'manual.test', aggregate_type: payload.entityType || 'test',
      aggregate_id: isUuid(payload.entityId) ? payload.entityId : randomUUID(), payload: payload.payload || {}, correlation_id: randomUUID(),
    };
    const conditions = evaluateConditions(automation.conditions_snapshot || automation.conditions, eventContext(fakeEvent));
    return {
      matched: conditions.matched,
      conditions,
      actions: (automation.actions_snapshot || []).map((action) => ({ id: action.id, type: action.type, wouldExecute: conditions.matched })),
    };
  }

  async runAutomation(automation, event) {
    const conditions = evaluateConditions(automation.conditions_snapshot, eventContext(event));
    const runResult = await this.client.query(
      `INSERT INTO public.automation_runs
        (automation_id,automation_version,trigger_event_id,entity_type,entity_id,status,attempt,correlation_id,dry_run,context_snapshot,evaluated_conditions,started_at)
       VALUES($1,$2,$3,$4,$5,'running',$6,$7,$8,$9,$10,NOW())
       ON CONFLICT (automation_id,trigger_event_id,automation_version) DO UPDATE SET
         status=CASE WHEN automation_runs.status IN ('failed','queued') THEN 'running' ELSE automation_runs.status END,
         attempt=GREATEST(automation_runs.attempt,EXCLUDED.attempt),started_at=COALESCE(automation_runs.started_at,NOW()),
         error_code=NULL,error_message=NULL
       RETURNING *`,
      [automation.id, automation.current_version, event.id, event.aggregate_type, event.aggregate_id, event.attempts || 1,
        event.correlation_id, automation.dry_run, JSON.stringify(sanitizeForLog(eventContext(event))), JSON.stringify(conditions)],
    );
    const run = runResult.rows[0];
    if (['completed','dry_run','cancelled'].includes(run.status)) return run;
    if (!conditions.matched || automation.dry_run) {
      await this.client.query(
        `UPDATE public.automation_runs SET status=$2,finished_at=NOW() WHERE id=$1`,
        [run.id, automation.dry_run ? 'dry_run' : 'completed'],
      );
      return run;
    }
    let waitingApproval = false;
    try {
      for (const rawAction of automation.actions_snapshot || []) {
        const action = validateAction(rawAction);
        const result = await this.executeAction({ action, automation, run, event });
        waitingApproval ||= result.waitingApproval === true;
      }
      await this.client.query(
        `UPDATE public.automation_runs SET status=$2,finished_at=CASE WHEN $2='completed' THEN NOW() ELSE NULL END WHERE id=$1`,
        [run.id, waitingApproval ? 'waiting_approval' : 'completed'],
      );
      await this.client.query('UPDATE public.automations SET last_run_at=NOW() WHERE id=$1', [automation.id]);
      return run;
    } catch (error) {
      await this.client.query(
        `UPDATE public.automation_runs SET status='failed',error_code=$2,error_message=$3,finished_at=NOW() WHERE id=$1`,
        [run.id, error.code || 'ACTION_FAILED', String(error.message || error).slice(0, 1000)],
      );
      throw error;
    }
  }

  async executeAction({ action, automation, run, event, approved = false }) {
    const idempotencyKey = `${run.id}:${action.id}`;
    const existing = await this.client.query('SELECT * FROM public.automation_action_runs WHERE idempotency_key=$1', [idempotencyKey]);
    if (existing.rows[0]?.status === 'completed' || existing.rows[0]?.status === 'dry_run') return { skipped: true };
    const actionRunResult = await this.client.query(
      `INSERT INTO public.automation_action_runs(automation_run_id,action_key,action_type,status,idempotency_key,input_data)
       VALUES($1,$2,$3,'queued',$4,$5)
       ON CONFLICT(idempotency_key) DO UPDATE SET error_code=NULL,error_message=NULL RETURNING *`,
      [run.id, action.id, action.type, idempotencyKey, JSON.stringify(sanitizeForLog(action.config))],
    );
    const actionRun = actionRunResult.rows[0];
    const needsApproval = !approved && (action.requiresApproval || automation.requires_approval || automation.risk_level >= 2 || EXTERNAL_ACTIONS.has(action.type));
    if (needsApproval) {
      await this.client.query("UPDATE public.automation_action_runs SET status='waiting_approval' WHERE id=$1", [actionRun.id]);
      await this.client.query(
        `INSERT INTO public.approval_requests(automation_run_id,action_run_id,type,entity_type,entity_id,payload,status,expires_at)
         VALUES($1,$2,$3,$4,$5,$6,'pending',NOW()+INTERVAL '7 days') ON CONFLICT DO NOTHING`,
        [run.id, actionRun.id, action.type, run.entity_type, run.entity_id, JSON.stringify({ action: sanitizeForLog(action), eventType: event.event_type })],
      );
      return { waitingApproval: true };
    }

    if (action.type === 'ai_generate' || action.type === 'call_webhook') {
      await this.client.query("UPDATE public.automation_action_runs SET status='running',started_at=NOW() WHERE id=$1", [actionRun.id]);
      try {
        const output = action.type === 'ai_generate'
          ? await this.executeAiAction(action, run, event)
          : await this.executeWebhookAction(action, run, event, idempotencyKey);
        await this.client.query(
          `UPDATE public.automation_action_runs SET status='completed',output_data=$2,finished_at=NOW() WHERE id=$1`,
          [actionRun.id, JSON.stringify(sanitizeForLog(output))],
        );
        return { output };
      } catch (error) {
        await this.client.query(
          `UPDATE public.automation_action_runs SET status='failed',error_code=$2,error_message=$3,finished_at=NOW() WHERE id=$1`,
          [actionRun.id, error.code || 'EXTERNAL_ACTION_FAILED', String(error.message || error).slice(0, 1000)],
        );
        throw error;
      }
    }

    await this.client.query('BEGIN');
    try {
      await this.client.query("UPDATE public.automation_action_runs SET status='running',started_at=NOW() WHERE id=$1", [actionRun.id]);
      const output = await this.executeInternalAction(action, run, event, actionRun.id);
      await this.client.query(
        `UPDATE public.automation_action_runs SET status='completed',output_data=$2,finished_at=NOW() WHERE id=$1`,
        [actionRun.id, JSON.stringify(sanitizeForLog(output))],
      );
      await this.client.query('COMMIT');
      return { output };
    } catch (error) {
      await this.client.query('ROLLBACK');
      await this.client.query(
        `UPDATE public.automation_action_runs SET status='failed',error_code=$2,error_message=$3,finished_at=NOW() WHERE id=$1`,
        [actionRun.id, error.code || 'ACTION_FAILED', String(error.message || error).slice(0, 1000)],
      ).catch(() => undefined);
      throw error;
    }
  }

  async executeInternalAction(action, run, event, actionRunId) {
    if (action.type === 'assign_lead') return this.assignLead(event);
    if (action.type === 'create_crm_activity') return this.createCrmActivity(action, event, actionRunId);
    if (action.type === 'notify_admins') return this.notifyAdmins(action, actionRunId);
    if (action.type === 'prefill_project_briefing') return this.prefillProjectBriefing(event);
    if (action.type === 'create_project_milestones') return this.createProjectMilestones(action, event, actionRunId);
    throw new AutomationError('Ação interna não suportada.', { code: 'UNSUPPORTED_ACTION', retryable: false });
  }

  async assignLead(event) {
    const { leadId } = await resolveCrmRelations(this.client, event);
    if (!leadId) return { skipped: 'lead_not_found' };
    const current = await this.client.query('SELECT assigned_user_id FROM public.crm_leads WHERE id=$1 FOR UPDATE', [leadId]);
    if (!current.rows[0]) return { skipped: 'lead_not_found' };
    if (current.rows[0].assigned_user_id) return { skipped: 'already_assigned', assignedUserId: current.rows[0].assigned_user_id };
    const owner = await this.client.query(
      `SELECT p.id,COUNT(l.id)::int AS open_leads FROM public.profiles p
       LEFT JOIN public.crm_leads l ON l.assigned_user_id=p.id AND l.archived_at IS NULL AND l.status NOT IN ('won','lost','archived')
       WHERE p.role='admin' GROUP BY p.id ORDER BY open_leads,p.id LIMIT 1`,
    );
    if (!owner.rows[0]) return { skipped: 'no_eligible_owner' };
    await this.client.query('UPDATE public.crm_leads SET assigned_user_id=$2,updated_at=NOW() WHERE id=$1', [leadId, owner.rows[0].id]);
    await this.client.query(
      `INSERT INTO public.crm_lead_history(lead_id,action,actor_id,metadata) VALUES($1,'assigned',NULL,$2)`,
      [leadId, JSON.stringify({ source: 'automation', assignedUserId: owner.rows[0].id })],
    );
    return { leadId, assignedUserId: owner.rows[0].id };
  }

  async createCrmActivity(action, event, actionRunId) {
    const { leadId, opportunityId, customerProfileId } = await resolveCrmRelations(this.client, event);
    if (!leadId && !opportunityId && !customerProfileId) return { skipped: 'crm_entity_not_found' };
    const dueMinutes = Math.max(0, Math.min(525600, Number(action.config.dueInMinutes || 0)));
    const type = ['note','task','follow_up','call','email','whatsapp','meeting','proposal','other'].includes(action.config.activityType)
      ? action.config.activityType : 'task';
    const result = await this.client.query(
      `INSERT INTO public.crm_activities
        (lead_id,opportunity_id,customer_profile_id,type,title,description,status,scheduled_at,assigned_user_id,created_by,automation_action_run_id)
       SELECT $1,$2,$3,$4,$5,$6,'pending',NOW()+($7*INTERVAL '1 minute'),COALESCE(o.assigned_user_id,l.assigned_user_id),NULL,$8
       FROM (SELECT 1) x
       LEFT JOIN public.crm_leads l ON l.id=$1
       LEFT JOIN public.crm_opportunities o ON o.id=$2
       ON CONFLICT (automation_action_run_id) WHERE automation_action_run_id IS NOT NULL DO UPDATE SET updated_at=NOW()
       RETURNING id,scheduled_at`,
      [leadId, opportunityId, customerProfileId, type, String(action.config.title || 'Atividade automática').slice(0, 300),
        String(action.config.description || '').slice(0, 2000) || null, dueMinutes, actionRunId],
    );
    return { activityId: result.rows[0]?.id, scheduledAt: result.rows[0]?.scheduled_at };
  }

  async notifyAdmins(action, actionRunId) {
    const title = String(action.config.title || 'Automação Nextia').trim().slice(0, 200);
    const message = String(action.config.message || 'Uma automação requer atenção.').trim().slice(0, 1000);
    const type = String(action.config.notificationType || 'automation').slice(0, 50);
    const result = await this.client.query(
      `INSERT INTO public.notifications(user_id,title,message,type,automation_action_run_id)
       SELECT id,$1,$2,$3,$4 FROM public.profiles WHERE role='admin'
       ON CONFLICT (automation_action_run_id,user_id) WHERE automation_action_run_id IS NOT NULL DO NOTHING RETURNING id`,
      [title, message, type, actionRunId],
    );
    return { notificationsCreated: result.rowCount };
  }

  async prefillProjectBriefing(event) {
    const payload = payloadObject(event.payload);
    const engagementId = isUuid(payload.engagementId || payload.engagement_id)
      ? payload.engagementId || payload.engagement_id
      : event.aggregate_type === 'engagement' && isUuid(event.aggregate_id) ? event.aggregate_id : null;
    const orderId = isUuid(payload.orderId || payload.order_id) ? payload.orderId || payload.order_id : null;
    if (!engagementId && !orderId) return { skipped: 'engagement_not_found' };
    const result = await this.client.query(
      `UPDATE public.projects p SET briefing=COALESCE(p.briefing,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
         'prefilledBy','automation','serviceSlug',p.service_slug,'workflowKey',p.workflow_key,'engagementId',p.engagement_id,'orderId',p.source_order_id
       )),updated_at=NOW()
       WHERE ($1::uuid IS NOT NULL AND p.engagement_id=$1) OR ($2::uuid IS NOT NULL AND p.source_order_id=$2)
       RETURNING p.id`,
      [engagementId, orderId],
    );
    return result.rows[0] ? { projectId: result.rows[0].id } : { skipped: 'project_not_ready' };
  }

  async createProjectMilestones(action, event, actionRunId) {
    const payload = payloadObject(event.payload);
    const projectId = isUuid(payload.projectId || payload.project_id)
      ? payload.projectId || payload.project_id
      : event.aggregate_type === 'project' && isUuid(event.aggregate_id) ? event.aggregate_id : null;
    if (!projectId) return { skipped: 'project_not_found' };
    const tasks = Array.isArray(action.config.tasks) ? action.config.tasks.slice(0, 20) : [];
    let created = 0;
    for (const [position, task] of tasks.entries()) {
      const result = await this.client.query(
        `INSERT INTO public.milestones(project_id,title,description,status,position,estimated_at,automation_action_run_id)
         VALUES($1,$2,$3,'pendente',$4,NOW()+(($5::int)*INTERVAL '1 day'),$6)
         ON CONFLICT (automation_action_run_id,title) WHERE automation_action_run_id IS NOT NULL DO NOTHING RETURNING id`,
        [projectId, String(task.title || `Tarefa ${position + 1}`).slice(0, 300), String(task.description || '').slice(0, 2000), position,
          Math.max(0, Math.min(365, Number(task.dueInDays || position + 1))), actionRunId],
      );
      created += result.rowCount;
    }
    return { milestonesCreated: created };
  }

  async executeAiAction(action, run, event) {
    const service = new AIService(this.client, { fetchImpl: this.fetchImpl });
    return service.generate({
      purpose: String(action.config.purpose || 'summary'),
      source: eventContext(event),
      entityType: run.entity_type,
      entityId: run.entity_id,
      automationRunId: run.id,
    });
  }

  async executeWebhookAction(action, run, event, idempotencyKey) {
    if (!settingEnabled(await getSetting(this.client, 'automation.external_actions_enabled', false))) {
      throw new AutomationError('Ações externas estão desativadas.', { code: 'EXTERNAL_ACTIONS_DISABLED', retryable: false });
    }
    const maxPerMinute = Math.max(1, Number(await getSetting(this.client, 'webhooks.max_calls_per_minute', 60)) || 60);
    const recent = await this.client.query("SELECT COUNT(*)::int calls FROM public.automation_action_runs WHERE action_type='call_webhook' AND started_at>=NOW()-INTERVAL '1 minute'");
    if (recent.rows[0].calls >= maxPerMinute) throw new AutomationError('Limite temporário de webhooks atingido.', { code: 'WEBHOOK_RATE_LIMIT', retryable: true, status: 429 });
    const url = new URL(String(action.config.url || ''));
    const allowedHosts = await getSetting(this.client, 'webhooks.allowed_hosts', []);
    if (url.protocol !== 'https:' || !Array.isArray(allowedHosts) || !allowedHosts.includes(url.hostname)) {
      throw new AutomationError('Destino do webhook não autorizado.', { code: 'WEBHOOK_DESTINATION_DENIED', retryable: false });
    }
    const secret = process.env.NEXTIA_WEBHOOK_SECRET;
    if (!secret) throw new AutomationError('Segredo de webhook não configurado.', { code: 'WEBHOOK_SECRET_MISSING', retryable: false });
    const body = JSON.stringify({ event: event.event_type, aggregateId: event.aggregate_id, correlationId: run.correlation_id, payload: payloadObject(event.payload) });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
    const response = await this.fetchImpl(url, {
      method: 'POST', body, signal: AbortSignal.timeout(Math.max(1000, Math.min(30000, Number(action.config.timeoutMs || 10000)))),
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey, 'X-Nextia-Timestamp': timestamp, 'X-Nextia-Signature': signature },
    });
    if (!response.ok) throw new AutomationError(`Webhook respondeu ${response.status}.`, { code: `WEBHOOK_HTTP_${response.status}`, retryable: response.status === 408 || response.status === 429 || response.status >= 500 });
    return { status: response.status };
  }

  async executeApprovedAction(approvalId) {
    if (!isUuid(approvalId)) throw new AutomationError('Aprovação inválida.', { code: 'INVALID_APPROVAL', retryable: false });
    const result = await this.client.query(
      `SELECT ar.action_key,ap.payload AS approval_payload,r.*,a.requires_approval,a.risk_level,v.actions_snapshot,e.event_type,e.aggregate_type,e.aggregate_id,e.payload,e.correlation_id
       FROM public.approval_requests ap
       JOIN public.automation_action_runs ar ON ar.id=ap.action_run_id
       JOIN public.automation_runs r ON r.id=ap.automation_run_id
       JOIN public.automations a ON a.id=r.automation_id
       JOIN public.automation_versions v ON v.automation_id=r.automation_id AND v.version=r.automation_version
       JOIN public.outbox_events e ON e.id=r.trigger_event_id
       WHERE ap.id=$1 AND ap.status='approved'`,
      [approvalId],
    );
    const row = result.rows[0];
    if (!row) throw new AutomationError('Aprovação não encontrada ou não aprovada.', { code: 'APPROVAL_NOT_READY', retryable: false });
    const historicalAction = (row.actions_snapshot || []).find((item) => item.id === row.action_key);
    if (!historicalAction) throw new AutomationError('Ação aprovada não existe na versão histórica.', { code: 'APPROVED_ACTION_MISSING', retryable: false });
    const editedAction = row.approval_payload?.action;
    if (editedAction && (editedAction.id !== historicalAction.id || editedAction.type !== historicalAction.type)) {
      throw new AutomationError('A edição não pode trocar a identidade ou o tipo da ação.', { code: 'APPROVAL_EDIT_INVALID', retryable: false });
    }
    const action = validateAction(editedAction || historicalAction);
    const event = { id: row.trigger_event_id, event_type: row.event_type, aggregate_type: row.aggregate_type, aggregate_id: row.aggregate_id, payload: row.payload, correlation_id: row.correlation_id };
    const output = await this.executeAction({ action, automation: row, run: row, event, approved: true });
    const pending = await this.client.query("SELECT 1 FROM public.approval_requests WHERE automation_run_id=$1 AND status='pending' LIMIT 1", [row.id]);
    if (!pending.rows[0]) await this.client.query("UPDATE public.automation_runs SET status='completed',finished_at=NOW() WHERE id=$1", [row.id]);
    return output;
  }
}

export function safeSecretEquals(received, expected) {
  if (!received || !expected) return false;
  const left = Buffer.from(String(received));
  const right = Buffer.from(String(expected));
  return left.length === right.length && timingSafeEqual(left, right);
}

export class AutomationWorker {
  constructor(clientFactory, { intervalMs = 5000, batchSize = 10, maxAttempts = DEFAULT_MAX_ATTEMPTS } = {}) {
    this.clientFactory = clientFactory;
    this.intervalMs = Math.max(1000, Number(intervalMs) || 5000);
    this.batchSize = Math.max(1, Math.min(50, Number(batchSize) || 10));
    this.maxAttempts = maxAttempts;
    this.timer = null;
    this.running = false;
  }

  start() {
    if (this.timer) return;
    const tick = async () => {
      if (this.running) return;
      this.running = true;
      const client = this.clientFactory();
      try {
        await client.connect();
        const engine = new AutomationEngine(client, { maxAttempts: this.maxAttempts });
        await engine.processBatch(this.batchSize);
      } catch (error) {
        console.error('[AUTOMATION_WORKER]', { code: error.code, message: String(error.message || error).slice(0, 500) });
      } finally {
        await client.end().catch(() => undefined);
        this.running = false;
      }
    };
    void tick();
    this.timer = setInterval(() => void tick(), this.intervalMs);
    this.timer.unref?.();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
