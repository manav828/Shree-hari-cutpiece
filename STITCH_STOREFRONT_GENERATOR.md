# Stitch Storefront Screen Generation Blueprint & Prompt Book

This document is a master guide for AI agents using the **Stitch MCP** toolset to generate high-converting, sector-specific e-commerce storefront designs. It provides the exact layout specifications and generation prompts for 5 different business sectors.

---

## 1. How to use this guide with Stitch MCP
When you need to design a new theme, select the target **Business Sector** below and execute the corresponding generation prompts page by page using:
```typescript
StitchMCP.generate_screen_from_text({
  projectName: "...",
  screenName: "...",
  prompt: "[Paste Prompt from this book]"
})
```

---

## 2. Business Sectors Customizations Mapping

| Business Sector | Key PDP Feature | Visual Vibe | Core Catalog Filter |
| :--- | :--- | :--- | :--- |
| **Fabrics & Textiles** | Fabric Calculator (Meters, Width modifier) | Earthy, organic, curated beige | Material type, Sell Mode (meters/pieces) |
| **Luxury & Jewelry** | High-Res Close-Up Zoom, certificate tabs | Clean dark/white, elegant serif | Material carat, gemstone color |
| **Electronics & Tech** | Detailed Tech Specs comparison list | High-tech dark mode, crisp borders | Brand, storage size, RAM configurations |
| **Furniture & Decor** | 3D Preview (AR) trigger, material swatches | Spacious layouts, high tracking sans | Dimensions, wood finish, room type |
| **Fashion Apparel** | Interactive Sizing Guide, colors swatch | Dynamic, visual grid, micro-interactions | Size, brand, seasonal fit |

---

## 3. Screen-by-Screen Stitch Prompts

### Screen 1: The Homepage (Landing Hub)

#### A. Fabrics & Textiles Sector
> **Stitch Prompt**: 
> "Generate a premium, earthy homepage for a boutique fabric store. Palette: warm terracotta accents, beige and off-white background. Editorial serif headings. Include: 1) A sticky navbar with a circular cart badge and search icon. 2) A large, contained hero slider showcasing organic linen textures, overlay copy 'Crafted by Nature', and a primary 'Shop Fabrics' button. 3) A horizontal scrolling list of CMS categories (Linen, Silk, Cotton, Velvet) styled as elegant rounded cards. 4) A Bento grid of featured collections showing fabric swatches. 5) An announcement popup with an email signup. Zero emojis."

#### B. Luxury & Jewelry Sector
> **Stitch Prompt**: 
> "Generate a sleek, high-end homepage for a luxury jewelry store. Palette: monochromatic charcoal background, crisp white text, and elegant gold borders. High tracking, light sans-serif headers. Include: 1) A thin, floating header navigation with a minimalist shopping bag icon. 2) A full-screen, immersive hero banner showcasing close-ups of diamond rings, overlay copy 'Timeless Brilliance'. 3) A clean grid of core categories (Rings, Necklaces, Bracelets) with micro-border hover lines. 4) A horizontal snap-scrolling 'Best Sellers' carousel displaying cards with clean pricing and gold badge tags."

#### C. Electronics & Tech Sector
> **Stitch Prompt**: 
> "Generate a futuristic, high-tech homepage for a consumer electronics store. Palette: charcoal slate background, glowing electric-blue accents, and thin neon-blue borders. Clean, technical sans-serif fonts. Include: 1) A wide search-centric navbar. 2) A bento-grid layout for featured tech launches (Smartphones, Audios, Wearables). 3) A hero slider showing wireless audio accessories with a 'Pre-Order Now' button. 4) A product comparison grid containing spec summary checklists. 5) A promo announcement banner for exchange campaigns."

#### D. Furniture & Decor Sector
> **Stitch Prompt**: 
> "Generate a spacious, minimalist homepage for a modern furniture design studio. Palette: soft sage green accents, warm oak tones, and clean white backgrounds. Airy vertical layout with generous white space. Include: 1) A transparent header nav that blends into the background. 2) A large hero banner showing a modern styled living room setup with a 'View Lookbook' button. 3) Category boxes for Living, Bedroom, and Dining. 4) An interactive 'Shop the Room' image block with clickable hotzones. 5) A footer displaying design warranty trust badges."

