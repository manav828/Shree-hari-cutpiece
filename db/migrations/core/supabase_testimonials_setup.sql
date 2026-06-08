-- ============================================================
-- CMS ENHANCEMENTS - TESTIMONIALS (COMMUNITY STORIES) SETUP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quote text NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    avatar text NOT NULL,
    rating int NOT NULL DEFAULT 5,
    sort_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Service role manages testimonials" ON public.testimonials;

-- Create policies
CREATE POLICY "Anyone can read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Service role manages testimonials" ON public.testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed initial data safely
INSERT INTO public.testimonials (quote, name, location, avatar, rating, sort_order)
SELECT 'The texture of the linen is unlike anything I''ve owned. It brings a soul to my living room that mass-market pieces just can''t match.', 'Elena Thorne', 'New York, NY', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', 5, 0
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE name = 'Elena Thorne');

INSERT INTO public.testimonials (quote, name, location, avatar, rating, sort_order)
SELECT 'These ceramics have completely transformed our morning coffee ritual. True craftsmanship.', 'Marcus Chen', 'Seattle, WA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', 5, 1
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE name = 'Marcus Chen');

INSERT INTO public.testimonials (quote, name, location, avatar, rating, sort_order)
SELECT 'The Saharan throw is my favorite piece in the house. The natural dyes are so rich and earthy.', 'Sophie Laurent', 'Austin, TX', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', 5, 2
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE name = 'Sophie Laurent');

INSERT INTO public.testimonials (quote, name, location, avatar, rating, sort_order)
SELECT 'Knowing the story behind each basket makes them so much more special. Beautifully made.', 'David Miller', 'Portland, OR', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', 5, 3
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE name = 'David Miller');
