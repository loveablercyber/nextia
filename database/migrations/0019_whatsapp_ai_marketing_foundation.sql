-- Plataforma própria de WhatsApp, IA e marketing da Nextia.
-- Segredos permanecem no ambiente; o banco armazena somente o nome das variáveis.

CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'evolution' CHECK (provider IN ('evolution')),
  instance_name TEXT NOT NULL,
  api_url_env TEXT NOT NULL DEFAULT 'WHATSAPP_API_URL',
  api_key_env TEXT NOT NULL DEFAULT 'WHATSAPP_API_KEY',
  webhook_secret_env TEXT NOT NULL DEFAULT 'EVOLUTION_WEBHOOK_SECRET',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  connection_status TEXT NOT NULL DEFAULT 'unknown' CHECK (connection_status IN ('unknown','connecting','qrcode','connected','disconnected','error')),
  account_name TEXT,
  phone_number_masked TEXT,
  qr_code_data TEXT,
  webhook_configured BOOLEAN NOT NULL DEFAULT FALSE,
  last_connected_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  last_error TEXT,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- O payload da Evolution identifica a origem pelo nome da instância; ele deve ser
-- globalmente inequívoco para que um webhook nunca seja entregue à organização errada.
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_instances_provider_name_uidx
  ON public.whatsapp_instances(provider,instance_name);

CREATE TABLE IF NOT EXISTS public.whatsapp_bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL UNIQUE REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  assistant_name TEXT NOT NULL DEFAULT 'Nia',
  business_name TEXT NOT NULL DEFAULT 'Nextia',
  personality_mode TEXT NOT NULL DEFAULT 'consultiva_comercial',
  system_prompt TEXT NOT NULL DEFAULT '',
  welcome_message TEXT NOT NULL DEFAULT '',
  after_hours_message TEXT NOT NULL DEFAULT '',
  handoff_message TEXT NOT NULL DEFAULT '',
  closing_message TEXT NOT NULL DEFAULT '',
  primary_purpose TEXT NOT NULL DEFAULT 'whatsapp_sales_reply',
  fallback_purpose TEXT,
  fallback_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  site_content_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  crm_context_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  support_context_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  allow_new_contacts BOOLEAN NOT NULL DEFAULT TRUE,
  allow_existing_contacts BOOLEAN NOT NULL DEFAULT TRUE,
  human_transfer_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  auto_resume_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  human_timeout_minutes INTEGER NOT NULL DEFAULT 30 CHECK (human_timeout_minutes BETWEEN 1 AND 10080),
  grouping_window_ms INTEGER NOT NULL DEFAULT 1500 CHECK (grouping_window_ms BETWEEN 0 AND 30000),
  context_limit INTEGER NOT NULL DEFAULT 12 CHECK (context_limit BETWEEN 1 AND 50),
  max_auto_messages INTEGER NOT NULL DEFAULT 12 CHECK (max_auto_messages BETWEEN 1 AND 100),
  max_response_tokens INTEGER NOT NULL DEFAULT 400 CHECK (max_response_tokens BETWEEN 50 AND 4000),
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  service_hours JSONB NOT NULL DEFAULT '{"enabled":false}'::jsonb,
  pause_keywords TEXT[] NOT NULL DEFAULT ARRAY['atendente','falar com humano'],
  resume_keywords TEXT[] NOT NULL DEFAULT ARRAY['voltar ao bot'],
  opt_out_keywords TEXT[] NOT NULL DEFAULT ARRAY['sair','parar','cancelar mensagens'],
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  question_variations JSONB NOT NULL DEFAULT '[]'::jsonb,
  short_answer TEXT NOT NULL,
  full_answer TEXT NOT NULL,
  recommended_followups JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_service_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  requires_human_handoff BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  priority INTEGER NOT NULL DEFAULT 100,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_knowledge_scope_slug_uidx
  ON public.whatsapp_knowledge_articles(COALESCE(instance_id,'00000000-0000-0000-0000-000000000000'::uuid),slug);

CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crm_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_normalized TEXT GENERATED ALWAYS AS (REGEXP_REPLACE(COALESCE(phone,''),'\D','','g')) STORED,
  email TEXT,
  company_name TEXT,
  segment_slug TEXT,
  lifecycle_stage TEXT NOT NULL DEFAULT 'lead',
  source TEXT NOT NULL DEFAULT 'manual',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  consent_source TEXT,
  consent_at TIMESTAMPTZ,
  opt_out_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (phone_normalized <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_contacts_scope_phone_uidx
  ON public.whatsapp_contacts(COALESCE(organization_id,'00000000-0000-0000-0000-000000000000'::uuid),phone_normalized);
CREATE INDEX IF NOT EXISTS whatsapp_contacts_consent_idx ON public.whatsapp_contacts(marketing_consent,opt_out_at);
CREATE INDEX IF NOT EXISTS whatsapp_contacts_crm_idx ON public.whatsapp_contacts(crm_lead_id) WHERE crm_lead_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.whatsapp_contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_contact_list_members (
  list_id UUID NOT NULL REFERENCES public.whatsapp_contact_lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(list_id,contact_id)
);

CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE RESTRICT,
  contact_id UUID NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE RESTRICT,
  external_thread_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ai' CHECK (status IN ('ai','human','waiting','resolved','archived')),
  ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  human_takeover_at TIMESTAMPTZ,
  human_resume_at TIMESTAMPTZ,
  subject TEXT NOT NULL DEFAULT 'Atendimento pelo WhatsApp',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_preview TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  crm_opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  support_ticket_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(instance_id,external_thread_key)
);

CREATE INDEX IF NOT EXISTS whatsapp_conversations_status_idx ON public.whatsapp_conversations(status,last_message_at DESC);
CREATE INDEX IF NOT EXISTS whatsapp_conversations_contact_idx ON public.whatsapp_conversations(contact_id,last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  provider_message_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound','internal')),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('contact','ai','user','system')),
  sender_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  body TEXT,
  media_url TEXT,
  media_mime_type TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_status TEXT NOT NULL DEFAULT 'received' CHECK (delivery_status IN ('received','queued','sent','delivered','read','failed','internal')),
  delivery_error TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_messages_provider_uidx
  ON public.whatsapp_messages(provider_message_id) WHERE provider_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS whatsapp_messages_conversation_idx ON public.whatsapp_messages(conversation_id,created_at DESC);
CREATE INDEX IF NOT EXISTS whatsapp_messages_delivery_idx ON public.whatsapp_messages(delivery_status,created_at) WHERE direction='outbound';

CREATE TABLE IF NOT EXISTS public.whatsapp_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','resolved','cancelled')),
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_handoffs_status_idx ON public.whatsapp_handoffs(status,created_at DESC);

CREATE TABLE IF NOT EXISTS public.whatsapp_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.whatsapp_messages(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'info',
  error_code TEXT,
  error_message TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_message_logs_idx ON public.whatsapp_message_logs(event_type,status,created_at DESC);

CREATE TABLE IF NOT EXISTS public.whatsapp_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('granted','revoked','opt_out','imported','corrected')),
  source TEXT NOT NULL,
  legal_basis TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_consent_events_contact_idx ON public.whatsapp_consent_events(contact_id,created_at DESC);

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'marketing' CHECK (category IN ('marketing','utility','support','transactional')),
  body TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE RESTRICT,
  template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  contact_list_id UUID REFERENCES public.whatsapp_contact_lists(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  message_body TEXT NOT NULL,
  segment_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','test','scheduled','running','paused','completed','cancelled','failed')),
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  send_rate_per_minute INTEGER NOT NULL DEFAULT 10 CHECK (send_rate_per_minute BETWEEN 1 AND 120),
  quiet_hours JSONB NOT NULL DEFAULT '{"enabled":true,"start":"20:00","end":"08:00","timezone":"America/Sao_Paulo"}'::jsonb,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  read_count INTEGER NOT NULL DEFAULT 0,
  replied_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  opt_out_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_campaigns_status_idx ON public.whatsapp_campaigns(status,scheduled_at);

CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','suppressed','queued','sent','delivered','read','replied','failed','opted_out')),
  rendered_body TEXT,
  provider_message_id TEXT,
  failure_reason TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id,contact_id)
);

