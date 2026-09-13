-- Etapa 8: automacao operacional e IA.
-- Evolui a outbox existente; nao cria fila/event bus paralelo.

ALTER TABLE public.outbox_events
  ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS locked_by TEXT,
  ADD COLUMN IF NOT EXISTS correlation_id UUID,
  ADD COLUMN IF NOT EXISTS dead_lettered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discarded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS priority SMALLINT NOT NULL DEFAULT 100;

UPDATE public.outbox_events SET correlation_id = gen_random_uuid() WHERE correlation_id IS NULL;
ALTER TABLE public.outbox_events ALTER COLUMN correlation_id SET DEFAULT gen_random_uuid();
ALTER TABLE public.outbox_events ALTER COLUMN correlation_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_claimable
  ON public.outbox_events(priority, available_at, created_at)
  WHERE status IN ('pending', 'retry');
CREATE INDEX IF NOT EXISTS idx_outbox_dead_letter
  ON public.outbox_events(dead_lettered_at DESC)
  WHERE status = 'dead_letter';
CREATE INDEX IF NOT EXISTS idx_outbox_correlation ON public.outbox_events(correlation_id);

CREATE TABLE IF NOT EXISTS public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','archived')),
  trigger_type TEXT NOT NULL DEFAULT 'event' CHECK (trigger_type IN ('event','schedule','manual','webhook','temporal')),
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB NOT NULL DEFAULT '{"operator":"and","rules":[]}'::jsonb,
  current_version INTEGER NOT NULL DEFAULT 1 CHECK (current_version > 0),
  risk_level SMALLINT NOT NULL DEFAULT 0 CHECK (risk_level BETWEEN 0 AND 3),
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  dry_run BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_run_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS next_trigger_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_automations_trigger_status
  ON public.automations(trigger_type, status);
CREATE INDEX IF NOT EXISTS idx_automations_schedule_due
  ON public.automations(next_trigger_at) WHERE status='active' AND trigger_type='schedule';

CREATE TABLE IF NOT EXISTS public.automation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE RESTRICT,
  version INTEGER NOT NULL CHECK (version > 0),
  trigger_snapshot JSONB NOT NULL,
  conditions_snapshot JSONB NOT NULL,
  actions_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_automation_version UNIQUE (automation_id, version)
);

CREATE TABLE IF NOT EXISTS public.automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE RESTRICT,
  automation_version INTEGER NOT NULL,
  trigger_event_id UUID REFERENCES public.outbox_events(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','waiting','waiting_approval','completed','failed','cancelled','dry_run')),
  attempt INTEGER NOT NULL DEFAULT 1 CHECK (attempt > 0),
  error_code TEXT,
  error_message TEXT,
  correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  dry_run BOOLEAN NOT NULL DEFAULT FALSE,
  context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  evaluated_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_automation_event_version UNIQUE (automation_id, trigger_event_id, automation_version)
);

CREATE INDEX IF NOT EXISTS idx_automation_runs_status_created
  ON public.automation_runs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_runs_correlation
  ON public.automation_runs(correlation_id);

CREATE TABLE IF NOT EXISTS public.automation_action_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_run_id UUID NOT NULL REFERENCES public.automation_runs(id) ON DELETE CASCADE,
  action_key TEXT NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','waiting_approval','completed','failed','cancelled','dry_run')),
  idempotency_key TEXT NOT NULL UNIQUE,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_data JSONB,
  error_code TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_action_per_run UNIQUE (automation_run_id, action_key)
);

