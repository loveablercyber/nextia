-- Multi-tenant foundation: the demo becomes the customer's real site instance.

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','admin','editor','attendant','financial')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','invited','disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members(user_id, status);

CREATE TABLE IF NOT EXISTS public.site_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  acquisition_preview_id UUID UNIQUE REFERENCES public.acquisition_preview_projects(id) ON DELETE SET NULL,
  engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  public_key UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  slug TEXT NOT NULL,
  business_name TEXT NOT NULL,
  segment_slug TEXT NOT NULL,
  segment_subtype TEXT,
  template_slug TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (lifecycle_status IN ('draft','demo','pending_payment','active','past_due','suspended','archived')),
  selected_plan_id TEXT REFERENCES public.commercial_plans(id) ON DELETE SET NULL,
  demo_experience_plan_id TEXT REFERENCES public.commercial_plans(id) ON DELETE SET NULL DEFAULT 'pro',
  theme JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_revision INTEGER NOT NULL DEFAULT 1 CHECK (content_revision > 0),
  demo_expires_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_site_instances_org ON public.site_instances(organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_instances_status ON public.site_instances(lifecycle_status, demo_expires_at);
CREATE INDEX IF NOT EXISTS idx_site_instances_engagement ON public.site_instances(engagement_id);

CREATE TABLE IF NOT EXISTS public.site_content (
  site_id UUID PRIMARY KEY REFERENCES public.site_instances(id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_content_revisions (
  id BIGSERIAL PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.site_instances(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  segment_slug TEXT NOT NULL,
  template_slug TEXT NOT NULL,
  theme JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason TEXT NOT NULL DEFAULT 'manual_save',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_id, revision)
);

CREATE INDEX IF NOT EXISTS idx_site_content_revisions_site ON public.site_content_revisions(site_id, revision DESC);

CREATE TABLE IF NOT EXISTS public.module_definitions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'site',
  eligible_segments TEXT[] NOT NULL DEFAULT '{}'::text[],
  demo_available BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plan_module_entitlements (
  plan_id TEXT NOT NULL REFERENCES public.commercial_plans(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL REFERENCES public.module_definitions(code) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (plan_id, module_code)
);

CREATE TABLE IF NOT EXISTS public.site_modules (
  site_id UUID NOT NULL REFERENCES public.site_instances(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL REFERENCES public.module_definitions(code) ON DELETE RESTRICT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT NOT NULL DEFAULT 'plan' CHECK (source IN ('plan','addon','demo','manual')),
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (site_id, module_code)
);

CREATE TABLE IF NOT EXISTS public.site_addons (
  site_id UUID NOT NULL REFERENCES public.site_instances(id) ON DELETE CASCADE,
  addon_code TEXT NOT NULL REFERENCES public.commercial_addons(code) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'selected' CHECK (status IN ('selected','active','suspended','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (site_id, addon_code)
);

CREATE TABLE IF NOT EXISTS public.site_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.site_instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_contacts_site_email ON public.site_contacts(site_id,LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_contacts_site_phone ON public.site_contacts(site_id,phone) WHERE phone IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.site_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.site_instances(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.site_contacts(id) ON DELETE RESTRICT,
  public_code TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL DEFAULT 'web_form' CHECK (channel IN ('web_form','web_chat','email','whatsapp')),
  subject TEXT NOT NULL DEFAULT 'Contato pelo site',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','archived')),
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_conversations_site_status ON public.site_conversations(site_id,status,last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.site_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.site_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound','internal')),
  sender_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_contact_id UUID REFERENCES public.site_contacts(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'received' CHECK (delivery_status IN ('received','queued','sent','failed','internal')),
  provider_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_messages_conversation ON public.site_messages(conversation_id,created_at);

INSERT INTO public.module_definitions(code,name,description,category,eligible_segments,demo_available,sort_order) VALUES
  ('site-pages','Páginas e seções','Editor de páginas e seções do site.','site','{}',TRUE,10),
  ('contact-form','Formulários de contato','Captação de contatos pelo site.','conversion','{}',TRUE,20),
  ('whatsapp','WhatsApp','Botão e chamadas para atendimento pelo WhatsApp.','conversion','{}',TRUE,30),
  ('gallery','Galeria','Galerias de fotos e projetos.','content','{}',TRUE,40),
  ('blog','Blog e conteúdo','Publicação de artigos e notícias.','content','{}',TRUE,50),
  ('analytics','Relatórios de acesso','Métricas de visitas e conversão.','analytics','{}',TRUE,60),
  ('seo','SEO','Configurações para mecanismos de busca.','marketing','{}',TRUE,70),
  ('inbox','Caixa de mensagens','Conversas recebidas pelo site em um só lugar.','operations','{}',TRUE,80),
  ('booking','Agenda e reservas','Solicitação de horários e reservas.','operations',ARRAY['clinicas','restaurantes','hoteis','saloes-de-beleza','prestadores-de-servicos'],TRUE,90),
  ('catalog','Catálogo ou cardápio','Produtos, serviços, pratos ou acomodações.','commerce',ARRAY['restaurantes','hoteis','saloes-de-beleza','lojas'],TRUE,100),
  ('orders','Pedidos','Recebimento e acompanhamento de pedidos.','commerce',ARRAY['restaurantes','lojas'],TRUE,110),
  ('team','Equipe e profissionais','Perfis de profissionais e responsáveis.','operations',ARRAY['advocacia','clinicas','saloes-de-beleza','prestadores-de-servicos'],TRUE,120),
  ('maps','Mapa e localização','Mapa, endereço e regiões atendidas.','site','{}',TRUE,130)
ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,category=EXCLUDED.category,
  eligible_segments=EXCLUDED.eligible_segments,demo_available=EXCLUDED.demo_available,active=TRUE,sort_order=EXCLUDED.sort_order,updated_at=NOW();

INSERT INTO public.plan_module_entitlements(plan_id,module_code,enabled)
SELECT p.id,m.code,TRUE FROM public.commercial_plans p CROSS JOIN public.module_definitions m
WHERE p.id='business'
ON CONFLICT(plan_id,module_code) DO UPDATE SET enabled=TRUE;

INSERT INTO public.plan_module_entitlements(plan_id,module_code,enabled)
SELECT 'pro',code,TRUE FROM public.module_definitions
WHERE code IN ('site-pages','contact-form','whatsapp','gallery','blog','analytics','seo','inbox','maps','team')
ON CONFLICT(plan_id,module_code) DO UPDATE SET enabled=TRUE;

INSERT INTO public.plan_module_entitlements(plan_id,module_code,enabled)
SELECT 'start',code,TRUE FROM public.module_definitions
WHERE code IN ('site-pages','contact-form','whatsapp','maps')
ON CONFLICT(plan_id,module_code) DO UPDATE SET enabled=TRUE;

-- Safely promote existing owned previews to permanent site instances.
INSERT INTO public.organizations(slug,name,owner_user_id)
SELECT 'org-' || LEFT(p.owner_user_id::text,8), MAX(p.business_name), p.owner_user_id
FROM public.acquisition_preview_projects p
WHERE p.owner_user_id IS NOT NULL
GROUP BY p.owner_user_id
ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,updated_at=NOW();

INSERT INTO public.organization_members(organization_id,user_id,role,status)
SELECT o.id,o.owner_user_id,'owner','active' FROM public.organizations o
ON CONFLICT(organization_id,user_id) DO UPDATE SET role='owner',status='active',updated_at=NOW();

INSERT INTO public.site_instances(
  organization_id,acquisition_preview_id,engagement_id,public_key,slug,business_name,segment_slug,template_slug,
  lifecycle_status,selected_plan_id,theme,content_revision,demo_expires_at,created_at,updated_at
)
SELECT o.id,p.id,p.engagement_id,p.share_key,'site-' || LEFT(p.id::text,8),p.business_name,p.segment_slug,p.template_slug,
  CASE WHEN p.demo_status='active' AND p.expires_at>NOW() THEN 'demo' ELSE 'archived' END,
  s.selected_plan_id,p.theme,p.revision,p.expires_at,p.created_at,p.updated_at
FROM public.acquisition_preview_projects p
JOIN public.acquisition_funnel_sessions s ON s.id=p.session_id
JOIN public.organizations o ON o.owner_user_id=p.owner_user_id
WHERE p.owner_user_id IS NOT NULL
ON CONFLICT(acquisition_preview_id) DO UPDATE SET
  engagement_id=EXCLUDED.engagement_id,business_name=EXCLUDED.business_name,segment_slug=EXCLUDED.segment_slug,
  template_slug=EXCLUDED.template_slug,selected_plan_id=EXCLUDED.selected_plan_id,theme=EXCLUDED.theme,
  content_revision=EXCLUDED.content_revision,demo_expires_at=EXCLUDED.demo_expires_at,updated_at=NOW();

INSERT INTO public.site_content(site_id,content,updated_by,updated_at)
SELECT si.id,p.content,p.owner_user_id,p.updated_at
FROM public.site_instances si JOIN public.acquisition_preview_projects p ON p.id=si.acquisition_preview_id
ON CONFLICT(site_id) DO UPDATE SET content=EXCLUDED.content,updated_by=EXCLUDED.updated_by,updated_at=EXCLUDED.updated_at;

INSERT INTO public.site_content_revisions(site_id,revision,segment_slug,template_slug,theme,content,reason,created_by,created_at)
SELECT si.id,si.content_revision,si.segment_slug,si.template_slug,si.theme,p.content,'preview_backfill',p.owner_user_id,p.updated_at
FROM public.site_instances si JOIN public.acquisition_preview_projects p ON p.id=si.acquisition_preview_id
ON CONFLICT(site_id,revision) DO NOTHING;

INSERT INTO public.site_modules(site_id,module_code,enabled,source)
SELECT si.id,m.code,TRUE,'demo'
FROM public.site_instances si
JOIN public.module_definitions m ON m.active=TRUE AND m.demo_available=TRUE
WHERE si.lifecycle_status='demo' AND (cardinality(m.eligible_segments)=0 OR si.segment_slug=ANY(m.eligible_segments))
ON CONFLICT(site_id,module_code) DO NOTHING;

INSERT INTO public.site_addons(site_id,addon_code,status)
SELECT si.id,selected.addon_code,'selected'
FROM public.site_instances si
JOIN public.acquisition_preview_projects p ON p.id=si.acquisition_preview_id
JOIN public.acquisition_funnel_sessions s ON s.id=p.session_id
CROSS JOIN LATERAL jsonb_array_elements_text(s.selected_addons) AS selected(addon_code)
ON CONFLICT(site_id,addon_code) DO NOTHING;
