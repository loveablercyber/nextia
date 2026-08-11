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
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS phone_secondary TEXT;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS professional_title TEXT;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS technical_level TEXT NOT NULL DEFAULT 'JUNIOR';
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS employment_status TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'OFFLINE';
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS accepts_remote BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS accepts_onsite BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS max_simultaneous_tickets INTEGER NOT NULL DEFAULT 4;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS home_city TEXT;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS home_state TEXT;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS service_radius_km INTEGER;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS service_cities TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.technician_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

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

ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS operational_status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (operational_status IN ('REQUESTED','ASSIGNED','ACCEPTED','SCHEDULED','ON_ROUTE','ON_SITE','IN_SERVICE','PAUSED','WAITING_CUSTOMER','FINISHED','CANCELLED'));
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS sla_accept_by TIMESTAMPTZ;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS sla_response_by TIMESTAMPTZ;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS departure_at TIMESTAMPTZ;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS arrival_at TIMESTAMPTZ;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS service_finished_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.ticket_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
 actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, event_type TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); CREATE INDEX IF NOT EXISTS ticket_events_ticket_idx ON public.ticket_events(ticket_id,created_at);
CREATE TABLE IF NOT EXISTS public.technician_notifications (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE, type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
 read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); CREATE INDEX IF NOT EXISTS technician_notifications_user_idx ON public.technician_notifications(technician_id,read_at,created_at DESC);
CREATE TABLE IF NOT EXISTS public.technician_calendar_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE, event_type TEXT NOT NULL CHECK(event_type IN ('ONSITE','REMOTE','MAINTENANCE','BLOCK')),
 title TEXT NOT NULL, starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL, notes TEXT, created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CHECK(ends_at>starts_at)
); CREATE INDEX IF NOT EXISTS technician_calendar_range_idx ON public.technician_calendar_events(technician_id,starts_at,ends_at);
CREATE TABLE IF NOT EXISTS public.ticket_time_entries (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
 technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT, started_at TIMESTAMPTZ NOT NULL, ended_at TIMESTAMPTZ,
 duration_minutes INTEGER, billable BOOLEAN NOT NULL DEFAULT TRUE, entry_type TEXT NOT NULL DEFAULT 'SERVICE' CHECK(entry_type IN ('SERVICE','ADMIN','TRAVEL')),
 notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); CREATE INDEX IF NOT EXISTS ticket_time_entries_ticket_idx ON public.ticket_time_entries(ticket_id,started_at);
CREATE TABLE IF NOT EXISTS public.techcare_balances (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 plan_name TEXT NOT NULL, included_minutes INTEGER NOT NULL, period_start DATE NOT NULL, period_end DATE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id,period_start,period_end)
);
CREATE TABLE IF NOT EXISTS public.service_orders (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_number BIGSERIAL UNIQUE, ticket_id UUID NOT NULL UNIQUE REFERENCES public.support_tickets(id) ON DELETE CASCADE,
 customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, equipment_id UUID,
 problem TEXT NOT NULL DEFAULT '', diagnosis TEXT NOT NULL DEFAULT '', service_performed TEXT NOT NULL DEFAULT '', travel_km NUMERIC, travel_cost_cents INTEGER,
 notes TEXT, status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','AWAITING_APPROVAL','APPROVED','COMPLETED','CANCELLED')), customer_signature TEXT, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.service_order_parts (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
 name TEXT NOT NULL, description TEXT, quantity NUMERIC NOT NULL DEFAULT 1, estimated_price_cents INTEGER NOT NULL DEFAULT 0,
 approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(approval_status IN ('PENDING','APPROVED','REJECTED')), created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, approved_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.ticket_reviews (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID NOT NULL UNIQUE REFERENCES public.support_tickets(id) ON DELETE CASCADE,
 technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.sla_rules (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), service_slug TEXT, priority TEXT NOT NULL, acceptance_minutes INTEGER NOT NULL, first_response_minutes INTEGER NOT NULL, resolution_minutes INTEGER, active BOOLEAN NOT NULL DEFAULT TRUE, UNIQUE(service_slug,priority)
);
INSERT INTO public.sla_rules(service_slug,priority,acceptance_minutes,first_response_minutes,resolution_minutes) VALUES
 (NULL,'baixa',240,480,2880),(NULL,'normal',120,240,1440),(NULL,'alta',30,60,480),(NULL,'urgente',10,30,240) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.technician_compensation_rules (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 service_slug TEXT, category TEXT, compensation_type TEXT NOT NULL CHECK(compensation_type IN ('FIXED','PERCENTAGE','HOURLY','NONE')),
 value NUMERIC NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.technician_permissions (
 technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, permission TEXT NOT NULL,
 granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(technician_id,permission)
);

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
ALTER TABLE public.technical_resources DROP CONSTRAINT IF EXISTS technical_resources_category_check;
ALTER TABLE public.technical_resources ADD CONSTRAINT technical_resources_category_check CHECK(category IN ('tool','driver','document','script','knowledge'));
ALTER TABLE public.technical_resources ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE public.technical_resources ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.technical_resources ADD COLUMN IF NOT EXISTS official BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.technical_resources ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

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
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS equipment_id UUID REFERENCES public.customer_equipment(id) ON DELETE SET NULL;
