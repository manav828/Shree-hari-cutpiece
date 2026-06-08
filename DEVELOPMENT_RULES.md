# Shree Hari AI & Developer Guidelines

> [!IMPORTANT]
> All developers and AI assistants MUST read this file in full before starting any new development task on this codebase.

---

## 1. Project Overview & Multi-Customer Architecture

This project is a multi-tenant ecommerce platform. To avoid maintaining complex client-specific code in a single codebase, we separate each customer into their own Git repository:
* **Core Upstream Repository**: Contains the base structure, default layout, database migrations, and default themes.
* **Customer Repositories**: Clones of the Core repository. When Core features are released, run `git pull upstream main` to apply upgrades.

---

## 2. Directory Layout & Custom Theme Override Engine

Theme files are divided into `/core/` (unmodified base theme) and `/changes/` (customer-specific custom overrides) under `src/themes/[theme_name]/`:

```
src/themes/[theme_name]/
├── core/                  <-- Base theme (read-only in customer repos)
│   ├── components/        
│   └── pages/             
└── changes/               <-- Customer-specific overrides (never touched by core merges)
```

### Theme Overrides Policy
* **Core files must remain clean**: Do NOT edit files inside the `core/` folder of a customer store.
* **How to override a file**:
  1. Copy the target file from `core/` (e.g. `core/components/shop/ProductGrid.tsx`) into the exact same relative subdirectory inside `changes/` (e.g. `changes/components/shop/ProductGrid.tsx`).
  2. Perform all edits in the `changes/` file.
* **Webpack Fallback Resolver**: A custom resolver plugin in `next.config.mjs` automatically routes imports. When a file is imported from `core/`, Webpack checks if a version exists in `changes/` and swaps it at compile time.
* **Imports Rule**: Keep imports using the clean folder path: e.g. `@/themes/classic/components/shop/ProductGrid` or relative `../components/...`. Do NOT append `/core/` or `/changes/` in your components' import statements.

### General Core & Admin Panel Overrides
You can also override generic core files located outside the `src/themes/` folder (such as admin pages in `src/app/admin/` or shared components in `src/components/admin/`):
* **How to override a core file**:
  1. Identify the file under `src/` (e.g., `src/app/admin/products/page.tsx`).
  2. Duplicate it into the active customer theme's changes folder maintaining the matching path structure:
     `src/themes/[active_theme]/changes/app/admin/products/page.tsx`
  3. Perform your custom modifications in the theme's changes file.
* **Resolution**: The Webpack resolver plugin intercepts the build and automatically serves this custom changes file instead of the core file. If the custom file is deleted, it seamlessly falls back to the original core version.
* **TypeScript Support**: TypeScript paths in `tsconfig.json` are configured to check theme `changes/` directories first, ensuring seamless code completion and type checking for all overrides.

---

## 3. Database Schema & Caching Reference

### Core Database Tables
* `products`: Stores product listings. Contains `id`, `name`, `slug`, `short_description`, `description`, `is_active`, `is_featured`, `is_new_arrival`, `sell_mode`.
* `product_variants`: Product options and prices. Contains `id`, `product_id`, `price`, `original_price`, `material_label`, `is_default`.
* `site_settings`: Global settings key-values (e.g. `storefront_cache_enabled` controls caching toggle).
* `cms_banners` & `cms_categories`: Custom visual content and category taxonomies.
* `_migrations_history`: Tracking applied SQL migration patches.

### Storefront Caching
* Cache is managed by Next.js `unstable_cache` with a 1-hour TTL.
* **Toggle state**: Controlled by `storefront_cache_enabled` in the `site_settings` table.
* **Busting cache**: When modifying items in the admin panel (creating products, updating settings), always fire `revalidateTag` for the corresponding tag:
  * Products -> `revalidateTag("products")`
  * Banners -> `revalidateTag("cms_banners")`
  * Categories -> `revalidateTag("cms_categories")`
  * Site Configuration -> `revalidateTag("site_config")`
  * Blogs -> `revalidateTag("blog_posts")`

---

## 4. Database Migrations & Patches Policy

When making database alterations, they MUST be versioned and committed:
* **Core Migrations** (`db/migrations/core/`): Shared database changes that all customer stores should receive (e.g. new global tables, new columns).
* **Custom Migrations** (`db/migrations/custom/`): Customer-specific custom schema alterations, loyalty table additions, custom integrations, etc.
* **Applying Patches**:
  * Run `node scripts/db-migrate.mjs` to check which files are missing from the `_migrations_history` table and apply them sequentially.
