"use client";

import { useEffect, useState } from "react";
import CouponForm, { CouponFormValues } from "@/components/admin/coupons/CouponForm";

type AdminUser = {
    id: string;
    email: string;
    name: string;
};

const initialValues: CouponFormValues = {
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount_cap: "",
    min_cart_subtotal: "",
    max_completed_orders_for_eligibility: "",
    global_usage_limit: "",
    per_user_usage_limit: "",
    starts_at: "",
    ends_at: "",
    status: "active",
    show_on_home_banner: true,
    show_on_checkout_modal: true,
    specific_user_only: false,
    destination_url: "/shop",
    assigned_user_ids: [],
};

export default function NewCouponPage() {
    const [values, setValues] = useState<CouponFormValues>(initialValues);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadUsers = async () => {
            const res = await fetch("/api/admin/users");
            const json = await res.json();
            if (res.ok) setUsers(json.users || []);
        };
        loadUsers();
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                ...values,
                assigned_user_ids: values.specific_user_only ? values.assigned_user_ids : [],
            };
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to create coupon");

            setSuccess("Coupon created successfully.");
            setValues(initialValues);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create coupon");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CouponForm
            mode="create"
            title="Create Coupon"
            submitLabel="Create Coupon"
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
