"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { ToastType } from "@/lib/toast";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export default function GlobalToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const handleToastEvent = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.message) {
                const newToast: Toast = {
                    id: Math.random().toString(36).substring(2, 9),
                    message: detail.message,
                    type: detail.type || "success",
                };
                setToasts((prev) => [...prev, newToast]);
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
                }, 4000);
            }
        };

        window.addEventListener("shreehari-toast", handleToastEvent);
        return () => {
            window.removeEventListener("shreehari-toast", handleToastEvent);
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2.5 w-full max-w-md pointer-events-none px-4">
            {toasts.map((toast) => {
                const bgClass =
                    toast.type === "success"
                        ? "bg-emerald-600 text-white"
                        : toast.type === "error"
                        ? "bg-red-600 text-white"
                        : toast.type === "warning"
                        ? "bg-amber-500 text-white"
                        : "bg-indigo-600 text-white";

                const Icon =
                    toast.type === "success"
                        ? CheckCircle
                        : toast.type === "error"
                        ? XCircle
                        : toast.type === "warning"
                        ? AlertTriangle
                        : Info;

                return (
                    <div
                        key={toast.id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-2xl text-[12px] font-bold w-full animate-slide-down pointer-events-auto border border-white/10 ${bgClass}`}
                    >
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span>{toast.message}</span>
                        </div>
                        <button
                            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                            className="text-white/80 hover:text-white flex-shrink-0 cursor-pointer p-0.5 hover:bg-white/10 rounded-md transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                );
            })}
            <style>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to   { opacity: 1; transform: translate(-50%, 0); }
                }
                .animate-slide-down {
                    animation: slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    position: relative;
                    left: 50%;
                    transform: translateX(-50%);
                }
            `}</style>
        </div>
    );
}
