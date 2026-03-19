-- ============================================================
-- CMS PHASE 3 - BANNERS SETUP
-- ============================================================

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
