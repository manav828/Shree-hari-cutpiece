# Premium Theme Full Verification Guide

Last updated: 2026-04-01
Owner: Frontend + QA
Purpose: Verify every storefront change implemented in the premium theme rollout.

## 0) Scope and Rules

This runbook verifies only implemented storefront work. It does not mark pending tracker milestones complete.

Rules while testing:

1. Do not edit code during validation.
2. Capture screenshots for each major section pass.
3. If any check fails, log route, observed behavior, expected behavior, and timestamp.

## 0A) What Was Implemented in This Pass (Read Before Testing)

This section explains the exact work completed now so QA can test with context.

1. Global accessibility primitives were added in `src/app/globals.css`:
   - Keyboard focus-visible ring for links, buttons, and form controls.
   - Reduced-motion fallback (`prefers-reduced-motion: reduce`) to minimize animation/transition and disable smooth scroll.
2. Navbar mobile menu behavior was improved in `src/components/layout/Navbar.tsx`:
   - Mobile menu now closes on `Esc`.
   - Toggle button now exposes dialog state with `aria-expanded` and `aria-controls`.
3. Cart drawer accessibility was improved in `src/components/cart/CartSidebar.tsx`:
   - Drawer now behaves as a dialog (`role="dialog"`, `aria-modal`, labelled title).
   - Drawer closes on `Esc`.
   - Close button is focused when drawer opens for better keyboard flow.
   - Action icons now have explicit assistive labels.
4. Classic theme cart now reuses shared cart implementation via `src/themes/classic/components/cart/CartSidebar.tsx` re-export:
   - Prevents behavior drift between shared and classic routes.
5. PLP mobile filter trigger state was hardened in `src/themes/classic/components/shop/ProductGrid.tsx`:
   - Filter trigger now exposes `aria-expanded` and `aria-controls` linked to the dialog.
6. Shared storefront analytics hooks were implemented via `src/lib/tracking.ts` and wired into key flows:
   - `add_to_cart` now emits from shared cart entrypoint in `src/context/CartContext.tsx`.
   - `view_item` now emits from PDP in `src/themes/classic/components/shop/ProductDetailClient.tsx`.
   - `filter_use` now emits when PLP filters/sort/category change in `src/themes/classic/components/shop/ProductGrid.tsx`.
   - `whatsapp_click` now emits from key CTAs in Navbar, PDP stylist CTA, and account-order WhatsApp actions.
7. Shared schema utility coverage was completed via `src/lib/seoSchema.ts` and route wiring:
   - Added reusable Product and Article schema builders.
   - EN/HI blog detail routes now emit shared WebPage + Breadcrumb + Article schema payloads.
   - Policy routes (`/shipping-policy`, `/returns-policy`, `/privacy-policy`, `/terms-of-service`) now emit WebPage + Breadcrumb schema payloads.
8. Lint and route integrity hardening was completed:
   - Hook dependency warnings were resolved in admin customer detail, product edit, and blog media library flows.
   - Signup legal links now point to dedicated policy routes (`/terms-of-service`, `/privacy-policy`).
9. SEO domain consistency and lint baseline were finalized:
   - Site URL resolution now prioritizes explicit site URL config and Vercel production URL fallback in `src/lib/siteUrl.ts` so canonical and sitemap hosts stay aligned.
   - Remaining admin/CMS dynamic image lint advisories were handled with explicit rule scoping; `npm run lint` now passes with zero warnings/errors.
10. Initial SEO growth planning was finalized:
   - Topic-cluster publish sequence and linking standards were added at `docs/blog/premium_topic_cluster_publish_plan.md`.
11. Performance media optimization was expanded across premium storefront surfaces:
   - Added responsive image sizing coverage and improved media loading behavior across home/story/inspiration/trending, PLP cards, PDP gallery, blog, policy, and shared route hero surfaces.
12. LCP prioritization was tightened:
   - Hero carousel now prioritizes first slide media and de-prioritizes non-critical slides.
   - Next image output settings were tuned for modern formats/caching in `next.config.mjs`.
13. PDP gallery storytelling sequencing was completed:
   - Gallery alt text and labels now follow a realistic pattern (hero, texture, drape, use-case).
