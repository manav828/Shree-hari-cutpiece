-- =============================================================================
-- SHREEHARI ECOMMERCE - MASTER DATABASE SETUP SCRIPT
-- =============================================================================
-- Run this ONCE on any new Supabase project to set up the full database.
-- Steps:
--   1. Go to your new Supabase project → SQL Editor
--   2. Copy-paste this entire file and click "Run"
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- 1. CATEGORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  image       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories"  ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Admin insert categories" ON public.categories FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin update categories" ON public.categories FOR UPDATE USING (TRUE);
CREATE POLICY "Admin delete categories" ON public.categories FOR DELETE USING (TRUE);


-- =============================================================================
-- 2. PRODUCTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id               UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  category_id      UUID REFERENCES public.categories(id),
  description      TEXT,
  fabric           TEXT,
  width            TEXT,
  care_instructions TEXT,
  sell_mode        TEXT NOT NULL DEFAULT 'meter' CHECK (sell_mode = ANY (ARRAY['meter','quantity'])),
  is_featured      BOOLEAN DEFAULT FALSE,
  is_new_arrival   BOOLEAN DEFAULT FALSE,
  is_active        BOOLEAN DEFAULT TRUE,
  sort_order       INTEGER DEFAULT 0,
  discount_type    TEXT DEFAULT 'percent' CHECK (discount_type = ANY (ARRAY['percent','flat'])),
  discount_label   TEXT DEFAULT '',
  fabric_details   JSONB DEFAULT '[]',
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products"  ON public.products FOR SELECT USING (TRUE);
CREATE POLICY "Admin insert products" ON public.products FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin update products" ON public.products FOR UPDATE USING (TRUE);
CREATE POLICY "Admin delete products" ON public.products FOR DELETE USING (TRUE);


-- =============================================================================
-- 3. PRODUCT VARIANTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id             UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name     TEXT NOT NULL,
  color_hex      TEXT DEFAULT '#000000',
  material_label TEXT,
  price          NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC CHECK (original_price IS NULL OR original_price >= 0),
  stock          INTEGER NOT NULL DEFAULT 0,
  sku            TEXT UNIQUE,
  is_default     BOOLEAN DEFAULT FALSE,
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read variants"  ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Admin insert variants" ON public.product_variants FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin update variants" ON public.product_variants FOR UPDATE USING (TRUE);
CREATE POLICY "Admin delete variants" ON public.product_variants FOR DELETE USING (TRUE);


-- =============================================================================
-- 4. VARIANT IMAGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.variant_images (
  id         UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type = ANY (ARRAY['image','video'])),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.variant_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read variant_images"  ON public.variant_images FOR SELECT USING (TRUE);
CREATE POLICY "Admin insert variant_images" ON public.variant_images FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin update variant_images" ON public.variant_images FOR UPDATE USING (TRUE);
CREATE POLICY "Admin delete variant_images" ON public.variant_images FOR DELETE USING (TRUE);


-- =============================================================================
-- 4A. PRODUCT OPTIONS
-- =============================================================================
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


-- =============================================================================
-- 4C. PRODUCT SEO AND CONTENT FIELDS
-- =============================================================================
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


