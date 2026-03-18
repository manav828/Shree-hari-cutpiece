-- ============================================================
-- SHREE HARI CUT PIECE - MASTER DATABASE SETUP
-- ============================================================
-- Purpose:
--   Single-run bootstrap script for a fresh Supabase database.
--
-- Contains (in dependency-safe order):
--   1) Orders module schema + policies + seed data
--   2) Custom order statuses
--   3) Customers module
--   4) Coupons module
--   5) Atomic coupon redemption function
--   6) Order status history user-read policy
--
-- Notes:
--   - This script is assembled from files under db/migrations.
--   - Run in Supabase SQL Editor as a privileged role.
-- ============================================================


-- ============================================================
-- SOURCE: db/migrations/supabase_orders_migration.sql
-- ============================================================

-- ============================================================
-- SHREE HARI CUT PIECE — ORDERS MODULE MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. SETTINGS TABLE (admin-configurable globals)
CREATE TABLE IF NOT EXISTS public.settings (
    key         text PRIMARY KEY,
    value       text NOT NULL,
    label       text,
    updated_at  timestamptz DEFAULT now()
);

-- Seed default shipping fee
INSERT INTO public.settings (key, value, label)
VALUES ('shipping_fee', '50.00', 'Shipping Fee (₹)')
ON CONFLICT (key) DO NOTHING;

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        text UNIQUE NOT NULL,
    user_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status              text NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','processing','packed','shipped','delivered','cancelled','refunded')),
    payment_status      text NOT NULL DEFAULT 'pending'
                            CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded')),
    payment_method      text NOT NULL DEFAULT 'cod'
                            CHECK (payment_method IN ('cod','razorpay')),
    razorpay_order_id   text,
    razorpay_payment_id text,
    subtotal            numeric(10,2) NOT NULL DEFAULT 0,
    discount_amount     numeric(10,2) NOT NULL DEFAULT 0,
    shipping_amount     numeric(10,2) NOT NULL DEFAULT 50.00,
    total_amount        numeric(10,2) NOT NULL DEFAULT 0,
    coupon_id           uuid,   -- future FK to coupons
    coupon_code         text,
    tracking_url        text,
    label_printed       boolean NOT NULL DEFAULT false,
    notes               text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 3. ORDER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.order_addresses (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    type            text NOT NULL DEFAULT 'shipping'
                        CHECK (type IN ('shipping','billing')),
    full_name       text NOT NULL,
    phone           text NOT NULL,
    address_line1   text NOT NULL,
    address_line2   text,
    city            text NOT NULL,
    state           text NOT NULL,
    pincode         text NOT NULL,
    country         text NOT NULL DEFAULT 'India'
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id      uuid,   -- soft reference, not FK (snapshot)
    variant_id      uuid,   -- soft reference, not FK (snapshot)
    product_name    text NOT NULL,
    variant_color   text,
    selling_mode    text NOT NULL DEFAULT 'meter'
                        CHECK (selling_mode IN ('meter','piece')),
    quantity        numeric(10,3) NOT NULL,
    unit_price      numeric(10,2) NOT NULL,
    total_price     numeric(10,2) NOT NULL,
    image_url       text
);

