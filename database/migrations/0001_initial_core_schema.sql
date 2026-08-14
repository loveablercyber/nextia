-- Migration 0001: Initial Core Schema (Service Engagements, Order Items, Domains, Invoices, Workflows, Quotes, Outbox)

CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Engagements
CREATE TABLE IF NOT EXISTS public.service_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_slug TEXT NOT NULL,
  service_name_snapshot TEXT NOT NULL,
  service_category TEXT NOT NULL, -- 'digital', 'automation', 'techcare', 'infrastructure', etc.
  segment_slug TEXT,
  segment_name_snapshot TEXT,
  template_id TEXT,
  template_slug_snapshot TEXT,
  template_name_snapshot TEXT,
  plan_id TEXT,
  plan_name_snapshot TEXT,
  workflow_key TEXT NOT NULL,
  workflow_version INTEGER NOT NULL DEFAULT 1,
  execution_mode TEXT NOT NULL DEFAULT 'client_admin', -- 'client_admin' or 'client_technician_admin'
  status TEXT NOT NULL DEFAULT 'awaiting_payment',
  source_kind TEXT NOT NULL DEFAULT 'order', -- 'order', 'contract', 'quote', 'manual', 'legacy'
  source_order_id UUID,
  source_order_item_id UUID,
  source_contract_id UUID,
  migration_state TEXT NOT NULL DEFAULT 'native', -- 'native', 'exact', 'inferred', 'needs_review'
  activation_amount_cents INTEGER NOT NULL DEFAULT 0,
  monthly_amount_cents INTEGER NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  activated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_engagements_user_created ON public.service_engagements(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_engagements_status_cat ON public.service_engagements(status, service_category);
CREATE INDEX IF NOT EXISTS idx_service_engagements_source_order ON public.service_engagements(source_order_id);

-- Commercial Order Items
CREATE TABLE IF NOT EXISTS public.commercial_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.commercial_orders(id) ON DELETE CASCADE,
  item_kind TEXT NOT NULL, -- 'service', 'plan', 'addon', 'domain', 'discount', 'tax'
  item_code TEXT NOT NULL,
  name_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_amount_cents INTEGER NOT NULL DEFAULT 0,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'one_time', -- 'one_time' or 'monthly'
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.commercial_order_items(order_id);

-- Service Domains
CREATE TABLE IF NOT EXISTS public.service_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.service_engagements(id) ON DELETE CASCADE,
  fqdn TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'register', -- 'register' or 'connect'
  registration_fee_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'awaiting_payment',
  provider TEXT,
  provider_reference TEXT,
  registered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  dns_verified_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_service_domains_engagement UNIQUE (engagement_id)
);

CREATE INDEX IF NOT EXISTS idx_service_domains_fqdn ON public.service_domains(fqdn);

-- Briefing Submissions
CREATE TABLE IF NOT EXISTS public.briefing_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  schema_key TEXT NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'needs_revision', 'approved'
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_briefing_submissions_engagement ON public.briefing_submissions(engagement_id);
CREATE INDEX IF NOT EXISTS idx_briefing_submissions_project ON public.briefing_submissions(project_id);

-- Invoices & Transactions
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.commercial_plan_contracts(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
  type TEXT NOT NULL DEFAULT 'ativacao', -- 'ativacao', 'mensalidade'
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_engagement_id ON public.invoices(engagement_id);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'one_time',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  provider_transaction_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'refunded'
  payment_method TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_payment_tx_provider_id UNIQUE (provider, provider_transaction_id)
);

-- Commercial Catalog Extensions
CREATE TABLE IF NOT EXISTS public.commercial_service_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug TEXT NOT NULL,
  variant_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'digital',
  workflow_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_service_variant UNIQUE (service_slug, variant_slug)
);

CREATE TABLE IF NOT EXISTS public.commercial_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'one_time', -- 'one_time' or 'monthly'
  service_slug TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed domain-registration addon
INSERT INTO public.commercial_addons (code, name, description, amount_cents, billing_cycle, active)
VALUES ('domain-registration', 'Registro de domínio', 'Registro e delegação oficial de domínio por 1 ano (.com.br / .com)', 5000, 'one_time', true)
ON CONFLICT (code) DO UPDATE SET amount_cents = 5000, active = true;

CREATE TABLE IF NOT EXISTS public.service_engagement_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.service_engagements(id) ON DELETE CASCADE,
  addon_code TEXT NOT NULL,
  name_snapshot TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'one_time',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_workflow_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_key TEXT UNIQUE NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  service_slug TEXT NOT NULL,
  execution_mode TEXT NOT NULL DEFAULT 'client_admin',
  requires_project BOOLEAN NOT NULL DEFAULT true,
  requires_briefing BOOLEAN NOT NULL DEFAULT true,
  requires_domain BOOLEAN NOT NULL DEFAULT true,
  modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotes & Webhook Deduplication
CREATE TABLE IF NOT EXISTS public.commercial_pricing_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_draft_id TEXT,
  service_slug TEXT NOT NULL,
  template_slug TEXT,
  plan_id TEXT,
  addon_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  domain_name TEXT,
  domain_mode TEXT,
  one_time_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  monthly_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  one_time_total_cents INTEGER NOT NULL DEFAULT 0,
  monthly_total_cents INTEGER NOT NULL DEFAULT 0,
  pricing_version TEXT NOT NULL DEFAULT '2026-08-14.1',
  consumed BOOLEAN NOT NULL DEFAULT false,
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_quotes_user ON public.commercial_pricing_quotes(user_id);

CREATE TABLE IF NOT EXISTS public.provider_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed', 'ignored'
  attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_provider_webhook UNIQUE (provider, event_id)
);

CREATE TABLE IF NOT EXISTS public.outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL, -- 'engagement', 'order', 'domain'
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.data_migration_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'project', 'order', 'contract'
  entity_id UUID NOT NULL,
  issue_code TEXT NOT NULL, -- 'ambiguous_service', 'missing_user', 'price_mismatch'
  description TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'needs_review', -- 'needs_review', 'resolved', 'ignored'
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
