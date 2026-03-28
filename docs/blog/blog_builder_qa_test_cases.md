# Blog Builder QA Test Cases (Click-by-Click)

## Before You Start
1. Open the admin panel in your browser.
2. Go to /admin/login.
3. Enter admin credentials and click the Login button.
4. Confirm the left sidebar shows Blog.

## Admin Editor

### A1. Create draft with title + slug and save
1. Click Blog in the left sidebar.
2. Click Create Post (top right).
3. Click the Title field.
4. Type a new title (for example, "QA Draft Post").
5. Click the Slug field and confirm it auto-fills.
6. Click Save Draft in the top action bar.
7. Confirm the success banner says Saved successfully.

### A2. Add cover image and alt text, save, and validate
1. In the left panel, find Cover Media ID.
2. Click Select next to the cover field.
3. In the media modal, click Choose File under Upload New Media.
4. Pick a JPG/PNG/WebP and click Open.
5. Click the Alt text field and type a description.
6. Click Upload.
7. In the media grid, click Use on the uploaded asset.
8. Click Save Draft.
9. Click Publish to trigger validation.
10. Confirm validation results do not include "Cover image alt text is required".

### A3. Add visual sections and verify warnings for missing alt text
1. In the center panel, click the Section Library tab.
2. Click Single Image to add a section.
3. In the new section editor, leave alt_text empty.
4. Scroll to the Section warnings card.
5. Confirm a warning mentions missing alt text.
6. Fill alt_text in the section.
7. Confirm the warning clears after the next change.

### A4. Add custom code with JS and confirm acknowledgment gate blocks save
1. In Section Library, click Custom Code (HTML/CSS/JS).
2. In the new custom code section, paste a small JS snippet into the JS field.
3. Do not check the "I acknowledge custom JS risks" checkbox.
4. Click Save Draft.
5. Confirm you see the error: "Custom JS acknowledgment is required before saving."
6. Check the acknowledgment checkbox.
7. Click Save Draft again and confirm it succeeds.

### A5. Switch to full code mode and confirm HTML required validation
1. Near the editor mode toggle, click Code (full code mode).
2. Leave the HTML field empty.
3. Click Publish.
4. Confirm you see a validation error that HTML is required.
5. Paste a simple HTML block in the HTML field.
6. Click Publish and confirm the HTML error is gone.

### A6. Schedule a post in IST and verify scheduled_for stored in UTC
1. In the left panel Status dropdown, select Scheduled.
2. In Scheduled For (IST), pick a future date/time.
3. Click Save Draft.
4. Open the Supabase dashboard and go to Table Editor > blog_posts.
5. Find the row for your post and check scheduled_for.
6. Confirm scheduled_for is the UTC time that matches your IST input (IST minus 5:30).

## Media Library

### M1. Upload JPG/PNG/WebP and verify variants appear
1. In the editor, click Select next to Cover Media ID.
2. In the media modal, click Choose File.
3. Pick a JPG/PNG/WebP and click Open.
4. Enter Alt text and click Upload.
5. Open Supabase Table Editor > blog_media_library.
6. Find the new record and confirm variants JSON contains thumbnail, medium, and large entries.

### M2. Edit alt text and confirm it updates on the asset
1. Open the media modal again.
2. Locate the asset you uploaded.
3. Update the alt text field for that asset.
4. Click Save on that row.
5. Confirm the alt text is updated in the grid.

### M3. Attempt delete on a published-used asset and confirm delete is blocked
1. Attach the asset as Cover Media on a post.
2. Publish the post.
3. Open the media modal and find the same asset.
4. Click the Delete (trash) icon.
5. Confirm the API responds with a message that deletion is blocked for published usage.

## Publish Flow

### P1. Publish with missing SEO and confirm validation errors
1. Open a draft post.
2. Click the SEO & Relations panel and leave Meta Title and Meta Description empty.
3. Click Publish.
4. Confirm validation errors mention missing SEO meta title and description.

### P2. Publish with valid SEO and confirm status changes to Published
1. Fill Meta Title and Meta Description.
2. Click Publish.
3. Confirm status badge shows Published in the top bar.
4. Go back to Blog list and confirm the post status is Published.

