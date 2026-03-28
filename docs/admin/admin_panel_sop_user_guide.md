# Shree Hari Admin Panel SOP Guide (Non-Technical)

This version is written for day-to-day admin operators.
No coding knowledge is required.

## 1. Purpose of this guide

Use this guide to run operations safely and consistently:
- Process orders
- Manage products and stock visibility
- Support customers
- Run coupon campaigns
- Publish and maintain blog posts
- Keep store theme and order statuses updated

## 2. Before you start (Daily Opening Checklist)

Complete this at the start of every shift.

1. Open `/admin/login` and sign in.
2. Confirm sidebar menu is visible (Dashboard, Products, Orders, Customers, Coupons, Blog, Settings).
3. Open Orders and check:
   - Pending orders count
   - New paid orders
   - Any delayed shipped orders
4. Open Customers and check:
   - New customer registrations
   - Customers marked blocked/suspended
5. Open Coupons and check:
   - Active campaign coupons
   - Any coupon ending today
6. Open Blog and check:
   - Scheduled posts for today
   - Drafts waiting for review
7. Record shift start note in your operations log.

## 3. Dashboard SOP

Current status: informational only (placeholder).

Use Dashboard only for a quick glance. Do not make decisions only from Dashboard numbers.
For operational decisions, always use module pages (Orders, Products, Customers, Coupons, Blog).

## 4. Orders SOP

Main page: `/admin/orders`

### A) Process new orders

1. Filter `Status = pending`.
2. Open each order using `View`.
3. Verify customer address and phone.
4. Verify payment status:
   - If `paid`: continue processing.
   - If `pending` or `failed`: hold and flag for review.
5. Move order status in sequence:
   - `pending` -> `confirmed` -> `processing` -> `packed` -> `shipped` -> `delivered`
6. Add note if anything unusual (stock issue, customer call, address clarification).

### B) Add tracking after shipment

1. Open order detail page.
2. Add/update tracking URL.
3. Change status to `shipped`.
4. Save.

### C) Print invoice/label

1. From orders list or order detail, click `Print`.
2. Verify customer name, address, phone, and item list.
3. Print and attach with package.

### D) Handling exceptions

- Wrong address:
  - Pause dispatch, contact customer, note update.
- Payment mismatch:
  - Keep status unchanged, tag for finance follow-up.
- Out of stock after order:
  - Add note, contact customer, escalate to manager.

## 5. Products SOP

Main page: `/admin/products`

### A) Create new product

1. Go to `New Product`.
2. Fill product basics:
   - Name, slug, category, description
3. Fill selling details:
   - Sell mode (`meter` or `quantity`)
   - Fabric/care details
4. Add at least one variant:
   - Color
   - Price and original price
   - Stock
   - SKU
   - Images (set primary image)
5. Set visibility options:
   - Active
   - Featured (optional)
   - New arrival (optional)
6. Click `Publish`.

### B) Edit existing product

1. Open product -> Edit.
2. Update required fields (price, stock, media, status).
3. Save changes.
4. Open storefront preview link and verify display.

### C) Stock and visibility routine

Do this at least once daily:
- Check low stock items.
- Disable products that should not be sold.
- Verify default variant is correct.

### D) Category management

Page: `/admin/products/categories`

Allowed actions:
- Add category
- Rename category
- Delete unused category

Always ensure category names are clear and customer-friendly.

## 6. Customers SOP

Main page: `/admin/customers`

### A) Find and review customer

1. Search by name/email/phone.
2. Open customer detail page.
3. Review:
   - Join date
   - Last login
   - Order history
   - LTV (lifetime value)
   - Current status

### B) Add support notes

1. In customer detail, write note with clear summary.
2. Keep notes factual and short.
3. Include date/time and action taken.

Good note format:
- `Customer requested delivery date change to Friday. Confirmed over call.`

### C) Change account status

Use only when required:
- `active`: normal account
- `suspended`: temporary restriction
- `blocked`: severe misuse/fraud

Before changing status:
1. Add reason note.
2. Confirm with policy/manager when needed.
3. Apply status change.

### D) Address corrections