-- 5. ORDER STATUS HISTORY TABLE (audit trail)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status text,
    to_status   text NOT NULL,
    changed_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    note        text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_addresses_order_id ON public.order_addresses(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- ============================================================
-- FUNCTION: auto-update orders.updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Admin can do everything (using service key bypasses RLS)
-- Public read for own orders
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own order addresses"
    ON public.order_addresses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_addresses.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Settings readable by all (shipping fee shown on checkout)
CREATE POLICY "Settings are publicly readable"
    ON public.settings FOR SELECT
    USING (true);

-- ============================================================
-- SEED: 3 REALISTIC TEST ORDERS (for UI development)
-- ============================================================

-- Order 1: Delivered, paid, with coupon
DO $$
DECLARE
    o1_id uuid := gen_random_uuid();
    o2_id uuid := gen_random_uuid();
    o3_id uuid := gen_random_uuid();
BEGIN
    -- ORDER 1: Delivered
    INSERT INTO public.orders (id, order_number, status, payment_status, payment_method,
        subtotal, discount_amount, shipping_amount, total_amount,
        coupon_code, created_at, updated_at)
    VALUES (o1_id, 'SH-20260301-0001', 'delivered', 'paid', 'cod',
        2125.00, 212.50, 50.00, 1962.50,
        'SAVE10', '2026-03-01 10:30:00+05:30', '2026-03-05 14:00:00+05:30');

    INSERT INTO public.order_addresses (order_id, type, full_name, phone, address_line1, city, state, pincode)
    VALUES (o1_id, 'shipping', 'Ramesh Kumar', '9876543210', '12, Gandhi Nagar, Near Bus Stand', 'Surat', 'Gujarat', '395001');

    INSERT INTO public.order_items (order_id, product_name, variant_color, selling_mode, quantity, unit_price, total_price)
    VALUES
        (o1_id, 'Pure Silk Saree', 'Golden Yellow', 'meter', 2.5, 850.00, 2125.00),
        (o1_id, 'Linen Fabric', 'Navy Blue', 'meter', 1.0, 450.00, 450.00),
        (o1_id, 'Cotton Voile', 'White', 'meter', 3.0, 180.00, 540.00),
        (o1_id, 'Georgette Fabric', 'Pink', 'piece', 2.0, 320.00, 640.00);

    INSERT INTO public.order_status_history (order_id, from_status, to_status, note, created_at)
    VALUES
        (o1_id, NULL, 'pending', 'Order placed by customer', '2026-03-01 10:30:00+05:30'),
        (o1_id, 'pending', 'confirmed', 'Confirmed by admin', '2026-03-01 11:00:00+05:30'),
        (o1_id, 'confirmed', 'shipped', 'Dispatched via DTDC', '2026-03-03 09:00:00+05:30'),
        (o1_id, 'shipped', 'delivered', 'Delivered successfully', '2026-03-05 14:00:00+05:30');

    -- ORDER 2: Shipped (active)
    INSERT INTO public.orders (id, order_number, status, payment_status, payment_method,
        subtotal, discount_amount, shipping_amount, total_amount,
        tracking_url, created_at, updated_at)
    VALUES (o2_id, 'SH-20260308-0002', 'shipped', 'paid', 'cod',
        1350.00, 0, 50.00, 1400.00,
        'https://track.delhivery.com/12345', '2026-03-08 15:45:00+05:30', '2026-03-09 10:00:00+05:30');

    INSERT INTO public.order_addresses (order_id, type, full_name, phone, address_line1, city, state, pincode)
    VALUES (o2_id, 'shipping', 'Priya Sharma', '9123456780', 'B-204, Lotus Apartments, MG Road', 'Ahmedabad', 'Gujarat', '380001');

    INSERT INTO public.order_items (order_id, product_name, variant_color, selling_mode, quantity, unit_price, total_price)
    VALUES
        (o2_id, 'Banarasi Silk', 'Maroon', 'meter', 3.0, 450.00, 1350.00);

    INSERT INTO public.order_status_history (order_id, from_status, to_status, note, created_at)
    VALUES
        (o2_id, NULL, 'pending', 'Order placed', '2026-03-08 15:45:00+05:30'),
        (o2_id, 'pending', 'confirmed', NULL, '2026-03-08 16:30:00+05:30'),
        (o2_id, 'confirmed', 'shipped', 'Delhivery tracking added', '2026-03-09 10:00:00+05:30');

    -- ORDER 3: Pending (brand new)
    INSERT INTO public.orders (id, order_number, status, payment_status, payment_method,
        subtotal, discount_amount, shipping_amount, total_amount,
        notes, created_at, updated_at)
    VALUES (o3_id, 'SH-20260309-0003', 'pending', 'pending', 'cod',
        890.00, 0, 50.00, 940.00,
        'Please pack carefully, gift item', '2026-03-09 20:00:00+05:30', '2026-03-09 20:00:00+05:30');

    INSERT INTO public.order_addresses (order_id, type, full_name, phone, address_line1, address_line2, city, state, pincode)
    VALUES (o3_id, 'shipping', 'Anjali Patel', '9988776655', 'Plot 7, Sector 21', 'Near City Mall', 'Gandhinagar', 'Gujarat', '382021');

    INSERT INTO public.order_items (order_id, product_name, variant_color, selling_mode, quantity, unit_price, total_price)
    VALUES
        (o3_id, 'Chanderi Silk', 'Pastel Green', 'meter', 2.0, 445.00, 890.00);

    INSERT INTO public.order_status_history (order_id, from_status, to_status, note, created_at)
    VALUES
        (o3_id, NULL, 'pending', 'Order placed by customer', '2026-03-09 20:00:00+05:30');

END $$;

-- ============================================================
-- SOURCE: db/migrations/supabase_custom_statuses_migration.sql
-- ============================================================

-- ============================================================
-- SHREE HARI — CUSTOM ORDER STATUSES + RLS FIX
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. FIX: Allow admin (service role) to insert into order_status_history
-- The service key bypasses RLS but let's add an explicit policy for safety
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Drop if exists to re-create cleanly
DROP POLICY IF EXISTS "Admin can insert order status history" ON public.order_status_history;
DROP POLICY IF EXISTS "Admin can read order status history" ON public.order_status_history;

-- Allow service role (used by server actions) to do everything
CREATE POLICY "Service role full access on order_status_history"
    ON public.order_status_history
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. CREATE custom order statuses table
CREATE TABLE IF NOT EXISTS public.order_custom_statuses (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    label       text NOT NULL,
    color       text NOT NULL DEFAULT '#6366f1',
    sort_order  int NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_custom_statuses ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read (admin panel needs to load these)
DROP POLICY IF EXISTS "Anyone can read custom statuses" ON public.order_custom_statuses;
CREATE POLICY "Anyone can read custom statuses"
    ON public.order_custom_statuses FOR SELECT
    USING (true);

-- Service role can manage (insert/update/delete)
DROP POLICY IF EXISTS "Service role manages custom statuses" ON public.order_custom_statuses;
CREATE POLICY "Service role manages custom statuses"
    ON public.order_custom_statuses FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Seed default statuses (skip if already seeded)
INSERT INTO public.order_custom_statuses (label, color, sort_order)
VALUES
    ('Pending',     '#f59e0b', 0),
    ('In Progress', '#6366f1', 1),
    ('Packed',      '#a855f7', 2),
    ('Shipped',     '#14b8a6', 3),
    ('Delivered',   '#22c55e', 4),
    ('Cancelled',   '#ef4444', 5),
    ('Refunded',    '#94a3b8', 6)
ON CONFLICT DO NOTHING;

-- 4. Remove the strict status CHECK constraint from orders table 
--    so custom statuses can be saved without hitting a DB violation
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- ============================================================
-- SOURCE: db/migrations/supabase_customers_migration.sql
-- ============================================================

-- ============================================================
-- SHREE HARI CUT PIECE — CUSTOMERS MODULE MIGRATION (PHASE 1)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1) Timestamp helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2) Customer profile table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name           text,
    phone               text,
    avatar_url          text,
    newsletter_opt_in   boolean NOT NULL DEFAULT true,
    sms_opt_in          boolean NOT NULL DEFAULT false,
    marketing_opt_in    boolean NOT NULL DEFAULT true,
    account_status      text NOT NULL DEFAULT 'active'
                            CHECK (account_status IN ('active', 'suspended', 'blocked')),
    preferred_language  text NOT NULL DEFAULT 'en',
    internal_notes      text,
    last_login_at       timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 3) Address book table
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name               text NOT NULL,
    phone                   text NOT NULL,
    address_line1           text NOT NULL,
    address_line2           text,
    city                    text NOT NULL,
    state                   text NOT NULL,
    pincode                 text NOT NULL,
    country                 text NOT NULL DEFAULT 'India',
    is_default_shipping     boolean NOT NULL DEFAULT false,
    is_default_billing      boolean NOT NULL DEFAULT false,
    is_deleted              boolean NOT NULL DEFAULT false,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER trg_user_addresses_updated_at