-- =============================================================================
-- 5. PROFILES  (linked to auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"   ON public.profiles FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE  USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT  WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin read all profiles"  ON public.profiles FOR SELECT  USING (TRUE);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- 6. USER PROFILES (extended)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            TEXT,
  phone                TEXT,
  avatar_url           TEXT,
  newsletter_opt_in    BOOLEAN NOT NULL DEFAULT TRUE,
  sms_opt_in           BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_opt_in     BOOLEAN NOT NULL DEFAULT TRUE,
  account_status       TEXT NOT NULL DEFAULT 'active' CHECK (account_status = ANY (ARRAY['active','suspended','blocked'])),
  preferred_language   TEXT NOT NULL DEFAULT 'en',
  internal_notes       TEXT,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own user_profile"   ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own user_profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own user_profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin read all user_profiles"  ON public.user_profiles FOR SELECT USING (TRUE);


-- =============================================================================
-- 7. USER ADDRESSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  phone               TEXT NOT NULL,
  address_line1       TEXT NOT NULL,
  address_line2       TEXT,
  city                TEXT NOT NULL,
  state               TEXT NOT NULL,
  pincode             TEXT NOT NULL,
  country             TEXT NOT NULL DEFAULT 'India',
  is_default_shipping BOOLEAN NOT NULL DEFAULT FALSE,
  is_default_billing  BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses" ON public.user_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin read all addresses"   ON public.user_addresses FOR SELECT USING (TRUE);


-- =============================================================================
-- 8. ORDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_number        TEXT NOT NULL UNIQUE,
  user_id             UUID REFERENCES public.profiles(id),
  status              TEXT NOT NULL DEFAULT 'pending',
  payment_status      TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status = ANY (ARRAY['pending','paid','failed','refunded','partially_refunded'])),
  payment_method      TEXT,
  tracking_url        TEXT,
  shipping_cost       NUMERIC NOT NULL DEFAULT 0,
  total_amount        NUMERIC NOT NULL,
  subtotal            NUMERIC NOT NULL DEFAULT 0,
  discount_amount     NUMERIC NOT NULL DEFAULT 0,
  shipping_amount     NUMERIC NOT NULL DEFAULT 50.00,
  coupon_id           UUID,
  coupon_code         TEXT,
  delivery_address    TEXT NOT NULL,
  contact_phone       TEXT NOT NULL,
  label_printed       BOOLEAN NOT NULL DEFAULT FALSE,
  notes               TEXT,
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own orders"   ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert orders"     ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin read all orders"   ON public.orders FOR SELECT USING (TRUE);
CREATE POLICY "Admin update orders"     ON public.orders FOR UPDATE USING (TRUE);


-- =============================================================================
-- 9. ORDER ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id                 UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_id           UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id         UUID REFERENCES public.product_variants(id),
  product_id         UUID,
  product_name       TEXT NOT NULL,
  color_name         TEXT,
  image_url          TEXT,
  quantity_or_meters NUMERIC NOT NULL,
  price_per_unit     NUMERIC NOT NULL,
  total_price        NUMERIC NOT NULL DEFAULT 0,
  selling_mode       TEXT NOT NULL DEFAULT 'meter' CHECK (selling_mode = ANY (ARRAY['meter','piece'])),
  created_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_options_json JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own order_items"   ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL))
);
CREATE POLICY "Insert order_items"         ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin read all order_items" ON public.order_items FOR SELECT USING (TRUE);


-- =============================================================================
-- 10. ORDER ADDRESSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'shipping' CHECK (type = ANY (ARRAY['shipping','billing'])),
  full_name     TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT,
  city          TEXT NOT NULL DEFAULT '',
  state         TEXT NOT NULL DEFAULT '',
  pincode       TEXT NOT NULL DEFAULT '',
  country       TEXT NOT NULL DEFAULT 'India'
);

ALTER TABLE public.order_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert order_addresses"         ON public.order_addresses FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users read own order_addresses" ON public.order_addresses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL))
);
CREATE POLICY "Admin manage order_addresses" ON public.order_addresses FOR ALL USING (TRUE);


-- =============================================================================
-- 11. ORDER STATUS HISTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  changed_by  UUID REFERENCES auth.users(id),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert status_history"         ON public.order_status_history FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin read all status_history" ON public.order_status_history FOR SELECT USING (TRUE);
CREATE POLICY "Users read own status_history" ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);


-- =============================================================================
-- 12. ORDER CUSTOM STATUSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_custom_statuses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_custom_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read custom_statuses"  ON public.order_custom_statuses FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage custom_statuses" ON public.order_custom_statuses FOR ALL USING (TRUE);

