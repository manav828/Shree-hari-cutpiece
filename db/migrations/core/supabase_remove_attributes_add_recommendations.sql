-- =============================================================================
-- Remove Product Attributes + Add Description HTML/CSS and Recommendations
-- =============================================================================

-- 1) Add new product description and recommendation fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_html TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_css TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS use_custom_description BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS related_product_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2) Drop unused attribute tables
DROP TABLE IF EXISTS public.product_attribute_values;
DROP TABLE IF EXISTS public.product_attribute_definitions;
