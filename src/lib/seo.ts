import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

type OpenGraphType = "website" | "article";

type BuildPageMetadataOptions = {
    title: string;
    description: string;
    path: string;
    alternates?: Record<string, string>;
    keywords?: string[];
    image?: string;
    robots?: Metadata["robots"];
    type?: OpenGraphType;
};

export function toAbsoluteUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getSiteUrl()}${normalizedPath}`;
}

export function buildPageMetadata(options: BuildPageMetadataOptions): Metadata {
    const canonical = toAbsoluteUrl(options.path);
    const alternateLanguages = options.alternates
        ? Object.fromEntries(
            Object.entries(options.alternates).map(([locale, path]) => [locale, toAbsoluteUrl(path)])
        )
        : undefined;
    const shareImage = options.image ? toAbsoluteUrl(options.image) : undefined;

    return {
        metadataBase: new URL(getSiteUrl()),
        title: options.title,
        description: options.description,
        keywords: options.keywords,
        alternates: {
            canonical,
            languages: alternateLanguages,
        },
        robots: options.robots,
        openGraph: {
            type: options.type || "website",
            title: options.title,
            description: options.description,
            url: canonical,
            siteName: "Shree Hari Cutpiece",
            images: shareImage ? [{ url: shareImage }] : undefined,
        },
        twitter: {
            card: shareImage ? "summary_large_image" : "summary",
            title: options.title,
            description: options.description,
            images: shareImage ? [shareImage] : undefined,
        },
    };
}