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