1. Add/edit/delete address from customer detail page.
2. Set default shipping/billing correctly.
3. Save and confirm updates visible.

### E) Export customer list

1. Apply filters in customer list.
2. Click `Export CSV`.
3. Share with authorized internal team only.

## 7. Coupons SOP

Main page: `/admin/coupons`

### A) Create campaign coupon

1. Click `Create Coupon`.
2. Fill required fields:
   - Code
   - Name
   - Discount type/value
   - Start date/time
   - Destination URL
3. Set optional controls:
   - Minimum cart subtotal
   - Usage limits
   - End date
   - Specific users only
4. Set visibility:
   - Home banner
   - Checkout modal
5. Save.

### B) Activate/deactivate coupon

1. From coupons list, click Activate/Deactivate.
2. Confirm status badge changed.
3. Test on storefront checkout before announcing campaign.

### C) Campaign safety checklist

Before publishing campaign:
- Code is easy to type
- Discount is correct
- Start/end times are correct
- Destination URL opens correctly
- Eligibility rules match marketing message

## 8. Blog SOP

Main page: `/admin/blog`

### A) Create a new post

1. Click `Create Blog Post`.
2. Fill basics:
   - Title (slug auto-fills)
   - Summary
   - Category and tags
   - Language and author
3. Set a cover image using `Select` and confirm preview.
4. Choose display options (show header, cover image, share buttons).
5. Add content in the HTML/CSS/JS editor.
6. Click `Render Preview` and confirm layout.
7. Fill SEO fields (meta title/description, OG fields, canonical, robots).
8. Link language variants if required.
9. Add related posts (max 5).
10. Enable recommended products and select up to 10 items.
11. `Save Draft`, then `Publish` or `Schedule`.

### B) Edit an existing post

1. Use search/filters to find the post.
2. Click `Edit`.
3. Update fields and `Save Draft`.
4. For published posts, use `View Live` to confirm output.

### C) Schedule a post

1. Set Status to `scheduled`.
2. Set the scheduled date/time (IST).
3. Click `Schedule`.

### D) Publish checks

- Title and slug must be present.
- Cover image is required only if "Show cover image" is enabled.
- Custom JS requires the acknowledgment toggle.

## 9. Settings SOP

Main page: `/admin/settings`

### A) Theme switching

1. Choose `Classic` or `Luxury`.
2. Save.
3. Open storefront and verify:
   - Homepage loads correctly
   - Product page loads correctly
   - Checkout page loads correctly

### B) Custom order statuses

Use only when business requires additional tracking labels.

1. Add new status label and color.
2. Keep names simple and operational (example: `Ready to Ship`).
3. Avoid too many custom statuses.
4. If no longer needed, remove unused status.

## 10. Modules not operational yet

Current placeholders:
- Reports and analytics (`/admin/reports`)

Do not plan business operations around these pages yet.

## 11. End-of-day closing checklist

1. Orders:
   - No unreviewed pending orders left unintentionally.
2. Customers:
   - All support actions have notes.
3. Products:
   - No accidental inactive/active mistakes.
4. Coupons:
   - Expired campaigns deactivated if needed.
5. Blog:
   - Review scheduled posts for the next day.
6. Log out from admin panel.
7. Submit shift summary to manager.

## 12. Escalation rules

Escalate immediately to manager/owner when:
- Suspected fraud orders
- Repeated payment mismatch
- Major pricing mistake on live product
- High-value customer complaint
- Bulk coupon misuse

Escalation note template:
- Issue:
- Affected order/customer:
- Action already taken:
- Required decision:

## 13. Quick role split (recommended)

- Order Operator:
  - Handles orders, tracking, dispatch updates
- Catalog Operator:
  - Handles products, variants, stock visibility
- Support Operator:
  - Handles customers, notes, account status, addresses
- Campaign Operator:
  - Handles coupons and activation schedules
- Content Operator:
   - Handles blog posts, SEO, scheduled publishing

For small teams, one person may do multiple roles, but still follow the same SOP steps.

---

Document type: SOP (Operations)
Audience: Admin staff, support staff, store operators
Last updated: 2026-03-29
