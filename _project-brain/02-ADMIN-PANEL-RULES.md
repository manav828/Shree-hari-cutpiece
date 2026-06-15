# 02 — Admin Panel Rules & Conventions

> ⚠️ CRITICAL: Any AI agent working on admin pages MUST follow these rules exactly.
> Do NOT deviate from the existing theme without explicit user approval.

---

## Admin Theme Design System

The admin panel uses a **clean white + gray** design. No dark modes. No glassmorphism. No custom color systems.

### Core Classes

| Element | Tailwind Classes |
|---------|----------------|
| Page wrapper | `space-y-6 max-w-6xl` |
| Page heading (h1) | `text-2xl font-playfair font-bold text-gray-900` |
| Subheading | `text-sm font-semibold text-gray-900` |
| Body text | `text-sm text-gray-600` |
| Small label | `text-xs text-gray-500` |
| Card / Panel | `rounded-lg border border-gray-200 bg-white shadow-sm p-6` |
| Primary button | `px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium` |
| Danger button | `bg-red-600 text-white` |
| Input field | Use `<Input>` from `@/components/admin/ui/Input` |
| Table | Use `<Table>` from `@/components/admin/ui/Table` |
| All borders | `border-gray-200` |
| Hover (cards) | `hover:shadow-md hover:border-gray-300` |
| Status badge (active) | Small green dot + text |
| Status badge (pending) | Small amber dot + text |

### NEVER do these in Admin:
- ❌ `bg-[#0a0a0f]` or any dark backgrounds
- ❌ `backdrop-blur`, `glassmorphism` effects
- ❌ Custom color systems or gradients on page backgrounds
- ❌ Raw `<input>` or `<table>` HTML — always use UI components

### ALWAYS do these in Admin:
- ✅ `font-playfair` on every page's `h1`
- ✅ `showToast()` from `@/lib/toast` for all user feedback
- ✅ Disable buttons + show spinner during async operations
- ✅ Format prices as `₹${value.toLocaleString("en-IN")}`

---

## Admin UI Components (use these, not raw HTML)

| Component | Import | Usage |
|-----------|--------|-------|
| `<Table>` | `@/components/admin/ui/Table` | All data tables |
| `<Input>` | `@/components/admin/ui/Input` | All form inputs |
| `<OrderStatusBadge>` | `@/components/admin/orders/OrderStatusBadge` | Order status display |
| `showToast(msg, type)` | `@/lib/toast` | All user notifications |

---

## All 12 Admin Modules

### 1. Dashboard — `/admin`
- Shows: Total Sales (paid orders only), Active Orders, Total Products, Total Customers
- Recent Orders table (last 8 orders)
- Low Stock Alerts — variants with stock < 20 units
- RLS Warning — if any Supabase table has RLS disabled
- Key file: `src/app/admin/page.tsx` (38KB)
- Server action: `src/app/actions/dashboardStats.ts`

### 2. Products — `/admin/products`
- List, create, edit products with full variant management
- Sub-pages: Categories (`/categories`), Stock (`/stock`), Reviews (`/reviews`)
- Key file: `src/app/admin/products/page.tsx` (28KB)

### 3. Orders — `/admin/orders`
- Order list with status/payment filters, search, date range
- Order detail with status updates, invoice download
- Order ID format: `SH-YYYYMMDD-XXXX`
- Status flow: `pending → processing → shipped → delivered`
- Payment status: `pending | paid | failed | refunded`

### 4. Abandoned Carts — `/admin/abandoned-carts`
- Tracks carts that were not converted to orders

### 5. Customers — `/admin/customers`
- Customer profiles, purchase history, LTV
- Soft delete — customers are deactivated, not hard deleted

### 6. Coupons — `/admin/coupons`
- Types: `percentage` or `fixed` discount
- Fields: `min_cart_subtotal`, `max_completed_orders_for_eligibility`
- Flags: `show_on_home_banner`, `show_on_checkout_modal`, `specific_user_only`
- Key PRD: `docs/coupons/coupon_discount_management_prd.md`

### 7. Content Management — `/admin/content`
- CMS: Hero banners, categories, popups, store info
- Blog builder with section-based editor
- Key PRD: `cms_prd.md`

### 8. Documentation — `/admin/documentation`
- Two modes: `Operations Handbook` and `Technical Deep Dive`
- 11 sections (one per major module)
- ALL content lives in: `src/app/admin/documentation/docsData.ts`
- Mode stored in localStorage key: `shreehari_docs_mode`
- Screenshot placeholders: steps with `[Screenshot Placeholder: ...]` render as a visual widget
- Design: follows standard admin theme (white + gray)

### 9. Reports — `/admin/reports`
- Single large file: `src/app/admin/reports/page.tsx` (81KB)
- Report types in sidebar submenu: Sales, Products, Customers, Inventory, Revenue
- ONE filter location only (not duplicated between chart and table)
- Chart component hidden if no data available

### 10. Payments — `/admin/payments`
- Razorpay payment records

### 11. Shipping — `/admin/shipping`
- Providers: Manual, Shiprocket, Delhivery
- State-based zone groups with custom charges
- Free shipping thresholds per zone

### 12. Settings — `/admin/settings`
- Store configuration, tax rules, COD settings, cache toggle
- `storefront_cache_enabled` in `site_settings` table controls Next.js cache

---

## Key Shared Files

| File | Purpose |
|------|---------|
| `src/app/admin/layout.tsx` | Admin sidebar + topbar — 20KB |
| `src/lib/toast.ts` | `showToast(message, type)` |
| `src/components/admin/ui/Table.tsx` | Shared table component |
| `src/components/admin/ui/Input.tsx` | Shared input component |
| `src/app/admin/documentation/docsData.ts` | All doc content — 43KB |
