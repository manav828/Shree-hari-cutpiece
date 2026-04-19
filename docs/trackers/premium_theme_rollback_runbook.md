# Premium Theme Rollback Runbook

Last updated: 2026-04-01
Owner: Frontend + QA + Release
Purpose: Define fast and safe rollback steps for premium storefront deployments.

## 1) Use Cases

Use this runbook when:

1. A production deployment causes storefront outages or severe regressions.
2. SEO-critical pages return 404/500 after release.
3. Checkout/cart/public navigation is blocked for users.

## 2) Preconditions

1. Confirm current production commit SHA.
2. Confirm last known-good commit SHA.
3. Confirm deployment platform access and permissions.
4. Capture incident timestamp and impacted routes.

## 3) Full Rollback (Fastest)

1. Checkout release branch.
2. Reset deploy target to last known-good commit.
3. Trigger redeploy from that commit.
4. Verify route health for:
   - /
   - /shop
   - /shop/<slug>
   - /blogs
   - /contact
5. Validate cart open/add flow and footer legal links.

## 4) Selective Rollback (Folder-Based)

Use when only one area is broken and full rollback is not required.

1. Identify impacted scope:
   - Layout/UI shell: src/components/layout
   - Theme UI: src/themes/classic
   - SEO/schema: src/lib/seo.ts, src/lib/seoSchema.ts, src/app/sitemap.ts, src/app/robots.ts
2. Revert only impacted folder/files to last known-good commit.
3. Redeploy.
4. Re-run targeted verification for the affected routes.

## 5) Deployment Rollback

1. Promote previous successful deployment in the hosting dashboard, or
2. Redeploy last known-good git SHA.
3. Record rollback deployment ID and timestamp.

## 6) Post-Rollback Validation

1. Route health sweep on core storefront routes.
2. Metadata sanity check on /, /shop, /blogs.
3. Confirm robots.txt and sitemap.xml still respond.
4. Confirm no new console/runtime errors on home, PLP, PDP.

## 7) Communication Template

1. Incident detected: <time>
2. Rollback started: <time>
3. Rollback completed: <time>
4. Last known-good SHA: <sha>
5. Impacted scope: <routes/components>
6. Next action owner: <name>

## 8) Follow-Up

1. Open RCA issue within 24 hours.
2. Add failing scenario to verification guide.
3. Add automated test coverage for rollback-triggering regression.
