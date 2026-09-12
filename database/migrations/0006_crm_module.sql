-- Etapa 7: CRM, leads, oportunidades, atividades e propostas.
-- O runner de migrations controla transacao e schema_migrations.

CREATE TABLE IF NOT EXISTS public.crm_lost_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.crm_lost_reasons (code, label, description, sort_order) VALUES
  ('price', 'Preco', 'Cliente considerou o preco muito alto', 10),
  ('no_budget', 'Sem orcamento', 'Cliente nao possui orcamento disponivel', 20),
  ('gave_up', 'Desistiu', 'Cliente desistiu do projeto', 30),
  ('no_response', 'Sem resposta', 'Nao houve retorno do lead', 40),
  ('competitor', 'Escolheu concorrente', 'Cliente optou por outro fornecedor', 50),
  ('priority_changed', 'Prioridade alterada', 'Projeto deixou de ser prioridade', 60),
  ('not_qualified', 'Nao qualificado', 'Lead nao atende aos criterios', 70),
  ('postponed', 'Projeto adiado', 'Projeto adiado para outro momento', 80),
  ('other', 'Outro', 'Motivo nao listado', 99)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  is_active = TRUE,
  sort_order = EXCLUDED.sort_order;

CREATE TABLE IF NOT EXISTS public.crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS crm_one_default_pipeline
  ON public.crm_pipelines(is_default) WHERE is_default = TRUE;

INSERT INTO public.crm_pipelines (name, slug, description, is_default, sort_order)
VALUES ('Funil Comercial Nextia', 'default', 'Pipeline padrao de vendas', TRUE, 1)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
  is_won BOOLEAN NOT NULL DEFAULT FALSE,
  is_lost BOOLEAN NOT NULL DEFAULT FALSE,
  default_probability INTEGER NOT NULL DEFAULT 0 CHECK (default_probability BETWEEN 0 AND 100),
  color TEXT NOT NULL DEFAULT '#6366F1',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pipeline_id, slug),
  UNIQUE (pipeline_id, position),
  CHECK (NOT (is_won AND is_lost)),
  CHECK ((NOT is_won AND NOT is_lost) OR is_terminal)
);

INSERT INTO public.crm_pipeline_stages
  (pipeline_id, name, slug, description, position, is_terminal, is_won, is_lost, default_probability, color)
SELECT p.id, seed.name, seed.slug, seed.description, seed.position, seed.is_terminal,
       seed.is_won, seed.is_lost, seed.probability, seed.color
