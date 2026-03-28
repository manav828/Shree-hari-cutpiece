# Blog Builder PRD v2.0 Implementation Tracker

Last updated: 2026-03-28
Primary PRD: docs/shree_hari_blog_prd_v2.docx
Checklist source: docs/blog/blog_builder_prd_v2_requirements_checklist.md
Documentation URL: /admin/documentation

## Implementation Rules
- [ ] After completing any functionality, update /admin/documentation in the same work session before marking the task as done.
- [ ] After completing any functionality, update this tracker in the same commit.
- [ ] Any feature without documentation update cannot move to Done.

## Status Legend
- [x] Done
- [~] In Progress
- [ ] Pending
- [!] Blocked

## Milestone Plan (Execution Order)

## M0) Foundations and Decisions
- [ ] Finalize analytics provider (GA4, Plausible, or Umami).
- [ ] Confirm editor architecture (JSON schema for visual builder + code mode model).
- [ ] Confirm multilingual route strategy and fallback behavior.
- [ ] Confirm storage and processing approach for media variants.
- [ ] Define publishing scheduler execution model and retry strategy.
- [ ] Define rich text and custom code sanitization strategy.
- [ ] Documentation update: add architecture decisions to /admin/documentation.

## M1) Data Model and Migrations
- [x] Add initial migration scaffold file for blog module schema (`db/migrations/supabase_blog_builder_v2_migration.sql`).
- [x] Add shared TypeScript domain model definitions (`src/types/blogs.ts`).
- [x] Create blog posts table and status fields.
- [x] Create SEO fields and schema toggle fields.
- [x] Create tags, categories, and junction tables.
- [x] Create related posts and related products relations.
- [x] Create revision snapshots table.
- [x] Create slug redirect history table.
- [x] Create media library table with alt text and variants metadata.
- [x] Create language linkage model (parent variant mapping).
- [x] Create analytics rollup tables/views for dashboard cards.
- [x] Add indexes for slug, status, publish date, language, and search filters.
- [x] Add row-level security and server-only write paths for admin operations.
- [x] Documentation update: add DB schema section to /admin/documentation.

## M2) API Layer and Server Actions
- [x] Create admin APIs for blog CRUD.
- [x] Create admin APIs for list filtering, sorting, searching, and bulk actions.
- [x] Create admin API for quick edit (status/date).
- [x] Create admin APIs for tags/categories management.
- [x] Create admin APIs for related posts/products linking.
- [x] Create media upload and media listing APIs.
- [x] Create revision APIs (list, diff, restore).
- [x] Create slug redirect APIs and auto-create redirect logic on slug changes.
- [x] Create preview token API and 48-hour signed preview URL support.
- [x] Create schedule publish worker endpoint and queue trigger.
- [x] Create publish validator service for draft and publish gates.
- [x] Create analytics APIs for summary cards and detailed charts.
- [x] Documentation update: add API contracts and route map to /admin/documentation.

## M3) Admin Blog List UX
- [x] Build list page with required columns and status badges.
- [x] Build list filters (status, category, tag, language, date range).
- [x] Build search (title, slug, tag).
- [x] Build bulk actions with confirmation UX.
- [x] Build quick edit status/date inline.
- [x] Build analytics summary cards in list header.
- [x] Add content health badges (Low Traffic, SEO Incomplete, Unlinked).
- [x] Documentation update: add list workflow and troubleshooting to /admin/documentation.

## M4) Admin Blog Editor UX Core
- [x] Build left metadata panel (title, slug, summary, cover image, category, tags, language, author).
- [x] Build center canvas with visual builder shell.
- [x] Build right SEO panel with collapsible behavior.
- [x] Build right related posts picker (max 5).
- [x] Build right related products picker (max 10).
- [x] Build top bar actions (save draft, preview, publish/schedule, revisions).
- [x] Implement autosave every 60 seconds.
- [x] Documentation update: add editor usage SOP to /admin/documentation.

## M5) Section Library and Builder Capabilities
- [x] Implement all general section types in PRD.
- [x] Implement ecommerce section types in PRD.
- [x] Implement section reorder, duplicate, delete confirmation.
- [x] Implement section show/hide toggle.
- [x] Implement responsive preview (desktop/mobile).
- [x] Implement section-level field validations and warnings.
- [x] Documentation update: section-by-section usage guide in /admin/documentation.

## M6) Custom Code and Full Page Code Modes
- [x] Implement inline custom code block parser and renderer.
- [x] Implement syntax warning flow for HTML/CSS/JS.
- [x] Implement publish blocking when code is invalid.
- [x] Implement mandatory security acknowledgment before JS save.
- [x] Implement full-page code mode editor with syntax highlighting.
- [x] Implement mode conversion checks and code-only lock behavior.
- [x] Documentation update: safe code workflow and rollback SOP in /admin/documentation.

## M7) Media Library
- [x] Build upload flow (JPG/PNG/WebP, size checks).
- [x] Build background generation of thumbnail/medium/large variants.
- [x] Build media picker with search and date filter.
- [x] Build in-use warning before delete.
- [x] Enforce alt text requirements for publish.
- [x] Documentation update: media governance guide in /admin/documentation.

