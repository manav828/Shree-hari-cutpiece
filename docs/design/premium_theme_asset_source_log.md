# Premium Theme Asset Source Log

Last updated: 2026-04-01
Purpose: Track temporary premium-theme images and copy, verify temporary usage rights, and keep final-asset swap operations one-command ready.

## Rules
1. Use only realistic textile-commerce visuals.
2. Keep all temporary assets logged with source URL and mapped final replacement key.
3. Keep alt text fabric-specific and context-aware.
4. Use one-click replacement tooling for final-asset swap.

## Status Legend
- [x] Completed and verified for temporary rollout
- [~] In progress with clear owner
- [ ] Pending

## Licensing and Rights Notes
1. All temporary internet photos used in this rollout are from Unsplash domains (`images.unsplash.com`).
2. Temporary usage policy reference: Unsplash License (free use, attribution optional but recommended; prohibited resale of unmodified images).
3. Final launch still requires business owner approval for permanent production assets.

## Operational Replacement Tooling
1. Replacement map file: `docs/design/premium_theme_asset_replacement_map.json`
2. Dry run command: `npm run assets:replacement:dry`
3. Apply command: `npm run assets:replacement:apply`
4. Process:
	- Fill each `replacement` value in the JSON map.
	- Run dry mode and verify expected matches.
	- Run apply mode to swap URLs in tracked files.

## Asset Inventory

| Status | Section | Temporary Asset URL | Source Page URL | Rights Check | Final Replacement Key | Implementation Path |
|---|---|---|---|---|---|---|
| [x] | Home hero | https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1000&q=85 | https://unsplash.com/photos/photo-1558171813-4c088753af8f | Unsplash license reviewed | `home/hero-desktop.jpg` | `src/themes/classic/components/home/Hero.tsx` |
| [x] | Home category fallback | https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&q=80 | https://unsplash.com/photos/photo-1558171813-4c088753af8f | Unsplash license reviewed | `home/category-fallback.jpg` | `src/themes/classic/components/home/Categories.tsx` |
| [x] | Home story visual A | https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80 | https://unsplash.com/photos/photo-1558171813-4c088753af8f | Unsplash license reviewed | `home/story-craft.jpg` | `src/themes/classic/components/home/DescriptionSection.tsx` |
| [x] | Home story visual B | https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80 | https://unsplash.com/photos/photo-1549298916-b41d501d3772 | Unsplash license reviewed | `home/story-detail.jpg` | `src/themes/classic/components/home/DescriptionSection.tsx` |
| [x] | Inspiration set | https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80 | https://unsplash.com/photos/photo-1558171813-4c088753af8f | Unsplash license reviewed | `home/inspiration-kurti.jpg` | `src/themes/classic/components/home/Inspiration.tsx` |
| [x] | Inspiration set | https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80 | https://unsplash.com/photos/photo-1610030469983-98e550d6193c | Unsplash license reviewed | `home/inspiration-lehenga.jpg` | `src/themes/classic/components/home/Inspiration.tsx` |
| [x] | Inspiration set | https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80 | https://unsplash.com/photos/photo-1549298916-b41d501d3772 | Unsplash license reviewed | `home/inspiration-choli.jpg` | `src/themes/classic/components/home/Inspiration.tsx` |
| [x] | Inspiration set | https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80 | https://unsplash.com/photos/photo-1596944924616-7b38e7cfac36 | Unsplash license reviewed | `home/inspiration-festive.jpg` | `src/themes/classic/components/home/Inspiration.tsx` |
| [x] | Trending card set | https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80 | https://unsplash.com/photos/photo-1558171813-4c088753af8f | Unsplash license reviewed | `home/trending-bespoke.jpg` | `src/themes/classic/components/home/TrendingProjects.tsx` |
| [x] | Trending card set | https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80 | https://unsplash.com/photos/photo-1549298916-b41d501d3772 | Unsplash license reviewed | `home/trending-resort.jpg` | `src/themes/classic/components/home/TrendingProjects.tsx` |
| [x] | Trending card set | https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80 | https://unsplash.com/photos/photo-1539109136881-3be0616acf4b | Unsplash license reviewed | `home/trending-evening.jpg` | `src/themes/classic/components/home/TrendingProjects.tsx` |
| [x] | Trending card set | https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80 | https://unsplash.com/photos/photo-1616486338812-3dadae4b4ace | Unsplash license reviewed | `home/trending-luxe-home.jpg` | `src/themes/classic/components/home/TrendingProjects.tsx` |
| [x] | Shop hero | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1800&q=80 | https://unsplash.com/photos/photo-1521572163474-6864f9cf17ab | Unsplash license reviewed | `shop/shop-hero.jpg` | `src/themes/classic/pages/ShopPage.tsx` |
| [x] | About hero | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1800&q=80 | https://unsplash.com/photos/photo-1521572163474-6864f9cf17ab | Unsplash license reviewed | `about/about-hero.jpg` | `src/app/about/page.tsx` |
| [x] | About story visual | https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=1200&q=80 | https://unsplash.com/photos/photo-1612423284934-2850a4ea6b0f | Unsplash license reviewed | `about/about-story.jpg` | `src/app/about/page.tsx` |
| [x] | Contact hero | https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1600&q=80 | https://unsplash.com/photos/photo-1456324504439-367cee3b3c32 | Unsplash license reviewed | `contact/contact-hero.jpg` | `src/app/contact/page.tsx` |
| [x] | Contact store visual | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80 | https://unsplash.com/photos/photo-1521572163474-6864f9cf17ab | Unsplash license reviewed | `contact/contact-store.jpg` | `src/app/contact/page.tsx` |
| [x] | Login panel visual | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80 | https://unsplash.com/photos/photo-1521572163474-6864f9cf17ab | Unsplash license reviewed | `auth/login-panel.jpg` | `src/app/login/page.tsx` |
| [x] | Signup panel visual | https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=1600&q=80 | https://unsplash.com/photos/photo-1612423284934-2850a4ea6b0f | Unsplash license reviewed | `auth/signup-panel.jpg` | `src/app/signup/page.tsx` |
| [x] | Blog + policy hero family | https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1800&q=80 | https://unsplash.com/photos/photo-1456324504439-367cee3b3c32 | Unsplash license reviewed | `blogs/blog-hero.jpg` | `src/app/blogs/page.tsx`, `src/app/hi/blogs/page.tsx`, `src/components/policy/PolicyPageLayout.tsx` |

