# Shree Hari Theme Generator Rules (Stitch UI Engine)

This rulebook is the master specification for AI agents. When a user requests a new storefront theme for a specific **Business Sector** or **Business Name**, the AI agent must read this file to automatically determine:
1. **Core Screen Matrix**: Which pages must be designed.
2. **Mandatory Backend Mappings**: Which components must be present to connect to the Shree Hari admin panel.
3. **Sector Adaptation Schema**: How to dynamically style the typography, color system, and layout blocks for the selected business.

*You do not need to explain how to design each page. The AI agent will read this file and generate the correct Stitch configurations automatically.*

---

## 1. Standard Storefront Screen Matrix
Every theme must consist of these 7 core screens:
1. **Homepage** (`/`): Landing layout with hero carousel, category cards, offer grids.
2. **Product Listing Page (PLP)** (`/shop`): Product catalog with sidebar filters, sorting, and skeletons.
3. **Product Detail Page (PDP)** (`/shop/[slug]`): Single product page with variant swatches, calculator triggers, care tabs, and horizontal suggestion rows.
4. **Cart Drawer & Page** (`/cart`): Cart panel with custom increment controls, trash removal buttons, and category-matching upsell blocks.
5. **Checkout Page** (`/checkout`): Dynamic payment breakdown (subtotal, shipping, COD surcharge, tax modes, Razorpay COD advances) and 36 Indian states dropdown.
6. **Customer Portal** (`/account/*`): Login redirect gates, order timelines, clipboard tracking copies, and PDF invoice downloads.
7. **Blog Portal** (`/blogs` & `/blogs/[slug]`): Blog posts grid, section visual rendering blocks, related products, and social share anchors.

---

## 2. Mandatory Backend Component Mapping (Shree Hari Panel)
The AI agent must automatically include these widgets on each page to avoid breaking the admin backend connections:

| Page | Required Component | Linked Admin Backend Feature |
| :--- | :--- | :--- |
| **Header** | **Cart Icon Badge** | Reads active Cart items length from local state. |
| **PLP** | **Sidebar Filter Panel** | Reads Categories, Price range, Color swatches, and Sell Mode (meters/pieces). |
| **PDP** | **Color Swatch Circles** | Reads color name, price, original_price, and stock from `product_variants`. |
| **PDP** | **GARMENT Presets Calculator** | Reads if `sell_mode === "meter"` to render "Calculate Fabric Need" modal. |
| **PDP** | **Spinner Gated Buy Buttons** | Connects to async API loading states (prevents duplicate orders). |
| **Cart** | **Trash Icon + Step Increments** | Steps of 0.5m for Meters or 1 unit for Pieces. Trash icon deletes rows. |
| **Cart** | **Upsell Suggestions** | Invokes hook querying featured items in the same categories. |
| **Checkout** | **36 States Dropdown** | Used to calculate shipping fees matching `shipping_state_groups` JSON. |
| **Checkout** | **COD Advance payment bar** | Initialise Razorpay orders if `codAdvanceValue` setting > 0. |
| **Checkout** | **Taxes Mode breakdown** | Adjusts total depending on Mode: `included` vs `add_extra` vs `none`. |
| **Account** | **Download Invoice Button** | Connects client-side to `InvoiceGenerator` compilation. |

---

## 3. Sector Adaptation Schema (Dynamic Styling)

When the user specifies a sector, the AI agent will automatically select the styling variables below to feed into the Stitch UI engine:

### A. Sector: Fabrics, Textiles & Home Furnishings
- **Aesthetic**: Warm terracotta accents, beige/cream backgrounds, soft borders.
- **Typography**: Editorial serif headers (e.g. *Playfair Display*), clean sans body (e.g. *Manrope*).
- **Core Widgets**: Fabric calculator triggers prominently displayed under the price; color swatches show physical textile textures.

### B. Sector: Jewelry, Watches & Luxury Goods
- **Aesthetic**: Monochromatic slate/charcoal backgrounds, thin gold/bronze divider borders, generous layout spacing.
- **Typography**: Light, wide-tracked sans-serif headers (e.g. *Outfit*), serif product descriptions.
- **Core Widgets**: Full-screen zoom galleries; detail accordions for "Certificate of Authenticity" and "Luxe Gift Wrapping".

### C. Sector: Electronics, Gadgets & Smart Home
- **Aesthetic**: Dark-mode grids, electric blue/teal accents, sharp borders, clean technical boxes.
- **Typography**: Crisp, tech-oriented sans-serif (e.g. *Space Grotesk* or *Inter*).
- **Core Widgets**: Technical specifications comparison tables; storage size tabs; "Add Extended Warranty" checkboxes.

### D. Sector: Furniture, Home Decor & Architecture
- **Aesthetic**: Natural wood hues, soft olive green accents, airy layouts, clean margins.
- **Typography**: Spacious sans-serif titles (e.g. *Plus Jakarta Sans*).
- **Core Widgets**: "View in 3D (AR)" triggers; material swatches (Oak, Walnut, Velvet, Bouclé); dimensions sketch overlays.

### E. Sector: Fashion Apparel & Footwear
- **Aesthetic**: Dynamic image-first grids, bold color blocks, active hover transformations.
- **Typography**: Bold, modern sans-serif (e.g. *Syne* or *Cabinet Grotesk*).
- **Core Widgets**: Size swatches grid (XS, S, M, L, XL); interactive "Find Your Fit" sizing chart; color variant image filters.

---

## 4. Automatic Agent Output to Stitch
When the user asks to generate a theme (e.g., *"Make a luxury watch store theme"*), the AI agent will automatically compile the design system and call Stitch MCP without asking for layout definitions:

```json
{
  "colors": {
    "primary": "#121212",
    "accent": "#d4af37",
    "background": "#fdfdfd"
  },
  "typography": {
    "headings": "Playfair Display",
    "body": "Inter"
  },
  "requiredComponents": [
    "Minimalist header",
    "Diamond/Watch detail zoom gallery",
    "Gold swatch border selector",
    "Secure Checkout payment breakdown card",
    "PDF invoice download anchor"
  ]
}
```
