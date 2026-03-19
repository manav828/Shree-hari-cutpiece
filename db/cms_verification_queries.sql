-- ============================================================
-- SHREE HARI CMS - QUICK VERIFICATION QUERIES
-- ============================================================

-- 1) Tables exist and row counts
SELECT 'site_config' AS table_name, COUNT(*) AS row_count FROM public.site_config
UNION ALL
SELECT 'categories' AS table_name, COUNT(*) AS row_count FROM public.categories WHERE deleted_at IS NULL
UNION ALL
SELECT 'banners' AS table_name, COUNT(*) AS row_count FROM public.banners WHERE deleted_at IS NULL;

-- 2) Key site config samples
SELECT key, value
FROM public.site_config
WHERE key IN (
  'hero_headline',
  'hero_description',
  'desc_headline',
  'store_address',
  'store_maps_url'
)
ORDER BY key;

-- 3) Categories active order
SELECT id, name, slug, sort_order, is_active, deleted_at
FROM public.categories
WHERE deleted_at IS NULL
ORDER BY sort_order ASC;

-- 4) Banners with computed status (IST)
SELECT
    id,
    title,
    placement,
    is_active,
    start_date,
    end_date,
    priority,
    CASE
        WHEN is_active = false THEN 'Inactive'
        WHEN start_date IS NOT NULL AND start_date > (NOW() AT TIME ZONE 'Asia/Kolkata')::date THEN 'Scheduled'
        WHEN end_date IS NOT NULL AND end_date < (NOW() AT TIME ZONE 'Asia/Kolkata')::date THEN 'Expired'
        ELSE 'Active'
    END AS status_ist
FROM public.banners
WHERE deleted_at IS NULL
ORDER BY priority DESC;

-- 5) Active banners per placement today (IST)
SELECT id, title, placement, priority
FROM public.banners
WHERE deleted_at IS NULL
  AND is_active = true
  AND (start_date IS NULL OR start_date <= (NOW() AT TIME ZONE 'Asia/Kolkata')::date)
  AND (end_date IS NULL OR end_date >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date)
ORDER BY placement, priority DESC;

-- 6) Expected active placements (seed sanity)
-- Expect 3 rows with placements: announcement_bar, popup, shop_top
SELECT placement, COUNT(*) AS active_rows
FROM public.banners
WHERE deleted_at IS NULL
  AND is_active = true
  AND (start_date IS NULL OR start_date <= (NOW() AT TIME ZONE 'Asia/Kolkata')::date)
  AND (end_date IS NULL OR end_date >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date)
GROUP BY placement
ORDER BY placement;

-- 7) Storage bucket check
SELECT id, name, public
FROM storage.buckets
WHERE id = 'cms-assets';

-- 8) Storage folder usage snapshot
-- This always returns hero/description/categories/banners, even if file_count is 0.
WITH expected_folders AS (
  SELECT folder_name
  FROM (
    VALUES
      ('hero'),
      ('description'),
      ('categories'),
      ('banners')
  ) AS t(folder_name)
),
actual_counts AS (
  SELECT
    split_part(name, '/', 1) AS folder_name,
    COUNT(*) AS file_count
  FROM storage.objects
  WHERE bucket_id = 'cms-assets'
  GROUP BY split_part(name, '/', 1)
)
SELECT
  e.folder_name AS folder,
  COALESCE(a.file_count, 0) AS file_count,
  CASE
    WHEN COALESCE(a.file_count, 0) > 0 THEN 'present'
    ELSE 'empty_or_not_used_yet'
  END AS status
FROM expected_folders e
LEFT JOIN actual_counts a ON a.folder_name = e.folder_name
ORDER BY e.folder_name;
