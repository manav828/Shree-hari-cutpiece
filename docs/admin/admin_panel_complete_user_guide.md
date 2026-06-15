# Shree Hari Admin Panel - Complete Development & Knowledge Bank Guide

This document is the master knowledge bank for the Shree Hari e-commerce admin panel. It covers all features, operational checklists, database structures, Next.js cache revalidation keys, and custom resolver overrides.

The guide is organized into exactly **11 sections**, matching the sidebar navigation menu in the admin dashboard.

---

## 1. Dashboard Module (`/admin`)

### Operations Handbook
- **Daily Check**: Verify Total Sales, Active Orders, Total Products, and Customer Metrics.
- **Stock Alert**: Review the **Low Stock Alerts** table to identify variant levels that are dropping below 20 items or meters.
- **Active Orders Feed**: Check the **Recent Orders** feed to see newly placed checkout records requiring fulfillment.
- **Security Check**: Verify the Row Level Security (RLS) check at the bottom. If any warning indicates disabled security policies, contact technical support.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Admin Dashboard Overview - Recent Orders & Low Stock Tables]`

### Technical Details
- **Data Action**: `src/app/actions/dashboardStats.ts` fetches metrics in parallel using server-side queries.
- **Recent Orders Query**: Joins the orders table with `profiles` to pull shopper names, limited to the 8 most recent rows.
- **Low Stock Query**: Joins `product_variants` with `products` where `stock < 20`, limited to the top 10 items.
- **Cache Control**: Real-time stats skip static cache to ensure data freshness.
- **RLS Audit**: CallsSupabase RPC `get_disabled_rls_tables` to identify tables lacking row-level security policies.

---

## 2. Products & Inventory (`/admin/products`)

### Operations Handbook
- **Product Setup**: Define standard fields (name, slug, description, category, and care tips).
- **Selling Modes**: Select **Quantity** (for pieces/items) or **Meters** (for fabrics).
- **Color Variants**: Define color swatch values, SKUs, inventory counts, pricing, and original prices (for discounts).
- **Fabric Calculator**: Fabric products show a "Calculate Fabric Need" modal on the storefront. Admins can configure presets for various garments (Kurti, Salwar, Shirt) and size categories. The calculator computes yard requirements and converts them to meters, automatically rounding up to the nearest **0.5m** (e.g. 2.3m rounds to 2.5m) to prevent shipping shortages.
- **Reviews Approval**: Toggle reviews status directly to prevent spam from appearing on the storefront.
- **Reviews Curation**: Create reviews manually, select star rating, type comments, and upload customer photo/video assets.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Admin Product Creator - Color Variant Hex Swatch Picker & Media Uploader]`
- **Screenshot Placeholder**: `[Screenshot Placeholder: Reviews Moderation Queue - Curated Review Creation Dialog]`

### Technical Details
- **Database Tables**:
  - `products` (Core product details)
  - `product_variants` (SKU, price, original_price, swatch, stock)
  - `variant_images` (Image maps per variant)
  - `categories` (Product tax and slug groupings)
  - `product_option_groups` & `product_option_values` (Custom options)
- **Webpack Custom Override Resolver**: The build engine (`next.config.mjs`) intercepts imports. If a file exists in the active theme's changes directory (e.g. `changes/components/shop/ProductDetailClient.tsx`), it overwrites the `core/` file at compile time.
- **Calculator Presets**: Defined in `src/components/FabricCalculator.tsx` with garment modifiers and dimensions.
  - Formula: `rawMeters = basePreset * widthFactor * sizeFactor`
  - Rounding helper: `Math.max(0.5, Math.ceil(rawMeters * 2) / 2)`
- **Media Upload Bucket**: Files are uploaded to the `product-images` storage bucket.
- **Cache Tags**: `revalidateTag("products")` must be fired on product changes.

---

## 3. Orders & Fulfillment (`/admin/orders`)

### Operations Handbook
- **Order Lifecycle**: Advance orders through statuses: `Pending` -> `Confirmed` -> `Processing` -> `Shipped` -> `Delivered` -> `Cancelled`.
- **Fulfillment**: Click the order row, review details, change status to Processing to confirm packing, then change to Shipped, adding the courier tracking URL.
- **Invoice Downloads**: Print standard packing lists or click the **Download Invoice** button to instantly save a client-side generated PDF invoice.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Order Details - Status Transition Dropdown and Download Invoice Button]`

### Technical Details
- **Fulfillment Actions**: Handled in `src/app/actions/order.ts` (methods `updateOrderStatus`, `updateOrderTracking`).
- **PDF Compilation**: Renders PDF templates using the `jspdf` library in `src/utils/invoice/InvoiceGenerator.ts`. It extracts order headers, customer shipping addresses, product line items, and totals.
- **Invoice Styling**: Brand accent terracotta `#9f3f29`, background beige `#faf8f5`, text foreground `#1c1c19`. Text auto-wrapping uses `doc.splitTextToSize`.
- **Status Audits**: Transitions append logging entries to the database status timeline in `public.order_status_history`.
- **Custom Status Registry**: Links to `public.order_custom_statuses`. Custom status insertion requires dropping the database-level `orders_status_check` constraint.

