-- Etapa 11: conteúdo editorial e aquisição orgânica controlada.
-- Não duplica metadata de páginas comerciais; os campos SEO pertencem ao próprio conteúdo.

CREATE TABLE IF NOT EXISTS public.content_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content_markdown TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name_snapshot TEXT NOT NULL DEFAULT 'Equipe Nextia',
  pillar TEXT NOT NULL CHECK (pillar IN ('presenca-digital','automacao-responsavel','operacao-ti')),
  topic TEXT NOT NULL,
  publication_reason TEXT NOT NULL,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  canonical_url TEXT,
  og_image_url TEXT,
  indexing_policy TEXT NOT NULL DEFAULT 'index' CHECK (indexing_policy IN ('index','noindex')),
  archive_policy TEXT NOT NULL DEFAULT 'keep_noindex' CHECK (archive_policy IN ('keep_noindex','not_found')),
  related_service_slug TEXT,
  related_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_label TEXT NOT NULL DEFAULT 'Solicitar uma avaliação',
  cta_path TEXT NOT NULL DEFAULT '/orcamento',
  submitted_for_review_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_entries_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT content_entries_paths_array CHECK (jsonb_typeof(related_paths) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_content_entries_public
  ON public.content_entries(status,published_at DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_content_entries_review
  ON public.content_entries(status,review_due_at,updated_at DESC);

CREATE TABLE IF NOT EXISTS public.content_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content_entries(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_status_history_content ON public.content_status_history(content_id,created_at DESC);

INSERT INTO public.automations
  (id,name,description,status,trigger_type,trigger_config,conditions,current_version,risk_level,requires_approval,dry_run)
VALUES
  ('a1100000-0000-4000-8000-000000000001','Revisão editorial solicitada','Avisa administradores quando um conteúdo entra em revisão. Nunca publica automaticamente.','active','event','{"events":["content.review_requested"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,1,0,FALSE,FALSE)
ON CONFLICT(id) DO NOTHING;

INSERT INTO public.automation_versions(automation_id,version,trigger_snapshot,conditions_snapshot,actions_snapshot)
VALUES
  ('a1100000-0000-4000-8000-000000000001',1,'{"events":["content.review_requested"]}'::jsonb,'{"operator":"and","rules":[]}'::jsonb,'[{"id":"notify-editorial-review","type":"notify_admins","config":{"title":"Conteúdo aguardando revisão","message":"Um conteúdo editorial precisa de revisão humana antes da publicação.","notificationType":"content_review"}}]'::jsonb)
ON CONFLICT(automation_id,version) DO NOTHING;
