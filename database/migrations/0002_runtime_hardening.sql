-- Migration 0002: runtime hardening and explicit service context

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_order_id UUID,
  ADD COLUMN IF NOT EXISTS source_contract_id UUID,
  ADD COLUMN IF NOT EXISTS service_slug TEXT,
  ADD COLUMN IF NOT EXISTS workflow_key TEXT,
  ADD COLUMN IF NOT EXISTS workflow_version INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS projects_engagement_id_unique
  ON public.projects(engagement_id) WHERE engagement_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS projects_source_order_id_unique
  ON public.projects(source_order_id) WHERE source_order_id IS NOT NULL;

ALTER TABLE public.commercial_orders
  ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER,
  ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS pricing_quote_id UUID REFERENCES public.commercial_pricing_quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS failure_code TEXT,
  ADD COLUMN IF NOT EXISTS failure_message TEXT;

UPDATE public.commercial_orders
SET subtotal_cents = COALESCE(subtotal_cents, amount_cents),
    total_cents = COALESCE(total_cents, amount_cents)
WHERE subtotal_cents IS NULL OR total_cents IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS commercial_orders_user_idempotency_unique
  ON public.commercial_orders(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.commercial_pricing_quotes
  ADD COLUMN IF NOT EXISTS consumed_order_id UUID,
  ADD COLUMN IF NOT EXISTS normalized_selection JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.commercial_orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS invoices_order_id_idx ON public.invoices(order_id);

ALTER TABLE public.provider_webhook_events
  ADD COLUMN IF NOT EXISTS resource_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS service_engagements_source_order_item_unique
  ON public.service_engagements(source_order_item_id)
  WHERE source_order_item_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS service_engagements_source_order_unique
  ON public.service_engagements(source_order_id)
  WHERE source_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS service_engagements_source_contract_unique
  ON public.service_engagements(source_contract_id)
  WHERE source_contract_id IS NOT NULL;

ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS storage_provider TEXT,
  ADD COLUMN IF NOT EXISTS storage_key TEXT,
  ADD COLUMN IF NOT EXISTS secure_url TEXT,
  ADD COLUMN IF NOT EXISTS original_name TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS scan_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS uploaded_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS files_engagement_created_idx
  ON public.files(engagement_id, uploaded_at DESC)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS data_migration_issues_entity_code_unique
  ON public.data_migration_issues(entity_type,entity_id,issue_code);

CREATE TABLE IF NOT EXISTS public.engagement_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.service_engagements(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.service_workflow_policies
  (workflow_key, version, service_slug, execution_mode, requires_project, requires_briefing, requires_domain, modules)
VALUES
  ('website_v1', 1, 'sites', 'client_admin', true, true, true, '["project","briefing","files","change_requests","billing","domain"]'),
  ('landing_page_v1', 1, 'landing-pages', 'client_admin', true, true, true, '["project","briefing","files","change_requests","integrations","billing","domain"]'),
  ('ecommerce_v1', 1, 'lojas-virtuais', 'client_admin', true, true, true, '["project","briefing","files","change_requests","catalog","integrations","billing","domain"]'),
  ('automation_v1', 1, 'automacao-ia', 'client_admin', true, true, false, '["project","briefing","files","change_requests","integrations","billing"]'),
  ('whatsapp_bot_v1', 1, 'automacao-whatsapp', 'client_admin', true, true, false, '["project","briefing","files","change_requests","integrations","billing"]'),
  ('custom_system_v1', 1, 'sistemas', 'client_admin', true, true, false, '["project","briefing","files","change_requests","integrations","billing"]'),
  ('techcare_v1', 1, 'techcare', 'client_technician_admin', false, true, false, '["support","appointments","equipment","service_orders","files","billing"]'),
  ('network_v1', 1, 'redes-wifi', 'client_technician_admin', false, true, false, '["technical_survey","appointments","equipment","service_orders","files","billing"]'),
  ('security_v1', 1, 'cameras-seguranca', 'client_technician_admin', false, true, false, '["technical_survey","appointments","equipment","service_orders","files","billing"]'),
  ('backup_v1', 1, 'backup', 'client_technician_admin', true, true, false, '["project","briefing","files","change_requests","billing"]')
ON CONFLICT (workflow_key) DO UPDATE SET
  version = EXCLUDED.version,
  service_slug = EXCLUDED.service_slug,
  execution_mode = EXCLUDED.execution_mode,
  requires_project = EXCLUDED.requires_project,
  requires_briefing = EXCLUDED.requires_briefing,
  requires_domain = EXCLUDED.requires_domain,
  modules = EXCLUDED.modules;
