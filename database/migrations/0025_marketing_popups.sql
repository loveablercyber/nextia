-- Migration 0025: Gerenciador de Pop-up Modal de Marketing
CREATE TABLE IF NOT EXISTS public.marketing_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('image', 'text')),
  target_page TEXT NOT NULL DEFAULT '/',
  image_url TEXT,
  image_link TEXT,
  image_alt TEXT,
  headline TEXT,
  description TEXT,
  badge_text TEXT,
  button_text TEXT,
  button_link TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  delay_seconds INTEGER NOT NULL DEFAULT 2,
  dismiss_hours INTEGER NOT NULL DEFAULT 24,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_popups_target_active
  ON public.marketing_popups (target_page, active);

-- Garante configuração inicial para suporte receber notificações via WhatsApp
INSERT INTO public.automation_settings (key, value, description)
VALUES ('support.whatsapp_forward_phone', '"5514996405496"'::jsonb, 'WhatsApp para notificações de novos chamados e respostas de suporte')
ON CONFLICT (key) DO NOTHING;

-- Garante que a IA de suporte esteja habilitada em modo automático por padrão
UPDATE public.support_ai_settings
SET mode = 'auto', updated_at = NOW()
WHERE singleton = TRUE AND mode = 'draft';

UPDATE public.automation_settings
SET value = 'true'::jsonb, updated_at = NOW()
WHERE key = 'ai.enabled' AND value = 'false'::jsonb;
