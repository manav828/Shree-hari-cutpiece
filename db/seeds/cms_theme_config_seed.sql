-- ============================================================
-- Seed: Per-Theme Landing Page Config Entries
-- ============================================================
-- Classic theme uses unprefixed keys (from original seed data).
-- Bohemian uses "bohemian_*" prefixed keys.
-- Luxury uses "luxury_*" prefixed keys.
-- 
-- Run this AFTER the main cms_site_config.sql seed.
-- ============================================================

-- Helper: insert only if the key doesn't already exist
-- (so it won't overwrite values already set via the admin panel)

------------------------------------------------------------
-- 1. CLASSIC THEME (unprefixed keys)
--    These section keys are NOT in the original seed but
--    are needed for the CMS section editors.
------------------------------------------------------------
INSERT INTO public.site_config (key, value, label, "group", type) VALUES
  -- Hero section (cta2, stats already in seed, skip)
  -- Archive section
  ('archive_title',         'The Curated Archive',           'Archive Section Title',              'description', 'text'),
  ('archive_subtitle',      'Discovery of ancient techniques in modern forms.', 'Archive Section Subtitle', 'description', 'text'),
  ('archive_pos1_slug',     '',                               'Archive Position 1 Category Slug',  'description', 'text'),
  ('archive_pos2_slug',     '',                               'Archive Position 2 Category Slug',  'description', 'text'),
  ('archive_pos3_slug',     '',                               'Archive Position 3 Category Slug',  'description', 'text'),
  -- Spaces section
  ('spaces_title',          'Spaces to Inhabit',              'Spaces Section Title',              'description', 'text'),
  ('spaces_description',    'Find harmony in every corner of your sanctuary.', 'Spaces Section Description', 'description', 'textarea'),
  ('spaces_items',          '[]',                              'Spaces Items List (JSON)',          'description', 'textarea'),
  -- Journal section
  ('journal_title',         'Journal Highlights',             'Journal Section Title',             'description', 'text'),
  ('journal_limit',         '3',                               'Journal Max Display Limit',         'description', 'number'),
  ('journal_mode',          'recent',                          'Journal Selection Mode',            'description', 'text'),
  ('journal_selected',      '[]',                              'Journal Selected Posts (JSON)',     'description', 'textarea'),
  -- Freshly Harvested section
  ('freshly_harvested_title',   'Freshly Harvested',           'Freshly Harvested Title',           'description', 'text'),
  ('freshly_harvested_mode',    'recent',                      'Freshly Harvested Mode',            'description', 'text'),
  ('freshly_harvested_products','[]',                          'Freshly Harvested Products (JSON)', 'description', 'textarea'),
  -- Classic: Shop by Category
  ('shop_cat_pos1_slug',    '',                                'Shop Bento Slot 1 Category Slug',   'description', 'text'),
  ('shop_cat_pos2_slug',    '',                                'Shop Bento Slot 2 Category Slug',   'description', 'text'),
  ('shop_cat_pos3_slug',    '',                                'Shop Bento Slot 3 Category Slug',   'description', 'text'),
  -- Classic: Premium Collection
  ('premium_collection_mode','auto',                           'Premium Collection Mode',           'description', 'text'),
  ('premium_collection_products','[]',                         'Premium Collection Products (JSON)','description', 'textarea'),
  -- Classic: Best Sellers
  ('best_sellers_mode',     'auto',                            'Best Sellers Mode',                 'description', 'text'),
  ('best_sellers_products', '[]',                              'Best Sellers Products (JSON)',      'description', 'textarea'),
  -- Classic: Fabric Guides
  ('fabric_guides_mode',    'auto',                            'Fabric Guides Mode',                'description', 'text'),
  ('fabric_guides_selected','[]',                              'Fabric Guides Selected Posts (JSON)','description', 'textarea'),
  -- Classic: Instagram Reels
  ('instagram_reels_data',  '[]',                              'Instagram Reels Data (JSON)',       'description', 'textarea')
ON CONFLICT (key) DO NOTHING;

------------------------------------------------------------
-- 2. BOHEMIAN THEME (bohemian_* prefixed keys)
--    These are needed if not already created via the admin panel.
------------------------------------------------------------
INSERT INTO public.site_config (key, value, label, "group", type) VALUES
  -- Hero section
  ('bohemian_hero_badge',      'TERRA & LOOM PRESENTS',        'Hero Badge Text',                   'hero',        'text'),
  ('bohemian_hero_headline',   'Embrace the Warmth.',          'Hero Headline',                     'hero',        'text'),
  ('bohemian_hero_description','Curating the finest bohemian treasures for your sacred space.', 'Hero Description', 'hero', 'textarea'),
  ('bohemian_hero_cta1_label', 'Explore Collection',           'Hero CTA Button Label',             'hero',        'text'),
  ('bohemian_hero_cta1_url',   '/shop',                        'Hero CTA Button URL',               'hero',        'url'),
  -- Archive section
  ('bohemian_archive_title',         'The Curated Archive',     'Archive Section Title',             'description', 'text'),
  ('bohemian_archive_subtitle',      'Discovery of ancient techniques in modern forms.', 'Archive Section Subtitle', 'description', 'text'),
  ('bohemian_archive_pos1_slug',     '',                        'Archive Position 1 Category Slug',  'description', 'text'),
  ('bohemian_archive_pos2_slug',     '',                        'Archive Position 2 Category Slug',  'description', 'text'),
  ('bohemian_archive_pos3_slug',     '',                        'Archive Position 3 Category Slug',  'description', 'text'),
  -- Spaces section
  ('bohemian_spaces_title',          'Spaces to Inhabit',       'Spaces Section Title',              'description', 'text'),
  ('bohemian_spaces_description',    'Find harmony in every corner of your sanctuary.', 'Spaces Section Description', 'description', 'textarea'),
  ('bohemian_spaces_items',          '[]',                      'Spaces Items List (JSON)',          'description', 'textarea'),
  -- Journal section
  ('bohemian_journal_title',         'Journal Highlights',      'Journal Section Title',             'description', 'text'),
  ('bohemian_journal_limit',         '3',                       'Journal Max Display Limit',         'description', 'number'),
  ('bohemian_journal_mode',          'recent',                  'Journal Selection Mode',            'description', 'text'),
  ('bohemian_journal_selected',      '[]',                      'Journal Selected Posts (JSON)',     'description', 'textarea'),
  -- Freshly Harvested section
  ('bohemian_freshly_harvested_title',   'Freshly Harvested',   'Freshly Harvested Title',           'description', 'text'),
  ('bohemian_freshly_harvested_mode',    'recent',              'Freshly Harvested Mode',            'description', 'text'),
  ('bohemian_freshly_harvested_products','[]',                  'Freshly Harvested Products (JSON)', 'description', 'textarea')
ON CONFLICT (key) DO NOTHING;

------------------------------------------------------------
-- 3. LUXURY THEME (luxury_* prefixed keys)
------------------------------------------------------------
INSERT INTO public.site_config (key, value, label, "group", type) VALUES
  -- Hero section
  ('luxury_hero_badge',      'LUXURY COLLECTION',              'Hero Badge Text',                   'hero',        'text'),
  ('luxury_hero_headline',   'Redefining Elegance.',            'Hero Headline',                     'hero',        'text'),
  ('luxury_hero_description','Handpicked premium fabrics for the discerning creator.', 'Hero Description', 'hero', 'textarea'),
  ('luxury_hero_cta1_label', 'Explore Collection',              'Hero CTA Button Label',             'hero',        'text'),
  ('luxury_hero_cta1_url',   '/shop',                           'Hero CTA Button URL',               'hero',        'url'),
  -- Archive section
  ('luxury_archive_title',         'The Curated Archive',       'Archive Section Title',             'description', 'text'),
  ('luxury_archive_subtitle',      'Discovery of ancient techniques in modern forms.', 'Archive Section Subtitle', 'description', 'text'),
  ('luxury_archive_pos1_slug',     '',                          'Archive Position 1 Category Slug',  'description', 'text'),
  ('luxury_archive_pos2_slug',     '',                          'Archive Position 2 Category Slug',  'description', 'text'),
  ('luxury_archive_pos3_slug',     '',                          'Archive Position 3 Category Slug',  'description', 'text'),
  -- Spaces section
  ('luxury_spaces_title',          'Spaces to Inhabit',         'Spaces Section Title',              'description', 'text'),
  ('luxury_spaces_description',    'Find harmony in every corner of your sanctuary.', 'Spaces Section Description', 'description', 'textarea'),
  ('luxury_spaces_items',          '[]',                        'Spaces Items List (JSON)',          'description', 'textarea'),
  -- Journal section
  ('luxury_journal_title',         'Journal Highlights',        'Journal Section Title',             'description', 'text'),
  ('luxury_journal_limit',         '3',                         'Journal Max Display Limit',         'description', 'number'),
  ('luxury_journal_mode',          'recent',                    'Journal Selection Mode',            'description', 'text'),
  ('luxury_journal_selected',      '[]',                        'Journal Selected Posts (JSON)',     'description', 'textarea'),
  -- Freshly Harvested section
  ('luxury_freshly_harvested_title',   'Freshly Harvested',     'Freshly Harvested Title',           'description', 'text'),
  ('luxury_freshly_harvested_mode',    'recent',                'Freshly Harvested Mode',            'description', 'text'),
  ('luxury_freshly_harvested_products','[]',                    'Freshly Harvested Products (JSON)', 'description', 'textarea')
ON CONFLICT (key) DO NOTHING;
