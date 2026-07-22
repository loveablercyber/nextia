CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  company TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  avatar_initials TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.local_auth_users (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_lower_idx ON public.profiles(lower(email));

INSERT INTO public.profiles (id, email, name, company, phone, role, avatar_initials)
VALUES (
  gen_random_uuid(),
  lower('admin@nextia.com.br'),
  'Admin Nextia',
  'Nextia',
  '(14) 99640-5496',
  'admin',
  'AN'
)
ON CONFLICT (email) DO UPDATE
SET role = 'admin',
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    company = COALESCE(public.profiles.company, EXCLUDED.company),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    avatar_initials = COALESCE(public.profiles.avatar_initials, EXCLUDED.avatar_initials);
