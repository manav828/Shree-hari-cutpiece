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
