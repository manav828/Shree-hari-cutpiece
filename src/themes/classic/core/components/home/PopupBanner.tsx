"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
    title: string;
    contentText: string;
    imageUrl: string;
    linkUrl: string;
    bgColor: string;
    textColor: string;
};

const STORAGE_KEY = "cms_popup_shown";

export default function PopupBanner({ title, contentText, imageUrl, linkUrl, bgColor, textColor }: Props) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.sessionStorage.getItem(STORAGE_KEY) === "1") return;

        const timer = window.setTimeout(() => {
            setVisible(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const close = () => {
        setVisible(false);
        if (typeof window !== "undefined") {
            window.sessionStorage.setItem(STORAGE_KEY, "1");
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: bgColor, color: textColor }}>
                {imageUrl ? (
                    // Using img here because CMS banners can come from arbitrary domains not guaranteed in next/image allowlist.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={title} className="w-full h-48 object-cover" loading="lazy" decoding="async" />
                ) : null}
                <div className="p-5">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm opacity-90">{contentText}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <Link href={linkUrl || "/shop"} className="px-3 py-2 rounded-md text-sm font-medium bg-black/20 hover:bg-black/30">
                            View Offer
                        </Link>
                        <button onClick={close} className="px-3 py-2 rounded-md text-sm font-medium bg-black/20 hover:bg-black/30">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