CREATE INDEX IF NOT EXISTS idx_automation_action_runs_status
  ON public.automation_action_runs(status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_run_id UUID NOT NULL REFERENCES public.automation_runs(id) ON DELETE CASCADE,
  action_run_id UUID REFERENCES public.automation_action_runs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired','cancelled')),
  review_notes TEXT,
  expires_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unq_pending_approval_action
  ON public.approval_requests(action_run_id)
  WHERE action_run_id IS NOT NULL AND status = 'pending';
CREATE INDEX IF NOT EXISTS idx_approval_requests_queue
  ON public.approval_requests(status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.automation_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.automation_settings(key,value,description) VALUES
  ('automation.enabled','true'::jsonb,'Kill switch global de automacoes'),
  ('automation.external_actions_enabled','false'::jsonb,'Acoes externas permanecem desativadas por padrao'),
  ('ai.enabled','false'::jsonb,'IA permanece desativada ate existir provider configurado'),
  ('ai.max_calls_per_minute','30'::jsonb,'Limite global conservador de chamadas de IA'),
  ('webhooks.max_calls_per_minute','60'::jsonb,'Limite global conservador de webhooks de saida'),
  ('whatsapp.enabled','false'::jsonb,'Envio automatico de WhatsApp desativado por padrao'),
  ('email.enabled','false'::jsonb,'Envio automatico de e-mail desativado por padrao')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ai_providers (
  provider_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'openai_compatible',
  base_url TEXT NOT NULL,
  api_key_env TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  timeout_ms INTEGER NOT NULL DEFAULT 15000 CHECK (timeout_ms BETWEEN 1000 AND 120000),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_models (
  model_key TEXT PRIMARY KEY,
  provider_key TEXT NOT NULL REFERENCES public.ai_providers(provider_key) ON DELETE RESTRICT,
  external_model_id TEXT NOT NULL,
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  priority INTEGER NOT NULL DEFAULT 100,
  max_context INTEGER,
  supports_tools BOOLEAN NOT NULL DEFAULT FALSE,
  supports_json BOOLEAN NOT NULL DEFAULT TRUE,
  cost_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_models_routing
  ON public.ai_models(enabled, priority, model_key);

CREATE TABLE IF NOT EXISTS public.ai_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key TEXT NOT NULL,
  purpose TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  system_template TEXT NOT NULL,
  input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_ai_prompt_version UNIQUE (prompt_key, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS unq_active_prompt_key
  ON public.ai_prompt_versions(prompt_key) WHERE active;

INSERT INTO public.ai_prompt_versions(prompt_key,purpose,version,system_template,input_schema,output_schema,active)
VALUES
 ('lead_qualification','lead_qualification',1,'Classifique o lead sem rejeitá-lo e sem inventar dados comerciais. Responda somente JSON.','{"type":"object"}'::jsonb,'{"type":"object","required":["classification","confidence","reason"],"properties":{"classification":{"type":"string"},"confidence":{"type":"number"},"reason":{"type":"string"},"suggested_next_action":{"type":"string"}}}'::jsonb,TRUE),
 ('followup_draft','followup_draft',1,'Produza uma sugestão curta de follow-up usando apenas os fatos fornecidos. Não invente preço, desconto, prazo ou garantia. Responda somente JSON.','{"type":"object"}'::jsonb,'{"type":"object","required":["message"],"properties":{"message":{"type":"string"},"confidence":{"type":"number"}}}'::jsonb,TRUE),
 ('proposal_draft','proposal_draft',1,'Redija apenas texto explicativo para uma proposta. Valores e condições vêm do catálogo oficial e não podem ser criados. Responda somente JSON.','{"type":"object"}'::jsonb,'{"type":"object","required":["introduction","need_summary","next_steps"],"properties":{"introduction":{"type":"string"},"need_summary":{"type":"string"},"next_steps":{"type":"string"}}}'::jsonb,TRUE),
 ('briefing_analysis','briefing_analysis',1,'Resuma o briefing e identifique lacunas sem transformar a análise em contrato ou escopo final. Responda somente JSON.','{"type":"object"}'::jsonb,'{"type":"object","required":["summary","missing_information"],"properties":{"summary":{"type":"string"},"missing_information":{"type":"array"}}}'::jsonb,TRUE),
 ('support_triage','support_triage',1,'Sugira categoria, prioridade e encaminhamento; não execute ferramentas nem prometa solução. Responda somente JSON.','{"type":"object"}'::jsonb,'{"type":"object","required":["category","priority","reason"],"properties":{"category":{"type":"string"},"priority":{"type":"string"},"reason":{"type":"string"}}}'::jsonb,TRUE)
ON CONFLICT (prompt_key,version) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose TEXT NOT NULL,
  provider_key TEXT REFERENCES public.ai_providers(provider_key) ON DELETE SET NULL,
  model_key TEXT REFERENCES public.ai_models(model_key) ON DELETE SET NULL,
  prompt_version_id UUID REFERENCES public.ai_prompt_versions(id) ON DELETE SET NULL,
  automation_run_id UUID REFERENCES public.automation_runs(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  input_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','blocked','cancelled')),
  result JSONB,
  confidence NUMERIC(5,4),
  tokens_input INTEGER,
  tokens_output INTEGER,
  latency_ms INTEGER,
  cost_estimate NUMERIC(14,6),
  error_code TEXT,
  error_message TEXT,
  feedback TEXT CHECK (feedback IS NULL OR feedback IN ('correct','incorrect','edited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_runs_status_created ON public.ai_runs(status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  in_app BOOLEAN NOT NULL DEFAULT TRUE,
  email BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_type)
);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS automation_action_run_id UUID REFERENCES public.automation_action_runs(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unq_notification_automation_action_user
  ON public.notifications(automation_action_run_id, user_id)
  WHERE automation_action_run_id IS NOT NULL;

ALTER TABLE public.crm_activities
  ADD COLUMN IF NOT EXISTS automation_action_run_id UUID REFERENCES public.automation_action_runs(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unq_crm_activity_automation_action
  ON public.crm_activities(automation_action_run_id)
  WHERE automation_action_run_id IS NOT NULL;

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS automation_action_run_id UUID REFERENCES public.automation_action_runs(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unq_milestone_automation_action_title
  ON public.milestones(automation_action_run_id, title)
  WHERE automation_action_run_id IS NOT NULL;

-- Automações iniciais de baixo risco. Ações externas e IA não são ativadas por padrão.
INSERT INTO public.automations
  (id,name,description,status,trigger_type,trigger_config,conditions,current_version,risk_level,requires_approval,dry_run)
VALUES
  ('81000000-0000-4000-8000-000000000001','Tratamento inicial de lead','Atribui lead sem responsável, cria primeiro follow-up e notifica administradores.','active','event','{"events":["lead.created","crm.lead.created"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,1,0,FALSE,FALSE),
  ('81000000-0000-4000-8000-000000000002','Follow-up de proposta','Agenda atividade de follow-up sem enviar mensagem automaticamente.','active','event','{"events":["proposal.sent","crm.proposal.sent"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,1,0,FALSE,FALSE),
  ('81000000-0000-4000-8000-000000000003','Pós-pagamento operacional','Reutiliza projeto e briefing existentes e notifica a equipe.','active','event','{"events":["payment.confirmed","engagement.activated"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,1,0,FALSE,FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.automation_versions
  (automation_id,version,trigger_snapshot,conditions_snapshot,actions_snapshot)
VALUES
  ('81000000-0000-4000-8000-000000000001',1,'{"events":["lead.created","crm.lead.created"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,
   '[{"id":"assign-owner","type":"assign_lead","config":{"strategy":"least_open_leads"}},{"id":"first-follow-up","type":"create_crm_activity","config":{"activityType":"follow_up","title":"Realizar primeiro contato","dueInMinutes":60}},{"id":"notify-admins","type":"notify_admins","config":{"title":"Novo lead no CRM","message":"Um novo lead aguarda o primeiro contato.","notificationType":"crm"}}]'::jsonb),
  ('81000000-0000-4000-8000-000000000002',1,'{"events":["proposal.sent","crm.proposal.sent"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,
   '[{"id":"proposal-follow-up","type":"create_crm_activity","config":{"activityType":"follow_up","title":"Acompanhar proposta enviada","dueInMinutes":2880}}]'::jsonb),
  ('81000000-0000-4000-8000-000000000003',1,'{"events":["payment.confirmed","engagement.activated"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,
   '[{"id":"prefill-briefing","type":"prefill_project_briefing","config":{}},{"id":"notify-operations","type":"notify_admins","config":{"title":"Pagamento confirmado","message":"A contratação está pronta para briefing e operação.","notificationType":"payment"}}]'::jsonb)
ON CONFLICT (automation_id,version) DO NOTHING;
