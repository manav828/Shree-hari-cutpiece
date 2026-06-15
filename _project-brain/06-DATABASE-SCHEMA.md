# 06 — Database Schema

All Supabase (PostgreSQL) tables used in the project.

---

## Core Product Tables

### `products`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | Product display name |
| `slug` | text | URL slug (unique) |
| `short_description` | text | One-line summary |
| `description` | text | Full description |
| `sell_mode` | text | `'meter'` or `'piece'` |
| `is_active` | bool | Storefront visibility |
| `is_featured` | bool | Featured on homepage |
| `is_new_arrival` | bool | New Arrivals section |
| `category_id` | uuid | FK → `categories` |
| `created_at` | timestamptz | |

### `product_variants`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `product_id` | uuid | FK → `products` |
| `color_name` | text | e.g. "Pastel Green" |
| `hex_color` | text | e.g. "#a8c5a0" |
| `sku` | text | Unique SKU |
| `selling_price` | numeric | Current price (INR) |
| `original_price` | numeric | MRP (for discount badge) |
| `stock` | int | Current inventory |
| `is_default` | bool | Default variant shown on PLP |

### `variant_images`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `variant_id` | uuid | FK → `product_variants` |
| `url` | text | Supabase storage URL |
| `is_primary` | bool | Main image for this variant |
| `sort_order` | int | Display order |

### `product_option_groups`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `product_id` | uuid | FK → `products` |
| `name` | text | e.g. "Size" |

### `product_option_values`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `group_id` | uuid | FK → `product_option_groups` |
| `value` | text | e.g. "XL" |

---

## Order Tables

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `order_number` | text | Format: `SH-YYYYMMDD-XXXX` |
| `user_id` | uuid | FK → `profiles` |
| `status` | text | `pending\|processing\|shipped\|delivered\|cancelled` |
| `payment_status` | text | `pending\|paid\|failed\|refunded` |
| `payment_method` | text | `online\|cod` |
| `subtotal` | numeric | Cart total before fees |
| `shipping_fee` | numeric | |
| `cod_charge` | numeric | COD surcharge if applicable |
| `total` | numeric | Final amount |
| `shipping_address` | jsonb | Full address object |
| `created_at` | timestamptz | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `order_id` | uuid | FK → `orders` |
| `variant_id` | uuid | FK → `product_variants` |
| `product_name` | text | Snapshot at time of order |
| `color_name` | text | Snapshot |
| `quantity` | numeric | Meters or pieces |
| `unit_price` | numeric | Price at time of order |

---

## Customer Tables

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK = Supabase auth.users.id |
| `full_name` | text | |
| `phone` | text | |
| `email` | text | |
| `is_active` | bool | Soft delete flag |
| `created_at` | timestamptz | |

### `addresses`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `profiles` |
| `name` | text | Recipient name |
| `phone` | text | |
| `line1`, `line2` | text | Street address |
| `city`, `state` | text | |
| `pincode` | text | |
| `is_default` | bool | |

---

## Coupon Tables

### `coupons`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `code` | text | Coupon code (unique) |
| `name` | text | Internal label |
| `discount_type` | text | `percentage` or `fixed` |
| `discount_value` | numeric | |
| `min_cart_subtotal` | numeric | Min cart to apply |
| `max_completed_orders_for_eligibility` | int | |
| `show_on_home_banner` | bool | |
| `show_on_checkout_modal` | bool | |
| `specific_user_only` | bool | |
| `status` | text | `active\|inactive\|archived` |
| `starts_at` / `ends_at` | timestamptz | Validity window |

### `coupon_usages`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `coupon_id` | uuid | FK → `coupons` |
| `user_id` | uuid | FK → `profiles` |
| `order_id` | uuid | FK → `orders` |
| `discount_applied` | numeric | Actual discount amount |

---

## CMS Tables

### `site_config`
Key-value store for all site settings.
| Key | Value |
|-----|-------|
| `storefront_cache_enabled` | `true/false` |
| `hero_banner_layout` | `contained` or `full_width` |
| `cod_advance_enabled` | `true/false` |
| `cod_advance_amount` | Amount in INR |
| `store_name`, `store_email`, etc. | Store info |

### `banners`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `title` | text | |
| `image_url` | text | Supabase storage URL |
| `link_url` | text | Click destination |
| `is_active` | bool | |
| `starts_at` / `ends_at` | timestamptz | Scheduling |
| `deleted_at` | timestamptz | Soft delete |
| `priority` | int | Display order |

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | |
| `slug` | text | URL slug |
| `image_url` | text | |
| `deleted_at` | timestamptz | Soft delete |

---

## Blog Tables

### `blog_posts`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `title` | text | |
| `slug` | text | Unique URL slug |
| `author` | text | |
| `cover_image_url` | text | |
| `sections` | jsonb | Section builder content array |
| `status` | text | `draft\|published\|scheduled` |
| `published_at` | timestamptz | |
| `scheduled_for` | timestamptz | Future publish time |

---

## Other Tables

### `payments`
Razorpay payment records. Linked to `orders`.

### `reviews`
| Column | Type |
|--------|------|
| `product_id` | uuid |
| `customer_name` | text |
| `rating` | int (1–5) |
| `comment` | text |
| `is_visible` | bool |
| `media_urls` | text[] |

### `shipping_zones` / `state_groups`
Groups of Indian states with associated shipping charges.

### `_migrations_history`
Tracks which SQL migration files have been applied.

---

## Supabase Storage Buckets

| Bucket | Contents |
|--------|---------|
| `product-images` | Product variant photos + review media |
| `blog-media` | Blog post images and videos |
| `cms-assets` | CMS hero images, banners, category images |

---

## RLS (Row Level Security)

All core tables must have RLS enabled.
Dashboard checks via Supabase RPC `get_disabled_rls_tables()` and shows a warning if any table is unprotected.