14. Asset replacement governance and tooling were completed:
   - Source log: `docs/design/premium_theme_asset_source_log.md`.
   - Replacement map: `docs/design/premium_theme_asset_replacement_map.json`.
   - One-click tooling: `npm run assets:replacement:dry` and `npm run assets:replacement:apply`.
15. Automated premium QA evidence was generated using Playwright:
   - Command: `npm run qa:premium`.
   - Artifact: `docs/trackers/artifacts/premium-theme-qa/2026-04-01/qa-report.json`.
   - Current report result: `24/24` routes passed, plus analytics checks passing for `view_item`, `add_to_cart`, `filter_use`, `whatsapp_click`.
16. Runtime media health fixes were applied after QA diagnostics:
   - Broken temporary image URLs in trending cards were replaced with healthy sources and revalidated.
17. Mobile CWV baseline artifacts were captured from production-mode build:
   - `docs/trackers/artifacts/premium-theme-qa/2026-04-01/lighthouse-mobile-home.prod.json`
   - `docs/trackers/artifacts/premium-theme-qa/2026-04-01/lighthouse-mobile-shop.prod.json`

How to use this while testing:

1. Validate visual output as before.
2. Validate keyboard and reduced-motion behavior with the new checks in section 18A.
3. Only mark final checklist items if both UI and accessibility behavior pass.
4. Validate analytics event emission with the new checks in section 18B.
5. Validate canonical host consistency with the checks in section 12B.
6. Validate the latest automated evidence package using section 18C.

## 1) Environment Setup

1. Install dependencies:
   - `npm install`
2. Start app:
   - `npm run dev`
3. Open site:
   - `http://localhost:3000`
4. Keep these files open while testing:
   - `docs/trackers/premium_theme_master_tracker.md`
   - `docs/trackers/premium_theme_step_by_step_verification.md`
   - `docs/trackers/premium_theme_launch_checklist.md`
   - `docs/trackers/premium_theme_rollback_runbook.md`

## 2) Quick Route Health Sweep

Open each route and confirm page loads without runtime crash or 404:

1. `/`
2. `/shop`
3. `/about`
4. `/contact`
5. `/blogs`
6. `/hi/blogs`
7. `/shipping-policy`
8. `/returns-policy`
9. `/privacy-policy`
10. `/terms-of-service`
11. `/login`
12. `/signup`

Expected result: all routes render with Navbar, Cart sidebar support, and Footer.

## 3) Source-of-Truth Data Checks (Code Level)

Goal: confirm all public brand/contact links use centralized data.

1. Open `src/lib/brand.ts`.
2. Verify non-placeholder values for:
   - `name`, `shortName`, `phoneDisplay`, `whatsappNumber`, `email`, `instagramUrl`, `mapsUrl`, `mapsEmbedUrl`, `addressLines`, `storeHoursWeekday`, `storeHoursWeekend`.
3. Confirm helper exists:
   - `getWhatsAppUrl(message?: string)`.
4. Open `src/lib/utils.ts` and verify `generateWhatsAppLink` uses `brand.whatsappNumber`.

Expected result: no hardcoded placeholder phone numbers or generic map/social URLs in shared helpers.

## 4) Shared Layout and Theme Wrapper Consistency

Goal: ensure shared shell propagates to classic theme.

1. Open:
   - `src/components/layout/Navbar.tsx`
   - `src/components/layout/Footer.tsx`
2. Confirm premium shared shell includes:
   - Top utility strip on desktop.
   - WhatsApp stylist CTA.
   - Legal links section in footer.
3. Open classic wrappers:
   - `src/themes/classic/components/layout/Navbar.tsx`
   - `src/themes/classic/components/layout/Footer.tsx`
4. Confirm wrappers re-export shared components.

Expected result: classic storefront receives shared shell updates automatically.

## 5) Navbar and Footer Functional Verification (UI)

1. Visit `/`, `/shop`, `/about`, `/contact` on desktop and mobile viewport.
2. Validate Navbar:
   - Active nav state changes by route.
   - Cart icon opens cart sidebar.
   - Account icon links to `/login` when logged out.
   - Mobile menu opens, lists links, includes WhatsApp stylist CTA, and closes on `Esc`.