## Alt Text Coverage (Fabric-Specific)

| Status | Area | Notes |
|---|---|---|
| [x] | Home hero | Fabric texture + drape specific alt text in classic hero.
| [x] | Home inspiration cards | Alt text updated to garment-use + fabric context.
| [x] | Home trending cards | Alt text updated to fabric-type use-case descriptions.
| [x] | Shop hero | Alt text references core fabric families.
| [x] | About/Contact visuals | Alt text describes store textile context.
| [x] | Login/Signup visuals | Alt text describes premium fabric identity visuals.
| [x] | Blog listing hero EN/HI | Alt text references fabric guide intent.
| [x] | PDP gallery thumbnails | Alt text now includes gallery sequence labels (hero/texture/drape/use-case).

## Copy Authenticity Log

| Status | Area | Current State | Approval Owner |
|---|---|---|---|
| [x] | About | Heritage/process narrative uses realistic tone | Content + Frontend |
| [x] | Contact | Store/help copy aligned with brand constants | Operations + Frontend |
| [x] | Shop | Premium merchandising intro is live | Merchandising + Frontend |
| [x] | Auth | Legal and support copy aligned to live policy routes | Frontend + QA |
| [x] | Blog | Fabric-first listing/detail copy and localization in EN/HI | Content + SEO |

## Replacement Readiness Checklist
- [x] Every temporary image has a map entry and replacement key.
- [x] One-command replacement workflow is available (`assets:replacement:apply`).
- [x] Replacement filename convention is documented in map keys (`home/*`, `shop/*`, `about/*`, `contact/*`, `auth/*`, `blogs/*`).
- [x] Alt text baseline is fabric-specific across premium storefront sections.
- [x] Temporary rights notes are documented for all internet image sources.
