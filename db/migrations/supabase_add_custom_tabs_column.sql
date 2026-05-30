-- Add custom_tabs JSONB column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS custom_tabs JSONB NOT NULL DEFAULT '[]'::jsonb;
