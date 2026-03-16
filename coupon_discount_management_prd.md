# Product Requirements Document (PRD)
## Coupon and Discount Management Module

**Project:** EcomShriHari  
**Date:** March 16, 2026  
**Owner:** Product + Engineering  
**Status:** Draft v1

---

## 1) Context and Problem

Currently, only Product Management and Order Management are implemented meaningfully in admin. Coupon and Discount pages are placeholder/dummy. The business needs a real coupon system that:

1. Works end-to-end in Admin + Frontend.
2. Supports general coupons and user-specific coupons.
3. Supports eligibility rules such as minimum completed orders (dynamic value like 3, 4, 5).
4. Exposes available coupons in key user journeys:
   - Homepage top banner (promotional discovery).
   - Checkout coupon input flow (conversion support).

---

## 2) Goals

### Business Goals
- Increase conversion rate at checkout.
- Increase repeat purchases using targeted offers.
- Improve campaign control for admins without developer dependency.

### User Goals
- Discover relevant coupons easily.
- Understand why a coupon is or is not applicable.
- Apply a valid coupon with minimal friction.

### Admin Goals
- Create, schedule, target, and monitor coupons.
- Control who can see/use each coupon.
- Prevent abuse and overspending.

---

## 3) Non-Goals (Phase 1)

- Full marketing automation engine.
- Third-party CRM journey orchestration.
- Stackable promotions with complex priority across dozens of rule groups.

These can be considered in Phase 2/3.

---

## 4) Personas

1. **Guest Shopper**
   - Browses products and may convert at checkout.
2. **Logged-in Customer**
   - Has order history and eligibility profile.
3. **Admin/Marketing Manager**
   - Creates and manages coupon campaigns.

---

## 5) User Stories

### Customer Stories
- As a shopper, I want to see current offers on homepage banner so I know available deals quickly.
- As a shopper on checkout, I want a “Show Available Coupons” button that opens a modal with valid coupons for me.
- As a shopper, I want clear validation messages when a coupon cannot be used.

### Admin Stories
- As an admin, I want to create public coupons for all users.
- As an admin, I want to restrict coupons to users with fewer than N completed orders (N is dynamic).
- As an admin, I want to create user-specific coupons (single user or user list).
- As an admin, I want to set usage limits, validity dates, and minimum order value.

---

## 6) Scope

## 6.1 Frontend Surfaces

### A) Homepage Top Banner Coupon Slot
- Display one or more active promotional coupons in top banner area.
- Rules:
  - Only active and currently visible coupons.
  - Optional segmentation (guest, logged-in, specific user segments).
  - Respect start/end datetime and audience rules.

### B) Checkout Coupon UX
- Existing coupon input remains.
- Add secondary button: **Show Available Coupons**.
- On click: open modal showing eligible coupons for current user/cart.
- Each coupon card should show:
  - Code
  - Benefit (e.g., 10% off, ₹200 off)
  - Conditions (min order, expiry, eligibility)
  - “Apply” action
- On apply:
  - Coupon code fills/applies to checkout summary.
  - Totals recalculate instantly.

## 6.2 Admin Surfaces

### A) Coupon List
- Columns: Code, Type, Value, Status, Visibility, Validity, Usage, Audience, Last Updated.
- Search + filters: active/inactive, date range, coupon type, visibility, audience type.

### B) Coupon Create/Edit Form
- Core fields:
  - Coupon code (unique)
  - Name/internal label
  - Description
  - Discount type: Percentage / Fixed amount / Free shipping (optional phase toggle)
  - Discount value
  - Max discount cap (for percentage)
  - Start datetime, end datetime
  - Active toggle

- Eligibility rules:
  - Minimum cart subtotal
  - User order-count rule:
    - Condition type: `<= N completed orders`
    - N is admin-defined dynamic integer (e.g., 3, 4, 5)
  - New user only (derived: completed_orders = 0)
  - Specific users (manual select/search by email or user id)
  - Optional: specific user groups/tags (phase 2)

- Usage controls:
  - Global usage limit
  - Per-user usage limit
  - One-time only flag

- Visibility controls:
  - Show on homepage banner: yes/no
  - Show in checkout available-coupons modal: yes/no
  - Show in account offers area (phase 2)

### C) Analytics Summary (within coupon module)
- Redemptions, total discount cost, revenue influenced, conversion uplift proxy.

---

## 7) Functional Requirements

