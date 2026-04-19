# Shree Hari Premium Theme PRD

Document owner: Product + Design + Frontend
Date: 2026-03-30
Status: Draft v1
Primary scope: Upgrade current Shree Hari storefront to a premium fabric-shopping experience and create a reusable common layer for all themes.

## 1. Executive Summary

This PRD defines how to transform the current storefront into a premium, high-conversion, SEO-strong fabric commerce experience.

It has three goals:

1. Upgrade perceived brand quality (visual, content, trust) from "template-like" to "premium textile brand".
2. Improve conversion and retention through better discovery, product storytelling, and confidence-building flows.
3. Build a common shared platform so future themes reuse the same core modules and SEO framework instead of re-implementing logic per theme.

## 2. Problem Statement

The current live theme has strong foundational structure but several trust and premium blockers:

1. Placeholder and test content appears on production pages (contact details, test labels, lorem/gibberish fragments).
2. Some routes are broken or inconsistent (example: cart and locale routes returning 404).
3. Blog quality is not brand-aligned on all pages (non-fabric demo/test content visible).
4. SEO foundations are incomplete on many pages (missing canonical and OG metadata, inconsistent canonical domain in some pages).
5. Visual language mixes premium and demo-like patterns (stock-heavy imagery, uneven section quality).

## 3. Goals and Success Metrics

## 3.1 Experience Goals

1. Premium first impression within first 3 seconds.
2. Faster path from homepage to relevant fabric discovery.
3. Product pages that answer key textile-buying questions without forcing WhatsApp for basics.
4. Strong local trust for Ahmedabad store + online purchase confidence.

## 3.2 Business Goals

1. Increase conversion rate.
2. Improve average order value via bundles, related fabrics, and use-case collections.
3. Increase organic traffic via content and structured SEO.

## 3.3 KPI Targets (first 90-120 days after rollout)

1. Conversion rate: +25%.
2. Add-to-cart rate: +20%.
3. Bounce rate on homepage and PLP: -20%.
4. Organic sessions: +35%.
5. Pages with complete metadata + schema: 100% of core templates.
6. Core Web Vitals pass rate: 90%+ sessions.

## 4. Non-Goals

1. Full replatform to a new commerce backend.
2. Rewriting admin CMS from scratch.
3. Introducing AR/3D configurators in phase 1.

## 5. Users and Jobs To Be Done

## 5.1 Core Personas

1. Retail fabric buyer: Wants quality fabric per meter for custom outfits.
2. Occasion buyer: Needs quick recommendations for wedding/festival/party wear.
3. Boutique tailor/designer: Needs repeat ordering confidence and clear specs.
4. Local shopper: Prefers store visit but researches online first.

## 5.2 Jobs

1. "Help me quickly find fabric by look, feel, and use-case."
2. "Help me trust color, quality, and drape before buying online."
3. "Help me compare options and make decisions without confusion."
4. "Help me contact support fast when I need guidance."

## 6. Premium Experience Principles

1. Editorial composition: fewer but stronger blocks, more breathing room.
2. Material-first storytelling: textures, drape, close-ups, real-world use.
3. Quiet confidence: restrained typography, controlled motion, no clutter.
4. Trust in every scroll: real specs, real policies, real contact data.
5. Mobile luxury: premium visuals and speed both matter on mobile.

## 7. Information Architecture and Page Model

Primary route model:

1. Home
2. Shop (PLP)
3. Product detail (PDP)
4. Collections by use-case
5. About (craft + quality process)
6. Contact + store location
7. Blog/Guides
8. Account (login/signup)
9. Cart and checkout entry points

## 8. Common Shared Layer (Theme-Agnostic)

This is mandatory so we do not rebuild core logic for each theme.

## 8.1 What moves to Common

1. Core commerce behavior:
   - Product card behavior (quick view, badges, pricing display rules).
   - PLP filtering/sorting engine.
   - Cart drawer behavior.
   - Recommendation widgets.
2. SEO framework:
   - Metadata builder for all templates.
   - Canonical/hreflang policy.
   - Schema generators.
   - Sitemap and robots generation policy.
3. Analytics/event tracking:
   - Standard ecommerce events and UX events.
4. Accessibility and performance utilities:
   - Image loading presets.
   - Focus management.
   - Motion reduction strategy.
5. CMS-driven section contracts:
   - Shared section schema and validation.

## 8.2 What remains Theme-Specific

