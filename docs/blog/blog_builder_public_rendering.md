# Blog Public Rendering & SEO Verification

## Overview
This guide covers how published blog posts render on the public site and how to verify SEO outputs.

## Public Routes
- Blog list: `/blogs`
- Blog detail: `/blogs/[slug]`
- Hindi list: `/hi/blogs`
- Hindi detail: `/hi/blogs/[slug]`

## Rendering Behavior
- Full code mode renders HTML/CSS/JS blocks directly (default).
- Legacy visual mode uses the builder layout renderer when `editor_mode=visual`.
- Display options can hide the header/title, cover image, and share buttons.
- Related posts appear when configured ("More from our Journal" section).
- Recommended products show only when enabled and can display a custom section title.

## Share Actions
- WhatsApp share link (web).
- Facebook share link.
- Copy link for Instagram.
- Native share button appears when supported by the device.
Note: share buttons appear only when enabled in display options.

## SEO Verification Checklist
- Meta title and description appear in page source.
- Canonical URL reflects the intended route.
- OG image uses selected OG asset or cover fallback.
- Robots directive matches admin selection.
- Hreflang alternates appear for linked variants.
- BlogPosting schema is present when enabled.
- Sitemap includes published blog routes only.

## Quality Checks
- Cover image has alt text.
- Related products link to valid product pages.
- No comments UI appears on blog pages.
