# Coupon & Discount PRD Implementation Tracker

Last updated: 2026-03-16

## Status Legend
- [x] Done
- [~] In Progress
- [ ] Pending
- [!] Blocked

## PRD Checklist

### 1) Database & Backend
- [x] Coupon domain types and eligibility utility
- [x] Admin coupon APIs (list/create/update)
- [x] Storefront coupon APIs (banner, eligible, validate)
- [x] Coupon migration SQL file created
- [x] Migration SQL executed on Supabase project
- [x] Coupon redemption write on final order placement
- [x] DB-side transaction/anti-race redemption guard

### 2) Admin UX
- [x] Basic coupons management page implementation
- [x] Split listing page and action/form page
- [x] Labeled form fields with helper text
- [x] User picker UI for specific-user coupons
- [x] Toggle switch controls for visibility and targeting
- [x] Destination URL dropdown with "Other" custom input
- [x] Per-field required markers and inline validation errors
- [x] Coupon analytics summary cards

### 3) Storefront UX
- [x] Homepage coupon banner integration
- [x] Checkout coupon input + apply flow
- [x] Checkout "Show Available Coupons" modal
- [x] Theme-compatible integration for classic + luxury

### 4) Documentation & Tracking
- [x] PRD file created
- [x] Live tracker file created
- [x] Keep tracker updated immediately on each completed task

## Change Log
- 2026-03-16: Created tracker and baseline checklist from PRD.
- 2026-03-16: Fixed admin client to use `SUPABASE_SERVICE_ROLE_KEY` instead of anon key in server APIs.
- 2026-03-16: Added `SUPABASE_SERVICE_ROLE_KEY` to local `.env.local` from Supabase project API keys.
- 2026-03-16: Executed `supabase_coupons_migration.sql` directly on Supabase project via Management API.
- 2026-03-16: Split admin coupons into separate listing page and create/edit form pages.
- 2026-03-16: Added labeled fields + helper text (including destination URL explanation) and specific-user selector.
- 2026-03-16: Validated APIs end-to-end (`/api/admin/coupons`, `/api/admin/users`) and verified coupon create success.
- 2026-03-16: Fixed Supabase client boundary to prevent service-role client usage in browser-rendered pages and reduce auth lock contention.
- 2026-03-16: Updated coupon form UX with switch controls, destination presets + custom URL, and strict field-level validation (no top generic form error).
- 2026-03-16: Added secure server checkout endpoint with auth-token verification, final coupon revalidation, and coupon redemption write at order placement.
- 2026-03-16: Added second-pass redemption limit check before redemption insert as interim anti-race safeguard; full DB-transactional guard remains in progress.
- 2026-03-16: Added and executed `supabase_coupon_atomic_redemption.sql` with `redeem_coupon_atomic(...)` function for transactional coupon limit enforcement.
- 2026-03-16: Updated checkout order placement to use atomic coupon redemption RPC and fail safely when limits are reached.
- 2026-03-16: Added `/api/admin/coupons/analytics` and surfaced analytics summary cards in admin coupon listing page.
