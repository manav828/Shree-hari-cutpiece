# Customer Management Module - Implementation Tracker

**Project:** EcomShriHari  
**Status:** Phase 1 In Progress  
**Last Updated:** March 16, 2026

**Next-session handoff file:** `customer_management_resume.md`

---

## Phase 1 (MVP) - Target Completion: End of Week 2

### Database & Backend Infrastructure
- [~] **Create Supabase migrations**
  - [x] `user_profiles` table
  - [x] `user_addresses` table
  - [x] `customer_interaction_logs` table
  - [ ] `customer_lifecycle_cache` table (optional, for perf)
  - [x] Required indexes for filtering performance
  - [x] RLS policies for security
  - **Status**: In progress (core migration shipped)

- [~] **API Endpoints - Admin Customer Management**
  - [x] `GET /api/admin/customers` (list with filters, search, pagination)
  - [x] `GET /api/admin/customers/:id` (customer details)
  - [x] `PATCH /api/admin/customers/:id` (update profile)
  - [x] `POST /api/admin/customers/:id/notes` (add interaction note)
  - [x] `GET /api/admin/customers/:id/interactions` (fetch interaction log)
  - [x] `GET /api/admin/customers/export` (CSV export)
  - **Status**: In progress

- [x] **API Endpoints - Storefront Account Management**
  - [x] `GET /api/account/profile` (current user profile)
  - [x] `PATCH /api/account/profile` (update user profile)
  - [x] `GET /api/account/addresses` (list user addresses)
  - [x] `POST /api/account/addresses` (create address)
  - [x] `PATCH /api/account/addresses/:id` (update address)
  - [x] `DELETE /api/account/addresses/:id` (delete address)
  - [x] `GET /api/account/preferences` (fetch communication prefs)
  - [x] `PATCH /api/account/preferences` (update communication prefs)
  - **Status**: Completed

- [ ] **Business Logic Functions**
  - [ ] `calculateCustomerStatus()` - Determine new/active/dormant/churned
  - [ ] `calculateLifetimeValue()` - Compute LTV from orders
  - [ ] `getOrderMetrics()` - Total orders, avg order value, repeat purchase rate
  - [ ] `validatePhoneNumber()` - Indian format validation
  - [ ] `searchCustomers()` - Fuzzy search across email/name/phone
  - **Status**: Not started

---

### Admin UI - Customer List & Details

- [~] **Customer List Page** (`src/app/admin/customers/page.tsx`)
  - [x] Replace placeholder with functional UI
  - [x] Search bar with real-time filtering
  - [x] Filter sidebar (status, date range, order count, LTV range)
  - [x] Customer table with columns: name, email, phone, join date, last order, orders count, LTV, status
  - [x] Click row to navigate to customer details
  - [ ] Hover actions (view details, etc.)
  - [x] Pagination with limit selector (20, 50, 100)
  - [x] Loading states and error handling
  - **Status**: In progress

- [~] **Customer Details Page** (`src/app/admin/customers/[id]/page.tsx` - new)
  - [x] Left panel: Profile summary (avatar, name, status, join date, verified badges)
  - [x] Center panel: Order timeline (all orders with expand/collapse)
    - [ ] Order item details (products, quantities, prices)
    - [x] Address info for each order
    - [x] Order status badge
    - [x] View invoice link
  - [x] Right panel: Notes, addresses, preferences tabs
  - [x] Actions menu: Edit profile, Add note, Flag/Block, Send email (Phase 2)
  - [x] Communication log showing recent interactions
  - [x] Quick stats cards (total orders, total spent, avg order value, repeat rate)
  - [x] Edit customer profile form (inline panel)
  - [x] Add interaction note form
  - **Status**: In progress

- [~] **Address Management** (within customer details)
  - [x] Display user's saved addresses
  - [x] Add new address form
  - [x] Edit address form
  - [x] Delete address (with soft-delete backend)
  - [x] Set as default shipping/billing
  - [x] Form validation
  - **Status**: Completed

- [ ] **Styling & Responsiveness**
  - [ ] Responsive design for tablet/mobile (admin pages)
  - [ ] Consistent styling with existing admin theme
  - [ ] Color-coded status badges
  - [ ] Hover effects and interactive elements
  - [ ] Loading spinners and skeleton loaders
  - **Status**: Not started

---

### Customer-Facing UI - Account Pages

- [~] **Account Dashboard / Profile Landing** (`src/app/account/page.tsx` - enhance existing)
  - [x] Welcome message with customer name
  - [x] Quick stat cards: Total Orders, Total Spent, Member Since, Last Order
  - [x] Recent Orders section (last 5) with links
  - [x] Edit profile button
  - [x] Links to Address Book and Preferences
  - [ ] Recommended products based on purchase history (Phase 1.1)
  - **Status**: In progress

- [~] **Account Profile Edit Page** (`src/app/account/profile/page.tsx` - new)
  - [x] Display current profile info (name, email, phone)
  - [x] Edit form for: name, phone
  - [x] Email (read-only, show change email link for Phase 2)
  - [x] Change password section (link to Supabase auth)
  - [x] Download account data button (GDPR)
  - [x] Delete account request button (soft delete)
  - **Status**: In progress

