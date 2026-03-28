import Image from "next/image";
import Link from "next/link";

type BuilderSection = {
    id?: string;
    type: string;
    visible?: boolean;
    background_color?: string;
    padding_top?: number;
    padding_bottom?: number;
    content?: Record<string, unknown>;
};

type BuilderLayout = {
    sections?: BuilderSection[];
};

type BlogRendererProps = {
    layout: BuilderLayout | null;
};

function asString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    return null;
}

function renderHtml(html: string) {
    if (!html.trim()) return null;
    return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderSection(section: BuilderSection) {
    const content = section.content ?? {};

    switch (section.type) {
        case "heading": {
            const heading = asString(content.heading);
            const subheading = asString(content.subheading);
            return (
                <div className="space-y-2 text-center">
                    {heading && <h2 className="text-3xl md:text-4xl font-serif text-foreground">{heading}</h2>}
                    {subheading && <p className="text-text-secondary text-lg">{subheading}</p>}
                </div>
            );
        }
        case "rich_text": {
            return renderHtml(asString(content.html));
        }
        case "single_image": {
            const imageUrl = asString(content.image_url);
            const alt = asString(content.alt_text) || "Blog image";
            const linkUrl = asString(content.link_url);
            const image = imageUrl ? (
                <div className="relative w-full overflow-hidden rounded-lg bg-background-secondary" style={{ aspectRatio: "16 / 9" }}>
                    <Image src={imageUrl} alt={alt} fill className="object-cover" />
                </div>
            ) : null;
            if (linkUrl && image) {
                return <Link href={linkUrl}>{image}</Link>;
            }
            return image;
        }
        case "image_caption": {
            const imageUrl = asString(content.image_url);
            const alt = asString(content.alt_text) || "Blog image";
            const caption = asString(content.caption_html);
            return (
                <figure className="space-y-3">
                    {imageUrl && (
                        <div className="relative w-full overflow-hidden rounded-lg bg-background-secondary" style={{ aspectRatio: "16 / 9" }}>
                            <Image src={imageUrl} alt={alt} fill className="object-cover" />
                        </div>
                    )}
                    {caption && <figcaption className="text-sm text-text-secondary" dangerouslySetInnerHTML={{ __html: caption }} />}
                </figure>
            );
        }
        case "two_column": {
            const imageUrl = asString(content.image_url);
            const alt = asString(content.alt_text) || "Blog image";
            const textHtml = asString(content.text_html);
            const imagePosition = asString(content.image_position) || "right";
            const isImageLeft = imagePosition === "left";
            const imageBlock = imageUrl ? (
                <div className="relative w-full overflow-hidden rounded-lg bg-background-secondary" style={{ aspectRatio: "4 / 3" }}>
                    <Image src={imageUrl} alt={alt} fill className="object-cover" />
                </div>
            ) : null;
            const textBlock = renderHtml(textHtml);

            return (
                <div className={`flex flex-col gap-6 md:flex-row ${isImageLeft ? "md:flex-row-reverse" : ""}`}>
                    <div>{textBlock}</div>
                    <div>{imageBlock}</div>
                </div>
            );
        }
        case "quote": {
            const quote = asString(content.quote);
            const author = asString(content.author);
            const role = asString(content.role);
            return (
                <blockquote className="rounded-xl border border-border bg-background-secondary px-6 py-6 text-center">
                    {quote && <p className="text-xl md:text-2xl font-serif text-foreground">“{quote}”</p>}
                    {(author || role) && (
                        <p className="mt-4 text-sm text-text-secondary">
                            {author}{author && role ? " · " : ""}{role}
                        </p>
                    )}
                </blockquote>
            );
        }
        case "cta": {
            const headline = asString(content.headline);
            const body = asString(content.body);
            const buttonLabel = asString(content.button_label);
            const buttonUrl = asString(content.button_url);
            const buttonColor = asString(content.button_color) || "#111827";
            return (
                <div className="rounded-2xl border border-border bg-background-secondary px-6 py-8 text-center space-y-4">
                    {headline && <h3 className="text-2xl md:text-3xl font-serif text-foreground">{headline}</h3>}
                    {body && <p className="text-text-secondary">{body}</p>}
                    {buttonLabel && buttonUrl && (
                        <Link
                            href={buttonUrl}
                            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white"
                            style={{ backgroundColor: buttonColor }}
                        >
                            {buttonLabel}
                        </Link>
                    )}
                </div>
            );
        }
        case "spacer": {
            const height = asNumber(content.height) ?? 24;
            const showDivider = Boolean(content.show_divider);
            return (
                <div className="flex items-center" style={{ height }}>
                    {showDivider && <div className="h-px w-full bg-border" />}
                </div>
            );
        }
        case "embed": {
            const embedUrl = asString(content.embed_url);
            if (!embedUrl) return null;
            return (
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
                    <iframe
                        src={embedUrl}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embedded media"
                    />
                </div>
            );
        }
        case "faq": {
            const items = Array.isArray(content.items) ? content.items : [];
            return (
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="rounded-lg border border-border px-4 py-3">
                            <p className="font-semibold text-foreground">{asString(item.question)}</p>
                            <p className="mt-2 text-text-secondary">{asString(item.answer)}</p>
                        </div>
                    ))}
                </div>
            );
        }
        case "image_gallery": {
            const columns = asNumber(content.columns) ?? 3;
            const images = Array.isArray(content.images) ? content.images : [];
            const columnClass = columns <= 2
                ? "sm:grid-cols-2"
                : columns === 3
                    ? "sm:grid-cols-2 md:grid-cols-3"
                    : "sm:grid-cols-2 md:grid-cols-4";
            return (
                <div className={`grid gap-4 ${columnClass}`}>
                    {images.map((img, index) => {
                        const imageUrl = asString(img.image_url);
                        const alt = asString(img.alt_text) || "Gallery image";
                        if (!imageUrl) return null;
                        return (
                            <div key={index} className="relative w-full overflow-hidden rounded-lg bg-background-secondary" style={{ aspectRatio: "4 / 3" }}>
                                <Image src={imageUrl} alt={alt} fill className="object-cover" />
                            </div>
                        );
                    })}
                </div>
            );
        }
        case "table": {
            const headers = Array.isArray(content.headers) ? content.headers : [];
            const rows = Array.isArray(content.rows) ? content.rows : [];
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-border text-sm">
                        {headers.length > 0 && (
                            <thead className="bg-background-secondary">
                                <tr>
                                    {headers.map((header, index) => (
                                        <th key={index} className="border border-border px-3 py-2 text-left font-semibold">
                                            {asString(header)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    {(Array.isArray(row) ? row : []).map((cell, cellIndex) => (
                                        <td key={cellIndex} className="border border-border px-3 py-2">
                                            {asString(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        case "product_card": {
            const skuIds = Array.isArray(content.sku_ids) ? content.sku_ids : [];
            return (
                <div className="rounded-xl border border-border bg-background-secondary px-4 py-4">
                    <p className="text-sm font-semibold text-foreground">Featured Products</p>
                    {skuIds.length === 0 ? (
                        <p className="mt-2 text-sm text-text-secondary">No products selected.</p>
                    ) : (
                        <ul className="mt-2 list-disc pl-5 text-sm text-text-secondary">
                            {skuIds.map((sku) => (
                                <li key={sku}>{asString(sku)}</li>
                            ))}
                        </ul>
                    )}
                </div>
            );
        }
        case "collection_highlight": {
            const title = asString(content.title);
            const collectionId = asString(content.collection_id);
            return (
                <div className="rounded-xl border border-border bg-background-secondary px-4 py-4">
                    <p className="text-sm font-semibold text-foreground">{title || "Collection Highlight"}</p>
                    {collectionId && <p className="mt-2 text-sm text-text-secondary">Collection ID: {collectionId}</p>}
                </div>
            );
        }
        case "offer_banner": {
            const text = asString(content.text);
            const discount = asString(content.discount);
            const ctaLabel = asString(content.cta_label);
            const ctaUrl = asString(content.cta_url);
            return (
                <div className="rounded-xl border border-border bg-amber-50 px-5 py-4 text-center">
                    <p className="text-sm font-semibold text-foreground">{text}</p>
                    {discount && <p className="mt-1 text-2xl font-serif text-foreground">{discount}</p>}
                    {ctaLabel && ctaUrl && (
                        <Link href={ctaUrl} className="mt-3 inline-flex rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white">
                            {ctaLabel}
                        </Link>
                    )}
                </div>
            );
        }
        case "fabric_spec_table": {
            const gsm = asString(content.gsm);
            const width = asString(content.width);
            const material = asString(content.material);
            const washCare = asString(content.wash_care);
            return (
                <div className="rounded-xl border border-border bg-background-secondary px-4 py-4">
                    <p className="text-sm font-semibold text-foreground">Fabric Specifications</p>
                    <div className="mt-3 grid gap-2 text-sm text-text-secondary">
                        {gsm && <p>GSM: {gsm}</p>}
                        {width && <p>Width: {width}</p>}
                        {material && <p>Material: {material}</p>}
                        {washCare && <p>Wash Care: {washCare}</p>}
                    </div>
                </div>
            );
        }
        case "custom_code": {
            const html = asString(content.html);
            const css = asString(content.css);
            const js = asString(content.js);
            return (
                <div className="space-y-4">
                    {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
                    {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
                    {js && <script dangerouslySetInnerHTML={{ __html: js }} />}
                </div>
            );
        }
        default:
            return null;
    }
}

export default function BlogRenderer({ layout }: BlogRendererProps) {
    const sections = Array.isArray(layout?.sections) ? layout?.sections ?? [] : [];

    if (sections.length === 0) {
        return <p className="text-text-secondary">No content available.</p>;
    }

    return (
        <div className="space-y-10">
            {sections.map((section, index) => {
                if (section.visible === false) return null;
                const backgroundColor = asString(section.background_color);
                const paddingTop = asNumber(section.padding_top);
                const paddingBottom = asNumber(section.padding_bottom);
                const style: Record<string, string> = {};
                if (backgroundColor) style.backgroundColor = backgroundColor;
                if (paddingTop !== null) style.paddingTop = `${paddingTop}px`;
                if (paddingBottom !== null) style.paddingBottom = `${paddingBottom}px`;

                return (
                    <section key={section.id ?? `${section.type}-${index}`} className="rounded-2xl" style={style}>
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            {renderSection(section)}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