BEFORE UPDATE ON public.user_addresses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4) Interaction logs (admin support notes + system events)
CREATE TABLE IF NOT EXISTS public.customer_interaction_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type      text NOT NULL
                    CHECK (event_type IN ('order_placed', 'status_changed', 'note_added', 'email_sent', 'support_contact')),
    event_data      jsonb,
    created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    note            text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- 5) Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON public.user_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_deleted ON public.user_addresses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_customer_interaction_logs_user_id ON public.customer_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_interaction_logs_created_at ON public.customer_interaction_logs(created_at DESC);

-- 6) Admin summary view for fast list APIs
CREATE OR REPLACE VIEW public.admin_customer_summary AS
WITH order_agg AS (
    SELECT
        o.user_id,
        COUNT(*)::int AS total_orders,
        COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total_amount ELSE 0 END), 0)::numeric(12,2) AS lifetime_value,
        MAX(o.created_at) AS last_order_date
    FROM public.orders o
    WHERE o.user_id IS NOT NULL
    GROUP BY o.user_id
)
SELECT
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    up.full_name,
    up.phone,
    up.account_status,
    COALESCE(oa.total_orders, 0)::int AS total_orders,
    COALESCE(oa.lifetime_value, 0)::numeric(12,2) AS lifetime_value,
    oa.last_order_date
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.id = u.id
LEFT JOIN order_agg oa ON oa.user_id = u.id;

