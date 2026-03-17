"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { supabase } from "@/lib/supabase";

type Address = {
    id: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
    is_default_shipping: boolean;
    is_default_billing: boolean;
};

type AddressForm = {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    is_default_shipping: boolean;
    is_default_billing: boolean;
};

const emptyForm: AddressForm = {
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
};

async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
}

export default function AccountAddressesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<AddressForm>(emptyForm);

    const loadAddresses = async () => {
        setLoading(true);
        setError("");
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch("/api/account/addresses", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load addresses");

            setAddresses((json.addresses || []) as Address[]);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    const resetForm = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    const submit = async () => {
        if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.state || !form.pincode) {
            setError("Please fill all required fields.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const endpoint = editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses";
            const method = editingId ? "PATCH" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save address");

            setSuccess(editingId ? "Address updated." : "Address added.");
            resetForm();
            await loadAddresses();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id: string) => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch(`/api/account/addresses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to delete address");

            setSuccess("Address deleted.");
            if (editingId === id) resetForm();
            await loadAddresses();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete address");
        } finally {
            setSaving(false);
        }
    };

    const edit = (address: Address) => {
        setEditingId(address.id);
        setForm({
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

    const setDefault = async (id: string, type: "shipping" | "billing") => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch(`/api/account/addresses/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(type === "shipping" ? { is_default_shipping: true } : { is_default_billing: true }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to set default address");

            setSuccess(`Default ${type} address updated.`);
            await loadAddresses();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to set default address");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-12 lg:pt-24 pb-20 min-h-screen">
                <Container>
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                            <Link href="/account" className="text-sm text-text-secondary hover:text-foreground">Back to Account</Link>
                            <h1 className="font-serif text-3xl text-foreground mt-2">Saved Addresses</h1>
                        </div>

                        {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}
                        {success && <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm px-4 py-3">{success}</div>}

                        <div className="bg-white rounded-xl border border-border p-6 space-y-3">
                            <p className="text-xs uppercase tracking-wide text-text-secondary">{editingId ? "Edit Address" : "Add New Address"}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} placeholder="Full name *" className="px-3 py-2 rounded-md border border-border text-sm" />
                                <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone *" className="px-3 py-2 rounded-md border border-border text-sm" />
                            </div>
                            <input value={form.address_line1} onChange={(e) => setForm((prev) => ({ ...prev, address_line1: e.target.value }))} placeholder="Address line 1 *" className="w-full px-3 py-2 rounded-md border border-border text-sm" />
                            <input value={form.address_line2} onChange={(e) => setForm((prev) => ({ ...prev, address_line2: e.target.value }))} placeholder="Address line 2" className="w-full px-3 py-2 rounded-md border border-border text-sm" />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="City *" className="px-3 py-2 rounded-md border border-border text-sm" />
                                <input value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} placeholder="State *" className="px-3 py-2 rounded-md border border-border text-sm" />
                                <input value={form.pincode} onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))} placeholder="Pincode *" className="px-3 py-2 rounded-md border border-border text-sm" />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-foreground">
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={form.is_default_shipping} onChange={(e) => setForm((prev) => ({ ...prev, is_default_shipping: e.target.checked }))} />
                                    Default shipping
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={form.is_default_billing} onChange={(e) => setForm((prev) => ({ ...prev, is_default_billing: e.target.checked }))} />
                                    Default billing
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium disabled:opacity-60">
                                    {saving ? "Saving..." : editingId ? "Update Address" : "Add Address"}
                                </button>
                                {editingId && (
                                    <button onClick={resetForm} className="px-4 py-2 rounded-md border border-border text-sm text-foreground">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-sm text-text-secondary">Loading addresses...</p>
                            ) : addresses.length === 0 ? (
                                <div className="bg-white rounded-xl border border-border p-6 text-sm text-text-secondary">No saved addresses yet.</div>
                            ) : (
                                addresses.map((address) => (
                                    <div key={address.id} className="bg-white rounded-xl border border-border p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{address.full_name}</p>
                                                <p className="text-xs text-text-secondary">{address.phone}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => edit(address)} className="px-2 py-1 text-xs rounded border border-border text-foreground">Edit</button>
                                                <button onClick={() => remove(address.id)} disabled={saving} className="px-2 py-1 text-xs rounded border border-red-200 text-red-700 disabled:opacity-60">Delete</button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground mt-2">{address.address_line1}</p>
                                        {address.address_line2 && <p className="text-sm text-foreground">{address.address_line2}</p>}
                                        <p className="text-sm text-foreground">{address.city}, {address.state} - {address.pincode}</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <button onClick={() => setDefault(address.id, "shipping")} disabled={saving || address.is_default_shipping} className="px-2 py-1 text-xs rounded border border-border text-foreground disabled:opacity-50">
                                                {address.is_default_shipping ? "Default Shipping" : "Set Shipping Default"}
                                            </button>
                                            <button onClick={() => setDefault(address.id, "billing")} disabled={saving || address.is_default_billing} className="px-2 py-1 text-xs rounded border border-border text-foreground disabled:opacity-50">
                                                {address.is_default_billing ? "Default Billing" : "Set Billing Default"}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
