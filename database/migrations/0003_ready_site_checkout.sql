-- Corrige o catálogo e o workflow usados na contratação de sites prontos.
CREATE TABLE IF NOT EXISTS public.commercial_services (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('digital', 'automation', 'techcare', 'infrastructure', 'security')),
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  price_label TEXT NOT NULL DEFAULT 'sob orçamento',
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.commercial_store_templates (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  service_slug TEXT NOT NULL DEFAULT 'lojas-virtuais',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL DEFAULT '',
  preview_url TEXT NOT NULL DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  price_cents INTEGER NOT NULL DEFAULT 9900 CHECK (price_cents >= 0),
  activation_fee_cents INTEGER NOT NULL DEFAULT 19700 CHECK (activation_fee_cents >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.commercial_store_templates
  ADD COLUMN IF NOT EXISTS service_slug TEXT NOT NULL DEFAULT 'lojas-virtuais';

ALTER TABLE public.commercial_store_templates
  ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 9900;

ALTER TABLE public.commercial_store_templates
  ADD COLUMN IF NOT EXISTS activation_fee_cents INTEGER NOT NULL DEFAULT 19700;

INSERT INTO public.commercial_services
  (slug, name, category, price_cents, price_label, recurring, sort_order)
VALUES
  ('sites-prontos', 'Sites prontos', 'digital', 19700, 'ativação a partir de', TRUE, 15)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_cents = EXCLUDED.price_cents,
  price_label = EXCLUDED.price_label,
  recurring = EXCLUDED.recurring,
  active = TRUE,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

UPDATE public.commercial_services
SET recurring = TRUE, updated_at = NOW()
WHERE slug = 'lojas-virtuais';

INSERT INTO public.service_workflow_policies
  (workflow_key, version, service_slug, execution_mode, requires_project, requires_briefing, requires_domain, modules)
VALUES
  ('digital_ready_site', 1, 'sites-prontos', 'client_admin', TRUE, TRUE, TRUE,
   '["overview","project","briefing","files","change_requests","payments"]'::jsonb)
ON CONFLICT (workflow_key) DO UPDATE SET
  service_slug = EXCLUDED.service_slug,
  execution_mode = EXCLUDED.execution_mode,
  requires_project = EXCLUDED.requires_project,
  requires_briefing = EXCLUDED.requires_briefing,
  requires_domain = EXCLUDED.requires_domain,
  modules = EXCLUDED.modules,
  updated_at = NOW();
