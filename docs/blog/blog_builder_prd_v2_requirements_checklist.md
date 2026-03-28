# Blog Builder PRD v2.0 Requirements Checklist

Last updated: 2026-03-23
Source: docs/shree_hari_blog_prd_v2.docx

## Status Legend
- [x] Done
- [~] In Progress
- [ ] Pending
- [!] Blocked
- [N/A] Out of Scope for v1

## 1) Scope and Goals
- [ ] Super Admin can build rich posts with drag-and-drop sections.
- [ ] Super Admin can insert inline custom HTML/CSS/JS sections.
- [ ] Every published post supports full SEO metadata controls.
- [ ] Workflow supports draft, preview, schedule, publish, unpublish, rollback.
- [ ] Centralized media library supports reuse across posts.
- [ ] Blog embeds shoppable products and collections.
- [ ] Analytics dashboard tracks content and conversion outcomes.
- [ ] Multilingual posts (minimum en and hi) are supported.
- [N/A] AI-generated content authoring.
- [N/A] Multi-role access model (Editor/Viewer).
- [N/A] Native comment system in v1.

## 2) Role and Access
- [ ] All blog admin routes are restricted to authenticated Super Admin.
- [ ] Unauthenticated admin requests redirect to login.
- [ ] Super Admin has full CRUD + publish + schedule + revision restore + media + analytics access.

## 3) Content Model
- [ ] Title required.
- [ ] Slug required and unique.
- [ ] Slug auto-generates from title and is manually editable.
- [ ] Slug change on published post creates 301 redirect.
- [ ] Summary/excerpt max length is configurable.
- [ ] Cover image required for publish.
- [ ] Content supports builder JSON or full-page code payload.
- [ ] SEO metadata object persisted per post.
- [ ] Status enum: Draft, Scheduled, Published, Unpublished.
- [ ] Scheduled publish datetime persisted in UTC and displayed in IST.
- [ ] Author name stored with default from Super Admin profile.
- [ ] Tags support multi-value with global management.
- [ ] Category supports single select with admin-managed list.
- [ ] Language supports en, hi, other.
- [ ] Language variants are linked by parent grouping.
- [ ] Revision snapshots store content + metadata + SEO fields.
- [ ] Schema toggle controls BlogPosting JSON-LD.
- [ ] Related posts (manual, up to 5) supported.
- [ ] Related products (manual) supported.

## 4) Editor Modes
- [ ] Visual Builder mode exists and is default.
- [ ] Section library insertion works.
- [ ] Drag reorder works.
- [ ] Duplicate section works.
- [ ] Delete section includes confirmation.
- [ ] Inline section field editing works.
- [ ] Section collapse/expand works.
- [ ] Desktop and mobile preview toggles work.
- [ ] Builder auto-save runs every 60 seconds.
- [ ] Inline Custom Code section supports HTML/CSS/JS.
- [ ] Custom JS requires explicit acknowledgment on each save.
- [ ] Custom section show/hide toggle works.
- [ ] Custom code preview render works.
- [ ] Invalid code allows draft save but blocks publish.
- [ ] Full Page Code mode exists for HTML/CSS/JS output.
- [ ] Full code editor supports syntax highlighting and inline warnings.
- [ ] Switching back to Visual Builder only when compatible.
- [ ] Post can lock into code-only mode when incompatible.

## 5) Section Library
### 5.1 General
- [ ] Heading + Subheading section.
- [ ] Rich text section (bold, italic, underline, links, lists, inline images).
- [ ] Single image section (alt text required, optional link).
- [ ] Image with caption section.
- [ ] Two-column text-image section with responsive stacking.
- [ ] Quote/testimonial section.
- [ ] CTA section (label, URL, color).
- [ ] Spacer/divider section.
- [ ] YouTube/Instagram embed section.
- [ ] FAQ accordion section with reorder.
- [ ] Image gallery (2-4 columns).
- [ ] Table section with optional header row.

### 5.2 Ecommerce
- [ ] Product card embed with SKU picker and add-to-cart capability.
- [ ] Collection/category highlight section.
- [ ] Offer/price banner section.
- [ ] Fabric specification table section.

## 6) Media Library
- [ ] Upload formats: JPG, PNG, WebP.
- [ ] Upload max size default 10 MB (configurable).
- [ ] Resized variants generated (thumbnail 200, medium 800, large 1600).
- [ ] Grid listing with search/filter by uploaded date.
- [ ] Delete warns when asset is used in published post.
- [ ] Alt text editable at any time.
- [ ] Alt text required on all post images before publish.

## 7) Revision History
- [ ] Every manual save and auto-save creates revision snapshot.
- [ ] Revision list includes timestamp and save type.
- [ ] Read-only preview per revision.
- [ ] Restore revision creates a new revision.
- [ ] Compare any two revisions with content and metadata diff.
- [ ] Published posts keep history indefinitely.
- [ ] Drafts keep last 50 revisions.

## 8) SEO
### 8.1 Per Post Fields
- [ ] Meta title with character counter and publish requirement.
- [ ] Meta description with counter and publish requirement.
- [ ] Canonical URL editable.
- [ ] OG title with fallback.
- [ ] OG description with fallback.
- [ ] OG image via media library (manual upload).
- [ ] Twitter card type selector.
- [ ] Schema markup toggle.
- [ ] Robots directives selector.

