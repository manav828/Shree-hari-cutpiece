"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { OrderItem } from "@/types/orders";

interface Props {
    items: OrderItem[];
    threshold?: number;
}

function formatQty(item: OrderItem): string {
    return item.selling_mode === "meter"
        ? `${item.quantity_or_meters}m`
        : `×${item.quantity_or_meters}`;
}

function formatPrice(n: number): string {
    return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatOptions(item: OrderItem): string | null {
    const opts = item.selected_options_json || [];
    if (!opts.length) return null;
    const parts = opts
        .map((opt) => {
            const value = opt.value_labels?.join(", ") || opt.input_value;
            if (!value) return null;
            return `${opt.group_name}: ${value}`;
        })
        .filter(Boolean) as string[];
    return parts.length ? parts.join(" | ") : null;
}

function ItemRow({ item }: { item: OrderItem }) {
    const optionsText = formatOptions(item);
    return (
        <div className="flex items-start gap-1.5 text-[12px]">
            <span className="text-gray-700 flex-1 leading-5">
                <span className="line-clamp-1">
                    {item.product_name}
                    {item.color_name && (
                        <span className="text-gray-400"> · {item.color_name}</span>
                    )}
                </span>
                {optionsText && (
                    <span className="block text-[11px] text-gray-400 mt-0.5">
                        {optionsText}
                    </span>
                )}
            </span>
            <span className="text-gray-500 flex-shrink-0 ml-1">{formatQty(item)}</span>
            <span className="text-gray-700 font-medium flex-shrink-0 ml-1 min-w-[50px] text-right">
                {formatPrice(item.total_price)}
            </span>
        </div>
    );
}

export default function CollapsibleProducts({ items, threshold = 2 }: Props) {
    const [expanded, setExpanded] = useState(false);

    if (!items || items.length === 0) {
        return <span className="text-gray-400 text-xs italic">No items</span>;
    }

    const visible = items.slice(0, threshold);
    const hidden = items.slice(threshold);
    const hasMore = hidden.length > 0;

    return (
        <div className="space-y-1">
            {visible.map((item) => (
                <ItemRow key={item.id} item={item} />
            ))}

            {hasMore && expanded && (
                <div className="space-y-1 pt-0.5 border-t border-dashed border-gray-200 mt-1">
                    {hidden.map((item) => (
                        <ItemRow key={item.id} item={item} />
                    ))}
                </div>
            )}

            {hasMore && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((p) => !p);
                    }}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium mt-1 transition-colors"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="w-3 h-3" />
                            Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3 h-3" />
                            +{hidden.length} more {hidden.length === 1 ? "item" : "items"}
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
