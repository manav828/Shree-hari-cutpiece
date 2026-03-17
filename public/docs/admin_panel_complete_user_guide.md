# Shree Hari Admin Panel - Complete User Guide

This guide documents the full admin panel as currently implemented.
It includes module behavior, admin workflows, technical API mapping, and known gaps.

## 1) Admin Access and Navigation

### Login flow
- Admin login page: `/admin/login`
- Current login is client-side only:
  - Valid email: `manavss828@gmail.com`
  - Valid password: `shreehari828`
- On success, localStorage key `shreehari_admin_auth=true` is set.
- Admin layout checks this key and redirects unauthorized users to `/admin/login`.
- Logout removes that key and returns to login.

Important:
- This is not server-authenticated admin access. It is a temporary guard for internal usage.

### Layout and menu
Main admin routes in sidebar:
- Dashboard
- Products
- Orders
- Customers
- Coupons
- Blog
- Reports
- Settings

The layout supports:
- Desktop fixed sidebar
- Mobile slide-out menu
- Shared top-level shell for all admin pages

## 2) Dashboard Module (`/admin`)

Status: Placeholder

What exists:
- Static cards for Total Sales, Active Orders, Total Products, Customers
- Placeholder blocks for Recent Orders and Low Stock Alerts

What does not exist yet:
- Real data binding
- Live recent order feed
- Low stock analytics

## 3) Products Module (`/admin/products`)

Status: Implemented and functional

### Product listing page
Capabilities:
- Loads products with category and variants
- Search by product name and variant color
- Filters:
  - Category
  - Sell mode (`meter` or `quantity`)
  - Status (`active` / draft)
- Product row actions:
  - View storefront page
  - Edit product
  - Delete product (with confirmation)
- Active toggle directly from list
- Stock awareness (in stock / low / out of stock)

Data source:
- Supabase client queries directly from UI:
  - `products`
  - `product_variants`
  - `variant_images`
  - `categories`

### Create product page (`/admin/products/new`)
Capabilities:
- Multi-step style editor:
  - Product details
  - Fabric and care fields
  - Selling mode and discount display style
  - Color variants
- Variant-level management:
  - Color name and swatch
  - Price and original price
  - SKU
  - Stock
  - Default variant selector
  - Multiple media uploads (image/video)
  - Primary media selection per variant
- Publish or Save as Draft

Storage:
- Uploads to Supabase Storage bucket `product-images`

### Edit product page (`/admin/products/[id]/edit`)
Capabilities:
- Full product edit with tabbed sections
- Dynamic fabric details key-value rows
- Variant CRUD and media management
- Pricing normalization logic during save (original price correction)
- View-on-store shortcut
- Product delete action from edit view

### Category management (`/admin/products/categories`)
Capabilities:
- List categories
- Add category
- Edit category name/slug
- Delete category

## 4) Orders Module (`/admin/orders`)

Status: Implemented and functional

### Orders list page
Capabilities:
- Top stats cards:
  - Total orders
  - Pending orders
  - Shipped today
  - Revenue today
- Filters:
  - Search (order number, customer name/phone behavior)
  - Order status
  - Payment status
  - Date range
- Paginated order table with:
  - Order number
  - Date/time
  - Customer snapshot
  - Collapsible products preview
  - Payment badge
  - Status badge
- Quick actions:
  - View order detail
  - Print label/invoice

### Order detail page (`/admin/orders/[id]`)
Capabilities:
- Full order summary and timeline
- Sections:
  - Customer info
  - Shipping address
  - Itemized product table
  - Amount breakdown
  - Payment info
  - Coupon details (if used)
  - Status history timeline
- Custom status color support via settings-managed statuses
- Unified action panel (`OrderActions`) for:
  - Status update
  - Tracking update
  - Admin notes update

### Print page (`/admin/orders/[id]/print`)
Capabilities:
- Invoice-style printable layout
- Shipping and order line item details
- Print button for hardcopy workflow

### Order backend logic
Core utility: `src/lib/orders.ts`
- `getOrderStats()`
- `fetchOrders(filters)`
- `fetchOrderById(id)`
- `fetchOrderUserEmail(userId)`

Server actions: `src/app/actions/order.ts`
- `updateOrderStatus(orderId, newStatus, note?)`
- `updateOrderTracking(orderId, trackingUrl)`
- `updateOrderNotes(orderId, notes)`

## 5) Customers Module (`/admin/customers`)

Status: Implemented and functional

### Customer list page
Capabilities:
- Search by name/email/phone
- Filters:
  - Account status
  - Registration date range
  - Last order date range
  - Order count buckets
  - Lifetime value min/max
- Pagination with configurable page size
- CSV export with full filter parity
- Table columns include:
  - Identity fields
  - Join and last order dates
  - Total orders
  - Lifetime value
  - Account status

