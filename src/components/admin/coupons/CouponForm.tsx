"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CouponStatus = "active" | "inactive" | "archived";
type DiscountType = "percentage" | "fixed";

export type CouponFormValues = {
    code: string;
    name: string;
    description: string;
    discount_type: DiscountType;
    discount_value: string;
    max_discount_cap: string;
    min_cart_subtotal: string;
    max_completed_orders_for_eligibility: string;
    global_usage_limit: string;
    per_user_usage_limit: string;
    starts_at: string;
    ends_at: string;
    status: CouponStatus;
    show_on_home_banner: boolean;
    show_on_checkout_modal: boolean;
    specific_user_only: boolean;
    destination_url: string;
    assigned_user_ids: string[];
};

type AdminUser = {
    id: string;
    email: string;
    name: string;
};

type Props = {
    mode: "create" | "edit";
    title: string;
    submitLabel: string;
    values: CouponFormValues;
    users: AdminUser[];
    loading?: boolean;
    error?: string;
    success?: string;
    onChange: (next: CouponFormValues) => void;
    onSubmit: () => Promise<void>;
};

type FieldErrors = Partial<Record<keyof CouponFormValues, string>>;

const DESTINATION_OPTIONS: { readonly value: string; readonly label: string }[] = [
    { value: "/shop", label: "Shop Page (/shop)" },
    { value: "/checkout", label: "Checkout Page (/checkout)" },
    { value: "/account", label: "Account Page (/account)" },
    { value: "/contact", label: "Contact Page (/contact)" },
    { value: "/", label: "Homepage (/)" },
];

const DESTINATION_OTHER = "__other__";

