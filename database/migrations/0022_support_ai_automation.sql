CREATE TABLE IF NOT EXISTS public.support_ai_settings (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
  mode TEXT NOT NULL DEFAULT 'draft' CHECK (mode IN ('off', 'draft', 'auto')),
  confidence_threshold NUMERIC(4,3) NOT NULL DEFAULT 0.750 CHECK (confidence_threshold BETWEEN 0 AND 1),
  max_auto_replies INTEGER NOT NULL DEFAULT 3 CHECK (max_auto_replies BETWEEN 1 AND 20),
  business_hours_only BOOLEAN NOT NULL DEFAULT FALSE,
  business_hours_start TIME NOT NULL DEFAULT '08:00',
  business_hours_end TIME NOT NULL DEFAULT '18:00',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.support_ai_settings(singleton) VALUES(TRUE)
ON CONFLICT(singleton) DO NOTHING;

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS ai_paused BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_auto_reply_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_last_decision TEXT,
  ADD COLUMN IF NOT EXISTS ai_last_decision_at TIMESTAMPTZ;
