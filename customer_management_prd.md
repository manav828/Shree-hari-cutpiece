# Product Requirements Document (PRD)
## Customer Management Module

**Project:** EcomShriHari  
**Date:** March 16, 2026  
**Owner:** Product + Engineering  
**Status:** Draft v1

---

## 1) Context and Problem

Currently, the Customer Management page is a placeholder. The business needs a comprehensive customer management system to:

1. View and manage customer profiles with complete purchasing history.
2. Understand customer behavior and lifetime value.
3. Segment customers for targeted marketing campaigns.
4. Track customer interactions and communication history.
5. Support customer service teams in providing better support.
6. Enable data-driven business decisions through customer analytics.

---

## 2) Goals

### Business Goals
- Increase customer retention through targeted engagement.
- Identify high-value customers for VIP/loyalty programs.
- Reduce churn by understanding customer behavior patterns.
- Enable data-driven marketing and personalization.
- Improve customer service response times and quality.

### User Goals (Admin/Staff)
- Quickly access customer information and order history.
- Understand customer preferences and purchase patterns.
- Communicate effectively with customers.
- Track all customer interactions in one place.

### Customer Goals
- Receive personalized, relevant offers.
- Get timely customer support.
- Manage account information and addresses easily.

---

## 3) Non-Goals (Phase 1)

- Automated email marketing campaigns (Phase 2).
- Advanced RFM (Recency, Frequency, Monetary) segmentation (Phase 2).
- AI-powered churn prediction (Phase 3).
- Customer self-service portal with advanced features (Phase 2).
- Integration with external CRM systems (Phase 2).

These will be considered in future phases.

---

## 4) Personas

1. **Admin/Owner**
   - Manages customer data, views analytics, makes strategic decisions.
   - High-level overview of customer health and trends.

2. **Customer Service Staff**
   - Handles customer support tickets and inquiries.
   - Needs quick access to customer history and preferences.
   - Requires ability to document interactions and notes.

3. **Marketing Manager**
   - Creates customer segments for campaigns.
   - Analyzes customer behavior and engagement metrics.
   - Targets specific customer groups with offers.

4. **Customer (Registered User)**
   - Views their own profile and order history.
   - Manages addresses and preferences.
   - Views personalized recommendations and offers.

---

## 5) User Stories

### Admin / Customer Service Stories
- As a support staff, I want to search for a customer by email, phone, or customer ID so I can quickly access their profile.
- As a support staff, I want to view a customer's complete order history with order details so I can assist them effectively.
- As a support staff, I want to add internal notes to a customer profile so team members can see previous interactions and context.
- As a customer service rep, I want to see the last login date and purchase date so I can understand their activity level.
- As an admin, I want to view customer lifetime value (LTV) metrics so I can identify high-value customers.
- As an admin, I want to see customer segmentation (new, active, dormant, churned) so I can tailor engagement strategies.
- As a marketing manager, I want to export a customer list filtered by specific criteria so I can run targeted campaigns.
- As an admin, I want to flag or block problematic customers so I can prevent fraud or abuse.

### Customer Stories
- As a customer, I want to view my profile and order history from my account page.
- As a customer, I want to manage my addresses (add, edit, delete, set as default).
- As a customer, I want to see personalized recommendations based on my purchase history.
- As a customer, I want to manage my communication preferences (email, SMS, notifications).

---

## 6) Scope

## 6.1 Frontend Surfaces (Customer-Facing)

### A) Account Dashboard
- Welcome message with customer name.
- Quick stats: Total Orders, Total Spent, Member Since.
- Recent Orders section (last 5 orders with status).
- Recommended Products (based on purchase history).
- Communication preferences toggle.

### B) Account Profile Page
- Display customer information:
  - Name, Email, Phone
  - Account creation date
  - Last order date
  - Total orders and total spent
- Edit profile button for name, phone, email.
- Change password section.
- Download account data option (GDPR compliance).

