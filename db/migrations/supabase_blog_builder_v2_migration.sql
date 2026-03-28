-- ============================================================
-- SHREE HARI CUT PIECE — BLOG BUILDER MODULE MIGRATION (V2)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1) Shared updated_at trigger helper
create or replace function public.set_blog_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- 2) Blog taxonomy tables
create table if not exists public.blog_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    description text,
    is_active boolean not null default true,
    sort_order int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.blog_tags (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists trg_blog_categories_updated_at on public.blog_categories;
create trigger trg_blog_categories_updated_at
before update on public.blog_categories
for each row
execute function public.set_blog_updated_at();

drop trigger if exists trg_blog_tags_updated_at on public.blog_tags;
create trigger trg_blog_tags_updated_at
before update on public.blog_tags
for each row
execute function public.set_blog_updated_at();

-- 3) Media library table for blog assets
create table if not exists public.blog_media_library (
    id uuid primary key default gen_random_uuid(),
    file_name text not null,
    bucket_path text not null,
    public_url text not null,
    mime_type text,
    file_size_bytes bigint,
    width int,
    height int,
    alt_text text,
    variants jsonb not null default '{}'::jsonb,
    uploaded_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists trg_blog_media_updated_at on public.blog_media_library;
create trigger trg_blog_media_updated_at
before update on public.blog_media_library
for each row
execute function public.set_blog_updated_at();

-- 4) Core blog posts table
create table if not exists public.blog_posts (
    id uuid primary key default gen_random_uuid(),
    variant_group_id uuid not null default gen_random_uuid(),
    language text not null default 'en' check (language in ('en', 'hi', 'other')),
    title text not null,
    slug text not null unique,
    excerpt text,
    cover_media_id uuid references public.blog_media_library(id) on delete set null,
    author_name text,
    status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'unpublished')),
    scheduled_for timestamptz,
    published_at timestamptz,

    -- editor mode payload
    editor_mode text not null default 'visual' check (editor_mode in ('visual', 'full_code')),
    builder_layout jsonb,
    full_page_html text,
    full_page_css text,
    full_page_js text,
    code_mode_locked boolean not null default false,
    custom_js_acknowledged boolean not null default false,

    -- taxonomy and relations
    category_id uuid references public.blog_categories(id) on delete set null,
    schema_markup_enabled boolean not null default true,

    -- seo fields
    seo_meta_title text,
    seo_meta_description text,
    seo_canonical_url text,
    seo_og_title text,
    seo_og_description text,
    seo_og_image_media_id uuid references public.blog_media_library(id) on delete set null,
    seo_twitter_card_type text default 'summary_large_image' check (seo_twitter_card_type in ('summary', 'summary_large_image')),
    seo_robots_directive text default 'index,follow' check (seo_robots_directive in ('index,follow', 'noindex,follow', 'noindex,nofollow')),

    created_by uuid references auth.users(id) on delete set null,
    updated_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- enforce scheduled time only when status is scheduled
    constraint blog_posts_schedule_constraint check (
        (status <> 'scheduled') or (scheduled_for is not null)
    )
);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_blog_updated_at();

-- 5) Relation tables
create table if not exists public.blog_post_tags (
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    tag_id uuid not null references public.blog_tags(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (post_id, tag_id)
);

create table if not exists public.blog_post_related_posts (
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    related_post_id uuid not null references public.blog_posts(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (post_id, related_post_id),
    constraint blog_post_related_posts_not_self check (post_id <> related_post_id)
);

create table if not exists public.blog_post_related_products (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    product_id text not null,
    sort_order int not null default 0,
    created_at timestamptz not null default now(),
    unique (post_id, product_id)
);

-- 6) Revision history and slug redirects
create table if not exists public.blog_post_revisions (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    save_type text not null default 'manual' check (save_type in ('auto', 'manual', 'publish', 'restore')),
    snapshot jsonb not null,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists public.blog_slug_redirects (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    old_slug text not null,
    new_slug text not null,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    unique (old_slug)
);

-- 7) Initial analytics event table (supports dashboard rollups)
create table if not exists public.blog_analytics_events (
    id bigserial primary key,
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    event_type text not null check (event_type in ('page_view', 'product_click', 'collection_click', 'cta_click', 'share_click')),
    referrer text,
    device_type text check (device_type in ('mobile', 'desktop', 'tablet', 'unknown')),
    target_id text,
    event_at timestamptz not null default now()
);

-- 7.1) Preview tokens for time-limited shareable previews
create table if not exists public.blog_preview_tokens (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    token text not null unique,
    expires_at timestamptz not null,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

-- 7.2) Scheduler notifications (publish results)
create table if not exists public.blog_publish_notifications (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references public.blog_posts(id) on delete set null,
    status text not null check (status in ('published', 'draft', 'error')),
    message text,
    details jsonb,
    created_at timestamptz not null default now()
);

