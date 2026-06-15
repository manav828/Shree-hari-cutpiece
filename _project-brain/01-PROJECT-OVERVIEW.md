# 01 — Project Overview

## What Is This Project?

**Shree Hari Cutpiece** is a fabric e-commerce store based in India.
- Sells fabric by **meters** (cut pieces) and **pieces** (fixed items like sarees, dupattas)
- Primary customers buy fabric for stitching their own clothes
- Full-stack Next.js app with a custom Admin Panel + public Storefront
- Multi-tenant architecture — this repo is a customer clone of a core upstream repo

**Admin Panel:** `localhost:3000/admin`
**Storefront:** `localhost:3000`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14+ (App Router)** |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Database | **Supabase** (PostgreSQL + Auth + Storage) |
| ORM | Direct Supabase client (no Drizzle/Prisma) |
| Payments | **Razorpay** (online + COD advance) |
| Fonts | **Playfair Display** (`font-playfair`) for admin headings; **Newsreader** + **Manrope** for storefront |
| Icons | **lucide-react** |
| Image Storage | Supabase Storage buckets: `product-images`, `blog-media`, `cms-assets` |
| Cache | Next.js `unstable_cache` with `revalidateTag`, 1-hour TTL |
| Theme System | Custom Webpack resolver — `core/` + `changes/` override pattern |

---

## Project Folder Structure

```
D:\Manav\website\ecomshrihari\
├── _project-brain/              ← 🧠 THIS FOLDER — AI knowledge base
├── graphify-out/                ← Codebase relationship graph
├── src/
│   ├── app/
│   │   ├── admin/               ← All admin panel pages
│   │   │   ├── page.tsx         ← Dashboard
│   │   │   ├── layout.tsx       ← Admin sidebar + topbar (20KB)
│   │   │   ├── products/        ← Products, categories, stock, reviews
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   ├── new/
│   │   │   │   ├── categories/
│   │   │   │   ├── stock/
│   │   │   │   └── reviews/
│   │   │   ├── orders/          ← Order list + detail
│   │   │   ├── abandoned-carts/ ← Abandoned cart tracking
│   │   │   ├── customers/       ← Customer profiles
│   │   │   ├── coupons/         ← Coupons & discounts
│   │   │   ├── content/         ← CMS content management
│   │   │   ├── cms/             ← CMS banners, pages
│   │   │   ├── blog/            ← Blog management
│   │   │   ├── reports/         ← Reports & Analytics (single 81KB file)
│   │   │   ├── payments/        ← Payment records
│   │   │   ├── shipping/        ← Shipping zones & providers
│   │   │   ├── settings/        ← Store settings
│   │   │   └── documentation/   ← In-app knowledge base
│   │   │       ├── page.tsx
│   │   │       ├── SectionDetailPage.tsx
│   │   │       ├── docsData.ts  ← ALL doc content (43KB)
│   │   │       ├── handbook/[sectionId]/page.tsx
│   │   │       └── technical/[sectionId]/page.tsx
│   │   ├── api/
│   │   │   └── admin/           ← All admin REST API routes
│   │   ├── actions/             ← Next.js server actions
│   │   └── (storefront)/        ← Public storefront pages
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ui/              ← Table, Input, Button, etc.
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── coupons/
│   │   │   ├── blog/
│   │   │   ├── cms/
│   │   │   ├── layout/          ← AdminSidebar, AdminTopbar
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   └── (storefront components)
│   ├── themes/
│   │   └── [theme_name]/
│   │       ├── core/            ← Base theme (READ ONLY)
│   │       └── changes/         ← Customer overrides (edit here)
│   ├── lib/
│   │   ├── supabase/            ← Supabase client helpers
│   │   └── toast.ts             ← showToast() utility
│   └── types/                   ← TypeScript types
├── docs/                        ← Module PRDs, implementation guides
│   ├── admin/
│   ├── blog/
│   ├── coupons/
│   ├── customer/
│   ├── design/
│   ├── plans/
│   └── trackers/
├── db/
│   ├── migrations/core/         ← Shared migrations
│   └── migrations/custom/       ← Customer-specific migrations
├── scripts/
│   ├── db-migrate.mjs           ← Apply pending migrations
│   └── customer-setup.mjs       ← Full new customer setup
├── DEVELOPMENT_RULES.md         ← Root dev rules (critical)
├── ANTIGRAVITY.md               ← AI session quick-start file
└── TASK_CHECKLIST.md            ← Active task tracker
```

---

## Admin Sidebar Menu (in order)

1. **Dashboard** → `/admin`
2. **Products** → `/admin/products` (sub: Categories, Stock, Reviews)
3. **Orders** → `/admin/orders`
4. **Abandoned Carts** → `/admin/abandoned-carts`
5. **Customers** → `/admin/customers`
6. **Coupons** → `/admin/coupons`
7. **Content Management** → `/admin/content` (sub: Blog, CMS, Banners)
8. **Documentation** → `/admin/documentation`
9. **Reports** → `/admin/reports` (sub: Sales, Products, Customers, Inventory, Revenue)
10. **Payments** → `/admin/payments`
11. **Shipping** → `/admin/shipping`
12. **Settings** → `/admin/settings`