## 7.1 Coupon Types
- **PERCENTAGE**: e.g., 10% off.
- **FIXED**: e.g., ₹200 off.
- (Optional) **FREE_SHIPPING** in phase 1.1.

## 7.2 Eligibility Engine (Core)

At apply time, all validations run in deterministic order:
1. Coupon exists and active.
2. Current datetime is within validity window.
3. Coupon audience eligibility:
   - Public/all users OR
   - User-specific OR
   - Rule-based segment.
4. User order count condition (if configured).
5. Cart constraints (minimum subtotal, applicable items/categories if configured).
6. Usage limits (global + per user).
7. Final calculation and cap constraints.

If any check fails, return explicit reason code + human readable message.

## 7.3 Order Count Rule (Requested Feature)
- Admin sets `max_completed_orders_for_eligibility = N`.
- User can view and use coupon only if user completed order count is `<= N`.
- Completed order definition should map to final successful statuses (e.g., Delivered/Completed; configurable).

## 7.4 User-Specific Coupons (Requested Feature)
- Coupon can be targeted to:
  - Single user
  - Multiple selected users
- Visibility + usage restricted strictly to assigned users.
- Support import via CSV (phase 2), manual assignment in phase 1.

## 7.5 Frontend Discovery Rules

### Homepage Banner
- Show only coupons with `show_on_home_banner = true` and currently eligible by time/audience.
- If user not logged in and coupon needs login-based eligibility, either:
  - hide coupon OR
  - show teaser with “Login to unlock” (admin configurable).

### Checkout Modal
- API returns only coupons eligible for current user + cart context.
- Modal should not display non-eligible coupons by default.
- Optional toggle (phase 2): “Show all coupons with reasons”.

---

## 8) Data Model (Supabase/Postgres)

## 8.1 Tables

### `coupons`
- `id` (uuid, pk)
- `code` (text, unique, case-insensitive)
- `name` (text)
- `description` (text)
- `discount_type` (enum: PERCENTAGE, FIXED, FREE_SHIPPING)
- `discount_value` (numeric)
- `max_discount_cap` (numeric, nullable)
- `min_cart_subtotal` (numeric, nullable)
- `status` (enum: ACTIVE, INACTIVE, ARCHIVED)
- `starts_at` (timestamptz)
- `ends_at` (timestamptz, nullable)
- `global_usage_limit` (int, nullable)
- `per_user_usage_limit` (int, nullable)
- `show_on_home_banner` (boolean default false)
- `show_on_checkout_modal` (boolean default true)
- `max_completed_orders_for_eligibility` (int, nullable)
- `created_by` (uuid)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `coupon_user_assignments`
- `id` (uuid, pk)
- `coupon_id` (uuid, fk -> coupons.id)
- `user_id` (uuid, fk -> auth/users profile)
- `created_at` (timestamptz)
- Unique constraint: (`coupon_id`, `user_id`)

### `coupon_redemptions`
- `id` (uuid, pk)
- `coupon_id` (uuid, fk)
- `user_id` (uuid, nullable for guest cases if allowed)
- `order_id` (uuid, fk)
- `discount_amount` (numeric)
- `redeemed_at` (timestamptz)

### Optional Phase 2: `coupon_rules`
- JSON/rule table for advanced AND/OR targeting.

## 8.2 Security (RLS)
- Admin-only CRUD on coupon tables.
- Read eligible coupons endpoint should return filtered records, never raw unrestricted coupon data.
- Redemptions inserted only via secure server action/API after successful validation.

---

## 9) API / Server Actions Contracts

## 9.1 Admin APIs
- `POST /api/admin/coupons` Create coupon.
- `PATCH /api/admin/coupons/:id` Update coupon.
- `GET /api/admin/coupons` List coupons with filters.
- `POST /api/admin/coupons/:id/assign-users` Assign specific users.

## 9.2 Storefront APIs
- `GET /api/coupons/banner` Return coupons eligible for homepage banner context.
- `POST /api/coupons/eligible` Input: cart + user context, output eligible coupon list.
- `POST /api/coupons/validate-apply` Input coupon code + cart/user, output validated discount + breakdown.

## 9.3 Checkout Integrity
- Coupon must be revalidated at final order placement server-side.
- Client-side apply is only preview; order creation is source of truth.

---

## 10) UX Requirements