-- 7) RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interaction_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profiles_admin_all ON public.user_profiles;
CREATE POLICY user_profiles_admin_all ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS user_profiles_self_select ON public.user_profiles;
CREATE POLICY user_profiles_self_select ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS user_profiles_self_update ON public.user_profiles;
CREATE POLICY user_profiles_self_update ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS user_profiles_self_insert ON public.user_profiles;
CREATE POLICY user_profiles_self_insert ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS user_addresses_admin_all ON public.user_addresses;
CREATE POLICY user_addresses_admin_all ON public.user_addresses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS user_addresses_self_select ON public.user_addresses;
CREATE POLICY user_addresses_self_select ON public.user_addresses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND is_deleted = false);

DROP POLICY IF EXISTS user_addresses_self_insert ON public.user_addresses;
CREATE POLICY user_addresses_self_insert ON public.user_addresses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_addresses_self_update ON public.user_addresses;
CREATE POLICY user_addresses_self_update ON public.user_addresses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_addresses_self_delete ON public.user_addresses;
CREATE POLICY user_addresses_self_delete ON public.user_addresses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS customer_interaction_logs_admin_all ON public.customer_interaction_logs;
CREATE POLICY customer_interaction_logs_admin_all ON public.customer_interaction_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.admin_customer_summary FROM anon, authenticated;
GRANT SELECT ON public.admin_customer_summary TO service_role;

-- ============================================================
-- SOURCE: db/migrations/supabase_coupons_migration.sql
-- ============================================================

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

-- ============================================================
-- SOURCE: db/migrations/supabase_coupon_atomic_redemption.sql
-- ============================================================

-- Atomic coupon redemption guard (Phase 1 hardening)
-- Ensures global/per-user usage limits are enforced under a transaction lock.

create or replace function public.redeem_coupon_atomic(
    p_coupon_id uuid,
    p_user_id uuid,
    p_order_id uuid,
    p_discount_amount numeric
)
returns table(success boolean, error_code text, error_message text)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_coupon record;
    v_global_redemptions int;
    v_user_redemptions int;
begin
    if p_coupon_id is null then
        return query select false, 'INVALID_INPUT', 'Coupon id is required.';
        return;
    end if;

    if p_user_id is null then
        return query select false, 'INVALID_INPUT', 'User id is required.';
        return;
    end if;

    perform pg_advisory_xact_lock(hashtext(p_coupon_id::text));

    select *
    into v_coupon
    from public.coupons
    where id = p_coupon_id
    for update;

    if not found then
        return query select false, 'COUPON_NOT_FOUND', 'Coupon not found.';
        return;
    end if;

    if v_coupon.status <> 'active' then
        return query select false, 'COUPON_INACTIVE', 'Coupon is inactive.';
        return;
    end if;

    if v_coupon.starts_at is not null and now() < v_coupon.starts_at then
        return query select false, 'COUPON_NOT_STARTED', 'Coupon is not active yet.';
        return;
    end if;

    if v_coupon.ends_at is not null and now() > v_coupon.ends_at then
        return query select false, 'COUPON_EXPIRED', 'Coupon has expired.';
        return;
    end if;

    select count(*)::int
    into v_global_redemptions
    from public.coupon_redemptions
    where coupon_id = p_coupon_id;

    if v_coupon.global_usage_limit is not null and v_global_redemptions >= v_coupon.global_usage_limit then
        return query select false, 'GLOBAL_LIMIT_REACHED', 'Coupon usage limit has been reached.';
        return;
    end if;

    select count(*)::int
    into v_user_redemptions
    from public.coupon_redemptions
    where coupon_id = p_coupon_id
      and user_id = p_user_id;

    if v_coupon.per_user_usage_limit is not null and v_user_redemptions >= v_coupon.per_user_usage_limit then
        return query select false, 'PER_USER_LIMIT_REACHED', 'You have already used this coupon the maximum number of times.';
        return;
    end if;

    insert into public.coupon_redemptions (
        coupon_id,
        user_id,
        order_id,
        discount_amount,
        redeemed_at
    ) values (
        p_coupon_id,
        p_user_id,
        p_order_id,
        coalesce(p_discount_amount, 0),
        now()
    );

    return query select true, null::text, null::text;
end;
$$;

grant execute on function public.redeem_coupon_atomic(uuid, uuid, uuid, numeric) to service_role;

-- ============================================================
-- SOURCE: db/migrations/order_status_history_rls.sql
-- ============================================================

-- Enable RLS for order_status_history if not already enabled
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view the status history of their own orders
DROP POLICY IF EXISTS "Users can view their own order status history" ON public.order_status_history;

CREATE POLICY "Users can view their own order status history"
    ON public.order_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_status_history.order_id
            AND orders.user_id = auth.uid()
        )
    );
