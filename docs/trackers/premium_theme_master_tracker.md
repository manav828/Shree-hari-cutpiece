# Premium Theme Master Tracker (Shree Hari)

Last updated: 2026-04-18
Primary PRD: docs/design/shree_hari_premium_theme_prd.md
Asset source log: docs/design/premium_theme_asset_source_log.md
Baseline backup branch: backup/premium-theme-baseline-20260330

## Hard Rules (Owner Mandate)
- [x] Keep admin panel behavior as-is.
- [x] Only CMS-related schema/content controls may be changed where needed.
- [x] Use realistic temporary internet images and realistic copy.
- [x] Avoid fake/demo/test/AI-looking content in production-ready theme.
- [x] Temporary images will be replaced by actual product images only after theme approval.

## Status Legend
- [x] Done
- [~] In Progress
- [ ] Pending
- [!] Blocked

## Quick Status Snapshot (2026-04-12)
- Implementation work for premium storefront shared layer, SEO/schema, accessibility, tracking, and lint baseline is complete.
- Automated verification pass is complete for route health, SEO metadata/schema/sitemap checks, storefront authenticity scan, breakpoint visual QA screenshots, and runtime analytics event validation.
- Asset program governance is complete for temporary rollout (source log, rights notes, replacement map, dry/apply tooling).
- Remaining open work is limited to one in-progress technical target (mobile CWV closure for home route; current Lighthouse mobile baseline LCP ~3.3s, TBT ~643ms) plus post-launch optimization and final business-owner permanent asset approval.
- Customer reference lock is complete for All About Bohemian; verified brand and merchandising cues are now tracked under M12 for implementation.
- Bohemian home and category pages now follow customer-provided layouts while consuming shared CMS/admin data with safe fallback assets and no admin workflow changes.
- Bohemian checkout now supports full-page premium layout with Razorpay create-order and server-side payment verification flow (signature-validated, no secret exposure in client code).
- Bohemian product detail page now has a dedicated premium implementation (gallery, storytelling tabs, trust strip, social proof, related quick-add) while preserving shared cart/tracking/business logic.

## What Is Already Done
- [x] Completed current live-site UX/SEO audit and identified premium blockers.
- [x] Created detailed premium PRD at docs/design/shree_hari_premium_theme_prd.md.
- [x] Collected section references and visual inspiration links.
- [x] Created backup baseline branch: backup/premium-theme-baseline-20260330.
- [x] Created this master tracker for execution visibility.
- [x] Created pre-implementation safety backup branch: backup/uiux-theme-before-implementation-20260331.
- [x] Built centralized brand constants layer for contact/location/social links.
- [x] Upgraded shared + classic layout shell (Navbar/Footer) to premium UX and removed hardcoded placeholder contacts.
- [x] Upgraded Contact and About pages with realistic premium content and real store data.
- [x] Upgraded Shop, Login, and Signup page visual hierarchy for premium storefront consistency.
- [x] Added shared accessibility primitives (focus-visible baseline, keyboard-safe drawer/menu behavior, reduced-motion fallback).
- [x] Added shared storefront analytics layer with event hooks for view/add/filter/WhatsApp flows.
- [x] Reduced release-blocking lint debt by resolving remaining hook dependency warnings in admin customer/media/product editor flows.
- [x] Corrected signup legal links to dedicated policy routes (`/terms-of-service`, `/privacy-policy`).

## Execution Strategy Chosen
- [x] Use existing theme system (no full rewrite by default).
- [x] Build common shared layer so multiple themes can reuse logic.
- [x] Keep visual skinning theme-specific.
- [x] Re-evaluate "start from scratch" only if common-layer retrofit blocks velocity.

## Route and Component Path Index (Source of Truth)

Use this table to know exactly where to implement each public-page task.

