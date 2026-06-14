-- Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment_text TEXT NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[],
    video_url TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast retrieval of visible reviews for a product
CREATE INDEX IF NOT EXISTS product_reviews_product_id_is_visible_idx ON public.product_reviews(product_id, is_visible);

-- Insert allow_user_reviews default setting if not already present
INSERT INTO public.site_settings (key, value)
VALUES ('allow_user_reviews', '"true"')
ON CONFLICT (key) DO NOTHING;
