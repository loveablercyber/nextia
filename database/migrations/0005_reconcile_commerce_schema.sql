-- Migration 0005: Reconcile complete commerce schema safely and idempotently
-- Nextia 2.0 - Production Commercial Reconciliation

-- 1. Commercial Services & Plans
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
WHERE slug IN ('sites-prontos', 'lojas-virtuais');

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

-- 2. Store Templates Schema & Seed
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
  ADD COLUMN IF NOT EXISTS service_slug TEXT NOT NULL DEFAULT 'lojas-virtuais',
  ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 9900,
  ADD COLUMN IF NOT EXISTS activation_fee_cents INTEGER NOT NULL DEFAULT 19700;

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

-- 3. Commercial Store Drafts
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

-- 4. Commercial Addons & Full Seed
CREATE TABLE IF NOT EXISTS public.commercial_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'one_time',
  service_slug TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed domain registration (R$ 50,00)
INSERT INTO public.commercial_addons (code, name, description, amount_cents, billing_cycle, active)
VALUES ('domain-registration', 'Registro de domínio', 'Registro e delegação oficial de domínio por 1 ano (.com.br / .com)', 5000, 'one_time', true)
ON CONFLICT (code) DO UPDATE SET amount_cents = 5000, active = true;

-- Seed all optional features
INSERT INTO public.commercial_addons (code, name, description, amount_cents, billing_cycle, active)
VALUES
  ('opt-checkout-integrado', 'Checkout Integrado', 'Pagamento transparente direto na loja', 7900, 'monthly', true),
  ('opt-calculo-frete', 'Cálculo de Frete', 'Integração com Correios e transportadoras', 3900, 'monthly', true),
  ('opt-cupons-whatsapp', 'Cupons WhatsApp', 'Disparo de cupons automáticos pelo WhatsApp', 1900, 'monthly', true),
  ('opt-estoque-real', 'Estoque em Tempo Real', 'Sincronização de estoque e alertas', 4900, 'monthly', true),
  ('opt-moedas-idiomas', 'Múltiplas Moedas e Idiomas', 'Suporte internacional a moedas e línguas', 19900, 'one_time', true),
  ('opt-chatbot', 'Chatbot Inteligente', 'Atendimento automatizado 24/7 com IA', 4900, 'monthly', true),
  ('opt-reservas', 'Sistema de Reservas', 'Gestão e confirmação de mesas/horários online', 2900, 'monthly', true),
  ('opt-delivery', 'Módulo de Delivery', 'Gestão de pedidos para entrega e retirada', 8900, 'monthly', true),
  ('opt-pdv', 'Integração PDV', 'Sincronização com o sistema de caixa e ponto de venda', 9900, 'monthly', true),
  ('opt-fidelidade', 'Clube de Fidelidade', 'Pontuação, cashback e recompensas para clientes', 3900, 'monthly', true),
  ('opt-idiomas', 'Multi-idiomas', 'Tradução do cardápio e páginas para EN/ES', 19900, 'one_time', true),
  ('opt-fotos', 'Sessão de Fotos', 'Fotos profissionais dos pratos e ambiente', 29900, 'one_time', true),
  ('opt-agendamento-salao', 'Agendamento Online', 'Escolha de profissional, serviço e horário', 2900, 'monthly', true),
  ('opt-lembrete-whatsapp', 'Lembretes por WhatsApp', 'Notificações automáticas para reduzir faltas', 3900, 'monthly', true),
  ('opt-fidelidade-salao', 'Programa de Fidelidade', 'Controle de visitas e cortes/serviços grátis', 3900, 'monthly', true),
  ('opt-galeria-trabalhos', 'Galeria de Trabalhos', 'Portfólio com antes e depois categorizado', 1900, 'monthly', true),
  ('opt-fotos-salao', 'Produção de Fotos', 'Ensaio fotográfico do espaço e equipe', 29900, 'one_time', true),
  ('opt-portal-cliente', 'Portal do Cliente', 'Área exclusiva para envio e consulta de documentos', 5900, 'monthly', true),
  ('opt-consulta-processual', 'Consulta de Processos', 'Acompanhamento do status para clientes', 4900, 'monthly', true),
  ('opt-assinatura-digital', 'Assinatura Digital', 'Assinatura eletrônica de contratos e propostas', 2900, 'monthly', true),
  ('opt-upload-seguro', 'Upload Seguro de Documentos', 'Envio criptografado de arquivos pesados', 1900, 'monthly', true),
  ('opt-agendamento-consultas', 'Agendamento de Consultas', 'Agenda integrada com Google Calendar / Outlook', 2900, 'monthly', true),
  ('opt-agendamento-clinica', 'Agendamento de Avaliações', 'Marcação online com triagem inicial', 2900, 'monthly', true),
  ('opt-prontuario-eletronico', 'Prontuário Digital', 'Histórico de procedimentos e fotos de evolução', 4900, 'monthly', true),
  ('opt-teleconsulta', 'Módulo de Teleconsulta', 'Sala de vídeo integrada para orientações', 6900, 'monthly', true),
  ('opt-area-paciente', 'Área do Paciente', 'Acesso a orientações pós-procedimento e exames', 3900, 'monthly', true),
  ('opt-receitas-digitais', 'Envio de Recomendações', 'Disparo de cuidados e receitas pós-atendimento', 2900, 'monthly', true),
  ('opt-portal-contabil', 'Portal do Cliente Contábil', 'Painel de guias, holerites e impostos para download', 5900, 'monthly', true),
  ('opt-armazenamento-xml', 'Armazenamento de XML', 'Guarda segura de notas fiscais emitidas e recebidas', 3900, 'monthly', true),
  ('opt-assinatura-contabil', 'Assinatura Eletrônica de Contratos', 'Formalização rápida de novos contratos contábeis', 2900, 'monthly', true),
  ('opt-upload-contabil', 'Envio de Documentos Contábeis', 'Upload rápido de extratos e comprovantes', 1900, 'monthly', true),
  ('opt-integracao-dominio', 'Integração com Domínio/E-mail', 'Sincronização com sistemas contábeis parceiros', 8900, 'monthly', true),
  ('opt-area-restrita-contabil', 'Área Restrita da Empresa', 'Acesso exclusivo dos sócios por login seguro', 4900, 'monthly', true),
  ('opt-backup-nuvem', 'Backup em Nuvem', 'Cópia de segurança diária de todos os dados e arquivos', 2900, 'monthly', true),
  ('opt-orcamento-whatsapp', 'Orçamento Rápido via WhatsApp', 'Botão inteligente que envia dados do veículo', 1900, 'monthly', true),
  ('opt-acompanhamento-os', 'Acompanhamento de OS Online', 'Cliente consulta o status do reparo pelo site', 3900, 'monthly', true),
  ('opt-historico-veiculo', 'Histórico do Veículo', 'Registro digital de manutenções anteriores', 2900, 'monthly', true),
  ('opt-portal-corretor', 'Portal do Corretor', 'Área de gestão de clientes e comissões', 6900, 'monthly', true),
  ('opt-crm-imobiliario', 'CRM Imobiliário Integrado', 'Gestão de funil de vendas e leads', 9900, 'monthly', true),
  ('opt-tour-360-premium', 'Produção de Tour Virtual 360°', 'Captura e publicação de tour 360 nos imóveis', 29900, 'one_time', true),
  ('opt-zap-vivareal', 'Integração ZAP / VivaReal', 'Exportação automática para portais imobiliários', 8900, 'monthly', true),
  ('opt-olx-imoveis', 'Integração OLX Imóveis', 'Feed XML para publicação em massa no OLX', 4900, 'monthly', true),
  ('opt-captacao-auto', 'Captação Automática de Imóveis', 'Formulário avançado para proprietários cadastrarem', 5900, 'monthly', true),
  ('opt-avaliacao-online', 'Simulador de Avaliação de Imóvel', 'Ferramenta para estimar valor de mercado', 3900, 'monthly', true),
  ('opt-simulador-avancado', 'Simulador de Financiamento', 'Cálculo com taxas atualizadas de bancos', 2900, 'monthly', true),
  ('opt-assinatura-propostas', 'Assinatura Digital de Propostas', 'Envio e assinatura de propostas com validade jurídica', 3900, 'monthly', true),
  ('opt-area-cliente-proprietario', 'Área do Proprietário', 'Acompanhamento de visitas e propostas recebidas', 6900, 'monthly', true),
  ('opt-comparador-favoritos', 'Comparador de Imóveis', 'Usuário compara características de 2+ imóveis lado a lado', 1900, 'monthly', true),
  ('opt-alertas-imoveis', 'Alertas de Novos Imóveis por E-mail', 'Lead recebe avisos quando surgem imóveis no seu perfil', 2900, 'monthly', true),
  ('opt-rd-meta-google', 'Integração RD Station / Meta Ads', 'Pixel e rastreamento de conversão em tempo real', 7900, 'monthly', true),
  ('opt-chatbot-imobiliario', 'Chatbot Imobiliário com IA', 'Qualificação automática de leads 24h por dia', 4900, 'monthly', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  amount_cents = EXCLUDED.amount_cents,
  billing_cycle = EXCLUDED.billing_cycle,
  active = true;

-- 5. Pricing Quotes & Webhook Events
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
  pricing_version TEXT NOT NULL DEFAULT '2026-08-15.1',
  consumed BOOLEAN NOT NULL DEFAULT false,
  consumed_at TIMESTAMPTZ,
  consumed_order_id UUID,
  normalized_selection JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.commercial_pricing_quotes
  ADD COLUMN IF NOT EXISTS consumed_order_id UUID,
  ADD COLUMN IF NOT EXISTS normalized_selection JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_pricing_quotes_user ON public.commercial_pricing_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_quotes_consumed_order ON public.commercial_pricing_quotes(consumed_order_id);

CREATE TABLE IF NOT EXISTS public.provider_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  resource_id TEXT,
  payload_hash TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_provider_webhook UNIQUE (provider, event_id)
);