---

## 4. Customers & Accounts (`/admin/customers`)

### Operations Handbook
- **Shopper Timelines**: Search customer rows, view their order history, and leave internal support notes.
- **Address Management**: Correct customer shipment address typos or set default shipping/billing targets.
- **Soft Deletion Compliance**: When a customer requests account deletion, the system performs a soft deletion. This anonymizes personal identification fields (email, name, phone, address records) and disables login capabilities, while keeping order statistics intact for accurate monthly sales accounting.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Customer Directory - Lifetime Value Dashboard and Search Filters]`
- **Screenshot Placeholder**: `[Screenshot Placeholder: Customer Detail Page - Privacy Actions and Anonymize Dialog]`

### Technical Details
- **List View Query**: Queries the `admin_customer_summary` database view to optimize pagination and CSV exports.
- **Soft Deletion Endpoint**: `src/app/api/account/delete-request/route.ts` runs anonymization SQL calls. It changes user email to `deleted-${userId}@ecomshrihari.local`, randomizes the password, and updates account status in `profiles` to `deleted`.
- **Default Address Invariant**: Address creation calls default-clearing SQL scripts to ensure that each customer profile retains only one default billing and one default shipping address.

---

## 5. Coupons & Discounts (`/admin/coupons`)

### Operations Handbook
- **Discount Types**: Create codes with percentage-based (e.g., 10% off) or fixed-amount (e.g., ₹200 off) discounts.
- **Usage Rules**: Enforce expiration dates, cart minimum limits, and maximum use caps.
- **User-Specific Constraints**: Enable the targeted coupon option and select which customer emails are eligible to redeem the code. Unassigned users will see validation errors if they try to apply it.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Coupon Creator - User-Targeted Account Lookup]`

### Technical Details
- **Database Tables**:
  - `coupons` (Discount rules and constraints)
  - `coupon_user_assignments` (User profile mappings for targeted campaigns)
  - `coupon_redemptions` (Usage log history)
- **Validation Pipeline**: Checks constraints (subtotal thresholds, user ID matches, expiration dates) before modifying the checkout cart total.
- **Atomic Locking Redemption**: Uses `redeem_coupon_atomic` database function with a pg advisory transaction lock to protect against race conditions.
- **Influenced Revenue Calculation**: Queries order tables by filtering records that redeemed the target coupon code.

---

## 6. Content Management (CMS) (`/admin/cms`, `/admin/blog`)

### Operations Handbook
- **Homepage Sliders**: Add announcement bars, main hero images, and promotional popups. Banners can be scheduled with active date windows.
- **Hero Layouts**: Select Contained or Full Width layouts for the storefront main slider.
- **Blog Engine**: Write blog articles with rich visual sections, cover images, and SEO metadata. Alt text is mandatory for images before publishing.
- **Blog Scheduler**: Schedule blog posts to publish automatically by selecting a future date and time in Indian Standard Time (IST).
- **Email Notification Templates**: Customize templates for transaction alerts (Order Placed, Payment Received, Order Shipped).
- **Screenshot Placeholder**: `[Screenshot Placeholder: CMS Banners - Priority Ordering and Upload Panel]`
- **Screenshot Placeholder**: `[Screenshot Placeholder: CMS Blog Editor - Schedule Timestamp and Alt Text Requirement]`

### Technical Details
- **Banners Grouping**: Banners are stored in the `banners` table. The admin page aggregates hero rows into a single synthetic group. Banners support relative paths and absolute link URLs.
- **Scheduler Webhook**: `src/app/api/admin/blogs/scheduler/route.ts` is triggered by a cron job. It queries posts where status is `scheduled` and publish date is <= current time, running syntax validations and updating status to `published`.
- **Revision History**: Saves snapshots in `blog_post_revisions` on post edits to support rollbacks.
- **Cache Tags**: `revalidateTag("cms_banners")`, `revalidateTag("cms_categories")`, `revalidateTag("blog_posts")`.

---

## 7. Documentation & Search (`/admin/documentation`)

