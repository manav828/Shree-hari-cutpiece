# CMS Go-Live Smoke Test Runbook

Purpose: Close all pending CMS checklist items in one run.

## Pre-check
1. Run SQL from db/cms_verification_queries.sql.
2. Confirm active banners include placement rows for announcement_bar, popup, and shop_top.
3. Confirm storage bucket cms-assets exists.

## Admin UI Checks
1. Open /admin/cms.
2. Hero tab: change headline, save, verify success toast.
3. Description tab: change one point text, save.
4. Store Info tab: enter invalid store_maps_url and verify validation error.
5. Categories tab: create one test category, verify appears in table.
6. Categories tab: reorder one item up/down and verify order updates.
7. Categories tab: toggle one category inactive.
8. Categories tab: try duplicate slug and verify error.
9. Banners tab: create one future-start banner and verify status is Scheduled.
10. Banners tab: create one banner with end_date before start_date and verify error.
11. Banners tab: create one banner with invalid color and verify error.

## Storefront Checks
1. Homepage: verify updated hero headline appears (allow up to 30 seconds).
2. Homepage: verify inactive category is hidden.
3. Homepage: verify popup appears once per session.
4. New browser session: verify popup appears again.
5. Shop page: verify shop top banner appears when active.
6. Announcement bar: verify CMS banner shows; if no active announcement banner, coupon fallback appears.

## Data Integrity Checks
1. Soft-delete one category and confirm it disappears from admin list and homepage.
2. Soft-delete one banner and confirm it disappears from admin active list and storefront.
3. Verify soft-deleted rows still exist in DB with deleted_at populated.

## Suggested Closeout Updates
1. Mark completed items in docs/trackers/cms_implementation_checklist.md.
2. Add test evidence notes (date/time, page checked, result).
3. Commit with message: feat(cms): finalize rollout verification and smoke tests.
