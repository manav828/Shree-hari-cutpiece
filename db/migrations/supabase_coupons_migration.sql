-- Coupon and Discount Management (MVP)

create table if not exists public.coupons (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    name text not null,
    description text,
    discount_type text not null check (discount_type in ('percentage', 'fixed')),
    discount_value numeric(10, 2) not null check (discount_value > 0),
    max_discount_cap numeric(10, 2),
    min_cart_subtotal numeric(10, 2),
    max_completed_orders_for_eligibility int,
    global_usage_limit int,
    per_user_usage_limit int,
    status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
    starts_at timestamptz not null default now(),
    ends_at timestamptz,
    show_on_home_banner boolean not null default false,
    show_on_checkout_modal boolean not null default true,
    specific_user_only boolean not null default false,
    destination_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_coupons_status on public.coupons(status);
create index if not exists idx_coupons_starts_at on public.coupons(starts_at);
create index if not exists idx_coupons_ends_at on public.coupons(ends_at);
create index if not exists idx_coupons_home_banner on public.coupons(show_on_home_banner);
create index if not exists idx_coupons_checkout_modal on public.coupons(show_on_checkout_modal);

create table if not exists public.coupon_user_assignments (
    id uuid primary key default gen_random_uuid(),
    coupon_id uuid not null references public.coupons(id) on delete cascade,
    user_id uuid not null,
    created_at timestamptz not null default now(),
    unique(coupon_id, user_id)
);

create index if not exists idx_coupon_user_assignments_coupon on public.coupon_user_assignments(coupon_id);
create index if not exists idx_coupon_user_assignments_user on public.coupon_user_assignments(user_id);

create table if not exists public.coupon_redemptions (
    id uuid primary key default gen_random_uuid(),
    coupon_id uuid not null references public.coupons(id) on delete cascade,
    user_id uuid,
    order_id uuid,
    discount_amount numeric(10, 2) not null default 0,
    redeemed_at timestamptz not null default now()
);

create index if not exists idx_coupon_redemptions_coupon on public.coupon_redemptions(coupon_id);
create index if not exists idx_coupon_redemptions_user on public.coupon_redemptions(user_id);
create index if not exists idx_coupon_redemptions_order on public.coupon_redemptions(order_id);

create or replace function public.set_coupon_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_coupon_updated_at on public.coupons;
create trigger trg_set_coupon_updated_at
before update on public.coupons
for each row execute function public.set_coupon_updated_at();
