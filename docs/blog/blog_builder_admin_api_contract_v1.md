# Blog Builder Admin API Contract (Theme-Agnostic)

Last updated: 2026-03-28
Applies to universal admin panel integration across any storefront theme.

## Theme-Agnostic Principles
- Admin APIs return canonical content and metadata only.
- API payloads do not depend on frontend theme names, theme IDs, or CSS implementation details.
- Builder layout supports neutral section blocks and style tokens only.
- Theme renderers must map canonical section data to their own components.

## Endpoints
- GET /api/admin/blogs
- POST /api/admin/blogs
- PATCH /api/admin/blogs
- GET /api/admin/blogs/[id]
- PATCH /api/admin/blogs/[id]
- DELETE /api/admin/blogs/[id]
- POST /api/admin/blogs/[id]/preview
- GET /api/admin/blogs/[id]/preview?token=...
- GET /api/admin/blogs/[id]/validate
- POST /api/admin/blogs/scheduler
- GET /api/admin/blogs/notifications
- GET /api/admin/blogs/analytics
- GET /api/admin/blogs/media
- POST /api/admin/blogs/media
- DELETE /api/admin/blogs/media
- PATCH /api/admin/blogs/media
- GET /api/admin/blogs/categories
- POST /api/admin/blogs/categories
- GET /api/admin/blogs/tags
- POST /api/admin/blogs/tags
- GET /api/admin/products/search

## GET /api/admin/blogs
Query params:
- page, limit
- status (draft|scheduled|published|unpublished|all)
- language (en|hi|other|all)
- categoryId, tagId
- search
- dateFrom, dateTo
- sortBy (created_at|updated_at|published_at|scheduled_for|title|status|language)
- sortOrder (asc|desc)

Returns:
- posts[] with category and tags
- pagination metadata

## POST /api/admin/blogs
Creates a blog post.
Required:
- title
- slug (auto-generated from title when omitted)

Optional:
- editor mode data
- SEO fields
- display options: show_header, show_cover, show_share_buttons, show_related_products, related_products_title
- tag_ids[]
- variant_group_id (to link multilingual variants)

Validation:
- builder_layout must be theme-agnostic (no direct themeId coupling)
- Custom JS requires explicit acknowledgment before save

## PATCH /api/admin/blogs
Actions:
- quick-edit: inline status/date updates for list page
- bulk-status: bulk status update
- bulk-delete: bulk delete

## GET /api/admin/blogs/[id]
Returns:
- post
- tag_ids and tags
- related_post_ids
- related_products
- redirects
- revision_history (latest sample set)
Note: post payload includes display options and related_products_title.

## PATCH /api/admin/blogs/[id]
Updates post and optional relations:
- tag_ids[]
- related_post_ids[] (max 5)
- related_product_ids[] (max 10)
- variant_group_id (to link multilingual variants)
- display options: show_header, show_cover, show_share_buttons, show_related_products, related_products_title

Behavior:
- If slug changes on a published post, redirect record is upserted.
- Custom JS requires explicit acknowledgment before save.

## Preview Token API
- POST /api/admin/blogs/[id]/preview creates a time-limited preview token.
- Default expiry is 48 hours and can be overridden within server limits.
- GET /api/admin/blogs/[id]/preview?token=... validates token and returns preview payload.
- Preview API remains theme-agnostic; storefront theme controls rendering only.

## Validation API
- GET /api/admin/blogs/[id]/validate returns publish readiness.
- Uses canonical validation rules (title, slug, cover image, SEO fields, custom JS acknowledgement).
- Syntax validation flags unbalanced HTML tags and JS/CSS delimiters.
- Warnings are non-blocking; errors block scheduled publish.

## Scheduler API
- POST /api/admin/blogs/scheduler publishes due scheduled posts.
- If BLOG_SCHEDULER_SECRET is set, include header x-blog-scheduler-secret.
- Invalid posts fall back to Draft with error list in response.

## Notifications API
- GET /api/admin/blogs/notifications returns recent scheduler outcomes.
- Used by admin list to surface publish success and validation failures.

## Analytics API
- GET /api/admin/blogs/analytics returns summary cards and chart series.
- Query params: days (default 30), postId (optional).
- Returns: summary counts, time series of views and clicks, referrer and device breakdown, top posts by CTR, content-health flags.
- post_metrics provides per-post views and click totals for list tables.
- Metrics that require session-level tracking are returned in unavailable_metrics.

## Media API
- GET /api/admin/blogs/media provides paginated media library items.
- Supports search, dateFrom/dateTo filters, and id lookup.
- POST /api/admin/blogs/media uploads to the blog-media bucket and records metadata.
- Uploads generate thumbnail, medium, and large variants.
- PATCH /api/admin/blogs/media updates alt text.
- DELETE /api/admin/blogs/media removes media if not used by published posts.

## Categories and Tags
- Categories endpoint supports create and update actions.
- Tags endpoint supports create and update actions.
- Slug helpers keep taxonomy portable across themes.

## Product Search (for Recommended Products)
- GET /api/admin/products/search
Query params:
	- query (min 2 chars, searches name and slug)
	- limit (1-30, default 12)
	- ids (comma-separated list for resolving selected items)
Returns:
	- products[]: id, name, slug

## Integration Notes for New Themes
- New theme should only build render adapters for canonical block types.
- Admin payload and route contracts remain unchanged.
- Theme-specific presentation logic must stay outside admin API layer.
