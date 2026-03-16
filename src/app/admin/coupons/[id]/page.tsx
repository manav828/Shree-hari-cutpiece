"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CouponForm, { CouponFormValues } from "@/components/admin/coupons/CouponForm";

type AdminUser = {
    id: string;
    email: string;
    name: string;
};

type CouponApiResponse = {
    coupon: {
        id: string;
        code: string;
        name: string;
        description: string | null;
        discount_type: "percentage" | "fixed";
        discount_value: number;
        max_discount_cap: number | null;
        min_cart_subtotal: number | null;
        max_completed_orders_for_eligibility: number | null;
        global_usage_limit: number | null;
        per_user_usage_limit: number | null;
        starts_at: string;
        ends_at: string | null;
        status: "active" | "inactive" | "archived";
        show_on_home_banner: boolean;
        show_on_checkout_modal: boolean;
        specific_user_only: boolean;
        destination_url: string | null;
    };
    assigned_user_ids: string[];
};

function toDateTimeLocal(value: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
}

export default function EditCouponPage() {
    const { id } = useParams<{ id: string }>();

    const [values, setValues] = useState<CouponFormValues | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const load = async () => {
            setPageLoading(true);
            setError("");
            try {
                const [couponRes, usersRes] = await Promise.all([
                    fetch(`/api/admin/coupons/${id}`),
                    fetch("/api/admin/users"),
                ]);

                const couponJson = await couponRes.json() as CouponApiResponse | { error: string };
                const usersJson = await usersRes.json();

                if (!couponRes.ok) {
                    throw new Error((couponJson as { error?: string }).error || "Failed to fetch coupon");
                }

                const data = couponJson as CouponApiResponse;
                setValues({
                    code: data.coupon.code || "",
                    name: data.coupon.name || "",
                    description: data.coupon.description || "",
                    discount_type: data.coupon.discount_type,
                    discount_value: String(data.coupon.discount_value ?? ""),
                    max_discount_cap: data.coupon.max_discount_cap === null ? "" : String(data.coupon.max_discount_cap),
                    min_cart_subtotal: data.coupon.min_cart_subtotal === null ? "" : String(data.coupon.min_cart_subtotal),
                    max_completed_orders_for_eligibility: data.coupon.max_completed_orders_for_eligibility === null
                        ? ""
                        : String(data.coupon.max_completed_orders_for_eligibility),
                    global_usage_limit: data.coupon.global_usage_limit === null ? "" : String(data.coupon.global_usage_limit),
                    per_user_usage_limit: data.coupon.per_user_usage_limit === null ? "" : String(data.coupon.per_user_usage_limit),
                    starts_at: toDateTimeLocal(data.coupon.starts_at),
                    ends_at: toDateTimeLocal(data.coupon.ends_at),
                    status: data.coupon.status,
                    show_on_home_banner: Boolean(data.coupon.show_on_home_banner),
                    show_on_checkout_modal: Boolean(data.coupon.show_on_checkout_modal),
                    specific_user_only: Boolean(data.coupon.specific_user_only),
                    destination_url: data.coupon.destination_url || "/shop",
                    assigned_user_ids: data.assigned_user_ids || [],
                });

                if (usersRes.ok) setUsers(usersJson.users || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load coupon");
            } finally {
                setPageLoading(false);
            }
        };

        load();
    }, [id]);

    const handleSubmit = async () => {
        if (!values) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                ...values,
                assigned_user_ids: values.specific_user_only ? values.assigned_user_ids : [],
            };

            const res = await fetch(`/api/admin/coupons/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update coupon");

            setSuccess("Coupon updated successfully.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update coupon");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading || !values) {
        return <p className="text-sm text-gray-500">Loading coupon...</p>;
    }

    return (
        <CouponForm
            mode="edit"
            title={`Edit Coupon: ${values.code}`}
            submitLabel="Save Changes"
            values={values}
            users={users}
            loading={loading}
            error={error}
            success={success}
            onChange={setValues}
            onSubmit={handleSubmit}
        />
    );
}
