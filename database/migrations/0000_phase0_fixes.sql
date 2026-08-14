-- Migration 0000: Phase 0 fixes - Explicit columns and indexes for projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS source_order_id UUID;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS source_contract_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_source_contract_id ON public.projects (source_contract_id) WHERE source_contract_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_source_order_id ON public.projects (source_order_id) WHERE source_order_id IS NOT NULL;