### C) Address Book
- List saved addresses with tags (Home, Work, etc.).
- Add new address.
- Edit address.
- Delete address.
- Set as default shipping/billing.
- Copy address to quick apply at checkout.

### D) Order History (Already Partially Implemented)
- List all orders with status badges.
- Filter by status, date range.
- View order details (items, shipping address, tracking).
- Reorder button from previous orders.
- Download invoice (PDF).

### E) Communication Preferences
- Email: Order confirmations, promotions, newsletter.
- SMS: Order updates (if SMS implemented in phase 2).
- Push notifications: App notifications (if web app).
- Opt-in/out of marketing emails.

---

## 6.2 Admin Surfaces

### A) Customer List (Main View)
**Columns:**
- Checkbox (select multiple)
- Customer Name
- Email
- Phone
- Join Date
- Last Order Date
- Total Orders
- Lifetime Value (₹)
- Status Badge (Active/Dormant/Churned)

**Features:**
- Search: Name, Email, Phone, Customer ID.
- Filters:
  - Date range (registered, last order)
  - Order count (0, 1-5, 5-10, 10+)
  - Lifetime value range (₹ min-max)
  - Status (Active, Dormant, Churned, New)
  - Last login (within days: 7, 30, 90, 365)
- Sort: By name, join date, LTV, last order.
- Pagination: 20, 50, 100 per page.
- Export: CSV with selected columns.
- Bulk actions: Add tag, send email, flag/block (Phase 2).

### B) Customer Details Page
**Left Panel - Profile Summary:**
- Profile picture placeholder / avatar with initials.
- Customer name, email, phone.
- Account status (Active/Suspended/Blocked).
- Join date.
- Verified badge (email verified, phone verified).
- Customer tags/segments (if applicable).
- Account notes area (internal, visible to staff only).

**Center Panel - Activity & Orders:**
- Quick stats:
  - Total Orders: Count
  - Total Spent: ₹ value
  - Average Order Value: ₹ value
  - Repeat Purchase Rate: % (orders after first)
  - Last Order: Date + status
  - Last Login: Date + time
  - Preferred Payment Method: (COD, Razorpay, etc.)
  
- Order Timeline:
  - Chronological list of all orders with:
    - Order ID / Number
    - Date
    - Total amount
    - Status badge
    - Click to expand for items + addresses
    - View Invoice button
    - Contact options (Resend confirmation, etc.)

**Right Panel - Additional Features:**
- Communication log (Phase 1.1):
  - Emails sent (order confirmations, promotional)
  - Support tickets raised
  - Manual notes added by support staff
  - Timestamps
- Address Book:
  - Billing addresses
  - Shipping addresses
  - Set as default
  - Edit / Delete options
- Preferences:
  - Communication opt-ins
  - Language preference
  - Marketing preferences
- Actions Menu:
  - Send custom email (Phase 2)
  - Add internal note
  - Edit customer info
  - Flag / Block customer
  - Delete customer (with confirmation, soft delete recommended)

### C) Customer Segmentation Dashboard (Phase 1.1)
- Visual breakdown:
  - New customers (registered < 30 days)
  - Active customers (order in last 90 days)
  - Dormant customers (no order in 90-365 days)
  - Churned customers (no order > 365 days)
- Metric cards showing count and trend.
- Segment-to-list navigation (view all customers in a segment).

### D) Analytics Dashboard (Phase 1.1)
- Key metrics:
  - Total registered customers
  - Total revenue from customers
  - Average customer LTV
  - Repeat customer percentage
  - Customer acquisition trend (chart)
  - Revenue by cohort (chart)
- Filters by date range.

---

## 7) Functional Requirements

## 7.1 Customer Data Model & Sources

**Primary Source:** Supabase `auth.users` table
- User ID (UUID)
- Email
- Email verified status
- Created at (signup date)
- Last signed in (last activity)
- User metadata (custom JSON fields)

