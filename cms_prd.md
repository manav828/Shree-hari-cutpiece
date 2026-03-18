# Content & Banner Management (CMS) — Product Requirements Document

**Project:** Shree Hari Cutpiece — Admin Panel  
**Section:** `/admin/cms`  
**Stack:** Next.js 14 (App Router) · Supabase (DB + Storage) · Tailwind CSS  
**Created:** 2026-03-18 · **Revised:** 2026-03-18 (v2 — community suggestions applied)

---

## Overview

The CMS section gives the admin complete control over all homepage content without touching code. Every section on the public website — hero text, banners, categories, store info — can be edited live from the admin panel. Changes reflect immediately or on the next page load depending on section type.

---

## Design Decisions

| Decision | Choice |
|---|---|
| Auth | Existing `shreehari_admin_auth` localStorage check in [layout.tsx](file:///d:/Manav/website/ecomshrihari/src/app/layout.tsx) |
| Language | English only (no i18n) |
| Publish mode | Instant — save = live |
| Timezone | IST `Asia/Kolkata` (UTC+5:30) for all date comparisons |
| Popup frequency | Once per browser session via `sessionStorage` |
| Image filenames | Versioned with timestamp suffix (e.g. `hero-desktop-1742312849.jpg`) |
| Audit trail | `updated_at` column only (no audit log table) |
| Categories source | New Supabase `categories` table, migrated from [categories.json](file:///d:/Manav/website/ecomshrihari/src/data/categories.json) |

---

## Architecture

```
Supabase DB
  ├── site_config   (key-value pairs — hero, description, store info)
  ├── banners       (promotional banners with scheduling + soft-delete)
  └── categories    (migrated from categories.json + soft-delete)

Supabase Storage
  └── cms-assets/
        ├── hero/
        ├── description/
        ├── categories/
        └── banners/

Admin Panel  →  writes to Supabase (with server-side validation)
Frontend     →  reads from Supabase with Next.js revalidate cache
                fallback: hardcoded defaults if key/image missing
```

---

## Shared Engineering Standards (All Phases)

### Dirty-State Guard
Every CMS form tab tracks whether unsaved edits exist. If the admin switches tabs or navigates away with unsaved changes, a **yellow warning bar** appears: _"You have unsaved changes — save before leaving."_ Tab switch is blocked until the user saves or explicitly discards.

This uses optimistic UI — the form shows changes immediately without waiting for Supabase to respond, then confirms or reverts based on the result.

### Server-Side Validation
All writes go through a Next.js **API route** (`/api/admin/cms/*`) that validates:
- `url` fields — must be a valid URL format
- `bg_color` / `text_color` fields — must match `#RRGGBB` hex pattern
- `start_date` / `end_date` — end must not be before start
- Required fields — must not be empty
Client-side validation mirrors server-side so errors show immediately in the form.

### Frontend Fallback Strategy
Every frontend component that reads from Supabase must fall back gracefully:
```ts
// Example fallback pattern
const headline = config['hero_headline'] ?? 'Premium Cutpiece'
const image    = config['hero_desktop_image'] ?? '/images/hero-default.jpg'
```
If a `site_config` key is missing, use the existing hardcoded value.  
If a CMS image URL is missing or broken, use the existing local asset.

### Frontend Cache Strategy
Frontend reads use Next.js `fetch` with `revalidate`:
```ts
// Short TTL — changes appear within 30s, pages stay stable
fetch(url, { next: { revalidate: 30 } })
```
Admin panel reads bypass cache (`cache: 'no-store'`) so the form always shows the current value.

---

## Phase 1 — Site Config (Text & Images)

**Goal:** Edit all static homepage text and images from admin without touching code.

### Supabase Table: `site_config`

| Column | Type | Notes |
|---|---|---|
| `key` | `text PRIMARY KEY` | Unique identifier — **UNIQUE constraint** |
| `value` | `text` | Content value |
| `label` | `text` | Human-readable label for admin UI |
| `group` | `text` | `hero` / `description` / `store` / `stats` |
| `type` | `text` | `text` / `textarea` / `number` / `url` |
| `updated_at` | `timestamptz` | Auto-updated on every write |

> `key` is the primary key, ensuring uniqueness by definition. No separate unique index needed.

### Seed SQL File

A file `db/seeds/cms_site_config.sql` is created so any new environment can be initialized in one command:

```sql
INSERT INTO site_config (key, value, label, group, type) VALUES
  ('hero_badge',         'Premium Fabric Collection',          'Badge Text',          'hero',        'text'),
  ('hero_headline',      'Premium Cutpiece',                   'Headline',            'hero',        'text'),
  ('hero_subheading',    'Per Meter',                          'Subheading',          'hero',        'text'),
  ('hero_description',   'Design your own outfits...',         'Description',         'hero',        'textarea'),
  ('hero_cta1_label',    'Explore Collection',                 'Button 1 Label',      'hero',        'text'),
  ('hero_cta1_url',      '/shop',                              'Button 1 URL',        'hero',        'url'),
  ('hero_cta2_label',    'Our Story',                          'Button 2 Label',      'hero',        'text'),
  ('hero_cta2_url',      '/about',                             'Button 2 URL',        'hero',        'url'),
  ('hero_stat1_number',  '10+',                                'Stat 1 Number',       'stats',       'text'),
  ('hero_stat1_label',   'Years Experience',                   'Stat 1 Label',        'stats',       'text'),
  ('hero_stat2_number',  '5k+',                                'Stat 2 Number',       'stats',       'text'),
  ('hero_stat2_label',   'Happy Customers',                    'Stat 2 Label',        'stats',       'text'),
  ('hero_stat3_number',  '100%',                               'Stat 3 Number',       'stats',       'text'),
  ('hero_stat3_label',   'Quality Assured',                    'Stat 3 Label',        'stats',       'text'),
  ('hero_desktop_image', '',                                   'Desktop Hero Image',  'hero',        'url'),
  ('hero_mobile_image',  '',                                   'Mobile Hero Image',   'hero',        'url'),
  ('desc_badge',         'Why Choose Us',                      'Badge',               'description', 'text'),
  ('desc_headline',      'Crafting Dreams,',                   'Headline',            'description', 'text'),
  ('desc_headline_accent','One Fabric at a Time',              'Headline Accent',     'description', 'text'),
  ('desc_paragraph',     'At Shree Hari Cutpiece...',          'Paragraph',           'description', 'textarea'),
  ('desc_point1_title',  'Premium Quality',                    'Point 1 Title',       'description', 'text'),
  ('desc_point1_text',   'Sourced from trusted manufacturers', 'Point 1 Text',        'description', 'text'),
  ('desc_point2_title',  'Sold Per Meter',                     'Point 2 Title',       'description', 'text'),
  ('desc_point2_text',   'Buy exactly what you need',          'Point 2 Text',        'description', 'text'),
  ('desc_point3_title',  'Design Freedom',                     'Point 3 Title',       'description', 'text'),
  ('desc_point3_text',   'Create outfits that are uniquely yours','Point 3 Text',     'description', 'text'),
  ('desc_stat_number',   '10+',                                'Floating Stat Number','description', 'text'),
  ('desc_stat_label',    'Years of Excellence',                'Floating Stat Label', 'description', 'text'),
  ('desc_image1',        '',                                   'Section Image 1',     'description', 'url'),
  ('desc_image2',        '',                                   'Section Image 2',     'description', 'url'),
  ('store_address',      '123, Textile Market, Ring Road, Ahmedabad, Gujarat - 380001','Address','store','textarea'),
  ('store_hours_weekday','Monday - Saturday: 10:00 AM - 8:00 PM','Weekday Hours',     'store',       'text'),
  ('store_hours_weekend','Sunday: 11:00 AM - 6:00 PM',         'Weekend Hours',       'store',       'text'),
  ('store_phone',        '+91 XXXXX XXXXX',                    'Phone',               'store',       'text'),
  ('store_email',        'info@shreeharicutpiece.com',          'Email',               'store',       'text'),
  ('store_maps_url',     'https://maps.google.com',            'Directions URL',      'store',       'url'),
  ('store_embed_url',    'https://www.google.com/maps/embed?...','Maps Embed URL',    'store',       'url')
ON CONFLICT (key) DO NOTHING;
```

### Admin UI — Phase 1

- `/admin/cms` page with tabs: **Hero | Description | Store Info**
- Each tab has labeled inputs matching field `type` (text, textarea, number, url)
- Image fields: current preview thumbnail + "Replace Image" upload button
- **Dirty-state guard** active across all tabs
- Save button → validates client-side → posts to API route → upserts to Supabase
- Toast: "✅ Saved successfully" or "❌ Validation error: [detail]"
- "Open Website" link in top-right corner for live preview

### Phase 1 Checklist

**Database**
- [ ] Create `site_config` table in Supabase (`key` as PK gives implicit uniqueness)
- [ ] Create RLS policy: `SELECT` public, `INSERT/UPDATE` authenticated only
- [ ] Create `db/seeds/cms_site_config.sql` seed file with all defaults
- [ ] Run seed — verify all rows inserted correctly

**Storage**
- [ ] Create Supabase Storage bucket `cms-assets` with **public read** access
- [ ] Create folders: `cms-assets/hero/`, `cms-assets/description/`

**Admin Nav**
- [ ] Add `{ name: "Content & Banners", href: "/admin/cms", icon: Layout }` to `navItems` array in [src/app/admin/layout.tsx](file:///d:/Manav/website/ecomshrihari/src/app/admin/layout.tsx) (between Coupons and Documentation)
- [ ] Import [Layout](file:///d:/Manav/website/ecomshrihari/src/app/admin/layout.tsx#21-160) icon from `lucide-react` in [layout.tsx](file:///d:/Manav/website/ecomshrihari/src/app/layout.tsx)

**Admin Page & Forms**
- [ ] Create `src/app/admin/cms/page.tsx` with tab navigation UI
- [ ] Build `HeroConfigForm` — badge, headline, subheading, description, 2 CTAs, 3 stats, 2 image uploads
- [ ] Build `DescriptionConfigForm` — badge, headline, accent, paragraph, 3 bullet points, floating stat, 2 image uploads
- [ ] Build `StoreConfigForm` — address, weekday hours, weekend hours, phone, email, directions URL, embed URL

**Shared Form Behaviour**
- [ ] Implement dirty-state tracking (compare current values vs loaded values)
- [ ] Show yellow "Unsaved changes" warning bar when dirty
- [ ] Block tab switch if dirty — prompt "Save or Discard?"
- [ ] Implement optimistic UI — update local state first, then confirm from Supabase

**API & Save Logic**
- [ ] Create `/api/admin/cms/site-config/route.ts` — POST handler
- [ ] Server-side validation: `url` type fields → valid URL, required fields → not empty
- [ ] Supabase `upsert` on `site_config` keyed by `key`
- [ ] Image upload: versioned filename `{key}-{Date.now()}.{ext}` → upload to `cms-assets/`
- [ ] Show image preview of uploaded image immediately after upload
- [ ] Show spinner on image field during upload
- [ ] Success/error toast notifications

**Frontend Updates**
- [ ] Update [Hero.tsx](file:///d:/Manav/website/ecomshrihari/src/components/home/Hero.tsx) — fetch `site_config` group `hero` + `stats` from Supabase with `revalidate: 30`
- [ ] Add fallbacks in [Hero.tsx](file:///d:/Manav/website/ecomshrihari/src/components/home/Hero.tsx): missing key → hardcoded default, missing image → local asset
- [ ] Update [DescriptionSection.tsx](file:///d:/Manav/website/ecomshrihari/src/components/home/DescriptionSection.tsx) — fetch `description` group, add fallbacks
- [ ] Update [StoreSection.tsx](file:///d:/Manav/website/ecomshrihari/src/components/home/StoreSection.tsx) — fetch `store` group, add fallbacks

**Testing**
- [ ] Edit hero headline in admin → verify change appears on website within 30s
- [ ] Upload a new hero image → verify it appears on website
- [ ] Delete a `site_config` key manually → verify frontend shows hardcoded default (fallback works)
- [ ] Enter invalid URL in store_maps_url → verify server returns validation error

---

## Phase 2 — Categories Manager

**Goal:** Fully manage homepage categories from admin. Replace [categories.json](file:///d:/Manav/website/ecomshrihari/src/data/categories.json) with Supabase.

### Supabase Table: `categories`

| Column | Type | Notes |
|---|---|---|
| [id](file:///d:/Manav/website/ecomshrihari/src/app/admin/layout.tsx#68-116) | `uuid PRIMARY KEY` | Auto-generated |
| `name` | `text NOT NULL` | Display name |
| `slug` | `text NOT NULL` | **UNIQUE constraint + index** |
| `description` | `text` | Shown on hover |
| `image` | `text` | Supabase Storage URL |
| `sort_order` | `integer DEFAULT 0` | **Index** for fast ordered queries |
| `is_active` | `boolean DEFAULT true` | Show/hide on website |
| `deleted_at` | `timestamptz DEFAULT NULL` | **Soft-delete** — NULL = not deleted |
| `created_at` | `timestamptz` | Auto set |
| `updated_at` | `timestamptz` | Auto-updated on write |

```sql
-- Indexes
CREATE UNIQUE INDEX idx_categories_slug      ON categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX         idx_categories_order     ON categories(sort_order) WHERE deleted_at IS NULL;
```

> Soft delete: `DELETE` in admin sets `deleted_at = NOW()` instead of removing the row. Frontend query always filters `WHERE deleted_at IS NULL`.

### Admin UI — Phase 2

- `/admin/cms` → **"Categories"** tab
- Table: image thumbnail | name | slug | order | status | actions (Edit, Delete)
- **"+ Add Category"** button → opens `CategoryFormModal`
- **Soft-delete**: "Delete" shows confirmation → sets `deleted_at` → row disappears from table
- Up/Down arrow buttons to adjust `sort_order`
- Active/Inactive toggle pill per row

### Phase 2 Checklist

**Database**
- [ ] Create `categories` table with all columns including `deleted_at`
- [ ] Add `UNIQUE` index on `slug` (excluding soft-deleted rows)
- [ ] Add index on `sort_order` (excluding soft-deleted rows)
- [ ] Add RLS policy: `SELECT` public, `INSERT/UPDATE` authenticated only
- [ ] Migrate all 6 entries from [categories.json](file:///d:/Manav/website/ecomshrihari/src/data/categories.json) into Supabase (run once, set correct `sort_order`)

**Storage**
- [ ] Create folder `cms-assets/categories/`

**Admin UI**
- [ ] Add "Categories" tab to `/admin/cms` page
- [ ] Build categories table component (columns: thumbnail, name, slug, order, active badge, edit/delete)
- [ ] Show soft-deleted rows filtered out (hidden from table)
- [ ] Build `CategoryFormModal`:
  - [ ] Name field
  - [ ] Slug field (auto-generated from name via `slugify`, editable)
  - [ ] Description textarea
  - [ ] Image upload (versioned filename to `cms-assets/categories/`)
  - [ ] is_active toggle
- [ ] Implement Create handler — POST to `/api/admin/cms/categories`
- [ ] Implement Edit handler — PATCH, pre-fill form with existing row data
- [ ] Implement Soft-delete handler — PATCH `deleted_at = NOW()`; show confirmation dialog first
- [ ] Implement sort_order up/down arrows — swap `sort_order` values between adjacent rows
- [ ] Implement Active/Inactive toggle — PATCH `is_active`

**API & Validation**
- [ ] Create `/api/admin/cms/categories/route.ts`
- [ ] Server-side validation: `slug` must be URL-safe (`/^[a-z0-9-]+$/`), name required, no duplicate slug

**Frontend Updates**
- [ ] Update [Categories.tsx](file:///d:/Manav/website/ecomshrihari/src/components/home/Categories.tsx) — fetch from Supabase `WHERE is_active = true AND deleted_at IS NULL ORDER BY sort_order ASC` with `revalidate: 30`
- [ ] Fallback: if Supabase returns empty / errors, fall back to [categories.json](file:///d:/Manav/website/ecomshrihari/src/data/categories.json) import
- [ ] Keep [categories.json](file:///d:/Manav/website/ecomshrihari/src/data/categories.json) in `data/` as fallback (do not delete)

**Testing**
- [ ] Add new category in admin → appears on homepage
- [ ] Reorder categories → new order reflected on homepage
- [ ] Toggle inactive → category disappears from homepage
- [ ] Soft-delete → category gone from admin table and website; row still exists in DB
- [ ] Enter duplicate slug → server returns validation error

---

## Phase 3 — Banner Manager (Promotional Banners)

**Goal:** Create, schedule, and manage promotional banners. Auto-show/hide by date. Multiple placements.

### Supabase Table: `banners`

| Column | Type | Notes |
|---|---|---|
| [id](file:///d:/Manav/website/ecomshrihari/src/app/admin/layout.tsx#68-116) | `uuid PRIMARY KEY` | Auto-generated |
| `title` | `text NOT NULL` | Internal admin label |
| `content_text` | `text` | Marquee/banner message text |
| `image_url` | `text` | Supabase Storage URL (optional) |
| `link_url` | `text` | Click destination (optional) |
| `placement` | `text NOT NULL` | `announcement_bar` / `homepage_hero` / `shop_top` / `popup` |
| `bg_color` | `text DEFAULT '#000000'` | Hex color for text banners |
| `text_color` | `text DEFAULT '#FFFFFF'` | Hex text color |
| `is_active` | `boolean DEFAULT true` | Manual override |
| `start_date` | `date` | IST — auto-show from this date (NULL = immediate) |
| `end_date` | `date` | IST — auto-hide after this date (NULL = no expiry) |
| `priority` | `integer DEFAULT 0` | Higher = shown first |
| `deleted_at` | `timestamptz DEFAULT NULL` | **Soft-delete** |
| `created_at` | `timestamptz` | Auto set |

```sql
-- Composite index for fast active-banner lookup
CREATE INDEX idx_banners_active
  ON banners(placement, is_active, start_date, end_date, priority DESC)
  WHERE deleted_at IS NULL;
```

### Banner Scheduling Logic (IST)

```sql
-- Active banners query (run at request time in IST timezone)
SELECT * FROM banners
WHERE deleted_at IS NULL
  AND is_active = true
  AND (start_date IS NULL OR start_date <= (NOW() AT TIME ZONE 'Asia/Kolkata')::date)
  AND (end_date   IS NULL OR end_date   >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date)
  AND placement = $1
ORDER BY priority DESC;
```

### Placements

| Key | Where It Shows |
|---|---|
| `announcement_bar` | Scrolling marquee bar above the navbar |
| `homepage_hero` | Overlay/replacement of the homepage hero |
| `shop_top` | Top of the `/shop` page |
| `popup` | Modal on homepage — once per `sessionStorage` session |

### Admin Banner Status Logic

| Status | Condition |
|---|---|
| 🟡 **Scheduled** | `is_active = true` AND `start_date > today` |
| 🟢 **Active** | `is_active = true` AND within date range |
| 🔴 **Expired** | `end_date < today` |
| ⚫ **Inactive** | `is_active = false` |

### Admin UI — Phase 3

- `/admin/cms` → **"Banners"** tab
- Table: title | placement badge | status badge | date range | priority | actions
- **"+ Create Banner"** button → `BannerFormModal`
- Quick toggle (active/inactive) per row without opening modal
- Soft-delete with confirmation

### Phase 3 Checklist

**Database**
- [ ] Create `banners` table with all columns including `deleted_at`
- [ ] Add composite index `idx_banners_active` on [(placement, is_active, start_date, end_date, priority DESC) WHERE deleted_at IS NULL](file:///d:/Manav/website/ecomshrihari/src/components/home/Hero.tsx#5-90)
- [ ] Add RLS policy: `SELECT` public, `INSERT/UPDATE` authenticated only

**Storage**
- [ ] Create folder `cms-assets/banners/`

**Admin UI**
- [ ] Add "Banners" tab to `/admin/cms` page
- [ ] Build banners table with computed status badge (Scheduled/Active/Expired/Inactive)
- [ ] Build `BannerFormModal` with fields:
  - [ ] Title (required, internal)
  - [ ] Placement dropdown (4 options)
  - [ ] Content text field
  - [ ] Image upload (to `cms-assets/banners/`, versioned filename)
  - [ ] Link URL field
  - [ ] Background color picker (`#RRGGBB` input + swatch preview)
  - [ ] Text color picker
  - [ ] Start date picker (IST date, optional)
  - [ ] End date picker (IST date, optional — must be ≥ start)
  - [ ] Priority number input
  - [ ] Active toggle
- [ ] Implement Create banner handler
- [ ] Implement Edit banner handler (pre-fill all fields)
- [ ] Implement Soft-delete — PATCH `deleted_at`, show confirmation dialog
- [ ] Implement quick toggle (active/inactive) per row — single click

**API & Validation**
- [ ] Create `/api/admin/cms/banners/route.ts`
- [ ] Server-side validation:
  - [ ] `link_url` — valid URL or empty
  - [ ] `bg_color` / `text_color` — must match `/#[0-9A-Fa-f]{6}/`
  - [ ] `end_date >= start_date` when both are provided
  - [ ] `placement` — must be one of the 4 valid values

**Frontend Updates**
- [ ] Update [OfferBanner.tsx](file:///d:/Manav/website/ecomshrihari/src/components/home/OfferBanner.tsx) / `CouponAnnouncementBar.tsx` — fetch active `announcement_bar` banners from Supabase; fallback to existing coupon logic if none
- [ ] Create `PopupBanner.tsx` component:
  - [ ] Fetch active `popup` banners
  - [ ] Check `sessionStorage` key `cms_popup_shown` — skip if set
  - [ ] Show modal on homepage after 2s delay
  - [ ] On close: set `sessionStorage.setItem('cms_popup_shown', '1')`
- [ ] Add `<PopupBanner />` to homepage layout
- [ ] Create `ShopTopBanner.tsx` — fetch active `shop_top` banners, render above shop product grid
- [ ] Add `<ShopTopBanner />` to `/shop` page

**Testing**
- [ ] Create banner with future `start_date` → status shows Scheduled, not visible on site
- [ ] Set `start_date = today` → status shows Active, visible on site
- [ ] Set `end_date = yesterday` → status shows Expired, not visible on site
- [ ] Create popup banner → verify modal shows on homepage; close and refresh in-session → verify does NOT show again
- [ ] Create new tab → verify popup shows again (new session)
- [ ] Enter invalid hex color → server returns validation error
- [ ] Enter end_date before start_date → server returns validation error
- [ ] Soft-delete a banner → disappears from admin and website; row still in DB

---

## Global Admin UI Standards

- All forms: white card, consistent padding, existing admin design language
- `lucide-react` icons throughout
- Image upload: loading spinner during upload, preview after success
- Dirty-state guard: yellow warning bar, tab-switch block
- Optimistic UI: local state updates immediately, reverts on error
- All API writes validated server-side before Supabase write

---

## Nav Update ([src/app/admin/layout.tsx](file:///d:/Manav/website/ecomshrihari/src/app/admin/layout.tsx))

```tsx
// Add to navItems array — between Coupons and Documentation
{ name: "Content & Banners", href: "/admin/cms", icon: Layout }

// Add Layout to lucide-react imports at top of file
import { ..., Layout } from "lucide-react";
```

---

## Final Test Case Matrix (Run At End)

This section consolidates all testing into one final pass. Use these test IDs as a runbook.

### Environment & Setup

| ID | Test | Expected Result |
|---|---|---|
| ENV-01 | Apply `cms_site_config_setup.sql` migration | `site_config` table, trigger, and RLS policies created successfully |
| ENV-02 | Run `db/seeds/cms_site_config.sql` | All default rows inserted; rerun is idempotent (`ON CONFLICT DO NOTHING`) |
| ENV-03 | Create bucket `cms-assets` and folders (`hero`, `description`, `categories`, `banners`) | Uploads are possible and public URLs resolve |
| ENV-04 | Open `/admin/cms` from admin sidebar | Page loads with tabs and no runtime errors |

### Global UX & Guard Rails

| ID | Test | Expected Result |
|---|---|---|
| UX-01 | Modify any input and attempt tab switch | Unsaved change warning appears; switch requires discard confirmation |
| UX-02 | Modify input and click Save | Success toast appears and warning disappears |
| UX-03 | Trigger validation error (invalid URL/color/date) | Error toast appears; invalid data is not persisted |
| UX-04 | Reload page after save | Saved values persist and load correctly |
| UX-05 | Upload image while watching field state | Field-level upload spinner appears during upload and disappears after completion |

### Phase 1: Site Config (Hero, Description, Store)

| ID | Test | Expected Result |
|---|---|---|
| P1-01 | Update `hero_headline` in admin and save | Homepage hero headline updates within cache window (<= 30s) |
| P1-02 | Update hero CTA labels/URLs and save | Buttons show new labels and navigate to new URLs |
| P1-03 | Update hero stats and save | All 3 trust stats update correctly |
| P1-04 | Upload `hero_desktop_image` | Desktop hero image changes on homepage |
| P1-05 | Upload `hero_mobile_image` | Mobile hero image changes on homepage |
| P1-06 | Update description badge/headline/accent | Description section text reflects new values |
| P1-07 | Update description bullet points | Bullet titles and texts update correctly |
| P1-08 | Update description stat and save | Floating stat block shows updated number/label |
| P1-09 | Upload `desc_image1` and `desc_image2` | Both description images update correctly |
| P1-10 | Update store address/hours/phone/email | Store section displays updated content |
| P1-11 | Update `store_embed_url` | Map iframe source updates successfully |
| P1-12 | Update `store_maps_url` | Get Directions link opens updated URL |
| P1-13 | Enter invalid URL in `store_maps_url` | API rejects with validation error; previous value remains |
| P1-14 | Manually delete one site_config key in DB | Frontend falls back to hardcoded default for that key |
| P1-15 | Break one image URL in DB | Frontend fallback image still renders without crashing |

### Phase 2: Categories Manager

| ID | Test | Expected Result |
|---|---|---|
| P2-01 | Migrate categories from `categories.json` | All expected rows created with correct `sort_order` |
| P2-02 | Open CMS Categories tab | Table loads active/non-deleted categories |
| P2-03 | Create new category with valid fields | Row appears in admin table and homepage categories |
| P2-04 | Create category with duplicate slug | API rejects with duplicate slug validation error |
| P2-05 | Create category with invalid slug characters | API rejects due to slug format rule |
| P2-06 | Edit category name/description/image | Admin table and homepage reflect updated values |
| P2-07 | Toggle `is_active` off | Category disappears from homepage but remains in admin |
| P2-08 | Toggle `is_active` on | Category reappears on homepage |
| P2-09 | Reorder via up/down controls | Homepage order matches new `sort_order` |
| P2-10 | Soft-delete category | Row hidden from admin list and homepage; DB row keeps `deleted_at` |
| P2-11 | Force Supabase read failure in Categories component | Fallback to `categories.json` works and UI still renders |

### Phase 3: Banner Manager

| ID | Test | Expected Result |
|---|---|---|
| P3-01 | Create banner with `start_date` tomorrow, active true | Admin status shows Scheduled; not visible on site |
| P3-02 | Set same banner `start_date` to today | Status switches to Active; visible in target placement |
| P3-03 | Set `end_date` to yesterday | Status shows Expired; banner hidden from site |
| P3-04 | Set `is_active` false on an active banner | Status shows Inactive; hidden from site immediately |
| P3-05 | Enter invalid `bg_color` (`#12G45Z`) | API validation error returned |
| P3-06 | Enter invalid `text_color` | API validation error returned |
| P3-07 | Set `end_date` earlier than `start_date` | API rejects with date-range validation error |
| P3-08 | Create banner for `announcement_bar` placement | Shows in offer/announcement area |
| P3-09 | Create banner for `shop_top` placement | Shows at top of shop page |
| P3-10 | Create popup banner and visit homepage | Popup appears once after delay |
| P3-11 | Close popup and refresh same tab | Popup does not reappear (sessionStorage gate) |
| P3-12 | Open homepage in new browser session | Popup appears again |
| P3-13 | Create two active banners in same placement with different priority | Higher priority banner renders first |
| P3-14 | Soft-delete active banner | Banner disappears from admin and frontend; DB row retained |

### API Validation & Security Tests

| ID | Test | Expected Result |
|---|---|---|
| API-01 | POST `/api/admin/cms/site-config` with empty `updates` | 400 response with clear error |
| API-02 | POST with required field empty | 400 response and no DB change |
| API-03 | POST with valid updates payload | 200 response and values persisted |
| API-04 | Multipart upload without `key` | 400 response |
| API-05 | Multipart upload without file | 400 response |
| API-06 | Multipart upload valid image | 200 response with public URL and DB upsert |

### Cache & Freshness Tests

| ID | Test | Expected Result |
|---|---|---|
| CACHE-01 | Save hero text and hard refresh homepage immediately | May still show previous value until cache expires |
| CACHE-02 | Wait up to 30 seconds and refresh | New value appears |
| CACHE-03 | Open admin CMS after frontend update | Admin shows latest persisted values (`no-store`) |

### Final Exit Criteria

| ID | Test | Expected Result |
|---|---|---|
| EXIT-01 | Run all Phase 1 tests | All pass |
| EXIT-02 | Run all Phase 2 tests | All pass |
| EXIT-03 | Run all Phase 3 tests | All pass |
| EXIT-04 | No console/build/type errors in changed CMS files | Clean diagnostics |
| EXIT-05 | Manual smoke test on mobile + desktop | Layout and interactions work on both breakpoints |

---

## Completion Summary

| Phase | Scope | Est. Time |
|---|---|---|
| Phase 1 | Hero + Description + Store text & images + seed SQL | ~3-4 hrs |
| Phase 2 | Categories CRUD + soft-delete + reorder + image upload | ~3-4 hrs |
| Phase 3 | Banner manager + scheduling (IST) + 4 placements + popup | ~4-5 hrs |
| **Total** | Full CMS | **~10-13 hrs** |
