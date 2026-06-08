-- Hotfix for environments where product content columns were not applied.
-- Safe to run multiple times.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_html TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_css TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS use_custom_description BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS related_product_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS twitter_card_type TEXT DEFAULT 'summary_large_image';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS faqs JSONB NOT NULL DEFAULT '[]'::jsonb;