## 10.1 Checkout Modal UX
- Trigger button next to coupon input: **Show Available Coupons**.
- Modal includes:
  - Search by coupon code (optional phase 1 if small list)
  - Coupon cards with clear savings statement
  - “Apply” action per card
- Empty state: “No coupons available for your cart right now.”

## 10.2 Feedback Messages
- Success: “Coupon applied successfully.”
- Failure examples:
  - “Coupon expired.”
  - “Minimum order amount not met.”
  - “This coupon is for selected users only.”
  - “Available only for customers with up to N completed orders.”

---

## 11) Business Rules and Edge Cases

- Coupon codes are case-insensitive (`save20` == `SAVE20`).
- If both `ends_at` and usage limits are present, coupon invalid when either condition is crossed.
- Percentage discount cannot reduce subtotal below zero.
- Fixed discount capped at subtotal value.
- Guest checkout support:
  - Public coupons can apply.
  - User-specific and order-history restricted coupons require login.
- Prevent race conditions using transactional redemption check at order placement.

---

## 12) Reporting & Metrics

Track per coupon:
- Views (banner impressions, modal impressions)
- Applies
- Successful redemptions
- Redemption rate
- Discount spend
- Revenue influenced
- New vs repeat buyer usage

Dashboard KPIs:
- Top performing coupons by revenue influenced
- Most expensive coupons by discount cost
- Conversion uplift for users exposed to coupon surfaces (where measurable)

---

## 13) Suggested Ways to Make Module More Dynamic

1. **Rule Builder (AND/OR conditions)**
   - Conditions: order count, cart value, category inclusion, payment method, location.

2. **Auto-apply Best Coupon**
   - System auto-selects coupon giving max benefit among eligible set.

3. **Campaign Priorities and Stackability**
   - Configure whether coupons can stack with shipping offers or not.

4. **A/B Testing for Coupon Banner Copy**
   - Test message and design variants to improve CTR.

5. **Lifecycle Triggers**
   - First-order coupon, win-back coupon for inactive users, post-purchase next-order coupon.

6. **Budget Guardrails**
   - Stop coupon automatically after max discount budget is exhausted.

7. **Per-category / Per-product restrictions**
   - Useful for margin-safe promotion strategy.

8. **Personalized sorting in modal**
   - Show “best savings” first based on current cart.

---

## 14) Phased Delivery Plan

### Phase 1 (MVP)
- Admin CRUD for coupons.
- Public + user-specific targeting.
- Order-count eligibility rule (`<= N completed orders`).
- Homepage banner integration.
- Checkout “Show Available Coupons” modal.
- Apply + revalidate at order placement.

### Phase 2
- Advanced filters/segments and rule builder.
- CSV bulk user assignment.
- Rich analytics dashboard.
- Show ineligible coupons with reason toggles.

### Phase 3
- Automated campaign triggers.
- Budget optimization and AI-based coupon recommendations.

---

## 15) Acceptance Criteria (MVP)

1. Admin can create a coupon and set visibility for homepage + checkout modal.
2. Admin can set dynamic order-count eligibility (`<= N completed orders`).
3. Admin can assign coupon to selected users only.
4. Homepage banner shows only active and eligible coupons.
5. Checkout modal shows only eligible coupons for current user/cart.
6. Coupon application recalculates totals correctly.
7. Final order placement revalidates coupon server-side.
8. Usage limits and expiry are enforced.
9. Audit trail/redemption records are persisted.

---

## 16) Open Questions for You (Need Confirmation)

1. Should guest users be able to use public coupons, or must all coupon usage require login?
2. For “completed orders count,” which order statuses should be counted exactly (Delivered only, or Delivered + Completed)?
3. Should multiple coupons be allowed on one order (stacking), or strictly one coupon per order in MVP?
4. For homepage banner, do you want a single highest-priority coupon shown, or a rotating set/carousel?
5. Do you want FREE_SHIPPING coupon type in MVP or keep only Percentage + Fixed for now?

---

## 17) Implementation Notes for Current Codebase

- Existing admin page route is available for coupon UI integration at `src/app/admin/coupons/page.tsx`.
- Checkout integration likely belongs in `src/app/checkout/page.tsx` and related checkout components.
- Homepage banner rendering can be integrated in home section components under `src/components/home/`.
- Coupon server actions can be added under `src/app/actions/` and/or API handlers under `src/app/api/`.
- Supabase table access patterns should follow existing clients in `src/lib/supabase.ts` and `src/lib/supabaseAdminClient.ts`.
