"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, Monitor, LayoutTemplate, Palette } from "lucide-react";

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

        fetchSettings();

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
