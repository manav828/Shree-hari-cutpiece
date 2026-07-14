"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/imageOptimization";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { useAuth, Order } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/brand";
import { trackWhatsAppClick } from "@/lib/tracking";
import { generateInvoicePDF } from "@/utils/invoice/InvoiceGenerator";
import { getThemeSync } from "@/lib/themeSync";

const themeStyles = {
  bohemian: {
    pageBg: "bg-[#fcf9f4]/30",
    cardBg: "bg-[#FDFBF7]",
    accentBorder: "border-[#e8ddd3]",
    fontFamily: "font-serif",
    accentText: "text-[#9f3f29]",
    accentBg: "bg-[#9f3f29]",
    borderBg: "bg-[#e8ddd3]",
    bannerBg: "bg-[#F7F0F1]",
    buttonClass: "bg-[#9f3f29] hover:bg-[#8c3522] text-white",
    bodyText: "text-[#1c1c19]",
  },
  classic: {
    pageBg: "bg-white",
    cardBg: "bg-white",
    accentBorder: "border-border",
    fontFamily: "font-sans",
    accentText: "text-accent",
    accentBg: "bg-accent",
    borderBg: "bg-border",
    bannerBg: "bg-background-secondary",
    buttonClass: "bg-accent hover:bg-[#721833] text-white",
    bodyText: "text-foreground",
  },
  luxury: {
    pageBg: "bg-[#0a0a0a]",
    cardBg: "bg-[#121212]",
    accentBorder: "border-[#d4af37]/20",
    fontFamily: "font-sans",
    accentText: "text-[#d4af37]",
    accentBg: "bg-[#d4af37]",
    borderBg: "bg-[#d4af37]/20",
    bannerBg: "bg-[#1C1C1C]",
    buttonClass: "bg-[#d4af37] hover:bg-[#c29d2c] text-black font-semibold",
    bodyText: "text-white",
  }
};

/* ─── Status Configurations ─── */
const orderStatusConfig: Record<Order["status"], { label: string; color: string; dot: string }> = {
    placed: {
        label: "Order Placed",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        dot: "bg-yellow-400",
    },
    confirmed: {
        label: "Confirmed",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        dot: "bg-blue-400",
    },
    shipped: {
        label: "Shipped",
        color: "bg-purple-100 text-purple-700 border-purple-200",
        dot: "bg-purple-400",
    },
    delivered: {
        label: "Delivered",
        color: "bg-green-100 text-green-700 border-green-200",
        dot: "bg-green-400",
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-400",
    },
    returning: {
        label: "Returning",
        color: "bg-orange-100 text-orange-700 border-orange-200",
        dot: "bg-orange-400",
    },
    returned: {
        label: "Returned",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        dot: "bg-gray-400",
    },
    replacing: {
        label: "Replacing",
        color: "bg-indigo-100 text-indigo-700 border-indigo-200",
        dot: "bg-indigo-400",
    },
    replaced: {
        label: "Replaced",
        color: "bg-teal-100 text-teal-700 border-teal-200",
        dot: "bg-teal-400",
    },
};