- [~] **Address Book Page** (`src/app/account/addresses/page.tsx` - new)
  - [x] List all saved addresses with tags (Home, Work, Default Shipping, etc.)
  - [x] Add new address button & form
  - [x] Edit address form (popup/modal)
  - [x] Delete address button (with confirmation)
  - [x] Set as default shipping / billing checkboxes
  - [x] Form validation (required fields, phone format, pincode)
  - [x] Save and Cancel buttons
  - **Status**: In progress

- [~] **Communication Preferences Page** (`src/app/account/preferences/page.tsx` - new)
  - [x] Toggle switch for: Email marketing, Newsletter, SMS updates, Notifications
  - [x] Clear descriptions of each preference
  - [x] Save preferences button
  - [x] Confirmation message on save
  - [x] Note about transactional emails (always sent)
  - **Status**: In progress

- [ ] **Order History Enhancement** (already partially exists)
  - [ ] Reorder button for quick re-order from previous order
  - [ ] Download invoice (PDF) link
  - [ ] Contact/support button for each order (Phase 2)
  - **Status**: Potential enhancement

---

### Phase 1.1 (Polish) - Optional, Before Launch

- [ ] **Customer Segmentation Dashboard** (`src/app/admin/customers/segments/page.tsx` - new)
  - [ ] Visual breakdown of customer segments (new, active, dormant, churned)
  - [ ] Metric cards with counts and trends
  - [ ] Click to filter customer list by segment
  - [ ] Segment definitions and rules display
  - **Status**: Not started

- [ ] **Customer Analytics Dashboard** (`src/app/admin/customers/analytics/page.tsx` - new)
  - [ ] Key metrics: total customers, revenue, avg LTV, repeat %, acquisition trend
  - [ ] Line chart: Customer signups over time
  - [ ] Bar chart: Revenue by cohort (signup month)
  - [ ] Filters: Date range
  - **Status**: Not started

- [~] **CSV Export Functionality**
  - [x] Export filtered customer list as CSV
  - [ ] Selectable columns
  - [ ] Handles large datasets (streaming)
  - [ ] Test with various filters applied
  - **Status**: In progress

- [ ] **Bulk Actions**
  - [ ] Multi-select checkboxes for customers
  - [ ] Bulk export selected
  - [ ] Bulk tag (Phase 2)
  - [ ] Bulk email (Phase 2)
  - **Status**: Not started

- [ ] **Performance Optimization**
  - [ ] Database query optimization for list view (N+1 queries check)
  - [ ] Pagination query tuning
  - [ ] Add necessary database indexes
  - [ ] Test with 10k+ customers
  - [ ] Cache lifecycle metrics daily
  - **Status**: Not started

- [ ] **Testing**
  - [ ] Unit tests for business logic functions
  - [ ] Integration tests for API endpoints
  - [ ] E2E tests for admin workflows (list → details → edit → notes)
  - [ ] E2E tests for customer workflows (profile → addresses → prefs)
  - [ ] Mobile responsive testing
  - **Status**: Not started

---

## Phase 2 (Communication & Marketing) - Future

- [ ] Custom email templates for communication
- [ ] Bulk email sending to customer segments
- [ ] Email activity tracking (opens, clicks)
- [ ] SMS notifications for order updates
- [ ] Auto re-engagement campaigns for dormant customers
- [ ] Customer tagging system
- [ ] Custom customer segments (rule-based)
- [ ] Marketing automation workflows

---

## Phase 3 (Advanced Analytics) - Future

- [ ] RFM (Recency, Frequency, Monetary) segmentation
- [ ] Churn prediction model (ML)
- [ ] Cohort analysis with retention curves
- [ ] Device/browser tracking
- [ ] A/B testing framework

---

## Known Issues & Blockers

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| (None currently) | - | - | Will be updated as implementation progresses |

---

## Dependencies & Prerequisites

1. **Supabase Project**: Veiqszialzcmuoxbtabd (already active)
2. **Auth System**: User authentication via Supabase Auth (already implemented)
3. **Order System**: Orders table and schema (already implemented)
4. **Styling**: Tailwind CSS (already configured)
5. **Database Migrations**: Capability to run SQL via Supabase Dashboard (already tested with coupon module)

---

## Rollout Plan

**Phase 1A (Admin - Week 1-2)**
1. Create database tables and migrations
2. Implement backend APIs
3. Implement admin customer list and details pages
4. Internal testing

**Phase 1B (Customer - Week 2)**
1. Implement account dashboard
2. Implement profile edit page
3. Implement address book page
4. Implement preferences page
5. User testing with beta customers

**Phase 1.1 (Polish - Week 3)**
1. Performance optimization
2. Analytics dashboards
3. Export functionality
4. Final testing and bug fixes

**Phase 1 Launch**
- Announce feature to admins
- Enable for all customers
- Monitor performance and support

