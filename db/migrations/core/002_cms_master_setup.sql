-- ============================================================
-- SHREE HARI CMS - MASTER SETUP (PHASE 1 + 2 + 3)
-- ============================================================
-- Run this file in Supabase SQL Editor for one-shot CMS bootstrap.
-- This file is idempotent for schema and seed inserts.
--
-- Includes:
--  1) site_config setup + seed
--  2) categories setup + seed
--  3) banners setup + seed
-- ============================================================

-- ---------------------------
-- 1) SITE CONFIG SETUP
-- ---------------------------
CREATE TABLE IF NOT EXISTS public.site_config (
    key text PRIMARY KEY,
    value text NOT NULL DEFAULT '',
    label text,
    "group" text NOT NULL,
    type text NOT NULL CHECK (type IN ('text', 'textarea', 'number', 'url')),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_site_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_config_updated_at ON public.site_config;
CREATE TRIGGER trg_site_config_updated_at
BEFORE UPDATE ON public.site_config
FOR EACH ROW
EXECUTE FUNCTION public.set_site_config_updated_at();

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS site_config_public_read ON public.site_config;
CREATE POLICY site_config_public_read
ON public.site_config
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS site_config_authenticated_write ON public.site_config;
CREATE POLICY site_config_authenticated_write
ON public.site_config
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS site_config_authenticated_update ON public.site_config;
CREATE POLICY site_config_authenticated_update
ON public.site_config
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ---------------------------
-- 1b) SITE CONFIG SEED
-- ---------------------------
INSERT INTO public.site_config (key, value, label, "group", type) VALUES
  ('hero_badge',          'Premium Fabric Collection',            'Badge Text',              'hero',        'text'),
  ('hero_headline',       'Premium Cutpiece',                     'Headline',                'hero',        'text'),
  ('hero_subheading',     'Per Meter',                            'Subheading',              'hero',        'text'),
  ('hero_description',    'Design your own outfits with our curated collection of high-quality fabrics. From everyday cotton to luxurious silk, find the perfect fabric for your creative vision.', 'Description', 'hero', 'textarea'),
  ('hero_cta1_label',     'Explore Collection',                   'Button 1 Label',          'hero',        'text'),
  ('hero_cta1_url',       '/shop',                                'Button 1 URL',            'hero',        'url'),
  ('hero_cta2_label',     'Our Story',                            'Button 2 Label',          'hero',        'text'),
  ('hero_cta2_url',       '/about',                               'Button 2 URL',            'hero',        'url'),
  ('hero_stat1_number',   '10+',                                  'Stat 1 Number',           'stats',       'text'),
  ('hero_stat1_label',    'Years Experience',                     'Stat 1 Label',            'stats',       'text'),
  ('hero_stat2_number',   '5k+',                                  'Stat 2 Number',           'stats',       'text'),
  ('hero_stat2_label',    'Happy Customers',                      'Stat 2 Label',            'stats',       'text'),
  ('hero_stat3_number',   '100%',                                 'Stat 3 Number',           'stats',       'text'),
  ('hero_stat3_label',    'Quality Assured',                      'Stat 3 Label',            'stats',       'text'),
  ('hero_desktop_image',  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1000&q=85', 'Desktop Hero Image', 'hero', 'url'),
  ('hero_mobile_image',   'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1000&q=85', 'Mobile Hero Image',  'hero', 'url'),
  ('desc_badge',          'Why Choose Us',                        'Badge',                   'description', 'text'),
  ('desc_headline',       'Crafting Dreams,',                     'Headline',                'description', 'text'),
  ('desc_headline_accent','One Fabric at a Time',                 'Headline Accent',         'description', 'text'),
  ('desc_paragraph',      'At Shree Hari Cutpiece, we bring generations of textile expertise to your doorstep with curated fabrics designed for creativity and comfort.', 'Paragraph', 'description', 'textarea'),
  ('desc_point1_title',   'Premium Quality',                      'Point 1 Title',           'description', 'text'),
  ('desc_point1_text',    'Sourced from trusted manufacturers',   'Point 1 Text',            'description', 'text'),
  ('desc_point2_title',   'Sold Per Meter',                       'Point 2 Title',           'description', 'text'),
  ('desc_point2_text',    'Buy exactly what you need',            'Point 2 Text',            'description', 'text'),
  ('desc_point3_title',   'Design Freedom',                       'Point 3 Title',           'description', 'text'),
  ('desc_point3_text',    'Create outfits that are uniquely yours', 'Point 3 Text',          'description', 'text'),
  ('desc_stat_number',    '10+',                                  'Floating Stat Number',    'description', 'text'),
  ('desc_stat_label',     'Years of Excellence',                  'Floating Stat Label',     'description', 'text'),
  ('desc_image1',         '',                                     'Section Image 1',         'description', 'url'),
  ('desc_image2',         '',                                     'Section Image 2',         'description', 'url'),
  ('store_address',       '123, Textile Market, Ring Road, Ahmedabad, Gujarat - 380001', 'Address', 'store', 'textarea'),
  ('store_hours_weekday', 'Monday - Saturday: 10:00 AM - 8:00 PM','Weekday Hours',           'store',       'text'),
  ('store_hours_weekend', 'Sunday: 11:00 AM - 6:00 PM',           'Weekend Hours',           'store',       'text'),
  ('store_phone',         '+91 XXXXX XXXXX',                      'Phone',                   'store',       'text'),
  ('store_email',         'info@shreeharicutpiece.com',           'Email',                   'store',       'text'),
  ('store_maps_url',      'https://maps.google.com',              'Directions URL',          'store',       'url'),
  ('store_embed_url',     'https://www.google.com/maps/embed?...','Maps Embed URL',          'store',       'url')
ON CONFLICT (key) DO NOTHING;

-- ---------------------------
-- 2) CATEGORIES SETUP
-- ---------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_categories_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.set_categories_updated_at();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_categories_slug_active'
    ) THEN
        CREATE UNIQUE INDEX idx_categories_slug_active
            ON public.categories(slug)
            WHERE deleted_at IS NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_categories_sort_active'
    ) THEN
        CREATE INDEX idx_categories_sort_active
            ON public.categories(sort_order)
            WHERE deleted_at IS NULL;
    END IF;
