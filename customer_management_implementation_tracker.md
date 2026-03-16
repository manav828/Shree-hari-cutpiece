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
  - [ ] `POST /api/admin/customers/:id/notes` (add interaction note)
  - [ ] `GET /api/admin/customers/:id/interactions` (fetch interaction log)
  - [ ] `GET /api/admin/customers/export` (CSV export)
  - **Status**: In progress

- [ ] **API Endpoints - Storefront Account Management**
  - [ ] `GET /api/account/profile` (current user profile)
  - [ ] `PATCH /api/account/profile` (update user profile)
  - [ ] `GET /api/account/addresses` (list user addresses)
  - [ ] `POST /api/account/addresses` (create address)
  - [ ] `PATCH /api/account/addresses/:id` (update address)
  - [ ] `DELETE /api/account/addresses/:id` (delete address)
  - [ ] `PATCH /api/account/preferences` (update communication prefs)
  - **Status**: Not started

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
  - [ ] Filter sidebar (status, date range, order count, LTV range)
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
    - [ ] Address info for each order
    - [x] Order status badge
    - [ ] View invoice link
  - [x] Right panel: Notes, addresses, preferences tabs
  - [ ] Actions menu: Edit profile, Add note, Flag/Block, Send email (Phase 2)
  - [x] Communication log showing recent interactions
  - [x] Quick stats cards (total orders, total spent, avg order value, repeat rate)
  - [x] Edit customer profile form (inline panel)
  - [ ] Add interaction note form
  - **Status**: In progress

- [~] **Address Management** (within customer details)
  - [x] Display user's saved addresses
  - [ ] Add new address form
  - [ ] Edit address form
  - [ ] Delete address (with soft-delete backend)
  - [ ] Set as default shipping/billing
  - [ ] Form validation
  - **Status**: In progress

- [ ] **Styling & Responsiveness**
  - [ ] Responsive design for tablet/mobile (admin pages)
  - [ ] Consistent styling with existing admin theme
  - [ ] Color-coded status badges
  - [ ] Hover effects and interactive elements
  - [ ] Loading spinners and skeleton loaders
  - **Status**: Not started

---

### Customer-Facing UI - Account Pages

- [ ] **Account Dashboard / Profile Landing** (`src/app/account/page.tsx` - enhance existing)
  - [ ] Welcome message with customer name
  - [ ] Quick stat cards: Total Orders, Total Spent, Member Since, Last Order
  - [ ] Recent Orders section (last 5) with links
  - [ ] Edit profile button
  - [ ] Links to Address Book and Preferences
  - [ ] Recommended products based on purchase history (Phase 1.1)
  - **Status**: Not started

- [ ] **Account Profile Edit Page** (`src/app/account/profile/page.tsx` - new)
  - [ ] Display current profile info (name, email, phone)
  - [ ] Edit form for: name, phone
  - [ ] Email (read-only, show change email link for Phase 2)
  - [ ] Change password section (link to Supabase auth)
  - [ ] Download account data button (GDPR)
  - [ ] Delete account request button (soft delete)
  - **Status**: Not started

- [ ] **Address Book Page** (`src/app/account/addresses/page.tsx` - new)
  - [ ] List all saved addresses with tags (Home, Work, Default Shipping, etc.)
  - [ ] Add new address button & form
  - [ ] Edit address form (popup/modal)
  - [ ] Delete address button (with confirmation)
  - [ ] Set as default shipping / billing checkboxes
  - [ ] Form validation (required fields, phone format, pincode)
  - [ ] Save and Cancel buttons
  - **Status**: Not started

- [ ] **Communication Preferences Page** (`src/app/account/preferences/page.tsx` - new)
  - [ ] Toggle switch for: Email marketing, Newsletter, SMS updates, Notifications
  - [ ] Clear descriptions of each preference
  - [ ] Save preferences button
  - [ ] Confirmation message on save
  - [ ] Note about transactional emails (always sent)
  - **Status**: Not started

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

- [ ] **CSV Export Functionality**
  - [ ] Export filtered customer list as CSV
  - [ ] Selectable columns
  - [ ] Handles large datasets (streaming)
  - [ ] Test with various filters applied
  - **Status**: Not started

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
