# Blog Builder Section Library

Last updated: 2026-03-28

## Purpose
Defines the canonical section templates available in the visual builder. These are theme-agnostic and must be rendered by each storefront theme through adapters.

## General Sections
- Heading + Subheading
- Rich Text / Paragraph
- Single Image
- Image with Caption
- Two Column (Text + Image)
- Quote / Testimonial
- Call to Action
- Spacer / Divider
- Embed (YouTube/Instagram)
- FAQ (Accordion)
- Image Gallery
- Table
- Custom Code (HTML/CSS/JS)

## Ecommerce Sections
- Product Card Embed
- Collection / Category Highlight
- Offer / Price Banner
- Fabric Specification Table

## Builder Operations
- Add section from library
- Reorder (up/down)
- Duplicate
- Delete
- Show/Hide toggle
- Preview (desktop/mobile frame)
- Raw JSON edit for advanced use

## Validation Notes
- Image-based sections require image_url and alt_text.
- CTA requires button label and URL.
- FAQ requires at least one Q/A item.
- Table requires rows.
- Custom code blocks should include at least one of HTML, CSS, or JS.
- Custom JS requires acknowledgment before save and publish.
- Custom code blocks are checked for unbalanced HTML tags and JS/CSS delimiters.
- Product card requires at least one SKU.
- Collection highlight requires collection ID.
