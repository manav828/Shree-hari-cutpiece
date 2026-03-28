# Blog Builder Admin Editor UX

Last updated: 2026-03-29
Routes: /admin/blog/new, /admin/blog/[id]

## Purpose
Provides the core editor shell for creating and editing blog posts with a theme-agnostic content model.

## Layout
- Top bar: back to list, save draft, preview, publish/schedule, revisions, view live (published only).
- Metadata card: two-column grid of title, slug, summary, cover image, display options, category, tags, language, author, status, schedule.
- Main body: two-column layout:
	- Left: HTML/CSS/JS code editor with syntax highlighting and render preview.
	- Right: SEO & Relations panel, Recommended Products section, product selector.

## Editor Mode
- Full code editor is the default for new posts.
- Legacy visual builder renders only when an existing post has `editor_mode=visual`.

## SEO & Relations
- SEO fields with helper text and counters (meta, canonical, OG, Twitter, robots).
- Schema markup toggle and OG image selector with media library preview.
- Language variants linking via variant group ID; linked variant list appears.
- Related posts selector (max 5).
- Redirect history displayed for slug changes on published posts.

## Recommended Products
- Toggle to show/hide the recommended products section on the blog page.
- Section title input (default "Shop This Story").
- Searchable product picker (min 2 characters), max 10 items.
- Selected product list with remove actions.

## Workflow Controls
- Save Draft (manual) and auto-save every 60 seconds when title is present.
- Preview opens a live HTML/CSS/JS render; Render Preview shows inline preview.
- Publish/Schedule runs validation before status change.
- Revision history restores prior snapshots.

## Code Safety Notes
- Custom JS requires explicit acknowledgment before save/publish.
- Code mode lock prevents switching back to visual mode.
- HTML/CSS/JS syntax warnings appear for unbalanced tags or delimiters.

## Troubleshooting
- If publish fails, open validation results and fix blocking errors.
- If schedule time is missing, status must remain Draft.
- If save is blocked for custom JS, enable the acknowledgment toggle and retry.