**Extended Data:** Custom `user_profiles` table (to create)
- Phone
- Full name
- Date of birth (optional)
- Newsletter opt-in
- SMS opt-in
- Account status (active, suspended, blocked)
- Preferred Language
- Avatar URL

**Derived Data (from related tables):**
- Orders (from `orders` table, via `user_id`)
- Addresses (from `order_addresses` or dedicated `user_addresses`)
- Coupons applied (from `coupon_redemptions`)

## 7.2 Customer Status Logic

**Status Calculation (Real-time or cached daily):**

1. **New Customer**: `registered <= 30 days ago`
2. **Active Customer**: `last_order_date >= 90 days ago` OR `last_login_date >= 30 days ago`
3. **Dormant Customer**: `last_order_date between 90-365 days ago` AND `last_login_date < 30 days ago`
4. **Churned Customer**: `last_order_date > 365 days ago`
5. **Inactive (No Orders)**: `no orders ever placed`

**Admin-Set Status (Override):**
- **Suspended**: User cannot place orders (e.g., fraud investigation).
- **Blocked**: User forcibly disabled (e.g., abusive behavior).

## 7.3 Lifetime Value Calculation

$$\text{LTV} = \sum(\text{order total amount}) - \sum(\text{refunded amounts})$$

- Include all orders regardless of payment status.
- Optionally exclude very recent orders (< 7 days) if pending refunds are likely.
- Cache calculation daily; update on order completion.

## 7.4 Repeat Purchase Rate

$$\text{Repeat Purchase Rate} = \frac{\text{customers with > 1 order}}{\text{total customers}} \times 100\%$$

- Useful KPI for retention health.
- Track trend over time (monthly cohorts).

## 7.5 Search & Filtering Logic

- **Search fields**: Email (exact or partial), Name (partial), Phone (partial), Customer ID (exact).
- **Filter logic**: Combine multiple filters with AND logic.
- **Date filters**: Use inclusive date ranges (e.g., start date 00:00:00, end date 23:59:59).
- **Performance**: Add database indexes on frequently filtered columns (email, created_at, last_order_date).

## 7.6 Address Management

**Features:**
- Customer can add multiple addresses.
- Each address has:
  - `type`: shipping, billing, both.
  - `is_default_shipping`, `is_default_billing` flags.
  - Full address fields: name, phone, line 1, line 2, city, state, pincode, country.
- Soft-delete addresses (mark as deleted rather than hard delete).
- Quick-fill at checkout from saved addresses.

## 7.7 Communication Preferences

**Tracked per customer:**
- Opt-in for email marketing/newsletter.
- Opt-in for order status SMS updates (if implemented).
- Opt-in for promotional notifications.
- Email unsubscribe link in all marketing emails.

**Admin actions:**
- Can force-reset preferences.
- Can manually send emails (Phase 2).

## 7.8 Internal Notes & Interaction Log

**Admin Notes:**
- Timestamped notes added by support staff.
- Visible only to admin/staff, not to customer.
- Example: "Customer had shipping issue on Order #123; offered store credit."

**Interaction Log:**
- Auto-recorded events:
  - Order placed
  - Order status changed
  - Coupon redeemed
  - Custom email sent (Phase 2)
  - Support interaction logged (Phase 2)
- Manual entries by staff.

---

## 8) Data Model (Supabase/Postgres)

## 8.1 Tables to Create/Modify