### 8.2 Slug and Redirects
- [ ] Slug uniqueness validation on save and publish.
- [ ] Redirect history visible in SEO panel.

### 8.3 Page-Level
- [ ] Title renders as only H1.
- [ ] Content editor supports H2/H3 only.
- [ ] XML sitemap includes published posts only.
- [ ] Sitemap regenerates on publish/unpublish.
- [ ] Hreflang tags emitted for linked variants.

### 8.4 Multilingual SEO
- [ ] Language variants linked with parent ID.
- [ ] URL pattern supports /blog/[slug] and /hi/blog/[slug].
- [ ] Hreflang auto-generation for linked variants.
- [ ] Per-language independent SEO fields.
- [ ] Public language switcher only shows available variants.

## 9) Blog Management Screens
### 9.1 Blog List
- [ ] Sortable columns (title, category, status, language, author, publish date, views).
- [ ] Filters (status, category, tag, language, date range).
- [ ] Search by title, slug, tag.
- [ ] Bulk actions (publish, unpublish, delete, duplicate).
- [ ] Quick edit status/date inline.
- [ ] Summary cards for published count, monthly views, top post.

### 9.2 Blog Editor
- [ ] Left panel meta fields complete.
- [ ] Center builder canvas with section library.
- [ ] Right panel SEO (collapsible).
- [ ] Right panel related posts (up to 5).
- [ ] Right panel related products (up to 10).
- [ ] Top bar actions (save draft, preview, publish/schedule, revisions).
- [ ] Mode toggle (visual/code).

### 9.3 Preview
- [ ] Time-limited preview URL (48h).
- [ ] Mobile and desktop viewport switch.
- [ ] Preview available for draft/scheduled/published.

## 10) Scheduling and Publishing
- [ ] Draft not publicly visible.
- [ ] Scheduled posts auto-publish at set IST time.
- [ ] Scheduled execution SLA within plus/minus 2 minutes.
- [ ] Published state updates list, sitemap, indexability.
- [ ] Unpublished state removed from public view.
- [ ] Unpublished old URL serves 410 when no redirect exists.
- [ ] In-app notification on scheduled go-live.
- [ ] Validation failure at schedule time reverts to Draft and notifies admin.

## 11) Analytics
### 11.1 Post Metrics
- [ ] Page views.
- [ ] Unique visitors.
- [ ] Average time on page.
- [ ] Bounce rate.
- [ ] Views-over-time graph (7/30/90 days).

### 11.2 Traffic
- [ ] Referrer buckets (Google organic, direct, WhatsApp, Instagram, Facebook, other).
- [ ] Device breakdown (mobile, desktop, tablet).
- [ ] Search keyword landing support (optional integration).

### 11.3 Ecommerce Conversion
- [ ] Product click-throughs per post and product block.
- [ ] Collection/category click-throughs.
- [ ] CTA click-throughs by section.
- [ ] Top posts by product CTR.

### 11.4 Content Health
- [ ] Low Traffic badge for posts with 0 views in 30 days.
- [ ] SEO Incomplete badge for missing SEO essentials.
- [ ] Unlinked badge for published posts without related products.

### 11.5 Summary Cards
- [ ] Published count.
- [ ] Monthly blog views.
- [ ] Top post by views.
- [ ] Monthly product-page clicks from blog.

## 12) Comments and Engagement Policy
- [ ] Public post page has no native comment input.
- [ ] No third-party comment widget in v1.

## 13) Validation Rules
- [ ] Draft and publish validation follows PRD matrix.
- [ ] Publish blockers enforce: missing alt text, invalid code, missing required SEO, invalid schedule constraints.
- [ ] Custom JS save confirmation required.
- [ ] Slug change on published post always auto-creates redirect.

## 14) Internal Linking and Related Content
- [ ] Related posts section renders only when linked.
- [ ] Related products footer section supports up to 10 links.
- [N/A] Internal link suggestions in v1 (v1.5 nice-to-have).

## 15) Social Sharing
- [ ] Public share buttons: WhatsApp, Instagram copy-link, Facebook.
- [ ] Mobile uses native share sheet when available.
- [N/A] Admin auto-share to channels in v1.

## 16) QA Acceptance Criteria
- [ ] Prebuilt-section-only publish flow passes.
- [ ] Custom code section flow passes.
- [ ] Full page code mode publish flow passes.
- [ ] SEO fields verifiable in page source.
- [ ] Scheduling publish timing passes.
- [ ] Revision restore correctness passes.
- [ ] Slug-change redirect behavior passes.
- [ ] Media upload + alt text flow passes.
- [ ] Product card embed + tracking passes.
- [ ] Analytics surfaces expected data after test traffic.
- [ ] Hindi-English variant hreflang pass.
- [ ] Publish blocker UX for missing SEO/alt text passes.

## 17) Pending Decisions and Product Calls
- [ ] Analytics vendor choice finalized (GA4 vs Plausible vs Umami).
- [ ] GSC integration decision finalized.
- [ ] Additional v2 languages confirmed.
- [ ] Summary max length final value confirmed.
- [ ] Scheduled failure alert channel finalized.
- [ ] v2 social automation finalized.
- [ ] Internal link suggestion scope finalized.
- [ ] Revision labeling beyond timestamps finalized.
