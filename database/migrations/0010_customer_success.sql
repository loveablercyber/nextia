-- Etapa 10: recorrencia, retencao, expansao e pos-venda.
-- Evolui commercial_plan_contracts como fonte unica; nao cria tabela de assinatura paralela.

ALTER TABLE public.commercial_plan_contracts
  ADD COLUMN IF NOT EXISTS service_slug TEXT REFERENCES public.commercial_services(slug) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.commercial_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason_code TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_reason_note TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.commercial_plan_contracts DROP CONSTRAINT IF EXISTS commercial_plan_contracts_status_check;
ALTER TABLE public.commercial_plan_contracts
  ADD CONSTRAINT commercial_plan_contracts_status_check
  CHECK (status IN ('activation_pending','subscription_pending','pending','active','past_due','paused','failed','cancelled','expired','ended')) NOT VALID;
ALTER TABLE public.commercial_plan_contracts VALIDATE CONSTRAINT commercial_plan_contracts_status_check;

CREATE UNIQUE INDEX IF NOT EXISTS unq_plan_contract_provider_subscription
  ON public.commercial_plan_contracts(subscription_id)
  WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plan_contract_customer_status
  ON public.commercial_plan_contracts(user_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_plan_contract_next_billing
  ON public.commercial_plan_contracts(next_billing_at)
  WHERE status IN ('active','past_due');

CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.commercial_plan_contracts(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  provider_event_id TEXT,
  provider_resource_id TEXT,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS unq_subscription_provider_event_effect
  ON public.subscription_events(subscription_id,provider_event_id,event_type)
  WHERE provider_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_events_timeline
  ON public.subscription_events(subscription_id,occurred_at DESC,id DESC);

CREATE TABLE IF NOT EXISTS public.retention_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  subscription_id UUID REFERENCES public.commercial_plan_contracts(id) ON DELETE SET NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('payment_failed','renewal_approaching','cancellation_requested','repeated_support','service_inactive','no_recent_interaction')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  reason TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved','dismissed')),
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  next_action TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS unq_open_retention_signal
  ON public.retention_signals(customer_id,COALESCE(subscription_id,'00000000-0000-0000-0000-000000000000'::uuid),signal_type)
  WHERE status IN ('open','acknowledged');
CREATE INDEX IF NOT EXISTS idx_retention_signal_queue
  ON public.retention_signals(status,severity,detected_at DESC);

CREATE TABLE IF NOT EXISTS public.expansion_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_service_slug TEXT NOT NULL REFERENCES public.commercial_services(slug) ON DELETE CASCADE,
  suggested_service_slug TEXT NOT NULL REFERENCES public.commercial_services(slug) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('upsell','cross_sell','nextia_360')),
  reason TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(current_service_slug,suggested_service_slug,suggestion_type),
  CHECK (current_service_slug <> suggested_service_slug)
);

CREATE TABLE IF NOT EXISTS public.expansion_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  rule_id UUID REFERENCES public.expansion_rules(id) ON DELETE SET NULL,
  current_service_slug TEXT REFERENCES public.commercial_services(slug) ON DELETE SET NULL,
  suggested_service_slug TEXT NOT NULL REFERENCES public.commercial_services(slug) ON DELETE RESTRICT,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('upsell','cross_sell','nextia_360')),
  reason TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested','reviewed','dismissed','converted_to_opportunity')),
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  dismissed_until TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS unq_open_expansion_suggestion
  ON public.expansion_suggestions(customer_id,suggested_service_slug)
  WHERE status IN ('suggested','reviewed');
CREATE INDEX IF NOT EXISTS idx_expansion_suggestion_queue
  ON public.expansion_suggestions(status,priority,created_at DESC);

CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  context TEXT NOT NULL DEFAULT 'post_sale',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (rating IS NOT NULL OR NULLIF(TRIM(comment),'') IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer
  ON public.customer_feedback(customer_id,created_at DESC);

-- Somente dados comprovaveis sao retropreenchidos.
UPDATE public.commercial_plan_contracts
SET billing_cycle='monthly', currency='BRL', current_period_start=COALESCE(current_period_start,activated_at)
WHERE billing_cycle IS NULL OR currency IS NULL OR (status='active' AND current_period_start IS NULL AND activated_at IS NOT NULL);

INSERT INTO public.subscription_events(subscription_id,event_type,to_status,occurred_at,metadata)
SELECT id,'legacy_state_imported',status,COALESCE(activated_at,created_at),jsonb_build_object('source','verified_contract_state')
FROM public.commercial_plan_contracts c
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_events e WHERE e.subscription_id=c.id);

-- Automações internas: criam atenção humana, não enviam cobrança ou oferta externa.
INSERT INTO public.automations
  (id,name,description,status,trigger_type,trigger_config,conditions,current_version,risk_level,requires_approval,dry_run)
VALUES
  ('a1000000-0000-4000-8000-000000000001','Atenção a falha recorrente','Notifica administradores sobre falha confirmada pelo gateway.','active','event','{"events":["subscription.payment_failed"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,1,0,FALSE,FALSE),
  ('a1000000-0000-4000-8000-000000000002','Atenção a cancelamento','Notifica administradores sobre solicitação de cancelamento.','active','event','{"events":["subscription.cancellation_requested"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,1,0,FALSE,FALSE),
  ('a1000000-0000-4000-8000-000000000003','Follow-up pós-entrega','Cria acompanhamento interno depois de projeto concluído.','active','event','{"events":["project.completed"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,1,0,FALSE,FALSE),
  ('a1000000-0000-4000-8000-000000000004','Tratamento de sinal de retenção','Cria acompanhamento humano para sinais objetivos de risco.','active','event','{"events":["retention.signal_detected"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,1,0,FALSE,FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.automation_versions(automation_id,version,trigger_snapshot,conditions_snapshot,actions_snapshot)
VALUES
  ('a1000000-0000-4000-8000-000000000001',1,'{"events":["subscription.payment_failed"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,'[{"id":"notify-failure","type":"notify_admins","config":{"title":"Falha de pagamento recorrente","message":"Uma assinatura requer acompanhamento financeiro.","notificationType":"retention"}}]'::jsonb),
  ('a1000000-0000-4000-8000-000000000002',1,'{"events":["subscription.cancellation_requested"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,'[{"id":"notify-cancellation","type":"notify_admins","config":{"title":"Cancelamento solicitado","message":"Uma solicitação de cancelamento aguarda análise.","notificationType":"retention"}}]'::jsonb),
  ('a1000000-0000-4000-8000-000000000003',1,'{"events":["project.completed"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,'[{"id":"create-post-sale-task","type":"create_crm_activity","config":{"activityType":"follow_up","title":"Realizar follow-up pós-entrega","description":"Acompanhar satisfação e próximos passos sem oferta automática.","dueInMinutes":10080}},{"id":"notify-post-sale","type":"notify_admins","config":{"title":"Follow-up pós-entrega","message":"Um projeto concluído está pronto para acompanhamento humano.","notificationType":"post_sale"}}]'::jsonb),
  ('a1000000-0000-4000-8000-000000000004',1,'{"events":["retention.signal_detected"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,'[{"id":"create-retention-task","type":"create_crm_activity","config":{"activityType":"task","title":"Analisar sinal de retenção","description":"Revisar evidências e definir ação humana apropriada.","dueInMinutes":1440}},{"id":"notify-retention","type":"notify_admins","config":{"title":"Sinal de retenção","message":"Um sinal objetivo de risco requer análise.","notificationType":"retention"}}]'::jsonb)
ON CONFLICT (automation_id,version) DO NOTHING;

INSERT INTO public.expansion_rules(current_service_slug,suggested_service_slug,suggestion_type,reason,priority)
SELECT 'lojas-virtuais','automacao-whatsapp','cross_sell','Automação de atendimento pode complementar uma loja virtual existente.',50
WHERE EXISTS (SELECT 1 FROM public.commercial_services WHERE slug='lojas-virtuais')
  AND EXISTS (SELECT 1 FROM public.commercial_services WHERE slug='automacao-whatsapp')
ON CONFLICT(current_service_slug,suggested_service_slug,suggestion_type) DO NOTHING;
