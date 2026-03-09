import type { OrderStatus } from "@/types/orders";

interface Props {
    status: OrderStatus;
    size?: "sm" | "md";
}

const CONFIG: Record<
    OrderStatus,
    { label: string; bg: string; text: string; dot: string }
> = {
    pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    confirmed: { label: "Confirmed", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    processing: { label: "Processing", bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400" },
    packed: { label: "Packed", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
    shipped: { label: "Shipped", bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
    delivered: { label: "Delivered", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
    cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
    refunded: { label: "Refunded", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
};

export default function OrderStatusBadge({ status, size = "sm" }: Props) {
    const cfg = CONFIG[status] ?? CONFIG.pending;
    const px = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";
    const txt = size === "sm" ? "text-[11px]" : "text-xs";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${txt} ${cfg.bg} ${cfg.text}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}
