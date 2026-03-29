# 🚀 Setting Up a New Client Website

Follow these steps every time you want to launch this e-commerce site for a new client.

---

## Step 1 — Create a New Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: e.g. `clientname-store`
   - **Database Password**: set a strong password
   - **Region**: `ap-south-1` (Mumbai) — closest to India
4. Click **"Create new project"** and wait ~2 minutes for it to initialize

---l̥

## Step 2 — Run the Database Setup Script

1. In your new Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file: `docs/database_setup.sql`
4. **Copy all the content** and paste it into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)

✅ This will create ALL tables, functions, RLS policies, storage buckets, and seed data automatically.

---

## Step 3 — Get Your Project Keys

1. In your Supabase project, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon / public key** (the long JWT token)

---

## Step 4 — Update the `.env` File

In your website folder, edit (or create) the `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
```

> ⚠️ Never commit the `.env` file to git. It's already in `.gitignore`.

---

## Step 5 — Configure the Client's Details

After running the setup script, update the client settings inside Supabase:
- Go to **SQL Editor** and run:

```sql
-- Set the client's site name and info
UPDATE public.site_config SET value = 'Client Store Name' WHERE key = 'site_name';
UPDATE public.site_config SET value = 'client@email.com'  WHERE key = 'contact_email';
UPDATE public.site_config SET value = '+91XXXXXXXXXX'     WHERE key = 'contact_phone';

-- Set admin email
UPDATE public.settings SET value = 'admin@clientdomain.com' WHERE key = 'admin_email';
```

---

## Step 6 — Run the Website

```bash
npm run dev
```

The site will now connect to the new client's database. 🎉

---

## Checklist Summary

| Step | Task                                  | Done? |
|------|---------------------------------------|-------|
| 1    | Create new Supabase project           | ☐     |
| 2    | Run `docs/database_setup.sql`         | ☐     |
| 3    | Copy Project URL + Anon Key           | ☐     |
| 4    | Update `.env` file                    | ☐     |
| 5    | Update site_config with client info   | ☐     |
| 6    | Run `npm run dev` and test            | ☐     |

---

## Tables Created by the Script

| Table                       | Purpose                              |
|-----------------------------|--------------------------------------|
| `categories`                | Product categories                   |
| `products`                  | Product catalog                      |
| `product_variants`          | Color/material variants              |
| `variant_images`            | Product images & videos              |
| `profiles`                  | Basic user profiles                  |
| `user_profiles`             | Extended user profile data           |
| `user_addresses`            | Saved delivery addresses             |
| `orders`                    | Customer orders                      |
| `order_items`               | Items inside each order              |
| `order_addresses`           | Shipping/billing address per order   |
| `order_status_history`      | Order status change log              |
| `order_custom_statuses`     | Custom order status labels & colors  |
| `coupons`                   | Discount coupons                     |
| `coupon_user_assignments`   | Coupon → specific user mapping       |
| `coupon_redemptions`        | Coupon usage tracking                |
| `settings`                  | Simple key-value settings            |
| `site_settings`             | JSON-value site settings             |
| `site_config`               | Grouped site config (name, phone…)   |
| `banners`                   | Homepage & announcement banners      |
| `customer_interaction_logs` | Admin notes / customer events        |
| `blog_categories`           | Blog category taxonomy               |
| `blog_tags`                 | Blog tags                            |
| `blog_media_library`        | Blog images/media storage            |
| `blog_posts`                | Blog articles (builder + SEO)        |
| `blog_post_tags`            | Post ↔ tag relationship              |
| `blog_post_related_posts`   | Related blog posts                   |
| `blog_post_related_products`| Related products on blog posts       |
| `blog_post_revisions`       | Auto-save / version history          |
| `blog_slug_redirects`       | Old slug → new slug redirects        |
| `blog_analytics_events`     | Blog page view tracking              |
| `blog_preview_tokens`       | Draft preview links                  |
| `blog_publish_notifications`| Publish status notifications         |

**Storage Buckets**: `product-images`, `avatars`, `blog-media`
