"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase as supabaseClient } from "@/lib/supabase";
const supabase = supabaseClient as any;
import { Bell, Check, Trash2, ShieldAlert, CheckCircle, Package, Loader2, MailOpen } from "lucide-react";

interface AdminNotification {
    id: string;
    title: string;
    message: string;
    type: string; // info, warning, success, error
    is_read: boolean;
    link: string | null;
    created_at: string;
}

function timeAgo(dateString: string): string {
    try {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        if (diffMs < 0) return "Just now";

        const seconds = Math.floor(diffMs / 1000);
        if (seconds < 60) return "Just now";
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
        return "";
    }
}

export default function AdminNotificationsBell() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const { data, error } = await supabase
                .from("admin_notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;

            if (data) {
                setNotifications(data as AdminNotification[]);
                const unread = data.filter((n: any) => !n.is_read).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Error fetching admin notifications:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // Fetch on mount and set up polling every 30 seconds
    useEffect(() => {
        fetchNotifications();
        
        const interval = setInterval(() => {
            fetchNotifications(true);
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from("admin_notifications")
                .update({ is_read: true })
                .eq("id", id);
            
            if (error) throw error;

            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const { error } = await supabase
                .from("admin_notifications")
                .update({ is_read: true })
                .eq("is_read", false);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid triggering navigation
        try {
            const { error } = await supabase
                .from("admin_notifications")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setNotifications(prev => prev.filter(n => n.id !== id));
            // Recalculate unread
            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const handleNotificationClick = async (n: AdminNotification) => {
        if (!n.is_read) {
            await handleMarkAsRead(n.id);
        }
        setIsOpen(false);
        if (n.link) {
            router.push(n.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": // New Order
                return (
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">
                        <CheckCircle className="h-4 w-4" />
                    </div>
                );
            case "warning": // Low Stock
                return (
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 flex-shrink-0 animate-pulse-subtle">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                );
            case "error":
                return (
                    <div className="p-2 rounded-lg bg-red-50 text-red-600 flex-shrink-0">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                );
            default:
                return (
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                        <Package className="h-4 w-4" />
                    </div>
                );
        }
    };

    return (
        <div ref={containerRef} className="relative z-50">
            {/* Bell Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center justify-center p-2 rounded-lg border bg-white/70 backdrop-blur-sm shadow-sm transition-all duration-150 focus:outline-none hover:bg-slate-50 cursor-pointer ${
                    isOpen ? "border-slate-400 text-slate-800" : "border-slate-200 text-slate-500 hover:text-slate-700"
                }`}
                aria-label="Admin Notifications"
                title="Admin Notifications"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-md shadow-red-500/20">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col animate-slide-up">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">{unreadCount} unread alerts</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                <Check className="h-3 w-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Content List */}
                    <div className="flex-1 overflow-y-auto min-h-[150px] max-h-[350px]">
                        {loading && notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                                <span className="text-xs text-slate-400 font-medium mt-2">Loading notifications...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                                <MailOpen className="h-8 w-8 mb-2" />
                                <p className="text-xs font-semibold text-slate-400">All caught up!</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">No recent admin notifications.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`flex items-start gap-3 p-4 hover:bg-slate-50/75 transition-all duration-150 cursor-pointer relative group ${
                                            !n.is_read ? "bg-blue-50/15" : ""
                                        }`}
                                    >
                                        {/* Icon */}
                                        {getIcon(n.type)}

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-xs font-semibold truncate ${
                                                    !n.is_read ? "text-gray-900 font-bold" : "text-gray-700"
                                                }`}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[9px] text-gray-400 whitespace-nowrap flex-shrink-0">
                                                    {timeAgo(n.created_at)}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] text-gray-500 mt-0.5 break-words ${
                                                !n.is_read ? "text-gray-700 font-medium" : "text-gray-400"
                                            }`}>
                                                {n.message}
                                            </p>
                                        </div>

                                        {/* Unread blue dot */}
                                        {!n.is_read && (
                                            <span className="absolute top-1/2 -translate-y-1/2 right-3 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                        )}

                                        {/* Row Delete Button (visible on hover) */}
                                        <button
                                            onClick={(e) => handleDeleteNotification(n.id, e)}
                                            title="Delete notification"
                                            className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-2.5 border-t border-slate-100 text-center bg-slate-50/30">
                            <span className="text-[10px] text-gray-400 select-none">
                                Showing last 20 notifications
                            </span>
                        </div>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.18s ease-out;
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s infinite ease-in-out;
                }
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            ` }} />
        </div>
    );
}
