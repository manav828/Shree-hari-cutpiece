# Blog Builder DB Schema (V2)

Last updated: 2026-03-28
Source migration: db/migrations/supabase_blog_builder_v2_migration.sql

## Goals
- Support blog authoring, scheduling, SEO, and analytics.
- Keep data model theme-agnostic so any storefront theme can render the same content.

## Core Tables

### blog_posts
- Core post record with status, language, scheduling, SEO, and editor payload.
- Key fields:
  - status: draft | scheduled | published | unpublished
  - language: en | hi | other
  - variant_group_id: links language variants
  - editor_mode: visual | full_code
  - builder_layout, full_page_html/css/js
  - seo_* fields
  - show_header, show_cover, show_share_buttons
  - show_related_products, related_products_title

### blog_categories
- Admin-managed category list.
- Fields: name, slug, description, is_active, sort_order.

### blog_tags
- Tag registry used by blog_post_tags.
- Fields: name, slug.

### blog_media_library
- Asset registry for cover images and inline blocks.
- Fields: bucket_path, public_url, alt_text, variants JSON, file metadata.

### blog_post_tags
- Join table for many-to-many post tags.

### blog_post_related_posts
- Manual related post links (max 5 enforced in API).

### blog_post_related_products
- Manual related products links with sort_order (max 10 enforced in API).

### blog_post_revisions
- Snapshot history with save_type (auto/manual/publish/restore).

### blog_slug_redirects
- Stores old_slug -> new_slug redirects for published posts.

### blog_preview_tokens
- Time-limited preview tokens (default 48 hours in API).

### blog_publish_notifications
- Stores scheduler outcomes for published and failed scheduled posts.

### blog_analytics_events
- Event log for page views and conversion clicks.

## View

### blog_admin_summary
- Summary stats for admin list cards (published/scheduled/draft counts).

## RLS Notes
- Service role: full access on all blog tables.
- Public read: only published posts and active categories/tags.
- Media is publicly readable; admin workflows still use service role for write.

## Index Coverage
- Status, language, variant_group_id, scheduled_for, published_at.
- Revisions and redirects keyed by post_id.
- Analytics events indexed by post_id + type + time.

## Theme-Agnostic Guardrails
- No theme identifiers stored in blog_posts.
- Builder layout should only use neutral section types and style tokens.