### `user_profiles` (New Table)
```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id              uuid PRIMARY KEY,  -- FK to auth.users(id)
    full_name       text NOT NULL,
    phone           text,
    date_of_birth   date,
    avatar_url      text,
    newsletter_opt_in   boolean DEFAULT true,
    sms_opt_in          boolean DEFAULT false,
    marketing_opt_in    boolean DEFAULT true,
    account_status      text DEFAULT 'active' 
                        CHECK (account_status IN ('active','suspended','blocked')),
    preferred_language  text DEFAULT 'en',
    internal_notes      text,
    last_login_at       timestamptz,
    created_at          timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now(),
    
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### `user_addresses` (New Table or Enhanced)
```sql
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name               text NOT NULL,
    phone                   text NOT NULL,
    address_line1           text NOT NULL,
    address_line2           text,
    city                    text NOT NULL,
    state                   text NOT NULL,
    pincode                 text NOT NULL,
    country                 text DEFAULT 'India',
    is_default_shipping     boolean DEFAULT false,
    is_default_billing      boolean DEFAULT false,
    is_deleted              boolean DEFAULT false,
    created_at              timestamptz DEFAULT now(),
    updated_at              timestamptz DEFAULT now()
);
```

### `customer_interaction_logs` (New Table)
```sql
CREATE TABLE IF NOT EXISTS public.customer_interaction_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type      text NOT NULL 
                    CHECK (event_type IN ('order_placed','status_changed','note_added','email_sent','support_contact')),
    event_data      jsonb,  -- flexible field for event-specific data
    created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- staff who logged it
    note            text,
    created_at      timestamptz DEFAULT now()
);
```

### `customer_lifecycle_cache` (Optional, for performance)
```sql
CREATE TABLE IF NOT EXISTS public.customer_lifecycle_cache (
    user_id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_orders            int DEFAULT 0,
    total_spent             numeric(12,2) DEFAULT 0,
    avg_order_value         numeric(12,2) DEFAULT 0,
    last_order_date         timestamptz,
    last_login_date         timestamptz,
    repeat_purchase_count   int DEFAULT 0,
    customer_status         text DEFAULT 'new',  -- new, active, dormant, churned
    calculated_at           timestamptz DEFAULT now()
);
```

## 8.2 RLS Policies

- **Admin/Staff:** Full read access to user_profiles, addresses, interaction logs.
- **Customers:** Can read/edit their own profile and addresses only.
- **Public:** No direct read access to customer data (via API endpoints only with auth checks).

## 8.3 Indexes (Performance)

```sql
CREATE INDEX idx_user_profiles_account_status ON user_profiles(account_status);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_customer_interaction_logs_user_id ON customer_interaction_logs(user_id);
CREATE INDEX idx_customer_interaction_logs_created_at ON customer_interaction_logs(created_at);
CREATE INDEX idx_customer_lifecycle_cache_customer_status ON customer_lifecycle_cache(customer_status);
```

---

## 9) API / Server Actions Contracts

## 9.1 Admin APIs

### Customer List
```
GET /api/admin/customers
Query Parameters:
  - search?: string (email, name, phone, id)
  - status?: 'active' | 'dormant' | 'churned' | 'new'
  - sortBy?: 'name' | 'joined' | 'ltv' | 'last_order'
  - orderCount?: '0' | '1-5' | '5-10' | '10+'
  - ltvMin?: number
  - ltvMax?: number
  - registeredAfter?: ISO date
  - registeredBefore?: ISO date
  - lastOrderAfter?: ISO date
  - lastOrderBefore?: ISO date
  - page?: number (default 1)
  - limit?: number (default 20, max 100)

Response:
{
  data: [
    {
      id: string,
      email: string,
      full_name: string,
      phone?: string,
      created_at: string,
      last_order_date?: string,
      total_orders: number,
      lifetime_value: number,
      account_status: string,
      last_login_at?: string
    }
  ],
  pagination: { page, limit, total }
}
```

### Customer Details
```
GET /api/admin/customers/:id

Response:
{
  id: string,
  email: string,
  full_name: string,
  phone?: string,
  avatar_url?: string,
  account_status: string,
  created_at: string,
  last_login_at?: string,
  email_verified: boolean,
  
  // Profile stats
  total_orders: number,
  total_spent: number,
  avg_order_value: number,
  repeat_purchase_rate: number, // %
  last_order: { id, number, date, total, status },
  
  // Preferences
  newsletter_opt_in: boolean,
  marketing_opt_in: boolean,
  preferred_language: string,
  
  // Addresses
  addresses: [{ id, type, is_default_*, full_name, address_line1, ... }],
  
  // Notes
  internal_notes?: string,
  
  // Interaction log (last 10)
  interactions: [{ id, event_type, note, created_at, created_by }]
}
```

### Update Customer Profile
```
PATCH /api/admin/customers/:id
Body:
{
  full_name?: string,
  phone?: string,
  account_status?: 'active' | 'suspended' | 'blocked',
  internal_notes?: string,
  marketing_opt_in?: boolean,
  newsletter_opt_in?: boolean
}

