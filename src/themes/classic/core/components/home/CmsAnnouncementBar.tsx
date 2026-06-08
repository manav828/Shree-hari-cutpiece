"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CmsBanner } from "@/lib/cms";

type Props = {
    banners: CmsBanner[];
};

export default function CmsAnnouncementBar({ banners }: Props) {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const themeMaroon = "#7C1D2D";

    const active = useMemo(() => banners.slice(0, 3), [banners]);
    const current = active[currentIndex] ?? active[0];
    const bannerBgColor = current?.bg_color?.trim();
    const normalizedBg = bannerBgColor?.toLowerCase() === "#111827" ? themeMaroon : (bannerBgColor || themeMaroon);
    const normalizedText = current?.text_color?.trim() || "#FFFFFF";

    useEffect(() => {
        if (active.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % active.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [active.length]);

    if (!isVisible || active.length === 0 || !current) return null;

    return (
        <div
            className="relative overflow-hidden"
            style={{
                backgroundColor: normalizedBg,
                color: normalizedText,
            }}
        >
            <div className="container-premium py-3 flex items-center justify-center gap-4 text-sm pr-12">
                <Link
                    href={current.link_url || "/shop"}
                    className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <span>{current.content_text || current.title}</span>
                </Link>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-black/20 hover:bg-black/30"
                aria-label="Close banner"
            >
                x
            </button>

            {active.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex">
                    {active.map((banner, idx) => (
                        <div
                            key={banner.id}
                            className={`h-0.5 flex-1 transition-all duration-300 ${
                                idx === currentIndex ? "bg-white" : "bg-white/35"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