const paymentStatusConfig = {
    pending: { label: "Payment Pending", color: "bg-orange-100 text-orange-700 border-orange-200" },
    paid: { label: "Paid", color: "bg-green-100 text-green-700 border-green-200" },
    refunded: { label: "Refunded", color: "bg-gray-100 text-gray-600 border-gray-200" },
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

// Timeline steps in order for normal flow
const TIMELINE_STEPS: Order["status"][] = ["placed", "confirmed", "shipped", "delivered"];
const EXCEPTION_STATUSES: Order["status"][] = ["cancelled", "returning", "returned", "replacing", "replaced"];

/* ─── Order Progress ─── */
function OrderTimeline({ currentStatus }: { currentStatus: Order["status"] }) {
    const theme = getThemeSync();
    const styles = themeStyles[theme] || themeStyles.classic;

    if (EXCEPTION_STATUSES.includes(currentStatus)) {
        const isCancelled = currentStatus === "cancelled";
        const cfg = orderStatusConfig[currentStatus];
        return (
            <div className={`flex items-center gap-3 p-4 border rounded-xl ${isCancelled ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCancelled ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-700"}`}>
                    {isCancelled ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className={`${styles.fontFamily} text-sm text-foreground font-medium`}>{cfg.label}</h3>
                    <p className={`${isCancelled ? "text-red-500" : "text-gray-500"} text-xs`}>This order is currently marked as {cfg.label.toLowerCase()}.</p>
                </div>
            </div>
        );
    }

    const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);

    return (
        <div className="relative">
            <div className="flex items-start justify-between relative">
                <div className={`absolute top-4 left-4 right-4 h-0.5 ${styles.borderBg}`} />
                <div
                    className={`absolute top-4 left-4 h-0.5 ${styles.accentBg} transition-all duration-700`}
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
                                    ? `${styles.accentBg} border-transparent text-white`
                                    : `${styles.cardBg} ${styles.accentBorder} text-text-secondary`
                                    } ${isCurrent ? "ring-4 ring-accent/30 scale-110 shadow-lg relative" : ""}`}
                            >
                                {isCurrent && (
                                    <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
                                )}
                                {isDone ? (
                                    <svg className="w-4 h-4 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                )}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${isDone ? styles.accentText : "text-text-secondary"}`}>
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
    const [copiedTracking, setCopiedTracking] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

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
                id: item.variant_id || item.product_id || item.id,
                product_id: item.product_id || undefined,
                variant_id: item.variant_id || undefined,
                name: item.product_name,
                image: item.image_url || "",
                price: item.price_per_unit,
                meters: item.quantity_or_meters,
                selling_mode: (item.selling_mode === "piece" || item.selling_mode === "meter") ? item.selling_mode : "meter",
                selected_options: item.selected_options_json
                    ? (item.selected_options_json as any[]).map((opt) => ({
                        group_id: opt.group_id,
                        group_name: opt.group_name || "",
                        input_type: opt.input_type || "select",
                        value_ids: opt.value_ids,
                        value_labels: opt.value_labels,
                        input_value: opt.input_value,
                      }))
                    : undefined,
                slug: "",
                analytics_source: "account_order_reorder_all",
            });
        });
        setReorderedAll(true);
        setTimeout(() => setReorderedAll(false), 3000);
    };

    const handleReorderItem = (item: Order["items"][0]) => {
        addToCart({
            id: item.variant_id || item.product_id || item.id,
            product_id: item.product_id || undefined,
            variant_id: item.variant_id || undefined,
            name: item.product_name,
            image: item.image_url || "",
            price: item.price_per_unit,
            meters: item.quantity_or_meters,
            selling_mode: (item.selling_mode === "piece" || item.selling_mode === "meter") ? item.selling_mode : "meter",
            selected_options: item.selected_options_json
                ? (item.selected_options_json as any[]).map((opt) => ({
                    group_id: opt.group_id,
                    group_name: opt.group_name || "",
                    input_type: opt.input_type || "select",
                    value_ids: opt.value_ids,
                    value_labels: opt.value_labels,
                    input_value: opt.input_value,
                  }))
                : undefined,
            slug: "",
            analytics_source: "account_order_reorder_item",
        });
        setReorderedItems((prev) => new Set(prev).add(item.id));
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
            .map((i) => `- ${i.product_name}: ${i.quantity_or_meters}`)
            .join("\n");
        const message = `Hi, I'd like to reorder items from Order #${order.order_number}:\n\n${itemsList}\n\nTotal was: ${formatPrice(order.total)}`;
        trackWhatsAppClick({
            location: "account_order_reorder",
            orderNumber: order.order_number,
        });
        window.open(getWhatsAppUrl(message), "_blank");
    };

    const handleDownloadInvoice = async () => {
        if (!order) return;
        setIsDownloadingPdf(true);
        await generateInvoicePDF(order);
        setIsDownloadingPdf(false);
    };

    const theme = getThemeSync();
    const styles = themeStyles[theme] || themeStyles.classic;

    if (isLoading || !order) {
        return (
            <>
                <Navbar />
                <CartSidebar />
                <main className={`pt-6 lg:pt-10 pb-20 min-h-screen ${styles.pageBg} ${styles.bodyText}`}>
                    <Container>
                        {!isLoading && !order ? (
                            <div className="text-center py-24">
                                <p className="text-text-secondary mb-6 text-lg">Order not found.</p>
                                <Link href="/account" className={`btn-primary text-sm py-3 ${styles.buttonClass}`}>
                                    Back to My Orders
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Back link shimmer */}
                                <div className="w-32 h-4 rounded shimmer-bg" />

                                {/* Header shimmer */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="w-24 h-3 rounded shimmer-bg" />
                                        <div className="w-48 h-8 rounded shimmer-bg" />
                                        <div className="w-36 h-4 rounded shimmer-bg" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-24 h-8 rounded-full shimmer-bg" />
                                        <div className="w-24 h-8 rounded-full shimmer-bg" />
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Left main content shimmer */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Progress Shimmer */}
                                        <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6 sm:p-8 space-y-4`}>
                                            <div className="w-32 h-6 rounded shimmer-bg" />
                                            <div className="h-16 w-full rounded shimmer-bg" />
                                        </div>

                                        {/* Items Shimmer */}
                                        <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6 sm:p-8 space-y-4`}>
                                            <div className="flex justify-between items-center">
                                                <div className="w-36 h-6 rounded shimmer-bg" />
                                                <div className="w-24 h-8 rounded shimmer-bg" />
                                            </div>
                                            <div className="divide-y divide-border">
                                                {[...Array(2)].map((_, i) => (
                                                    <div key={i} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
                                                        <div className="w-16 h-20 rounded-lg shimmer-bg flex-shrink-0" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="w-1/2 h-4 rounded shimmer-bg" />
                                                            <div className="w-1/4 h-3 rounded shimmer-bg" />
                                                            <div className="w-1/3 h-4 rounded shimmer-bg" />
                                                        </div>
                                                        <div className="w-20 h-8 rounded shimmer-bg flex-shrink-0" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right sidebar shimmer */}
                                    <div className="space-y-6">
                                        <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6 space-y-4`}>
                                            <div className="w-28 h-5 rounded shimmer-bg" />
                                            <div className="space-y-3">
                                                <div className="flex justify-between"><div className="w-16 h-4 rounded shimmer-bg" /><div className="w-12 h-4 rounded shimmer-bg" /></div>
                                                <div className="flex justify-between"><div className="w-16 h-4 rounded shimmer-bg" /><div className="w-12 h-4 rounded shimmer-bg" /></div>
                                                <div className="flex justify-between pt-3 border-t border-border"><div className="w-16 h-4 rounded shimmer-bg" /><div className="w-16 h-6 rounded shimmer-bg" /></div>
                                            </div>
                                        </div>
                                        <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6 space-y-4`}>
                                            <div className="w-20 h-5 rounded shimmer-bg" />
                                            <div className="space-y-3">
                                                <div className="flex justify-between"><div className="w-12 h-4 rounded shimmer-bg" /><div className="w-16 h-4 rounded shimmer-bg" /></div>
                                                <div className="flex justify-between"><div className="w-12 h-4 rounded shimmer-bg" /><div className="w-20 h-4 rounded shimmer-bg" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    const orderStatus = orderStatusConfig[order.status];
    const paymentStatus = paymentStatusConfig[order.paymentStatus];

    let derivedTrackingNumber = "SH-9283749";
    if (order.trackingUrl) {
        try {
            const url = new URL(order.trackingUrl);
            derivedTrackingNumber = url.searchParams.get("tracking") || url.searchParams.get("id") || url.pathname.split("/").pop() || order.trackingUrl;
        } catch {
            derivedTrackingNumber = order.trackingUrl.split("/").pop() || order.trackingUrl;
        }
    }

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className={`pt-6 lg:pt-10 pb-20 min-h-screen ${styles.pageBg} ${styles.bodyText}`}>
                <Container>
                    {/* Back Link */}
                    <div className="mb-8">
                        <Link
                            href="/account"
                            className={`inline-flex items-center gap-2 text-text-secondary hover:${styles.accentText} transition-colors text-sm`}
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
                            <p className={`text-accent ${styles.accentText} text-xs tracking-[0.3em] uppercase mb-2 font-medium`}>Order Details</p>
                            <h1 className={`${styles.fontFamily} text-3xl lg:text-4xl text-foreground`}>#{order.order_number}</h1>
                            <p className="text-text-secondary text-sm mt-1">
                                Placed on{" "}
                                {new Date(order.date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleWhatsAppReorder}
                                className={`inline-flex items-center justify-center gap-2 border px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${styles.secondaryButtonClass || "border-border hover:bg-background-secondary text-foreground"}`}
                            >
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Reorder on WhatsApp
                            </button>
                            <button
                                onClick={handleDownloadInvoice}
                                disabled={isDownloadingPdf}
                                className={`inline-flex items-center justify-center gap-2 border px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${styles.secondaryButtonClass || "border-border hover:bg-background-secondary text-foreground"}`}
                            >
                                {isDownloadingPdf ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Downloading...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Download Invoice</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Status Timeline */}
                            <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6 sm:p-8`}>
                                <h2 className={`${styles.fontFamily} text-lg text-foreground mb-6`}>Order Progress</h2>
                                <OrderTimeline currentStatus={order.status} />
                            </div>

                            {/* Tracking info */}
                            {order.trackingUrl && (
                                <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6 sm:p-8`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
                                                Tracking Details
                                            </h2>
                                            <p className="text-text-secondary text-xs">
                                                Shipped via partner courier
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center gap-2 bg-white/80 border ${styles.accentBorder} px-3 py-2 rounded-lg w-fit`}>
                                                <span className="text-xs text-text-secondary">Tracking ID:</span>
                                                <span className="text-xs font-semibold text-foreground">{derivedTrackingNumber}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(derivedTrackingNumber);
                                                        setCopiedTracking(true);
                                                        setTimeout(() => setCopiedTracking(false), 2000);
                                                    }}
                                                    className={`text-[10px] text-accent ${styles.accentText} font-semibold uppercase hover:underline ml-2 flex items-center gap-1`}
                                                >
                                                    {copiedTracking ? (
                                                        <span className="text-green-600 font-medium">Copied!</span>
                                                    ) : (
                                                        <span>Copy</span>
                                                    )}
                                                </button>
                                            </div>

                                            <a
                                                href={order.trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-2 btn-primary ${styles.buttonClass} text-sm py-2.5 px-5`}
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
                            <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6 sm:p-8`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={`${styles.fontFamily} text-lg text-foreground`}>
                                        Items Ordered ({order.items.length})
                                    </h2>
                                    {order.status !== "cancelled" && (
                                        <button
                                            onClick={handleReorderAll}
                                            disabled={reorderedAll}
                                            className={`text-xs text-accent ${styles.accentText} font-semibold uppercase tracking-wider hover:underline flex items-center gap-1.5`}
                                        >
                                            {reorderedAll ? (
                                                <span className="text-green-600">✓ Added All To Cart</span>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add All to Cart
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="divide-y divide-border">
                                    {order.items.map((item) => {
                                        const uniqueKey = item.variant_id || item.product_id || item.id;
                                        const isReordered = reorderedItems.has(uniqueKey);
                                        return (
                                            <div key={item.id} className="flex items-start gap-4 sm:gap-6 py-6 first:pt-0 last:pb-0">
                                                <div className={`w-16 h-20 relative flex-shrink-0 rounded-lg overflow-hidden bg-background-secondary border ${styles.accentBorder}`}>
                                                    <Image
                                                        src={getThumbnailUrl(item.image_url) || "/placeholder-image.jpg"}
                                                        alt={item.product_name}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-foreground font-medium text-sm sm:text-base truncate">
                                                        {item.product_name}
                                                    </h3>
                                                    {item.selected_options_json && (
                                                        <p className="text-text-secondary text-xs mt-1">
                                                            {formatOptionSummary(item.selected_options_json as any)}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-foreground font-medium text-sm">
                                                            {formatPrice(item.price_per_unit)}
                                                        </span>
                                                        <span className="text-text-secondary text-xs">
                                                            × {item.quantity_or_meters} {item.selling_mode === "meter" ? "m" : "pcs"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-foreground font-semibold text-sm">
                                                        {formatPrice(item.price_per_unit * item.quantity_or_meters)}
                                                    </span>
                                                    {order.status !== "cancelled" && (
                                                        <button
                                                            onClick={() => handleReorderItem(item)}
                                                            disabled={isReordered}
                                                            className={`text-xs border px-3 py-1.5 rounded-lg font-medium transition-all ${
                                                                isReordered
                                                                    ? "bg-green-50 border-green-200 text-green-700"
                                                                    : `border-border text-text-secondary hover:${styles.accentText} hover:border-current`
                                                            }`}
                                                        >
                                                            {isReordered ? "Added" : "Reorder"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* Price Breakdown */}
                            <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6`}>
                                <h2 className={`${styles.fontFamily} text-lg text-foreground mb-5`}>Price Breakdown</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm text-text-secondary">
                                        <span>Subtotal</span>
                                        <span className="text-foreground font-medium">{formatPrice(order.total - order.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-text-secondary">
                                        <span>Shipping</span>
                                        <span className="text-foreground font-medium">
                                            {order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
                                        </span>
                                    </div>
                                    <div className={`pt-3 border-t ${styles.accentBorder} flex justify-between`}>
                                        <span className="text-foreground font-semibold">Total</span>
                                        <span className={`${styles.fontFamily} text-xl text-foreground`}>{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6`}>
                                <h2 className={`${styles.fontFamily} text-lg text-foreground mb-4`}>Payment</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
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
                            <div className={`${styles.cardBg} rounded-2xl border ${styles.accentBorder} p-6`}>
                                <h2 className={`${styles.fontFamily} text-lg text-foreground mb-4`}>Delivery Details</h2>
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
                            <div className={`${styles.bannerBg} rounded-2xl p-6 border ${styles.accentBorder}`}>
                                <h2 className={`${styles.fontFamily} text-base text-foreground mb-2`}>Need Help?</h2>
                                <p className="text-text-secondary text-xs mb-4">
                                    For any queries regarding this order, contact us on WhatsApp with your order ID.
                                </p>
                                <a
                                    href={getWhatsAppUrl(`Hi, I have a query about Order #${order.order_number}`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 text-sm ${styles.accentText} font-medium hover:underline transition-colors`}
                                    onClick={() => trackWhatsAppClick({
                                        location: "account_order_support_query",
                                        orderNumber: order.order_number,
                                    })}
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