* **Generating Setup**:
  * Run `node scripts/customer-setup.mjs` on a clean customer setup to configure git remotes, prepare the `.env.local` file, and execute all schemas, migrations, and seeds in order.

---

## 5. AI System Memory (Graphy Integration)

To make context loading and task execution extremely fast in subsequent AI chat sessions:
* **Memory Tools**: Use MCP tools like `agent-memory-mcp` or create a knowledge index under `C:\Users\manav\.gemini\antigravity\knowledge\` (or `.gemini/antigravity/knowledge/`).
* **Concept Indexing (Graphy)**:
  * Store key architectural decisions (ADRs) as graph relationships: e.g. `(BohemianTheme) -[:HAS_OVERRIDE]-> (changes/pages/HomePage.tsx)`.
  * Store database connection details and active version details.
  * This graph-like semantic memory enables newly launched AI chat threads to query the graph database and immediately know:
    * Which files have been overridden for this customer.
    * Which migrations have been executed.
    * The database structure, avoiding time-consuming codebase re-exploration.

---

## 6. Storefront Design Systems, Themes & UI Rules

All pages and themes (Bohemian, Classic, Luxury) must follow strict UX and aesthetic principles to ensure a premium storefront feel.

### A. Theme-Specific Visual Identity
1. **Bohemian Theme (Earthy & Curated)**:
   - **Palette**: Warm terracotta/clay accents (`#9f3f29` or `#bf573f`), warm-beige and soft off-white backgrounds (`#fcf9f4` / `#f6f3ee` / `#f1f0ec`).
   - **Typography**: Editorial serif typography (`Newsreader`, `Playfair Display`) paired with clean sans-serif body fonts (`Manrope`, `Inter`).
2. **Classic Theme (Structured & Traditional)**:
   - **Palette**: Clean contrasts (deep blues, charcoal, dark slate text) on crisp off-white or clean white backdrops.
   - **Typography**: Standard clean traditional serifs paired with neutral web-safe sans-serif fonts.
3. **Luxury Theme (Refined & High-End)**:
   - **Palette**: Monochromatic charcoal/blacks paired with elegant gold/bronze accents and spacious layouts.
   - **Typography**: Clean, spacious sans-serif headings with high tracking (letter-spacing) and light weights.

### B. Page Loading & Shimmer Skeletons
1. **Global Route Transitions**: A top-viewport progress bar (`nextjs-toploader`) must animate on client-side route changes using the theme's primary accent color (e.g., `#9f3f29` for Bohemian).
2. **Product Grid (PLPs)**:
   - Text loaders must NEVER be used.
   - Skeletons must match the grid columns and card aspect ratios of the active theme (e.g., Bohemian uses rounded `aspect-[3/4]` cards; Classic uses sharp borders; Luxury uses thin borders).
   - Skeletons must disappear **instantly** when live data resolves (no artificial delays).
3. **Product Details (PDPs)**:
   - Display a layout-matched two-column skeleton: Gallery preview (left) and product details panel (right) during loading.
4. **Suggestions & Related Products Section**:
   - Must show only **one row** of products.
   - Additional products must scroll horizontally with a smooth snap scroll (`snap-x snap-mandatory` on container, `snap-start` on product articles/links).
   - Default scrollbars must be hidden completely using cross-browser styling: `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`.

### C. Async Action Buttons & Spinners
- Any button triggering a database or network request (Add to Cart, Buy Now, Login, Sign Up, Place Order/Pay) **must** display an inline loading spinner (e.g., rotating `Loader2` from `lucide-react` or native SVG animation) and be disabled (`disabled={isLoading}`) during the request to prevent duplicate actions.

### D. Image Optimization & Quality Controls
- **Large View Zoom Images**: Must load the original uploaded file with **0% quality loss** (no compression artifacts allowed on full-size product details).
- **Listing & Carousel Thumbnails**: Must use optimized 600px thumbnails (e.g., `_thumb` file suffix) for fast load speeds.
- **Legacy Image Safety**: Ensure a fallback resolver is in place so legacy uploads that don't have thumbnail assets continue to load their original files instead of breaking.

### E. Checkout & Auth Navigation
- **Guest Checkout Gate**: Show a "Login to Place Order" button instead of the payment button if the user is unauthenticated.
- **Auth Redirects**: Auth pages (Login, Register) must check for a `redirect` query parameter in the URL and route the user back to their original page (e.g., `/checkout`) after successful authentication.

