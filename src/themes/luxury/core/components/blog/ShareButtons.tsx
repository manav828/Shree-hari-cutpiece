"use client";

import { useEffect, useMemo, useState } from "react";

type ShareButtonLabels = {
    nativeShare: string;
    whatsapp: string;
    facebook: string;
    copy: string;
    copied: string;
    copyPrompt: string;
};

const defaultLabels: ShareButtonLabels = {
    nativeShare: "Share",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    copy: "Copy for Instagram",
    copied: "Copied",
    copyPrompt: "Copy this link",
};

type ShareButtonsProps = {
    title: string;
    url: string;
    labels?: Partial<ShareButtonLabels>;
};

export default function ShareButtons({ title, url, labels }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);
    const mergedLabels = { ...defaultLabels, ...labels };

    useEffect(() => {
        setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    }, []);

    const links = useMemo(() => {
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(`${title} ${url}`);
        return {
            whatsapp: `https://wa.me/?text=${encodedText}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        };
    }, [title, url]);

    const handleCopy = async () => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                window.prompt(mergedLabels.copyPrompt, url);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const handleNativeShare = async () => {
        try {
            await navigator.share({ title, url });
        } catch {
            // User canceled or share unavailable.
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {canNativeShare && (
                <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-foreground hover:text-white transition-colors"
                >
                    {mergedLabels.nativeShare}
                </button>
            )}
            <a
                href={links.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-foreground hover:text-white transition-colors"
            >
                {mergedLabels.whatsapp}
            </a>
            <a
                href={links.facebook}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-foreground hover:text-white transition-colors"
            >
                {mergedLabels.facebook}
            </a>
            <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-foreground hover:text-white transition-colors"
            >
                {copied ? mergedLabels.copied : mergedLabels.copy}
            </button>
        </div>
    );
}