| Live URL | Route Pattern | App Entry File | Theme/Component Implementation Paths | Tracker Milestones |
|---|---|---|---|---|
| https://shree-hari-cutpiece.vercel.app/ | / | src/app/page.tsx | src/themes/classic/pages/HomePage.tsx, src/themes/luxury/pages/HomePage.tsx | M4, M8, M9 |
| https://shree-hari-cutpiece.vercel.app/shop | /shop | src/app/shop/page.tsx | src/themes/classic/pages/ShopPage.tsx, src/themes/luxury/pages/ShopPage.tsx | M5, M8, M9 |
| https://shree-hari-cutpiece.vercel.app/shop/[slug] | /shop/[slug] | src/app/shop/[slug]/page.tsx | src/themes/classic/pages/ProductPage.tsx, src/themes/classic/components/shop/ProductDetailClient.tsx, src/themes/luxury/pages/ProductPage.tsx | M6, M8, M9 |
| https://shree-hari-cutpiece.vercel.app/about | /about | src/app/about/page.tsx | src/components/layout/Navbar.tsx, src/components/layout/Footer.tsx | M7, M8 |
| https://shree-hari-cutpiece.vercel.app/contact | /contact | src/app/contact/page.tsx | src/components/layout/Navbar.tsx, src/components/layout/Footer.tsx | M1, M7, M8 |
| https://shree-hari-cutpiece.vercel.app/blogs | /blogs | src/app/blogs/page.tsx | src/components/blog/BlogCard.tsx | M1, M7, M8 |
| https://shree-hari-cutpiece.vercel.app/blogs/[slug] | /blogs/[slug] | src/app/blogs/[slug]/page.tsx | src/components/blog/BlogRenderer.tsx, src/components/blog/ShareButtons.tsx, src/components/shop/ProductCard.tsx | M1, M7, M8 |
| https://shree-hari-cutpiece.vercel.app/login | /login | src/app/login/page.tsx | src/context/AuthContext.tsx | M7, M8 |
| https://shree-hari-cutpiece.vercel.app/signup | /signup | src/app/signup/page.tsx | src/context/AuthContext.tsx | M7, M8 |
| https://shree-hari-cutpiece.vercel.app/sitemap.xml | /sitemap.xml | src/app/sitemap.ts | src/lib/siteUrl.ts | M8 |

## Shared Platform Paths (Used Across Themes)

| Area | File Paths | Why It Matters |
|---|---|---|
| Theme resolution | src/themes/registry.ts, src/lib/theme.ts | Controls active theme routing for Home, Shop, Product |
| CMS content layer | src/lib/cms.ts | Shared banner/category/site-config fetching and cache behavior |
| CMS admin APIs | src/app/api/admin/cms/banners/route.ts, src/app/api/admin/cms/categories/route.ts, src/app/api/admin/cms/site-config/route.ts | CMS-only changes allowed by rule; keep admin panel stable |
| Shared layout | src/components/layout/Navbar.tsx, src/components/layout/Footer.tsx | Non-theme pages use shared shell |
| Theme layouts | src/themes/classic/components/layout/Navbar.tsx, src/themes/classic/components/layout/Footer.tsx, src/themes/luxury/components/layout/Navbar.tsx, src/themes/luxury/components/layout/Footer.tsx | Premium visual skinning while preserving common behaviors |

## Home Section Component Map (Classic Theme)

| Homepage Section | Component Path |
|---|---|
| Announcement | src/themes/classic/components/home/OfferBanner.tsx |
| Popup Promo | src/themes/classic/components/home/PopupBannerGate.tsx, src/themes/classic/components/home/PopupBanner.tsx |
| Hero | src/themes/classic/components/home/Hero.tsx, src/themes/classic/components/home/HeroBannerCarousel.tsx |
| Categories | src/themes/classic/components/home/Categories.tsx |
| Collection Story Blocks | src/themes/classic/components/home/TrendingProjects.tsx, src/themes/classic/components/home/DescriptionSection.tsx |
| Featured Products | src/themes/classic/components/home/FeaturedProducts.tsx |
| Social/Trust | src/themes/classic/components/home/InstagramReels.tsx, src/themes/classic/components/home/TrustSection.tsx |
| Inspiration + Store | src/themes/classic/components/home/Inspiration.tsx, src/themes/classic/components/home/StoreSection.tsx |

## External Design Reference Links (For UI Direction)

| Target Area | Reference Link |
|---|---|
| Premium home layout | https://themes.shopify.com/themes/allure/presets/carrara |
| Editorial premium style | https://themes.shopify.com/themes/prestige/presets/couture |
| PLP and quick-add UX | https://themes.shopify.com/themes/impulse/presets/impulse |
| Storytelling section quality | https://themes.shopify.com/themes/focal/presets/ivory |

## Customer Reference Lock (All About Bohemian)

