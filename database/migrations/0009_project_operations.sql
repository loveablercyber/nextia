-- Etapa 9: operações de projetos e portal do cliente.
-- Incremental, sem remoção ou fabricação de dados históricos.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS crm_proposal_id UUID REFERENCES public.crm_proposals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS responsible_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_projects_responsible_status
  ON public.projects(responsible_user_id, status);

DO $$ BEGIN
  ALTER TABLE public.projects ADD CONSTRAINT projects_source_order_id_fkey
    FOREIGN KEY(source_order_id) REFERENCES public.commercial_orders(id) ON DELETE SET NULL NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.projects ADD CONSTRAINT projects_source_contract_id_fkey
    FOREIGN KEY(source_contract_id) REFERENCES public.commercial_plan_contracts(id) ON DELETE SET NULL NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS requires_client_action BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS storage_resource_type TEXT;

ALTER TABLE public.change_requests
  ADD COLUMN IF NOT EXISTS requested_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS request_kind TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS deliverable_id UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  task_kind TEXT NOT NULL DEFAULT 'internal',
  visibility TEXT NOT NULL DEFAULT 'internal',
  responsible_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'normal',
  completed_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_tasks_status_check CHECK (status IN ('pending','in_progress','blocked','completed','cancelled')),
  CONSTRAINT project_tasks_kind_check CHECK (task_kind IN ('internal','client_action')),
  CONSTRAINT project_tasks_visibility_check CHECK (visibility IN ('internal','client','both'))
);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_status
  ON public.project_tasks(project_id, status, due_at);

CREATE TABLE IF NOT EXISTS public.project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'client',
  current_version INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_deliverables_status_check CHECK (status IN ('draft','submitted','approved','changes_requested','superseded')),
  CONSTRAINT project_deliverables_visibility_check CHECK (visibility IN ('internal','client','both'))
);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_project_status
  ON public.project_deliverables(project_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.project_deliverable_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES public.project_deliverables(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
  external_url TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unq_project_deliverable_version UNIQUE(deliverable_id, version),
  CONSTRAINT deliverable_version_content_check CHECK (file_id IS NOT NULL OR external_url IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.project_deliverable_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES public.project_deliverables(id) ON DELETE CASCADE,
  deliverable_version_id UUID NOT NULL REFERENCES public.project_deliverable_versions(id) ON DELETE RESTRICT,
  actor_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  result TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT deliverable_approval_result_check CHECK (result IN ('approved','changes_requested')),
  CONSTRAINT unq_deliverable_version_actor_result UNIQUE(deliverable_version_id, actor_user_id, result)
);
CREATE INDEX IF NOT EXISTS idx_deliverable_approvals_deliverable
  ON public.project_deliverable_approvals(deliverable_id, created_at DESC);

ALTER TABLE public.change_requests
  DROP CONSTRAINT IF EXISTS change_requests_deliverable_id_fkey;
ALTER TABLE public.change_requests
  ADD CONSTRAINT change_requests_deliverable_id_fkey
  FOREIGN KEY (deliverable_id) REFERENCES public.project_deliverables(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  deliverable_id UUID REFERENCES public.project_deliverables(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'both',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_comments_visibility_check CHECK (visibility IN ('internal','client','both')),
  CONSTRAINT project_comments_body_check CHECK (char_length(body) BETWEEN 1 AND 5000)
);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_created
  ON public.project_comments(project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.project_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  visibility TEXT NOT NULL DEFAULT 'both',
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_events_visibility_check CHECK (visibility IN ('internal','client','both'))
);
CREATE INDEX IF NOT EXISTS idx_project_events_project_created
  ON public.project_events(project_id, created_at DESC);

-- Corrige apenas percentuais que podem ser derivados de marcos existentes.
UPDATE public.projects p
SET progress_percent = derived.progress,
    updated_at = CASE WHEN p.progress_percent IS DISTINCT FROM derived.progress THEN NOW() ELSE p.updated_at END
FROM (
  SELECT project_id,
         ROUND(100.0 * COUNT(*) FILTER (WHERE status='concluido') / NULLIF(COUNT(*) FILTER (WHERE status<>'cancelado'),0))::integer AS progress
  FROM public.milestones
  GROUP BY project_id
) derived
WHERE p.id=derived.project_id AND derived.progress IS NOT NULL;
