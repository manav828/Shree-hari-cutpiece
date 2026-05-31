-- ============================================================
-- BLOG SEO KEYWORDS MIGRATION
-- Adds seo_keywords column to blog_posts for per-post SEO tags
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_keywords text;

COMMENT ON COLUMN public.blog_posts.seo_keywords IS 'Comma-separated SEO keywords rendered in <meta name="keywords"> tag';
