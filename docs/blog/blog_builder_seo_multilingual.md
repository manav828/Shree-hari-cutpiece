# Blog SEO & Multilingual Guide

## Overview
This guide covers the SEO controls available in the blog editor, how they appear on public pages, and how multilingual variants are linked.

## Admin SEO Panel Workflow
- Meta title and description are required for publish and show character counters.
- Canonical URL, OG title/description, OG image, Twitter card, and robots directive are optional controls.
- Schema markup can be toggled per post.
- Redirect history is listed when a published post slug changes.

## Slug Uniqueness
- Slugs are validated on save and publish to ensure uniqueness.
- Published slug changes create redirect records automatically.

## Multilingual Variants
- Each post has a `variant_group_id` that links language variants.
- Use the Language Variants dropdown to link a post to an existing group.
- The public page shows a language switcher when variants exist.

## Public SEO Output
- Meta title and description are used for page metadata.
- OG title/description fall back to meta title/description when empty.
- OG image uses the selected OG media or falls back to the cover image.
- Robots directive is emitted from the post setting.
- Schema markup (BlogPosting) is rendered when enabled.
- Hreflang alternates are emitted for linked variants.

## Sitemap
- The sitemap includes published blog posts only.
- Entries are generated dynamically from the current publish state.

## URL Patterns
- English: `/blogs/[slug]`
- Hindi: `/hi/blogs/[slug]`
- Compatibility redirects: `/blog/[slug]` and `/hi/blog/[slug]`
