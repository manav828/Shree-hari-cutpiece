# Premium Theme Launch Checklist

Last updated: 2026-04-01
Owner: Frontend + QA + Release
Purpose: Pre-launch and go-live checklist for premium storefront release readiness.

## 1) Release Inputs

1. Confirm release branch and commit SHA.
2. Confirm deployment target environment.
3. Confirm rollback target SHA (last known good).
4. Confirm owner approvals: Frontend, QA, SEO, Release.

## 2) Pre-Launch Technical Checks

1. Run lint:
   - `npm run lint`
2. Confirm no blocking TypeScript/runtime errors in touched files.
3. Confirm route health on core pages:
   - `/`
   - `/shop`
   - `/shop/<slug>`
   - `/about`
   - `/contact`
   - `/blogs`
   - `/hi/blogs`
   - policy routes
4. Confirm auth routes (`/login`, `/signup`) load and preserve noindex metadata.
5. Run automated premium QA artifact pass:
   - `npm run qa:premium`
6. Confirm latest generated report path exists:
   - `docs/trackers/artifacts/premium-theme-qa/<YYYY-MM-DD>/qa-report.json`
7. Confirm report route summary is full pass (expected 24/24 in current scope).
8. Capture or verify mobile Lighthouse baselines from production-mode server for `/` and `/shop`:
   - `docs/trackers/artifacts/premium-theme-qa/<YYYY-MM-DD>/lighthouse-mobile-home.prod.json`
   - `docs/trackers/artifacts/premium-theme-qa/<YYYY-MM-DD>/lighthouse-mobile-shop.prod.json`

## 3) SEO Readiness Checks

1. Confirm canonical tags exist on all indexable templates.
2. Confirm OG/Twitter metadata exists on shareable templates.
3. Confirm sitemap and canonical host consistency.
4. Confirm robots policy includes private-route disallow rules.
5. Confirm schema JSON-LD presence on core templates.

## 4) Storefront Functional Checks

1. Navbar/cart/footer behavior works on desktop and mobile.
2. Cart drawer opens/closes via click + `Esc`.
3. PLP filters and sorting work with expected result counts.
4. PDP add-to-cart and stylist WhatsApp CTA work.
5. EN/HI blog listing and detail routes render correctly.
6. Visual QA screenshots are captured for desktop + mobile core routes.

## 5) Analytics Checks

1. Verify `view_item` on PDP.
2. Verify `add_to_cart` from PLP and PDP.
3. Verify `filter_use` on PLP filter/sort/category changes.
4. Verify `whatsapp_click` from key CTA locations.
5. Confirm event envelope fields (`event_source`, `timestamp`) are present.
6. Cross-check `analyticsReport.checks` in QA artifact report are all `true`.

## 6) Content and Trust Checks

1. Confirm no placeholder phone/map/email remains on storefront.
2. Confirm no obvious test/demo/dummy/lorem blog content is publicly visible.
3. Confirm legal links open correct policy routes.
4. Confirm policy pages render with complete section content.

## 7) Go-Live Steps

1. Deploy approved release commit.
2. Run smoke checks on live environment for core routes.
3. Validate sitemap and robots endpoints.
4. Validate one PDP purchase-intent path end-to-end (browse -> add to cart).

## 8) Post-Launch Monitoring (First 24 Hours)

1. Monitor error logs and runtime exceptions.
2. Monitor conversion funnel (view -> add_to_cart -> checkout start).
3. Monitor analytics event ingestion for key storefront events.
4. Monitor SEO crawl endpoints (`/robots.txt`, `/sitemap.xml`).

## 9) Incident Response

1. If major blocker appears, trigger rollback process:
   - `docs/trackers/premium_theme_rollback_runbook.md`
2. Record incident timestamp, impacted routes, and fix owner.
3. Prepare RCA issue and update verification runbook with added regression case.
