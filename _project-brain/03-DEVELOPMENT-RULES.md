# 03 — Development Rules

> Source: `DEVELOPMENT_RULES.md` (root) — consolidated here for the brain folder.
> MUST READ before any development task.

---

## 1. Multi-Tenant Architecture

This is a **multi-tenant platform**:
- **Core Upstream Repo** → base structure, migrations, default themes
- **Customer Repos** → clones of Core. Update with `git pull upstream main`
- Shree Hari is a **customer repo**

---

## 2. Theme Override Engine (CRITICAL)

Storefront theme files split into two folders:

```
src/themes/[theme_name]/
├── core/       ← Base theme — READ ONLY, never edit directly
└── changes/    ← Customer overrides — ALL edits go here
```

### Rules:
- **Never edit `core/` files** in a customer repo
- To override: copy the file from `core/` → same path in `changes/` → edit there
- **Webpack resolver** auto-swaps `changes/` version over `core/` at compile time
- **Imports stay clean**: use `@/themes/classic/components/...` — never import with `/core/` or `/changes/` suffix

### Admin Panel Overrides (same pattern):
- Override `src/app/admin/products/page.tsx` → copy to `src/themes/[theme]/changes/app/admin/products/page.tsx`
- Webpack resolver picks it up automatically

---

## 3. Caching Rules

- Cache managed by Next.js `unstable_cache`, 1-hour TTL
- Toggle: `storefront_cache_enabled` in `site_settings` table
- **Always fire `revalidateTag` after admin mutations:**

| Data Changed | Tag to Revalidate |
|-------------|------------------|
| Products | `revalidateTag("products")` |
| Banners | `revalidateTag("cms_banners")` |
| Categories | `revalidateTag("cms_categories")` |
| Site Config | `revalidateTag("site_config")` |
| Blogs | `revalidateTag("blog_posts")` |

---

## 4. Database Migrations Policy

- **Core migrations**: `db/migrations/core/` — shared across all customers
- **Custom migrations**: `db/migrations/custom/` — customer-specific
- Apply: `node scripts/db-migrate.mjs`
- New customer setup: `node scripts/customer-setup.mjs`
- All migrations tracked in `_migrations_history` table

---

## 5. Async Button Rules

Any button that triggers a DB or network request **MUST**:
- Show inline loading spinner (`Loader2` from lucide-react)
- Be `disabled={isLoading}` during the request
- Use `showToast()` for success/error feedback

Applies to: Add to Cart, Buy Now, Login, Register, Place Order, Save Settings, etc.

---

## 6. Image Rules

- **Full-size zoom images**: 0% quality loss (no compression on product details)
- **Listing thumbnails**: Use `_thumb` suffix optimized at 600px
- **Legacy fallback**: If `_thumb` version doesn't exist, fall back to original
- **Format**: WebP preferred, next/image for all storefront images
- **Priority loading**: Hero images must use `priority` prop

---

## 7. CMS Module Specifics

- **Timezone**: All date comparisons in IST (`Asia/Kolkata`, UTC+5:30)
- **Publish mode**: Instant — save = live (no draft/publish workflow)
- **Popup frequency**: Once per browser session via `sessionStorage`
- **Image filenames**: Versioned with timestamp suffix (e.g. `hero-desktop-1742312849.jpg`)
- **Dirty-state guard**: Yellow warning bar if admin navigates away with unsaved changes
- **Tables**: `site_config` (key-value), `banners`, `categories`
- **Storage bucket**: `cms-assets/` (sub: `hero/`, `description/`, `categories/`, `banners/`)

---

## 8. Authentication

- Admin auth: `shreehari_admin_auth` localStorage key (checked in `layout.tsx`)
- Storefront auth: Supabase Auth (email/password)
- Guest checkout gate: Show "Login to Place Order" if user not authenticated
- Auth redirects: Login/Register pages respect `?redirect=` query param
