# Shree Hari Storefront - Theme Design & Component Rules

This guide defines the mandatory user interface (UI) components, user experience (UX) interactions, and design systems that **every storefront theme** must implement. It serves as a master checklist for building new themes to prevent missing crucial features.

---

## 1. Global Layout & Shell Components

Every theme must include these layout containers in its shell:
- [ ] **Announcement Bar**: Displays active announcements (configured via CMS) at the very top.
- [ ] **Header Navigation**:
  - [ ] Sticky header on scroll down/up.
  - [ ] Hamburger menu on mobile.
  - [ ] Search input triggering a full overlay search bar.
  - [ ] Cart icon button showing the active items count badge (e.g. `2`).
  - [ ] Profile account icon linking to `/login` or `/account/profile`.
- [ ] **Next.js Top Loader**: An animating route progress bar (`nextjs-toploader`) that matches the theme's accent color (e.g. terracotta for Bohemian).
- [ ] **Footer**:
  - [ ] Brand description and store info blocks.
  - [ ] Navigation columns (Shop, Blog, About Us, Contact Us).
  - [ ] Policy links (Privacy Policy, Returns, Shipping, Terms of Service).
  - [ ] Payment gateway logos (Razorpay, Cards, Netbanking).
- [ ] **Popup Banner Gate**: A slide-in, center modal, or popup triggered on home load (with a "Don't show again" cookie/localStorage check).

---

## 2. Home Page (`/`)

The homepage must implement these CMS-bound sections:
- [ ] **Hero Banner Carousel**:
  - [ ] Supports both `Contained` and `Full Width` layouts (read from `hero_banner_layout` site settings).
  - [ ] Priority-ordered slides transition.
  - [ ] Slide animation (fade or slide) with swipe support on mobile.
- [ ] **CMS Category Cards**:
  - [ ] Horizontal scroll/flex row showing category thumbnails and links.
  - [ ] Hover zoom/opacity effects.
- [ ] **Featured/New Arrival Grids**:
  - [ ] Section with tab filters (e.g., "New Arrivals", "Best Sellers").
  - [ ] Responsive grid: 2 columns on mobile, 4 columns on desktop.
- [ ] **Promo Offer Banners**:
  - [ ] Secondary CMS advertisement rows (offer banners) placed between product grids.

---

## 3. Product Listing Page (PLP) & Catalog (`/shop`)

- [ ] **Header Catalog Info**: Displays category name, description, and total items found count.
- [ ] **Sidebar Filter Panel** (Collapsible on mobile):
  - [ ] Filter by Categories (checkboxes).
  - [ ] Filter by Price range (min/max range slider).
  - [ ] Filter by Colors/Variants (swatch circles).
  - [ ] Filter by Sell Mode (Meters vs Pieces).
  - [ ] Active filters indicators with individual "x" removal buttons and a "Clear All" link.
- [ ] **Sorting Dropdown**: Options to sort by Price (Low to High / High to Low), Popularity, and Date Added.
- [ ] **Shimmer Loading Skeletons**:
  - [ ] Layout-matched cards skeletons representing loading states (not simple text loaders).
  - [ ] Aspect ratios of skeletons must match the theme's image dimensions (e.g., `aspect-[3/4]` for Bohemian).
  - [ ] Skeletons must fade out instantly when product data resolves.

---

## 4. Product Detail Page (PDP) (`/shop/[slug]`)

