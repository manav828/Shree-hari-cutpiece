# Blog Builder Media Library

Last updated: 2026-03-28
Routes: /admin/blog (media picker), /api/admin/blogs/media

## Purpose
Centralizes reusable blog images and enforces alt text governance for publish safety.

## Upload Rules
- Allowed types: JPG, PNG, WebP.
- Default size limit: 10 MB (configurable via BLOG_MEDIA_MAX_MB).
- Upload creates variants: thumbnail (200px), medium (800px), large (1600px).

## Using Media in Posts
- Use the media picker to select cover and OG images.
- Alt text should be filled during upload or updated before publish.
- Media used by published posts cannot be deleted.

## Search and Filters
- Search by filename or alt text.
- Filter by upload date range.

## Operations
- Upload new image with optional alt text.
- Edit alt text in the media grid.
- Delete unused media assets.

## Troubleshooting
- If upload fails, confirm file type and size limits.
- If delete fails, the asset is referenced by a published post.