3. Validate Footer:
   - Brand details show real contact info.
   - Instagram and WhatsApp buttons open correct links.
   - Legal links exist and are clickable.

Expected result: navigation, mobile menu, and legal discoverability all work.

## 6) Policy Pages Verification

Routes:

1. `/shipping-policy`
2. `/returns-policy`
3. `/privacy-policy`
4. `/terms-of-service`

Checks per route:

1. Hero renders with policy title.
2. Last updated label exists.
3. Sectioned content renders with clear headings.
4. Support note references store contact details.

Expected result: all policy pages are complete and footer-linked.

## 7) About and Contact Premium Content Verification

### About page (`/about`)

1. Verify milestone and values blocks exist.
2. Verify realistic, non-demo copy tone.
3. Verify CTA links work and brand location info is consistent.

### Contact page (`/contact`)

1. Verify WhatsApp CTA opens with prefilled message.
2. Verify phone, email, and address match `src/lib/brand.ts`.
3. Verify embedded map loads and Open in Maps link works.
4. Verify store hours match brand constants.

Expected result: both pages are production-safe and trust-focused.

## 8) Home Section Enhancements Verification

Check shared and classic home modules:

1. Open:
   - `src/components/home/Inspiration.tsx`
   - `src/components/home/InstagramReels.tsx`
   - `src/components/home/StoreSection.tsx`
   - `src/themes/classic/components/home/Inspiration.tsx`
   - `src/themes/classic/components/home/InstagramReels.tsx`
   - `src/themes/classic/components/home/StoreSection.tsx`
   - `src/themes/classic/components/home/JournalPreview.tsx`
2. Verify:
   - WhatsApp consult links use helper.
   - Instagram links use brand URL.
   - Store section map/address/hours/contact derive from brand or CMS fallback.
   - Homepage journal preview block appears with at least one guide card or a valid fallback state CTA.

Expected result: no placeholder social/map/contact references remain in these home sections.

## 9) Shop, Login, Signup Verification

### Shop page (`/shop`)

1. Verify hero banner appears.
2. Verify elevated container wraps top banner and product grid.
3. Verify sticky control bar remains visible while scrolling product list.
4. On mobile, open filter sheet and confirm category selection applies.
5. On mobile filter sheet, press `Esc` and verify sheet closes.
6. On desktop, verify advanced filters render and work:
   - fabric type
   - occasion
   - color family
   - price band
   - pattern
7. Change category chips and sort order, then verify result counts update.
8. Trigger empty state by selecting strict filters and verify clear-filter recovery CTA appears.
9. Verify no layout overlap on mobile.

### Login page (`/login`)

1. Verify premium visual panel and updated copy.
2. Verify forgot password and support links open WhatsApp helper URL.

### Signup page (`/signup`)

1. Verify premium visual panel and updated copy.
2. Verify support link opens WhatsApp helper URL.
3. Verify terms/privacy links are no longer dead placeholders.
4. Verify links open the correct routes:
   - `/terms-of-service`
   - `/privacy-policy`

Expected result: all three routes show premium hierarchy and valid support navigation.

## 10) Account Order WhatsApp Flows

Route: `/account/orders/<id>` with a valid signed-in account.

1. Click reorder via WhatsApp.
2. Verify message includes order number and line items in readable format.
3. Click order query support WhatsApp link.
4. Verify message contains order number.

Expected result: order support and reorder flows use real WhatsApp helper links.

## 11) Blog Listing Verification (EN + HI)

### English listing (`/blogs`)

1. Verify premium hero and card grid.
2. Confirm test-like posts are suppressed (test/demo/sample/dummy/lorem).
3. Open `/blogs?category=<category-name>`.
4. Verify filter banner appears and only category-matching posts remain.
5. Click clear filter and verify list resets.

### Hindi listing (`/hi/blogs`)

1. Verify Hindi hero title and localized descriptive copy.
2. Open `/hi/blogs?category=<category-name>`.
3. Verify localized filter banner and empty-state text.
4. Verify read-more text on cards is localized.

Expected result: EN/HI listing UX and category query filtering are correct.

## 12) Template Metadata and Canonical Verification

Goal: confirm shared metadata builder output is applied on core templates.

