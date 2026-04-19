import { brand } from "@/lib/brand";
import { getSiteUrl } from "@/lib/siteUrl";
import { toAbsoluteUrl } from "@/lib/seo";

type JsonLd = Record<string, unknown>;

type WebPageSchemaOptions = {
    path: string;
    title: string;
    description: string;
    type?: string;
};

type ArticleSchemaOptions = {
    path: string;
    headline: string;
    description: string;
    image?: string | null;
    datePublished?: string | null;
    dateModified?: string | null;
    authorName?: string | null;
    inLanguage?: string;
};

type ProductSchemaOptions = {
    path: string;
    name: string;
    description: string;
    category?: string | null;
    images?: string[];
    sku?: string | null;
    price?: number | null;
    availability?: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
    currency?: string;
};

type BreadcrumbItem = {
    name: string;
    path: string;
};

function parsePostalCode(addressLines: string[]): string | undefined {
    const fullAddress = addressLines.join(" ");
    const match = fullAddress.match(/\b\d{6}\b/);
    return match?.[0];
}

export function buildOrganizationSchema(): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: brand.name,
        url: getSiteUrl(),
        email: brand.email,
        telephone: brand.phoneDisplay,
        sameAs: [brand.instagramUrl, brand.mapsUrl],
        address: {
            "@type": "PostalAddress",
            streetAddress: `${brand.addressLines[0]}, ${brand.addressLines[1]}`,
            addressLocality: brand.city,
            addressRegion: brand.state,
            postalCode: parsePostalCode(brand.addressLines),
            addressCountry: "IN",
        },
    };
}

export function buildLocalBusinessSchema(): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        name: brand.name,
        url: getSiteUrl(),
        email: brand.email,
        telephone: brand.phoneDisplay,
        image: `${getSiteUrl()}/logo.png`,
        address: {
            "@type": "PostalAddress",
            streetAddress: `${brand.addressLines[0]}, ${brand.addressLines[1]}`,
            addressLocality: brand.city,
            addressRegion: brand.state,
            postalCode: parsePostalCode(brand.addressLines),
            addressCountry: "IN",
        },
        openingHours: [brand.storeHoursWeekday, brand.storeHoursWeekend],
        sameAs: [brand.instagramUrl, brand.mapsUrl],
    };
}

export function buildWebSiteSchema(): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: brand.name,
        alternateName: brand.shortName,
        url: getSiteUrl(),
    };
}

export function buildWebPageSchema(options: WebPageSchemaOptions): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": options.type || "WebPage",
        name: options.title,
        description: options.description,
        url: toAbsoluteUrl(options.path),
        isPartOf: {
            "@type": "WebSite",
            name: brand.name,
            url: getSiteUrl(),
        },
    };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: toAbsoluteUrl(item.path),
        })),
    };
}

export function buildArticleSchema(options: ArticleSchemaOptions): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: options.headline,
        description: options.description,
        image: options.image ? [toAbsoluteUrl(options.image)] : undefined,
        datePublished: options.datePublished || undefined,
        dateModified: options.dateModified || options.datePublished || undefined,
        author: options.authorName
            ? {
                "@type": "Person",
                name: options.authorName,
            }
            : {
                "@type": "Organization",
                name: brand.name,
            },
        publisher: {
            "@type": "Organization",
            name: brand.name,
            url: getSiteUrl(),
        },
        inLanguage: options.inLanguage || "en",
        mainEntityOfPage: toAbsoluteUrl(options.path),
    };
}

export function buildProductSchema(options: ProductSchemaOptions): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: options.name,
        description: options.description,
        category: options.category || undefined,
        image: options.images && options.images.length > 0
            ? options.images.map((image) => toAbsoluteUrl(image))
            : undefined,
        sku: options.sku || undefined,
        brand: {
            "@type": "Brand",
            name: brand.name,
        },
        offers: typeof options.price === "number"
            ? {
                "@type": "Offer",
                priceCurrency: options.currency || "INR",
                price: options.price,
                availability: options.availability || "https://schema.org/InStock",
                url: toAbsoluteUrl(options.path),
            }
            : undefined,
    };
}