Response: Updated customer object
```

### Add Interaction Note
```
POST /api/admin/customers/:id/notes
Body:
{
  note: string,
  event_type?: 'note_added' | 'support_contact' | ...
}

Response: { id, user_id, event_type, note, created_at, created_by }
```

### Get Customer Interaction Log
```
GET /api/admin/customers/:id/interactions
Query Parameters:
  - limit?: number (default 20)
  - offset?: number (default 0)

Response:
{
  data: [{ id, event_type, event_data, note, created_at, created_by }],
  total: number
}
```

### Export Customer List (CSV)
```
GET /api/admin/customers/export
Query Parameters:
  - (same as /api/admin/customers list filters)
  - format?: 'csv' | 'json' (default csv)
  - columns?: comma-separated list (id,email,name,phone,ltv,...)

Response: CSV file download (Content-Type: text/csv)
```

## 9.2 Storefront APIs

### Get Current User Profile
```
GET /api/account/profile

Prerequisites: User must be logged in

Response:
{
  id: string,
  email: string,
  full_name: string,
  phone?: string,
  avatar_url?: string,
  created_at: string,
  total_orders: number,
  total_spent: number,
  last_order_date?: string,
  preferences: {
    newsletter_opt_in: boolean,
    marketing_opt_in: boolean
  }
}
```

### Update User Profile
```
PATCH /api/account/profile
Body:
{
  full_name?: string,
  phone?: string,
  avatar?: File
}

Response: Updated profile object
```

### Get User Addresses
```
GET /api/account/addresses

Response:
{
  data: [{ id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default_shipping, is_default_billing }]
}
```

### Create User Address
```
POST /api/account/addresses
Body:
{
  full_name: string,
  phone: string,
  address_line1: string,
  address_line2?: string,
  city: string,
  state: string,
  pincode: string,
  is_default_shipping?: boolean,
  is_default_billing?: boolean
}

Response: Created address object with id
```

### Update User Address
```
PATCH /api/account/addresses/:addressId
Body: Same as POST

Response: Updated address object
```

### Delete User Address
```
DELETE /api/account/addresses/:addressId

Response: { success: true }
```

### Update Communication Preferences
```
PATCH /api/account/preferences
Body:
{
  newsletter_opt_in?: boolean,
  marketing_opt_in?: boolean,
  sms_opt_in?: boolean
}

Response: Updated preferences object
```

### Get User Order History (Already Exists)
```
GET /api/account/orders
Query Parameters:
  - page?: number
  - limit?: number
  - status?: string

