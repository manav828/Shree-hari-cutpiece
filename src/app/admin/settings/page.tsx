"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, Monitor, LayoutTemplate, Palette, Mail } from "lucide-react";
import Link from "next/link";

type ThemeOption = "classic" | "luxury" | "bohemian";

const themes: { id: ThemeOption; name: string; description: string; icon: React.ElementType }[] = [
    {
        id: "classic",
        name: "Classic",
        description: "The original clean and functional e-commerce design.",
        icon: LayoutTemplate,
    },
    {
        id: "luxury",
        name: "Luxury",
        description: "A premium, symmetrical, and highly visual dark/elegant variant.",
        icon: Monitor,
    },
    {
        id: "bohemian",
        name: "Bohemian",
        description: "Warm earthy tones, texture-first merchandising, and social-first decor storytelling.",
        icon: Palette,
    },
];

function isThemeOption(value: unknown): value is ThemeOption {
    return value === "classic" || value === "luxury" || value === "bohemian";
}

type ThemeApiPayload = {
    theme?: string;
    persisted?: boolean;
    warning?: string;
    error?: string;
};

export default function AdminSettings() {
    const [activeTheme, setActiveTheme] = useState<ThemeOption>("classic");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");

    const [allowUserReviews, setAllowUserReviews] = useState<boolean>(true);
    const [showProductReviews, setShowProductReviews] = useState<boolean>(true);
    const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
    const [savingReviews, setSavingReviews] = useState<boolean>(false);

    useEffect(() => {
        let cancelled = false;

        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/admin/theme", { cache: "no-store" });
                const payload = (await res.json().catch(() => ({}))) as ThemeApiPayload;

                if (!res.ok) {
                    throw new Error(payload.error || "Failed to fetch active theme.");
                }

                if (!cancelled && isThemeOption(payload.theme)) {
                    setActiveTheme(payload.theme);
                }

                if (!cancelled && payload.warning) {
                    setToast(payload.warning);
                }
            } catch (error) {
                console.error("Error fetching theme:", error);
                if (!cancelled) {
                    setToast("Theme service is currently unavailable. Using fallback mode.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const fetchReviewsSetting = async () => {
            try {
                const res = await fetch("/api/admin/settings/reviews", { cache: "no-store" });
                const payload = await res.json();
                if (res.ok && !cancelled) {
                    setShowProductReviews(payload.showProductReviews ?? true);
                    setAllowUserReviews(payload.allowUserReviews ?? true);
                }
            } catch (error) {
                console.error("Error fetching reviews setting:", error);
            } finally {
                if (!cancelled) {
                    setLoadingReviews(false);
                }
            }
        };

        fetchSettings();
        fetchReviewsSetting();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToast(""), 3000);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const handleSaveTheme = async (themeId: ThemeOption) => {
        const previousTheme = activeTheme;
        setActiveTheme(themeId);
        setSaving(true);

        try {
            const response = await fetch("/api/admin/theme", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ theme: themeId }),
            });

            const payload = (await response.json().catch(() => ({}))) as ThemeApiPayload;

            if (!response.ok) {
                throw new Error(payload.error || "Theme update failed.");
            }

            if (isThemeOption(payload.theme)) {
                setActiveTheme(payload.theme);
            }

            const savedTheme = isThemeOption(payload.theme) ? payload.theme : themeId;
            if (payload.persisted === false) {
                setToast(payload.warning || `Theme switched to ${savedTheme} in browser fallback mode.`);
            } else {
                setToast(`Theme successfully updated to ${savedTheme}.`);
            }
        } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Failed to update theme", e);
            setActiveTheme(previousTheme);
            alert("Error updating theme: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleReviews = async (field: "showProductReviews" | "allowUserReviews", newValue: boolean) => {
        const prevShow = showProductReviews;
        const prevAllow = allowUserReviews;

        if (field === "showProductReviews") {
            setShowProductReviews(newValue);
            // If turning OFF master, also disable user reviews
            if (!newValue) setAllowUserReviews(false);
        } else {
            if (!showProductReviews) return; // guard: can't enable if master is off
            setAllowUserReviews(newValue);
        }

        setSavingReviews(true);
        try {
            const body: Record<string, boolean> = {};
            if (field === "showProductReviews") {
                body.showProductReviews = newValue;
                if (!newValue) body.allowUserReviews = false;
            } else {
                body.allowUserReviews = newValue;
            }

            const response = await fetch("/api/admin/settings/reviews", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error || "Failed to update reviews setting.");
            }

            const labels: Record<string, string> = {
                showProductReviews: `Reviews on storefront ${newValue ? "enabled" : "disabled"}.`,
                allowUserReviews: `Customer review submissions ${newValue ? "enabled" : "disabled"}.`,
            };
            setToast(labels[field]);
        } catch (e: any) {
            console.error("Failed to update reviews setting", e);
            setShowProductReviews(prevShow);
            setAllowUserReviews(prevAllow);
            alert("Error updating reviews setting: " + e.message);
        } finally {
            setSavingReviews(false);
        }
    };

    return (
        <div className="max-w-5xl">
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-2xl animate-fade-in">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium">{toast}</span>
                </div>
            )}

            <h1 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Site Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* THEME SELECTOR SECTION */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">Current Theme</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Change the look and feel of the customer-facing storefront. The Admin Panel is unaffected by this setting.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {themes.map((theme) => {
                                    const isActive = activeTheme === theme.id;
                                    return (
                                        <div
                                            key={theme.id}
                                            onClick={() => {
                                                if (!saving && activeTheme !== theme.id) {
                                                    handleSaveTheme(theme.id);
                                                }
                                            }}
                                            className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${isActive
                                                ? "border-gray-900 bg-gray-50"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`p-2 rounded-lg ${isActive ? "bg-gray-200 text-gray-900" : "bg-gray-100 text-gray-500"}`}>
                                                    <theme.icon className="h-5 w-5" />
                                                </div>
                                                {isActive && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-gray-900 text-white rounded">
                                                        Active
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className={`text-base font-semibold ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                                                {theme.name} Theme
                                            </h3>
                                            <p className={`text-sm mt-1 whitespace-pre-wrap ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                                                {theme.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {saving && (
                            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Saving active theme...
                            </div>
                        )}
                    </div>
                    {/* END THEME SELECTOR */}

                    {/* PRODUCT REVIEWS CONFIGURATION */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">Product Reviews Configuration</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Control if reviews are shown on your storefront and whether customers can submit new reviews.
                            </p>
                        </div>

                        {loadingReviews ? (
                            <div className="flex items-center justify-center p-6">
                                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Toggle 1: Show reviews on storefront (master) */}
                                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                                    showProductReviews ? "bg-gray-50 border-gray-200" : "bg-red-50/40 border-red-100"
                                }`}>
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Show Reviews on Storefront</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {showProductReviews
                                                ? "Reviews section is visible to customers on product pages."
                                                : "Reviews are hidden from the storefront. All review features are disabled."}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={savingReviews}
                                        onClick={() => handleToggleReviews("showProductReviews", !showProductReviews)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${
                                            showProductReviews ? "bg-gray-900" : "bg-gray-200"
                                        }`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            showProductReviews ? "translate-x-5" : "translate-x-0"
                                        }`} />
                                    </button>
                                </div>

                                {/* Toggle 2: Allow user review submissions (sub-setting) */}
                                <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                    !showProductReviews
                                        ? "opacity-40 pointer-events-none bg-gray-50 border-gray-100"
                                        : allowUserReviews
                                            ? "bg-gray-50 border-gray-200"
                                            : "bg-amber-50/40 border-amber-100"
                                }`}>
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-gray-900">Allow Customers to Write Reviews</h3>
                                            {!showProductReviews && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gray-200 text-gray-500 rounded uppercase tracking-wide">Requires master ON</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {allowUserReviews && showProductReviews
                                                ? "Customers can submit reviews (up to 2 images & 1 video) on products they purchased."
                                                : "Only admin-curated reviews will appear. Customers cannot submit new reviews."}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={savingReviews || !showProductReviews}
                                        onClick={() => handleToggleReviews("allowUserReviews", !allowUserReviews)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                                            allowUserReviews && showProductReviews ? "bg-gray-900" : "bg-gray-200"
                                        }`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            allowUserReviews && showProductReviews ? "translate-x-5" : "translate-x-0"
                                        }`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {savingReviews && (
                            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Saving setting...
                            </div>
                        )}
                    </div>
                    {/* END PRODUCT REVIEWS CONFIGURATION */}

                    {/* NOTIFICATIONS & TEMPLATES CARD */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-indigo-600" />
                                    Notifications & Communications
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Configure order confirmation, shipping, and delivery notifications. Edit email (Resend/SMTP) and WhatsApp (Twilio/Mock) templates and configure API keys and settings.
                                </p>
                            </div>
                            <Link
                                href="/admin/notifications-templates"
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex-shrink-0"
                            >
                                Configure Templates & Keys
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Theme Architecture</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Themes are cleanly isolated within the project folder. Once you select a theme here, the next time a user visits the storefront, the routing engine dynamically determines which set of components to show.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