- [ ] **Breadcrumbs**: Home -> Shop -> Category -> Product Name.
- [ ] **Product Gallery**:
  - [ ] Main image viewer with **0% quality loss zoom** (no compression artifacts allowed on zoom).
  - [ ] Thumbnail selector strip supporting swiping on mobile.
  - [ ] Variant-specific image filtering (when clicking a color, update main gallery to that variant's images).
- [ ] **Variant Selector Panel**:
  - [ ] Swatch buttons displaying active colors.
  - [ ] Disabled states for out-of-stock color combinations.
- [ ] **Quantity Selector**:
  - [ ] Increment/decrement controls.
  - [ ] Enforce **0.5m increments** for products sold in Meters (e.g., 1.5m -> 2.0m -> 2.5m).
  - [ ] Enforce **1.0 unit increments** for products sold in Pieces.
- [ ] **Garment Presets / Fabric Calculator Trigger**:
  - [ ] Displays a "Calculate Fabric Need" button *only* when product `sell_mode` is `meter`.
  - [ ] Opens the modal containing presets (Kurti, Shirt, Salwar) and modifiers.
  - [ ] Rounds estimates to the nearest **0.5m** and updates PDP quantity on click.
- [ ] **Information Accordions**: Expandable details for Product Info, Care Guide, Fabric Details, FAQs.
- [ ] **Async Buttons**: "Add to Cart" and "Buy Now" buttons must show inline loading spinners (e.g. `Loader2`) and be disabled during network requests.
- [ ] **Suggestions Row ("You May Also Like")**:
  - [ ] Horizontal snap scrolling row (`snap-x snap-mandatory` on container, `snap-start` on cards).
  - [ ] Scrollbars hidden using CSS classes: `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`.

---

## 5. Cart Experience & Drawer (`/cart`)

- [ ] **Cart Side-Drawer**: Slide-out panel that opens automatically upon adding an item.
- [ ] **Cart Quantity Controls**:
  - [ ] Increase/decrease items matching step increments (0.5m for meter products, 1 unit for piece products).
  - [ ] Deactivate minus button at minimum threshold (0.5m or 1 piece).
  - [ ] Trash icon button to explicitly delete items from the cart.
- [ ] **Real-time upsell Widget**:
  - [ ] Displays suggestions in the same category as items in the cart (using `useUpsellProducts` hook).
  - [ ] One-click "Add" button with loading state.
- [ ] **Full Cart Page (`/cart`)**: Provides detailed tables, subtotals, checkout action links, and coupon summaries.

---

## 6. Checkout Pipeline (`/checkout`)

- [ ] **Guest Checkout Gate**: Displays a "Login to Place Order" banner or redirects to login if user session is absent.
- [ ] **Address Forms**:
  - [ ] State dropdown containing all 36 Indian States and Union Territories.
  - [ ] Inputs validation (zip code length, phone numbers format).
- [ ] **Dynamic Calculation Panel**:
  - [ ] Fetches rates via `/api/checkout/shipping-rates` on state or payment method change.
  - [ ] Displays breakdown: Subtotal, Shipping Fee (respecting state zones and free thresholds), COD Surcharges (if COD), and Taxes (None, Add Extra, or Included).
- [ ] **Razorpay COD Advance Payment**:
  - [ ] If Settings specify a COD advance amount (percentage or flat fee), checkout must load the Razorpay script.
  - [ ] The "Place Order" button changes to "Pay COD Advance (₹X)".
  - [ ] Launches Razorpay modal for the partial advance. On successful validation, completes checkout.

---

## 7. Customer Portal & Accounts (`/account`)

- [ ] **Login & Register**: Includes URL redirection logic to return to `/checkout` or the originating page after authentication.
- [ ] **Profile Page**: Displays settings and includes a "Request Account Deletion" button.
- [ ] **Address Book**: Displays cards to Add, Edit, Delete, or Set default shipping/billing details.
- [ ] **Order Detail View**:
  - [ ] Status timeline animation with active steps.
  - [ ] Tracking link (copy to clipboard button).
  - [ ] **Download Invoice** button.

---

## 8. Blog & Search (`/blogs`)

- [ ] **Blog Grid**: Displays articles with publication date, author name, and cover thumbnails.
- [ ] **Article Detail**:
  - [ ] Visual sections rendering (builder layout).
  - [ ] Related products section at the bottom.
  - [ ] Social share buttons (WhatsApp, Facebook, Copy Link).

---

## 9. Modern UI/UX Best Practices & Performance Standards

Every theme must implement the following performance and design standards:
- [ ] **Mobile-First Touch Targets**:
  - [ ] All clickable items (buttons, links, swatches) must have a minimum touch target size of **44x44 pixels** to ensure thumb-friendly mobile navigation.
  - [ ] Sufficient spacing between adjacent buttons to prevent accidental clicks.
- [ ] **Speed & Performance Gating**:
  - [ ] Page load times must target **under 3 seconds** on standard mobile networks.
  - [ ] Image assets in the first viewport (hero sliders, logo) must be optimized (e.g. WebP format with next/image responsive sizing) and set to high priority loading to minimize Cumulative Layout Shift (CLS).
- [ ] **Bento Grid Modular Layouts**:
  - [ ] Use modular, grid-based card alignments (Bento grids) for home content blocks or promotion banners to allow users to scan info quickly.
- [ ] **Green UX Dark/Charcoal Mode support**:
  - [ ] Storefront themes must degrade gracefully with high contrast ratios (minimum 4.5:1 for body copy).
  - [ ] Background dark theme modes must utilize soft off-black/charcoal hues (rather than pure `#000000`) to prevent eye fatigue.
- [ ] **Inclusive Accessibility (WCAG 2.1)**:
  - [ ] Ensure all input fields have visible label boundaries.
  - [ ] Alt text must be bound to all visual templates, category cards, and product thumbnails to support screen-readers.