| Signal | Observed Detail |
|---|---|
| Primary profile | All About Bohemian - Home Decor Products (@allaboutbohemian) |
| Social traction snapshot | 4,222 followers, 402 following, 157 posts (public Instagram metadata captured on 2026-04-08) |
| Core merchandise cues | Rugs, carpets, cushion covers, throws/runners, wall hangings, designer bath rugs/mats, kids collections |
| Pricing and offer cues | Products starting at Rs 200, promotional 5% discount language, free delivery above Rs 2000, delivery across the globe |
| Location cue (high confidence) | E5, First Floor, Shakti Estate, Lane Opp. Gota Muktidham, Gota, Ahmedabad |
| Contact cue (high confidence) | +91 96015 37858, +91 91575 37858 |
| Brand voice cues | Affordable + stylish + boho vibes, high-variety catalog messaging, WhatsApp-first conversion intent |

## M12) Customer Theme Adaptation (All About Bohemian)
- [x] Lock customer brand and merchandising signals from provided references.
- [x] Convert customer signals into page-level UI/UX blueprint for this storefront.
- [x] Build homepage v1 for this customer (hero, category families, trust strip, CTA stack).
- [x] Build collection/PLP UX aligned to customer product taxonomy and price-positioning.
- [x] Build PDP storytelling blocks for rugs/cushions/bath-rugs (texture, dimensions, care, use case).
- [~] Implement sticky WhatsApp conversion CTA with validated customer phone numbers.
- [ ] Add geo and fulfillment trust strip (Ahmedabad store + global delivery + free delivery threshold).
- [ ] Curate temporary boho-themed asset set and map replacement keys.
- [ ] Run mobile-first visual QA against reference styling and update tracker evidence.


## M0) Governance, Safety, and Planning
- [x] Create baseline backup branch.
- [x] Freeze non-CMS admin functionality changes.
- [x] Confirm common-layer-first implementation strategy.
- [x] Add route-to-component and website path mapping in tracker.
- [x] Create rollback runbook (branch restore, selective rollback by folder, deployment rollback).
- [x] Add ownership tags for each milestone (Design, Frontend, SEO, QA).
- [x] Define update cadence for this tracker (after every milestone or major merge).

### Milestone Ownership Tags

| Milestone | Owners |
|---|---|
| M0 Governance | Frontend, QA, Release |
| M1 Content and Trust | Frontend, Content, QA |
| M2 Asset Program | Design, Content, QA |
| M3 Common Shared Layer | Frontend, SEO |
| M4 Homepage UX | Design, Frontend |
| M5 Shop UX | Frontend, QA |
| M6 PDP UX | Frontend, QA |
| M7 About/Contact/Blog | Frontend, Content, SEO |
| M8 SEO Foundation | SEO, Frontend |
| M9 Performance and Accessibility | Frontend, QA |
| M10 QA/UAT/Release | QA, Frontend, Release |
| M11 Post-Launch Optimization | Product, SEO, Frontend |

### Tracker Update Cadence

1. Update tracker before starting each work session (mark target items as [~]).
2. Update tracker after each completed implementation chunk in the same day.
3. Update change log after each merged milestone or production release.
4. Do not mark a milestone item [x] until verification steps pass in the verification guide.

## M1) Content and Trust Cleanup (Highest Priority)
- [x] Replace all placeholder phone/WhatsApp/email/address entries with real values.
- [x] Replace generic map link with real Google Maps place link/embed.
- [x] Remove all test strings, lorem text, and gibberish from storefront pages.
- [x] Remove non-fabric test blog posts and metadata.
- [x] Ensure all public pages have business-consistent brand copy.
- [x] Add/fix policy pages linked from footer (shipping, returns, privacy, terms).

## M2) Realistic Temporary Asset Program
- [x] Create asset source log template.
- [x] Curate hero images from reliable sources (textile closeups, drape, craftsmanship).
- [x] Curate category images with clear visual distinction by fabric type.
- [x] Curate PDP gallery images (texture, drape, use-case) for each demo product.
- [x] Curate authentic store/process visuals for About and Contact.
- [x] Add alt text for every image with fabric-specific meaning.
- [x] Verify each image source, rights, and attribution requirement in source log.
- [x] Prepare one-click replacement map for swapping temporary images with final product assets.

## M3) Common Shared Layer (No Duplicate Work Across Themes)
- [x] Create common metadata builder used by all themes.
- [x] Create common schema generator (Organization, LocalBusiness, Product, Article, Breadcrumb).
- [x] Create common product-card behavior (badges, price, quick actions).
- [x] Create common PLP filter and sort state engine.
- [x] Create common cart-drawer behavior and analytics hooks.
- [x] Create common tracking events layer (view_item, add_to_cart, filter_use, whatsapp_click).
- [x] Create common accessibility primitives (focus-visible, keyboard patterns, reduced motion support).