---

## Changelog

### Latest Updates
- **2026-03-17**: Added admin quick-action controls in customer details for Activate/Suspend/Block and direct Send Email shortcut.
- **2026-03-17**: Added detailed admin user guide document: `admin_customer_management_user_guide.md`.
- **2026-03-17**: Completed account dashboard essentials on `/account` with welcome copy, stat cards, recent-orders block, and quick links to profile/address/preferences.
- **2026-03-17**: Completed remaining profile actions on `/account/profile`: password reset email trigger, account data export download, and account deletion request submission.
- **2026-03-17**: Added account utility APIs: `GET /api/account/export` and `POST /api/account/delete-request`.
- **2026-03-17**: Profile page polish: added read-only email and member metadata; preferences page now includes transactional-email notice.
- **2026-03-17**: Implemented storefront account APIs: `/api/account/profile`, `/api/account/addresses` (+ `[id]`), `/api/account/preferences` with authenticated bearer-token access.
- **2026-03-17**: Added customer-facing account pages: `/account/profile`, `/account/addresses`, `/account/preferences` and linked from account dashboard tabs.
- **2026-03-17**: Implemented admin address CRUD API (`POST/PATCH/DELETE /api/admin/customers/[id]/addresses`) with default shipping/billing handling and soft delete.
- **2026-03-17**: Added address management UI in customer details page (add/edit/delete/default toggles) and interaction logging integration.
- **2026-03-17**: Upgraded customer details order history with expandable drilldown rows, amount breakdown, shipping snapshot, and quick links (open order + invoice/print).
- **2026-03-17**: Added advanced list filters (registered range, last-order range, order-count buckets, LTV min/max) in admin customers list page and API.
- **2026-03-17**: Added Export CSV button in customer list page wired to filtered export endpoint.
- **2026-03-17**: Added dedicated customer notes API (`POST /api/admin/customers/[id]/notes`).
- **2026-03-17**: Added paginated interactions API (`GET /api/admin/customers/[id]/interactions`).
- **2026-03-17**: Added CSV export API (`GET /api/admin/customers/export`) with list filters.
- **2026-03-17**: Wired customer details page with dedicated Add Note action and interactions refresh.
- **2026-03-16**: Tracker cleanup: marked customer details and address display progress accurately; updated next steps.
- **2026-03-16**: Added customer details and profile update API at `/api/admin/customers/[id]`.
- **2026-03-16**: Implemented admin customer details page with profile, metrics, orders, addresses, interactions and save flow.
- **2026-03-16**: Added `supabase_customers_migration.sql` and executed migration successfully on Supabase.
- **2026-03-16**: Added `GET /api/admin/customers` list endpoint with search, status filter, sorting and pagination.
- **2026-03-16**: Replaced admin customers placeholder with working data table UI connected to API.
- **2026-03-16**: PRD created; Phase 1 tasks defined; tracker initialized.

---

## File Structure Reference

```
src/
  ├── app/
  │   ├── admin/
  │   │   └── customers/
  │   │       ├── page.tsx (list)
  │   │       ├── [id]/
  │   │       │   └── page.tsx (details)
  │   │       ├── segments/
  │   │       │   └── page.tsx (Phase 1.1)
  │   │       └── analytics/
  │   │           └── page.tsx (Phase 1.1)
  │   │
  │   ├── account/ (customer-facing)
  │   │   ├── page.tsx (dashboard)
  │   │   ├── profile/
  │   │   │   └── page.tsx
  │   │   ├── addresses/
  │   │   │   └── page.tsx
  │   │   └── preferences/
  │   │       └── page.tsx
  │   │
  │   └── api/
  │       ├── admin/
  │       │   └── customers/
  │       │       ├── route.ts (GET list)
  │       │       ├── [id]/
  │       │       │   ├── route.ts (GET details, PATCH update)
  │       │       │   ├── notes/
  │       │       │   │   └── route.ts (POST note, GET log)
  │       │       │   └── interactions/
  │       │       │       └── route.ts (GET interactions)
  │       │       └── export/
  │       │           └── route.ts (GET CSV)
  │       │
  │       └── account/ (customer-facing)
  │           ├── profile/
  │           │   └── route.ts (GET, PATCH)
  │           ├── addresses/
  │           │   ├── route.ts (GET, POST)
  │           │   └── [id]/
  │           │       └── route.ts (PATCH, DELETE)
  │           └── preferences/
  │               └── route.ts (PATCH)
  │
  ├── types/
  │   └── customers.ts (new - TypeScript types)
  │
  ├── lib/
  │   └── customers.ts (new - business logic utilities)
  │
  └── components/
      └── admin/
          └── customers/
              ├── CustomerList.tsx
              ├── CustomerDetails.tsx
              ├── AddressBook.tsx
              ├── InteractionLog.tsx
              └── CustomerSearch.tsx
```

---

**Next Steps**: Implement dedicated notes/interactions APIs, add note form on details page, and add CSV export endpoint.