1. Visual tokens (palette, typography, spacing scale, shadows).
2. Section skinning (layout style, borders, accents, animation style).
3. Hero art direction and visual motifs.

## 8.3 Common Ownership Matrix

| Layer | Owner | Reuse across themes |
|---|---|---|
| Data contracts | Common | 100% |
| Commerce behaviors | Common | 100% |
| SEO/meta/schema | Common | 100% |
| Analytics events | Common | 100% |
| Visual styling | Theme | Per theme |
| Section composition order | Theme + CMS | Mostly shared |

## 8.4 Proposed Implementation Direction

1. Keep existing theme registry and active theme mechanism.
2. Add shared modules under common component areas and use them in both classic and luxury themes.
3. Use theme wrappers for style differences only.

## 9. UI/UX Plan (Detailed)

## 9.1 Global UX Upgrades (All Templates)

1. Replace placeholder content everywhere (real phone, WhatsApp, address, map pin, policies).
2. Consistent typography system:
   - Display serif for premium headings.
   - Clean sans for body and utility labels.
3. Spacing scale and rhythm:
   - Uniform section paddings.
   - Better vertical hierarchy.
4. Premium motion:
   - Slow fade/slide reveals.
   - Subtle hover image transitions.
5. Real media policy:
   - Majority real fabric photos and videos.
   - Minimize generic stock imagery.
6. Sticky concierge entry:
   - WhatsApp stylist CTA integrated with context (product/collection name).

## 9.2 Home Page Section Blueprint

| Section | Objective | Key UX Requirements | CMS Fields | Acceptance Criteria |
|---|---|---|---|---|
| Announcement bar | Surface seasonal offer without clutter | Single-line message, dismiss memory, optional countdown | text, CTA, end_date | Does not reappear after dismiss in same session |
| Hero editorial | Premium first impression | One strong statement, max 2 CTAs, real visual texture | heading, subheading, media, CTA1, CTA2 | LCP-optimized hero, clear CTA |
| Category gallery | Fast discovery | 6-8 categories with meaningful thumbnails | category_id, image, label | Category click-through > baseline |
| Use-case collections | Shopping by occasion | Wedding, festive, daily, office, bridal etc. | collection_slug, title, image | At least 4 use-case cards visible above fold on mobile by scroll 2 |
| Bestsellers rail | Proof and speed | Horizontal rail on mobile, grid on desktop | product_ids, badges | Add-to-cart from home increases |
| Fabric education strip | Reduce uncertainty | Explain GSM, drape, care in simple cards | card_title, card_copy, icon | Lower support questions on basics |
| Craft/process story | Premium brand narrative | Timeline style, photos from real workflow | headline, steps, media | Time-on-page uplift on home |
| UGC lookbook | Social trust | Real customer outcomes with product links | image, quote, linked_product | Higher PDP click-through |
| Store trust + logistics | Confidence block | Delivery, returns, quality check, store visit | policy cards | Trust section visible on all themes |
| Journal preview | SEO + discovery | Show latest 3 guides with fabric-first topics | post_ids | Blog click-through uplift |

## 9.3 Shop (PLP) Blueprint

1. Sticky filter/sort bar (mobile friendly).
2. Filter groups:
   - Fabric type.
   - Occasion.
   - Color family.
   - Price per meter.
   - Pattern/style.
3. Product card upgrades:
   - Fast facts (fabric type, feel, ideal use).
   - Discount clarity (if sale).
   - Quick add and quick view.
4. Empty state UX:
   - "No results" with suggested filters and curated alternatives.
5. Collection storytelling headers:
   - 1 short narrative per category/occasion page.

PLP acceptance criteria:

1. Filter and sort interactions <= 150ms perceived response (client-side state transitions).
2. Mobile filter open/close with preserved state.
3. Product cards keep consistent heights and typography.

## 9.4 Product Detail Page (PDP) Blueprint

1. Above-the-fold essentials:
   - Name, category, price/meter, sale info, primary CTA, WhatsApp concierge CTA.
2. Media gallery:
   - Macro texture close-up.
   - Drape visual.
   - Context/lifestyle visual.
3. Textile spec panel:
   - Width, GSM, transparency, stretch, feel, recommended usage, wash care.
4. Quantity and meter calculator:
   - Simple guide for kurti/saree/blouse/dress requirements.
5. Confidence stack:
   - Delivery timeline, return policy, quality check promise.
6. Related products:
   - "Pair with lining", "similar drape", "same color family".
7. FAQ and reviews:
   - Fabric-specific FAQs.
   - Verified user feedback.

