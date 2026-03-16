"use client";

// OrderStatusBadge — supports both built-in and custom-colored statuses

interface Props {
    status: string;
    customColor?: string; // hex color e.g. "#6366f1" for custom statuses
    size?: "sm" | "md";
}

// Fallback config for known statuses (used when no custom color is provided)
const BUILTIN: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    pending:    { label: "Pending",    bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-400"  },
    confirmed:  { label: "Confirmed",  bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-400"   },
    processing: { label: "Processing", bg: "bg-indigo-50",  text: "text-indigo-700", dot: "bg-indigo-400" },
    packed:     { label: "Packed",     bg: "bg-purple-50",  text: "text-purple-700", dot: "bg-purple-400" },
    shipped:    { label: "Shipped",    bg: "bg-teal-50",    text: "text-teal-700",   dot: "bg-teal-400"   },
    delivered:  { label: "Delivered",  bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-400"  },
    cancelled:  { label: "Cancelled",  bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-400"    },
    refunded:   { label: "Refunded",   bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"   },
    returning:  { label: "Returning",  bg: "bg-orange-50",  text: "text-orange-700", dot: "bg-orange-400" },
    returned:   { label: "Returned",   bg: "bg-gray-50",    text: "text-gray-700",   dot: "bg-gray-400"   },
    replacing:  { label: "Replacing",  bg: "bg-indigo-50",  text: "text-indigo-700", dot: "bg-indigo-400" },
    replaced:   { label: "Replaced",   bg: "bg-teal-50",    text: "text-teal-700",   dot: "bg-teal-400"   },
    "in progress": { label: "In Progress", bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400" },
};

function hexToRgba(hex: string, alpha: number) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

export default function OrderStatusBadge({ status, customColor, size = "sm" }: Props) {
    const px = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";
    const txt = size === "sm" ? "text-[11px]" : "text-xs";

    // If a custom color is provided, use inline styles
    if (customColor) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${txt}`}
                style={{
                    backgroundColor: hexToRgba(customColor, 0.12),
                    color: customColor,
                }}
            >
                <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: customColor }}
                />
                {status}
            </span>
        );
    }

    // Fallback to built-in Tailwind classes
    const key = status.toLowerCase();
    const cfg = BUILTIN[key] ?? {
        label: status,
        bg: "bg-gray-100",
        text: "text-gray-600",
        dot: "bg-gray-400",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${txt} ${cfg.bg} ${cfg.text}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}