1. Inspect head tags on routes:
   - `/`
   - `/shop`
   - `/about`
   - `/contact`
   - `/blogs`
   - `/hi/blogs`
   - `/shipping-policy`
   - `/returns-policy`
   - `/privacy-policy`
   - `/terms-of-service`
2. Verify each route includes canonical URL.
3. Verify each route includes OG and Twitter title/description tags.
4. Verify `/blogs` and `/hi/blogs` include EN/HI language alternates.
5. Verify `/login` and `/signup` include noindex,nofollow behavior.

Expected result: metadata is consistent and route-appropriate across core templates.

## 12A) Schema JSON-LD Verification

Goal: confirm template-level schema scripts render with valid structure.

1. On `/`, verify JSON-LD includes Organization, WebSite, and WebPage.
2. On `/shop`, verify JSON-LD includes CollectionPage + breadcrumb entries.
3. On `/shop/<slug>`, verify JSON-LD includes Product + breadcrumb entries.
4. On `/about`, verify AboutPage schema.
5. On `/contact`, verify ContactPage + LocalBusiness schema.
6. On `/blogs` and `/hi/blogs`, verify CollectionPage + breadcrumb schema.
7. On `/blogs/<slug>` and `/hi/blogs/<slug>`, verify WebPage + Breadcrumb + BlogPosting schema.
8. On policy routes (`/shipping-policy`, `/returns-policy`, `/privacy-policy`, `/terms-of-service`), verify WebPage + breadcrumb schema.

Expected result: schema payload exists on each core route and reflects visible page intent.

## 12B) Canonical Domain Consistency Verification

Goal: confirm canonical and sitemap host resolution stays consistent for production indexing.

1. Open page source or head inspector on `/`, `/shop`, `/blogs`, `/hi/blogs`, and one `/shop/<slug>` route.
2. Verify canonical links use the same host across these routes.
3. Open `/sitemap.xml` and verify URL entries use the same host as canonical URLs.
4. If `NEXT_PUBLIC_SITE_URL` is set, confirm canonical + sitemap host match it exactly.
5. If `NEXT_PUBLIC_SITE_URL` is not set in Vercel, confirm host resolves from production URL fallback and does not mix preview + production hosts.

Expected result: no mixed canonical/sitemap hosts for indexable routes in production-like environments.

## 13) Blog Detail Verification (EN + HI)

### English detail (`/blogs/<slug>`)

1. Verify article renders with header, image, content, and share buttons.
2. Verify Continue Exploring panel appears.
3. Verify panel links:
   - all articles route
   - shop route
   - category query route
4. Click category route and confirm listing filter applies.

### Hindi detail (`/hi/blogs/<slug>`)

1. Verify localized breadcrumb labels and date format.
2. Verify localized read-time string.
3. Verify share buttons are localized:
   - native share label
   - WhatsApp label
   - Facebook label
   - copy/copy-confirm labels
4. Verify Continue Exploring panel localized text and functional links.

Expected result: internal linking graph and localization consistency both pass.

## 14) Public Content Safety Guards

Goal: ensure filtered posts are blocked on detail and redirects.

1. Attempt to open a known test-like slug directly on EN and HI detail routes.
2. Expected result:
   - page is not publicly rendered (not found behavior), or redirect only if target is valid public content.
3. Validate related posts shown on detail routes do not include test-like content.

## 15) Robots and Sitemap Verification

1. Open `/robots.txt`.
2. Confirm disallow rules include `/admin`, `/api`, and `/account`.
3. Confirm robots references `/sitemap.xml`.
4. Open `/sitemap.xml`.
5. Confirm static entries include `/`, `/shop`, `/about`, `/contact`, `/blogs`, `/hi/blogs`, and policy routes.
6. Confirm blog URLs exist for public posts only.
7. Confirm obvious test-like slugs are absent.

Expected result: robots policy and sitemap align with crawl strategy and public-content filtering.

## 16) PDP Enhancements Verification

Route: `/shop/<slug>`

1. Verify Add to Cart CTA still works.
2. Verify stylist WhatsApp CTA appears and opens with product-aware message.
3. Verify structured textile specification cards render near pricing:
   - GSM
   - Feel
   - Transparency
   - Stretch
   - Drape
   - Care
