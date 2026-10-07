CREATE TABLE IF NOT EXISTS public.acquisition_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','archived')),
  service_slug TEXT NOT NULL DEFAULT 'sites-prontos',
  headline TEXT NOT NULL,
  subheadline TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.acquisition_campaign_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.acquisition_campaigns(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 50 CHECK (weight BETWEEN 0 AND 10000),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, code)
);

CREATE TABLE IF NOT EXISTS public.acquisition_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.acquisition_campaigns(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'suggested' CHECK (mode IN ('fixed','suggested','choose_amount','plans')),
  minimum_cents INTEGER NOT NULL CHECK (minimum_cents >= 0),
  maximum_cents INTEGER CHECK (maximum_cents IS NULL OR maximum_cents >= minimum_cents),
  suggested_cents INTEGER NOT NULL CHECK (suggested_cents >= minimum_cents),
  activation_cents INTEGER NOT NULL DEFAULT 0 CHECK (activation_cents >= 0),
  monthly_cents INTEGER NOT NULL DEFAULT 0 CHECK (monthly_cents >= 0),
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unq_acquisition_active_pricing_rule
  ON public.acquisition_pricing_rules(campaign_id) WHERE active = TRUE;

CREATE TABLE IF NOT EXISTS public.acquisition_funnel_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_key UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  access_token_hash TEXT NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.acquisition_campaigns(id),
  variant_id UUID NOT NULL REFERENCES public.acquisition_campaign_variants(id),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.commercial_orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started','configuring','previewed','priced','identified','checkout','converted','abandoned','expired')),
  current_step TEXT NOT NULL DEFAULT 'landing',
  attribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_amount_cents INTEGER,
  consent_recovery BOOLEAN NOT NULL DEFAULT FALSE,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acquisition_sessions_campaign_created
  ON public.acquisition_funnel_sessions(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acquisition_sessions_status_activity
  ON public.acquisition_funnel_sessions(status, last_activity_at DESC);

CREATE TABLE IF NOT EXISTS public.acquisition_preview_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES public.acquisition_funnel_sessions(id) ON DELETE CASCADE,
  segment_slug TEXT NOT NULL,
  template_slug TEXT NOT NULL,
  business_name TEXT NOT NULL,
  theme JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.acquisition_funnel_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.acquisition_funnel_sessions(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.acquisition_campaigns(id),
  variant_id UUID NOT NULL REFERENCES public.acquisition_campaign_variants(id),
  event_name TEXT NOT NULL,
  event_key TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unq_acquisition_event_key
  ON public.acquisition_funnel_events(session_id, event_key) WHERE event_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_acquisition_events_campaign_time
  ON public.acquisition_funnel_events(campaign_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.acquisition_abandonment_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES public.acquisition_funnel_sessions(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  consented_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  recovery_status TEXT NOT NULL DEFAULT 'eligible' CHECK (recovery_status IN ('eligible','queued','contacted','converted','revoked','suppressed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.acquisition_provisioning_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES public.acquisition_funnel_sessions(id),
  order_id UUID NOT NULL UNIQUE REFERENCES public.commercial_orders(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','manual_review')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.acquisition_campaigns
  (slug,name,status,service_slug,headline,subheadline,settings)
VALUES
  ('site-inteligente','Site inteligente por segmento','active','sites-prontos',
   'Veja seu futuro site antes de contratar',
   'Responda poucas perguntas e receba uma prévia navegável feita para o seu negócio.',
   '{"allowedSegments":["contabilidade","advocacia","clinicas","restaurantes","saloes-de-beleza","prestadores-de-servicos","lojas"],"previewTtlDays":7}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.acquisition_campaign_variants (campaign_id,code,name,weight,content)
SELECT c.id,'A','Valor imediato',50,'{"eyebrow":"Seu site começa aqui","cta":"Criar minha prévia grátis"}'::jsonb
FROM public.acquisition_campaigns c WHERE c.slug='site-inteligente'
ON CONFLICT (campaign_id,code) DO NOTHING;

INSERT INTO public.acquisition_campaign_variants (campaign_id,code,name,weight,content)
SELECT c.id,'B','Projeto sob medida',50,'{"eyebrow":"Uma presença digital com a sua cara","cta":"Ver meu site personalizado"}'::jsonb
FROM public.acquisition_campaigns c WHERE c.slug='site-inteligente'
ON CONFLICT (campaign_id,code) DO NOTHING;

INSERT INTO public.acquisition_pricing_rules
  (campaign_id,mode,minimum_cents,maximum_cents,suggested_cents,activation_cents,monthly_cents,suggestions)
SELECT c.id,'choose_amount',19700,149000,49700,19700,0,'[29700,49700,79700]'::jsonb
FROM public.acquisition_campaigns c WHERE c.slug='site-inteligente'
ON CONFLICT DO NOTHING;