## M4) Homepage Premium UX
- [x] Redesign hero as premium editorial block with clear primary CTA.
- [x] Rebuild category and use-case discovery sections.
- [x] Add premium storytelling section (craft/process heritage).
- [x] Rebuild bestsellers and trust modules with cleaner hierarchy.
- [x] Add journal preview section with relevant fabric guides.
- [x] Validate mobile section order for high conversion flow.
- [x] Ensure homepage remains CMS-driven for key section content.

## M5) Shop (PLP) Premium UX
- [x] Implement sticky filter/sort UX for mobile and desktop.
- [x] Add filter groups: fabric type, occasion, color family, price/meter, pattern.
- [x] Upgrade product cards with fast facts and cleaner hierarchy.
- [x] Add premium empty states with guided recovery.
- [x] Add category/collection narrative headers.
- [x] Confirm filter UX is keyboard accessible and touch friendly.

## M6) Product Detail (PDP) Premium UX
- [x] Add structured textile specification panel (GSM, width, feel, transparency, stretch, care).
- [x] Add realistic gallery sequence (macro texture, drape, usage context).
- [x] Improve CTA stack (Add to Cart + stylist/WhatsApp assistance).
- [x] Add meter calculator guidance for common garment types.
- [x] Add trust block (delivery, quality check, returns).
- [x] Add related fabrics and cross-sell bundles.
- [x] Add clean FAQ + review section design.

## M7) About, Contact, Blog Quality Upgrade
- [x] About page: real heritage and quality-process narrative.
- [x] Contact page: real contact data, real map, clear bulk-order CTA.
- [x] Blog listing: remove weak posts and improve card quality.
- [x] Blog detail template: fabric-first structure and internal linking.
- [x] Add language/localization consistency for active locale routes.

## M8) SEO Foundation and Growth
- [x] Add canonical tags to all indexable templates.
- [x] Add OG title/description/image for all shareable templates.
- [x] Fix canonical/sitemap production domain consistency.
- [x] Add robots policy and verify crawlability rules.
- [x] Add template-level schema JSON-LD.
- [x] Build keyword-aligned metadata for Home, PLP, PDP, About, Contact, Blog.
- [x] Build initial topic cluster content plan and publish sequence.
- [x] Add internal linking graph between blog, category, and product pages.

## M9) Performance, Accessibility, and Technical Polish
- [x] Optimize image sizes and responsive srcset for all premium sections.
- [x] Reduce initial payload and prioritize LCP media.
- [~] Validate Core Web Vitals targets on mobile.
- [x] Ensure text contrast and focus states meet accessibility standards.
- [x] Ensure keyboard navigation for menus, drawers, filters, and forms.
- [x] Add reduced-motion fallback behavior.

## M10) QA, UAT, and Release Readiness
- [x] Convert PRD acceptance criteria into QA checklist cases.
- [x] Run full route health check (no high-priority storefront 404s).
- [x] Run SEO validation pass (metadata + schema + sitemap).
- [x] Run visual QA pass across breakpoints.
- [x] Run content authenticity pass (no test/demo artifacts).
- [x] Run analytics event validation.
- [x] Prepare launch checklist and rollback checklist.

## Manual Sign-off Pending (Cannot Be Auto-Completed by Code Edits)
- [x] Visual QA pass across breakpoints (desktop + mobile screenshots and layout review).
- [x] Analytics runtime validation in browser DevTools (`window.dataLayer` payload verification during user interactions).

## M11) Post-Launch Optimization
- [ ] Measure baseline vs post-launch KPI deltas.
- [ ] Run hero and CTA A/B experiments.
- [ ] Tune PLP filtering UX based on real behavior.
- [ ] Tune PDP content order based on add-to-cart funnel analytics.
- [ ] Plan phase-2 premium enhancements.

## Detailed CMS and Admin Safety Checklist
- [x] Existing admin product management flow remains intact.
- [x] Existing admin order/customer flows remain intact.
- [x] Existing theme-switch mechanism remains intact.
- [x] Any CMS schema change must be backward compatible.
- [x] Any CMS field addition must have safe default behavior.
- [x] No admin route removals during premium theme rollout.

