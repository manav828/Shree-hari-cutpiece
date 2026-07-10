"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { supabase } from "@/lib/supabase";
import { getThemeSync } from "@/lib/themeSync";

type Preferences = {
    newsletter_opt_in: boolean;
    marketing_opt_in: boolean;
    sms_opt_in: boolean;
    preferred_language: string;
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

async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
}

export default function AccountPreferencesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [preferences, setPreferences] = useState<Preferences>({
        newsletter_opt_in: true,
        marketing_opt_in: true,
        sms_opt_in: false,
        preferred_language: "en",
    });

    const theme = getThemeSync();
    const styles = themeStyles[theme] || themeStyles.classic;

    const loadPreferences = async () => {
        setLoading(true);
        setError("");
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch("/api/account/preferences", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load preferences");

            setPreferences(json.preferences as Preferences);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load preferences");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPreferences();
    }, []);

    const save = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("Please login again to continue.");

            const res = await fetch("/api/account/preferences", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(preferences),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save preferences");

            setSuccess("Preferences updated successfully.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save preferences");
        } finally {
            setSaving(false);
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
                            <h1 className={`text-3xl mt-2 font-semibold ${theme === "bohemian" ? "font-serif text-[#9f3f29]" : "font-sans"}`}>Communication Preferences</h1>
                        </div>

                        {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}
                        {success && <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm px-4 py-3">{success}</div>}

                        <div className={`rounded-xl border p-6 space-y-4 ${styles.cardBg} ${styles.accentBorder}`}>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="w-32 h-4 rounded shimmer-bg" />
                                            <div className="w-5 h-5 rounded shimmer-bg" />
                                        </div>
                                    ))}
                                    <div className="space-y-2">
                                        <div className="w-28 h-3 rounded shimmer-bg" />
                                        <div className="w-full h-10 rounded-md shimmer-bg" />
                                    </div>
                                    <div className="w-36 h-10 rounded shimmer-bg" />
                                </div>
                            ) : (
                                <>
                                    <label className="flex items-center justify-between text-sm">
                                        <span>Newsletter emails</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.newsletter_opt_in}
                                            onChange={(e) => setPreferences((prev) => ({ ...prev, newsletter_opt_in: e.target.checked }))}
                                            className={`${theme === "luxury" ? "accent-[#d4af37]" : "accent-accent"}`}
                                        />
                                    </label>
                                    <label className="flex items-center justify-between text-sm">
                                        <span>Marketing updates</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.marketing_opt_in}
                                            onChange={(e) => setPreferences((prev) => ({ ...prev, marketing_opt_in: e.target.checked }))}
                                            className={`${theme === "luxury" ? "accent-[#d4af37]" : "accent-accent"}`}
                                        />
                                    </label>
                                    <label className="flex items-center justify-between text-sm">
                                        <span>SMS updates</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.sms_opt_in}
                                            onChange={(e) => setPreferences((prev) => ({ ...prev, sms_opt_in: e.target.checked }))}
                                            className={`${theme === "luxury" ? "accent-[#d4af37]" : "accent-accent"}`}
                                        />
                                    </label>
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">Preferred language</label>
                                        <select
                                            value={preferences.preferred_language}
                                            onChange={(e) => setPreferences((prev) => ({ ...prev, preferred_language: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-md border text-sm ${theme === "luxury" ? "bg-[#181818] text-white" : "bg-white text-foreground"} ${styles.accentBorder}`}
                                        >
                                            <option value="en">English</option>
                                            <option value="hi">Hindi</option>
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={save}
                                        disabled={saving}
                                        className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-60 ${styles.buttonClass}`}
                                    >
                                        {saving ? "Saving..." : "Save Preferences"}
                                    </button>
                                    <p className="text-xs text-text-secondary">
                                        Transactional emails for orders and account security are always sent regardless of these preferences.
                                    </p>
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
