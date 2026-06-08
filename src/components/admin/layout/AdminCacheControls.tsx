"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Loader2, CheckCircle, XCircle, Database } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
    message: string;
    type: ToastType;
    id: number;
}

function getAdminToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("shreehari_admin_token") || null;
}

function getAuthHeaders(): Record<string, string> {
    const token = getAdminToken();
    if (token) return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return { "Content-Type": "application/json" };
}

export default function AdminCacheControls() {
    const [cacheEnabled, setCacheEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [nextId, setNextId] = useState(0);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = nextId;
        setNextId((n) => n + 1);
        setToasts((prev) => [...prev, { message, type, id }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, [nextId]);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/cache", { headers: getAuthHeaders() });
            if (!res.ok) return;
            const data = await res.json();
            setCacheEnabled(Boolean(data.enabled));
        } catch {
            // Silently ignore — non-critical UI element
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleToggle = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/cache", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ action: "toggle" }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setCacheEnabled(Boolean(data.enabled));
                addToast(
                    data.enabled ? "✓ Caching enabled — pages will be cached for 1 hour" : "⊘ Caching disabled — pages load fresh every request",
                    "success",
                );
            } else {
                addToast(data.error || "Failed to toggle cache", "error");
            }
        } catch {
            addToast("Network error — could not toggle cache", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        const confirmed = window.confirm(
            "Clear all storefront cache?\n\nThe next visitor to each page will fetch fresh data from the database.\n\nThis is useful after editing products, banners, or site config.",
        );
        if (!confirmed) return;

        setClearing(true);
        try {
            const res = await fetch("/api/admin/cache", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ action: "clear" }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                addToast("✓ All storefront cache cleared — visitors will see fresh data", "success");
            } else {
                addToast(data.error || "Failed to clear cache", "error");
            }
        } catch {
            addToast("Network error — could not clear cache", "error");
        } finally {
            setClearing(false);
        }
    };

    return (
        <>
            {/* Cache Controls */}
            <div className="flex items-center gap-2">
                {/* Cache Status + Toggle */}
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-slate-200 shadow-sm">
                    <Database className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-[11px] font-medium text-slate-500 select-none whitespace-nowrap">
                        Cache
                    </span>

                    {/* Toggle switch */}
                    <button
                        id="admin-cache-toggle"
                        onClick={handleToggle}
                        disabled={loading || cacheEnabled === null}
                        title={cacheEnabled ? "Click to disable caching" : "Click to enable caching"}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                            cacheEnabled ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                        aria-label={cacheEnabled ? "Disable caching" : "Enable caching"}
                    >
                        <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                cacheEnabled ? "translate-x-4" : "translate-x-0.5"
                            }`}
                        />
                        {loading && (
                            <Loader2 className="absolute inset-0 m-auto h-3 w-3 text-white animate-spin" />
                        )}
                    </button>

                    <span
                        className={`text-[11px] font-semibold w-5 select-none ${
                            cacheEnabled ? "text-emerald-600" : "text-slate-400"
                        }`}
                    >
                        {cacheEnabled === null ? "—" : cacheEnabled ? "ON" : "OFF"}
                    </span>
                </div>

                {/* Clear Cache Button */}
                <button
                    id="admin-clear-cache-btn"
                    onClick={handleClear}
                    disabled={clearing}
                    title="Clear all storefront cache"
                    aria-label="Clear storefront cache"
                    className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-slate-200 shadow-sm text-[11px] font-medium text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {clearing
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                    }
                    <span className="hidden sm:inline">{clearing ? "Clearing…" : "Clear Cache"}</span>
                </button>
            </div>

            {/* Toast Notifications */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-slide-up pointer-events-auto ${
                            toast.type === "success"
                                ? "bg-emerald-600 text-white"
                                : "bg-red-600 text-white"
                        }`}
                    >
                        {toast.type === "success"
                            ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            : <XCircle className="h-4 w-4 flex-shrink-0" />
                        }
                        {toast.message}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.25s ease-out;
                }
            `}</style>
        </>
    );
}
