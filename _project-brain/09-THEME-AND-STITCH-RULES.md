# 09 — Theme System & Stitch Rules

All rules for storefront theme generation, multi-theme architecture, and the Stitch MCP design engine.

> Sources: `STITCH_THEME_RULES.md`, `STITCH_STOREFRONT_GENERATOR.md`, `docs/design/theme_development_rules.md`, `.github/copilot-instructions.md`

---

## 1. Single Admin, Multi Theme Architecture (NON-NEGOTIABLE)

- **One admin panel for ALL themes** — never create theme-specific admin panels
- **Theme differences allowed ONLY in storefront presentation** (layout, colors, fonts, animations)
- **Shared across all themes:**
  - Admin routes, forms, operational behavior
  - Product, order, customer, coupon, blog data models
  - Public route contract: `/`, `/shop`, `/shop/[slug]`, `/about`, `/contact`, `/blogs`
  - Core business logic (pricing, cart, checkout, inventory)
  - Shared APIs and permission model

### Forbidden Changes (never do these):
- ❌ Theme-specific admin panels
- ❌ Separate database schema per theme
- ❌ Duplicate core business logic in theme folders
- ❌ Direct DB writes from theme UI for critical settings
- ❌ Break existing admin flows for visual-only theme changes

---

## 2. Theme Code Boundaries

```
src/themes/<theme-id>/
├── core/         ← Base theme — READ ONLY
└── changes/      ← Customer overrides — ALL edits here

src/app/admin/    ← Admin ONLY — never theme-specific code
src/lib/          ← Shared logic — never fork per theme
src/context/      ← Shared context — never fork per theme
```

### Theme Registration
Every theme must:
1. Provide `HomePage`, `ShopPage`, `ProductPage` entries
2. Be registered in `src/themes/registry.ts`
3. Have active theme validation + safe default fallback

---

## 3. Decision Priority (When Tradeoffs Happen)
1. **Admin stability and shared data integrity** ← highest priority
2. Storefront uptime and safe fallback
3. Functional consistency across themes
4. Visual uniqueness and design enhancement ← lowest priority

---

## 4. Pre-Merge Checklist (Every Theme Change)
- [ ] `npm run lint` passes with zero errors
- [ ] Theme switching works for ALL registered themes
- [ ] Core storefront routes render correctly
- [ ] Admin flows unchanged: products, orders, customers, blogs, settings
- [ ] Auth and policy routes remain healthy
- [ ] No regression in existing admin behavior

---

## 5. Active Themes

### Bohemian (Active for Shree Hari)
- **Palette:** Terracotta `#9f3f29`, Sage Green `#5a6245`, Mustard `#785900`, Cream `#fcf9f4`
- **Fonts:** `Newsreader` (headings), `Manrope` (body)
- **Top loader color:** `#9f3f29`
- **Card shape:** `aspect-[3/4]` rounded
- **North Star:** "The Digital Curator" — editorial lookbook feel, not rigid e-commerce grid
- **No-Line Rule:** 1px solid borders prohibited for sectioning — use background color shifts instead
- **Glass Rule:** For CTAs/hero sections use subtle linear gradients; for modals use glassmorphism (80% opacity + 20px backdrop-blur)

### Classic Theme
- Deep blues, charcoal, crisp off-white backgrounds
- Standard clean serif + neutral sans-serif
- Sharp borders, structured layout

### Luxury Theme
- Monochromatic charcoal/black + gold/bronze accents
- Light, wide-tracked sans-serif headings
- Generous whitespace, high-end feel

---

## 6. Stitch MCP — Theme Generator

Stitch MCP is used to auto-generate storefront designs based on prompts.

### How to Use:
```typescript
StitchMCP.generate_screen_from_text({
  projectName: "ShreeHari",
  screenName: "HomePage",
  prompt: "[Sector-specific prompt from STITCH_STOREFRONT_GENERATOR.md]"
})
```

### 7 Required Screens Per Theme:
1. **Homepage** (`/`) — hero carousel, category cards, offer grids
2. **PLP** (`/shop`) — sidebar filters, sorting, shimmer skeletons
3. **PDP** (`/shop/[slug]`) — variant swatches, calculator, care tabs, suggestions
4. **Cart Drawer + Page** (`/cart`) — step increments, trash, upsell blocks
5. **Checkout** (`/checkout`) — payment breakdown, 36 states dropdown, COD advance
6. **Customer Portal** (`/account/*`) — order timelines, invoice downloads
7. **Blog Portal** (`/blogs` + `/blogs/[slug]`) — grid, sections, related products, social share

### Mandatory Backend Component Mapping:
| Page | Required Component | Backend Connection |
|------|-------------------|--------------------|
| Header | Cart Icon Badge | Local cart state |
| PLP | Sidebar Filter Panel | Categories, Price, Colors, Sell Mode |
| PDP | Color Swatch Circles | `product_variants` table |
| PDP | Fabric Calculator | Only when `sell_mode === "meter"` |
| PDP | Spinner Gated Buy Buttons | Async API loading states |
| Cart | Trash Icon + Step Increments | 0.5m (meters) or 1 unit (pieces) |
| Cart | Upsell Suggestions | `useUpsellProducts` hook |
| Checkout | 36 States Dropdown | `shipping_state_groups` |
| Checkout | COD Advance bar | Razorpay if `codAdvanceValue > 0` |
| Account | Download Invoice | `InvoiceGenerator` |

---

## 7. Sector Adaptation (When Building for Different Business Types)

| Sector | Aesthetic | Typography | Key Feature |
|--------|-----------|-----------|-------------|
| **Fabrics & Textiles** | Terracotta, beige, earthy | Playfair + Manrope | Fabric Calculator, meter swatches |
| **Jewelry & Luxury** | Dark/white, gold borders | Light wide-tracked sans | Full-screen zoom, certificate tabs |
| **Electronics & Tech** | Dark mode, electric blue | Space Grotesk / Inter | Spec comparison tables |
| **Furniture & Decor** | Olive, airy, natural wood | Plus Jakarta Sans | AR trigger, material swatches |
| **Fashion Apparel** | Dynamic image grids, bold | Syne / Cabinet Grotesk | Size swatch grid, sizing guide |

---

## 8. Storefront CRO & UI Rules (from ECOMMERCE_UI_UX_DESIGN_SKILL.md)

- **No emojis** in storefront — use SVG/Lucide icons only
- **Touch target minimum:** 44×44px for all clickable elements
- **Contrast ratio:** 4.5:1 minimum for body text
- **iOS Safe Area:** Sticky bottom bars must use `env(safe-area-inset-bottom)`
- **Images:** Lazy-load below fold, keep under 500KB for mobile, WebP format
- **Skeleton matching:** Must match exact height, width, border-radius of final card
- **Search overlay:** Group results by Categories + Products with autocomplete
- **Cart badge animation:** `scale-110` micro-animation when items added
- **Disabled state on all async buttons** — `disabled={isLoading}` + inline spinner

---

## 9. Design System Tokens (Storefront)

| Token | Value |
|-------|-------|
| Primary | `#9f3f29` (Terracotta) |
| Secondary | `#5a6245` (Sage) |
| Tertiary | `#785900` (Mustard) |
| Background | `#fcf9f4` (Warm Cream) |
| CTA Alt | `#CA8A04` (Gold) |
| Dark Text | `#1C1917` |
| Heading Font | Newsreader / Playfair Display |
| Body Font | Manrope / Montserrat |