## M8) SEO and Multilingual
- [x] Implement all per-post SEO fields and counters.
- [x] Implement robots/canonical/twitter/schema controls.
- [x] Implement slug uniqueness checks on save/publish.
- [x] Implement auto 301 redirect creation on published slug changes.
- [x] Implement sitemap inclusion rules and regeneration triggers.
- [x] Implement hreflang generation for linked variants.
- [x] Implement language variant linking and switcher behavior.
- [x] Documentation update: SEO and multilingual checklist in /admin/documentation.

## M9) Scheduling, Publish Lifecycle, and Notifications
- [x] Implement schedule state and IST display behavior with UTC storage.
- [x] Implement scheduled publish executor with plus/minus 2-minute SLA target.
- [x] Implement unpublish behavior with 410 fallback when redirect absent.
- [x] Implement validation failure fallback to draft with clear reason capture.
- [x] Implement in-app notification on scheduled publish result.
- [x] Documentation update: scheduling and rollback runbook in /admin/documentation.

## M10) Public Blog Experience
- [x] Build public blog list page and detail page routes.
- [x] Render all builder sections and code-mode output safely.
- [x] Render related posts and related products footer blocks.
- [x] Implement share buttons (WhatsApp, Instagram copy-link, Facebook).
- [x] Implement mobile-native share behavior where available.
- [x] Ensure no comments UI appears on public post pages.
- [x] Documentation update: public rendering and SEO verification guide in /admin/documentation.

## M11) Analytics Dashboard
- [x] Build dedicated analytics view for blog module.
- [x] Build post-level metrics cards and trend charts.
- [x] Build traffic/referrer/device breakdown widgets.
- [x] Build ecommerce conversion widgets (product/collection/CTA click-through).
- [x] Build top-post-by-CTR ranking.
- [x] Build low-traffic and SEO health indicators.
- [x] Documentation update: analytics interpretation guide in /admin/documentation.

## M12) QA, UAT, and Release Gate
- [x] Convert PRD acceptance criteria into executable QA test cases.
- [ ] Run full smoke test for admin and public blog flows.
- [ ] Validate page-source SEO fields for published posts.
- [ ] Validate multilingual hreflang behavior.
- [ ] Validate scheduled publish timing and notifications.
- [ ] Validate redirect behavior for published slug change.
- [ ] Validate publish blockers for missing alt text and missing meta fields.
- [x] Documentation update: release checklist and known limits in /admin/documentation.

## Dependency Notes
- M1 must complete before M2-M11.
- M2 must complete before M3-M11.
- M4 and M5 can run partly in parallel after M2 baseline APIs are ready.
- M6 depends on M4 and core validation services from M2.
- M8 depends on M1 model fields and M2 validators.
- M9 depends on scheduler infrastructure and publish validators.
- M10 depends on M5, M6, M7, M8.
- M11 depends on analytics event instrumentation from M3-M10.

## Definition of Done Per Task
- [ ] Code completed and peer-reviewed.
- [ ] Validation, error handling, and edge cases covered.
- [ ] Automated tests added or updated.
- [ ] Manual QA pass completed.
- [ ] /admin/documentation updated for the completed functionality.
- [ ] This tracker updated.

## Change Log
- 2026-03-23: Created detailed milestone-based implementation tracker from PRD v2.0.
- 2026-03-23: Added mandatory documentation update gate tied to /admin/documentation for each functionality completion.
- 2026-03-23: Started implementation with M1 foundation slice by adding blog schema migration scaffold and shared domain types.
- 2026-03-23: Implemented M2 baseline admin blog APIs (CRUD, filters/search/sort, bulk actions, quick edit, taxonomy, related links, slug redirect handling).
- 2026-03-23: Added theme-agnostic API contract documentation at docs/blog/blog_builder_admin_api_contract_v1.md and updated admin documentation guidance.
- 2026-03-23: Added revision snapshot writes on create/update and implemented revision APIs (list, compare diff, restore) at /api/admin/blogs/[id]/revisions.
- 2026-03-23: Added preview token APIs with default 48-hour validity at /api/admin/blogs/[id]/preview and schema support in blog migration.
- 2026-03-28: Added validation API, scheduler endpoint, and media library APIs with theme-agnostic contracts.
- 2026-03-28: Marked M1 schema tasks complete and documented DB schema at docs/blog/blog_builder_db_schema.md.
- 2026-03-28: Added analytics API for summary cards, time-series charts, referrer/device breakdown, and content-health flags.
- 2026-03-28: Implemented admin blog list UX, filters, bulk actions, quick edit, health badges, and documented list workflow.
- 2026-03-28: Implemented admin blog editor shell, autosave, preview/publish actions, and documented editor workflow.
- 2026-03-28: Implemented visual section library, builder controls, and section validation warnings with documentation.
- 2026-03-28: Added custom code section template, code mode lock controls, custom JS publish acknowledgments, and admin documentation for blog builder operations.
- 2026-03-28: Added code syntax validation, save-time JS acknowledgment enforcement, and syntax-highlighted code mode editor.
- 2026-03-28: Completed media library upload flow, media picker, variants pipeline, alt text updates, and documentation additions.
- 2026-03-28: Completed SEO metadata controls, slug validation, variant linking, hreflang alternates, sitemap generation, and documentation updates.
- 2026-03-28: Completed scheduling lifecycle, IST handling, scheduler notifications, and 410 unpublish behavior.
- 2026-03-28: Completed public blog rendering, share actions, related products, and public SEO documentation.
- 2026-03-28: Completed blog analytics dashboard, conversion metrics, and documentation.
- 2026-03-28: Added QA test cases and release checklist documentation.
