# 05 — Business Logic

All core business rules for Shree Hari Cutpiece.

---

## Product Selling Modes

| Mode | Description | Increment |
|------|-------------|-----------|
| `meter` | Fabric sold by the meter | 0.5m steps |
| `piece` | Fixed items (sarees, dupattas) | 1 unit steps |

The `sell_mode` column on the `products` table controls this.

---

## Product Variants

Every product has **Color Variants** (`product_variants` table):

| Field | Description |
|-------|-------------|
| `color_name` | Display name (e.g. "Pastel Green") |
| `hex_color` | Hex code for color circle on storefront (e.g. `#a8c5a0`) |
| `sku` | Unique stock keeping unit |
| `selling_price` | Current selling price in INR |
| `original_price` | Original/MRP — if higher than `selling_price`, discount tag auto-shown |
| `stock` | Current inventory count |

---

## Fabric Calculator Logic

On PDPs, customers can open a calculator modal to estimate how much fabric they need.

### Inputs:
1. **Clothing type** → base length in meters
2. **Size** → multiplier modifier
3. **Fabric width** → width modifier

### Base Presets (examples):
| Clothing Type | Base Meters |
|---------------|-------------|
| Salwar Suit | 2.5m |
| Kurti | 2.0m |
| Shirt | 2.0m |

### Modifiers:
| Size | Multiplier |
|------|-----------|
| XL | 1.2× |
| L | 1.1× |
| M | 1.0× |

| Width | Multiplier |
|-------|-----------|
| Narrow 36" | 1.25× |
| Standard 44" | 1.0× |

### Formula:
```js
const rawMeters = baseLength × sizeModifier × widthModifier;
const result = Math.max(0.5, Math.ceil(rawMeters * 2) / 2);
// Rounds UP to nearest 0.5m
```

Calculator only shows on products where `sell_mode = 'meter'`.

---

## Pricing & Currency

- All prices in **Indian Rupees (₹)**
- Format: `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
- **Discount tag**: shown automatically when `original_price > selling_price`
- **Dashboard Total Sales**: Only counts orders with `payment_status = 'paid'`
- **Charts**: Include all non-cancelled orders

---

## Order Flow

### Status Flow:
```
pending → processing → shipped → delivered
                   ↘ cancelled
```

### Payment Status:
```
pending → paid
        → failed
        → refunded
```

### Order ID Format: `SH-YYYYMMDD-XXXX`
- Example: `SH-20260309-0003`

---

## Inventory & Stock

- **Low Stock threshold**: < 20 units → appears in Dashboard Low Stock Alerts
- Stock tracked per **variant** (not per product)
- Stock deducted when order is placed (not when paid)

---

## Coupons

| Field | Description |
|-------|-------------|
| `discount_type` | `percentage` or `fixed` |
| `discount_value` | Amount (% or ₹) |
| `min_cart_subtotal` | Min cart value required |
| `max_completed_orders_for_eligibility` | Only for new/low-order customers |
| `show_on_home_banner` | Show coupon code on homepage |
| `show_on_checkout_modal` | Show in checkout coupon modal |
| `specific_user_only` | Restrict to a specific user |
| `starts_at` / `ends_at` | Validity window |

---

## Shipping

- **Provider options**: Manual (zone-based), Shiprocket, Delhivery
- **Zone groups**: Group Indian states → assign flat shipping charge
- **Free threshold**: Orders above X amount get free shipping (per zone)
- **COD surcharge**: Flat fee or % added for Cash on Delivery orders

---

## Checkout COD Advance

If `cod_advance_enabled` in settings:
1. Shows "Pay COD Advance (₹X)" instead of "Place Order"
2. Loads Razorpay for the partial advance amount
3. On Razorpay success → completes the order

---

## Razorpay Integration

- Used for online payment + COD advance
- Webhook validates payment signature server-side
- Payment records stored in `payments` table

---

## Blog System

- Section-based builder (not WYSIWYG)
- Sections: Text, Image, Quote, Product embed, etc.
- Supports scheduling (publish at future date)
- Media stored in `blog-media` Supabase bucket
- Cache tag: `revalidateTag("blog_posts")` after publish/update

---

## Reviews

- Customer can submit text + star rating (1–5) + photo/video
- Admin can: toggle visibility, create curated reviews
- Review media stored in `product-images` bucket
- Reviews linked to `product_id` in `reviews` table