END $$;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_public_read ON public.categories;
CREATE POLICY categories_public_read
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS categories_authenticated_write ON public.categories;
CREATE POLICY categories_authenticated_write
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS categories_authenticated_update ON public.categories;
CREATE POLICY categories_authenticated_update
ON public.categories
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ---------------------------
-- 2b) CATEGORIES SEED
-- ---------------------------
INSERT INTO public.categories (name, slug, description, image, sort_order, is_active)
SELECT v.name, v.slug, v.description, v.image, v.sort_order, true
FROM (
    VALUES
        ('Cotton', 'cotton', 'Breathable & comfortable everyday fabrics', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80', 0),
        ('Silk', 'silk', 'Luxurious fabrics for special occasions', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80', 1),
        ('Georgette', 'georgette', 'Elegant drape for graceful outfits', 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80', 2),
        ('Rayon', 'rayon', 'Soft & flowy for daily comfort', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80', 3),
        ('Chiffon', 'chiffon', 'Sheer elegance for festive wear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80', 4),
        ('Crepe', 'crepe', 'Textured beauty for modern styles', 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80', 5)
) AS v(name, slug, description, image, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.categories c
    WHERE c.slug = v.slug
      AND c.deleted_at IS NULL
);

-- ---------------------------
-- 3) BANNERS SETUP
-- ---------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content_text text,
    image_url text,
    link_url text,
    placement text NOT NULL CHECK (placement IN ('announcement_bar', 'homepage_hero', 'shop_top', 'popup')),
    bg_color text NOT NULL DEFAULT '#000000',
    text_color text NOT NULL DEFAULT '#FFFFFF',
    is_active boolean NOT NULL DEFAULT true,
    start_date date,
    end_date date,
    priority integer NOT NULL DEFAULT 0,
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS content_text text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS link_url text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS placement text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS bg_color text NOT NULL DEFAULT '#000000';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS text_color text NOT NULL DEFAULT '#FFFFFF';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.banners
    DROP CONSTRAINT IF EXISTS banners_placement_check;

ALTER TABLE public.banners
    ADD CONSTRAINT banners_placement_check
    CHECK (placement IN ('announcement_bar', 'homepage_hero', 'shop_top', 'popup'));

CREATE OR REPLACE FUNCTION public.set_banners_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_banners_updated_at ON public.banners;
CREATE TRIGGER trg_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.set_banners_updated_at();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_banners_active'
    ) THEN
        CREATE INDEX idx_banners_active
            ON public.banners(placement, is_active, start_date, end_date, priority DESC)
            WHERE deleted_at IS NULL;
    END IF;
END $$;

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS banners_public_read ON public.banners;
CREATE POLICY banners_public_read
ON public.banners
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS banners_authenticated_write ON public.banners;
CREATE POLICY banners_authenticated_write
ON public.banners
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS banners_authenticated_update ON public.banners;
CREATE POLICY banners_authenticated_update
ON public.banners
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ---------------------------
-- 3b) BANNERS SEED
-- ---------------------------
INSERT INTO public.banners (
    title,
    content_text,
    image_url,
    link_url,
    placement,
    bg_color,
    text_color,
    is_active,
    start_date,
    end_date,
    priority
)
SELECT
    v.title,
    v.content_text,
    v.image_url,
    v.link_url,
    v.placement,
    v.bg_color,
    v.text_color,
    true,
    v.start_date,
    v.end_date,
    v.priority
FROM (
    VALUES
        (
            'Grand Opening Offer',
            'Flat 10% OFF on selected fabrics - Limited period offer.',
            NULL,
            '/shop',
            'announcement_bar',
            '#111827',
            '#F9FAFB',
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '30 day')::date,
            100
        ),
        (
            'Festive Popup',
            'Celebrate the season with premium collections and curated offers.',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80',
            '/shop',
            'popup',
            '#7C2D12',
            '#FEF3C7',
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '45 day')::date,
            90
        ),
        (
            'Shop Top Promo',
            'New arrivals now live. Explore latest silk and cotton blends.',
            NULL,
            '/shop',
            'shop_top',
            '#0F766E',
            '#ECFEFF',
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '60 day')::date,
            80
        )
) AS v(
    title,
    content_text,
    image_url,
    link_url,
    placement,
    bg_color,
    text_color,
    start_date,
    end_date,
    priority
)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.banners b
    WHERE b.title = v.title
      AND b.placement = v.placement
      AND b.deleted_at IS NULL
);
