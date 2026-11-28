-- Migration 0027: dimensões opcionais de exibição para pop-ups de imagem.
ALTER TABLE public.marketing_popups ADD COLUMN IF NOT EXISTS image_width INTEGER;
ALTER TABLE public.marketing_popups ADD COLUMN IF NOT EXISTS image_height INTEGER;