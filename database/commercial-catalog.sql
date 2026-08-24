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
  ('sites-prontos', 'Sites prontos', 'digital', 19700, 'ativação a partir de', TRUE, 15),
  ('landing-pages', 'Landing pages', 'digital', 49700, 'projeto a partir de', FALSE, 20),
  ('lojas-virtuais', 'Lojas virtuais', 'digital', 149000, 'projeto a partir de', TRUE, 30),
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

UPDATE public.commercial_services
SET recurring = TRUE, updated_at = NOW()
WHERE slug IN ('sites-prontos', 'lojas-virtuais') AND recurring = FALSE;

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

ALTER TABLE public.commercial_store_templates ADD COLUMN IF NOT EXISTS service_slug TEXT NOT NULL DEFAULT 'lojas-virtuais';
ALTER TABLE public.commercial_store_templates ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 9900;
ALTER TABLE public.commercial_store_templates ADD COLUMN IF NOT EXISTS activation_fee_cents INTEGER NOT NULL DEFAULT 19700;

INSERT INTO public.commercial_store_templates
  (id, slug, service_slug, name, category, description, cover_image, preview_url, features, featured, active, price_cents, activation_fee_cents, sort_order)
VALUES
  ('tpl-restaurante-premium', 'restaurante-premium', 'sites-prontos', 'Restaurante Premium', 'Restaurante', 'Site pronto para restaurantes com cardápio digital, reservas e galeria.', '/images/templates/restaurante-premium.webp', '/demo/restaurante-premium', '["Cardápio digital","Reservas online","WhatsApp integrado"]'::jsonb, TRUE, TRUE, 7900, 19700, 10),
  ('tpl-salao-elegance', 'salao-elegance', 'sites-prontos', 'Salão Elegance', 'Salão & Barbearia', 'Site pronto para salões e barbearias com agenda e portfólio.', '/images/templates/salao-elegance.webp', '/demo/salao-elegance', '["Agendamento online","Portfólio","WhatsApp integrado"]'::jsonb, TRUE, TRUE, 6900, 19700, 20),
  ('tpl-servicos-profissionais', 'servicos-profissionais', 'sites-prontos', 'Serviços Profissionais', 'Prestador de Serviços', 'Site pronto para profissionais e empresas de serviços.', '/images/templates/servicos-profissionais.webp', '/demo/servicos-profissionais', '["Serviços","Portfólio","Solicitação de orçamento"]'::jsonb, TRUE, TRUE, 5900, 19700, 30),
  ('tpl-loja-catalogo', 'loja-catalogo', 'sites-prontos', 'Loja & Catálogo', 'Loja e Catálogo', 'Catálogo digital com filtros e vendas pelo WhatsApp.', '/images/templates/loja-catalogo.webp', '/demo/loja-catalogo', '["Catálogo de produtos","Filtros","WhatsApp integrado"]'::jsonb, FALSE, TRUE, 8900, 24700, 40),
  ('tpl-clinica-estetica', 'clinica-estetica', 'sites-prontos', 'Clínica & Estética', 'Clínica e Estética', 'Site pronto para clínicas, consultórios e centros de estética.', '/images/templates/clinica-estetica.webp', '/demo/clinica-estetica', '["Tratamentos","Equipe","Agendamento"]'::jsonb, FALSE, TRUE, 8900, 24700, 50),
  ('tpl-contabilidade', 'contabilidade', 'sites-prontos', 'Escritório Contábil', 'Contabilidade', 'Site pronto para contadores e escritórios contábeis.', '/images/templates/contabilidade.webp', '/demo/contabilidade', '["Serviços contábeis","Blog","Orçamento"]'::jsonb, FALSE, TRUE, 6900, 19700, 60),
  ('tpl-imobiliaria', 'imobiliaria', 'sites-prontos', 'Imobiliária', 'Imobiliária', 'Site pronto para imobiliárias com listagem e busca de imóveis.', '/images/templates/imobiliaria.webp', '/demo/imobiliaria', '["Listagem de imóveis","Filtros","Captação de leads"]'::jsonb, FALSE, TRUE, 12900, 29700, 70),
  ('tpl-oficina-mecanica', 'oficina-mecanica', 'sites-prontos', 'Oficina Mecânica', 'Oficina Mecânica', 'Site pronto para oficinas e centros automotivos.', '/images/templates/oficina-mecanica.webp', '/demo/oficina-mecanica', '["Serviços","Orçamento","WhatsApp integrado"]'::jsonb, FALSE, TRUE, 5900, 19700, 80),
  ('tpl-imobiliaria-premium', 'imobiliaria-premium', 'sites-prontos', 'Imobiliária Premium', 'Imobiliária', 'Plataforma pronta para imobiliárias de alto padrão.', '/images/templates/imobiliaria-premium.webp', '/demo/imobiliaria-premium', '["Busca avançada","Tour 360°","Simulador"]'::jsonb, TRUE, TRUE, 14900, 39700, 90),
  ('tpl-loja-moda-premium', 'loja-moda-premium', 'lojas-virtuais', 'Loja Moda & Acessórios', 'Loja Virtual', 'Loja virtual de moda com variações, frete e checkout.', '/images/templates/loja-moda-premium.webp', '/demo/loja-moda-premium', '["Grade de tamanhos","Checkout integrado","Estoque"]'::jsonb, TRUE, TRUE, 9900, 24700, 100),
  ('tpl-loja-gourmet', 'loja-gourmet', 'lojas-virtuais', 'Loja Gourmet & Alimentos', 'Loja Virtual', 'Loja virtual para alimentos com pedidos e Pix.', '/images/templates/loja-gourmet.webp', '/demo/loja-gourmet', '["Catálogo","Pedidos por WhatsApp","Pix"]'::jsonb, TRUE, TRUE, 5900, 19700, 110),
  ('tpl-loja-tech-store', 'loja-tech-store', 'lojas-virtuais', 'Loja Tech & Eletrônicos', 'Loja Virtual', 'Loja virtual robusta para eletrônicos e informática.', '/images/templates/loja-tech-store.webp', '/demo/loja-tech-store', '["Ficha técnica","Gateways múltiplos","Relatórios"]'::jsonb, TRUE, TRUE, 15900, 29700, 120)
ON CONFLICT (slug) DO UPDATE SET
  service_slug = EXCLUDED.service_slug,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  cover_image = EXCLUDED.cover_image,
  preview_url = EXCLUDED.preview_url,
  features = EXCLUDED.features,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active,
  price_cents = EXCLUDED.price_cents,
  activation_fee_cents = EXCLUDED.activation_fee_cents,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

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
