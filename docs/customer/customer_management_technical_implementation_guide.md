# Customer Management - Technical Implementation Deep Dive

Last updated: 2026-03-17
Scope: Admin customer module + connected account-side implementation
Audience: product owner, admin lead, engineering, QA

## 1. Implementation summary

This document explains technical behavior that is not fully visible from UI screens.
It covers:
- API contracts and server behavior
- Data model dependencies and computed fields
- Interaction/audit logging behavior
- Filter-parity logic between list and export
- Address management internals (soft delete + default handling)
- Account-side endpoints implemented for customer support workflows

## 2. Module architecture overview

Main UI pages:
- `src/app/admin/customers/page.tsx`
- `src/app/admin/customers/[id]/page.tsx`

Main APIs:
- `src/app/api/admin/customers/route.ts`
- `src/app/api/admin/customers/export/route.ts`
- `src/app/api/admin/customers/[id]/route.ts`
- `src/app/api/admin/customers/[id]/interactions/route.ts`
- `src/app/api/admin/customers/[id]/notes/route.ts`
- `src/app/api/admin/customers/[id]/addresses/route.ts`

Customer account-side APIs implemented and relevant to support/compliance:
- `src/app/api/account/profile/route.ts`
- `src/app/api/account/preferences/route.ts`
- `src/app/api/account/addresses/route.ts`
- `src/app/api/account/addresses/[id]/route.ts`
- `src/app/api/account/export/route.ts`
- `src/app/api/account/delete-request/route.ts`

## 3. Data model used by admin customer module

### 3.1 Primary read model
`admin_customer_summary` view is the main source for list and summary fields.

Used fields:
- `id`
- `email`
- `full_name`
- `phone`
- `created_at`
- `last_sign_in_at`
- `account_status`
- `total_orders`
- `lifetime_value`
- `last_order_date`

### 3.2 Related entities on detail page
- `user_profiles`
  - `internal_notes`
  - preference flags (`newsletter_opt_in`, `marketing_opt_in`, `sms_opt_in`, `preferred_language`)
- `orders`
  - order-level customer history summary
- `order_items`
  - item line and unit counts
- `order_addresses`
  - shipping location snapshot by order
- `user_addresses`
  - current customer address book
- `customer_interaction_logs`
  - timeline/audit entries for admin actions

## 4. Customer list API behavior

Endpoint: `GET /api/admin/customers`

File: `src/app/api/admin/customers/route.ts`

### 4.1 Query parameters
- pagination: `page`, `limit`
- search and status: `search`, `status`
- date filters:
  - `registeredAfter`, `registeredBefore`
  - `lastOrderAfter`, `lastOrderBefore`
- numeric filters:
  - `ltvMin`, `ltvMax`
- bucket filter:
  - `orderCount` (`all`, `0`, `1-5`, `5-10`, `10+`)
- sorting:
  - `sortBy` mapped to safe fields via `SORT_MAP`

### 4.2 Search implementation details
Search applies an `or` condition over:
- email ILIKE
- full_name ILIKE
- phone ILIKE

Search string is sanitized for commas and `%` before query assembly.

### 4.3 Output shape
Returns `AdminCustomersListResponse` with:
- `customers`
- `page`
- `limit`
- `total`
- `total_pages`

## 5. CSV export parity logic

Endpoint: `GET /api/admin/customers/export`

File: `src/app/api/admin/customers/export/route.ts`

Important implementation rule:
- Export endpoint mirrors the same filter set as list endpoint.
- This ensures what admin sees in filtered table is what admin exports.

Technical points:
- max export currently limited by query `.limit(10000)`
- csv escaping handles commas, quotes, line breaks
- content headers include `Content-Disposition` attachment filename by date

## 6. Customer detail API behavior

Endpoint: `GET /api/admin/customers/[id]`

File: `src/app/api/admin/customers/[id]/route.ts`

### 6.1 Data fetched in parallel
The API uses parallel fetching to reduce latency for:
- summary row
- profile row
- orders
- non-deleted addresses
- interactions
- repeat-customer reference set (for repeat metric approximation)

### 6.2 Computed values not obvious from UI
Computed server-side fields include:
- `total_spent` from lifetime value
- `avg_order_value = total_spent / total_orders`
- `repeat_purchase_rate` approximation based on current implementation logic
- per-order `item_lines` and `units_count` derived from `order_items`
- per-order shipping city/state/pincode from `order_addresses`

## 7. Customer update behavior (PATCH)

Endpoint: `PATCH /api/admin/customers/[id]`

File: `src/app/api/admin/customers/[id]/route.ts`

