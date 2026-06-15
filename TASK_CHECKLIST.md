# 🛒 Shree Hari Ecommerce — Feature Task Checklist

> Last Updated: 2026-06-15
> Tracking all major feature implementations across the codebase.

---

## ✅ COMPLETED

### Admin Documentation Panel (11 Sections)
- [x] Update `docsData.ts` — 11 section objects for Handbook and Technical views
- [x] Update `documentation/page.tsx` — 11 cards with toggle and search
- [x] Update `SectionDetailPage.tsx` — refactored detail display
- [x] Update `docs/admin/admin_panel_complete_user_guide.md`
- [x] Build verified
- [x] Extraordinary In-Depth Documentation Overhaul — Enriched all 11 modules with schemas, endpoints, formulas, checklists, and screenshot placeholders.

### Cart Fixes & Upsell
- [x] Fix fractional meter bug in `CartContext.tsx` (delete threshold at `<= 0`)
- [x] Update CartSidebar — Bohemian theme (step 0.5m / 1pc, trash button)
- [x] Update CartSidebar — Classic theme
- [x] Update CartSidebar — Luxury theme
- [x] Update CartFullPage — Bohemian theme
- [x] Update CartFullPage — Classic theme
- [x] Update CartFullPage — Luxury theme
- [x] Create `src/hooks/useUpsellProducts.ts` (Supabase category-based upsell)
- [x] Integrate upsell hook into all 3 theme CartSidebars

### Admin Dashboard — Real Data
- [x] Extend `dashboardStats.ts` — Recent Orders (limit 8, joined with user profiles)
- [x] Extend `dashboardStats.ts` — Low Stock Variants (stock < 20, limit 10)
- [x] Update `admin/page.tsx` — display real Recent Orders table
- [x] Update `admin/page.tsx` — display real Low Stock Alerts table

### Shipping Provider Integration
- [x] Add Shipping nav item to `admin/layout.tsx`
- [x] Create `admin/shipping/page.tsx` — UI to configure provider + API keys
- [x] Create `src/lib/shipping/ShiprocketService.ts`
- [x] Create `src/lib/shipping/DelhiveryService.ts`
- [x] Create `src/lib/shipping/ShippingManager.ts`
- [x] Create `api/admin/shipping/route.ts`
- [x] Create `api/admin/shipping/test/route.ts`

### Fabric Calculator
- [x] Create `src/components/FabricCalculator.tsx` (garment presets, size modifiers, width selector)
- [x] Create `src/app/calculator/page.tsx` (dedicated calculator page)
- [x] Integrate calculator modal into Bohemian `ProductDetailClient.tsx`
- [x] Integrate calculator modal into Classic `ProductDetailClient.tsx`
- [x] Integrate calculator modal into Luxury `ProductDetailClient.tsx`

### Account Management
- [x] Implement soft account deletion in `/api/account/delete-request/route.ts`
- [x] Update `account/profile/page.tsx` — delete button + sign out flow

### Order Detail Enhancements
- [x] Create `src/utils/invoice/InvoiceGenerator.ts` (jsPDF invoice)
- [x] Add "Download Invoice" button on `account/orders/[id]/page.tsx`
- [x] Add copy-to-clipboard for tracking numbers
- [x] Add pulse status timeline animations

### Priority 1 — Secure Admin Authentication
- [x] Replace hardcoded `localStorage` login in `admin/login/page.tsx`
- [x] Implement Supabase server-side session check in `middleware.ts` for `/admin` routes
- [x] Add role-based access control (admin role check from `user_profiles` table)
- [x] Create `api/admin/auth/route.ts` for session validation
- [x] Test: unauthenticated users redirected to `/admin/login`
- [x] Test: non-admin users blocked from `/admin/*`

### Priority 2 — Analytics & Reports Dashboard
- [x] Create `api/admin/reports/route.ts` — aggregate revenue, orders, customers by date range
- [x] Add `recharts` or `chart.js` to `package.json`
- [x] Build `admin/reports/page.tsx` — Revenue Line Chart (daily/weekly/monthly)
- [x] Build Revenue by Category — Pie/Bar Chart
- [x] Build Top 10 Products by Sales — Table + Bar Chart
- [x] Build Customer Growth Chart (new signups over time)
- [x] Add CSV export button for reports
- [x] Test with real Supabase data

### Priority 3 — Abandoned Cart Recovery
- [x] Create `abandoned_carts` table in Supabase (user_id, cart_data JSON, last_seen, notified_at)
- [x] Create `api/cart/sync/route.ts` — save cart to DB on every cart change (debounced)
- [x] Update `CartContext.tsx` to call cart sync API on add/remove
- [x] Create `admin/abandoned-carts/page.tsx` — list users with abandoned carts
- [x] Add "Send Recovery Email" button → trigger email template via Supabase Edge Function
- [x] Add "Send WhatsApp Reminder" button → trigger WhatsApp API
- [x] Add "Mark as Recovered" status update
- [x] Test: cart is saved when user closes browser mid-checkout

### Priority 4 — COD & Shipping Fee Calculator at Checkout
- [x] Add state-wise COD availability check (configurable in admin shipping settings)
- [x] Add dynamic shipping fee calculation at checkout based on weight + state + provider
- [x] Show estimated delivery date at checkout
- [x] Add pincode serviceability check via Shiprocket/Delhivery API
- [x] Test: COD option hidden for non-COD states

---

## 🔲 IN PROGRESS / TODO

### Priority 5 — Multi-Theme Enhancements (New Sectors)
- [ ] Define sector requirements in `STITCH_THEME_RULES.md` for: Saree, Kurti, Home Decor, Ethnic Menswear
- [ ] Design + build **Saree Boutique** theme variant
- [ ] Design + build **Home Decor / Furnishings** theme variant
- [ ] Design + build **Ethnic Menswear** theme variant
- [ ] Test all themes on mobile

---

## 📋 Notes

- All subagent work (Cart, Admin, Calculator, Account) was dispatched via parallel agents on 2026-06-14.
- The implementation plan artifact is at: `C:\Users\manav\.gemini\antigravity\brain\4f8b61c1-1d27-418b-b441-7d16c1f81a81\implementation_plan.md`
- Architecture rules: see `DEVELOPMENT_RULES.md`
- Theme generation rules: see `STITCH_THEME_RULES.md`