-- Seed default statuses
INSERT INTO public.order_custom_statuses (label, color, sort_order) VALUES
  ('Pending',            '#f59e0b', 0),
  ('Confirmed',          '#3b82f6', 1),
  ('Processing',         '#8b5cf6', 2),
  ('Ready to Ship',      '#06b6d4', 3),
  ('Shipped',            '#10b981', 4),
  ('Out for Delivery',   '#84cc16', 5),
  ('Delivered',          '#22c55e', 6),
  ('Cancelled',          '#ef4444', 7),
  ('Return Requested',   '#f97316', 8),
  ('Return Approved',    '#a855f7', 9),
  ('Refunded',           '#6366f1', 10),
  ('On Hold',            '#64748b', 11),
  ('Failed',             '#dc2626', 12)
ON CONFLICT (label) DO NOTHING;


-- =============================================================================
-- 13. COUPONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id                                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                              TEXT NOT NULL UNIQUE,
  name                              TEXT NOT NULL,
  description                       TEXT,
  discount_type                     TEXT NOT NULL CHECK (discount_type = ANY (ARRAY['percentage','fixed'])),
  discount_value                    NUMERIC NOT NULL CHECK (discount_value > 0),
  max_discount_cap                  NUMERIC,
  min_cart_subtotal                 NUMERIC,
  max_completed_orders_for_eligibility INTEGER,
  global_usage_limit                INTEGER,
  per_user_usage_limit              INTEGER,
  status                            TEXT NOT NULL DEFAULT 'active' CHECK (status = ANY (ARRAY['active','inactive','archived'])),
  starts_at                         TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at                           TIMESTAMPTZ,
  show_on_home_banner               BOOLEAN NOT NULL DEFAULT FALSE,
  show_on_checkout_modal            BOOLEAN NOT NULL DEFAULT TRUE,
  specific_user_only                BOOLEAN NOT NULL DEFAULT FALSE,
  destination_url                   TEXT,
  created_at                        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                        TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Note: RLS is intentionally disabled on coupons for public visibility

CREATE TABLE IF NOT EXISTS public.coupon_user_assignments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id  UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id       UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id         UUID,
  order_id        UUID,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  redeemed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================================================================
-- 14. SETTINGS (simple key-value)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  label      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"  ON public.settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage settings" ON public.settings FOR ALL USING (TRUE);

INSERT INTO public.settings (key, value, label) VALUES
  ('admin_email', '', 'Admin Email')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- 15. SITE SETTINGS (JSON value)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB NOT NULL DEFAULT '""',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_settings"  ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage site_settings" ON public.site_settings FOR ALL USING (TRUE);


-- =============================================================================
-- 16. SITE CONFIG (grouped config with types)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.site_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  label      TEXT,
  "group"    TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type = ANY (ARRAY['text','textarea','number','url'])),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_config"  ON public.site_config FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage site_config" ON public.site_config FOR ALL USING (TRUE);

-- Seed default site config
INSERT INTO public.site_config (key, value, label, "group", type) VALUES
  ('site_name',           'My Store',          'Site Name',             'branding',  'text'),
  ('site_tagline',        '',                  'Tagline',               'branding',  'text'),
  ('site_logo_url',       '',                  'Logo URL',              'branding',  'url'),
  ('contact_email',       '',                  'Contact Email',         'contact',   'text'),
  ('contact_phone',       '',                  'Contact Phone',         'contact',   'text'),
  ('contact_whatsapp',    '',                  'WhatsApp Number',       'contact',   'text'),
  ('contact_address',     '',                  'Office Address',        'contact',   'textarea'),
  ('social_instagram',    '',                  'Instagram URL',         'social',    'url'),
  ('social_facebook',     '',                  'Facebook URL',          'social',    'url'),
  ('social_twitter',      '',                  'Twitter/X URL',         'social',    'url'),
  ('social_youtube',      '',                  'YouTube URL',           'social',    'url'),
  ('shipping_free_above', '999',               'Free Shipping Above ₹', 'shipping',  'number'),
  ('shipping_flat_fee',   '50',                'Flat Shipping Fee ₹',   'shipping',  'number'),
  ('razorpay_key_id',     '',                  'Razorpay Key ID',       'payment',   'text'),
  ('currency_symbol',     '₹',                 'Currency Symbol',       'payment',   'text')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- 17. BANNERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.banners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  content_text TEXT,
  image_url    TEXT,
  link_url     TEXT,
  placement    TEXT NOT NULL CHECK (placement = ANY (ARRAY['announcement_bar','homepage_hero','shop_top','popup'])),
  bg_color     TEXT NOT NULL DEFAULT '#000000',
  text_color   TEXT NOT NULL DEFAULT '#FFFFFF',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  start_date   DATE,
  end_date     DATE,
  priority     INTEGER NOT NULL DEFAULT 0,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read banners"  ON public.banners FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage banners" ON public.banners FOR ALL USING (TRUE);


