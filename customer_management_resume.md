# Customer Management — Resume File (Read This First)

**Project:** EcomShriHari  
**Module:** Customer Management  
**Last Updated:** 2026-03-17

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
   - Features: live API data, search, status filter, advanced filters (registered/last-order ranges, order-count buckets, LTV min/max), pagination, row link to details, export action

5. **Admin customer details page**
   - File: `src/app/admin/customers/[id]/page.tsx`
   - Features: profile summary, metrics cards, orders table, addresses panel, interactions list, inline profile save form

6. **Customer types**
   - File: `src/types/customers.ts`

7. **Tracker updated**
   - File: `customer_management_implementation_tracker.md`

8. **Dedicated notes API added**
   - File: `src/app/api/admin/customers/[id]/notes/route.ts`

9. **Dedicated interactions API added**
   - File: `src/app/api/admin/customers/[id]/interactions/route.ts`

10. **Customer CSV export API added**
   - File: `src/app/api/admin/customers/export/route.ts`
   - Export is now wired from list page with active filters

11. **Add Note action wired in details page**
   - File: `src/app/admin/customers/[id]/page.tsx`

12. **Admin address CRUD API added**
   - File: `src/app/api/admin/customers/[id]/addresses/route.ts`
   - Methods: `POST`, `PATCH`, `DELETE`

13. **Address CRUD UI wired in details page**
   - File: `src/app/admin/customers/[id]/page.tsx`
   - Features: add/edit/delete address, set default shipping/billing

14. **Order panel drilldown upgraded**
   - Files:
     - `src/app/admin/customers/[id]/page.tsx`
     - `src/app/api/admin/customers/[id]/route.ts`
     - `src/types/customers.ts`
   - Features: expandable order rows, item/units context, amount breakdown, shipping snapshot, quick links (open order + invoice/print)

15. **Storefront account APIs implemented**
    - Files:
       - `src/app/api/account/profile/route.ts`
       - `src/app/api/account/addresses/route.ts`
       - `src/app/api/account/addresses/[id]/route.ts`
       - `src/app/api/account/preferences/route.ts`
       - `src/lib/apiAuth.ts`

16. **Storefront account pages implemented**
    - Files:
       - `src/app/account/profile/page.tsx`
       - `src/app/account/addresses/page.tsx`
       - `src/app/account/preferences/page.tsx`
    - Account dashboard now links to these pages.

---

## 3) What is still pending (Phase 1)

### High priority (next)
1. Polish storefront account UX and complete remaining profile/preferences requirements

### Medium priority
1. Add account status quick actions (flag/block shortcuts) in admin details

### Later (still Phase 1)
1. Order history enhancements (reorder/invoice/support actions)

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

1. Details GET currently still includes interactions; can be simplified later to rely only on dedicated interactions endpoint.
2. CSV export is wired, but selectable columns and large dataset streaming support are still pending.
3. `npm run dev` last observed exit code was `1` in terminal context (customer files themselves currently show no diagnostics errors).

---

## 7) Immediate next tasks (do in this order)

### Task A — Upgrade customer list filters
- Status: ✅ Completed
- Implemented in:
   - `src/app/admin/customers/page.tsx`
   - `src/app/api/admin/customers/route.ts`

### Task B — Add export button in list page
- Status: ✅ Completed
- Implemented in:
   - `src/app/admin/customers/page.tsx`
   - `src/app/api/admin/customers/export/route.ts`

### Task C — Improve details order panel
- Status: ✅ Completed
- Implemented in:
   - `src/app/admin/customers/[id]/page.tsx`
   - `src/app/api/admin/customers/[id]/route.ts`
   - `src/types/customers.ts`

### Task D — Address CRUD (admin details)
- Status: ✅ Completed
- Implemented in:
   - `src/app/api/admin/customers/[id]/addresses/route.ts`
   - `src/app/admin/customers/[id]/page.tsx`

### Task E — Phase 2 storefront account APIs/pages
- Status: ✅ Completed
- Implemented APIs:
   - `/api/account/profile`
   - `/api/account/addresses` (+ `[id]`)
   - `/api/account/preferences`
- Implemented pages:
   - `/account/profile`
   - `/account/addresses`
   - `/account/preferences`

### Task F — Validation + tracker update
- Run diagnostics for new/edited files
- Update `customer_management_implementation_tracker.md` checkboxes + changelog

### Task G — Remaining account UX polish
- Status: ✅ Completed
- Done:
   - Added read-only email and member metadata in `/account/profile`
   - Added transactional-email notice in `/account/preferences`
   - Added quick links in `/account/page` to profile/addresses/preferences pages

### Task H — Next implementation focus
- Add account status quick actions in admin customer details (`flag/block` actions).
- Extend account dashboard with quick stat cards from profile/order APIs.

---

## 8) Acceptance criteria for next session

1. Customer details order panel is richer and supports drilldown.
2. Admin address CRUD works end-to-end from details page.
3. Phase 2 account APIs and pages are implemented and connected.
4. Remaining account page polish requirements are completed.
5. No TypeScript/diagnostic errors in touched files.
6. Tracker reflects completed items accurately.

---

## 9) Resume instruction (for future prompt)
Use this exact instruction in next session:

> Read `customer_management_resume.md` and continue implementation from Section 7, Task A onward. Update tracker after each completed task.

Use this updated instruction now:

> Read `customer_management_resume.md` and continue implementation from Section 7, Task E onward. Update tracker after each completed task.

Updated for current state:

> Read `customer_management_resume.md` and continue implementation from Section 7, Task G onward. Update tracker after each completed task.

