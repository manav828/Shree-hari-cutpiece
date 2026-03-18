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