-- =============================================================================
-- 18. CUSTOMER INTERACTION LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.customer_interaction_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type = ANY (ARRAY['order_placed','status_changed','note_added','email_sent','support_contact'])),
  event_data JSONB,
  created_by UUID REFERENCES auth.users(id),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_interaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage interaction_logs" ON public.customer_interaction_logs FOR ALL USING (TRUE);


-- =============================================================================
-- 19. BLOG - CATEGORIES, TAGS, MEDIA, POSTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blog_categories"  ON public.blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage blog_categories" ON public.blog_categories FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blog_tags"  ON public.blog_tags FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage blog_tags" ON public.blog_tags FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_media_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name       TEXT NOT NULL,
  bucket_path     TEXT NOT NULL,
  public_url      TEXT NOT NULL,
  mime_type       TEXT,
  file_size_bytes BIGINT,
  width           INTEGER,
  height          INTEGER,
  alt_text        TEXT,
  variants        JSONB NOT NULL DEFAULT '{}',
  uploaded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blog_media_library"  ON public.blog_media_library FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage blog_media_library" ON public.blog_media_library FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_group_id        UUID NOT NULL DEFAULT gen_random_uuid(),
  language                TEXT NOT NULL DEFAULT 'en' CHECK (language = ANY (ARRAY['en','hi','other'])),
  title                   TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  excerpt                 TEXT,
  cover_media_id          UUID REFERENCES public.blog_media_library(id),
  author_name             TEXT,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status = ANY (ARRAY['draft','scheduled','published','unpublished'])),
  scheduled_for           TIMESTAMPTZ,
  published_at            TIMESTAMPTZ,
  editor_mode             TEXT NOT NULL DEFAULT 'visual' CHECK (editor_mode = ANY (ARRAY['visual','full_code'])),
  builder_layout          JSONB,
  full_page_html          TEXT,
  full_page_css           TEXT,
  full_page_js            TEXT,
  code_mode_locked        BOOLEAN NOT NULL DEFAULT FALSE,
  custom_js_acknowledged  BOOLEAN NOT NULL DEFAULT FALSE,
  category_id             UUID REFERENCES public.blog_categories(id),
  schema_markup_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  seo_meta_title          TEXT,
  seo_meta_description    TEXT,
  seo_canonical_url       TEXT,
  seo_og_title            TEXT,
  seo_og_description      TEXT,
  seo_og_image_media_id   UUID REFERENCES public.blog_media_library(id),
  seo_twitter_card_type   TEXT DEFAULT 'summary_large_image' CHECK (seo_twitter_card_type = ANY (ARRAY['summary','summary_large_image'])),
  seo_robots_directive    TEXT DEFAULT 'index,follow' CHECK (seo_robots_directive = ANY (ARRAY['index,follow','noindex,follow','noindex,nofollow'])),
  show_header             BOOLEAN NOT NULL DEFAULT TRUE,
  show_cover              BOOLEAN NOT NULL DEFAULT TRUE,
  show_share_buttons      BOOLEAN NOT NULL DEFAULT TRUE,
  show_related_products   BOOLEAN NOT NULL DEFAULT TRUE,
  related_products_title  TEXT DEFAULT 'Shop This Story',
  created_by              UUID REFERENCES auth.users(id),
  updated_by              UUID REFERENCES auth.users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blog_posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR TRUE);
