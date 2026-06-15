# 04 — Storefront Design Rules

> Source: `docs/design/theme_design_rules.md` + `DEVELOPMENT_RULES.md`
> These are mandatory requirements every storefront theme must implement.

---

## Active Theme

**Bohemian Theme** (earthy & curated) is the primary active theme for Shree Hari.

### Bohemian Visual Identity
- **Primary accent**: Terracotta/clay `#9f3f29` or `#bf573f`
- **Backgrounds**: Warm beige `#fcf9f4` / `#f6f3ee` / `#f1f0ec`
- **Typography**: `Newsreader` or `Playfair Display` (editorial serif) + `Manrope`/`Inter` (body)
- **Top Loader**: `nextjs-toploader` in `#9f3f29` accent color
- **Card shape**: `aspect-[3/4]` rounded cards

---

## 1. Global Layout (Every Theme)

- **Announcement Bar** — CMS-driven text at very top
- **Sticky Header** — scrolls up/down, hamburger mobile, search overlay, cart badge, profile icon
- **Footer** — brand info, nav columns, policy links, payment logos (Razorpay)
- **Popup Banner** — slide-in or modal on home load (sessionStorage "don't show again")

---

## 2. Home Page (`/`)

- **Hero Banner Carousel**: Supports `Contained` and `Full Width` layouts (from `hero_banner_layout` setting)
- **Category Cards**: Horizontal scroll with hover zoom
- **Featured / New Arrivals Grid**: Tab filters, 2 cols mobile / 4 cols desktop
- **Promo Offer Banners**: CMS ad rows between product grids

---

## 3. Product Listing Page (PLP) — `/shop`

- **Sidebar Filter Panel**: Categories (checkboxes), Price range, Colors (swatches), Sell Mode
- **Active filter chips**: Individual `×` remove + "Clear All"
- **Sorting**: Price Low-High, Price High-Low, Popularity, Date Added
- **Shimmer Skeletons**: Layout-matched, aspect ratios matching theme, fade instantly on data load

---

## 4. Product Detail Page (PDP) — `/shop/[slug]`

- **Breadcrumbs**: Home → Shop → Category → Product
- **Gallery**: 0% quality loss zoom, thumbnail strip, variant-specific image filtering
- **Variant Selector**: Color swatches, disabled state for out-of-stock
- **Quantity Selector**:
  - `0.5m` increments for **Meters** products
  - `1 unit` increments for **Pieces** products
- **Fabric Calculator Button**: Shows ONLY for `sell_mode = meter` products
- **Suggestions Row**: `snap-x snap-mandatory` horizontal scroll, scrollbars hidden:
  ```css
  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
  ```
- **Information Accordions**: Product Info, Care Guide, Fabric Details, FAQs
- **Async Buttons**: `Loader2` spinner + `disabled={isLoading}` on Add to Cart / Buy Now

---

## 5. Cart — `/cart`

- **Side Drawer**: Auto-opens on add to cart
- **Quantity Controls**: 0.5m steps (meters), 1 unit steps (pieces), trash icon to delete
- **Upsell Widget**: Same-category suggestions via `useUpsellProducts` hook, one-click add
- **Full Cart Page**: Table layout, subtotals, coupon summary, checkout link

---

## 6. Checkout — `/checkout`

- **Guest Gate**: "Login to Place Order" if unauthenticated
- **Address Form**: All 36 Indian States + Union Territories dropdown
- **Dynamic Calculation**: Fetches `/api/checkout/shipping-rates` on state/payment method change
- **COD Advance**: If settings have COD advance (% or flat), loads Razorpay for partial advance payment before placing order

---

## 7. Customer Portal — `/account`

- **Login/Register**: `?redirect=` param returns user to originating page after auth
- **Profile**: Settings + "Request Account Deletion" button
- **Address Book**: Add, Edit, Delete, Set Default
- **Order Detail**: Status timeline animation, tracking link (copy button), **Download Invoice**

---

## 8. Blog — `/blogs`

- Grid with article date, author, cover thumbnail
- Article detail: Visual section builder, related products, social share (WhatsApp, Facebook, Copy Link)

---

## 9. Performance Standards

- Page load target: **< 3 seconds** on standard mobile
- Hero images: WebP + `priority` prop on next/image
- Min touch target: **44×44 px** for all clickable elements
- Contrast ratio: **minimum 4.5:1** for body copy
- Bento grid layouts for home content blocks