PDP acceptance criteria:

1. No placeholder text or generic lorem blocks.
2. Spec completeness for 100% active products.
3. Add-to-cart and WhatsApp CTA both visible without long scrolling.

## 9.5 About and Contact Blueprint

1. About page:
   - Origin story.
   - Quality process.
   - Sourcing and QC standards.
   - Team/store authenticity visuals.
2. Contact page:
   - Real phone, WhatsApp, email, map embed with correct location.
   - Store hours with holiday note support.
   - Clear bulk-order CTA.

## 9.6 Blog and Guide Blueprint

1. Remove all non-brand test posts.
2. Content template sections:
   - Problem.
   - Fabric guidance.
   - Practical checklist.
   - Linked products.
3. Every post includes internal links to relevant categories and products.

## 10. SEO Plan (Detailed)

## 10.1 Technical SEO Foundation

1. Canonical tags on all indexable pages.
2. OG title/description/image on all shareable pages.
3. Stable production domain policy for canonical and sitemap.
4. Working robots.txt and clean sitemap generation.
5. Correct noindex policy for auth pages.
6. Resolve all core route 404s or remove links.

## 10.2 Metadata Framework (Common)

For each template, define metadata in common builder:

1. Home: brand + core value proposition.
2. PLP: category + intent keyword + city/India qualifiers where needed.
3. PDP: product + fabric type + use-case + price-per-meter context.
4. Blog: informational query intent and freshness.
5. About/Contact: local trust and brand entity clarity.

## 10.3 Structured Data Plan

1. Organization schema (brand identity).
2. LocalBusiness schema (store address, phone, opening hours).
3. Product schema on PDP (price, availability, offers, aggregate rating when available).
4. BreadcrumbList schema on PLP and PDP.
5. Article schema on blog posts.
6. FAQ schema on PDP and support pages where valid.

## 10.4 Content SEO Cluster Plan

Primary cluster topics for a fabric store:

1. Fabric guides:
   - Cotton vs silk vs georgette selection.
   - Fabric by season and occasion.
2. Care guides:
   - Washing, storage, stain handling by fabric.
3. Buying guides:
   - How many meters required by garment type.
4. Style guides:
   - Festival and wedding outfit fabric recommendations.
5. Local intent pages:
   - Fabric store in Ahmedabad and nearby intent topics.

## 10.5 Internal Linking Strategy

1. Blog -> relevant category pages.
2. Blog -> relevant product pages.
3. PDP -> related products and guides.
4. PLP -> key evergreen guides.

## 10.6 Image and Media SEO

1. Descriptive alt text with material context.
2. WebP/AVIF where possible.
3. Preload only true hero assets.
4. Video poster and transcript/caption where useful.

## 10.7 SEO Acceptance Criteria

1. 100% core templates have canonical + OG.
2. 100% indexable pages have unique title and meta description.
3. 0 production pages with test metadata.
4. Sitemap domain matches production domain.

## 11. Analytics and Measurement Plan

Track in shared analytics layer:

1. view_home_section
2. click_home_cta
3. view_category
4. apply_filter
5. sort_products
6. quick_view_open
7. add_to_cart
8. start_checkout
9. whatsapp_click
10. view_blog_article
11. click_related_product

Reporting cadence:

1. Weekly during rollout month.
2. Bi-weekly after stabilization.

## 12. Performance and Accessibility Requirements

## 12.1 Performance Budgets

1. LCP <= 2.5s (p75 mobile).
2. INP <= 200ms.
3. CLS <= 0.1.
4. Homepage media payload budget with strict hero prioritization.

## 12.2 Accessibility

1. Contrast compliance for all text over media.
2. Keyboard navigable menus, filters, and drawers.
3. Focus-visible treatment on all interactive elements.
4. Motion-reduced alternatives.

## 13. Rollout Plan

## Phase 0: Cleanup and Trust Foundation (Week 1)

1. Remove placeholder/test/lorem content.
2. Fix broken links and route issues.
3. Correct canonical domain and metadata gaps.

## Phase 1: Common Core Platform (Week 2-3)

1. Common SEO builder and schema layer.
2. Common product card, filter, and cart patterns.
3. Shared analytics events.

## Phase 2: Premium UI/UX Upgrade (Week 4-6)

1. Home page premium section re-composition.
2. PLP and PDP upgrades.
3. About/contact trust refresh.

## Phase 3: SEO and Content Expansion (Week 7-10)

