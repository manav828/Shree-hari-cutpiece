import "server-only";

export function getSiteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    if (explicit) return explicit.replace(/\/$/, "");

    const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (productionUrl) return `https://${productionUrl}`;

    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) return `https://${vercelUrl}`;

    return "http://localhost:3000";
}
