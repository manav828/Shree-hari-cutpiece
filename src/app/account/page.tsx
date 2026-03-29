"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { useAuth, Order } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";

type Tab = "orders" | "addresses" | "settings";

const statusConfig = {
    placed: { label: "Order Placed", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200" },
    shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700 border-purple-200" },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700 border-green-200" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
    returning: { label: "Return Requested", color: "bg-orange-100 text-orange-700 border-orange-200" },
    returned: { label: "Returned", color: "bg-gray-100 text-gray-700 border-gray-200" },
    replacing: { label: "Replace Requested", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    replaced: { label: "Replaced", color: "bg-teal-100 text-teal-700 border-teal-200" },
};

function formatOptionSummary(options?: Array<{ group_name?: string | null; value_labels?: string[] | null; input_value?: string | number | null; }> | null) {
    if (!options || options.length === 0) return "";
    const parts = options
        .map((opt) => {
            const value = opt.value_labels?.join(", ") || opt.input_value;
            if (!value) return null;
            return `${opt.group_name}: ${value}`;
        })
        .filter(Boolean) as string[];
    return parts.join(" | ");
}

function OrderCard({ order }: { order: Order }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Provide a fallback for statuses that might not be in statusConfig (like 'pending')
    const status = statusConfig[order.status as keyof typeof statusConfig] || {
        label: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        color: "bg-gray-100 text-gray-700 border-gray-200"
    };

    return (
        <div className="bg-white border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-md">
            {/* Order Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer"
                aria-expanded={isExpanded}
            >
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-foreground text-sm">#{order.order_number}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    <p className="text-text-secondary text-xs">
                        {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        {" · "} {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Item thumbnails */}
                    <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="w-9 h-9 rounded-md border-2 border-white overflow-hidden relative bg-background-secondary">
                                {item.image_url ? <Image src={item.image_url} alt={item.product_name} fill className="object-cover" /> : <div className="w-full h-full bg-border" />}
                            </div>
                        ))}
                        {order.items.length > 3 && (
                            <div className="w-9 h-9 rounded-md border-2 border-white bg-background-secondary flex items-center justify-center text-xs text-text-secondary font-medium">
                                +{order.items.length - 3}
                            </div>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="font-medium text-foreground text-sm">{formatPrice(order.total)}</p>
                    </div>
                    <svg
                        className={`w-5 h-5 text-text-secondary transition-transform duration-300 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Expandable Details */}
            {isExpanded && (
                <div className="border-t border-border px-6 py-5 bg-[#FDFBF7]">
                    {/* Items */}
                    <div className="space-y-4 mb-5">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="w-14 h-16 relative bg-white flex-shrink-0 rounded-lg border border-border overflow-hidden">
                                    {item.image_url ? <Image src={item.image_url} alt={item.product_name} fill className="object-cover" /> : <div className="w-full h-full bg-border" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                                    <p className="text-xs text-text-secondary mt-0.5">{item.quantity_or_meters} × {formatPrice(item.price_per_unit)}</p>
                                    {formatOptionSummary(item.selected_options_json) && (
                                        <p className="text-[11px] text-text-secondary mt-0.5">
                                            {formatOptionSummary(item.selected_options_json)}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-foreground flex-shrink-0">
                                    {formatPrice(item.price_per_unit * item.quantity_or_meters)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Totals & Address */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4 border-t border-border">
                        <div>
                            <p className="text-xs text-text-secondary mb-1">Delivery Address</p>
                            <p className="text-sm text-foreground">{order.address}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-xs text-text-secondary mb-0.5">Order Total</p>
                            <p className="font-serif text-xl text-foreground">{formatPrice(order.total)}</p>
                        </div>
                    </div>

                    {/* View Details Action */}
                    <div className="mt-5 pt-5 border-t border-border border-dashed">
                        <Link
                            href={`/account/orders/${order.id}`}
                            className="w-full btn-secondary bg-white text-sm py-3 flex items-center justify-center gap-2 rounded-lg"
                        >
                            View Order Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AccountPage() {
    const { user, orders, logout, updateProfile, isLoading, refreshOrders } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("orders");
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Initial auth redirect and sync local state
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
        if (user) {
            setEditName(user.name);
            setEditPhone(user.phone || "");
        }
    }, [user, isLoading, router]);

    // Force an initial refresh of orders when the page mounts so new checkouts appear
    useEffect(() => {
        if (user) {
            refreshOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    if (isLoading || !user) {
        return (
            <>
                <Navbar />
                <CartSidebar />
                <main className="pt-24 min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="w-8 h-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-text-secondary text-sm">Loading your account...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Generate initials avatar
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleSaveProfile = () => {
        updateProfile({ name: editName, phone: editPhone });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: "orders", label: "My Orders" },
        { id: "addresses", label: "Addresses" },
        { id: "settings", label: "Settings" },
    ];

    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const lastOrder = orders.length > 0 ? orders[0] : null;
    const memberSince = orders.length > 0 ? orders[orders.length - 1].date : null;
    const recentOrders = orders.slice(0, 5);

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-12 lg:pt-24 pb-20 min-h-screen">
                <Container>
                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12 pb-10 border-b border-border">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                            <span className="font-serif text-2xl text-white">{initials}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-accent text-xs tracking-[0.3em] uppercase mb-1 font-medium">Member Account</p>
                            <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-1">{user.name}</h1>
                            <p className="text-text-secondary text-sm">{user.email}</p>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                router.push("/");
                            }}
                            className="btn-secondary text-sm py-3 flex items-center gap-2 self-start sm:self-auto"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-10">
                        {/* Sidebar Nav */}
                        <div className="lg:col-span-1">
                            <nav className="space-y-1 lg:sticky lg:top-32">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === tab.id
                                            ? "bg-accent text-white shadow-sm"
                                            : "text-text-secondary hover:text-foreground hover:bg-background-secondary"
                                            }`}
                                    >
                                        {tab.label}
                                        {tab.id === "orders" && (
                                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-border text-text-secondary"}`}>
                                                {orders.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="mb-6 bg-[#F7F0F1] border border-border rounded-2xl p-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-2">Welcome back</p>
                                <h2 className="font-serif text-2xl text-foreground">{user.name}</h2>
                                <p className="text-sm text-text-secondary mt-1">Manage your profile, addresses, and order journey from one place.</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                                    <div className="bg-white border border-border rounded-lg p-3">
                                        <p className="text-[11px] uppercase text-text-secondary">Total Orders</p>
                                        <p className="text-lg font-semibold text-foreground mt-1">{orders.length}</p>
                                    </div>
                                    <div className="bg-white border border-border rounded-lg p-3">
                                        <p className="text-[11px] uppercase text-text-secondary">Total Spent</p>
                                        <p className="text-lg font-semibold text-foreground mt-1">{formatPrice(totalSpent)}</p>
                                    </div>
                                    <div className="bg-white border border-border rounded-lg p-3">
                                        <p className="text-[11px] uppercase text-text-secondary">Member Since</p>
                                        <p className="text-sm font-semibold text-foreground mt-1">
                                            {memberSince
                                                ? new Date(memberSince).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                                : "-"}
                                        </p>
                                    </div>
                                    <div className="bg-white border border-border rounded-lg p-3">
                                        <p className="text-[11px] uppercase text-text-secondary">Last Order</p>
                                        <p className="text-sm font-semibold text-foreground mt-1">
                                            {lastOrder
                                                ? new Date(lastOrder.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                                : "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    <Link href="/account/profile" className="btn-secondary text-xs py-2">Edit Profile</Link>
                                    <Link href="/account/addresses" className="btn-secondary text-xs py-2">Address Book</Link>
                                    <Link href="/account/preferences" className="btn-secondary text-xs py-2">Preferences</Link>
                                </div>
                            </div>

                            {/* My Orders Tab */}
                            {activeTab === "orders" && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="font-serif text-2xl text-foreground">My Orders</h2>
                                        <p className="text-text-secondary text-sm">{orders.length} orders</p>
                                    </div>

                                    <div className="mb-6 bg-white border border-border rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
                                            <span className="text-xs text-text-secondary">Last 5</span>
                                        </div>
                                        {recentOrders.length === 0 ? (
                                            <p className="text-sm text-text-secondary">No recent orders yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {recentOrders.map((order) => (
                                                    <Link
                                                        key={`recent-${order.id}`}
                                                        href={`/account/orders/${order.id}`}
                                                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-background-secondary"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">#{order.order_number}</p>
                                                            <p className="text-xs text-text-secondary">
                                                                {new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm font-medium text-foreground">{formatPrice(order.total)}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-20 bg-[#F7F0F1] rounded-2xl">
                                            <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <p className="text-text-secondary mb-4 text-sm">You haven&apos;t placed any orders yet.</p>
                                            <Link href="/shop" className="btn-primary text-sm py-3">
                                                Start Shopping
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <OrderCard key={order.id} order={order} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === "addresses" && (
                                <div>
                                    <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                                        <h2 className="font-serif text-2xl text-foreground">Saved Addresses</h2>
                                        <Link href="/account/addresses" className="btn-secondary text-sm py-2.5">
                                            Manage Addresses
                                        </Link>
                                    </div>
                                    <div className="bg-[#F7F0F1] rounded-2xl p-8 text-center">
                                        <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-text-secondary text-sm mb-4">Address management is now available with add, edit, delete, and default selection.</p>
                                        <Link href="/account/addresses" className="btn-primary text-sm py-2.5 inline-block">Open Address Book</Link>
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {activeTab === "settings" && (
                                <div>
                                    <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                                        <h2 className="font-serif text-2xl text-foreground">Account Settings</h2>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link href="/account/profile" className="btn-secondary text-sm py-2.5">Profile Page</Link>
                                            <Link href="/account/preferences" className="btn-secondary text-sm py-2.5">Preferences Page</Link>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-5">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="edit-name"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="peer w-full px-4 pt-6 pb-2 border-b-2 border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors placeholder-transparent rounded-t-md"
                                                placeholder="Full Name"
                                            />
                                            <label htmlFor="edit-name" className="absolute left-4 top-2 text-[10px] text-text-secondary font-medium pointer-events-none transition-all peer-focus:text-accent">
                                                Full Name
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="edit-email"
                                                value={user.email}
                                                disabled
                                                className="peer w-full px-4 pt-6 pb-2 border-b-2 border-border/50 bg-background-secondary/50 focus:outline-none text-text-secondary placeholder-transparent rounded-t-md cursor-not-allowed"
                                                placeholder="Email"
                                            />
                                            <label htmlFor="edit-email" className="absolute left-4 top-2 text-[10px] text-text-secondary font-medium pointer-events-none">
                                                Email Address (cannot be changed)
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                id="edit-phone"
                                                value={editPhone}
                                                onChange={(e) => setEditPhone(e.target.value)}
                                                className="peer w-full px-4 pt-6 pb-2 border-b-2 border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors placeholder-transparent rounded-t-md"
                                                placeholder="Phone"
                                            />
                                            <label htmlFor="edit-phone" className="absolute left-4 top-2 text-[10px] text-text-secondary font-medium pointer-events-none transition-all peer-focus:text-accent">
                                                Phone Number
                                            </label>
                                        </div>

                                        {saveSuccess && (
                                            <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-md">
                                                <p className="text-green-700 text-sm">Profile updated successfully!</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleSaveProfile}
                                            className="btn-primary text-sm py-3"
                                        >
                                            Save Changes
                                        </button>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="mt-8 p-6 border border-red-200 rounded-xl">
                                        <h3 className="text-sm font-medium text-foreground mb-2">Sign Out</h3>
                                        <p className="text-text-secondary text-xs mb-4">You will be signed out of your account on this device.</p>
                                        <button
                                            onClick={() => { logout(); router.push("/"); }}
                                            className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
