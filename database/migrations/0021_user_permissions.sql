ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('client', 'admin', 'partner', 'technician', 'financial', 'support'));

CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL CHECK (permission_key IN (
    'finance.view', 'finance.manage', 'support.view', 'support.manage'
  )),
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_key)
);

CREATE INDEX IF NOT EXISTS user_permissions_user_idx
  ON public.user_permissions(user_id);

INSERT INTO public.user_permissions (user_id, permission_key, granted)
SELECT p.id, defaults.permission_key, TRUE
FROM public.profiles p
CROSS JOIN LATERAL (
  SELECT permission_key
  FROM (VALUES
    ('financial', 'finance.view'),
    ('financial', 'finance.manage'),
    ('support', 'support.view'),
    ('support', 'support.manage')
  ) AS role_permissions(role, permission_key)
  WHERE role_permissions.role = p.role
) AS defaults
ON CONFLICT (user_id, permission_key) DO NOTHING;
