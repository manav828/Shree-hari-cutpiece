# Admin User Guide - Customer Management (EcomShriHari)

Last updated: 2026-03-17

This document explains, in practical admin terms, everything currently implemented for Customer Management and related account operations.

---

## 1) Scope of this guide

This guide covers:
- Admin customer list and advanced filtering
- Admin customer details page (profile, metrics, orders, notes, interactions)
- Admin address management for customers
- Customer status and quick actions (active/suspended/blocked)
- CSV export behavior and how filters affect exports
- Customer-facing account pages/APIs that impact admin workflows
- Data export and deletion request flow from customer side

This guide does not cover future/optional roadmap items (segmentation dashboards, bulk actions, ML analytics, etc.) except where noted.

---

## 2) Feature map (what is implemented)

### Admin pages
- Customer list page: `src/app/admin/customers/page.tsx`
- Customer details page: `src/app/admin/customers/[id]/page.tsx`

### Admin APIs
- List customers: `GET /api/admin/customers`
- Customer details: `GET /api/admin/customers/:id`
- Update customer profile/status/notes: `PATCH /api/admin/customers/:id`
- Add note: `POST /api/admin/customers/:id/notes`
- Interactions log: `GET /api/admin/customers/:id/interactions`
- Address CRUD in admin scope: `POST/PATCH/DELETE /api/admin/customers/:id/addresses`
- CSV export: `GET /api/admin/customers/export`

### Customer-side pages (already implemented)
- Account dashboard: `/account`
- Profile page: `/account/profile`
- Addresses page: `/account/addresses`
- Preferences page: `/account/preferences`

### Customer-side APIs (already implemented)
- Profile: `GET/PATCH /api/account/profile`
- Addresses: `GET/POST /api/account/addresses`, `PATCH/DELETE /api/account/addresses/:id`
- Preferences: `GET/PATCH /api/account/preferences`
- Account data export: `GET /api/account/export`
- Delete request submission: `POST /api/account/delete-request`

---

## 3) Data model used by this module

Primary tables/views used:
- `user_profiles`
- `user_addresses`
- `customer_interaction_logs`
- `orders`
- `order_items`
- `order_addresses`
- `admin_customer_summary` (view optimized for list screen)

Important behavior:
- Most admin list operations read from `admin_customer_summary` for performance.
- Interaction history is written into `customer_interaction_logs` for auditability.
- Address deletion is soft-delete (`is_deleted = true`) instead of hard delete.

---

## 4) Admin customer list - how it works

UI location:
- Admin -> Customers (`/admin/customers`)

Available controls:
- Search (name/email/phone)
- Account status filter
- Registration date range (from/to)
- Last-order date range (from/to)
- Order-count bucket filter (`0`, `1-5`, `5-10`, `10+`)
- LTV min/max filter
- Pagination (20/50/100)
- CSV export button

How export works:
- Export uses current active filters from the list screen.
- Export endpoint mirrors filter logic in list API.
- Output is CSV with key customer fields.

Operator tips:
- Apply filters first, verify table results, then click Export CSV.
- If export returns fewer rows than expected, confirm active date and order-count filters.

---

## 5) Admin customer details - how it works

UI location:
- Click any customer row on list page.

### A) Profile Summary card
Shows:
- Email
- Phone
- Join date
- Last login

### B) Order History card
Shows each order with:
- Expand/collapse control
- Order number, date, status, payment status
- Item lines and units count
- Coupon and discount
- Total amount

Expanded order row includes:
- Amount breakdown (subtotal/shipping/discount/total)
- Shipping snapshot (city/state/pincode)
- Quick links:
  - Open full admin order
  - Invoice/Print route

### C) Customer Metrics card
Shows:
- Total orders
- Total spent
- Average order value
- Last order date

### D) Addresses card (admin management)
Supports:
- Add address
- Edit address
- Delete address (soft-delete)
- Set default shipping
- Set default billing

Validation:
- Required: full name, phone, address line 1, city, state, pincode

### E) Notes & Account card
Supports:
- Account status dropdown (`active`, `suspended`, `blocked`)
- Internal notes update
- Save profile button

### F) Admin Quick Actions (one-click)
Supports:
- Mark Active
- Suspend
- Block
- Send Email (mailto)

Behavior:
- Status quick actions call the same profile PATCH endpoint.
- Every status update is logged in interaction logs.

### G) Recent Interactions card
Supports:
- Add interaction note
- View chronological interactions/events

Data source:
- `GET /api/admin/customers/:id/interactions`

---

## 6) Logging and audit behavior

The system writes interaction logs for:
- Account status changes
- Internal note updates
- Add note action
- Admin address add/update/delete operations
- Customer delete-account requests (from customer profile)

Why this matters:
- Gives operations/support timeline context.
- Enables accountability and troubleshooting.

---

## 7) Customer account features admins should know

Even though these are customer-facing, they generate/support admin operations.