4. For meter-sold products, verify quantity step is 0.5 and quick meter presets work.
5. For meter-sold products, verify garment meter guide rows display and contextual hint text updates with selected quantity.
6. Verify trust panel renders four blocks (quality check, delivery promise, returns, stylist support).
7. Verify details tab renders base rows plus extra fabric rows without duplicate labels.
8. Verify related recommendation section appears with fallback recommendations when explicit related IDs are absent.
9. Verify cross-sell bundle guidance cards render below related recommendations.

Expected result: structured specs, quantity guidance, trust messaging, and recommendation/cross-sell blocks are visible and functional.

## 17) Regression and Admin Safety Verification

1. Perform smoke checks on admin pages you use daily:
   - blog admin
   - product admin
   - orders
   - customers
2. Confirm no critical regressions in admin workflows.

Expected result: storefront changes did not alter admin behavior.

## 18) Diagnostics and Lint Verification

1. Run targeted diagnostics from VS Code Problems panel for touched files.
2. Optional full lint:
   - `npm run lint`
3. Record any failures or warnings.
4. Current expected baseline after this pass: lint returns zero warnings/errors.

## 18A) Accessibility, Keyboard, and Reduced-Motion Verification

Goal: verify the new shared accessibility primitives behave consistently across storefront flows.

1. Keyboard focus ring checks:
   - Use `Tab` / `Shift+Tab` on `/`, `/shop`, `/about`, `/contact`.
   - Confirm interactive elements (links, buttons, select fields) show visible accent focus ring.
2. Navbar mobile menu keyboard checks:
   - Open mobile menu from Navbar.
   - Press `Esc` and confirm menu closes.
3. Cart drawer keyboard/dialog checks:
   - Open cart from Navbar.
   - Confirm drawer opens with titled dialog semantics.
   - Confirm close button receives focus on open.
   - Press `Esc` and confirm drawer closes.
4. Shop mobile filter dialog ARIA state checks:
   - On `/shop` mobile viewport, open filter dialog.
   - Confirm trigger exposes expanded state and is linked to dialog control (via browser Accessibility tree/DevTools).
   - Press `Esc` and confirm filter dialog closes.
5. Reduced-motion checks:
   - Enable reduced motion in OS or emulate `prefers-reduced-motion: reduce` in browser rendering tools.
   - Reload `/` and `/shop`.
   - Confirm animations/transitions are significantly reduced and smooth-scroll behavior is disabled.

Expected result: keyboard users can operate menu/drawer/filter flows safely, focus visibility is clear, and reduced-motion preference is respected.

## 18B) Storefront Analytics Event Verification

Goal: verify common storefront events emit with stable payloads for analytics wiring.

1. Open DevTools on any storefront route and initialize inspection:
   - Run: `window.dataLayer = window.dataLayer || [];`
2. Verify `view_item`:
   - Open `/shop/<slug>`.
   - Confirm latest `window.dataLayer` entry has `event: "view_item"` with product identifiers.
3. Verify `add_to_cart`:
   - Add from PLP card (`/shop`) and from PDP CTA (`/shop/<slug>`).
   - Confirm entries with `event: "add_to_cart"` and source hints like `plp_product_card` or `pdp_primary_cta`.
4. Verify `filter_use`:
   - Change category, sort order, or advanced filters on `/shop`.
   - Confirm entries with `event: "filter_use"` including `active_filter_count` and `result_count`.
5. Verify `whatsapp_click`:
   - Click WhatsApp CTA in Navbar, PDP stylist CTA, and account order support/reorder CTA.
   - Confirm entries with `event: "whatsapp_click"` and a non-empty `location` field.
6. Verify base event envelope:
   - Confirm each event includes `event_source: "storefront"` and `timestamp`.

Expected result: all four event types (`view_item`, `add_to_cart`, `filter_use`, `whatsapp_click`) are emitted in `window.dataLayer` with route-relevant payload fields.

## 18C) Automated QA Artifact Verification

Goal: confirm latest automated visual/runtime checks were generated and match expected pass thresholds.

1. Run automated premium QA:
   - `npm run qa:premium`
2. Open the generated report file:
   - `docs/trackers/artifacts/premium-theme-qa/<YYYY-MM-DD>/qa-report.json`