CREATE POLICY "Admin manage blog_posts"          ON public.blog_posts FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id    UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES public.blog_tags(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blog_post_tags"  ON public.blog_post_tags FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage blog_post_tags" ON public.blog_post_tags FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_post_related_posts (
  post_id         UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  related_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, related_post_id)
);

ALTER TABLE public.blog_post_related_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read related_posts"  ON public.blog_post_related_posts FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage related_posts" ON public.blog_post_related_posts FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_post_related_products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_post_related_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read related_products"  ON public.blog_post_related_products FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage related_products" ON public.blog_post_related_products FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_post_revisions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  save_type  TEXT NOT NULL DEFAULT 'manual' CHECK (save_type = ANY (ARRAY['auto','manual','publish','restore'])),
  snapshot   JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_post_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage blog_post_revisions" ON public.blog_post_revisions FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_slug_redirects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  old_slug   TEXT NOT NULL UNIQUE,
  new_slug   TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_slug_redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read slug_redirects"  ON public.blog_slug_redirects FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage slug_redirects" ON public.blog_slug_redirects FOR ALL USING (TRUE);

-- ----

CREATE SEQUENCE IF NOT EXISTS blog_analytics_events_id_seq;

CREATE TABLE IF NOT EXISTS public.blog_analytics_events (
  id          BIGINT PRIMARY KEY DEFAULT nextval('blog_analytics_events_id_seq'),
  post_id     UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type = ANY (ARRAY['page_view','product_click','collection_click','cta_click','share_click'])),
  referrer    TEXT,
  device_type TEXT CHECK (device_type = ANY (ARRAY['mobile','desktop','tablet','unknown'])),
  target_id   TEXT,
  event_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert analytics_events"       ON public.blog_analytics_events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin read analytics_events"   ON public.blog_analytics_events FOR SELECT USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_preview_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_preview_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read valid preview_tokens"  ON public.blog_preview_tokens FOR SELECT USING (expires_at > now());
CREATE POLICY "Admin manage preview_tokens"       ON public.blog_preview_tokens FOR ALL USING (TRUE);

-- ----

CREATE TABLE IF NOT EXISTS public.blog_publish_notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  status     TEXT NOT NULL CHECK (status = ANY (ARRAY['published','draft','error'])),
  message    TEXT,
  details    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_publish_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage publish_notifications" ON public.blog_publish_notifications FOR ALL USING (TRUE);


-- =============================================================================
-- 20. STORAGE BUCKETS
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', TRUE),
  ('avatars',        'avatars',        TRUE),
  ('blog-media',     'blog-media',     TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Public read product-images"    ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin upload product-images"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Admin update product-images"   ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Admin delete product-images"   ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

CREATE POLICY "Public read avatars"    ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars"    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update avatars"    ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Public read blog-media"   ON storage.objects FOR SELECT USING (bucket_id = 'blog-media');
CREATE POLICY "Admin upload blog-media"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-media');
CREATE POLICY "Admin delete blog-media"  ON storage.objects FOR DELETE USING (bucket_id = 'blog-media');


-- =============================================================================
-- 21. UTILITY FUNCTIONS
-- =============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach trigger to tables that have updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories', 'products', 'orders', 'site_config', 'site_settings',
    'banners', 'user_profiles', 'user_addresses', 'coupons',
    'order_custom_statuses', 'blog_categories', 'blog_tags',
    'blog_media_library', 'blog_posts',
    'product_option_groups', 'product_option_values'
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

-- =============================================================================
-- DONE! Your database is ready.
-- Next steps:
--   1. Update your .env file with the new project's SUPABASE_URL and ANON_KEY
--   2. Set your admin email in the settings table
--   3. Add your Razorpay Key in site_config
-- =============================================================================
