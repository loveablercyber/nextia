-- Segment-specific previews, transparent plans and seven-day demo accounts.

ALTER TABLE public.commercial_addons
  ADD COLUMN IF NOT EXISTS eligible_segments TEXT[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.acquisition_funnel_sessions
  ADD COLUMN IF NOT EXISTS selected_plan_id TEXT REFERENCES public.commercial_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS demo_created_at TIMESTAMPTZ;

ALTER TABLE public.acquisition_preview_projects
  ADD COLUMN IF NOT EXISTS share_key UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.service_engagements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS demo_status TEXT NOT NULL DEFAULT 'draft';

UPDATE public.acquisition_preview_projects SET share_key=gen_random_uuid() WHERE share_key IS NULL;
ALTER TABLE public.acquisition_preview_projects ALTER COLUMN share_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unq_acquisition_preview_share_key ON public.acquisition_preview_projects(share_key);
CREATE INDEX IF NOT EXISTS idx_acquisition_preview_owner ON public.acquisition_preview_projects(owner_user_id, expires_at DESC);

ALTER TABLE public.service_engagements
  ADD COLUMN IF NOT EXISTS demo_session_id UUID REFERENCES public.acquisition_funnel_sessions(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unq_service_engagement_demo_session
  ON public.service_engagements(demo_session_id) WHERE demo_session_id IS NOT NULL;

ALTER TABLE public.local_auth_users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS temporary_password_expires_at TIMESTAMPTZ;

INSERT INTO public.commercial_addons (code,name,description,amount_cents,billing_cycle,service_slug,active,eligible_segments)
VALUES
  ('opt-agendamento-clinica','Agendamento da clínica','Agenda por especialidade, profissional e horário',2900,'monthly','sites-prontos',TRUE,ARRAY['clinicas']),
  ('opt-area-paciente','Área do paciente','Área reservada para orientações e documentos',3900,'monthly','sites-prontos',TRUE,ARRAY['clinicas']),
  ('opt-teleconsulta','Teleconsulta integrada','Atendimento remoto com confirmação e acesso protegido',6900,'monthly','sites-prontos',TRUE,ARRAY['clinicas']),
  ('opt-agendamento-servicos','Agenda de visitas','Solicitação de visita por serviço e região',2900,'monthly','sites-prontos',TRUE,ARRAY['prestadores-de-servicos']),
  ('opt-catalogo-whatsapp','Catálogo com WhatsApp','Catálogo navegável com atendimento e pedido pelo WhatsApp',3900,'monthly','sites-prontos',TRUE,ARRAY['lojas']),
  ('opt-reserva-hotel','Motor de reservas','Consulta de quartos, hóspedes, datas e disponibilidade',5900,'monthly','sites-prontos',TRUE,ARRAY['hoteis']),
  ('opt-tour-hotel','Galeria de acomodações','Galeria profissional por quarto e experiência',2900,'monthly','sites-prontos',TRUE,ARRAY['hoteis']),
  ('opt-idiomas-hotel','Site em outros idiomas','Versões em inglês e espanhol para hóspedes internacionais',19900,'one_time','sites-prontos',TRUE,ARRAY['hoteis']),
  ('opt-email-profissional','E-mail profissional','Caixa de e-mail com o domínio do negócio e configuração assistida',1900,'monthly','sites-prontos',TRUE,ARRAY['contabilidade','advocacia','clinicas','restaurantes','hoteis','saloes-de-beleza','prestadores-de-servicos','lojas'])
ON CONFLICT (code) DO UPDATE SET
  name=EXCLUDED.name,description=EXCLUDED.description,amount_cents=EXCLUDED.amount_cents,
  billing_cycle=EXCLUDED.billing_cycle,service_slug=EXCLUDED.service_slug,active=TRUE,
  eligible_segments=EXCLUDED.eligible_segments;

UPDATE public.commercial_addons SET service_slug='sites-prontos',eligible_segments=ARRAY['restaurantes']
WHERE code IN ('opt-chatbot','opt-reservas','opt-delivery','opt-pdv','opt-fidelidade','opt-idiomas','opt-fotos');
UPDATE public.commercial_addons SET service_slug='sites-prontos',eligible_segments=ARRAY['saloes-de-beleza']
WHERE code IN ('opt-agendamento-salao','opt-lembrete-whatsapp','opt-fidelidade-salao','opt-galeria-trabalhos','opt-fotos-salao');
UPDATE public.commercial_addons SET service_slug='sites-prontos',eligible_segments=ARRAY['advocacia','contabilidade','prestadores-de-servicos']
WHERE code IN ('opt-portal-cliente','opt-assinatura-digital','opt-upload-seguro','opt-agendamento-consultas');
UPDATE public.commercial_addons SET service_slug='sites-prontos',eligible_segments=ARRAY['advocacia']
WHERE code='opt-consulta-processual';
UPDATE public.commercial_addons SET service_slug='sites-prontos',eligible_segments=ARRAY['lojas']
WHERE code IN ('opt-checkout-integrado','opt-calculo-frete','opt-cupons-whatsapp','opt-estoque-real','opt-moedas-idiomas');

UPDATE public.acquisition_campaigns
SET settings=jsonb_set(jsonb_set(settings,'{previewTtlDays}','7'::jsonb,TRUE),'{allowedSegments}','["contabilidade","advocacia","clinicas","restaurantes","hoteis","saloes-de-beleza","prestadores-de-servicos","lojas"]'::jsonb,TRUE),updated_at=NOW()
WHERE slug='site-inteligente';

INSERT INTO public.commercial_store_templates
  (id,slug,service_slug,name,category,description,cover_image,preview_url,features,featured,active,price_cents,activation_fee_cents,sort_order)
VALUES
  ('tpl-hotel-pousada','hotel-pousada','sites-prontos','Hotel & Pousada','Hotelaria','Site para hotéis e pousadas com acomodações, localização e reserva online.','/images/templates/hotel-pousada.png','/crie-seu-site','["Acomodações","Reserva online","Google Maps","WhatsApp integrado"]'::jsonb,FALSE,TRUE,9900,24700,65)
ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,category=EXCLUDED.category,description=EXCLUDED.description,
  cover_image=EXCLUDED.cover_image,features=EXCLUDED.features,active=TRUE,updated_at=NOW();

UPDATE public.acquisition_pricing_rules
SET mode='plans',minimum_cents=19700,maximum_cents=29700,suggested_cents=24700,
    activation_cents=19700,monthly_cents=5900,suggestions='[19700,24700,29700]'::jsonb,updated_at=NOW()
WHERE campaign_id=(SELECT id FROM public.acquisition_campaigns WHERE slug='site-inteligente') AND active=TRUE;
