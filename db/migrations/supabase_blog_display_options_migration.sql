-- Add display options for blog header, cover, and share buttons.
alter table public.blog_posts
    add column if not exists show_header boolean not null default true,
    add column if not exists show_cover boolean not null default true,
    add column if not exists show_share_buttons boolean not null default true,
    add column if not exists show_related_products boolean not null default true,
    add column if not exists related_products_title text default 'Shop This Story';
