-- Migration 0026: período opcional (início/fim) para os pop-ups modais de marketing.
ALTER TABLE public.marketing_popups ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE public.marketing_popups ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;