ALTER TABLE public.provider_webhook_events
  ADD COLUMN IF NOT EXISTS resource_id TEXT;

-- 6. Service Workflow Policies (Safe for schema variations)
CREATE TABLE IF NOT EXISTS public.service_workflow_policies (
  workflow_key TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  service_slug TEXT NOT NULL,
  execution_mode TEXT NOT NULL DEFAULT 'client_admin',
  requires_project BOOLEAN NOT NULL DEFAULT TRUE,
  requires_briefing BOOLEAN NOT NULL DEFAULT TRUE,
  requires_domain BOOLEAN NOT NULL DEFAULT TRUE,
  modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.service_workflow_policies
  (workflow_key, version, service_slug, execution_mode, requires_project, requires_briefing, requires_domain, modules)
VALUES
  ('digital_site', 1, 'sites', 'client_admin', TRUE, TRUE, TRUE, '["overview","project","briefing","files","change_requests","payments"]'::jsonb),
  ('digital_ready_site', 1, 'sites-prontos', 'client_admin', TRUE, TRUE, TRUE, '["overview","project","briefing","files","change_requests","payments"]'::jsonb),
  ('digital_ecommerce', 1, 'lojas-virtuais', 'client_admin', TRUE, TRUE, TRUE, '["overview","project","briefing","files","change_requests","payments"]'::jsonb),
  ('website_v1', 1, 'sites', 'client_admin', true, true, true, '["project","briefing","files","change_requests","billing","domain"]'::jsonb),
  ('landing_page_v1', 1, 'landing-pages', 'client_admin', true, true, true, '["project","briefing","files","change_requests","integrations","billing","domain"]'::jsonb),
  ('ecommerce_v1', 1, 'lojas-virtuais', 'client_admin', true, true, true, '["project","briefing","files","change_requests","catalog","integrations","billing","domain"]'::jsonb),
  ('automation_v1', 1, 'automacao-ia', 'client_admin', true, true, false, '["project","briefing","files","change_requests","integrations","billing"]'::jsonb),
  ('whatsapp_bot_v1', 1, 'automacao-whatsapp', 'client_admin', true, true, false, '["project","briefing","files","change_requests","integrations","billing"]'::jsonb),
  ('custom_system_v1', 1, 'sistemas', 'client_admin', true, true, false, '["project","briefing","files","change_requests","integrations","billing"]'::jsonb),
  ('techcare_v1', 1, 'techcare', 'client_technician_admin', false, true, false, '["support","appointments","equipment","service_orders","files","billing"]'::jsonb),
  ('network_v1', 1, 'redes-wifi', 'client_technician_admin', false, true, false, '["technical_survey","appointments","equipment","service_orders","files","billing"]'::jsonb),
  ('security_v1', 1, 'cameras-seguranca', 'client_technician_admin', false, true, false, '["technical_survey","appointments","equipment","service_orders","files","billing"]'::jsonb),
  ('backup_v1', 1, 'backup', 'client_technician_admin', true, true, false, '["project","briefing","files","change_requests","billing"]'::jsonb)
ON CONFLICT (workflow_key) DO UPDATE SET
  version = EXCLUDED.version,
  service_slug = EXCLUDED.service_slug,
  execution_mode = EXCLUDED.execution_mode,
  requires_project = EXCLUDED.requires_project,
  requires_briefing = EXCLUDED.requires_briefing,
  requires_domain = EXCLUDED.requires_domain,
  modules = EXCLUDED.modules,
  updated_at = NOW();

-- 7. Service Engagements, Domains & Orders
CREATE TABLE IF NOT EXISTS public.service_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_slug TEXT NOT NULL,
  service_name_snapshot TEXT NOT NULL,
  service_category TEXT NOT NULL,
  segment_slug TEXT,
  segment_name_snapshot TEXT,
  template_id TEXT,
  template_slug_snapshot TEXT,
  template_name_snapshot TEXT,
  plan_id TEXT,
  plan_name_snapshot TEXT,
  workflow_key TEXT NOT NULL,
  workflow_version INTEGER NOT NULL DEFAULT 1,
  execution_mode TEXT NOT NULL DEFAULT 'client_admin',
  status TEXT NOT NULL DEFAULT 'awaiting_payment',
  source_kind TEXT NOT NULL DEFAULT 'order',
  source_order_id UUID,
  source_order_item_id UUID,
  source_contract_id UUID,
  migration_state TEXT NOT NULL DEFAULT 'native',
  activation_amount_cents INTEGER NOT NULL DEFAULT 0,
  monthly_amount_cents INTEGER NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  activated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_engagements_user_created ON public.service_engagements(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.service_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.service_engagements(id) ON DELETE CASCADE,
  fqdn TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'connect',
  registration_fee_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  dns_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_service_domains_engagement UNIQUE (engagement_id)
);

CREATE TABLE IF NOT EXISTS public.commercial_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  item_type TEXT NOT NULL DEFAULT 'service',
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  subtotal_cents INTEGER,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'mercado_pago',
  provider_reference TEXT,
  provider_payment_id TEXT,
  checkout_url TEXT,
  customer_notes TEXT,
  draft_id TEXT,
  pricing_quote_id UUID REFERENCES public.commercial_pricing_quotes(id) ON DELETE SET NULL,
  idempotency_key TEXT,
  engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  store_snapshot JSONB,
  service_slug_snapshot TEXT,
  service_name_snapshot TEXT,
  plan_name_snapshot TEXT,
  template_name_snapshot TEXT,
  domain_fqdn TEXT,
  failure_code TEXT,
  failure_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE public.commercial_orders
  ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER,
  ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS pricing_quote_id UUID REFERENCES public.commercial_pricing_quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS store_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS service_slug_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS service_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS plan_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS template_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS domain_fqdn TEXT,
  ADD COLUMN IF NOT EXISTS failure_code TEXT,
  ADD COLUMN IF NOT EXISTS failure_message TEXT;

UPDATE public.commercial_orders
SET subtotal_cents = COALESCE(subtotal_cents, amount_cents),
    total_cents = COALESCE(total_cents, amount_cents)
WHERE subtotal_cents IS NULL OR total_cents IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS commercial_orders_user_idempotency_unique
  ON public.commercial_orders(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.commercial_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.commercial_orders(id) ON DELETE CASCADE,
  item_kind TEXT NOT NULL,
  item_code TEXT NOT NULL,
  name_snapshot TEXT NOT NULL,
  unit_amount_cents INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  billing_cycle TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Invoices & Payments
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.commercial_orders(id) ON DELETE SET NULL,
  engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  type TEXT NOT NULL DEFAULT 'ativacao',
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.commercial_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS invoices_order_id_idx ON public.invoices(order_id);

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
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  provider_transaction_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_payment_provider_tx UNIQUE (provider, provider_transaction_id)
);

-- 9. Auxiliary Tables & Foreign Column Extensions
CREATE TABLE IF NOT EXISTS public.briefing_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.service_engagements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.data_migration_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  issue_code TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'needs_review',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_order_id UUID,
  ADD COLUMN IF NOT EXISTS source_contract_id UUID,
  ADD COLUMN IF NOT EXISTS service_slug TEXT,
  ADD COLUMN IF NOT EXISTS workflow_key TEXT,
  ADD COLUMN IF NOT EXISTS workflow_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS briefing JSONB,
  ADD COLUMN IF NOT EXISTS store_model_id TEXT,
  ADD COLUMN IF NOT EXISTS store_details JSONB;

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

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
