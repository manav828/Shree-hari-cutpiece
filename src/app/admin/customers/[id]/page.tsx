"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Package, User, StickyNote, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { AdminCustomerDetails, CustomerAccountStatus, CustomerInteraction } from "@/types/customers";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";
import { Input } from "@/components/admin/ui/Input";
import { Select } from "@/components/admin/ui/Select";
import { Textarea } from "@/components/admin/ui/Textarea";
import { 
    validateName, 
    validatePhone, 
    validatePincode, 
    validateAddressLine, 
    validateCity, 
    validateState 
} from "@/lib/validation";

function formatDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    return `${formatDate(value)} · ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatInr(value: number) {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function Card({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

export default function AdminCustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [details, setDetails] = useState<AdminCustomerDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [addingNote, setAddingNote] = useState(false);
    const [statusInput, setStatusInput] = useState<CustomerAccountStatus>("active");
    const [notesInput, setNotesInput] = useState("");
    const [noteInput, setNoteInput] = useState("");
    const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
    const [success, setSuccess] = useState("");
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [savingAddress, setSavingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState({
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        is_default_shipping: false,
        is_default_billing: false,
    });

    const resetAddressForm = () => {
        setEditingAddressId(null);
        setAddressForm({
            full_name: "",
            phone: "",
            address_line1: "",
            address_line2: "",
            city: "",
            state: "",
            pincode: "",
            country: "India",
            is_default_shipping: false,
            is_default_billing: false,
        });
    };

    const loadDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/customers/${id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to fetch customer details");

            const payload = json as AdminCustomerDetails;
            setDetails(payload);
            setStatusInput((payload.customer.account_status || "active") as CustomerAccountStatus);
            setNotesInput(payload.internal_notes || "");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to fetch customer details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadInteractions = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/admin/customers/${id}/interactions?limit=20&offset=0`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to fetch interactions");
            setInteractions((json.data || []) as CustomerInteraction[]);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to fetch interactions");
        }
    }, [id]);

    useEffect(() => {
        loadDetails();
        loadInteractions();
    }, [loadDetails, loadInteractions]);

    const displayName = useMemo(() => {
        if (!details) return "Customer";
        return details.customer.full_name || details.customer.email || "Customer";
    }, [details]);

    const saveProfile = async () => {
        if (!id) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/admin/customers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_status: statusInput,
                    internal_notes: notesInput,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update customer");

            setSuccess("Customer profile updated.");
            await loadDetails();
            await loadInteractions();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update customer");
        } finally {
            setSaving(false);
        }
    };

    const quickUpdateStatus = async (nextStatus: CustomerAccountStatus) => {
        if (!id || statusInput === nextStatus) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/admin/customers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_status: nextStatus,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update status");

            setStatusInput(nextStatus);
            setSuccess(`Account status updated to ${nextStatus}.`);
            await loadDetails();
            await loadInteractions();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update status");
        } finally {
            setSaving(false);
        }
    };

    const addNote = async () => {
        if (!id) return;
        const note = noteInput.trim();
        if (!note) {
            setError("Please enter a note before submitting.");
            return;
        }

        setAddingNote(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/admin/customers/${id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    note,
                    event_type: "note_added",
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to add note");

            setNoteInput("");
            setSuccess("Note added successfully.");
            await loadInteractions();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to add note");
        } finally {
            setAddingNote(false);
        }
    };

    const saveAddress = async () => {
        if (!id) return;
        if (!addressForm.full_name || !addressForm.phone || !addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
            setError("Please fill all required address fields.");
            return;
        }

        const nameErr = validateName(addressForm.full_name);
        if (nameErr) { setError(nameErr); return; }

        const phoneErr = validatePhone(addressForm.phone);
        if (phoneErr) { setError(phoneErr); return; }

        const addr1Err = validateAddressLine(addressForm.address_line1, "Address line 1");
        if (addr1Err) { setError(addr1Err); return; }

        if (addressForm.address_line2) {
            const addr2Err = validateAddressLine(addressForm.address_line2, "Address line 2", false);
            if (addr2Err) { setError(addr2Err); return; }
        }

        const cityErr = validateCity(addressForm.city);
        if (cityErr) { setError(cityErr); return; }

        const stateErr = validateState(addressForm.state);
        if (stateErr) { setError(stateErr); return; }

        const pinErr = validatePincode(addressForm.pincode);
        if (pinErr) { setError(pinErr); return; }

        setSavingAddress(true);
        setError("");
        setSuccess("");

        try {
            const method = editingAddressId ? "PATCH" : "POST";
            const res = await fetch(`/api/admin/customers/${id}/addresses`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...(editingAddressId ? { address_id: editingAddressId } : {}),
                    ...addressForm,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save address");

            setSuccess(editingAddressId ? "Address updated." : "Address added.");
            resetAddressForm();
            await loadDetails();
            await loadInteractions();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save address");
        } finally {
            setSavingAddress(false);
        }
    };

    const removeAddress = async (addressId: string) => {
        if (!id) return;
        setError("");
        setSuccess("");
        setSavingAddress(true);
        try {
            const res = await fetch(`/api/admin/customers/${id}/addresses`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address_id: addressId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to delete address");

            setSuccess("Address deleted.");
            if (editingAddressId === addressId) resetAddressForm();
            await loadDetails();
            await loadInteractions();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete address");
        } finally {
            setSavingAddress(false);
        }
    };

    const editAddress = (addressId: string) => {
        const address = details?.addresses.find((item) => item.id === addressId);
        if (!address) return;
        setEditingAddressId(address.id);
        setAddressForm({
            full_name: address.full_name,
            phone: address.phone,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || "",
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
            is_default_shipping: address.is_default_shipping,
            is_default_billing: address.is_default_billing,
        });
    };

    const setAddressDefault = async (addressId: string, type: "shipping" | "billing") => {
        if (!id) return;
        setSavingAddress(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/admin/customers/${id}/addresses`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    address_id: addressId,
                    ...(type === "shipping" ? { is_default_shipping: true } : { is_default_billing: true }),
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to set default address");

            setSuccess(`Default ${type} address updated.`);
            await loadDetails();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to set default address");
        } finally {
            setSavingAddress(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-gray-500">Loading customer details...</p>
            </div>
        );
    }

    if (error && !details) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 text-sm">{error}</div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <p className="text-sm text-gray-500">Customer not found.</p>
            </div>
        );
    }

    const customer = details.customer;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Customers
                </button>

                <div>
                    <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                    <p className="text-[12px] text-gray-500 mt-0.5">Customer ID: {customer.id}</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 p-3 text-sm">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <Card title="Profile Summary" icon={User}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-2">
                                <Mail className="w-4 h-4 mt-0.5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Email</p>
                                    <p className="text-gray-800">{customer.email || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 mt-0.5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Phone</p>
                                    <p className="text-gray-800">{customer.phone || "—"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Joined</p>
                                <p className="text-gray-800">{formatDate(customer.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Last Login</p>
                                <p className="text-gray-800">{formatDateTime(customer.last_sign_in_at)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Order History" icon={Package}>
                        {details.orders.length === 0 ? (
                            <p className="text-sm text-gray-500">No orders found for this customer.</p>
                        ) : (
                            <Table wrapperClassName="border-0 rounded-none shadow-none">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10 pr-0"></TableHead>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Coupon</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {details.orders.map((order) => (
                                        <Fragment key={order.id}>
                                            <TableRow>
                                                <TableCell className="pr-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                                                        title={expandedOrderId === order.id ? "Collapse order details" : "Expand order details"}
                                                    >
                                                        {expandedOrderId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900">
                                                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                                                        {order.order_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{formatDate(order.created_at)}</TableCell>
                                                <TableCell className="capitalize">{order.status}</TableCell>
                                                <TableCell className="capitalize">{order.payment_status}</TableCell>
                                                <TableCell>
                                                    {order.item_lines} lines · {order.units_count} units
                                                </TableCell>
                                                <TableCell>{order.coupon_code || "—"}</TableCell>
                                                <TableCell>
                                                    {order.discount_amount > 0 ? formatInr(order.discount_amount) : "—"}
                                                </TableCell>
                                                <TableCell className="font-medium">{formatInr(order.total_amount)}</TableCell>
                                            </TableRow>

                                            {expandedOrderId === order.id && (
                                                <TableRow className="bg-gray-50/50">
                                                    <TableCell colSpan={9} className="py-3 pl-12 pr-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-700">
                                                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                                <p className="text-[11px] uppercase text-gray-500 mb-1">Amount Breakdown</p>
                                                                <p>Subtotal: {formatInr(order.subtotal)}</p>
                                                                <p>Shipping: {formatInr(order.shipping_amount)}</p>
                                                                <p>Discount: {formatInr(order.discount_amount)}</p>
                                                                <p className="font-semibold text-gray-900 mt-1">Total: {formatInr(order.total_amount)}</p>
                                                            </div>
                                                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                                <p className="text-[11px] uppercase text-gray-500 mb-1">Delivery Snapshot</p>
                                                                <p>
                                                                    {order.shipping_city || "—"}
                                                                    {order.shipping_state ? `, ${order.shipping_state}` : ""}
                                                                </p>
                                                                <p>{order.shipping_pincode || "—"}</p>
                                                                <p className="mt-1">Placed: {formatDateTime(order.created_at)}</p>
                                                            </div>
                                                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                                <p className="text-[11px] uppercase text-gray-500 mb-2">Quick Actions</p>
                                                                <div className="flex items-center gap-2">
                                                                    <Link
                                                                        href={`/admin/orders/${order.id}`}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                        Open Order
                                                                    </Link>
                                                                    <Link
                                                                        href={`/admin/orders/${order.id}/print`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                        Invoice / Print
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                </div>

                <div className="space-y-5">
                    <Card title="Customer Metrics" icon={Package}>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Total Orders</span>
                                <span className="font-medium text-gray-900">{customer.total_orders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Total Spent</span>
                                <span className="font-medium text-gray-900">{formatInr(details.total_spent)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Avg Order Value</span>
                                <span className="font-medium text-gray-900">{formatInr(details.avg_order_value)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Last Order</span>
                                <span className="font-medium text-gray-900">{formatDate(customer.last_order_date)}</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Addresses" icon={MapPin}>
                        <div className="mb-4 rounded-lg border border-gray-200 p-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                {editingAddressId ? "Edit Address" : "Add Address"}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Input
                                    value={addressForm.full_name}
                                    onChange={(e) => setAddressForm((prev) => ({ ...prev, full_name: e.target.value }))}
                                    maxLength={100}
                                    placeholder="Full name *"
                                    className="bg-white"
                                  />
                                <Input
                                    value={addressForm.phone}
                                    onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                                    maxLength={10}
                                    placeholder="Phone *"
                                    className="bg-white"
                                  />
                            </div>
                            <Input
                                value={addressForm.address_line1}
                                onChange={(e) => setAddressForm((prev) => ({ ...prev, address_line1: e.target.value }))}
                                maxLength={100}
                                placeholder="Address line 1 *"
                                className="bg-white"
                            />
                            <Input
                                value={addressForm.address_line2}
                                onChange={(e) => setAddressForm((prev) => ({ ...prev, address_line2: e.target.value }))}
                                maxLength={100}
                                placeholder="Address line 2"
                                className="bg-white"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Input
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                                    maxLength={50}
                                    placeholder="City *"
                                    className="bg-white"
                                />
                                <Input
                                    value={addressForm.state}
                                    onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                                    maxLength={50}
                                    placeholder="State *"
                                    className="bg-white"
                                />
                                <Input
                                    value={addressForm.pincode}
                                    onChange={(e) => setAddressForm((prev) => ({ ...prev, pincode: e.target.value }))}
                                    maxLength={6}
                                    placeholder="Pincode *"
                                    className="bg-white"
                                />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-700">
                                <label className="inline-flex items-center gap-1.5">
                                    <input
                                        type="checkbox"
                                        checked={addressForm.is_default_shipping}
                                        onChange={(e) => setAddressForm((prev) => ({ ...prev, is_default_shipping: e.target.checked }))}
                                    />
                                    Default shipping
                                </label>
                                <label className="inline-flex items-center gap-1.5">
                                    <input
                                        type="checkbox"
                                        checked={addressForm.is_default_billing}
                                        onChange={(e) => setAddressForm((prev) => ({ ...prev, is_default_billing: e.target.checked }))}
                                    />
                                    Default billing
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={saveAddress}
                                    disabled={savingAddress}
                                    className="px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-medium disabled:opacity-60"
                                >
                                    {savingAddress ? "Saving..." : editingAddressId ? "Update Address" : "Add Address"}
                                </button>
                                {editingAddressId && (
                                    <button
                                        type="button"
                                        onClick={resetAddressForm}
                                        className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        {details.addresses.length === 0 ? (
                            <p className="text-sm text-gray-500">No saved addresses.</p>
                        ) : (
                            <div className="space-y-3">
                                {details.addresses.map((address) => (
                                    <div key={address.id} className="rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-sm font-medium text-gray-900">{address.full_name}</p>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => editAddress(address.id)}
                                                    className="px-2 py-1 rounded border border-gray-300 text-[11px] text-gray-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAddress(address.id)}
                                                    disabled={savingAddress}
                                                    className="px-2 py-1 rounded border border-red-300 text-[11px] text-red-700 disabled:opacity-60"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600">{address.address_line1}</p>
                                        {address.address_line2 && <p className="text-xs text-gray-600">{address.address_line2}</p>}
                                        <p className="text-xs text-gray-600">
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                        <p className="text-xs text-gray-600">{address.phone}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAddressDefault(address.id, "shipping")}
                                                disabled={savingAddress || address.is_default_shipping}
                                                className="px-2 py-1 rounded border border-gray-300 text-[11px] text-gray-700 disabled:opacity-50"
                                            >
                                                {address.is_default_shipping ? "Default Shipping" : "Set Shipping Default"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAddressDefault(address.id, "billing")}
                                                disabled={savingAddress || address.is_default_billing}
                                                className="px-2 py-1 rounded border border-gray-300 text-[11px] text-gray-700 disabled:opacity-50"
                                            >
                                                {address.is_default_billing ? "Default Billing" : "Set Billing Default"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card title="Notes & Account" icon={StickyNote}>
                        <div className="space-y-3">
                            <Select
                                label="Account Status"
                                value={statusInput}
                                onChange={(e) => setStatusInput(e.target.value as CustomerAccountStatus)}
                                className="bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="blocked">Blocked</option>
                            </Select>

                            <Textarea
                                label="Internal Notes"
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                className="bg-white min-h-[100px]"
                                placeholder="Add internal notes for support/admin team"
                            />

                            <button
                                onClick={saveProfile}
                                disabled={saving}
                                className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save Profile"}
                            </button>

                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">Admin Quick Actions</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => quickUpdateStatus("active")}
                                        disabled={saving || statusInput === "active"}
                                        className="px-2.5 py-2 rounded-md border border-gray-300 text-xs font-medium text-gray-700 disabled:opacity-50"
                                    >
                                        Mark Active
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => quickUpdateStatus("suspended")}
                                        disabled={saving || statusInput === "suspended"}
                                        className="px-2.5 py-2 rounded-md border border-amber-300 text-xs font-medium text-amber-700 disabled:opacity-50"
                                    >
                                        Suspend
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => quickUpdateStatus("blocked")}
                                        disabled={saving || statusInput === "blocked"}
                                        className="px-2.5 py-2 rounded-md border border-red-300 text-xs font-medium text-red-700 disabled:opacity-50"
                                    >
                                        Block
                                    </button>
                                    <a
                                        href={`mailto:${customer.email || ""}`}
                                        className={`px-2.5 py-2 rounded-md border text-xs font-medium text-center ${customer.email ? "border-gray-300 text-gray-700 hover:bg-gray-50" : "border-gray-200 text-gray-400 pointer-events-none"}`}
                                    >
                                        Send Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Recent Interactions" icon={StickyNote}>
                        <div className="space-y-3 mb-4">
                            <Textarea
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                className="bg-white min-h-[80px]"
                                placeholder="Add a new interaction note"
                            />
                            <button
                                onClick={addNote}
                                disabled={addingNote}
                                className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-60"
                            >
                                {addingNote ? "Adding Note..." : "Add Note"}
                            </button>
                        </div>

                        {interactions.length === 0 ? (
                            <p className="text-sm text-gray-500">No interactions yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {interactions.map((entry) => (
                                    <div key={entry.id} className="border-b border-gray-100 pb-2 last:border-none last:pb-0">
                                        <p className="text-xs uppercase tracking-wide text-gray-400">{entry.event_type}</p>
                                        <p className="text-sm text-gray-700">{entry.note || "—"}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(entry.created_at)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
