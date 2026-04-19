# Project Rules: Theme Development and Admin Stability

## Source of Truth

All theme and storefront work in this repository must follow:
- docs/design/theme_development_rules.md

If there is any conflict, this order must be used:
1. Admin stability and shared data integrity
2. Storefront uptime and fallback safety
3. Functional consistency across themes
4. Visual uniqueness and design enhancement

## Mandatory Architecture Rule

1. There is only one admin panel for all themes.
2. Theme differences are allowed only in storefront presentation.
3. Content and banner usage may differ by theme, but admin workflows must remain shared.

## Allowed Theme Differences

1. Landing page and storefront visual design
2. Typography, color, spacing, and motion
3. Home, shop, and product visual components
4. Theme-specific storytelling sections
5. Banner rendering style per theme

## Forbidden Changes

1. Do not create theme-specific admin panels.
2. Do not create separate schemas per theme.
3. Do not duplicate core business logic inside theme folders.
4. Do not break existing admin behavior for visual-only theme changes.
5. Do not rely on fragile client-only persistence for theme activation.

## Required Technical Contract for Every Theme

1. Must provide HomePage, ShopPage, and ProductPage entries.
2. Must be registered in src/themes/registry.ts.
3. Must be covered by active theme validation and safe default fallback.

## CMS and Banner Safety

1. Theme variation should come from CMS content and banner configuration.
2. New CMS keys must be backward compatible and include defaults.
3. Existing CMS keys must not be removed without migration and fallback handling.

## Non-Breaking Checklist (Before Merge)

1. npm run lint passes without errors.
2. Theme switching works for all registered themes.
3. Core storefront routes render correctly.
4. Admin flows remain unchanged for products, orders, customers, blogs, and settings.
5. Auth and policy routes remain healthy.

## Operational Notes

1. Prefer shared logic in src/lib, src/context, and shared components.
2. Use theme wrappers and re-exports instead of logic forks.
3. Record major theme architecture changes in docs/trackers/premium_theme_master_tracker.md.
