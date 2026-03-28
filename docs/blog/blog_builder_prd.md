# Blog Builder PRD (Functional Requirements Only)

Project: Shree Hari Cutpiece
Module: Admin Blog Builder + Blog Pages
Owner: Admin Panel
Status: Draft (Functional Requirements Only)

## 1) Goals
- Allow admins to build blog pages using drag-and-drop sections.
- Allow admins to insert custom code blocks per page (HTML/CSS/JS) when needed.
- Keep blogs SEO-friendly with full control of metadata.
- Support draft, preview, publish, and rollback.

## 2) Non-Goals (Out of Scope for This PRD)
- Technical design, security implementation details, or infra choices.
- Monetization, ads, or third-party embed contracts.
- Automatic AI content generation.

## 3) User Roles
- Admin (full access to create, edit, publish, and delete blogs).
- Editor (create/edit drafts, cannot publish unless granted).
- Viewer (read-only in admin).

## 4) Blog Content Model (Functional)
- A blog post consists of:
  - Title
  - Slug (unique)
  - Summary/Excerpt
  - Cover Image
  - Content (builder layout)
  - SEO metadata
  - Publish status (Draft, Scheduled, Published)
  - Publish date/time
  - Author display name
  - Tags (multi)
  - Category (single)
  - Revision history

## 5) Builder Modes
### 5.1 Visual Builder Mode
- Admin can add, reorder, duplicate, and delete sections.
- Admin can edit section content inline (text, images, buttons, links).
- Admin can drag sections to reorder.
- Admin can preview page at desktop and mobile sizes.

### 5.2 Custom Code Section
- Admin can insert a "Custom Code" block inside the visual builder.
- The block accepts HTML, CSS, and JS for that section only.
- Admin can toggle visibility of code block (show/hide) without deletion.
- Admin can preview custom code output within the page preview.

### 5.3 Full Page Code Mode
- Admin can switch the entire page to full HTML/CSS/JS mode.
- Admin can switch back to Visual Builder (if compatible) or lock to code-only mode.
- The editor must show syntax highlighting and validation warnings.

## 6) Pre-Made Sections Library
- Heading + subheading
- Rich text / paragraph
- Image (single)
- Image with caption
- Two-column (text + image)
- Quote/testimonial
- Call-to-action (button + text)
- Spacer/divider
- Embed (YouTube/Instagram URL only)
- FAQ (accordion)

## 7) Blog Management Screens
### 7.1 Blog List
- List all posts with filters: status, author, category, tag, date range.
- Search by title, slug, or tag.
- Bulk actions: publish, unpublish, delete, duplicate.

### 7.2 Blog Editor
- Title, slug, summary, cover image fields.
- Builder canvas with section library.
- SEO panel (see Section 9).
- Preview and Draft save.
- Publish or Schedule publish.
- Revision history panel.

## 8) Revision History
- Every save creates a revision.
- Admin can preview and restore any revision.
- Admin can compare current vs previous revision (text diff for content and metadata).

## 9) SEO Functional Requirements
- Admin can set:
  - Meta title
  - Meta description
  - Canonical URL
  - OG title
  - OG description
  - OG image (manual upload by admin only, no auto-generation)
  - Twitter card type
- Auto-generated slug from title with manual override.
- Slug must be unique and validated on save.
- Blog pages must support:
  - Proper H1 for title
  - Optional H2/H3 inside content blocks
  - Schema markup (BlogPosting) toggle per post
- XML sitemap includes published blog posts only.
- 301 redirect support when slug changes.
- Multilingual blog support is required (admin can create posts per language).

## 10) Scheduling and Publishing
- Draft: not visible publicly.
- Scheduled: visible only after publish date/time.
- Published: visible immediately.
- Unpublish: removes from public site but retains in admin.

## 11) Access Control Requirements
- Only Admin can publish, schedule, delete, or restore revisions.
- Editor can create and edit drafts.
- Viewer can only read.
- Full page HTML/CSS/JS mode is allowed for all admins.
- Custom JS in code blocks is allowed for all admins.

## 12) Validation Rules
- Title is required.
- Slug is required and unique.
- Summary has max length (configurable).
- Cover image required for publish.
- Custom code blocks require explicit confirmation toggle to save.
- Invalid HTML/CSS/JS should block publish but allow draft save.

## 13) Analytics (Optional)
- Page views per post.
- Top posts by traffic.
- Referrer breakdown.

## 14) Acceptance Criteria
- Admin can create a blog using only prebuilt sections and publish.
- Admin can insert a custom code block and publish.
- Admin can switch to full page code mode and publish.
- Admin can set SEO metadata and verify it appears on public page.
- Admin can schedule a post and it appears only after scheduled time.
- Admin can rollback to an older revision.

## 15) Open Questions
- Do we want to auto-share published posts to social channels?
- Do we need version labels for blog content (beyond revision history)?