Response: List of orders
```

---

## 10) UX Requirements

## 10.1 Admin Customer List UX
- **Search bar** at top: clear placeholder text hint (e.g., "Search by email, name, phone...").
- **Filter sidebar** (left):
  - Status dropdown
  - Date range pickers (registered, last order)
  - Order count slider or select
  - LTV range slider
- **Customer grid/table** (center):
  - Hover effects on rows
  - Click row to navigate to customer details
  - Checkboxes for bulk actions (visible when hovering)
  - Status badge with color coding
  - Link to customer's orders
- **Bulk actions bar** (visible when rows selected):
  - Export selected
  - Add tag (Phase 2)
  - Send email (Phase 2)
- **Pagination** at bottom: visible if > 20 results

## 10.2 Admin Customer Details UX
- **Three-column layout**:
  - Left: Profile card (avatar, name, status, join date, quick actions)
  - Center: Order timeline (scrollable, newest first)
  - Right: Notes, addresses, preferences
- **Each order row in timeline**:
  - Order number link
  - Date
  - Total + discount (if applicable)
  - Status badge with live status
  - Expand arrow to show items/addresses inline
  - Quick actions: View invoice, Resend confirmation (Phase 2)
- **Interaction log** (linked to right panel):
  - Collapsible section
  - Shows internal notes, events (auto-logged)
  - Newest first, timestamp + author
  - Add note button + textarea for quick notes
- **Address section**:
  - List of addresses with edit/delete icons on hover
  - Tags (Home, Work, Default Shipping, etc.)
  - Add address button
- **Actions menu** (button in top right or row actions):
  - Edit profile
  - Add note
  - Flag/Block (with confirmation modal)
  - Send email (Phase 2)
  - Delete (gray out, warning modal)

## 10.3 Customer Profile UX (Storefront)
- **Dashboard view**:
  - Welcome message: "Welcome back, [Name]!"
  - Stats cards: Total Orders, Total Spent, Member Since, Last Order
  - Recent Orders section with quick access
  - Recommended products carousel
- **Profile Edit Modal**:
  - Name, Email (read-only), Phone fields
  - Change Password link/button
  - Save changes button
- **Address Book Page**:
  - Tabbed interface: Shipping | Billing | All
  - Add address button
  - List of addresses with edit/delete on hover
  - Set default flags (checkbox)
  - Tag input for custom labels
- **Communication Preferences Page**:
  - Toggle for each preference type
  - Clear descriptions of what each preference controls
  - Save button
  - Unsubscribe confirmation message if opting out

## 10.4 Feedback Messages
- Success: "Profile updated successfully."
- Success: "Address saved."
- Error: "Email already in use."
- Error: "Please fill all required fields."
- Confirmation: "Are you sure you want to delete this address? This cannot be undone."
- Warning: "You are about to block this customer. They will not be able to place orders."

---

## 11) Business Rules and Edge Cases

1. **Customer Status Logic**:
   - Status is calculated based on last_order_date and last_login_date.
   - Recalculated daily via background job (or on-demand via cache).
   - Admin can manually override status if needed.

2. **Duplicate Email Prevention**:
   - Supabase auth ensures email uniqueness.
   - If user signs up with new email, create new profile.

3. **Order History Access**:
   - Customers see only their own orders.
   - Admins see all orders related to a customer.

4. **Address Privacy**:
   - Addresses not deleted, only soft-deleted.
   - Soft-deleted addresses do not appear in UI but keep for audit trail.

5. **LTV Calculation Precision**:
   - Include all order amounts, regardless of payment status.
   - Subtract refunded amounts.
   - Exclude cancelled orders (optional, configurable).

6. **Churn Prevention**:
   - Identify dormant customers periodically.
   - Send re-engagement email campaign (Phase 2).

7. **GDPR Compliance**:
   - Provide "Export My Data" button (as JSON).
   - Provide account deletion request (soft-delete, preserve audit trail).
   - Email unsubscribe link in all marketing emails.

8. **Phone Number Formatting**:
   - Store phone as-is (text field).
   - Validate format for Indian numbers (10 digits, optional country code).
   - Display with formatting: +91 98765 43210

9. **Name Handling**:
   - Support full names with spaces and special characters.
   - First/Last split optional (store as full_name for simplicity in Phase 1).

10. **Communication Opt-Out**:
    - Respect opt-out choices.
    - Transactional emails (order confirmation) sent regardless of opt-in.
    - Marketing emails only if opted-in.

---

## 12) Reporting & Metrics

### Admin Dashboard Widgets
- **Total Active Customers**: Count of customers with order in last 90 days.
- **New Customers (This Month)**: Count of signups this month.
- **Churn Number**: Customers who were active but now dormant.
- **Avg. Customer LTV**: Average lifetime value across all customers.
- **Repeat Customer %**: % of customers with > 1 order.

### Exportable Reports
- Customer list (CSV): All fields, filtered by search/filters.
- Cohort analysis (CSV): Customers cohorted by signup month, showing LTV, retention, churn.
- Segment report (CSV): Count/LTV breakdown by status (new, active, dormant, churned).

### Tracking
- Track per-customer:
  - Total orders placed
  - Total revenue
  - Repeat purchase count
  - Last engagement date (order or login)
  - Segment assignment (automated)

---

## 13) Implementation Roadmap

### Phase 1 (MVP - Weeks 1-2)
- [ ] Create `user_profiles` and `user_addresses` tables in Supabase.
- [ ] Implement customer list page with search and basic filters.
- [ ] Implement customer details page (profile + order history + addresses).
- [ ] Add internal notes and interaction log UI.
- [ ] Create backend APIs for list, details, update, notes.
- [ ] Implement customer status calculation (new, active, dormant, churned).
- [ ] Add LTV and metrics calculation.
- [ ] Implement customer account dashboard view (user-facing).
- [ ] Implement address book page (user-facing).
- [ ] Add communication preferences UI (user-facing).

### Phase 1.1 (Polish - Week 3)
- [ ] Implement customer segmentation dashboard.
- [ ] Implement customer analytics dashboard.
- [ ] Add CSV export functionality.
- [ ] Bulk actions support (select multiple customers).
- [ ] Filter optimization and performance tuning.
- [ ] Test mobile responsiveness on admin pages.
- [ ] Add email validation and phone number validation.

### Phase 2 (Communication & Marketing)
- [ ] Custom email templates and bulk email sending.
- [ ] Email activity tracking (opens, clicks).
- [ ] SMS notifications for order status (if SMS provider integrated).
- [ ] Auto-send re-engagement emails to dormant customers.
- [ ] Customer tagging and custom segments.
- [ ] Marketing automation workflows.

### Phase 3 (Advanced Analytics)
- [ ] RFM (Recency, Frequency, Monetary) segmentation.
- [ ] Churn prediction model (ML-based, optional).
- [ ] Customer cohort analysis with retention tracking.
- [ ] Device/browser tracking for analytics.
- [ ] A/B testing framework for personalization.

---

## 14) Success Metrics

1. **Adoption**: >80% of customer inquiries resolved faster with customer details page.
2. **Retention**: Identified and re-engaged dormant customers show 15%+ return to purchase.
3. **LTV**: Targeted offers to high-value segments show 10%+ uplift in order frequency.
4. **Support Efficiency**: Support response time reduced by 30% with instant customer context.
5. **Data Quality**: Zero customer record duplicates; 95%+ of profiles have complete data.

---

## 15) Technical Considerations

1. **Performance**: Customer list can be slow with many customers + complex filtering. Use database indexes and pagination.
2. **Caching**: Cache LTV and status calculations daily to avoid real-time recalculation.
3. **Real-time Updates**: Use Supabase real-time subscriptions for immediate order history updates on customer details page.
4. **Privacy**: Never expose sensitive customer data in logs or error messages.
5. **Soft Deletes**: Use soft deletes for addresses and potentially customers (for audit trail).
6. **Audit Trail**: Log all admin actions on customer data (changes, notes, flags).

---

## 16) Questions & Assumptions

1. **Assumption**: Phone number validation follows Indian format (10 digits).
   - **Decision**: Validate on save; store as text; format on display.

2. **Assumption**: LTV includes all orders regardless of payment status.
   - **Decision**: Yes, to capture full revenue potential (even if pending payment).

3. **Assumption**: Customers can have unlimited addresses.
   - **Decision**: Limit to 10 active addresses per customer to avoid data bloat.

4. **Assumption**: Admins see all customer data.
   - **Decision**: Yes, but all accesses are logged for audit trail.

5. **Assumption**: Soft delete customer data after request.
   - **Decision**: Archive customer (soft delete) with flag; preserve order history for legal/audit purposes.

---

**Document Version**: 1.0  
**Last Updated**: March 16, 2026  
**Next Review**: Upon start of Phase 1.1
