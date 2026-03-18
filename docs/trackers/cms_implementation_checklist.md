# CMS Implementation Checklist

Project: Shree Hari Cutpiece
Module: Content & Banners (/admin/cms)
Source PRD: cms_prd.md (v2, 2026-03-18)
Status: Not Started

## Decision Lock (Confirmed)
- [x] Use existing localStorage admin auth (shreehari_admin_auth)
- [x] Single language (English only)
- [x] Instant publish (save = live)
- [x] Banner scheduling timezone: Asia/Kolkata (IST)
- [x] Popup frequency: once per browser session (sessionStorage)
- [x] Image uploads: versioned filenames with timestamp suffix
- [x] Audit trail: updated_at only
- [x] Categories: migrate from categories.json to Supabase categories table

## Progress Snapshot
- Phase 1: 27/35
- Phase 2: 25/33
- Phase 3: 0/42
- Total: 52/110

---

## Phase 1: Site Config (Text & Images)

### Database
- [x] Create site_config table in Supabase (key PK)
- [x] Create RLS policy: SELECT public, INSERT/UPDATE authenticated only
- [x] Create db/seeds/cms_site_config.sql with defaults
- [ ] Run seed and verify rows

### Storage
- [ ] Create cms-assets bucket with public read
- [ ] Create cms-assets/hero folder
- [ ] Create cms-assets/description folder

### Admin Navigation
- [x] Add Content & Banners nav item in src/app/admin/layout.tsx (between Coupons and Documentation)
- [x] Add Layout icon import in src/app/admin/layout.tsx

### Admin CMS Page and Forms
- [x] Create src/app/admin/cms/page.tsx with tabs: Hero | Description | Store Info
- [x] Build HeroConfigForm component
- [x] Build DescriptionConfigForm component
- [x] Build StoreConfigForm component

### Shared Form Behavior
- [x] Implement dirty-state tracking
- [x] Show yellow unsaved changes warning bar
- [x] Block tab switch when dirty and prompt Save/Discard
- [x] Implement optimistic UI update and revert-on-error

### API and Save Logic
- [x] Create src/app/api/admin/cms/site-config/route.ts POST handler
- [x] Validate URL fields server-side
- [x] Validate required fields server-side
- [x] Implement upsert by key in site_config
- [x] Implement image upload with versioned filename ({key}-{Date.now()}.{ext})
- [x] Show immediate image preview after upload
- [x] Show per-field upload spinner
- [x] Show success/error toasts

### Frontend Integration
- [x] Update src/components/home/Hero.tsx to read hero + stats from Supabase (revalidate: 30)
- [x] Add Hero fallbacks for missing keys and images
- [x] Update src/components/home/DescriptionSection.tsx to read description group
- [x] Add DescriptionSection fallbacks
- [x] Update src/components/home/StoreSection.tsx to read store group
- [x] Add StoreSection fallbacks

### Testing
- [ ] Edit hero headline in admin and verify website update within 30s
- [ ] Upload hero image and verify website update
- [ ] Delete a site_config key and verify hardcoded fallback
- [ ] Submit invalid store_maps_url and verify validation error

---

## Phase 2: Categories Manager

### Database
- [x] Create categories table with deleted_at soft-delete
- [x] Add unique slug index excluding soft-deleted rows
- [x] Add sort_order index excluding soft-deleted rows
- [x] Add RLS policy: SELECT public, INSERT/UPDATE authenticated only
- [ ] Migrate categories.json entries to Supabase with sort_order

### Storage
- [ ] Create cms-assets/categories folder

### Admin UI
- [x] Add Categories tab to /admin/cms
- [x] Build categories table component (thumbnail, name, slug, order, status, actions)
- [x] Filter out soft-deleted rows in table
- [x] Build CategoryFormModal
- [x] Add name field
- [x] Add slug field (auto-generated and editable)
- [x] Add description textarea
- [x] Add image upload field (versioned filename)
- [x] Add is_active toggle
- [x] Implement create category handler
- [x] Implement edit category handler
- [x] Implement soft-delete handler with confirmation
- [x] Implement sort_order up/down swap
- [x] Implement active/inactive toggle

