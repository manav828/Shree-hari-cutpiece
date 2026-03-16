# Customer Management — Resume File (Read This First)

**Project:** EcomShriHari  
**Module:** Customer Management  
**Last Updated:** 2026-03-16

---

## 1) Purpose of this file
Use this as the single source of truth to continue implementation next session.
If asked to continue, start from **Section 7 (Immediate Next Tasks)**.

---

## 2) Current implementation status

### ✅ Completed (working)
1. **DB migration created and executed**
   - File: `supabase_customers_migration.sql`
   - Includes: `user_profiles`, `user_addresses`, `customer_interaction_logs`, indexes, RLS policies, `admin_customer_summary` view
   - Execution confirmed: `CUSTOMERS_MIGRATION_EXECUTED`

2. **Admin customer list API**
   - File: `src/app/api/admin/customers/route.ts`
   - Features: pagination, search, status filter, sort

3. **Admin customer details + update API**
   - File: `src/app/api/admin/customers/[id]/route.ts`
   - Features:
     - `GET`: profile summary, orders, addresses, interactions, metrics
     - `PATCH`: update status, notes, preferences/profile fields

4. **Admin customer list page**
   - File: `src/app/admin/customers/page.tsx`
   - Features: live API data, search, status filter, pagination, row link to details

5. **Admin customer details page**
   - File: `src/app/admin/customers/[id]/page.tsx`
   - Features: profile summary, metrics cards, orders table, addresses panel, interactions list, inline profile save form

6. **Customer types**
   - File: `src/types/customers.ts`

7. **Tracker updated**
   - File: `customer_management_implementation_tracker.md`

---

## 3) What is still pending (Phase 1)

### High priority (next)
1. `POST /api/admin/customers/[id]/notes`
2. `GET /api/admin/customers/[id]/interactions`
3. Add dedicated **Add Note** form/action on details page (not only inline notes field)
4. `GET /api/admin/customers/export` (CSV)

### Medium priority
5. Improve list filters (date ranges, order-count buckets, LTV min/max)
6. Address CRUD in admin details page

### Later (still Phase 1)
7. Storefront account APIs/pages:
   - `/api/account/profile`
   - `/api/account/addresses` (+ `[id]`)
   - `/api/account/preferences`

---

## 4) Files touched for customer module

### Database
- `supabase_customers_migration.sql`

### API
- `src/app/api/admin/customers/route.ts`
- `src/app/api/admin/customers/[id]/route.ts`

### Admin UI
- `src/app/admin/customers/page.tsx`
- `src/app/admin/customers/[id]/page.tsx`

### Types
- `src/types/customers.ts`

### Planning / docs
- `customer_management_prd.md`
- `customer_management_implementation_tracker.md`

---

## 5) Important implementation notes

1. **Server-side data access** uses `supabaseAdmin` from `src/lib/supabaseAdminClient.ts`.
2. Customer list API reads from **`admin_customer_summary` view** (not direct heavy joins per request).
3. Detail API currently computes repeat metric in-app; can be improved later with dedicated aggregate query.
4. Status and notes updates are logged into `customer_interaction_logs` inside `PATCH /[id]`.
5. Keep UI/style consistent with existing admin pages (white cards, gray borders, compact tables).

---

## 6) Known caveats

1. `POST notes` and dedicated `GET interactions` endpoints are not yet separate; interactions are currently embedded in details `GET`.
2. CSV export endpoint is not implemented yet.
3. `npm run dev` last observed exit code was `1` in terminal context (customer files themselves currently show no diagnostics errors).

---

## 7) Immediate next tasks (do in this order)

### Task A — Add notes API
- Create: `src/app/api/admin/customers/[id]/notes/route.ts`
- Implement:
  - `POST`: `{ note, event_type? }` inserts into `customer_interaction_logs`
  - validate non-empty `note`
  - default `event_type = "note_added"`

### Task B — Add interactions API
- Create: `src/app/api/admin/customers/[id]/interactions/route.ts`
- Implement:
  - `GET`: supports `limit` and `offset`
  - returns `{ data, total }`

### Task C — Wire Add Note UI
- Update: `src/app/admin/customers/[id]/page.tsx`
- Add:
  - dedicated note textarea + submit button
  - calls new `POST /notes`
  - reloads interactions list after submit

### Task D — Add CSV export API
- Create: `src/app/api/admin/customers/export/route.ts`
- Implement:
  - reuse filters from list API
  - return `text/csv` with key fields

### Task E — Validation + tracker update
- Run diagnostics for new/edited files
- Update `customer_management_implementation_tracker.md` checkboxes + changelog

---

## 8) Acceptance criteria for next session

1. Admin can add a note from details page without using profile-save flow.
2. Interactions can be fetched independently with pagination.
3. Admin can download customer list as CSV from API endpoint.
4. No TypeScript/diagnostic errors in touched files.
5. Tracker reflects completed items accurately.

---

## 9) Resume instruction (for future prompt)
Use this exact instruction in next session:

> Read `customer_management_resume.md` and continue implementation from Section 7, Task A onward. Update tracker after each completed task.

