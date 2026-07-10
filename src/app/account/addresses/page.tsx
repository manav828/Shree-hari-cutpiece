"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { supabase } from "@/lib/supabase";
import { getThemeSync } from "@/lib/themeSync";
import { 
    validateName, 
    validatePhone, 
    validatePincode, 
    validateAddressLine, 
    validateCity, 
    validateState 
} from "@/lib/validation";

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

const themeStyles = {
  bohemian: {
    cardBg: "bg-[#FDFBF7]",
    accentText: "text-[#9f3f29]",
    buttonClass: "bg-[#9f3f29] hover:bg-[#8c3522] text-white",
    secondaryButtonClass: "border-[#e3d2c5] hover:bg-[#f3e7db] text-[#7f3321] bg-white",
    fontFamily: "font-serif",
    accentBorder: "border-[#e8ddd3]",
    mainClass: "pt-6 lg:pt-10 pb-20 min-h-screen bg-[#fcf9f4]/30",
  },
  classic: {
    cardBg: "bg-white",
    accentText: "text-accent",
    buttonClass: "bg-accent hover:bg-[#721833] text-white",
    secondaryButtonClass: "border-border hover:bg-background-secondary text-foreground bg-white",
    fontFamily: "font-sans",
    accentBorder: "border-border",
    mainClass: "pt-6 lg:pt-10 pb-20 min-h-screen bg-white",
  },
  luxury: {
    cardBg: "bg-[#121212]",
    accentText: "text-[#d4af37]",
    buttonClass: "bg-[#d4af37] hover:bg-[#c29d2c] text-black font-semibold",
    secondaryButtonClass: "border-[#d4af37]/30 hover:bg-[#d4af37]/10 text-[#d4af37] bg-transparent",
    fontFamily: "font-sans",
    accentBorder: "border-[#d4af37]/20",
    mainClass: "pt-6 lg:pt-10 pb-20 min-h-screen bg-[#0a0a0a] text-white",
  }
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

    const theme = getThemeSync();
    const styles = themeStyles[theme] || themeStyles.classic;

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

        const nameErr = validateName(form.full_name);
        if (nameErr) { setError(nameErr); return; }

        const phoneErr = validatePhone(form.phone);
        if (phoneErr) { setError(phoneErr); return; }

        const addr1Err = validateAddressLine(form.address_line1, "Address line 1");
        if (addr1Err) { setError(addr1Err); return; }

        if (form.address_line2) {
            const addr2Err = validateAddressLine(form.address_line2, "Address line 2", false);
            if (addr2Err) { setError(addr2Err); return; }
        }

        const cityErr = validateCity(form.city);
        if (cityErr) { setError(cityErr); return; }

        const stateErr = validateState(form.state);
        if (stateErr) { setError(stateErr); return; }

        const pinErr = validatePincode(form.pincode);
        if (pinErr) { setError(pinErr); return; }

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

    const inputClass = `px-3 py-2 rounded-md border text-sm focus:outline-none focus:border-accent ${theme === "luxury" ? "bg-[#181818] text-white" : "bg-white text-foreground"} ${styles.accentBorder}`;

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className={`${styles.mainClass} ${styles.fontFamily}`}>
                <Container>
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                            <Link href="/account" className="text-sm text-text-secondary hover:text-foreground">Back to Account</Link>
                            <h1 className={`text-3xl mt-2 font-semibold ${theme === "bohemian" ? "font-serif text-[#9f3f29]" : "font-sans"}`}>Saved Addresses</h1>
                        </div>

                        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-sm px-4 py-3">{error}</div>}
                        {success && <div className="rounded-lg border border-green-500/20 bg-green-500/10 text-green-500 text-sm px-4 py-3">{success}</div>}

                        <div className={`rounded-xl border p-6 space-y-3 ${styles.cardBg} ${styles.accentBorder}`}>
                            <p className="text-xs uppercase tracking-wide text-text-secondary">{editingId ? "Edit Address" : "Add New Address"}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} maxLength={100} placeholder="Full name *" className={inputClass} />
                                <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} maxLength={10} placeholder="Phone *" className={inputClass} />
                            </div>
                            <input value={form.address_line1} onChange={(e) => setForm((prev) => ({ ...prev, address_line1: e.target.value }))} maxLength={100} placeholder="Address line 1 *" className={`w-full ${inputClass}`} />
                            <input value={form.address_line2} onChange={(e) => setForm((prev) => ({ ...prev, address_line2: e.target.value }))} maxLength={100} placeholder="Address line 2" className={`w-full ${inputClass}`} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} maxLength={50} placeholder="City *" className={inputClass} />
                                <input value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} maxLength={50} placeholder="State *" className={inputClass} />
                                <input value={form.pincode} onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))} maxLength={6} placeholder="Pincode *" className={inputClass} />
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={form.is_default_shipping} onChange={(e) => setForm((prev) => ({ ...prev, is_default_shipping: e.target.checked }))} className={`${theme === "luxury" ? "accent-[#d4af37]" : "accent-accent"}`} />
                                    Default shipping
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={form.is_default_billing} onChange={(e) => setForm((prev) => ({ ...prev, is_default_billing: e.target.checked }))} className={`${theme === "luxury" ? "accent-[#d4af37]" : "accent-accent"}`} />
                                    Default billing
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={submit} disabled={saving} className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-60 ${styles.buttonClass}`}>
                                    {saving ? "Saving..." : editingId ? "Update Address" : "Add Address"}
                                </button>
                                {editingId && (
                                    <button onClick={resetForm} className={`px-4 py-2 rounded-md text-sm font-medium ${styles.secondaryButtonClass}`}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className={`rounded-xl border p-4 space-y-3 ${styles.cardBg} ${styles.accentBorder}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-2 flex-1">
                                                    <div className="w-1/3 h-4 rounded shimmer-bg" />
                                                    <div className="w-1/4 h-3 rounded shimmer-bg" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-12 h-6 rounded border border-border shimmer-bg" />
                                                    <div className="w-14 h-6 rounded border border-border shimmer-bg" />
                                                </div>
                                            </div>
                                            <div className="w-2/3 h-4 rounded shimmer-bg" />
                                            <div className="w-1/2 h-4 rounded shimmer-bg" />
                                            <div className="flex gap-2 pt-2">
                                                <div className="w-28 h-6 rounded border border-border shimmer-bg" />
                                                <div className="w-28 h-6 rounded border border-border shimmer-bg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className={`rounded-xl border p-6 text-sm text-text-secondary ${styles.cardBg} ${styles.accentBorder}`}>No saved addresses yet.</div>
                            ) : (
                                addresses.map((address) => (
                                    <div key={address.id} className={`rounded-xl border p-4 ${styles.cardBg} ${styles.accentBorder}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium">{address.full_name}</p>
                                                <p className="text-xs text-text-secondary">{address.phone}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => edit(address)} className={`px-2 py-1 text-xs rounded border ${styles.secondaryButtonClass}`}>Edit</button>
                                                <button onClick={() => remove(address.id)} disabled={saving} className="px-2 py-1 text-xs rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-60 bg-transparent">Delete</button>
                                            </div>
                                        </div>
                                        <p className="text-sm mt-2">{address.address_line1}</p>
                                        {address.address_line2 && <p className="text-sm">{address.address_line2}</p>}
                                        <p className="text-sm">{address.city}, {address.state} - {address.pincode}</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <button onClick={() => setDefault(address.id, "shipping")} disabled={saving || address.is_default_shipping} className={`px-2 py-1 text-xs rounded border disabled:opacity-50 ${styles.secondaryButtonClass}`}>
                                                {address.is_default_shipping ? "Default Shipping" : "Set Shipping Default"}
                                            </button>
                                            <button onClick={() => setDefault(address.id, "billing")} disabled={saving || address.is_default_billing} className={`px-2 py-1 text-xs rounded border disabled:opacity-50 ${styles.secondaryButtonClass}`}>
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