### Customer detail page (`/admin/customers/[id]`)
Capabilities:
- Profile summary and key metrics
- Order history with expandable drilldown cards
- Quick links to related order and print pages
- Profile controls:
  - Account status change (`active`, `suspended`, `blocked`)
  - Internal notes
- Interaction timeline
- Note creation
- Address management:
  - Add
  - Edit
  - Soft delete
  - Set default shipping/billing
- Quick action buttons for status presets and email shortcut

### Customer APIs
- `GET /api/admin/customers`
  - Filtered + paginated list
- `GET /api/admin/customers/export`
  - CSV export using same filters
- `GET /api/admin/customers/[id]`
  - Full customer detail payload
- `PATCH /api/admin/customers/[id]`
  - Profile/status/preferences updates
- `GET /api/admin/customers/[id]/interactions`
  - Interaction feed
- `POST /api/admin/customers/[id]/notes`
  - Add interaction note
- `POST /api/admin/customers/[id]/addresses`
  - Add address
- `PATCH /api/admin/customers/[id]/addresses`
  - Update address or defaults
- `DELETE /api/admin/customers/[id]/addresses`
  - Soft delete address

## 6) Coupons Module (`/admin/coupons`)

Status: Implemented and functional

### Coupon list page
Capabilities:
- Analytics cards:
  - Total coupons
  - Active coupons
  - Total redemptions
  - Total discount spend
  - Influenced revenue
- Search by code/name
- Coupon table with:
  - Discount details
  - Eligibility rules
  - Placement visibility
  - Status
- Actions:
  - Edit
  - Activate/Deactivate

### Create coupon (`/admin/coupons/new`)
Capabilities:
- Full coupon form with strong client validation:
  - Code and name
  - Discount type/value
  - Caps and thresholds
  - Usage limits
  - Start/end date
  - Status
  - Banner/modal visibility toggles
  - Destination URL + preset routes
  - User-specific mode and assignments

### Edit coupon (`/admin/coupons/[id]`)
Capabilities:
- Loads coupon + assigned users
- Updates all major fields
- Updates assigned user list

### Coupon APIs
- `GET /api/admin/coupons`
- `POST /api/admin/coupons`
- `GET /api/admin/coupons/[id]`
- `PATCH /api/admin/coupons/[id]`
- `GET /api/admin/coupons/analytics`
- `GET /api/admin/users`
  - Used to assign coupons to specific users

## 7) Settings Module (`/admin/settings`)

Status: Implemented and functional

### Theme management
Capabilities:
- Select active storefront theme:
  - `classic`
  - `luxury`
- Saves selection in `site_settings` key `active_theme`

Important:
- This controls storefront rendering, not admin panel styling.

### Custom order status management
Capabilities:
- Create status label + color
- Edit status label + color
- Delete custom status
- Live usage in orders module badges

API + actions involved:
- `GET /api/admin/custom-statuses`
- Server actions in `src/app/actions/customStatus.ts`:
  - `fetchCustomStatuses`
  - `createCustomStatus`
  - `updateCustomStatus`
  - `deleteCustomStatus`

## 8) Blog Module (`/admin/blog`)

Status: Placeholder

Current behavior:
- Shows static placeholder panel only.
- No CRUD, editor, publish workflow, or API integration yet.

## 9) Reports Module (`/admin/reports`)

Status: Placeholder

Current behavior:
- Shows static placeholder panel only.
- No charting, date slicing, export, or analytics pipeline wired yet.

## 10) Related Account-Side Features Completed (Storefront User Area)

These are outside `/admin` UI but impact admin operations and support workflows:
- Account dashboard stats/recent orders page
- Profile management page
- Address book and preference pages
- Account data export API: `/api/account/export`
- Delete request API: `/api/account/delete-request`

This supports customer service and compliance flows that admins can coordinate with customers.

## 11) Module Status Summary

Implemented:
- Products
- Orders
- Customers
- Coupons
- Settings (themes + custom statuses)
- Admin shell/navigation

Partially implemented:
- Dashboard (UI present, data mostly static)

Not implemented (placeholder only):
- Blog management
- Reports/analytics dashboards

## 12) Known Risks and Limitations

1. Admin authentication is localStorage-based and hardcoded in UI.
2. Dashboard metrics are static placeholders.
3. Blog/Reports are not yet functional.
4. Several admin screens use direct Supabase client calls from browser.
5. Production hardening still needed for role-based access enforcement and audit controls.

## 13) Suggested Next Build Priorities

1. Replace hardcoded admin login with server-side auth + role checks.
2. Connect dashboard cards/widgets to real analytics queries.
3. Implement Blog CRUD (list/create/edit/delete/publish).
4. Implement Reports module with date filters and export.
5. Add stronger audit logs for admin actions across modules.

---

Guide scope note:
This document reflects the current code implementation state at the time of writing, including both completed and placeholder modules.
