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
