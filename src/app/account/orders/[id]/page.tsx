"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { useAuth, Order } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

/* ─── Status Configurations ─── */
const orderStatusConfig = {
    placed: {
        label: "Order Placed",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        dot: "bg-yellow-400",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    confirmed: {
        label: "Confirmed",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        dot: "bg-blue-400",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    shipped: {
        label: "Shipped",
        color: "bg-purple-100 text-purple-700 border-purple-200",
        dot: "bg-purple-400",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        ),
    },
    delivered: {
        label: "Delivered",
        color: "bg-green-100 text-green-700 border-green-200",
        dot: "bg-green-400",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-400",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    },
};

const paymentStatusConfig = {
    pending: { label: "Payment Pending", color: "bg-orange-100 text-orange-700 border-orange-200" },
    paid: { label: "Paid", color: "bg-green-100 text-green-700 border-green-200" },
    refunded: { label: "Refunded", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

// Timeline steps in order
const TIMELINE_STEPS: Order["status"][] = ["placed", "confirmed", "shipped", "delivered"];

/* ─── Order Progress Timeline ─── */
function OrderTimeline({ currentStatus }: { currentStatus: Order["status"] }) {
    if (currentStatus === "cancelled") {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    {orderStatusConfig.cancelled.icon}
                </div>
                <div>
                    <p className="font-medium text-red-700 text-sm">Order Cancelled</p>
                    <p className="text-red-500 text-xs">This order has been cancelled.</p>
                </div>
            </div>
        );
    }

    const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);

    return (
        <div className="relative">
            <div className="flex items-start justify-between relative">
                {/* Connecting line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
                <div
                    className="absolute top-4 left-4 h-0.5 bg-accent transition-all duration-700"
                    style={{ width: `calc(${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}% - ${currentIndex === 0 ? 16 : 0}px)` }}
                />
                {TIMELINE_STEPS.map((step, i) => {
                    const isDone = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    const cfg = orderStatusConfig[step];
                    return (
                        <div key={step} className="flex flex-col items-center gap-2 z-10 flex-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isDone
                                    ? "bg-accent border-accent text-white"
                                    : "bg-white border-border text-text-secondary"
                                    } ${isCurrent ? "ring-4 ring-accent/20" : ""}`}
                            >
                                {isDone ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                )}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${isDone ? "text-accent" : "text-text-secondary"}`}>
                                {cfg.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { orders, user, isLoading } = useAuth();
    const { addToCart } = useCart();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [reorderedAll, setReorderedAll] = useState(false);
    const [reorderedItems, setReorderedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
        if (orders && id) {
            const found = orders.find((o) => o.id === id);
            setOrder(found || null);
        }
    }, [orders, id, user, isLoading, router]);

    const handleReorderAll = () => {
        if (!order) return;
        order.items.forEach((item) => {
            addToCart({
                id: item.id,
                name: item.name,
                slug: item.id,
                image: item.image,
                price: item.price,
                meters: item.meters,
            });
        });
        setReorderedAll(true);
        setTimeout(() => setReorderedAll(false), 3000);
    };

    const handleReorderItem = (item: Order["items"][0]) => {
        addToCart({
            id: item.id,
            name: item.name,
            slug: item.id,
            image: item.image,
            price: item.price,
            meters: item.meters,
        });
        setReorderedItems((prev) => new Set([...Array.from(prev), item.id]));
        setTimeout(() => {
            setReorderedItems((prev) => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }, 2500);
    };

    const handleWhatsAppReorder = () => {
        if (!order || !user) return;
        const itemsList = order.items
            .map((i) => `• ${i.name}: ${i.meters}m`)
            .join("%0A");
        const msg = `Hi, I'd like to reorder items from my Order %23${order.id}:%0A%0A${itemsList}%0A%0ATotal was: ${formatPrice(order.total)}`;
        window.open(`https://wa.me/91XXXXXXXXXX?text=${msg}`, "_blank");
    };

    if (isLoading || !order) {
        return (
            <>
                <Navbar />
                <CartSidebar />
                <main className="pt-24 min-h-screen flex items-center justify-center">
                    {!isLoading && !order ? (
                        <div className="text-center">
                            <p className="text-text-secondary mb-6 text-lg">Order not found.</p>
                            <Link href="/account" className="btn-primary text-sm py-3">
                                Back to My Orders
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <svg className="w-8 h-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-text-secondary text-sm">Loading order details...</p>
                        </div>
                    )}
                </main>
                <Footer />
            </>
        );
    }

    const orderStatus = orderStatusConfig[order.status];
    const paymentStatus = paymentStatusConfig[order.paymentStatus];

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-12 lg:pt-24 pb-20 min-h-screen bg-[#FDFBF7]">
                <Container>
                    {/* Back Link */}
                    <div className="mb-8">
                        <Link
                            href="/account"
                            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to My Orders
                        </Link>
                    </div>

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
                        <div>
                            <p className="text-accent text-xs tracking-[0.3em] uppercase mb-2 font-medium">Order Details</p>
                            <h1 className="font-serif text-3xl lg:text-4xl text-foreground">#{order.id}</h1>
                            <p className="text-text-secondary text-sm mt-1">
                                Placed on{" "}
                                {new Date(order.date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${orderStatus.color}`}>
                                {orderStatus.label}
                            </span>
                            <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${paymentStatus.color}`}>
                                {paymentStatus.label}
                            </span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Progress */}
                            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
                                <h2 className="font-serif text-lg text-foreground mb-6">Order Progress</h2>
                                <OrderTimeline currentStatus={order.status} />
                            </div>

                            {/* Tracking Card (only if trackingUrl is set) */}
                            {order.trackingUrl && (
                                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 sm:p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground mb-1">Your package is on the way!</p>
                                            <p className="text-text-secondary text-xs mb-3">Click below to track your shipment in real time.</p>
                                            <a
                                                href={order.trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5"
                                            >
                                                Track Shipment
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-serif text-lg text-foreground">
                                        Items Ordered ({order.items.length})
                                    </h2>
                                    <button
                                        onClick={handleReorderAll}
                                        className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-4 py-2 rounded-lg border ${reorderedAll
                                            ? "bg-green-50 border-green-200 text-green-700"
                                            : "border-accent text-accent hover:bg-accent hover:text-white"
                                            }`}
                                    >
                                        {reorderedAll ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Added to Cart!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Reorder All
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="divide-y divide-border">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
                                            {/* Image */}
                                            <Link href="/shop" className="w-16 h-20 relative flex-shrink-0 rounded-lg overflow-hidden bg-background-secondary border border-border group">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </Link>
                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-foreground text-sm leading-tight mb-1 truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-text-secondary text-xs">
                                                    {item.meters}m × {formatPrice(item.price)}/m
                                                </p>
                                                <p className="font-medium text-foreground text-sm mt-1">
                                                    {formatPrice(item.price * item.meters)}
                                                </p>
                                            </div>
                                            {/* Reorder single item */}
                                            <button
                                                onClick={() => handleReorderItem(item)}
                                                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium transition-all duration-300 px-3 py-2 rounded-lg border ${reorderedItems.has(item.id)
                                                    ? "bg-green-50 border-green-200 text-green-700"
                                                    : "border-border text-text-secondary hover:border-accent hover:text-accent"
                                                    }`}
                                            >
                                                {reorderedItems.has(item.id) ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reorder via WhatsApp */}
                            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground text-sm">Reorder via WhatsApp</p>
                                        <p className="text-text-secondary text-xs">Chat directly with us to place the same order again.</p>
                                    </div>
                                    <button
                                        onClick={handleWhatsAppReorder}
                                        className="flex-shrink-0 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                                    >
                                        WhatsApp
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right - Order Summary Sidebar */}
                        <div className="space-y-6">
                            {/* Price Breakdown */}
                            <div className="bg-white rounded-2xl border border-border p-6">
                                <h2 className="font-serif text-lg text-foreground mb-5">Price Breakdown</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Subtotal</span>
                                        <span className="text-foreground">{formatPrice(order.total - order.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Shipping</span>
                                        <span className={order.shippingCost === 0 ? "text-green-600 font-medium" : "text-foreground"}>
                                            {order.shippingCost === 0 ? "FREE" : formatPrice(order.shippingCost)}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-border flex justify-between">
                                        <span className="font-medium text-foreground">Total</span>
                                        <span className="font-serif text-xl text-foreground">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white rounded-2xl border border-border p-6">
                                <h2 className="font-serif text-lg text-foreground mb-4">Payment</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-secondary text-sm">Status</span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${paymentStatus.color}`}>
                                            {paymentStatus.label}
                                        </span>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-text-secondary text-sm flex-shrink-0">Method</span>
                                        <span className="text-foreground text-sm text-right">{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-white rounded-2xl border border-border p-6">
                                <h2 className="font-serif text-lg text-foreground mb-4">Delivery Details</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-text-secondary text-xs mb-1">Ship to</p>
                                        <p className="text-foreground text-sm leading-relaxed">{order.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-xs mb-1">Contact</p>
                                        <p className="text-foreground text-sm">{order.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help? */}
                            <div className="bg-[#F7F0F1] rounded-2xl p-6">
                                <h2 className="font-serif text-base text-foreground mb-2">Need Help?</h2>
                                <p className="text-text-secondary text-xs mb-4">
                                    For any queries regarding this order, contact us on WhatsApp with your order ID.
                                </p>
                                <a
                                    href={`https://wa.me/91XXXXXXXXXX?text=Hi, I have a query about Order %23${order.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Chat on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