### Account dashboard (`/account`)
Customer sees:
- Welcome block
- Stats: total orders, total spent, member since, last order
- Recent 5 orders
- Quick links to profile/addresses/preferences

### Profile page (`/account/profile`)
Customer can:
- Update full name and phone
- Trigger password reset email
- Download account data (JSON export)
- Submit account deletion request (logged for admin handling)

### Addresses page (`/account/addresses`)
Customer can:
- Add/edit/delete addresses
- Set default shipping/billing

### Preferences page (`/account/preferences`)
Customer can:
- Update newsletter/marketing/sms/language preferences
- See note that transactional emails are always sent

Operational implication for admin:
- Profile/address changes are reflected in customer records.
- Deletion requests appear in interaction logs and should be actioned via support SOP.

---

## 8) API query/filter reference for admins and QA

### List/filter endpoint
`GET /api/admin/customers`

Common query params:
- `page`, `limit`
- `search`
- `status`
- `sortBy`
- `registeredAfter`, `registeredBefore`
- `lastOrderAfter`, `lastOrderBefore`
- `orderCount`
- `ltvMin`, `ltvMax`

### Export endpoint
`GET /api/admin/customers/export`
- Accepts same filter params as list API.

### Interaction endpoint
`GET /api/admin/customers/:id/interactions`
- Supports pagination params (`limit`, `offset`).

---

## 9) Admin workflows (step-by-step)

### Workflow 1: Investigate and segment high-value customers
1. Open admin customer list.
2. Set `LTV min` and optional `orderCount` bucket.
3. Add date windows if needed.
4. Export CSV for downstream analysis.

### Workflow 2: Handle risky account behavior
1. Open customer details.
2. Review interactions and order history.
3. Add internal note summarizing decision.
4. Use quick action `Suspend` or `Block`.
5. Send email via quick action if customer communication is required.

### Workflow 3: Correct broken/default addresses
1. Open customer details -> Addresses.
2. Edit incorrect fields or add a replacement address.
3. Set default shipping/billing explicitly.
4. Delete obsolete address entries.

### Workflow 4: Respond to data/privacy requests
1. Check interaction logs for delete request events.
2. Coordinate with support/compliance process.
3. Confirm customer identity before irreversible actions.

---

## 10) Error handling and troubleshooting

If customer list appears empty:
- Check active filters first (date/orderCount/LTV can narrow aggressively).
- Remove filters and retry.

If status update fails:
- Ensure status value is one of `active`, `suspended`, `blocked`.
- Retry and verify API/network response in browser devtools.

If export mismatch occurs:
- Verify export invoked with same active filters as list state.
- Clear filters and compare base export vs base list.

If addresses fail to save:
- Confirm required fields are not empty.
- Ensure pincode/phone text values are present.

If password reset email not received:
- Ask customer to check spam folder.
- Re-trigger from profile page and verify email on profile.

---

## 11) Security and access notes

- Admin APIs use server-side admin client and should remain restricted to trusted admin routes.
- Account APIs require bearer auth token validation.
- Soft delete is used for addresses to reduce accidental data loss.
- Deletion request endpoint currently logs request for manual processing (no automatic hard delete).

---

## 12) What remains (for admin awareness)

Not fully complete yet:
- Customer list hover row actions
- Order item-level product detail rendering inside admin customer order expansion
- Styling/responsiveness hardening pass for admin pages
- Optional: recommended products on customer dashboard
- Optional/polish: bulk actions, segmentation dashboards, analytics dashboards, advanced performance/testing backlog

---

## 13) Quick checklist for new admin onboarding

1. Learn list filters and export behavior.
2. Practice opening details and reading interaction timeline.
3. Practice status quick actions and note writing discipline.
4. Practice address corrections and default toggles.
5. Understand deletion request handling SOP (manual support workflow).

---

## 14) File-level implementation reference

Core admin files:
- `src/app/admin/customers/page.tsx`
- `src/app/admin/customers/[id]/page.tsx`
- `src/app/api/admin/customers/route.ts`
- `src/app/api/admin/customers/[id]/route.ts`
- `src/app/api/admin/customers/[id]/notes/route.ts`
- `src/app/api/admin/customers/[id]/interactions/route.ts`
- `src/app/api/admin/customers/[id]/addresses/route.ts`
- `src/app/api/admin/customers/export/route.ts`

Customer account files:
- `src/app/account/page.tsx`
- `src/app/account/profile/page.tsx`
- `src/app/account/addresses/page.tsx`
- `src/app/account/preferences/page.tsx`
- `src/app/api/account/profile/route.ts`
- `src/app/api/account/addresses/route.ts`
- `src/app/api/account/addresses/[id]/route.ts`
- `src/app/api/account/preferences/route.ts`
- `src/app/api/account/export/route.ts`
- `src/app/api/account/delete-request/route.ts`
- `src/lib/apiAuth.ts`

---

If you want, the next document I can generate is a shorter 1-page "Daily Operations Runbook" for your support/admin team with only practical actions and no technical details.