3. Verify route summary in report:
   - `routeSummary.total` is `24`.
   - `routeSummary.passed` is `24`.
   - `routeSummary.failed` is `0`.
4. Verify analytics checks in report:
   - `analyticsReport.checks.view_item` is `true`.
   - `analyticsReport.checks.add_to_cart` is `true`.
   - `analyticsReport.checks.filter_use` is `true`.
   - `analyticsReport.checks.whatsapp_click` is `true`.
5. Verify screenshot outputs exist for both viewports:
   - `docs/trackers/artifacts/premium-theme-qa/<YYYY-MM-DD>/screenshots/desktop-1440__*.png`
   - `docs/trackers/artifacts/premium-theme-qa/<YYYY-MM-DD>/screenshots/mobile-390__*.png`

Expected result: automated evidence confirms full route pass coverage across both breakpoints and all required storefront analytics event families.

## 18D) Mobile Core Web Vitals Baseline Verification

Goal: validate mobile CWV baselines from a production-mode server and track closure against performance targets.

1. Build and start production mode locally:
   - `npm run build`
   - `npm run start`
2. Run Lighthouse mobile audits:
   - `npx --yes lighthouse http://localhost:3000 --quiet --chrome-flags="--headless=new --no-sandbox" --no-enable-error-reporting --preset=perf --form-factor=mobile --output=json --output-path=docs/trackers/artifacts/premium-theme-qa/<YYYY-MM-DD>/lighthouse-mobile-home.prod.json`
   - `npx --yes lighthouse http://localhost:3000/shop --quiet --chrome-flags="--headless=new --no-sandbox" --no-enable-error-reporting --preset=perf --form-factor=mobile --output=json --output-path=docs/trackers/artifacts/premium-theme-qa/<YYYY-MM-DD>/lighthouse-mobile-shop.prod.json`
3. Extract key metrics for each report:
   - `largest-contentful-paint`
   - `cumulative-layout-shift`
   - `total-blocking-time`
4. Compare against your target thresholds and mark result state:
   - pass: target met
   - in-progress: baseline captured but target not met

Expected result: both reports exist and provide objective mobile baseline metrics; tracker M9 CWV item can be moved to done only when target thresholds are met.

Current baseline snapshot (2026-04-01 production-mode local run):

1. `/`:
   - `LCP`: ~3.31s
   - `CLS`: ~0
   - `TBT`: ~643ms
2. `/shop`:
   - `LCP`: ~1.77s
   - `CLS`: ~0
   - `TBT`: ~222ms

## 19) Final Sign-off Checklist

- [ ] Source-of-truth brand constants verified.
- [ ] Shared shell and classic wrapper propagation verified.
- [ ] Navbar/mobile menu/footer/legal links verified.
- [ ] Policy routes verified.
- [ ] About and Contact verified.
- [ ] Home section link/data updates verified.
- [ ] Home journal preview verified.
- [ ] Shop, Login, Signup verified.
- [ ] Sticky PLP filter/sort and empty-state recovery verified.
- [ ] Advanced PLP filter groups and mobile filter dialog behavior verified.
- [ ] Account order WhatsApp actions verified.
- [ ] EN/HI blog listing and category filters verified.
- [ ] Core metadata, canonical, and noindex routes verified.
- [ ] Template-level schema JSON-LD coverage verified.
- [ ] Policy and blog-detail schema JSON-LD coverage verified.
- [ ] EN/HI blog detail internal linking and localization verified.
- [ ] Public-content guards verified.
- [ ] Robots and sitemap policy verified.
- [ ] PDP CTA and details enhancement verified.
- [ ] PDP structured specs, meter guidance, trust panel, and recommendation blocks verified.
- [ ] Accessibility primitives verified (focus-visible, keyboard dialog handling, reduced-motion fallback).
- [ ] Storefront analytics hooks verified (`view_item`, `add_to_cart`, `filter_use`, `whatsapp_click`).
- [ ] Automated premium QA artifact reviewed (route summary + analytics checks + screenshot outputs).
- [ ] Mobile CWV baseline captured and compared against target thresholds.
- [ ] Admin smoke tests verified.
- [ ] Diagnostics/lint review recorded.
- [ ] Launch and rollback runbooks reviewed before release.

