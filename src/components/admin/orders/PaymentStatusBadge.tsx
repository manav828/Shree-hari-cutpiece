import type { PaymentStatus } from "@/types/orders";

interface Props {
    status: PaymentStatus;
    size?: "sm" | "md";
}

const CONFIG: Record<
    PaymentStatus,
    { label: string; bg: string; text: string; dot: string }
> = {
    pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    paid: { label: "Paid", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    failed: { label: "Failed", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
    refunded: { label: "Refunded", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
    partially_refunded: { label: "Part. Refunded", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
};

export default function PaymentStatusBadge({ status, size = "sm" }: Props) {
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