### P3. Change slug on published post and confirm redirect record appears
1. Open a published post.
2. Edit the Slug field.
3. Click Save Draft and then Publish.
4. In the SEO panel, scroll to Redirect History.
5. Confirm a new entry shows old_slug -> new_slug.

## Scheduler

### S1. Create scheduled post with future time
1. Open a draft post with valid SEO and cover media.
2. Set Status to Scheduled.
3. Pick a future Scheduled For (IST) time.
4. Click Save Draft.

### S2. Run scheduler and verify publish on time
1. Wait until the scheduled time passes.
2. Send a POST request to /api/admin/blogs/scheduler.
3. If BLOG_SCHEDULER_SECRET is set, add header x-blog-scheduler-secret.
4. Confirm the response shows the post as published.
5. Refresh Blog list and confirm the post status is Published.

### S3. Force validation failure and verify fallback to Draft
1. Create a scheduled post missing Meta Description.
2. Wait until the scheduled time passes.
3. Run the scheduler POST call again.
4. Confirm the post status reverts to Draft.

### S4. Verify scheduler notification entry appears in admin list
1. Go to Blog list.
2. Scroll to Scheduler Updates.
3. Confirm you see a recent entry for the scheduled post.
4. If it failed, confirm the message includes validation errors.

## Public Rendering

### R1. Verify /blogs list shows only published posts
1. Open /blogs in a new tab.
2. Confirm only published posts appear.
3. Verify drafts and scheduled posts do not appear.

### R2. Verify detail page renders builder layout
1. Click a published post card from /blogs.
2. Confirm the visual sections render in the content area.
3. Confirm section order matches the builder.

### R3. Verify full code mode renders HTML/CSS/JS
1. Publish a post in full code mode with HTML/CSS/JS.
2. Open the post on /blogs/[slug].
3. Confirm HTML content renders.
4. Confirm CSS styles apply.

### R4. Verify related posts/products sections appear when linked
1. In the editor, select Related Posts and Related Products.
2. Publish the post.
3. Open the public post page.
4. Scroll to the footer sections.
5. Confirm More from our Journal and Shop This Story appear.

### R5. Verify share buttons open WhatsApp/Facebook and copy link
1. Open a public post.
2. Find the Share buttons below the excerpt.
3. Click WhatsApp and confirm a share URL opens.
4. Click Facebook and confirm the share dialog opens.
5. Click Copy for Instagram and paste into a text field to confirm the URL copied.

### R6. Verify native share works on mobile devices
1. Open the public post on a mobile device or emulator.
2. Tap the Share button.
3. Confirm the native share sheet opens.

## SEO Verification

### E1. Check meta title/description in page source
1. Open a published post page.
2. Right click and select View Page Source.
3. Confirm meta title and meta description match admin inputs.

### E2. Verify canonical URL and robots directive
1. In page source, find <link rel="canonical">.
2. Confirm the canonical URL matches the post.
3. Find <meta name="robots"> and confirm the directive.

### E3. Verify OG metadata uses fallback rules
1. Remove OG Title/Description in admin and save.
2. Reopen the post and view page source.
3. Confirm og:title and og:description fall back to meta title/description.

### E4. Verify BlogPosting schema markup when enabled
1. In the SEO panel, ensure Enable schema markup is checked.
2. Publish the post.
3. View page source and confirm a JSON-LD script with @type BlogPosting.

### E5. Verify hreflang alternates for linked variants
1. Create a Hindi variant and link it using Language Variants.
2. Publish both posts.
3. View page source and confirm hreflang alternates include both URLs.

## Unpublish

### U1. Unpublish a post and confirm it is removed from public list
1. Open the post in admin.
2. Set Status to Unpublished.
3. Click Save Draft.
4. Refresh /blogs and confirm the post is missing.

### U2. Verify old slug returns 410 when no redirect exists
1. Open the old public URL in a new tab.
2. Confirm you see the "This post is no longer available" page.
3. Confirm the response status is 410 (check browser dev tools > Network).

### U3. Verify redirect works when slug was changed on published post
1. Change slug on a published post and republish.
2. Open the old slug URL.
3. Confirm it redirects to the new slug URL.