1. Blog cluster rollout.
2. Internal linking optimization.
3. Local SEO landing and entity polish.

## Phase 4: Optimization and Experimentation (Week 11-12)

1. A/B tests for hero, cards, and PDP CTAs.
2. Mobile conversion tuning.
3. Media optimization pass.

## 14. Risks and Mitigations

1. Risk: Premium visuals may reduce speed.
   - Mitigation: strict image budgets, responsive sizes, lazy loading.
2. Risk: Theme divergence over time.
   - Mitigation: enforce common layer ownership and shared contracts.
3. Risk: Content quality drifts.
   - Mitigation: editorial checklist and CMS validation.
4. Risk: SEO regressions during redesign.
   - Mitigation: template-level metadata and schema test suite.

## 15. Definition of Done

1. No production placeholders/test content.
2. All core templates pass metadata and schema checklist.
3. Common shared modules used in both active themes.
4. Core route health has no high-priority 404s.
5. KPI dashboard active with baseline vs post-launch tracking.

## 16. Section Reference Library (Website + Image References)

Note: These references are for layout and interaction inspiration only. Do not copy proprietary assets or code.

| Target Section | Reference Website | Image Reference |
|---|---|---|
| Premium hero with clean editorial framing | https://themes.shopify.com/themes/allure/presets/carrara | https://cdn.shopify.com/theme-store/rr1e5iwq0r745ep91ddn82cq7q9i.jpg |
| Conversion-focused promo storytelling block | https://themes.shopify.com/themes/allure/presets/carrara | https://cdn.shopify.com/theme-store/ii08qgjtzh6x3svvuxiw7zpz5mz8.jpg |
| Performance-first section design | https://themes.shopify.com/themes/allure/presets/carrara | https://cdn.shopify.com/theme-store/rb7lm8mg2951t9tr2vpew3oh9hi9.jpg |
| Minimal premium identity header and collection intro | https://themes.shopify.com/themes/prestige/presets/couture | https://cdn.shopify.com/theme-store/kekisct7vylpnpv8n77flr5do90x.jpg |
| Multi-section, high-control homepage composition | https://themes.shopify.com/themes/prestige/presets/couture | https://cdn.shopify.com/theme-store/0oxl0295wua0537v09hzii8tkny9.jpg |
| Fast browsing + polished UX benchmark | https://themes.shopify.com/themes/prestige/presets/couture | https://cdn.shopify.com/theme-store/01wp805gfb8p6xxlg4ubn9lxq27f.jpg |
| Brand storytelling section with clean visual hierarchy | https://themes.shopify.com/themes/focal/presets/ivory | https://cdn.shopify.com/theme-store/xoprwsikbusnvwniy0sfm25s2veq.jpg |
| Adaptive brand sections and visual consistency | https://themes.shopify.com/themes/focal/presets/ivory | https://cdn.shopify.com/theme-store/jxj2624ch8scnf2ykc9ozkr0pa3j.jpg |
| Product recommendation/cross-sell module inspiration | https://themes.shopify.com/themes/focal/presets/ivory | https://cdn.shopify.com/theme-store/kdgj7im6ufbv98snte4jfwajaqrg.jpg |
| Quick add behavior and PLP conversion UX | https://themes.shopify.com/themes/impulse/presets/impulse | https://cdn.shopify.com/theme-store/54wmr5i7u8q3wrilvjo8kocmcgm3.jpg |
| Campaign promo integration patterns | https://themes.shopify.com/themes/impulse/presets/impulse | https://cdn.shopify.com/theme-store/wz7mwiewjf7iseu67n300wu7tc5o.jpg |
| Mobile-first layout behavior benchmark | https://themes.shopify.com/themes/impulse/presets/impulse | https://cdn.shopify.com/theme-store/ejg6bq25c1q7p6dx404saiyfdhvk.jpg |
| Editorial craft stories and behind-the-scenes format | https://www.ikea.com/global/en/ | https://www.ikea.com/global/en/media/PH_206801_90c2ffa87a.jpg?f=xxs |
| Designer/process storytelling cards | https://www.ikea.com/global/en/ | https://www.ikea.com/global/en/media/GFXS_2291_1_1_2_8ef9dac277.jpg?f=xxs |

## 17. Immediate Execution Checklist (First Sprint)

1. Replace all placeholder contact and address content.
2. Remove all test blog/product text from production.
3. Fix broken route links and locale route behavior.
4. Implement common metadata builder and canonical policy.
5. Finalize premium token system and homepage section order.