### Operations Handbook
- **Knowledge Base**: Access operations checklists, step-by-step task guides, and technical configurations.
- **Prominent Search**: Enter any keyword (e.g. \"GST\", \"Delhivery\", \"calculator\") to instantly filter help sections. Matching task steps will be highlighted and displayed directly on the card preview.
- **Developer Mode Toggle**: Standard admins will see simple merchant checklists by default. Toggle \"Developer Mode\" to reveal database schemas, API routes, and code references.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Admin Documentation - Search Highlight and Developer Toggle]`

### Technical Details
- **Routing Structure**:
  - Handbook: `/admin/documentation/handbook/[sectionId]`
  - Technical: `/admin/documentation/technical/[sectionId]`
- **Keyword Highlighting**: A RegEx match parsing script splits content strings and wraps matching terms in `<mark>` highlight tags.
- **Settings Persistence**: Stores the Developer Mode state in browser `localStorage` under `shreehari_docs_mode`.

---

## 8. Reports & Sales Analytics (`/admin/reports`)

### Operations Handbook
- **Reports Dashboard**: Review total revenue, average order value, payment distributions, and order growth.
- **Date Slicing**: Adjust date parameters (Today, Last 7 Days, Custom Date Range) to parse metrics.
- **Data Export**: Export reports directly to CSV spreadsheets for offline bookkeeping.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Sales Reports - Date Preset Filter and CSV Export Trigger]`

### Technical Details
- **SQL Aggregations**: Queries the `orders` table to compute sums and counts, grouping records by payment status.
- **Recharts Configurations**:
  - `ComposedChart`: Combines Area plot (revenue) and Line plot (order counts).
  - Donut charts: Configured with `innerRadius={60}`, `outerRadius={85}`, `paddingAngle={4}` for categories.
- **CSV Writer**: Streams string buffer data directly to client browser attachment packages, escaping comma inputs.

---

## 9. Payments Gateways & COD Surcharges (`/admin/payments`)

### Operations Handbook
- **Razorpay Settings**: View configured API keys. Online checkout validation ensures payment signatures match.
- **COD Surcharges**: Configure extra fees (e.g. ₹50) applied on cash-on-delivery checkouts.
- **Transaction Logs**: Audit transaction signature records to resolve checkout payment issues.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Payment Settings - API Credentials and COD Configuration]`

### Technical Details
- **Signature Verification**: `src/payments/razorpay/api/verify-payment.ts` confirms Razorpay payments using SHA256 HMAC validation checks on order payloads.
- **COD Payment Status**: If the checkout is COD with a partial advance payment, the verification route catches the signature, updates order status to `pending`, and updates payment status to `advance_paid` while retaining the `cod` payment method.

---

## 10. Shipping & Fulfillment Providers (`/admin/shipping`)

### Operations Handbook
- **Fulfillment Partners**: Add keys and credentials for Shiprocket and Delhivery, or select Manual shipping.
- **State-based Shipping Zones**: Group any of India's 36 states and Union Territories into custom zones. Set flat delivery fees for each zone (e.g. South Zone: ₹80, North-East: ₹150) that apply to orders below the free shipping threshold.
- **Free Shipping Limit**: Set a global free shipping threshold (e.g., free shipping on orders above ₹1500).
- **COD Advance Payments**: Require customers to pay a partial advance online via Razorpay for COD orders. This can be configured as a flat amount (e.g. ₹100) or a percentage of the cart total (e.g. 15%). The order is confirmed only after the advance payment is verified.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Shipping Settings - State Allocation Map and Zone Config]`

### Technical Details
- **Calculation Utility**: `src/lib/shipping/rates.ts` contains the core calculation function:
  ```typescript
  export function calculateCheckoutDetails(params: {
      subtotal: number;
      shippingState: string;
      paymentMethod: string;
      settings: Record<string, string>;
  }): CheckoutDetails;
  ```
- **State Groups Mapping**: Stored in the `site_settings` table as a JSON string under the key `shipping_state_groups`.
- **Public Rate API**: `/api/checkout/shipping-rates` returns calculations to the checkout widget securely without exposing API keys.

---

## 11. Settings & Cache Setup (`/admin/settings`)

### Operations Handbook
- **Theme Selection**: Toggle the storefront layout theme (e.g., Classic vs Luxury) from settings.
- **Custom Order Statuses**: Create custom order status labels with custom colors (e.g., \"Ready for Dispatch\" in Blue). Once created, these options instantly appear in order status dropdowns.
- **Cache Control**: Manually trigger cache bust actions to refresh storefront catalog caches immediately.
- **Screenshot Placeholder**: `[Screenshot Placeholder: Settings Panel - Custom Status Registry and Cache Bust Trigger]`

### Technical Details
- **Site Settings Schema**: Stores configurations in the `site_settings` table (key-value JSONB records).
- **Custom Status Schema**: Reads and writes custom badge variables to the `order_custom_statuses` table.
- **Cache Bust Endpoint**: Sends invalidation tags (e.g., `revalidateTag`) to Next.js routes to clear cached layouts (`products`, `cms_banners`, `cms_categories`, `site_config`, `blog_posts`).
