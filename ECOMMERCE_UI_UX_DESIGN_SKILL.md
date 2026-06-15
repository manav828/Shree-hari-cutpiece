# E-commerce Storefront UI/UX Design & Conversion Optimization

An opinionated, high-performance design framework for e-commerce storefronts, combining years of User Experience (UX), User Interface (UI), and Conversion Rate Optimization (CRO) best practices.

---

## ⚡ When to Use

Use this skill when:
- Designing or developing e-commerce storefront components (PDP, PLP, Cart, Checkout, Header/Footer).
- Refactoring storefront layouts for better mobile usability or performance.
- Optimizing cart drawer mechanics, coupon forms, or payment validation screens.
- Resolving layout bugs or hydration problems on e-commerce catalog pages.

---

## 1. Global Navigation & Discoverability (Header/Footer)

### A. Announcement Bar
- **Purpose**: Highlight critical marketing campaigns (e.g. Free shipping above ₹1500) or operational notices.
- **UX Constraints**:
  - Keep text under 60 characters for mobile display without wrapping.
  - Make links easily clickable (minimum 44px height hit box).
  - Use contrast colors (e.g. dark banner on light header).

### B. Header Navigation
- **Sticky Behavior**: Header must remain sticky on desktop and mobile, or auto-hide on scroll down and reappear instantly on scroll up.
- **Search Overlay**: 
  - Clicking search must open a clean overlay with popular search keywords and history.
  - Implement instant autocomplete results. Group results by Categories and Products.
- **Cart Badge**: Display a circular badge with the items count in a high-contrast accent color (e.g., coral or red). The badge must scale up slightly (`scale-110`) when items are added to create a subtle micro-animation.
- **Accessibility**: Cart count changes and item additions must be announced to screen readers using `aria-live="polite"`.

---

## 2. Product Listing Page (PLP) & Filtering (`/shop`)

### A. Grid Architecture
- **Responsive Sizing**: 2 columns on mobile (to fit product details clearly side-by-side) and 4 columns on desktop.
- **Aspect Ratios**: Maintain consistent aspect ratios (e.g., `aspect-[3/4]` for apparel/fabrics or `aspect-square` for accessories) across all listing cards to prevent layout shifts.

### B. Filtering & Sorting (No-Friction Catalog)
- **Sidebar Filters**:
  - Group filters into collapsible accordions: Category, Price Range, Colors (swatches), and Stock Availability.
  - Active filters must be displayed as removable tags at the top of the grid.
- **Sorting**: Keep options clean (Price: Low to High, Price: High to Low, Best Sellers, Newest). Avoid overly complex sorting algorithms that confuse customers.

### C. Shimmer Skeletons (Core Web Vitals)
- **Anti-CLS (Cumulative Layout Shift)**: Never display loading screens or blank spaces while products load.
- **Skeleton Matching**: Skeletons must exactly match the height, width, border-radius, and text lines of the final cards.

---

## 3. Product Detail Page (PDP) (`/shop/[slug]`)

The PDP is the primary conversion page on the website. It must follow these strict guidelines:

### A. Image Gallery & Zoom
- **Main View**: Double-tap on mobile or hover on desktop must zoom the image with **0% quality loss** (use high-resolution source images, avoiding low-res thumbnails).
- **Mobile Swipes**: Implement touch swiping with snap scroll indicator dots.

### B. Quantity & Variant Selection
- **Color Swatches**: Render colors as physical circles with a ring outline when selected. If a color variant is sold out, cross it out diagonally (`relative after:absolute after:inset-0 after:border-t after:border-slate-300 after:-rotate-45`).
- **Dynamic Increments**:
  - **Meters (Fabrics)**: Enforce steps of **0.5m** with a minimum of 0.5m. Prevent users from manually inputting fractional values like 1.2m or 2.7m (unless explicitly supported by custom cuts rules).
  - **Pieces (Apparel/Goods)**: Enforce steps of **1 unit** with a minimum of 1 unit.
- **Fabric Calculator**: For products sold in meters, include a visible "Calculate Fabric Need" button. It must offer presets based on standard clothing styles (e.g. Kurti, Shirt) and size selectors, rounding estimates up to the nearest 0.5m to ensure the customer purchases enough material.

### C. Action Gating (Add to Cart / Buy Now)
- **Disabled State**: Disable buttons instantly when clicked and show an inline loading spinner.
- **Cart Confirmation**: Trigger a slide-out cart drawer automatically upon adding an item so the customer immediately sees their checkout progress.

### D. Related Products Snap Carousel
- Suggestions must scroll horizontally with a smooth snap layout (`snap-x snap-mandatory`). Scrollbars must be hidden completely using:
  ```css
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  ```

---

## 4. Cart Drawer & Full Cart Experience (`/cart`)

- **Cart Drawer**: Opening the cart must dim the background using a smooth overlay.
- **Removal Governance**: 
  - Standard quantity selectors must disable the minus button when quantity is at its minimum limit (0.5m or 1 unit).
  - Include an explicit **Trash Icon** next to each item so users can remove items easily.
- **Cross-Sell Widgets**: Suggest items from the same category as the items in the cart (using a `useUpsellProducts` query). Show a simple "Add" button displaying loading feedback.

---

## 5. Checkout Optimization & Gateways (`/checkout`)

- **Guest Checkout**: Allow checkout as a guest. Do not force account registration before purchase.
- **Indian State Forms**: Dropdowns for addresses must include all 36 States and Union Territories of India.
- **Razorpay COD Advance Payments**:
  - On COD select, check if the admin settings require an online advance payment (percentage or flat fee) to secure the delivery.
  - If required, render the Razorpay gateway to collect the partial advance. Explain to the user: *"Secure this COD order by paying an advance of ₹X. The remaining balance (₹Y) will be paid in cash upon delivery."*
  - Confirm and create the database order with payment status `advance_paid` only after Razorpay webhook verifies signature.

---

## 6. Performance, Mobile Offsets & Typography Rules

- **iOS Safe Area Offsets**: Any sticky bottom container or purchase button (such as floating mobile "Add to Cart" bars) must utilize `env(safe-area-inset-bottom)` to prevent being cut off by the iOS home indicator swipe bar.
  ```css
  .sticky-bottom-bar {
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  }
  ```
- **Image Optimization**: All images must load lazily when below the fold (`loading="lazy"`). Keep visual assets under 500KB for mobile.
- **Emojis Restriction**: **NEVER** use emojis inside the customer-facing storefront UI. Emojis appear unprofessional in premium storefronts and introduce text-to-speech accessibility issues for screen readers. Use SVG icons instead.
- **Touch Target Size**: All touch targets must be at least **44x44 pixels** on mobile.
- **Contrast Ratios**: Body text must maintain a contrast ratio of at least **4.5:1** against backgrounds.

---

## 7. Backend Integration & Verification Workflow

AI assistants must follow this exact workflow before calling API SDKs (e.g. Medusa client, Razorpay SDK, custom REST controllers):
1. **PAUSE**: Stop before typing out API functions.
2. **QUERY**: Read official docs or query workspace files for exact SDK method signatures.
3. **VERIFY**: Show the verified method signature in the chat context.
4. **WRITE**: Implement using correct parameters (e.g., ensure prices are handled correctly: Medusa uses cents/units, Razorpay uses paise/smallest denomination).
5. **CHECK**: Run TypeScript checks to verify zero type mismatches on the SDK calls.