-- 8) Indexes
create index if not exists idx_blog_posts_status on public.blog_posts(status);
create index if not exists idx_blog_posts_language on public.blog_posts(language);
create index if not exists idx_blog_posts_variant_group on public.blog_posts(variant_group_id);
create index if not exists idx_blog_posts_scheduled_for on public.blog_posts(scheduled_for);
create index if not exists idx_blog_posts_published_at on public.blog_posts(published_at desc);
create index if not exists idx_blog_posts_category_id on public.blog_posts(category_id);
create index if not exists idx_blog_posts_created_at on public.blog_posts(created_at desc);
create index if not exists idx_blog_post_revisions_post_created on public.blog_post_revisions(post_id, created_at desc);
create index if not exists idx_blog_slug_redirects_post_id on public.blog_slug_redirects(post_id);
create index if not exists idx_blog_media_library_created_at on public.blog_media_library(created_at desc);
create index if not exists idx_blog_analytics_events_post_type_time on public.blog_analytics_events(post_id, event_type, event_at desc);
create index if not exists idx_blog_preview_tokens_token on public.blog_preview_tokens(token);
create index if not exists idx_blog_preview_tokens_post_id on public.blog_preview_tokens(post_id);
create index if not exists idx_blog_preview_tokens_expires_at on public.blog_preview_tokens(expires_at);
create index if not exists idx_blog_publish_notifications_post_id on public.blog_publish_notifications(post_id);
create index if not exists idx_blog_publish_notifications_created_at on public.blog_publish_notifications(created_at desc);

-- 9) RLS and policies
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_media_library enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_post_related_posts enable row level security;
alter table public.blog_post_related_products enable row level security;
alter table public.blog_post_revisions enable row level security;
alter table public.blog_slug_redirects enable row level security;
alter table public.blog_analytics_events enable row level security;
alter table public.blog_preview_tokens enable row level security;
alter table public.blog_publish_notifications enable row level security;

-- Service role: full access
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'blog_categories',
        'blog_tags',
        'blog_media_library',
        'blog_posts',
        'blog_post_tags',
        'blog_post_related_posts',
        'blog_post_related_products',
        'blog_post_revisions',
        'blog_slug_redirects',
        'blog_analytics_events',
        'blog_preview_tokens',
        'blog_publish_notifications'
    ] LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_service_role_all', t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t || '_service_role_all', t);
    END LOOP;
END $$;

-- Public read: only published posts/categories/tags and active media URLs
drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read on public.blog_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists blog_categories_public_read on public.blog_categories;
create policy blog_categories_public_read on public.blog_categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists blog_tags_public_read on public.blog_tags;
create policy blog_tags_public_read on public.blog_tags
for select
to anon, authenticated
using (true);

drop policy if exists blog_media_public_read on public.blog_media_library;
create policy blog_media_public_read on public.blog_media_library
for select
to anon, authenticated
using (true);

-- 10) Optional helper view for list summary cards
create or replace view public.blog_admin_summary as
select
    count(*) filter (where status = 'published')::int as total_published_posts,
    count(*) filter (where status = 'scheduled')::int as total_scheduled_posts,
    count(*) filter (where status = 'draft')::int as total_draft_posts,
    max(published_at) as latest_publish_at
from public.blog_posts;

revoke all on public.blog_admin_summary from anon, authenticated;
grant select on public.blog_admin_summary to service_role;
