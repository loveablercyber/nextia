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
