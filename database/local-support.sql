ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('client', 'admin', 'partner', 'technician'));

CREATE TABLE IF NOT EXISTS public.technician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_secondary TEXT,
  avatar TEXT,
  professional_title TEXT,
  bio TEXT,
  technical_level TEXT NOT NULL DEFAULT 'JUNIOR' CHECK (technical_level IN ('JUNIOR','PLENO','SENIOR','SPECIALIST')),
  employment_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE','INACTIVE','ON_LEAVE')),
  availability_status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (availability_status IN ('AVAILABLE','BUSY','ON_ROUTE','IN_SERVICE','BREAK','ABSENT','OFFLINE','INACTIVE')),
  accepts_remote BOOLEAN NOT NULL DEFAULT TRUE,
  accepts_onsite BOOLEAN NOT NULL DEFAULT FALSE,
  max_simultaneous_tickets INTEGER NOT NULL DEFAULT 4 CHECK (max_simultaneous_tickets BETWEEN 1 AND 100),
  home_city TEXT,
  home_state TEXT,
  service_radius_km INTEGER CHECK (service_radius_km IS NULL OR service_radius_km BETWEEN 0 AND 1000),
  service_cities TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.technician_specialties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);
INSERT INTO public.technician_specialties(id,name,sort_order) VALUES
 ('windows','Windows',10),('hardware','Hardware',20),('notebook','Notebook',30),('desktop','Desktop',40),
 ('printers','Impressoras',50),('networks','Redes',60),('wifi','Wi-Fi',70),('cabling','Cabeamento',80),
 ('cameras','Câmeras',90),('dvr-nvr','DVR/NVR',100),('backup','Backup',110),('security','Segurança',120),
 ('servers','Servidores',130),('software','Software',140),('sites','Sites',150),('automation','Automação',160)
ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.technician_profile_specialties (
  technician_profile_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  specialty_id TEXT NOT NULL REFERENCES public.technician_specialties(id) ON DELETE RESTRICT,
  PRIMARY KEY(technician_profile_id,specialty_id)
);
CREATE TABLE IF NOT EXISTS public.technician_authorized_services (
  technician_profile_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  service_slug TEXT NOT NULL REFERENCES public.commercial_services(slug) ON DELETE RESTRICT,
  PRIMARY KEY(technician_profile_id,service_slug)
);
CREATE TABLE IF NOT EXISTS public.technician_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), technician_profile_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6), start_time TIME NOT NULL, end_time TIME NOT NULL,
  CHECK (end_time > start_time), UNIQUE(technician_profile_id,weekday,start_time,end_time)
);
CREATE TABLE IF NOT EXISTS public.technician_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), technician_profile_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL, reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS technician_profile_availability_idx ON public.technician_profiles(employment_status,availability_status);
CREATE INDEX IF NOT EXISTS technician_time_off_range_idx ON public.technician_time_off(technician_profile_id,starts_at,ends_at);

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
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS service_slug TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS service_category TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS service_mode TEXT CHECK (service_mode IS NULL OR service_mode IN ('REMOTE','ONSITE','FLEXIBLE'));
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS service_city TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS service_state TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS required_specialty TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS desired_at TIMESTAMPTZ;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assignment_status TEXT NOT NULL DEFAULT 'AWAITING_MANUAL' CHECK (assignment_status IN ('AWAITING_MANUAL','ASSIGNED','ACCEPTED','REJECTED'));
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assignment_score INTEGER;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assignment_reason TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assignment_source TEXT CHECK (assignment_source IS NULL OR assignment_source IN ('AUTOMATIC','MANUAL','REASSIGNMENT'));

CREATE TABLE IF NOT EXISTS public.ticket_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  previous_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  new_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('AUTOMATIC','MANUAL','REASSIGNMENT')),
  score INTEGER,
  reason TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ticket_assignment_history_ticket_idx ON public.ticket_assignment_history(ticket_id,created_at DESC);
UPDATE public.support_tickets SET assignment_status='ASSIGNED',assignment_source=COALESCE(assignment_source,'MANUAL'),assignment_reason=COALESCE(assignment_reason,'Atribuição anterior à evolução do módulo') WHERE assigned_technician_id IS NOT NULL AND assignment_status='AWAITING_MANUAL';

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
