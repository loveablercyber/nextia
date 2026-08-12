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

CREATE INDEX IF NOT EXISTS commercial_services_active_order_idx
  ON public.commercial_services (active, sort_order, name);

CREATE TABLE IF NOT EXISTS public.commercial_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_amount_cents INTEGER NOT NULL CHECK (monthly_amount_cents > 0),
  activation_amount_cents INTEGER NOT NULL CHECK (activation_amount_cents > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.commercial_plans (id, name, monthly_amount_cents, activation_amount_cents, sort_order)
VALUES ('start', 'Nextia Start', 5900, 19700, 10),
       ('pro', 'Nextia Pro', 9900, 24700, 20),
       ('business', 'Nextia Business', 15900, 29700, 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.commercial_services (slug, name, category, price_cents, price_label, recurring, sort_order)
VALUES
  ('sites', 'Sites profissionais', 'digital', 19700, 'ativação a partir de', FALSE, 10),
  ('landing-pages', 'Landing pages', 'digital', 49700, 'projeto a partir de', FALSE, 20),
  ('lojas-virtuais', 'Lojas virtuais', 'digital', 149000, 'projeto a partir de', FALSE, 30),
  ('sistemas', 'Sistemas sob medida', 'digital', NULL, 'sob orçamento', FALSE, 40),
  ('automacao-ia', 'Automação e IA', 'automation', 79000, 'implantação a partir de', FALSE, 50),
  ('chatbot', 'Chatbots inteligentes', 'automation', 49000, 'implantação a partir de', FALSE, 60),
  ('automacao-whatsapp', 'Automação para WhatsApp', 'automation', 59000, 'implantação a partir de', FALSE, 70),
  ('techcare', 'TechCare', 'techcare', 5900, 'atendimento a partir de', FALSE, 80),
  ('suporte-ti', 'Suporte de TI', 'techcare', 19900, 'plano mensal a partir de', TRUE, 90),
  ('suporte-remoto', 'Suporte remoto', 'techcare', 5900, 'por atendimento a partir de', FALSE, 100),
  ('manutencao-computadores', 'Manutenção de computadores', 'techcare', 8900, 'serviço a partir de', FALSE, 110),
  ('manutencao-notebooks', 'Manutenção de notebooks', 'techcare', 9900, 'serviço a partir de', FALSE, 120),
  ('redes-wifi', 'Redes e Wi-Fi', 'infrastructure', 29000, 'instalação a partir de', FALSE, 130),
  ('cabeamento', 'Cabeamento estruturado', 'infrastructure', NULL, 'sob vistoria', FALSE, 140),
  ('cameras-seguranca', 'Câmeras e segurança', 'security', NULL, 'sob vistoria', FALSE, 150),
  ('backup', 'Backup empresarial', 'security', 14900, 'plano mensal a partir de', TRUE, 160)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.commercial_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  item_type TEXT NOT NULL DEFAULT 'service' CHECK (item_type IN ('service', 'plan')),
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'paid', 'active', 'failed', 'cancelled')),
  provider TEXT NOT NULL DEFAULT 'mercado_pago',
  provider_reference TEXT,
  provider_payment_id TEXT,
  checkout_url TEXT,
  customer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS commercial_orders_user_created_idx
  ON public.commercial_orders (user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS commercial_orders_provider_reference_idx
  ON public.commercial_orders (provider_reference) WHERE provider_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.commercial_plan_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('start', 'pro', 'business')),
  plan_name TEXT NOT NULL,
  monthly_amount_cents INTEGER NOT NULL CHECK (monthly_amount_cents > 0),
  activation_amount_cents INTEGER NOT NULL CHECK (activation_amount_cents > 0),
  status TEXT NOT NULL DEFAULT 'activation_pending' CHECK (status IN ('activation_pending', 'subscription_pending', 'active', 'failed', 'cancelled')),
  activation_preference_id TEXT,
  activation_payment_id TEXT,
  activation_checkout_url TEXT,
  subscription_id TEXT,
  subscription_checkout_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.commercial_store_templates (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL DEFAULT '',
  preview_url TEXT NOT NULL DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.commercial_store_templates (id, slug, name, category, description, cover_image, preview_url, features, featured, active, sort_order)
VALUES (
  'tpl-loja-catalogo',
  'loja-catalogo',
  'Loja & Catálogo Digital',
  'Loja e Catálogo',
  'Template oficial Nextia para lojas virtuais com catálogo completo, variações de produto, checkout integrado e gestão de pedidos.',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop',
  '/demo/loja-catalogo',
  '["Catálogo de produtos completo","Checkout transparente Cartão & Pix","Cálculo de frete automatizado","Painel administrativo de pedidos","Design 100% responsivo mobile-first"]'::jsonb,
  TRUE,
  TRUE,
  10
) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.commercial_store_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_slug TEXT NOT NULL DEFAULT 'lojas-virtuais',
  model_id TEXT REFERENCES public.commercial_store_templates(id) ON DELETE RESTRICT,
  offer_id TEXT NOT NULL DEFAULT 'lojas-virtuais',
  plan_id TEXT CHECK (plan_id IN ('start', 'pro', 'business')),
  store_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  needs JSONB NOT NULL DEFAULT '{}'::jsonb,
  optional_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  snapshot_monthly_cents INTEGER NOT NULL DEFAULT 0,
  snapshot_activation_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.commercial_orders ADD COLUMN IF NOT EXISTS draft_id UUID REFERENCES public.commercial_store_drafts(id) ON DELETE SET NULL;
ALTER TABLE public.commercial_orders ADD COLUMN IF NOT EXISTS store_snapshot JSONB;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS store_model_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS store_details JSONB;