### API and Validation
- [x] Create src/app/api/admin/cms/categories/route.ts
- [x] Validate slug format (/^[a-z0-9-]+$/)
- [x] Validate name required
- [x] Validate no duplicate slug

### Frontend Integration
- [x] Update src/components/home/Categories.tsx to read Supabase categories
- [x] Add query filters: is_active = true AND deleted_at IS NULL ORDER BY sort_order ASC
- [x] Add fallback to src/data/categories.json on empty/error
- [ ] Keep src/data/categories.json as fallback source

### Testing
- [ ] Add category and verify homepage visibility
- [ ] Reorder categories and verify homepage order
- [ ] Toggle inactive and verify category hidden on homepage
- [ ] Soft-delete category and verify hidden in admin and website (row remains in DB)
- [ ] Create duplicate slug and verify validation error

---

## Phase 3: Banner Manager

### Database
- [ ] Create banners table with deleted_at soft-delete
- [ ] Add composite index idx_banners_active (placement, is_active, start_date, end_date, priority DESC) WHERE deleted_at IS NULL
- [ ] Add RLS policy: SELECT public, INSERT/UPDATE authenticated only

### Storage
- [ ] Create cms-assets/banners folder

### Admin UI
- [ ] Add Banners tab to /admin/cms
- [ ] Build banners table with computed status badges (Scheduled/Active/Expired/Inactive)
- [ ] Build BannerFormModal
- [ ] Add title field (required)
- [ ] Add placement dropdown
- [ ] Add content text field
- [ ] Add image upload field (versioned filename)
- [ ] Add link URL field
- [ ] Add background color picker
- [ ] Add text color picker
- [ ] Add start date picker (IST)
- [ ] Add end date picker (IST)
- [ ] Add priority input
- [ ] Add active toggle
- [ ] Implement create banner handler
- [ ] Implement edit banner handler
- [ ] Implement soft-delete handler with confirmation
- [ ] Implement quick active/inactive toggle

### API and Validation
- [ ] Create src/app/api/admin/cms/banners/route.ts
- [ ] Validate link_url format or empty
- [ ] Validate bg_color and text_color as #RRGGBB
- [ ] Validate end_date >= start_date
- [ ] Validate placement enum values

### Frontend Integration
- [ ] Update src/components/home/OfferBanner.tsx (and/or CouponAnnouncementBar) to read announcement_bar banners
- [ ] Add fallback to existing coupon logic when no announcement banner exists
- [ ] Create src/components/home/PopupBanner.tsx
- [ ] Implement popup session key cms_popup_shown
- [ ] Add PopupBanner to homepage
- [ ] Create src/components/shop/ShopTopBanner.tsx (or project-appropriate path)
- [ ] Add ShopTopBanner to /shop page

### Testing
- [ ] Create future-start banner and verify Scheduled + not visible
- [ ] Set start_date to today and verify Active + visible
- [ ] Set end_date to past and verify Expired + hidden
- [ ] Verify popup shows once per session
- [ ] Verify popup reappears in new browser session
- [ ] Enter invalid hex color and verify validation error
- [ ] Enter end_date before start_date and verify validation error
- [ ] Soft-delete banner and verify hidden in admin and website (row remains in DB)

---

## Notes and Change Log
- 2026-03-18: Tracker initialized from cms_prd.md v2.
- 2026-03-18: Phase 1 scaffolding added (CMS page, forms, site-config API, nav item, migration + seed files).
- 2026-03-18: Classic homepage Hero, DescriptionSection, and StoreSection wired to site_config with cached reads and fallbacks.
- 2026-03-18: Phase 2 categories delivered in code (CMS categories tab, API route, DB migration, storefront Supabase categories with JSON fallback).