### 7.1 Upsert behavior
Updates are written to `user_profiles` with upsert on `id`.
This means profile row is created if missing.

### 7.2 Validation rules
- `account_status` allowed values: `active`, `suspended`, `blocked`
- unknown/no valid fields -> 400 response

### 7.3 Hidden side-effect logging
When certain fields are updated, interaction logs are created:
- account status change -> `status_changed`
- internal note update -> `note_added`

This creates an audit trail without requiring manual timeline updates.

## 8. Interaction and notes APIs

### 8.1 Read interactions
Endpoint: `GET /api/admin/customers/[id]/interactions`

Supports pagination with:
- `limit`
- `offset`

### 8.2 Add note/interaction
Endpoint: `POST /api/admin/customers/[id]/notes`

Allowed event types:
- `note_added`
- `support_contact`
- `status_changed`
- `email_sent`
- `order_placed`

If invalid event type is sent, server falls back to `note_added`.

## 9. Address management internals

Endpoint group:
- `POST /api/admin/customers/[id]/addresses`
- `PATCH /api/admin/customers/[id]/addresses`
- `DELETE /api/admin/customers/[id]/addresses`

File: `src/app/api/admin/customers/[id]/addresses/route.ts`

### 9.1 Required fields on create
Create requires:
- full_name
- phone
- address_line1
- city
- state
- pincode

### 9.2 Default address handling
When setting default shipping or billing:
- existing defaults for that user are cleared first (`clearDefaultsForUser`)
- then target address gets default flag

This guarantees only one default per type.

### 9.3 Deletion strategy
Delete is soft delete:
- `is_deleted = true`
- default flags are unset

No hard row delete on address delete endpoint.

### 9.4 Address action logs
Each address operation writes to `customer_interaction_logs` with event data metadata:
- add
- patch
- delete

## 10. Admin customers page component split

Implemented refactor:
- Filters in separate component:
  - `src/components/admin/customers/CustomersFilters.tsx`
- Listing/table in separate component:
  - `src/components/admin/customers/CustomersListTable.tsx`

### 10.1 Default vs optional filters
Default visible filters:
- search
- status
- order count
- page size

Optional filters via Add More Filters checkboxes:
- registered date range
- last order date range
- LTV min/max

When optional filter is toggled off, associated filter values are cleared.

## 11. Account-side implementation connected to customer support

### 11.1 Account data export
Endpoint: `GET /api/account/export`

Purpose:
- allows customer data export request/response payload for compliance support flow

### 11.2 Account delete request
Endpoint: `POST /api/account/delete-request`

Purpose:
- records deletion intent for admin follow-up and compliance process

### 11.3 Customer profile and preferences APIs
Provide editable customer self-service endpoints that affect support context:
- profile data
- communication preferences
- address book

## 12. Non-UI implementation details currently in place

1. Filter parity between list and export implemented.
2. Address delete is soft delete, not hard delete.
3. Interaction timeline is auto-populated by several admin actions.
4. Profile updates use upsert to handle missing profile records.
5. Customer detail aggregates cross-table data in one API response.

## 13. Error handling pattern

Most admin customer APIs follow:
- parse + validate inputs
- guarded DB operation
- standardized JSON error with HTTP 4xx/5xx
- catch-all fallback message if thrown error is unknown type

## 14. Security and operational notes

1. Admin authentication is currently localStorage-gated in UI shell.
2. Sensitive admin APIs should be protected by server-side role checks in production hardening phase.
3. Interaction logs should be preserved for audit/compliance review.

## 15. QA checklist (technical)

### List and filters
- status filter applies correctly
- optional filters only affect queries when enabled
- unchecking optional filter clears corresponding values

### Export
- export rows match current filtered list result set
- csv escaping works for commas and quotes

### Detail page
- metrics and order snapshots load correctly
- interactions pagination returns expected ordering

### Addresses
- create validates required fields
- default shipping/billing uniqueness enforced
- delete marks soft delete and removes default flags

### Updates
- profile patch updates user_profiles
- status and notes generate interaction logs

## 16. Known current limitations

1. Repeat purchase rate logic is implementation-specific and may need domain-level redefinition.
2. Export limit currently capped at 10,000 rows in one request.
3. Hard RBAC enforcement for admin APIs is still a recommended next step.

## 17. Suggested next technical improvements

1. Add server-side admin role checks/middleware for all `/api/admin/*` routes.
2. Add integration tests for filter-parity between list/export.
3. Add stricter schema validation layer (zod or equivalent) for admin/customer APIs.
4. Add structured audit metadata (admin id/source) on all write operations.
5. Add retry/backoff and telemetry for large export operations.