FROM public.crm_pipelines p
CROSS JOIN (VALUES
  ('Novo lead', 'new', 'Lead recem-capturado', 1, FALSE, FALSE, FALSE, 10, '#6366F1'),
  ('Contato', 'contact', 'Primeiro contato realizado', 2, FALSE, FALSE, FALSE, 25, '#8B5CF6'),
  ('Qualificado', 'qualified', 'Lead qualificado', 3, FALSE, FALSE, FALSE, 50, '#A855F7'),
  ('Proposta', 'proposal', 'Proposta enviada', 4, FALSE, FALSE, FALSE, 65, '#D946EF'),
  ('Negociacao', 'negotiation', 'Negociacao em andamento', 5, FALSE, FALSE, FALSE, 80, '#EC4899'),
  ('Ganho', 'won', 'Negocio fechado', 6, TRUE, TRUE, FALSE, 100, '#10B981'),
  ('Perdido', 'lost', 'Negocio perdido', 7, TRUE, FALSE, TRUE, 0, '#EF4444')
) AS seed(name, slug, description, position, is_terminal, is_won, is_lost, probability, color)
WHERE p.slug = 'default'
ON CONFLICT (pipeline_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  is_terminal = EXCLUDED.is_terminal,
  is_won = EXCLUDED.is_won,
  is_lost = EXCLUDED.is_lost,
  default_probability = EXCLUDED.default_probability,
  color = EXCLUDED.color,
  is_active = TRUE,
  updated_at = NOW();

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code TEXT UNIQUE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  email_normalized TEXT GENERATED ALWAYS AS (LOWER(TRIM(COALESCE(email, '')))) STORED,
  phone TEXT,
  phone_normalized TEXT GENERATED ALWAYS AS (REGEXP_REPLACE(COALESCE(phone, ''), '\D', '', 'g')) STORED,
  whatsapp TEXT,
  company_name TEXT,
  city_slug TEXT,
  segment_slug TEXT,
  service_slug TEXT,
  product_slug TEXT,
  template_slug TEXT,
  plan_slug TEXT,
  addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contact','qualified','won','lost','archived')),
  source TEXT NOT NULL DEFAULT 'website',
  source_detail TEXT,
  medium TEXT,
  campaign TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  first_touch_source TEXT,
  first_touch_at TIMESTAMPTZ,
  last_touch_source TEXT,
  last_touch_at TIMESTAMPTZ,
  landing_page TEXT,
  conversion_page TEXT,
  referrer TEXT,
  partner_id UUID,
  referral_id UUID,
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_contact_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (email_normalized <> '' OR phone_normalized <> '')
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_status_created ON public.crm_leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON public.crm_leads(email_normalized) WHERE email_normalized <> '';
CREATE INDEX IF NOT EXISTS idx_crm_leads_phone ON public.crm_leads(phone_normalized) WHERE phone_normalized <> '';
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned ON public.crm_leads(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON public.crm_leads(source);

CREATE TABLE IF NOT EXISTS public.crm_lead_duplicate_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  candidate_lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  match_reason TEXT NOT NULL CHECK (match_reason IN ('email','phone','email_phone')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (lead_id <> candidate_lead_id),
  UNIQUE (lead_id, candidate_lead_id)
);

CREATE TABLE IF NOT EXISTS public.crm_lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_lead_history_lead ON public.crm_lead_history(lead_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE RESTRICT,
  customer_profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE RESTRICT,
  stage_id UUID NOT NULL REFERENCES public.crm_pipeline_stages(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  service_slug TEXT,
  product_slug TEXT,
  template_slug TEXT,
  plan_slug TEXT,
  addon_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_value_cents INTEGER NOT NULL DEFAULT 0 CHECK (estimated_value_cents >= 0),
  recurring_value_cents INTEGER NOT NULL DEFAULT 0 CHECK (recurring_value_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','won','lost')),
  notes TEXT,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason_id UUID REFERENCES public.crm_lost_reasons(id) ON DELETE SET NULL,
  lost_notes TEXT,
  stage_entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (lead_id IS NOT NULL OR customer_profile_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_pipeline_stage ON public.crm_opportunities(pipeline_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_lead ON public.crm_opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_status ON public.crm_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_close ON public.crm_opportunities(expected_close_date);

CREATE TABLE IF NOT EXISTS public.crm_opportunity_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id UUID NOT NULL REFERENCES public.crm_pipeline_stages(id) ON DELETE RESTRICT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_opp_history ON public.crm_opportunity_stage_history(opportunity_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE RESTRICT,
  opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE RESTRICT,
  customer_profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('note','task','follow_up','call','email','whatsapp','meeting','proposal','other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  outcome TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (lead_id IS NOT NULL OR opportunity_id IS NOT NULL OR customer_profile_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_due ON public.crm_activities(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead ON public.crm_activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_opportunity ON public.crm_activities(opportunity_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code TEXT UNIQUE NOT NULL,
  opportunity_id UUID NOT NULL REFERENCES public.crm_opportunities(id) ON DELETE RESTRICT,
  version_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  template_slug TEXT,
  plan_id TEXT,
  addon_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  one_time_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  monthly_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  monthly_total_cents INTEGER NOT NULL DEFAULT 0 CHECK (monthly_total_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  conditions TEXT,
  notes TEXT,
  valid_until DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','accepted','rejected','expired','cancelled')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (opportunity_id, version_number),
  CHECK (discount_cents <= subtotal_cents),
  CHECK (total_cents = subtotal_cents - discount_cents)
);

CREATE INDEX IF NOT EXISTS idx_crm_proposals_opp ON public.crm_proposals(opportunity_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_crm_proposals_status ON public.crm_proposals(status, valid_until);

CREATE TABLE IF NOT EXISTS public.crm_proposal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.crm_proposals(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_proposal_history ON public.crm_proposal_history(proposal_id, created_at DESC);

ALTER TABLE public.commercial_pricing_quotes
  ADD COLUMN IF NOT EXISTS crm_proposal_id UUID REFERENCES public.crm_proposals(id) ON DELETE SET NULL;

ALTER TABLE public.commercial_orders
  ADD COLUMN IF NOT EXISTS crm_proposal_id UUID REFERENCES public.crm_proposals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pricing_quotes_crm_proposal ON public.commercial_pricing_quotes(crm_proposal_id);
CREATE INDEX IF NOT EXISTS idx_commercial_orders_crm_proposal ON public.commercial_orders(crm_proposal_id);

-- Backfill preserva cada conversao. Duplicidades sao apenas sinalizadas, nunca mescladas.
INSERT INTO public.crm_leads (
  public_code, profile_id, name, email, phone, whatsapp, company_name,
  segment_slug, service_slug, source, source_detail, landing_page, notes, metadata,
  first_touch_source, first_touch_at, last_touch_source, last_touch_at, status
)
SELECT
  'LEAD-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
  NULL, q.contact_name, q.contact_email, q.contact_phone, q.contact_phone,
  q.contact_company, q.segment, q.project_type, 'quote_form', 'Orcamento via wizard',
  '/orcamento', q.notes,
  jsonb_build_object('quote_id', q.id, 'migrated_from', 'quotes', 'estimated_min', q.estimated_min,
                     'estimated_max', q.estimated_max, 'recommended_plan', q.recommended_plan),
  'quote_form', q.created_at, 'quote_form', q.created_at, 'new'
FROM public.quotes q
WHERE NOT EXISTS (
  SELECT 1 FROM public.crm_leads l WHERE l.metadata->>'quote_id' = q.id::text
);

INSERT INTO public.crm_lead_duplicate_candidates (lead_id, candidate_lead_id, match_reason)
SELECT newer.id, older.id,
       CASE WHEN newer.email_normalized <> '' AND newer.email_normalized = older.email_normalized
                 AND newer.phone_normalized <> '' AND newer.phone_normalized = older.phone_normalized
            THEN 'email_phone'
            WHEN newer.email_normalized <> '' AND newer.email_normalized = older.email_normalized THEN 'email'
            ELSE 'phone' END
FROM public.crm_leads newer
JOIN public.crm_leads older ON older.created_at < newer.created_at
 AND ((newer.email_normalized <> '' AND newer.email_normalized = older.email_normalized)
   OR (newer.phone_normalized <> '' AND newer.phone_normalized = older.phone_normalized))
ON CONFLICT (lead_id, candidate_lead_id) DO NOTHING;

CREATE OR REPLACE VIEW public.v_crm_lead_summary AS
SELECT l.*,
       (SELECT COUNT(*) FROM public.crm_opportunities o WHERE o.lead_id = l.id) AS opportunity_count,
       (SELECT COUNT(*) FROM public.crm_activities a
         WHERE a.lead_id = l.id AND a.status = 'pending' AND a.scheduled_at < NOW()) AS overdue_activities,
       (SELECT COUNT(*) FROM public.crm_lead_duplicate_candidates d
         WHERE d.lead_id = l.id AND d.status = 'pending') AS possible_duplicate_count
FROM public.crm_leads l;
