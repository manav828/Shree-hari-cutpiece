# Blog Builder Admin List UX

Last updated: 2026-03-29
Route: /admin/blog

## Purpose
Provides the operational list screen for blog posts, with filters, quick edits, and health indicators. Designed to be theme-agnostic and portable across storefront themes.

## Summary Cards
- Published Posts
- Views (last 30 days)
- Product Clicks (last 30 days)
- Top Post by views

## Filters
- Search by title or slug
- Status (draft/scheduled/published/unpublished)
- Language (en/hi/other)
- Category and tag selectors
- Date range (created_at)
- Rows per page

## Bulk Actions
- Publish
- Unpublish
- Delete (confirmation required)

## Row Actions
- Edit post
- View Live (published only)

## Quick Edit
- Inline status selector
- Scheduled publish datetime input (IST)
- Save Schedule applies scheduled status

## Scheduler Updates
- Scheduler result feed shows recent scheduled publish outcomes.
- Failed schedules list validation errors when reverted to draft.

## Health Badges
- Low Traffic (no views in last 30 days)
- SEO Incomplete (missing SEO fields/cover alt)
- Related Products Missing (section enabled but no items)
- Healthy (none of the above)

## Troubleshooting
- If views show 0 for all posts, ensure analytics events are being recorded.
- If health badges are missing, confirm /api/admin/blogs/analytics returns content_health arrays.
- If schedule saves fail, verify scheduled_for is valid and the post passes validation checks.
