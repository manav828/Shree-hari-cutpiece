# Blog Scheduling & Publish Lifecycle

## Overview
This guide covers scheduled publish behavior, validation fallback rules, and how scheduler updates appear in the admin UI.

## Scheduling Basics
- Schedule times are entered in IST in the admin UI.
- Stored timestamps are saved in UTC.
- Scheduled posts are published by the scheduler when scheduled_for is due.

## Scheduler Execution
- Endpoint: POST /api/admin/blogs/scheduler
- Optional header: x-blog-scheduler-secret
- Scheduler runs validation before publishing.

## Validation Failure Fallback
- If validation fails at schedule time, the post is reverted to Draft.
- A scheduler notification records the error list for admin review.

## Scheduler Notifications
- Recent scheduler results appear in the Blog Management list.
- Notifications show publish successes and validation failures.

## Unpublish Behavior
- Unpublished posts are removed from public routes.
- If a slug redirect exists, users are redirected to the new slug.
- If no redirect exists, the request returns a 410 response.

## Operational Checklist
- Confirm scheduled_for values are in IST and converted to UTC.
- Verify scheduler notifications after large publish windows.
- Ensure slug redirects exist before unpublishing critical posts.
