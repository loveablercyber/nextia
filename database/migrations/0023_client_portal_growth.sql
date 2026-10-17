-- Pendências do cliente e campanhas comerciais reais no portal.
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS client_last_read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS support_tickets_client_unread_idx
  ON public.support_tickets(user_id, client_last_read_at, created_at DESC);

CREATE TABLE IF NOT EXISTS public.client_portal_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'Oferta para clientes',
  discount_label TEXT,
  service_slug TEXT REFERENCES public.commercial_services(slug) ON DELETE SET NULL,
  plan_id TEXT REFERENCES public.commercial_plans(id) ON DELETE SET NULL,
  addon_code TEXT,
  cta_path TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 100,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at IS NULL OR ends_at > starts_at),
  CHECK (cta_path LIKE '/%')
);

CREATE INDEX IF NOT EXISTS client_portal_offers_active_window_idx
  ON public.client_portal_offers(active, starts_at, ends_at, priority);