function parseOptionalNumber(value: string): number | null {
    if (value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function ToggleSwitch({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-700">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-gray-900" : "bg-gray-300"}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
                />
            </button>
        </div>
    );
}

export default function CouponForm({
    mode,
    title,
    submitLabel,
    values,
    users,
    loading = false,
    error,
    success,
    onChange,
    onSubmit,
}: Props) {
    const [userSearch, setUserSearch] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const filteredUsers = useMemo(() => {
        const query = userSearch.trim().toLowerCase();
        if (!query) return users;
        return users.filter((user) =>
            user.email.toLowerCase().includes(query)
            || user.name.toLowerCase().includes(query)
            || user.id.toLowerCase().includes(query),
        );
    }, [users, userSearch]);

    const toggleUser = (userId: string) => {
        const selected = new Set(values.assigned_user_ids);
        if (selected.has(userId)) selected.delete(userId);
        else selected.add(userId);
        onChange({ ...values, assigned_user_ids: Array.from(selected) });
    };

    const selectedUsersCount = values.assigned_user_ids.length;
    const presetDestinations = new Set(DESTINATION_OPTIONS.map((option) => option.value));
    const selectedDestination = presetDestinations.has(values.destination_url)
        ? values.destination_url
        : DESTINATION_OTHER;

    const updateField = <K extends keyof CouponFormValues>(field: K, value: CouponFormValues[K]) => {
        if (fieldErrors[field]) {
            const nextErrors = { ...fieldErrors };
            delete nextErrors[field];
            setFieldErrors(nextErrors);
        }
        onChange({ ...values, [field]: value });
    };

    const validate = (): FieldErrors => {
        const errors: FieldErrors = {};

        if (!values.code.trim()) errors.code = "Coupon code is required.";
        if (!values.name.trim()) errors.name = "Coupon name is required.";
        if (!values.discount_value.trim()) errors.discount_value = "Discount value is required.";
        if (!values.starts_at.trim()) errors.starts_at = "Start date and time is required.";
        if (!values.destination_url.trim()) errors.destination_url = "Destination URL is required.";

        const discountValue = parseOptionalNumber(values.discount_value);
        if (discountValue !== null && Number.isNaN(discountValue)) {
            errors.discount_value = "Discount value must be a valid number.";
        } else if (discountValue !== null && discountValue <= 0) {
            errors.discount_value = "Discount value must be greater than 0.";
        } else if (values.discount_type === "percentage" && discountValue !== null && discountValue > 100) {
            errors.discount_value = "Percentage discount cannot be greater than 100.";
        }

        const maxDiscountCap = parseOptionalNumber(values.max_discount_cap);
        if (maxDiscountCap !== null && (Number.isNaN(maxDiscountCap) || maxDiscountCap < 0)) {
            errors.max_discount_cap = "Max discount cap must be 0 or greater.";
        }

        const minSubtotal = parseOptionalNumber(values.min_cart_subtotal);
        if (minSubtotal !== null && (Number.isNaN(minSubtotal) || minSubtotal < 0)) {
            errors.min_cart_subtotal = "Minimum cart subtotal must be 0 or greater.";
        }

        const maxOrderCount = parseOptionalNumber(values.max_completed_orders_for_eligibility);
        if (maxOrderCount !== null && (Number.isNaN(maxOrderCount) || maxOrderCount < 0)) {
            errors.max_completed_orders_for_eligibility = "Order count rule must be 0 or greater.";
        }

        const globalUsageLimit = parseOptionalNumber(values.global_usage_limit);
        if (globalUsageLimit !== null && (Number.isNaN(globalUsageLimit) || globalUsageLimit < 0)) {
            errors.global_usage_limit = "Global usage limit must be 0 or greater.";
        }

        const perUserUsageLimit = parseOptionalNumber(values.per_user_usage_limit);
        if (perUserUsageLimit !== null && (Number.isNaN(perUserUsageLimit) || perUserUsageLimit < 0)) {
            errors.per_user_usage_limit = "Per user usage limit must be 0 or greater.";
        }

        if (values.ends_at.trim() && values.starts_at.trim()) {
            const startDate = new Date(values.starts_at);
            const endDate = new Date(values.ends_at);
            if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
                errors.ends_at = "End date must be a valid date and time.";
            } else if (endDate <= startDate) {
                errors.ends_at = "End date must be after start date.";
            }
        }

        if (values.specific_user_only && values.assigned_user_ids.length === 0) {
            errors.assigned_user_ids = "Select at least one user when specific users only is enabled.";
        }

        const isRelativePath = values.destination_url.startsWith("/");
        const isAbsoluteUrl = /^https?:\/\//i.test(values.destination_url);
        if (values.destination_url.trim() && !isRelativePath && !isAbsoluteUrl) {
            errors.destination_url = "Destination URL must start with / or http(s)://";
        }

        return errors;
    };

    const submitWithValidation = async () => {
        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        await onSubmit();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-playfair font-bold text-gray-900">{title}</h1>
                <Link href="/admin/coupons" className="text-sm text-gray-600 hover:text-gray-900 underline">
                    Back to coupon list
                </Link>
            </div>

            {success && (
                <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
                    {success}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={values.code}
                            onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                            placeholder="WELCOME20"
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.code ? "border border-red-300" : "border border-gray-300"}`}
                            disabled={mode === "edit"}
                            required
                        />
                        {fieldErrors.code && <p className="mt-1 text-xs text-red-600">{fieldErrors.code}</p>}
                        <p className="mt-1 text-xs text-gray-500">Customers enter this code at checkout.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={values.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="Welcome Offer"
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.name ? "border border-red-300" : "border border-gray-300"}`}
                            required
                        />
                        {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
                        <p className="mt-1 text-xs text-gray-500">Internal/admin-friendly name for this coupon.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                        <select
                            value={values.discount_type}
                            onChange={(e) => updateField("discount_type", e.target.value as DiscountType)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            min="1"
                            value={values.discount_value}
                            onChange={(e) => updateField("discount_value", e.target.value)}
                            placeholder={values.discount_type === "percentage" ? "10" : "200"}
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.discount_value ? "border border-red-300" : "border border-gray-300"}`}
                            required
                        />
                        {fieldErrors.discount_value && <p className="mt-1 text-xs text-red-600">{fieldErrors.discount_value}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Cap (Optional)</label>
                        <input
                            type="number"
                            min="0"
                            value={values.max_discount_cap}
                            onChange={(e) => updateField("max_discount_cap", e.target.value)}
                            placeholder="500"
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.max_discount_cap ? "border border-red-300" : "border border-gray-300"}`}
                        />
                        {fieldErrors.max_discount_cap && <p className="mt-1 text-xs text-red-600">{fieldErrors.max_discount_cap}</p>}
                        <p className="mt-1 text-xs text-gray-500">Useful only for percentage coupons.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Cart Subtotal (Optional)</label>
                        <input
                            type="number"
                            min="0"
                            value={values.min_cart_subtotal}
                            onChange={(e) => updateField("min_cart_subtotal", e.target.value)}
                            placeholder="999"
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.min_cart_subtotal ? "border border-red-300" : "border border-gray-300"}`}
                        />
                        {fieldErrors.min_cart_subtotal && <p className="mt-1 text-xs text-red-600">{fieldErrors.min_cart_subtotal}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Count Rule (Optional)</label>
                        <input
                            type="number"
                            min="0"
                            value={values.max_completed_orders_for_eligibility}
                            onChange={(e) => updateField("max_completed_orders_for_eligibility", e.target.value)}
                            placeholder="3"
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.max_completed_orders_for_eligibility ? "border border-red-300" : "border border-gray-300"}`}
                        />
                        {fieldErrors.max_completed_orders_for_eligibility && <p className="mt-1 text-xs text-red-600">{fieldErrors.max_completed_orders_for_eligibility}</p>}
                        <p className="mt-1 text-xs text-gray-500">User can use this coupon only if completed orders ≤ this value.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Global Usage Limit (Optional)</label>
                        <input
                            type="number"
                            min="0"
                            value={values.global_usage_limit}
                            onChange={(e) => updateField("global_usage_limit", e.target.value)}
                            placeholder="5000"
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.global_usage_limit ? "border border-red-300" : "border border-gray-300"}`}
                        />
                        {fieldErrors.global_usage_limit && <p className="mt-1 text-xs text-red-600">{fieldErrors.global_usage_limit}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per User Usage Limit (Optional)</label>
                        <input
                            type="number"
                            min="0"
                            value={values.per_user_usage_limit}
                            onChange={(e) => updateField("per_user_usage_limit", e.target.value)}
                            placeholder="1"
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.per_user_usage_limit ? "border border-red-300" : "border border-gray-300"}`}
                        />
                        {fieldErrors.per_user_usage_limit && <p className="mt-1 text-xs text-red-600">{fieldErrors.per_user_usage_limit}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Starts At <span className="text-red-500">*</span></label>
                        <input
                            type="datetime-local"
                            value={values.starts_at}
                            onChange={(e) => updateField("starts_at", e.target.value)}
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.starts_at ? "border border-red-300" : "border border-gray-300"}`}
                        />
                        {fieldErrors.starts_at && <p className="mt-1 text-xs text-red-600">{fieldErrors.starts_at}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ends At (Optional)</label>
                        <input
                            type="datetime-local"
                            value={values.ends_at}
                            onChange={(e) => updateField("ends_at", e.target.value)}
                            className={`w-full px-3 py-2 rounded-md text-sm ${fieldErrors.ends_at ? "border border-red-300" : "border border-gray-300"}`}
                        />
                        {fieldErrors.ends_at && <p className="mt-1 text-xs text-red-600">{fieldErrors.ends_at}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={values.status}
                            onChange={(e) => updateField("status", e.target.value as CouponStatus)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination URL <span className="text-red-500">*</span></label>
                        <select
                            value={selectedDestination}
                            onChange={(e) => {
                                const next = e.target.value;
                                if (next === DESTINATION_OTHER) updateField("destination_url", "");
                                else updateField("destination_url", next);
                            }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                        >
                            {DESTINATION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                            <option value={DESTINATION_OTHER}>Other (custom URL)</option>
                        </select>
                        {selectedDestination === DESTINATION_OTHER && (
                            <input
                                type="text"
                                value={values.destination_url}
                                onChange={(e) => updateField("destination_url", e.target.value)}
                                placeholder="/shop?category=silk"
                                className={`mt-2 w-full px-3 py-2 rounded-md text-sm ${fieldErrors.destination_url ? "border border-red-300" : "border border-gray-300"}`}
                            />
                        )}
                        {fieldErrors.destination_url && <p className="mt-1 text-xs text-red-600">{fieldErrors.destination_url}</p>}
                        <p className="mt-1 text-xs text-gray-500">
                            Destination URL means where user should go when they click coupon banner.
                            Example: <span className="font-medium">/shop</span> or <span className="font-medium">/shop?category=silk</span>.
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            value={values.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            rows={3}
                            placeholder="Shown as a short explanation in coupon lists/modals"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800">Visibility & Targeting</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <ToggleSwitch
                            checked={values.show_on_home_banner}
                            onChange={(next) => updateField("show_on_home_banner", next)}
                            label="Show on homepage banner"
                        />
                        <ToggleSwitch
                            checked={values.show_on_checkout_modal}
                            onChange={(next) => updateField("show_on_checkout_modal", next)}
                            label="Show in checkout modal"
                        />
                        <ToggleSwitch
                            checked={values.specific_user_only}
                            onChange={(next) => updateField("specific_user_only", next)}
                            label="Specific users only"
                        />
                    </div>

                    {values.specific_user_only && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Select Allowed Users</p>
                            <p className="text-xs text-gray-500 mb-3">
                                Only selected users will see and use this coupon.
                            </p>

                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Search by email, name, or user ID"
                                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm mb-3"
                            />

                            <div className="max-h-56 overflow-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                                {filteredUsers.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500">No users found.</div>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const checked = values.assigned_user_ids.includes(user.id);
                                        return (
                                            <label key={user.id} className="p-3 flex items-start gap-2 cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleUser(user.id)}
                                                    className="mt-0.5"
                                                />
                                                <span className="text-sm">
                                                    <span className="block text-gray-800 font-medium">{user.email || "No email"}</span>
                                                    <span className="block text-xs text-gray-500">{user.name || "No name"} · {user.id}</span>
                                                </span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>

                            <p className="mt-2 text-xs text-gray-500">Selected users: {selectedUsersCount}</p>
                            {fieldErrors.assigned_user_ids && (
                                <p className="mt-1 text-xs text-red-600">{fieldErrors.assigned_user_ids}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={submitWithValidation}
                        className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-60"
                    >
                        {loading ? "Saving..." : submitLabel}
                    </button>
                    <Link href="/admin/coupons" className="text-sm text-gray-600 hover:text-gray-900 underline">
                        Cancel
                    </Link>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                </div>
            </div>
        </div>
    );
}
