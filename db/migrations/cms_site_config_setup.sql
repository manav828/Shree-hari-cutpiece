-- ============================================================
-- CMS PHASE 1 - SITE CONFIG SETUP
-- ============================================================

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
