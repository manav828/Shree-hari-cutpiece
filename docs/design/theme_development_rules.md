# Theme Development Rules (Single Admin Architecture)

Last updated: 2026-04-12
Owner: Frontend + CMS + QA
Purpose: Keep all storefront themes compatible with one shared admin panel and prevent future breaking changes.

Enforcement: Active at workspace level via `.github/copilot-instructions.md`.

## 1) Core Principle (Non-Negotiable)

1. There is only one admin panel for all themes.
2. Theme differences are allowed only in storefront presentation.
3. Content and banner presentation may differ by theme, but admin workflows must stay shared.

## 2) What Can Differ Between Themes

Allowed differences:

1. Landing page visual layout and section styling.
2. Typography, color system, spacing, animation style.
3. Home/Shop/Product page visual components.
4. Banner placement and content rendering style.
5. Theme-specific decorative sections (story blocks, trust blocks, lookbooks).

## 3) What Must Stay Shared Across All Themes

1. Admin routes, forms, and operational behavior.
2. Product, order, customer, coupon, and blog data models.
3. Public route contract (`/`, `/shop`, `/shop/[slug]`, `/about`, `/contact`, `/blogs`, `/hi/blogs`).
4. Core business logic (pricing, cart, checkout behavior, inventory semantics).
5. Shared APIs and permission model.

## 4) Strict Forbidden Changes

Do not do the following:

1. Create theme-specific admin panels.
2. Create separate database schema per theme.
3. Duplicate core business logic in theme folders.
4. Add direct database writes from theme UI components for critical settings.
5. Break existing admin flows to support a visual-only theme change.

## 5) Code Boundary Rules

1. Theme code lives under `src/themes/<theme-id>/...`.
2. Admin code remains under `src/app/admin/...` and shared components.
3. Shared logic stays in `src/lib`, `src/context`, and shared components.
4. If a theme needs existing behavior, prefer re-export wrappers instead of forking logic.

## 6) Theme Contract Rules

Every theme must provide compatible page entries:

1. `HomePage`
2. `ShopPage`
3. `ProductPage`

Integration rules:

1. Register theme in `src/themes/registry.ts`.
2. Keep theme validation updated in resolver code.
3. Keep fallback behavior safe (default theme must always render).

## 7) CMS and Banner Rules

1. Theme-specific variation should come from CMS-driven content and banner usage.
2. New CMS keys must be backward compatible and have safe defaults.
3. Never remove an existing CMS key without migration and fallback support.
4. Banner and copy differences should not require admin UI duplication.

## 8) Non-Breaking Development Rules

Before merge:

1. Run `npm run lint` with zero errors.
2. Verify theme switch works for all registered themes.
3. Verify storefront route health for all core routes.
4. Verify admin behavior is unchanged for products/orders/customers/blogs/settings.
5. Verify no regression in auth routes and policy pages.

## 9) Compatibility and Safety Rules

1. Any new theme must degrade gracefully to default theme if config fails.
2. Theme settings updates must not block storefront rendering.
3. When backend persistence is unavailable, fallback mode must keep storefront usable.
4. Never ship a theme that depends on a single fragile client-only call for activation.

## 10) Performance and Accessibility Rules

1. New theme UI must keep keyboard usability and visible focus states.
2. Respect reduced-motion settings.
3. Avoid excessive image payload in hero and first viewport.
4. Keep mobile-first rendering quality at parity with desktop.

## 11) Change Management Rules

1. Record major theme architecture changes in tracker changelog.
2. Document any new shared contract in this file and relevant PRD.
3. If a rule conflict appears, protect shared admin stability first.

## 12) Decision Priority (When Tradeoffs Happen)

Use this order:

1. Admin stability and shared data integrity.
2. Storefront uptime and safe fallback.
3. Functional consistency across themes.
4. Visual uniqueness and design enhancement.

---

This file is the source of truth for future theme development decisions.