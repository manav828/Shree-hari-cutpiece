# Admin Panel Plan & Requirements

This document outlines the core features needed for the E-Commerce Admin Panel. We will use this as a blueprint to build the panel section by section.

## 1. Authentication & Security
*   **Role-Based Access:** The `/admin` routes must be protected so only users with an `admin` role can access them.
*   **Secure API:** All Supabase database calls from the admin panel must verify the user's admin status.

## 2. Admin Dashboard (Overview)
*   **Key Metrics Summary:**
    *   Total Sales (Revenue)
    *   Total Orders
    *   Total Customers
    *   Average Order Value
*   **Recent Activity:** A quick view of the 5-10 most recent orders.
*   **Alerts:** Low stock warnings for variants dropping below a threshold.

## 3. Product Management (Catalog)
**List View:**
*   Table displaying all products (Image, Name, Category, Price, Stock Status).
*   Search by name/SKU.
*   Filter by category or status (Active/Draft).

**Add/Edit Product Form:**
*   **Basic Info:** Title, Description, Category.
*   **Media:** Upload/Manage multiple images (stored in Supabase Storage).
*   **Pricing & Variants:**
    *   Manage Colors.
    *   Set Selling Mode (Meter vs. Piece).
    *   Set Price per unit.
    *   Set Inventory Level (Stock count).

## 4. Order Management
**List View:**
*   Table of all orders (Order ID, Date, Customer Name, Total, Payment Status, Fulfillment Status).
*   Filter by Status (Pending, Processing, Shipped, Delivered, Cancelled).

**Order Details Page:**
*   View customer shipping/billing details.
*   List of ordered items (including selected color and meter/quantity).
*   Update order status functionality (e.g., mark as "Shipped" and optionally provide a tracking number).

## 5. Coupon / Discount Management
**List View:**
*   Table of existing coupons (Code, Discount Amount/Percentage, Expiry Date, Usage Count).

**Add/Edit Coupon Form:**
*   **Code:** The text the user enters (e.g., `SUMMER20`).
*   **Discount Type:** Percentage (e.g., 20% off) or Fixed Amount (e.g., ₹500 off).
*   **Value:** The discount number.
*   **Limits:** Minimum order value required, max usage limit (overall or per user).
*   **Expiry Date:** When the coupon becomes invalid.

## 6. Reports & Analytics
*   **Sales Report:** Generate sales data over a selected date range (Daily, Weekly, Monthly) with a visual chart.
*   **Top Products:** Report showing the best-selling items by volume or revenue.
*   **Inventory Report:** Dedicated view showing current stock levels across all variants, highlighting what needs reordering.

## 7. Blog Management
**List View:**
*   Table of all blog posts (Title, Date Published, Status: Draft/Published).
*   Search and filter by status or category.

**Add/Edit Blog Post:**
*   **Title & Content:** Rich text editor for writing blog content.
*   **Featured Image:** Upload a cover image (stored in Supabase Storage).
*   **Category / Tags:** Organize posts for easy browsing.
*   **SEO Fields:** Meta title and meta description for search engine visibility.
*   **Status:** Save as Draft or Publish immediately.
*   **Publish Date:** Option to schedule a future publish date.

## 8. Customer Management
*   **List View:** Table of registered users (Name, Email, Join Date, Total Orders).
*   **Customer Details:** View their complete order history and lifetime value.

## 9. Content & Banner Management (CMS)
*   **Homepage Sections:** Control visibility (show/hide), positioning (where to show), and ordering of different sections on the homepage.
*   **Banner Management:** Upload, arrange, link, and enable/disable main hero banners and promotional banners across the site.

## Proposed Build Order
1.  **Phase 1:** Setup Layout, Routing, and Auth Protection. Dashboard overview frame.
2.  **Phase 2:** Product Management (crucial for getting catalog data right).
3.  **Phase 3:** Order Management (handling purchases).
4.  **Phase 4:** Coupon Management.
5.  **Phase 5:** Blog Management.
6.  **Phase 6:** Reports & Analytics.
7.  **Phase 7:** Customer Management & Site Settings.
8.  **Phase 8:** Content & Banner Management (CMS).
