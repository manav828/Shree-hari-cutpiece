-- =============================================================================
-- Add Artisan Story Columns to Products Table
-- =============================================================================

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS artisan_headline TEXT,
ADD COLUMN IF NOT EXISTS artisan_description TEXT,
ADD COLUMN IF NOT EXISTS artisan_image TEXT,
ADD COLUMN IF NOT EXISTS artisan_quote TEXT;