CREATE INDEX IF NOT EXISTS whatsapp_campaign_recipients_queue_idx
  ON public.whatsapp_campaign_recipients(status,scheduled_at) WHERE status IN ('pending','queued');

CREATE TABLE IF NOT EXISTS public.whatsapp_csv_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_list_id UUID REFERENCES public.whatsapp_contact_lists(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  column_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  consent_source TEXT,
  status TEXT NOT NULL DEFAULT 'preview' CHECK (status IN ('preview','processing','completed','failed','reverted')),
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  duplicate_rows INTEGER NOT NULL DEFAULT 0,
  invalid_rows INTEGER NOT NULL DEFAULT 0,
  error_report JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reverted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.whatsapp_csv_import_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.whatsapp_csv_imports(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  raw_data JSONB NOT NULL,
  normalized_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','valid','invalid','duplicate','imported')),
  contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(import_id,row_number)
);

INSERT INTO public.whatsapp_instances(label,provider,instance_name,enabled,configuration)
VALUES('WhatsApp Nextia','evolution','nextia',FALSE,'{"source":"environment","requires_homologation":true}'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO public.whatsapp_bot_settings(instance_id,assistant_name,business_name,system_prompt,welcome_message,after_hours_message,handoff_message,closing_message)
SELECT id,'Nia','Nextia',
  'Você é a assistente comercial da Nextia. Use somente informações verificadas da base de conhecimento, do catálogo, do site e do CRM. Nunca invente preços, prazos, disponibilidade ou condições. Identifique a necessidade, explique a solução de forma consultiva e encaminhe para uma pessoa quando faltar informação ou houver solicitação explícita.',
  'Olá! Sou a Nia, assistente virtual da Nextia. Como posso ajudar sua empresa hoje?',
  'Estamos fora do horário de atendimento humano, mas posso registrar sua necessidade e adiantar algumas informações.',
  'Vou encaminhar a conversa para nossa equipe continuar seu atendimento.',
  'Obrigada por conversar com a Nextia. Se precisar, é só chamar novamente.'
FROM public.whatsapp_instances WHERE instance_name='nextia'
ON CONFLICT(instance_id) DO NOTHING;

INSERT INTO public.automation_settings(key,value,description) VALUES
  ('whatsapp.ai_enabled','false'::jsonb,'Kill switch independente da IA do WhatsApp'),
  ('whatsapp.campaigns_enabled','false'::jsonb,'Campanhas permanecem bloqueadas até homologação'),
  ('whatsapp.max_messages_per_minute','10'::jsonb,'Limite global inicial de mensagens por minuto')
ON CONFLICT(key) DO NOTHING;

UPDATE public.ai_models
SET capabilities=capabilities||'["whatsapp_sales_reply"]'::jsonb
WHERE enabled=TRUE AND NOT (capabilities ? 'whatsapp_sales_reply');

INSERT INTO public.ai_prompt_versions(prompt_key,purpose,version,system_template,input_schema,output_schema,active)
VALUES('whatsapp_sales_reply','whatsapp_sales_reply',1,
  'Atue como atendente consultivo e comercial pelo WhatsApp. Use exclusivamente os fatos presentes no CONTEXTO. Nunca invente preço, prazo, promoção, disponibilidade, capacidade técnica ou política. Responda em português do Brasil, de forma clara e útil. Faça no máximo uma pergunta por vez. Quando faltar informação, solicite o dado necessário. Se houver reclamação, urgência, pagamento, risco, pedido de humano ou baixa confiança, marque handoff=true. Responda somente JSON.',
  '{"type":"object"}'::jsonb,
  '{"type":"object","required":["reply","handoff","intent","confidence"],"properties":{"reply":{"type":"string"},"handoff":{"type":"boolean"},"handoff_reason":{"type":"string"},"intent":{"type":"string"},"confidence":{"type":"number"},"crm_stage":{"type":"string"}}}'::jsonb,
  TRUE)
ON CONFLICT(prompt_key,version) DO NOTHING;
