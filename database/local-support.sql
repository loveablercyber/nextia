ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('client', 'admin', 'technician'));

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto'
    CHECK (status IN ('aberto', 'respondido', 'fechado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_token TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx
  ON public.support_tickets (user_id);

CREATE INDEX IF NOT EXISTS support_tickets_email_idx
  ON public.support_tickets (LOWER(email));

CREATE INDEX IF NOT EXISTS support_tickets_created_at_idx
  ON public.support_tickets (created_at DESC);

ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assigned_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS technical_notes TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS support_tickets_technician_idx ON public.support_tickets (assigned_technician_id, status);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin')),
  message TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_created_at_idx
  ON public.ticket_messages (ticket_id, created_at);

ALTER TABLE public.ticket_messages DROP CONSTRAINT IF EXISTS ticket_messages_sender_role_check;
ALTER TABLE public.ticket_messages ADD CONSTRAINT ticket_messages_sender_role_check
  CHECK (sender_role IN ('client', 'admin', 'technician'));

CREATE TABLE IF NOT EXISTS public.technical_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('tool', 'driver', 'document')),
  platform TEXT NOT NULL DEFAULT 'Todos',
  version TEXT,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS technical_resources_active_order_idx ON public.technical_resources(active, category, sort_order);

CREATE TABLE IF NOT EXISTS public.customer_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  operating_system TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS customer_equipment_user_idx ON public.customer_equipment(user_id, status);