## Daily Operating Checklist (Use Every Work Session - Template)
1. Pull latest and verify current branch.
2. Update this tracker before coding (set target tasks to [~]).
3. Implement selected scope.
4. Validate on desktop and mobile.
5. Update this tracker after work (move to [x] where complete).
6. Update PRD if scope/decisions changed.

## Current Active Tasks (Next Actions)
- [x] Draft and lock detailed tracker with owner rules.
- [x] Continue M1 content and trust cleanup execution.
- [x] Start M2 image sourcing and source-log population.
- [x] Continue M8 foundation rollout (schema coverage + metadata completion).
- [x] Continue M9 accessibility/performance polish (contrast + full keyboard path validation).
- [~] Complete mobile Core Web Vitals target validation on production telemetry.
- [~] Start M12 customer-specific adaptation execution for All About Bohemian.

## Change Log
- 2026-03-30: Created master tracker for premium theme execution with milestone-level checklists.
- 2026-03-30: Added owner-mandate rules (admin panel stability, realistic image/content requirement).
- 2026-03-30: Marked completed baseline work and backup branch creation.
- 2026-03-30: Added asset and copy source log template at docs/design/premium_theme_asset_source_log.md.
- 2026-03-30: Added actual website route paths and component file-path index to guide execution.
- 2026-03-31: Added pre-implementation backup branch and started end-to-end storefront UI/UX implementation phase.
- 2026-03-31: Implemented centralized brand constants and replaced public WhatsApp/map/contact placeholders.
- 2026-03-31: Completed premium redesign passes for shared layout, Contact page, About page, Shop page, Login, and Signup.
- 2026-03-31: Added storefront policy routes (shipping, returns, privacy, terms) and linked them in the shared footer legal navigation.
- 2026-03-31: Added PDP stylist-assist WhatsApp CTA and dynamic extra specification rendering support.
- 2026-03-31: Upgraded EN/HI blog listing pages to premium hero-card layout and filtered obvious test/demo posts from public lists.
- 2026-03-31: Added shared public blog-content filtering for list/detail/sitemap, plus EN/HI blog detail internal-link panels and Hindi UX copy refinements.
- 2026-03-31: Added EN/HI blog category query filtering, localized Hindi sharing controls, and canonical metadata on blog listing routes.
- 2026-03-31: Added step-by-step storefront verification runbook at docs/trackers/premium_theme_step_by_step_verification.md.
- 2026-03-31: Added common SEO utilities (`src/lib/seo.ts`, `src/lib/seoSchema.ts`), robots policy route, and crawl-safe login/signup noindex metadata layouts.
- 2026-03-31: Expanded template metadata and schema coverage across Home, Shop, PDP, About, Contact, Blog listings, and policy routes; expanded sitemap static route coverage.
- 2026-03-31: Added homepage Journal preview section and implemented shared PLP filter/sort engine with sticky controls and guided empty-state recovery.
- 2026-03-31: Rebuilt classic PLP grid with advanced filter groups (fabric, occasion, color family, price band, pattern), mobile filter dialog, and keyboard close support.
- 2026-03-31: Upgraded shared ProductCard behavior and moved classic ProductCard to shared re-export for single-source storefront card behavior.
- 2026-03-31: Enhanced classic PDP with structured textile spec cards, meter-usage guidance, expanded trust panel, and fallback-driven related/cross-sell recommendations.
- 2026-04-01: Added shared accessibility primitives in global styles (focus-visible baseline + prefers-reduced-motion fallback), improved Navbar/Cart drawer keyboard behavior, and aligned classic cart to shared implementation.
- 2026-04-01: Expanded verification runbook with explicit implementation explanation and dedicated accessibility/keyboard/reduced-motion test section.
- 2026-04-01: Added shared storefront tracking utility (`src/lib/tracking.ts`) and wired `view_item`, `add_to_cart`, `filter_use`, and `whatsapp_click` hooks in PDP/PLP/cart/navbar/account flows.
- 2026-04-01: Expanded verification runbook with dedicated storefront analytics event validation steps and expected payload checks.
- 2026-04-01: Added rollback runbook at docs/trackers/premium_theme_rollback_runbook.md and completed M0 governance items (ownership tags + tracker update cadence).
- 2026-04-01: Extended shared schema utilities with reusable Product and Article builders and wired them into PDP and EN/HI blog detail templates.
- 2026-04-01: Expanded template-level schema coverage to policy routes (shipping, returns, privacy, terms) with WebPage + breadcrumb JSON-LD.
- 2026-04-01: Cleared remaining hook dependency lint warnings in admin customer detail, media library modal, and product edit flows; lint now reports warning-only `<img>` advisories in admin surfaces.
- 2026-04-01: Fixed signup terms/privacy links to point to live policy routes instead of placeholder contact links.
- 2026-04-01: Hardened `src/lib/siteUrl.ts` to prioritize explicit site URL and Vercel production URL fallback for canonical/sitemap host consistency.
- 2026-04-01: Added initial topic-cluster publish plan at docs/blog/premium_topic_cluster_publish_plan.md with six-week sequence and linking standards.
- 2026-04-01: Cleared remaining admin `<img>` lint advisories by explicit rule scoping for dynamic CMS/admin preview surfaces; lint now passes with zero warnings/errors.
- 2026-04-01: Added launch checklist runbook at docs/trackers/premium_theme_launch_checklist.md and completed launch/rollback checklist readiness in M10.
- 2026-04-01: Executed automated route health sweep on local app (`/`, `/shop`, `/about`, `/contact`, `/blogs`, `/hi/blogs`, policy routes, `/login`, `/signup`) and all routes returned HTTP 200.
- 2026-04-01: Executed automated SEO validation pass for canonical + JSON-LD presence on indexable templates and verified `/sitemap.xml` returns valid `urlset` payload.
- 2026-04-01: Executed storefront authenticity scan for placeholder/test/demo content markers and closed remaining M1 cleanup checklist items.
- 2026-04-01: Completed temporary asset governance rollout with production-ready source log, explicit rights notes, replacement key mapping, and one-command replacement scripts (`assets:replacement:dry`, `assets:replacement:apply`).
- 2026-04-01: Completed premium image optimization and LCP prioritization pass by adding responsive `sizes` coverage, improving Next image format/caching settings, and limiting hero priority loading to first-slide media.
- 2026-04-01: Added automated premium QA runner (`npm run qa:premium`) and generated evidence at `docs/trackers/artifacts/premium-theme-qa/2026-04-01/qa-report.json` with 24/24 route checks passing and full desktop/mobile screenshot capture.
- 2026-04-01: Completed runtime analytics validation via automated interaction checks; `view_item`, `add_to_cart`, `filter_use`, and `whatsapp_click` all passed in the generated QA report.
- 2026-04-01: Fixed broken temporary media URLs discovered during runtime checks (home trending cards) and verified replacement URLs return HTTP 200.
- 2026-04-01: Captured production-mode mobile Lighthouse baselines at `docs/trackers/artifacts/premium-theme-qa/2026-04-01/lighthouse-mobile-home.prod.json` and `docs/trackers/artifacts/premium-theme-qa/2026-04-01/lighthouse-mobile-shop.prod.json`; `/shop` baseline is strong (LCP ~1.77s, TBT ~222ms, CLS ~0) while `/` remains in progress (LCP ~3.31s, TBT ~643ms, CLS ~0).
- 2026-04-08: Resolved customer-provided Google short link to All About Bohemian and captured public Instagram/keyword metadata (handle, follower/post snapshot, product categories, offers, location, contact cues) for customer-style implementation.
- 2026-04-08: Added M12 customer adaptation milestone and execution checklist to align next implementation phase with All About Bohemian references.
- 2026-04-08: Added new `bohemian` theme under `src/themes/bohemian` with dedicated Home/Shop/Product page entries, wired dynamic theme registry loading, expanded active-theme validation, and added bohemian option in admin theme settings.
- 2026-04-12: Implemented bohemian category-page design from customer-provided reference (bento collections, editorial blocks, immersive banner, newsletter footer), wired category cards to CMS categories with image fallbacks from approved temporary assets, and kept ProductGrid sourcing from shared admin-managed products.
- 2026-04-12: Made bohemian landing page CMS-ready by wiring shared `site_config`, `homepage_hero` banners, and category-derived archive cards with safe visual fallbacks; also fixed `/shop` searchParam propagation and theme registry typing so category deep links work across active themes.
- 2026-04-18: Replaced bohemian PDP re-export with dedicated premium product detail implementation aligned to provided reference (hero gallery, color swatches, dual CTA, artisan story/material/dimensions/reviews tabs, lifestyle banner, social proof, and related products with quick-add) while retaining shared Supabase fetch, cart option validation, and storefront tracking hooks.
