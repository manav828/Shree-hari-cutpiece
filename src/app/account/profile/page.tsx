"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { supabase } from "@/lib/supabase";
import { getThemeSync } from "@/lib/themeSync";

type Profile = {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    account_status: string;
    created_at: string | null;
};

const themeStyles = {
  bohemian: {
    cardBg: "bg-[#FDFBF7]",
    accentText: "text-[#9f3f29]",
    buttonClass: "bg-[#9f3f29] hover:bg-[#8c3522] text-white",
    fontFamily: "font-serif",
    accentBorder: "border-[#e8ddd3]",
    mainClass: "pt-6 lg:pt-10 pb-20 min-h-screen bg-[#fcf9f4]/30",
  },
  classic: {
    cardBg: "bg-white",
    accentText: "text-accent",
    buttonClass: "bg-accent hover:bg-[#721833] text-white",
    fontFamily: "font-sans",
    accentBorder: "border-border",
    mainClass: "pt-6 lg:pt-10 pb-20 min-h-screen bg-white",
  },
  luxury: {
    cardBg: "bg-[#121212]",
    accentText: "text-[#d4af37]",
    buttonClass: "bg-[#d4af37] hover:bg-[#c29d2c] text-black font-semibold",
    fontFamily: "font-sans",
    accentBorder: "border-[#d4af37]/20",
    mainClass: "pt-6 lg:pt-10 pb-20 min-h-screen bg-[#0a0a0a] text-white",
  }
};

function formatDate(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
}

export default function AccountProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [actionLoading, setActionLoading] = useState<"password" | "export" | "delete" | "">("");
    const [deleteReason, setDeleteReason] = useState("");

    const theme = getThemeSync();
    const styles = themeStyles[theme] || themeStyles.classic;

    const loadProfile = async () => {
        setLoading(true);
        setError("");
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch("/api/account/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load profile");

            const nextProfile = json.profile as Profile;
            setProfile(nextProfile);
            setFullName(nextProfile.full_name || "");
            setPhone(nextProfile.phone || "");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const save = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch("/api/account/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    full_name: fullName,
                    phone,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save profile");

            setSuccess("Profile updated successfully.");
            await loadProfile();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const sendPasswordReset = async () => {
        setActionLoading("password");
        setError("");
        setSuccess("");
        try {
            if (!profile?.email) throw new Error("Email not found for this account.");
            const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(profile.email, {
                redirectTo,
            });
            if (resetError) throw resetError;
            setSuccess("Password reset email sent. Please check your inbox.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to send reset email");
        } finally {
            setActionLoading("");
        }
    };

    const downloadAccountData = async () => {
        setActionLoading("export");
        setError("");
        setSuccess("");
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch("/api/account/export", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to export account data");

            const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `account-data-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);

            setSuccess("Your account data download has started.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to export account data");
        } finally {
            setActionLoading("");
        }
    };

    const requestDeleteAccount = async () => {
        if (!window.confirm("Are you absolutely sure you want to permanently delete your account? This action cannot be undone.")) {
            return;
        }
        setActionLoading("delete");
        setError("");
        setSuccess("");
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch("/api/account/delete-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: deleteReason }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to delete account");

            setDeleteReason("");
            setSuccess("Your account has been successfully deleted. Signing you out...");
            
            await supabase.auth.signOut();
            localStorage.clear();
            
            setTimeout(() => {
                window.location.href = "/?deleted=true";
            }, 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete account");
        } finally {
            setActionLoading("");
        }
    };

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className={`${styles.mainClass} ${styles.fontFamily}`}>
                <Container>
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div>
                            <Link href="/account" className="text-sm text-text-secondary hover:text-foreground">Back to Account</Link>
                            <h1 className={`text-3xl mt-2 font-semibold ${theme === "bohemian" ? "font-serif text-[#9f3f29]" : "font-sans"}`}>Profile Details</h1>
                        </div>

                        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-sm px-4 py-3">{error}</div>}
                        {success && <div className="rounded-lg border border-green-500/20 bg-green-500/10 text-green-500 text-sm px-4 py-3">{success}</div>}

                        <div className={`rounded-xl border p-6 space-y-4 ${styles.cardBg} ${styles.accentBorder}`}>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="w-20 h-3 rounded shimmer-bg" />
                                            <div className="w-full h-10 rounded-md shimmer-bg" />
                                        </div>
                                    ))}
                                    <div className="w-24 h-6 rounded shimmer-bg pt-2" />
                                    <div className="w-32 h-6 rounded shimmer-bg" />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">Full Name</label>
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:border-accent ${theme === "luxury" ? "bg-[#181818] text-white" : "bg-white text-foreground"} ${styles.accentBorder}`}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">Email</label>
                                        <input
                                            value={profile?.email || ""}
                                            readOnly
                                            className={`w-full px-3 py-2 rounded-md border text-sm text-text-secondary cursor-not-allowed ${theme === "luxury" ? "bg-[#101010]/50" : "bg-background-secondary/50"} ${styles.accentBorder}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">Phone</label>
                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:border-accent ${theme === "luxury" ? "bg-[#181818] text-white" : "bg-white text-foreground"} ${styles.accentBorder}`}
                                            placeholder="Phone number"
                                        />
                                    </div>
                                    <div className="text-xs text-text-secondary space-y-1">
                                        <p>Status: {profile?.account_status || "active"}</p>
                                        <p>Member since: {formatDate(profile?.created_at || null)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={save}
                                        disabled={saving}
                                        className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-60 ${styles.buttonClass}`}
                                    >
                                        {saving ? "Saving..." : "Save Profile"}
                                    </button>

                                    <div className={`mt-4 border-t pt-4 space-y-3 ${styles.accentBorder}`}>
                                        <p className="text-xs font-semibold uppercase tracking-wide">Security & Data</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={sendPasswordReset}
                                                disabled={actionLoading === "password"}
                                                className={`px-3 py-2 rounded-md border text-sm font-medium disabled:opacity-60 ${styles.secondaryButtonClass}`}
                                            >
                                                {actionLoading === "password" ? "Sending..." : "Change Password"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={downloadAccountData}
                                                disabled={actionLoading === "export"}
                                                className={`px-3 py-2 rounded-md border text-sm font-medium disabled:opacity-60 ${styles.secondaryButtonClass}`}
                                            >
                                                {actionLoading === "export" ? "Preparing..." : "Download Account Data"}
                                            </button>
                                        </div>

                                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
                                            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Permanently Delete Account</p>
                                            <p className="text-xs text-red-500/80">This will anonymize your profile info and delete all addresses. Your order history will remain anonymously for accounting purposes.</p>
                                            <textarea
                                                value={deleteReason}
                                                onChange={(e) => setDeleteReason(e.target.value)}
                                                placeholder="Optional reason for deletion"
                                                className={`w-full min-h-[72px] px-3 py-2 rounded-md border text-sm focus:outline-none focus:border-red-500 ${theme === "luxury" ? "bg-[#181818] text-white" : "bg-white text-foreground"} border-red-500/20`}
                                            />
                                            <button
                                                type="button"
                                                onClick={requestDeleteAccount}
                                                disabled={actionLoading === "delete"}
                                                className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-60"
                                            >
                                                {actionLoading === "delete" ? "Deleting..." : "Permanently Delete My Account"}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