---

### Screen 2: Product Listing Page (PLP) (`/shop`)

#### A. Fabrics & Textiles Sector
> **Stitch Prompt**: 
> "Generate a shop catalog listing screen for fabrics. Responsive grid displaying aspect-3/4 fabric rolls. Sidebar filter panel on the left (Categories, Price slider, Color swatches, and Sell Mode: Meters vs Pieces). Display active tags at the top with clear 'x' buttons. Skeletons should be visible in loading states, matching card shapes. Editorial typography, terracotta colors."

#### B. Luxury & Jewelry Sector
> **Stitch Prompt**: 
> "Generate a shop catalog screen for jewelry. Spacious 3-column grid displaying high-resolution rings and earrings against a neutral grey backdrop. Sidebar filters: Carats, Gemstone, and Price range. Sorting selector: Price Low-to-High, relevance. Clean gold highlight tags on cards. Next.js route progress bar indicator in gold."

#### C. Electronics & Tech Sector
> **Stitch Prompt**: 
> "Generate a catalog listing screen for electronics. Bento grid card items. Sidebar filters: Brand, Storage capacity, and Screen size. Cards must display technical highlight specs (e.g. '5G', '120Hz', '256GB') directly on the card preview. Price discounts displayed with original crossed-out values."

#### D. Furniture & Decor Sector
> **Stitch Prompt**: 
> "Generate a furniture shop listing screen. Wide 2-column layout. Sidebar filters: Dimensions (height/width boundaries), Wood finish types (Oak, Walnut, Pine), and Room placement. Cards show dimensions details prominently and hover zoom overlays."

---

### Screen 3: Product Detail Page (PDP) (`/shop/[slug]`)

#### A. Fabrics & Textiles Sector
> **Stitch Prompt**: 
> "Generate a fabrics product detail page. Left column: Image gallery with a main 0% loss close-up linen view, variant thumbnails strip below. Right column: Title, category, price, variant swatches, and quantity selector. Include a prominent 'Calculate Fabric Need' button. It opens a modal with garment presets (Kurti, Salwar Suit) and size modifiers, rounding estimates up to 0.5m. Add a horizontal snap-scroll suggestions carousel below."

#### B. Luxury & Jewelry Sector
> **Stitch Prompt**: 
> "Generate a luxury jewelry detail page. Immersive left image gallery showing macro close-ups. Right panel: Minimalist gold text, price, color selector (Platinum, Yellow Gold, Rose Gold), and an disabled Add-to-Cart state if a variant is out-of-stock. Include accordion tabs for Diamond Certificate, Ring Sizing, and Premium Care Guide. Under-3-second load speed details."

#### C. Electronics & Tech Sector
> **Stitch Prompt**: 
> "Generate a technical electronics detail page. Top: Left carousel showcasing device angles; Right: Title, configuration selectors (128GB, 256GB, 512GB), and Add-to-Cart with dynamic loading spinner. Bottom: Collapsible full technical specifications sheet, compare features, and user reviews ratings list."

#### D. Furniture & Decor Sector
> **Stitch Prompt**: 
> "Generate a furniture detail page. Left: Main layout showing dimensions outline overlaid on a sofa. Right: Fabric material options (Velvet, Leather, Cotton), leg colors, and a 'View in 3D (AR)' trigger button. Add info cards for Shipping times and Assembly instructions."

---

### Screen 4: Cart & Checkout (`/cart`, `/checkout`)

#### A. All Sectors (Unified Checkout Framework)
> **Stitch Prompt**: 
> "Generate a unified checkout page layout. Left column: 1) Address form with a state dropdown containing all 36 Indian states and UTs. 2) Shipping partner selection cards (Delhivery, Shiprocket, Manual). 3) Payment selection (Credit Card, Netbanking, Cash on Delivery). Right column: Sticky order breakdown card displaying Subtotal, Shipping Fee, COD Surcharge (if COD selected), dynamic Taxes (GST Included or Add Extra), Razorpay COD Advance amount line (₹X advance, ₹Y remaining on delivery), and a Pay button showing safe lock icons."
