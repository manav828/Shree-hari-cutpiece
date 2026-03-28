# Blog Builder Release Checklist

## Preconditions
- DB migration applied for blog module and scheduler notifications.
- Storage bucket blog-media configured with public access.
- Scheduler secret configured in production.

## QA Sign-off
- All QA test cases in blog_builder_qa_test_cases.md executed.
- Admin editor and list smoke tests complete.
- Public blog list and detail pages validated.

## SEO Verification
- Meta title/description present for published posts.
- Canonical URLs verified.
- OG and Twitter cards verified.
- BlogPosting schema markup verified when enabled.
- Hreflang alternates confirmed for variants.

## Scheduling
- Scheduler runs within 2-minute SLA window.
- Failed schedules revert to Draft and log notifications.
- Scheduler updates visible in admin list.

## Known Limits
- Unique visitors, bounce rate, and time on page are not tracked yet.
- Share click tracking depends on event instrumentation.
