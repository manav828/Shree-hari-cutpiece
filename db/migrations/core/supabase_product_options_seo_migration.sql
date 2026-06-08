-- =============================================================================
-- Product Options, Attributes, and SEO/Product Content Migration
-- =============================================================================

-- 1) Product Options: Groups
CREATE TABLE IF NOT EXISTS public.product_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type = ANY (ARRAY['radio','multi','dropdown','input'])),
  input_data_type TEXT NOT NULL DEFAULT 'text' CHECK (input_data_type = ANY (ARRAY['text','number'])),
  required BOOLEAN NOT NULL DEFAULT FALSE,
  min_selections INTEGER,
  max_selections INTEGER,
  placeholder TEXT,
  help_text TEXT,
  input_min_length INTEGER,
  input_max_length INTEGER,
  input_min_value NUMERIC,
  input_max_value NUMERIC,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product_option_groups"  ON public.product_option_groups FOR SELECT USING (TRUE);
CREATE POLICY "Admin insert product_option_groups" ON public.product_option_groups FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin update product_option_groups" ON public.product_option_groups FOR UPDATE USING (TRUE);
CREATE POLICY "Admin delete product_option_groups" ON public.product_option_groups FOR DELETE USING (TRUE);

-- 2) Product Options: Values
CREATE TABLE IF NOT EXISTS public.product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product_option_values"  ON public.product_option_values FOR SELECT USING (TRUE);
CREATE POLICY "Admin insert product_option_values" ON public.product_option_values FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin update product_option_values" ON public.product_option_values FOR UPDATE USING (TRUE);
CREATE POLICY "Admin delete product_option_values" ON public.product_option_values FOR DELETE USING (TRUE);

-- 3) Product SEO and Content Fields
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

-- 6) Order Item Options Snapshot
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_options_json JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 7) Ensure updated_at helper exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 7) updated_at triggers for new tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'product_option_groups',
    'product_option_values'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    ', t, t);
  END LOOP;
END;
$$;
