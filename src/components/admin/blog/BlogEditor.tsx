"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getCodeIssuesForBlock, getCustomCodeBlocks } from "@/lib/blogCodeValidation";
import BlogMediaLibraryModal, { BlogMediaItem } from "@/components/admin/blog/BlogMediaLibraryModal";

const DEFAULT_LAYOUT = "{\n  \"sections\": []\n}";
const META_TITLE_LIMIT = 60;
const META_DESCRIPTION_LIMIT = 160;

type BuilderSection = {
    id: string;
    type: string;
    visible?: boolean;
    background_color?: string;
    padding_top?: number;
    padding_bottom?: number;
    content?: Record<string, unknown>;
};

type BuilderLayout = {
    sections: BuilderSection[];
};

const SECTION_LIBRARY: Array<{ id: string; label: string; template: Omit<BuilderSection, "id"> }> = [
    {
        id: "heading",
        label: "Heading + Subheading",
        template: {
            type: "heading",
            visible: true,
            background_color: "#ffffff",
            padding_top: 24,
            padding_bottom: 24,
            content: { heading: "Section heading", subheading: "Supporting copy" },
        },
    },
    {
        id: "rich_text",
        label: "Rich Text / Paragraph",
        template: {
            type: "rich_text",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { html: "<p>Add paragraph text here.</p>" },
        },
    },
    {
        id: "single_image",
        label: "Single Image",
        template: {
            type: "single_image",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { image_url: "", alt_text: "", link_url: "" },
        },
    },
    {
        id: "image_caption",
        label: "Image with Caption",
        template: {
            type: "image_caption",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { image_url: "", alt_text: "", caption_html: "" },
        },
    },
    {
        id: "two_column",
        label: "Two Column (Text + Image)",
        template: {
            type: "two_column",
            visible: true,
            background_color: "#ffffff",
            padding_top: 20,
            padding_bottom: 20,
            content: { image_url: "", alt_text: "", text_html: "", image_position: "right" },
        },
    },
    {
        id: "quote",
        label: "Quote / Testimonial",
        template: {
            type: "quote",
            visible: true,
            background_color: "#f8fafc",
            padding_top: 20,
            padding_bottom: 20,
            content: { quote: "", author: "", role: "" },
        },
    },
    {
        id: "cta",
        label: "Call to Action",
        template: {
            type: "cta",
            visible: true,
            background_color: "#f8fafc",
            padding_top: 20,
            padding_bottom: 20,
            content: { headline: "", body: "", button_label: "", button_url: "", button_color: "#111827" },
        },
    },
    {
        id: "spacer",
        label: "Spacer / Divider",
        template: {
            type: "spacer",
            visible: true,
            background_color: "#ffffff",
            padding_top: 12,
            padding_bottom: 12,
            content: { height: 24, show_divider: false },
        },
    },
    {
        id: "embed",
        label: "Embed (YouTube/Instagram)",
        template: {
            type: "embed",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { embed_url: "" },
        },
    },
    {
        id: "faq",
        label: "FAQ (Accordion)",
        template: {
            type: "faq",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { items: [{ question: "", answer: "" }] },
        },
    },
    {
        id: "gallery",
        label: "Image Gallery",
        template: {
            type: "image_gallery",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { columns: 3, images: [{ image_url: "", alt_text: "" }] },
        },
    },
    {
        id: "table",
        label: "Table",
        template: {
            type: "table",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { headers: [""], rows: [[""]] },
        },
    },
    {
        id: "custom_code",
        label: "Custom Code (HTML/CSS/JS)",
        template: {
            type: "custom_code",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { html: "", css: "", js: "" },
        },
    },
    {
        id: "product_card",
        label: "Product Card Embed",
        template: {
            type: "product_card",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { sku_ids: [] },
        },
    },
    {
        id: "collection_highlight",
        label: "Collection / Category Highlight",
        template: {
            type: "collection_highlight",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { collection_id: "", title: "" },
        },
    },
    {
        id: "offer_banner",
        label: "Offer / Price Banner",
        template: {
            type: "offer_banner",
            visible: true,
            background_color: "#fef3c7",
            padding_top: 12,
            padding_bottom: 12,
            content: { text: "", discount: "", cta_label: "", cta_url: "" },
        },
    },
    {
        id: "fabric_spec",
        label: "Fabric Specification Table",
        template: {
            type: "fabric_spec_table",
            visible: true,
            background_color: "#ffffff",
            padding_top: 16,
            padding_bottom: 16,
            content: { gsm: "", width: "", material: "", wash_care: "" },
        },
    },
];

type BlogCategory = {
    id: string;
    name: string;
    slug: string;
};

type BlogTag = {
    id: string;
    name: string;
    slug: string;
};

type BlogListPost = {
    id: string;
    title: string;
    language: "en" | "hi" | "other";
    variant_group_id: string;
};

type ProductOption = {
    id: string;
    name: string;
    slug: string | null;
};

type BlogPostPayload = {
    id?: string;
    variant_group_id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_media_id: string;
    category_id: string;
    language: "en" | "hi" | "other";
    author_name: string;
    editor_mode: "visual" | "full_code";
    builder_layout: string;
    full_page_html: string;
    full_page_css: string;
    full_page_js: string;
    custom_js_acknowledged: boolean;
    code_mode_locked: boolean;
    schema_markup_enabled: boolean;
    show_header: boolean;
    show_cover: boolean;
    show_share_buttons: boolean;
    show_related_products: boolean;
    related_products_title: string;
    seo_meta_title: string;
    seo_meta_description: string;
    seo_canonical_url: string;
    seo_og_title: string;
    seo_og_description: string;
    seo_og_image_media_id: string;
    seo_twitter_card_type: "summary" | "summary_large_image";
    seo_robots_directive: "index,follow" | "noindex,follow" | "noindex,nofollow";
    seo_keywords: string;
    status: "draft" | "scheduled" | "published" | "unpublished";
    scheduled_for: string;
};

type Props = {
    postId?: string;
};

function createEmptyPost(): BlogPostPayload {
    return {
        variant_group_id: "",
        title: "",
        slug: "",
        excerpt: "",
        cover_media_id: "",
        category_id: "",
        language: "en",
        author_name: "",
        editor_mode: "full_code",
        builder_layout: DEFAULT_LAYOUT,
        full_page_html: "",
        full_page_css: "",
        full_page_js: "",
        custom_js_acknowledged: false,
        code_mode_locked: false,
        schema_markup_enabled: true,
        show_header: true,
        show_cover: true,
        show_share_buttons: true,
        show_related_products: true,
        related_products_title: "Shop This Story",
        seo_meta_title: "",
        seo_meta_description: "",
        seo_canonical_url: "",
        seo_og_title: "",
        seo_og_description: "",
        seo_og_image_media_id: "",
        seo_twitter_card_type: "summary_large_image",
        seo_robots_directive: "index,follow",
        seo_keywords: "",
        status: "draft",
        scheduled_for: "",
    };
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

const IST_OFFSET_MINUTES = 330;

function toIstDateTimeInput(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const istDate = new Date(date.getTime() + IST_OFFSET_MINUTES * 60000);
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${istDate.getUTCFullYear()}-${pad(istDate.getUTCMonth() + 1)}-${pad(istDate.getUTCDate())}T${pad(istDate.getUTCHours())}:${pad(istDate.getUTCMinutes())}`;
}

function formatDate(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function toIsoDateTimeFromIst(value: string) {
    if (!value) return "";
    const [datePart, timePart] = value.split("T");
    if (!datePart || !timePart) return "";
    const [yearRaw, monthRaw, dayRaw] = datePart.split("-");
    const [hourRaw, minuteRaw] = timePart.split(":");
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    if ([year, month, day, hour, minute].some((val) => Number.isNaN(val))) return "";
    const utcMs = Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * 60000;
    return new Date(utcMs).toISOString();
}

function createSectionId() {
    return `section_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function normalizeLayout(raw: string): BuilderLayout {
    const parsed = JSON.parse(raw || DEFAULT_LAYOUT) as BuilderLayout;
    if (!parsed || !Array.isArray(parsed.sections)) {
        return { sections: [] };
    }
    return { sections: parsed.sections };
}

function serializeLayout(sections: BuilderSection[]): string {
    return JSON.stringify({ sections }, null, 2);
}

function sectionLabel(type: string): string {
    const match = SECTION_LIBRARY.find((item) => item.template.type === type);
    return match?.label ?? type;
}

type CodeLanguage = "html" | "css" | "js";

const JS_KEYWORDS = [
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "case",
    "break",
    "import",
    "from",
    "export",
    "class",
    "new",
    "try",
    "catch",
    "throw",
    "async",
    "await",
];

type CodeToken = {
    type: "code" | "string" | "comment";
    value: string;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

async function readJsonResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(text || "Unexpected response from server.");
    }
    return res.json() as Promise<T>;
}

function tokenizeCode(value: string): CodeToken[] {
    const tokens: CodeToken[] = [];
    let buffer = "";
    let state: "code" | "string" | "comment-line" | "comment-block" = "code";
    let quote = "";
    let escaped = false;

    for (let i = 0; i < value.length; i += 1) {
        const char = value[i];
        const next = value[i + 1];

        if (state === "code") {
            if (char === "/" && next === "/") {
                if (buffer) tokens.push({ type: "code", value: buffer });
                buffer = "//";
                state = "comment-line";
                i += 1;
                continue;
            }
            if (char === "/" && next === "*") {
                if (buffer) tokens.push({ type: "code", value: buffer });
                buffer = "/*";
                state = "comment-block";
                i += 1;
                continue;
            }
            if (char === "'" || char === "\"" || char === "`") {
                if (buffer) tokens.push({ type: "code", value: buffer });
                buffer = char;
                quote = char;
                state = "string";
                escaped = false;
                continue;
            }
            buffer += char;
            continue;
        }

        if (state === "string") {
            buffer += char;
            if (!escaped && char === quote) {
                tokens.push({ type: "string", value: buffer });
                buffer = "";
                state = "code";
            }
            escaped = !escaped && char === "\\";
            continue;
        }

        if (state === "comment-line") {
            buffer += char;
            if (char === "\n") {
                tokens.push({ type: "comment", value: buffer });
                buffer = "";
                state = "code";
            }
            continue;
        }

        if (state === "comment-block") {
            buffer += char;
            if (char === "*" && next === "/") {
                buffer += "/";
                tokens.push({ type: "comment", value: buffer });
                buffer = "";
                state = "code";
                i += 1;
            }
            continue;
        }
    }

    if (buffer) {
        const type = state === "code" ? "code" : state === "string" ? "string" : "comment";
        tokens.push({ type, value: buffer });
    }

    return tokens;
}

function highlightKeywords(value: string, keywords: string[]): string {
    if (keywords.length === 0) return value;
    const pattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    return value.replace(pattern, '<span class="text-indigo-600">$1</span>');
}

function highlightCssProperties(value: string): string {
    return value.replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="text-indigo-600">$1</span>$2');
}

function highlightHtml(value: string): string {
    const escaped = escapeHtml(value);
    return escaped.replace(/(&lt;\/?)([a-zA-Z0-9-]+)([^&]*?)(\/?&gt;)/g, (_, open, tag, rest, close) => {
        return `${open}<span class="text-indigo-600">${tag}</span>${rest}${close}`;
    });
}

function highlightCode(value: string, language: CodeLanguage): string {
    if (language === "html") {
        return highlightHtml(value);
    }

    const escaped = escapeHtml(value);
    const tokens = tokenizeCode(escaped);

    return tokens.map((token) => {
        if (token.type === "comment") {
            return `<span class="text-slate-500">${token.value}</span>`;
        }
        if (token.type === "string") {
            return `<span class="text-emerald-600">${token.value}</span>`;
        }
        if (language === "css") {
            return highlightCssProperties(token.value);
        }
        return highlightKeywords(token.value, JS_KEYWORDS);
    }).join("");
}

type CodeEditorProps = {
    label: string;
    value: string;
    language: CodeLanguage;
    minHeight: string;
    onChange: (value: string) => void;
};

function CodeEditor({ label, value, language, minHeight, onChange }: CodeEditorProps) {
    const preRef = useRef<HTMLPreElement | null>(null);
    const highlighted = useMemo(() => highlightCode(value, language), [value, language]);

    return (
        <div>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <div className="relative rounded-md border border-gray-300 bg-white">
                <pre
                    ref={preRef}
                    className={`pointer-events-none absolute inset-0 overflow-auto p-2 text-sm font-mono leading-6 whitespace-pre-wrap break-words ${minHeight}`}
                    aria-hidden="true"
                >
                    <code dangerouslySetInnerHTML={{ __html: `${highlighted}\n` }} />
                </pre>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={(e) => {
                        if (!preRef.current) return;
                        preRef.current.scrollTop = e.currentTarget.scrollTop;
                        preRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }}
                    spellCheck={false}
                    className={`relative w-full bg-transparent p-2 text-sm font-mono leading-6 text-transparent caret-gray-900 outline-none resize-vertical ${minHeight}`}
                    style={{ WebkitTextFillColor: "transparent" }}
                />
            </div>
        </div>
    );
}

function getSectionWarnings(sections: BuilderSection[]): string[] {
    const warnings: string[] = [];

    sections.forEach((section, index) => {
        const content = section.content ?? {};
        const label = sectionLabel(section.type);

        if (section.type === "single_image" || section.type === "image_caption" || section.type === "two_column") {
            if (!String((content as Record<string, unknown>).image_url || "").trim()) {
                warnings.push(`Section ${index + 1} (${label}) needs an image URL.`);
            }
            if (!String((content as Record<string, unknown>).alt_text || "").trim()) {
                warnings.push(`Section ${index + 1} (${label}) needs alt text.`);
            }
        }

        if (section.type === "image_gallery") {
            const images = (content as Record<string, unknown>).images as Array<Record<string, unknown>> | undefined;
            if (!images || images.length === 0) {
                warnings.push(`Section ${index + 1} (${label}) needs at least one image.`);
            } else {
                images.forEach((img, imgIndex) => {
                    if (!String(img.image_url || "").trim()) {
                        warnings.push(`Section ${index + 1} (${label}) image ${imgIndex + 1} needs URL.`);
                    }
                    if (!String(img.alt_text || "").trim()) {
                        warnings.push(`Section ${index + 1} (${label}) image ${imgIndex + 1} needs alt text.`);
                    }
                });
            }
        }

        if (section.type === "cta") {
            if (!String((content as Record<string, unknown>).button_label || "").trim()) {
                warnings.push(`Section ${index + 1} (${label}) needs a button label.`);
            }
            if (!String((content as Record<string, unknown>).button_url || "").trim()) {
                warnings.push(`Section ${index + 1} (${label}) needs a button URL.`);
            }
        }

        if (section.type === "embed") {
            if (!String((content as Record<string, unknown>).embed_url || "").trim()) {
                warnings.push(`Section ${index + 1} (${label}) needs an embed URL.`);
            }
        }

        if (section.type === "faq") {
            const items = (content as Record<string, unknown>).items as Array<Record<string, unknown>> | undefined;
            if (!items || items.length === 0) {
                warnings.push(`Section ${index + 1} (${label}) needs FAQ items.`);
            }
        }

        if (section.type === "table") {
            const rows = (content as Record<string, unknown>).rows as Array<Array<string>> | undefined;
            if (!rows || rows.length === 0) {
                warnings.push(`Section ${index + 1} (${label}) needs table rows.`);
            }
        }

        if (section.type === "product_card") {
            const skuIds = (content as Record<string, unknown>).sku_ids as string[] | undefined;
            if (!skuIds || skuIds.length === 0) {
                warnings.push(`Section ${index + 1} (${label}) needs at least one SKU.`);
            }
        }

        if (section.type === "collection_highlight") {
            if (!String((content as Record<string, unknown>).collection_id || "").trim()) {
                warnings.push(`Section ${index + 1} (${label}) needs a collection ID.`);
            }
        }

        if (section.type === "custom_code") {
            const html = String((content as Record<string, unknown>).html || "").trim();
            const css = String((content as Record<string, unknown>).css || "").trim();
            const js = String((content as Record<string, unknown>).js || "").trim();
            if (!html && !css && !js) {
                warnings.push(`Section ${index + 1} (${label}) is empty.`);
            }
            if (js) {
                warnings.push(`Section ${index + 1} (${label}) includes JS and requires acknowledgment before publish.`);
            }
            const issues = getCodeIssuesForBlock({ html, css, js });
            issues.errors.forEach((issue) => warnings.push(`Section ${index + 1} (${label}) ${issue}`));
            issues.warnings.forEach((issue) => warnings.push(`Section ${index + 1} (${label}) ${issue}`));
        }
    });

    return warnings;
}

function getPromptForTheme(theme: string): string {
    const formattedTheme = theme.toUpperCase();
    
    let designSystemSection = "";
    if (theme === "luxury") {
        designSystemSection = `# LUXURY THEME DESIGN SYSTEM

Color Palette:
Background:
#050505

Text:
#f5f5f5

Gold Accent:
#D4AF37

Dark Charcoal:
#121212

Muted Silver:
#a0a0a0

Design Style:
- Exclusive
- Premium
- High-end Retail
- Sleek
- Dark-mode luxury
Use glowing gold accents, subtle gold/bronze backdrops for highlight boxes, and clean border lines.

Typography:
Headings:
Playfair Display, Bodoni, or similar high-fashion serif

Body:
Montserrat, Inter, or clean sans-serif`;
    } else if (theme === "bohemian") {
        designSystemSection = `# BOHEMIAN THEME DESIGN SYSTEM

Color Palette:
Background:
#fcf9f4

Text:
#2c1e1a

Terracotta:
#9f3f29

Sage:
#7a8b7b

Warm Beige:
#dfd5c6

Design Style:
- Organic
- Cozy
- Artisan
- Hand-crafted
- Elegant
Use rounded corners, soft shadows, natural spacing, warm visual hierarchy.

Typography:
Headings:
Lora, Merriweather, or similar serif

Body:
Readable sans-serif`;
    } else {
        // classic
        designSystemSection = `# CLASSIC THEME DESIGN SYSTEM

Color Palette:
Background:
#ffffff or #f9f6f0

Text:
#1a1a1a

Soft Beige:
#dfd5c6

Warm Bronze:
#a38c70

Charcoal Accent:
#333333

Design Style:
- Timeless
- Elegant
- Clean Grid
- Refined Spacing
- Traditional
Use refined margins, minimalist subtle borders, high readability structures.

Typography:
Headings:
Playfair Display, Georgia, or editorial serif

Body:
Inter, Roboto, or readable sans-serif`;
    }

    return `You are an Expert SEO Content Writer, AIO (AI Search Optimization) Specialist, UX Content Strategist, and Frontend Blog Designer.

You will create a custom blog post specifically for a website using the active theme: ${formattedTheme}.

# MASTER RULE

IMPORTANT:

DO NOT generate any blog content, HTML, CSS, JavaScript, or code until all planning phases have been completed and the admin has provided the actual image URLs.

At the end of every phase, STOP and wait for approval/URLs before proceeding.

Never skip phases.

---

# PHASE 1: DISCOVERY & CONTENT PLANNING

Before doing anything else, ask the admin:

1. Blog Topic / Title
2. Primary SEO Keyword
3. Secondary Keywords
4. Target Audience
5. Search Intent

   * Informational
   * Commercial
   * Transactional
   * Comparison
6. Desired Tone

   * Human Storytelling
   * Buying Guide
   * Educational
   * Technical
   * Expert Authority
7. Target Country / Region
8. Desired Article Length

   * Short (1000–1500 words)
   * Standard (1800–2500 words)
   * Long-form (3000+ words)
9. Competitor URLs (optional)
10. Internal Pages that should be linked (optional)
11. Product Images / Reference Images (if applicable)
12. Brand Colors (if different from theme colors)

Also ask:

"Do you have any product images, lifestyle images, brand assets, or references you want me to use?"

After collecting information:

* Analyze the topic.
* Identify search intent.
* Determine optimal article structure.
* Estimate required image count.

Then STOP and wait for approval.

---

# PHASE 2: IMAGE PLANNING & DETAIL WORKFLOW

After approval of Phase 1:

Determine the required image count using:

* Under 1000 words → 2–3 images
* 1000–2000 words → 3–5 images
* 2000–3000 words → 5–7 images
* 3000+ words → 6–8 images

Present:

"We need X images for this blog."

Create a detailed list describing exactly what each image should look like to match the blog topic, search intent, and the active storefront theme style (Classic, Luxury, or Bohemian).

Structure the list as follows:
- Image 1 [Type, e.g., Hero Banner]: Detailed description of what this image should look like (composition, subject, styling, and color tones).
- Image 2 [Type, e.g., Lifestyle Image]: Detailed description of what this image should look like (composition, subject, styling, and color tones).
...and so on for all X images.

Ask the admin:
"Do you approve this image plan? If yes, please upload these images to your media library and reply with their public URLs."

STOP and wait for approval and URLs.

---

# PHASE 3: IMAGE URL COLLECTION

Only after the admin approves the plan and provides the public URLs for the images (e.g., Image 1 URL, Image 2 URL, etc.):

Collect the URLs. Never use placeholders or make up URLs. If some URLs are missing, ask the admin to provide them before proceeding.

STOP and wait for all image URLs.

---

# PHASE 4: BLOG GENERATION

Only after all image URLs have been supplied:

Generate:

* HTML
* CSS
* Optional JavaScript

You must embed the supplied image URLs in their respective <figure> and <img> tags inside the HTML content exactly as provided.

Return everything inside ONE code block.

No explanations.

No markdown outside the code block.

---

# ARTICLE REQUIREMENTS

Target Length:

Default:
1800–2500 words

Unless specified otherwise.

The article must:

* Be human-written
* Pass AI content detection naturally
* Be SEO optimized
* Be AIO optimized
* Be EEAT optimized

Demonstrate:

* Experience
* Expertise
* Authoritativeness
* Trustworthiness

---

# SEO REQUIREMENTS

Include:

* 1 H1
* Multiple H2 sections
* Multiple H3 subsections
* FAQ section
* Conclusion section

Primary keyword:

* H1
* First paragraph
* At least one H2
* Naturally throughout article

Secondary keywords:

* Naturally integrated

Use:

<strong>

for important phrases.

Include:

* Lists
* Bullet points
* Numbered lists
* Tables

Where relevant.

---

# AIO (AI SEARCH OPTIMIZATION)

Include:

1. Quick Answer Section
2. Key Takeaways
3. Summary Table
4. Pros & Cons
5. Best Practices
6. Buying Considerations
7. Expert Recommendations
8. FAQ Section

Content must answer:

* What is it?
* Why does it matter?
* How does it work?
* Benefits
* Drawbacks
* Best use cases
* Buying factors

Use concise, AI-friendly paragraphs.

---

# INTERNAL LINKING

Where relevant insert:

{{INTERNAL_LINK}}

for future internal links.

---

# FAQ SCHEMA

Include JSON-LD FAQ Schema matching the FAQ section.

---

# RESPONSIVE DESIGN REQUIREMENTS

Must be optimized for:

* Mobile
* Tablet
* Desktop

Use responsive layouts.

Images must scale properly.

Tables must be mobile-friendly.

---

# LAYOUT & GRID DESIGN RULES

CRITICAL FOR VISUAL EXCELLENCE:
DO NOT generate a simple "top-down vertical stack" (where headings, paragraphs, and images are just stacked sequentially in one narrow column). This looks amateurish and boring.

Instead, you MUST design a premium editorial layout using CSS Grids and Flexbox. Incorporate:

1. Alternating Two-Column Sections:
   - For one section, place text on the left and the corresponding image on the right.
   - For the next section, alternate: place the image on the left and the text on the right.
   - Example structure to define in your <style> and use in your HTML:
     \`\`\`css
     .blog-custom-content .grid-two-col {
       display: grid;
       grid-template-columns: 1fr;
       gap: 3rem;
       align-items: center;
       margin: 4rem 0;
     }
     @media (min-width: 768px) {
       .blog-custom-content .grid-two-col {
         grid-template-columns: 1fr 1fr;
       }
     }
     \`\`\`

2. Asymmetrical Highlights:
   - Create wider full-width showcase sections for premium lifestyle images, flanked by elegant quotes or callout boxes.
   - Place small offset detail highlights with text wraps or inline grids.

3. Visual Whitespace & Container Padding:
   - Ensure sections are separated with elegant margin spacing (e.g. \`margin: 5rem 0\` or \`5rem\`).
   - Do not wrap the entire HTML in another heavy bordered card or nested container with borders. Let the content flow naturally and match the page's elegant background.
   - Make sure elements align beautifully. Use \`max-width: 100%\` on images and figures, and keep the text readable width (optimal line length is 60–80 characters per line).

---

${designSystemSection}

---

# IMAGE REQUIREMENTS

Hero Image:
16:9

Content Images:
4:3

Feature Graphics:
1:1

Use:

<figure>
<img>
<figcaption>

for every image.

Each image must include:

* SEO alt text
* Lazy loading
* Responsive sizing

Optional:

* Hover zoom effects

---

# CONTAINER RULE

Wrap ALL content inside:

<div class="blog-custom-content">
...
</div>

---

# CSS SCOPING RULE

Every selector MUST begin with:

.blog-custom-content

Examples:

.blog-custom-content h1 {}
.blog-custom-content p {}
.blog-custom-content .hero-section {}

Never use:

body {}
h1 {}
p {}
img {}

---

# JAVASCRIPT

Only lightweight JavaScript is allowed.

Permitted features:

* FAQ Accordion
* Table of Contents Navigation
* Image Lightbox

No external libraries.

---

# FINAL OUTPUT FORMAT

Return ONLY:

<style>
...
</style>

<div class="blog-custom-content">
...
</div>

<script>
...
</script>

No explanations.

No markdown outside the code block.

No placeholder URLs.

Use only the final approved image URLs supplied by the admin.`;
}

export default function BlogEditor({ postId }: Props) {
    const [currentPostId, setCurrentPostId] = useState(postId ?? "");
    const [post, setPost] = useState<BlogPostPayload>(() => createEmptyPost());
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [tags, setTags] = useState<BlogTag[]>([]);
    const [relatedPosts, setRelatedPosts] = useState<BlogListPost[]>([]);
    const [tagIds, setTagIds] = useState<string[]>([]);
    const [relatedPostIds, setRelatedPostIds] = useState<string[]>([]);
    const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [productSearchResults, setProductSearchResults] = useState<ProductOption[]>([]);
    const [productSearchLoading, setProductSearchLoading] = useState(false);
    const [loading, setLoading] = useState(Boolean(postId));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);
    const [showSeo, setShowSeo] = useState(true);
    const [activeTab, setActiveTab] = useState<"title" | "code" | "seo">("title");
    const [showRevisions, setShowRevisions] = useState(false);
    const [revisions, setRevisions] = useState<Array<{ id: string; save_type: string; created_at: string }>>([]);
    const [redirects, setRedirects] = useState<Array<{ id: string; old_slug: string; new_slug: string; created_at: string }>>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
    const [showRawJson, setShowRawJson] = useState(false);
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<"cover" | "og" | "general">("cover");
    const [coverMediaPreview, setCoverMediaPreview] = useState("");
    const [ogMediaPreview, setOgMediaPreview] = useState("");
    const [codePreviewDoc, setCodePreviewDoc] = useState("");
    const [showCodePreview, setShowCodePreview] = useState(false);
    const [legacyVisualMode, setLegacyVisualMode] = useState(false);
    const autosaveRef = useRef<NodeJS.Timeout | null>(null);
    const dirtyRef = useRef(false);

    const [promptCopied, setPromptCopied] = useState(false);
    const [activeTheme, setActiveTheme] = useState<string>("classic");

    const copyPromptToClipboard = () => {
        const text = getPromptForTheme(activeTheme);
        navigator.clipboard.writeText(text);
        setPromptCopied(true);
        setTimeout(() => setPromptCopied(false), 2500);
    };

    const markDirty = () => {
        dirtyRef.current = true;
    };

    const resetEditorState = useCallback(() => {
        setPost(createEmptyPost());
        setTagIds([]);
        setRelatedPostIds([]);
        setRelatedProductIds([]);
        setSelectedProducts([]);
        setProductSearchQuery("");
        setProductSearchResults([]);
        setProductSearchLoading(false);
        setCoverMediaPreview("");
        setOgMediaPreview("");
        setShowCodePreview(false);
        setCodePreviewDoc("");
        setLegacyVisualMode(false);
        setError("");
        setSuccess("");
        setValidationErrors([]);
        setValidationWarnings([]);
        setRedirects([]);
        setRevisions([]);
        setShowRevisions(false);
        setSlugEdited(false);
    }, []);

    const loadSelectedProducts = useCallback(async (ids: string[]) => {
        if (ids.length === 0) {
            setSelectedProducts([]);
            return;
        }
        try {
            const res = await fetch(`/api/admin/products/search?ids=${encodeURIComponent(ids.join(","))}`);
            const json = await readJsonResponse<{ products?: ProductOption[]; error?: string }>(res);
            if (!res.ok) throw new Error(json.error || "Failed to load products");
            setSelectedProducts(json.products ?? []);
        } catch {
            setSelectedProducts([]);
        }
    }, []);

    const addRelatedProduct = (product: ProductOption) => {
        if (relatedProductIds.includes(product.id)) return;
        if (relatedProductIds.length >= 10) return;
        setRelatedProductIds((prev) => [...prev, product.id]);
        setSelectedProducts((prev) => [...prev, product]);
        setProductSearchQuery("");
        setProductSearchResults([]);
        markDirty();
    };

    const removeRelatedProduct = (productId: string) => {
        setRelatedProductIds((prev) => prev.filter((id) => id !== productId));
        setSelectedProducts((prev) => prev.filter((item) => item.id !== productId));
        markDirty();
    };

    useEffect(() => {
        if (postId) {
            if (postId !== currentPostId) {
                setCurrentPostId(postId);
            }
            return;
        }

        if (currentPostId) {
            setCurrentPostId("");
            resetEditorState();
        }
    }, [postId, currentPostId, resetEditorState]);

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [categoryRes, tagRes, postsRes, themeRes] = await Promise.all([
                    fetch("/api/admin/blogs/categories"),
                    fetch("/api/admin/blogs/tags"),
                    fetch("/api/admin/blogs?limit=200"),
                    fetch("/api/admin/theme"),
                ]);

                const categoryJson = await categoryRes.json();
                const tagJson = await tagRes.json();
                const postsJson = await postsRes.json();

                if (categoryRes.ok) setCategories(categoryJson.categories ?? []);
                if (tagRes.ok) setTags(tagJson.tags ?? []);
                if (postsRes.ok) setRelatedPosts(postsJson.posts ?? []);

                if (themeRes.ok) {
                    const themeJson = await themeRes.json();
                    if (themeJson.theme) {
                        setActiveTheme(themeJson.theme);
                    }
                }
            } catch {
                // Ignore filter load errors.
            }
        };

        loadFilters();
    }, []);

    useEffect(() => {
        if (!post.show_related_products) {
            setProductSearchResults([]);
            return;
        }

        const query = productSearchQuery.trim();
        if (query.length < 2) {
            setProductSearchResults([]);
            return;
        }

        const handle = setTimeout(async () => {
            setProductSearchLoading(true);
            try {
                const res = await fetch(`/api/admin/products/search?query=${encodeURIComponent(query)}&limit=12`);
                const json = await readJsonResponse<{ products?: ProductOption[]; error?: string }>(res);
                if (!res.ok) throw new Error(json.error || "Failed to search products");
                const options = (json.products ?? []) as ProductOption[];
                const filtered = options.filter((option) => !relatedProductIds.includes(option.id));
                setProductSearchResults(filtered);
            } catch {
                setProductSearchResults([]);
            } finally {
                setProductSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(handle);
    }, [productSearchQuery, post.show_related_products, relatedProductIds]);

    useEffect(() => {
        if (!currentPostId) return;
        let isMounted = true;

        const loadPost = async () => {
            setLoading(true);
            try {
            const res = await fetch(`/api/admin/blogs/${currentPostId}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to load post");
                if (!isMounted) return;

                const loaded = json.post as Record<string, unknown>;
                const loadedEditorMode = (loaded.editor_mode as "visual" | "full_code") ?? "visual";
                const coverId = (loaded.cover_media_id as string) ?? "";
                const ogId = (loaded.seo_og_image_media_id as string) ?? "";
                setLegacyVisualMode(loadedEditorMode === "visual");
                setPost((prev) => ({
                    ...prev,
                    id: loaded.id as string,
                    variant_group_id: (loaded.variant_group_id as string) ?? "",
                    title: (loaded.title as string) ?? "",
                    slug: (loaded.slug as string) ?? "",
                    excerpt: (loaded.excerpt as string) ?? "",
                    cover_media_id: coverId,
                    category_id: (loaded.category_id as string) ?? "",
                    language: (loaded.language as "en" | "hi" | "other") ?? "en",
                    author_name: (loaded.author_name as string) ?? "",
                    editor_mode: "full_code",
                    builder_layout: JSON.stringify(loaded.builder_layout ?? { sections: [] }, null, 2),
                    full_page_html: (() => {
                        let combined = (loaded.full_page_html as string) ?? "";
                        if (loaded.full_page_css) {
                            combined = `<style>\n${loaded.full_page_css}\n</style>\n` + combined;
                        }
                        if (loaded.full_page_js) {
                            combined = combined + `\n<script>\n${loaded.full_page_js}\n</script>`;
                        }
                        return combined;
                    })(),
                    full_page_css: "",
                    full_page_js: "",
                    custom_js_acknowledged: Boolean(loaded.custom_js_acknowledged),
                    code_mode_locked: Boolean(loaded.code_mode_locked),
                    schema_markup_enabled: loaded.schema_markup_enabled !== false,
                    show_header: loaded.show_header !== false,
                    show_cover: loaded.show_cover !== false,
                    show_share_buttons: loaded.show_share_buttons !== false,
                    show_related_products: loaded.show_related_products !== false,
                    related_products_title: (loaded.related_products_title as string) ?? "Shop This Story",
                    seo_meta_title: (loaded.seo_meta_title as string) ?? "",
                    seo_meta_description: (loaded.seo_meta_description as string) ?? "",
                    seo_canonical_url: (loaded.seo_canonical_url as string) ?? "",
                    seo_og_title: (loaded.seo_og_title as string) ?? "",
                    seo_og_description: (loaded.seo_og_description as string) ?? "",
                    seo_og_image_media_id: ogId,
                    seo_twitter_card_type: (loaded.seo_twitter_card_type as "summary" | "summary_large_image") ?? "summary_large_image",
                    seo_robots_directive: (loaded.seo_robots_directive as "index,follow" | "noindex,follow" | "noindex,nofollow") ?? "index,follow",
                    seo_keywords: (loaded.seo_keywords as string) ?? "",
                    status: (loaded.status as BlogPostPayload["status"]) ?? "draft",
                    scheduled_for: toIstDateTimeInput((loaded.scheduled_for as string) ?? ""),
                }));
                setShowCodePreview(false);
                setCodePreviewDoc("");

                const fetchMedia = async (id: string) => {
                    if (!id) return null;
                    const res = await fetch(`/api/admin/blogs/media?id=${id}`);
                    const mediaJson = await res.json();
                    if (!res.ok) return null;
                    return (mediaJson.media ?? [])[0] as BlogMediaItem | undefined;
                };

                const [coverMedia, ogMedia] = await Promise.all([
                    fetchMedia(coverId),
                    fetchMedia(ogId),
                ]);

                if (isMounted) {
                    setCoverMediaPreview(coverMedia?.public_url ?? "");
                    setOgMediaPreview(ogMedia?.public_url ?? "");
                }

                setTagIds(json.tag_ids ?? []);
                setRelatedPostIds(json.related_post_ids ?? []);
                const relatedProducts = (json.related_products ?? []).map((item: { product_id: string }) => item.product_id);
                setRelatedProductIds(relatedProducts);
                loadSelectedProducts(relatedProducts);
                setRedirects(json.redirects ?? []);
            } catch (err: unknown) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to load post");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPost();
        return () => {
            isMounted = false;
        };
    }, [currentPostId, loadSelectedProducts]);

    const openMediaLibrary = (target: "cover" | "og" | "general") => {
        setMediaTarget(target);
        setShowMediaLibrary(true);
    };

    const handleMediaSelect = (item: BlogMediaItem) => {
        if (mediaTarget === "cover") {
            setPost((prev) => ({ ...prev, cover_media_id: item.id }));
            setCoverMediaPreview(item.public_url);
            markDirty();
        } else if (mediaTarget === "og") {
            setPost((prev) => ({ ...prev, seo_og_image_media_id: item.id }));
            setOgMediaPreview(item.public_url);
            markDirty();
        } else {
            // General target - copy URL to clipboard
            navigator.clipboard.writeText(item.public_url);
        }
        setShowMediaLibrary(false);
    };

    // `handleSave` is intentionally omitted to keep autosave cadence stable across form edits.
    /* eslint-disable react-hooks/exhaustive-deps */
    const autosave = useCallback(async () => {
        if (!dirtyRef.current) return;
        if (!post.title.trim()) return;
        await handleSave("draft", true);
    }, [post]);
    /* eslint-enable react-hooks/exhaustive-deps */

    useEffect(() => {
        autosaveRef.current = setInterval(() => {
            autosave();
        }, 60000);

        return () => {
            if (autosaveRef.current) clearInterval(autosaveRef.current);
        };
    }, [autosave]);

    const payload = useMemo(() => {
        let builderLayout: Record<string, unknown> | null = null;
        if (post.editor_mode === "visual") {
            try {
                builderLayout = JSON.parse(post.builder_layout || DEFAULT_LAYOUT) as Record<string, unknown>;
            } catch {
                builderLayout = null;
            }
        }

        return {
            variant_group_id: post.variant_group_id.trim() || undefined,
            title: post.title.trim(),
            slug: post.slug.trim(),
            excerpt: post.excerpt.trim() || null,
            cover_media_id: post.cover_media_id.trim() || null,
            category_id: post.category_id || null,
            language: post.language,
            author_name: post.author_name.trim() || null,
            editor_mode: post.editor_mode,
            builder_layout: builderLayout,
            ...(() => {
                const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
                const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;

                let css = "";
                let js = "";
                let html = post.full_page_html;

                let match;
                styleRegex.lastIndex = 0;
                while ((match = styleRegex.exec(html)) !== null) {
                    css += match[1] + "\n";
                }
                html = html.replace(styleRegex, "");

                scriptRegex.lastIndex = 0;
                while ((match = scriptRegex.exec(html)) !== null) {
                    js += match[1] + "\n";
                }
                html = html.replace(scriptRegex, "");

                return {
                    full_page_html: html.trim() || null,
                    full_page_css: css.trim() || null,
                    full_page_js: js.trim() || null,
                };
            })(),
            custom_js_acknowledged: post.custom_js_acknowledged,
            code_mode_locked: post.code_mode_locked,
            schema_markup_enabled: post.schema_markup_enabled,
            show_header: post.show_header,
            show_cover: post.show_cover,
            show_share_buttons: post.show_share_buttons,
            show_related_products: post.show_related_products,
            related_products_title: post.related_products_title.trim() || null,
            seo_meta_title: post.seo_meta_title.trim() || null,
            seo_meta_description: post.seo_meta_description.trim() || null,
            seo_canonical_url: post.seo_canonical_url.trim() || null,
            seo_og_title: post.seo_og_title.trim() || null,
            seo_og_description: post.seo_og_description.trim() || null,
            seo_og_image_media_id: post.seo_og_image_media_id.trim() || null,
            seo_twitter_card_type: post.seo_twitter_card_type,
            seo_robots_directive: post.seo_robots_directive,
            seo_keywords: post.seo_keywords.trim() || null,
            status: post.status,
            scheduled_for: post.scheduled_for ? toIsoDateTimeFromIst(post.scheduled_for) : null,
            tag_ids: tagIds,
            related_post_ids: relatedPostIds,
            related_product_ids: relatedProductIds,
        };
    }, [post, tagIds, relatedPostIds, relatedProductIds]);

    const layoutState = useMemo(() => {
        if (post.editor_mode !== "visual") {
            return { sections: [] as BuilderSection[], error: "" };
        }
        try {
            const parsed = normalizeLayout(post.builder_layout || DEFAULT_LAYOUT);
            return { sections: parsed.sections, error: "" };
        } catch {
            return { sections: [] as BuilderSection[], error: "Invalid JSON" };
        }
    }, [post.builder_layout, post.editor_mode]);

    const customCodeBlocks = useMemo(() => {
        if (post.editor_mode !== "visual") return [];
        return getCustomCodeBlocks({ sections: layoutState.sections } as Record<string, unknown>);
    }, [layoutState.sections, post.editor_mode]);

    const hasCustomJs = useMemo(() => {
        if (post.editor_mode === "full_code") {
            return Boolean(post.full_page_js.trim());
        }
        return customCodeBlocks.some((block) => Boolean(block.js));
    }, [customCodeBlocks, post.editor_mode, post.full_page_js]);

    const sectionWarnings = useMemo(() => getSectionWarnings(layoutState.sections), [layoutState.sections]);

    const codeModeWarnings = useMemo(() => {
        const warnings: string[] = [];
        if (post.editor_mode !== "full_code") return warnings;
        if (!post.full_page_html.trim()) warnings.push("Code mode requires HTML content.");
        const issues = getCodeIssuesForBlock({
            html: post.full_page_html,
            css: post.full_page_css,
            js: post.full_page_js,
        });
        warnings.push(...issues.errors, ...issues.warnings);
        if (post.full_page_js.trim() && !post.custom_js_acknowledged) {
            warnings.push("Custom JS requires explicit acknowledgment before publish.");
        }
        return warnings;
    }, [post.editor_mode, post.full_page_html, post.full_page_css, post.full_page_js, post.custom_js_acknowledged]);

    const variantOptions = useMemo(() => {
        return relatedPosts.filter((item) => item.id !== currentPostId);
    }, [relatedPosts, currentPostId]);

    const linkedVariants = useMemo(() => {
        if (!post.variant_group_id) return [] as BlogListPost[];
        return relatedPosts.filter((item) => item.variant_group_id === post.variant_group_id && item.id !== currentPostId);
    }, [relatedPosts, post.variant_group_id, currentPostId]);

    const relatedPostOptions = useMemo(() => {
        return relatedPosts.filter((item) => item.id !== currentPostId);
    }, [relatedPosts, currentPostId]);

    const updateSections = (sections: BuilderSection[]) => {
        setPost((prev) => ({
            ...prev,
            builder_layout: serializeLayout(sections),
        }));
        markDirty();
    };

    const addSection = (template: Omit<BuilderSection, "id">) => {
        const next = [...layoutState.sections, { ...template, id: createSectionId() }];
        updateSections(next);
    };

    const moveSection = (index: number, direction: "up" | "down") => {
        const next = [...layoutState.sections];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= next.length) return;
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        updateSections(next);
    };

    const duplicateSection = (index: number) => {
        const next = [...layoutState.sections];
        const copy = { ...next[index], id: createSectionId() };
        next.splice(index + 1, 0, copy);
        updateSections(next);
    };

    const deleteSection = (index: number) => {
        const confirmed = window.confirm("Remove this section?");
        if (!confirmed) return;
        const next = layoutState.sections.filter((_, idx) => idx !== index);
        updateSections(next);
    };

    const toggleSectionVisibility = (index: number) => {
        const next = [...layoutState.sections];
        next[index] = { ...next[index], visible: !next[index].visible };
        updateSections(next);
    };

    const sectionPreviewSummary = (section: BuilderSection) => {
        const content = section.content ?? {};
        if (section.type === "heading") return String(content.heading || "Heading");
        if (section.type === "rich_text") return "Rich text block";
        if (section.type === "single_image") return String(content.image_url || "Image block");
        if (section.type === "image_caption") return String(content.caption_html || "Image with caption");
        if (section.type === "two_column") return String(content.text_html || "Two column block");
        if (section.type === "quote") return String(content.quote || "Quote block");
        if (section.type === "cta") return String(content.headline || "CTA block");
        if (section.type === "embed") return String(content.embed_url || "Embed block");
        if (section.type === "faq") return "FAQ block";
        if (section.type === "image_gallery") return "Image gallery";
        if (section.type === "table") return "Table";
        if (section.type === "product_card") return "Product cards";
        if (section.type === "collection_highlight") return "Collection highlight";
        if (section.type === "offer_banner") return "Offer banner";
        if (section.type === "fabric_spec_table") return "Fabric specs";
        if (section.type === "custom_code") {
            const content = section.content ?? {};
            const html = String((content as Record<string, unknown>).html || "").trim();
            const css = String((content as Record<string, unknown>).css || "").trim();
            const js = String((content as Record<string, unknown>).js || "").trim();
            const parts = [] as string[];
            if (html) parts.push("HTML");
            if (css) parts.push("CSS");
            if (js) parts.push("JS");
            return parts.length > 0 ? `Custom code (${parts.join(", ")})` : "Custom code block";
        }
        return section.type;
    };

        const buildCodePreviewDoc = (html: string, css: string, js: string) => {
                const safeHtml = html.trim()
                        ? html
                        : "<div style=\"font-family: system-ui, sans-serif; padding: 24px; color: #111;\">Paste HTML to preview here.</div>";
                const safeCss = css.trim();
                const safeJs = js.replace(/<\/script>/gi, "<\\/script>");
                return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; color: #111; }
        img { max-width: 100%; height: auto; }
        ${safeCss}
    </style>
</head>
<body>
    ${safeHtml}
    <script>${safeJs}</script>
</body>
</html>`;
        };

        const handleCodePreview = () => {
                setCodePreviewDoc(buildCodePreviewDoc(post.full_page_html, post.full_page_css, post.full_page_js));
                setShowCodePreview(true);
        };

    const handleSave = async (nextStatus: BlogPostPayload["status"], isAuto = false) => {
        if (hasCustomJs && !post.custom_js_acknowledged) {
            if (!isAuto) {
                setError("Custom JS acknowledgment is required before saving.");
                setSuccess("");
            }
            return null;
        }
        setSaving(true);
        setError("");
        setSuccess("");
        setValidationErrors([]);
        setValidationWarnings([]);

        if (post.editor_mode === "visual") {
            try {
                JSON.parse(post.builder_layout || DEFAULT_LAYOUT);
            } catch {
                setSaving(false);
                setError("Builder layout JSON is invalid.");
                return null;
            }
        }

        try {
            const method = currentPostId ? "PATCH" : "POST";
            const url = currentPostId ? `/api/admin/blogs/${currentPostId}` : "/api/admin/blogs";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...payload,
                    status: nextStatus,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save post");

            const savedPostId = currentPostId || json.post.id;

            dirtyRef.current = false;
            setSuccess(isAuto ? "Auto-saved" : "Saved successfully");

            if (!currentPostId && json.post?.id) {
                setCurrentPostId(json.post.id);
                window.history.replaceState({}, "", `/admin/blog/${json.post.id}`);
            }

            if (json.post?.variant_group_id) {
                setPost((prev) => ({ ...prev, variant_group_id: json.post.variant_group_id }));
            }

            if (nextStatus === "published" || nextStatus === "scheduled") {
                const validationRes = await fetch(`/api/admin/blogs/${savedPostId}/validate`);
                const validationJson = await validationRes.json();
                if (!validationRes.ok) throw new Error(validationJson.error || "Validation failed");

                if (!validationJson.valid) {
                    setValidationErrors(validationJson.errors ?? []);
                    setValidationWarnings(validationJson.warnings ?? []);
                    await fetch(`/api/admin/blogs/${savedPostId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "draft" }),
                    });
                    setPost((prev) => ({ ...prev, status: "draft" }));
                    return savedPostId;
                }
            }

            setPost((prev) => ({ ...prev, status: nextStatus }));
            return savedPostId;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save post");
            return null;
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => {
        setError("");
        const previewWindow = window.open("", "_blank");
        if (!previewWindow) {
            setError("Popup blocked. Allow popups to open preview.");
            return;
        }
        previewWindow.document.open();
        previewWindow.document.write(buildCodePreviewDoc(post.full_page_html, post.full_page_css, post.full_page_js));
        previewWindow.document.close();
    };

    const openRevisions = async () => {
        if (!currentPostId) return;
        setShowRevisions(true);
        try {
            const res = await fetch(`/api/admin/blogs/${currentPostId}/revisions`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load revisions");
            setRevisions(json.revisions ?? []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load revisions");
        }
    };

    const restoreRevision = async (revisionId: string) => {
        if (!currentPostId) return;
        try {
            const res = await fetch(`/api/admin/blogs/${currentPostId}/revisions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "restore", revision_id: revisionId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to restore revision");
            setSuccess("Revision restored");
            setPost((prev) => ({ ...prev, title: json.post.title ?? prev.title }));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to restore revision");
        }
    };

    const handleTitleChange = (value: string) => {
        setPost((prev) => ({ ...prev, title: value }));
        if (!slugEdited) {
            setPost((prev) => ({ ...prev, slug: slugify(value) }));
        }
        markDirty();
    };

    const metaTitleCount = post.seo_meta_title.length;
    const metaDescriptionCount = post.seo_meta_description.length;
    const metaTitleTone = metaTitleCount > META_TITLE_LIMIT ? "text-red-600" : "text-gray-500";
    const metaDescriptionTone = metaDescriptionCount > META_DESCRIPTION_LIMIT ? "text-red-600" : "text-gray-500";
    const liveUrl = useMemo(() => {
        if (!post.slug.trim()) return "";
        const base = post.language === "hi" ? "/hi/blogs/" : "/blogs/";
        return `${base}${post.slug.trim()}`;
    }, [post.language, post.slug]);

    if (loading) {
        return <p className="text-sm text-gray-500">Loading editor...</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">{currentPostId ? "Edit Blog Post" : "Create Blog Post"}</h1>
                    <p className="text-sm text-gray-500 mt-1">Draft, schedule, and publish blog posts with theme-agnostic content.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link href="/admin/blog" className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50">
                        Back to list
                    </Link>
                    <button
                        onClick={() => handleSave("draft")}
                        disabled={saving}
                        className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                    >
                        {saving ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                        onClick={handlePreview}
                        disabled={saving}
                        className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                    >
                        Preview
                    </button>
                    {post.status === "published" && liveUrl && (
                        <Link
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                        >
                            View Live
                        </Link>
                    )}
                    <button
                        onClick={() => handleSave(post.status === "scheduled" ? "scheduled" : "published")}
                        disabled={saving}
                        className="px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-medium"
                    >
                        {post.status === "scheduled" ? "Schedule" : "Publish"}
                    </button>
                    <button
                        onClick={openRevisions}
                        disabled={!currentPostId}
                        className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                    >
                        Revisions
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
                    {success}
                </div>
            )}

            {(validationErrors.length > 0 || validationWarnings.length > 0) && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm space-y-1">
                    {validationErrors.length > 0 && (
                        <div>
                            <p className="font-semibold">Publish blockers</p>
                            <ul className="list-disc pl-4">
                                {validationErrors.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {validationWarnings.length > 0 && (
                        <div>
                            <p className="font-semibold">Warnings</p>
                            <ul className="list-disc pl-4">
                                {validationWarnings.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("title")}
                        className={`px-3 py-2 rounded-md border text-xs font-medium ${activeTab === "title" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                    >
                        Title
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("code")}
                        className={`px-3 py-2 rounded-md border text-xs font-medium ${activeTab === "code" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                    >
                        Code
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("seo")}
                        className={`px-3 py-2 rounded-md border text-xs font-medium ${activeTab === "seo" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                    >
                        SEO
                    </button>
                </div>

                {activeTab === "title" && (
                <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Title</label>
                        <input
                            type="text"
                            value={post.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                            placeholder="Post title"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Slug</label>
                        <input
                            type="text"
                            value={post.slug}
                            onChange={(e) => {
                                setSlugEdited(true);
                                setPost((prev) => ({ ...prev, slug: e.target.value }));
                                markDirty();
                            }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                            placeholder="post-slug"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Summary / Excerpt</label>
                        <textarea
                            value={post.excerpt}
                            onChange={(e) => {
                                setPost((prev) => ({ ...prev, excerpt: e.target.value }));
                                markDirty();
                            }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm min-h-[120px]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Cover Image</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={post.cover_media_id}
                                onChange={(e) => {
                                    setPost((prev) => ({ ...prev, cover_media_id: e.target.value }));
                                    markDirty();
                                }}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => openMediaLibrary("cover")}
                                className="px-2 py-2 rounded-md border border-gray-300 text-xs"
                            >
                                Select
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPost((prev) => ({ ...prev, cover_media_id: "" }));
                                    setCoverMediaPreview("");
                                    markDirty();
                                }}
                                className="px-2 py-2 rounded-md border border-gray-200 text-xs text-gray-500"
                            >
                                Clear
                            </button>
                        </div>
                        {coverMediaPreview && (
                            <div className="mt-2 overflow-hidden rounded-md border border-gray-200 max-w-md bg-gray-50">
                                <img src={coverMediaPreview} alt="Cover preview" className="w-full aspect-[16/9] object-cover" />
                            </div>
                        )}
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-slate-50/60 p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Display Options</p>
                        <label className="flex items-center gap-2 text-xs text-gray-700">
                            <input
                                type="checkbox"
                                checked={post.show_header}
                                onChange={(e) => {
                                    setPost((prev) => ({ ...prev, show_header: e.target.checked }));
                                    markDirty();
                                }}
                            />
                            Show title & header
                        </label>
                        <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                            <input
                                type="checkbox"
                                checked={post.show_cover}
                                onChange={(e) => {
                                    setPost((prev) => ({ ...prev, show_cover: e.target.checked }));
                                    markDirty();
                                }}
                            />
                            Show cover image
                        </label>
                        <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                            <input
                                type="checkbox"
                                checked={post.show_share_buttons}
                                onChange={(e) => {
                                    setPost((prev) => ({ ...prev, show_share_buttons: e.target.checked }));
                                    markDirty();
                                }}
                            />
                            Show share buttons
                        </label>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Category</label>
                        <select
                            value={post.category_id}
                            onChange={(e) => {
                                setPost((prev) => ({ ...prev, category_id: e.target.value }));
                                markDirty();
                            }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                        >
                            <option value="">Uncategorized</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Tags</label>
                        <div className="grid grid-cols-2 gap-2">
                            {tags.map((tag) => (
                                <label key={tag.id} className="text-xs text-gray-700 flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={tagIds.includes(tag.id)}
                                        onChange={(e) => {
                                            setTagIds((prev) => e.target.checked
                                                ? [...prev, tag.id]
                                                : prev.filter((id) => id !== tag.id));
                                            markDirty();
                                        }}
                                    />
                                    {tag.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Language</label>
                        <select
                            value={post.language}
                            onChange={(e) => {
                                setPost((prev) => ({ ...prev, language: e.target.value as BlogPostPayload["language"] }));
                                markDirty();
                            }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                        >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Author Name</label>
                        <input
                            type="text"
                            value={post.author_name}
                            onChange={(e) => {
                                setPost((prev) => ({ ...prev, author_name: e.target.value }));
                                markDirty();
                            }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                        <select
                            value={post.status}
                            onChange={(e) => {
                                setPost((prev) => ({ ...prev, status: e.target.value as BlogPostPayload["status"] }));
                                markDirty();
                            }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                        >
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="published">Published</option>
                            <option value="unpublished">Unpublished</option>
                        </select>
                    </div>
                    {post.status === "scheduled" && (
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Scheduled For (IST)</label>
                            <input
                                type="datetime-local"
                                value={post.scheduled_for}
                                onChange={(e) => {
                                    setPost((prev) => ({ ...prev, scheduled_for: e.target.value }));
                                    markDirty();
                                }}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                            />
                        </div>
                    )}
                    </div>
                </section>
                )}

                {activeTab === "code" && (
                <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">HTML/CSS/JS Editor</h2>
                    </div>

                    {post.editor_mode === "visual" ? (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-gray-200 bg-slate-50/60 p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-semibold text-gray-700">Section Library</h3>
                                    <button
                                        onClick={() => setShowRawJson((prev) => !prev)}
                                        className="px-2 py-1 rounded-md border border-gray-300 text-xs"
                                    >
                                        {showRawJson ? "Hide" : "Show"} JSON
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {SECTION_LIBRARY.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => addSection(item.template)}
                                            className="px-2 py-2 rounded-md border border-gray-200 bg-white text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-gray-700">Sections</h3>
                                    {layoutState.error && (
                                        <span className="text-xs text-red-600">Invalid JSON</span>
                                    )}
                                </div>
                                {layoutState.sections.length === 0 ? (
                                    <p className="text-xs text-gray-500">No sections yet. Add one from the library.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {layoutState.sections.map((section, index) => (
                                            <div key={section.id} className="rounded-md border border-gray-200 p-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800">{sectionLabel(section.type)}</p>
                                                        <p className="text-[11px] text-gray-500">{sectionPreviewSummary(section)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => moveSection(index, "up")}
                                                            className="px-2 py-1 rounded border border-gray-300 text-[11px]"
                                                        >
                                                            Up
                                                        </button>
                                                        <button
                                                            onClick={() => moveSection(index, "down")}
                                                            className="px-2 py-1 rounded border border-gray-300 text-[11px]"
                                                        >
                                                            Down
                                                        </button>
                                                        <button
                                                            onClick={() => duplicateSection(index)}
                                                            className="px-2 py-1 rounded border border-gray-300 text-[11px]"
                                                        >
                                                            Duplicate
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSection(index)}
                                                            className="px-2 py-1 rounded border border-red-200 text-[11px] text-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <label className="mt-2 flex items-center gap-2 text-[11px] text-gray-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={section.visible !== false}
                                                        onChange={() => toggleSectionVisibility(index)}
                                                    />
                                                    Visible
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-gray-700">Preview</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPreviewMode("desktop")}
                                            className={`px-2 py-1 rounded border text-[11px] ${previewMode === "desktop" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700"}`}
                                        >
                                            Desktop
                                        </button>
                                        <button
                                            onClick={() => setPreviewMode("mobile")}
                                            className={`px-2 py-1 rounded border text-[11px] ${previewMode === "mobile" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700"}`}
                                        >
                                            Mobile
                                        </button>
                                    </div>
                                </div>
                                <div className={`rounded-md border border-dashed border-gray-200 bg-slate-50 p-2 ${previewMode === "mobile" ? "max-w-sm" : "max-w-full"}`}>
                                    {layoutState.sections.length === 0 ? (
                                        <p className="text-xs text-gray-500">Preview will appear once sections are added.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {layoutState.sections.map((section) => (
                                                <div key={section.id} className="rounded border border-gray-200 bg-white px-2 py-2 text-xs">
                                                    <p className="font-semibold text-gray-800">{sectionLabel(section.type)}</p>
                                                    <p className="text-gray-500 mt-1">{sectionPreviewSummary(section)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {sectionWarnings.length > 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                                    <p className="font-semibold mb-1">Section warnings</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {sectionWarnings.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {showRawJson && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Builder Layout JSON</label>
                                    <textarea
                                        value={post.builder_layout}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, builder_layout: e.target.value }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm min-h-[220px] font-mono"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {legacyVisualMode && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                                    <p className="font-semibold">Visual builder removed</p>
                                    <p className="mt-1">This post was created with the old section builder. Paste HTML/CSS/JS below to replace its content.</p>
                                </div>
                            )}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 space-y-2">
                                <p className="font-semibold text-gray-900 flex items-center justify-between">
                                    <span>Code Editor &amp; AI Integration Guidelines</span>
                                </p>
                                <p className="text-gray-600">
                                    Paste your combined code containing HTML, CSS (inside &lt;style&gt; tags), and JS (inside &lt;script&gt; tags). All custom CSS selectors must be scoped to keep page elements like Navbars/Footers intact.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1 pb-1">
                                    <button
                                        type="button"
                                        onClick={() => openMediaLibrary("general")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md shadow-sm transition-all duration-150 cursor-pointer"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Upload &amp; Copy Blog Image URLs
                                    </button>
                                </div>
                                <details className="mt-2 group bg-white border border-gray-200 rounded-md p-3 cursor-pointer">
                                    <summary className="font-semibold text-gray-800 hover:text-gray-950 select-none list-none flex items-center justify-between">
                                        <span>Show Interactive AI Blog Prompt ({activeTheme.toUpperCase()} Theme)</span>
                                        <span className="text-[10px] text-gray-400 font-normal">Click to expand</span>
                                    </summary>
                                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-3 select-text cursor-auto">
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="font-medium text-gray-800">Copy this exact prompt and paste it into your AI assistant (e.g. ChatGPT, Claude, Gemini):</p>
                                            <button
                                                type="button"
                                                onClick={copyPromptToClipboard}
                                                className="flex-shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
                                            >
                                                {promptCopied ? "Copied!" : "Copy AI Prompt"}
                                            </button>
                                        </div>
                                        <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-[10px] leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-auto">
                                            {getPromptForTheme(activeTheme)}
                                        </pre>
                                    </div>
                                </details>
                            </div>
                            <CodeEditor
                                label="Unified HTML / CSS / JS Code"
                                language="html"
                                value={post.full_page_html}
                                minHeight="min-h-[300px]"
                                onChange={(value) => {
                                    setPost((prev) => ({ ...prev, full_page_html: value }));
                                    markDirty();
                                }}
                            />
                            <label className="flex items-center gap-2 text-xs text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={post.custom_js_acknowledged}
                                    onChange={(e) => {
                                        setPost((prev) => ({ ...prev, custom_js_acknowledged: e.target.checked }));
                                        markDirty();
                                    }}
                                />
                                I acknowledge custom JS risks
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCodePreview}
                                    className="px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-medium"
                                >
                                    Render Preview
                                </button>
                                {showCodePreview && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCodePreview(false)}
                                        className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium"
                                    >
                                        Hide Preview
                                    </button>
                                )}
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-2">
                                {showCodePreview ? (
                                    <iframe
                                        title="Code preview"
                                        sandbox="allow-scripts"
                                        srcDoc={codePreviewDoc}
                                        className="h-[420px] w-full rounded-md border border-gray-200"
                                    />
                                ) : (
                                    <p className="text-xs text-gray-500">Click Render Preview to see your HTML/CSS/JS output.</p>
                                )}
                            </div>

                            {codeModeWarnings.length > 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                                    <p className="font-semibold mb-1">Code mode warnings</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {codeModeWarnings.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </section>
                )}

                {activeTab === "seo" && (
                <div className="space-y-4">
                    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">SEO & Relations</h2>
                        <button
                            onClick={() => setShowSeo((prev) => !prev)}
                            className="px-2 py-1 rounded-md border border-gray-300 text-xs"
                        >
                            {showSeo ? "Hide" : "Show"} SEO
                        </button>
                    </div>

                    {showSeo && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="block text-xs text-gray-500">Meta Title</label>
                                        <span className={`text-[11px] ${metaTitleTone}`}>{metaTitleCount}/{META_TITLE_LIMIT}</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={post.seo_meta_title}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, seo_meta_title: e.target.value }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">Shown as the blue title in Google results and browser tab.</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Canonical URL</label>
                                    <input
                                        type="text"
                                        value={post.seo_canonical_url}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, seo_canonical_url: e.target.value }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">Leave empty to use the default blog URL. Use full URL if set.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="block text-xs text-gray-500">Meta Description</label>
                                        <span className={`text-[11px] ${metaDescriptionTone}`}>{metaDescriptionCount}/{META_DESCRIPTION_LIMIT}</span>
                                    </div>
                                    <textarea
                                        value={post.seo_meta_description}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, seo_meta_description: e.target.value }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm min-h-[90px]"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">Short summary used under the title in search results.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">SEO Keywords</label>
                                    <input
                                        type="text"
                                        value={post.seo_keywords}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, seo_keywords: e.target.value }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                        placeholder="fabric care, cotton buying guide, silk styling tips"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">Comma-separated keywords. Used in &lt;meta name=&quot;keywords&quot;&gt; for search engines.</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">OG Title</label>
                                    <input
                                        type="text"
                                        value={post.seo_og_title}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, seo_og_title: e.target.value }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">Social share title for Facebook/WhatsApp. Defaults to meta title.</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Twitter Card Type</label>
                                    <select
                                        value={post.seo_twitter_card_type}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, seo_twitter_card_type: e.target.value as BlogPostPayload["seo_twitter_card_type"] }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                                    >
                                        <option value="summary">Summary</option>
                                        <option value="summary_large_image">Summary Large Image</option>
                                    </select>
                                    <p className="text-[11px] text-gray-500 mt-1">Controls how Twitter/X shows the preview card.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">OG Description</label>
                                    <textarea
                                        value={post.seo_og_description}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, seo_og_description: e.target.value }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm min-h-[80px]"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">Social share description. Defaults to meta description.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">OG Image Media ID</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={post.seo_og_image_media_id}
                                            onChange={(e) => {
                                                setPost((prev) => ({ ...prev, seo_og_image_media_id: e.target.value }));
                                                markDirty();
                                            }}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => openMediaLibrary("og")}
                                            className="px-2 py-2 rounded-md border border-gray-300 text-xs"
                                        >
                                            Select
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPost((prev) => ({ ...prev, seo_og_image_media_id: "" }));
                                                setOgMediaPreview("");
                                                markDirty();
                                            }}
                                            className="px-2 py-2 rounded-md border border-gray-200 text-xs text-gray-500"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {ogMediaPreview && (
                                        <div className="mt-2 overflow-hidden rounded-md border border-gray-200 max-w-md bg-gray-50">
                                            <img src={ogMediaPreview} alt="OG preview" className="w-full aspect-[1.91/1] object-cover" />
                                        </div>
                                    )}
                                    <p className="text-[11px] text-gray-500 mt-1">Image used when sharing on Facebook/WhatsApp. If empty, cover image is used.</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Robots Directive</label>
                                    <select
                                        value={post.seo_robots_directive}
                                        onChange={(e) => {
                                            setPost((prev) => ({ ...prev, seo_robots_directive: e.target.value as BlogPostPayload["seo_robots_directive"] }));
                                            markDirty();
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                                    >
                                        <option value="index,follow">Index, Follow</option>
                                        <option value="noindex,follow">Noindex, Follow</option>
                                        <option value="noindex,nofollow">Noindex, Nofollow</option>
                                    </select>
                                    <p className="text-[11px] text-gray-500 mt-1">Choose whether search engines can index this page.</p>
                                </div>
                                <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                    <label className="flex items-center gap-2 text-xs text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={post.schema_markup_enabled}
                                            onChange={(e) => {
                                                setPost((prev) => ({ ...prev, schema_markup_enabled: e.target.checked }));
                                                markDirty();
                                            }}
                                        />
                                        Enable schema markup
                                    </label>
                                    <p className="text-[11px] text-gray-500 mt-1">Adds Google-friendly structured data for better rich results.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs text-gray-500">Language Variants</label>
                                <p className="text-[11px] text-gray-400">
                                    Variant group ID: {post.variant_group_id || "Save once to generate."}
                                </p>
                                <p className="text-[11px] text-gray-500">Link the same article in another language for hreflang and cross-links.</p>
                                <select
                                    value={post.variant_group_id}
                                    onChange={(e) => {
                                        setPost((prev) => ({ ...prev, variant_group_id: e.target.value }));
                                        markDirty();
                                    }}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                                >
                                    <option value="">Create new variant group</option>
                                    {variantOptions.map((option) => (
                                        <option key={option.id} value={option.variant_group_id}>
                                            {option.title} ({option.language})
                                        </option>
                                    ))}
                                </select>
                                {linkedVariants.length > 0 && (
                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                        <p className="text-[11px] text-gray-500">Linked variants:</p>
                                        <ul className="mt-1 space-y-1 text-xs text-gray-700">
                                            {linkedVariants.map((variant) => (
                                                <li key={variant.id}>{variant.title} ({variant.language})</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Redirect History</p>
                                <p className="text-[11px] text-gray-400 mb-2">Auto-created when you change the slug on a published post.</p>
                                {redirects.length === 0 ? (
                                    <p className="text-xs text-gray-400">No redirects recorded yet.</p>
                                ) : (
                                    <ul className="space-y-2 text-xs text-gray-600">
                                        {redirects.map((item) => (
                                            <li key={item.id} className="flex flex-col gap-1">
                                                <span className="text-gray-800">{item.old_slug} → {item.new_slug}</span>
                                                <span className="text-[11px] text-gray-400">{formatDate(item.created_at)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Related Posts (max 5)</label>
                        <p className="text-[11px] text-gray-500 mb-2">Shows in the &quot;More from our Journal&quot; section on the blog page.</p>
                        <div className="max-h-40 overflow-auto border border-gray-200 rounded-md p-2 space-y-1">
                            {relatedPostOptions.length === 0 ? (
                                <p className="text-xs text-gray-500">No other posts available yet.</p>
                            ) : (
                                relatedPostOptions.map((item) => (
                                    <label key={item.id} className="text-xs text-gray-700 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={relatedPostIds.includes(item.id)}
                                            onChange={(e) => {
                                                setRelatedPostIds((prev) => {
                                                    if (e.target.checked) {
                                                        if (prev.length >= 5) return prev;
                                                        return [...prev, item.id];
                                                    }
                                                    return prev.filter((id) => id !== item.id);
                                                });
                                                markDirty();
                                            }}
                                        />
                                        {item.title}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    </section>

                    <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Recommended Products Section</h2>
                        <label className="flex items-center gap-2 text-xs text-gray-700">
                            <input
                                type="checkbox"
                                checked={post.show_related_products}
                                onChange={(e) => {
                                    setPost((prev) => ({ ...prev, show_related_products: e.target.checked }));
                                    markDirty();
                                }}
                            />
                            Show recommended products on this blog
                        </label>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Section Title</label>
                            <input
                                type="text"
                                value={post.related_products_title}
                                onChange={(e) => {
                                    setPost((prev) => ({ ...prev, related_products_title: e.target.value }));
                                    markDirty();
                                }}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                placeholder="Shop This Story"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">Shown above the product slider on the blog page.</p>
                        </div>
                    </section>

                    <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900">Select Products</h2>
                            <span className="text-[11px] text-gray-400">{relatedProductIds.length}/10</span>
                        </div>

                        {!post.show_related_products ? (
                            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                                Enable recommended products to select items.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Search products</label>
                                    <input
                                        type="text"
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                                        placeholder="Search by product name or slug"
                                    />
                                    {productSearchQuery.trim().length >= 2 && (
                                        <div className="mt-2 max-h-40 overflow-auto rounded-md border border-gray-200 bg-white">
                                            {productSearchLoading ? (
                                                <p className="px-3 py-2 text-xs text-gray-500">Searching...</p>
                                            ) : productSearchResults.length === 0 ? (
                                                <p className="px-3 py-2 text-xs text-gray-500">No products found.</p>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {productSearchResults.map((option) => (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => addRelatedProduct(option)}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                                        >
                                                            <p className="text-xs font-semibold text-gray-800">{option.name}</p>
                                                            <p className="text-[11px] text-gray-500">/{option.slug ?? option.id}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {productSearchQuery.trim().length > 0 && productSearchQuery.trim().length < 2 && (
                                        <p className="text-[11px] text-gray-400 mt-1">Type at least 2 letters to search.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Selected products</label>
                                    {selectedProducts.length === 0 ? (
                                        <p className="text-xs text-gray-500">No products selected yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedProducts.map((product) => (
                                                <div key={product.id} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800">{product.name}</p>
                                                        <p className="text-[11px] text-gray-500">/{product.slug ?? product.id}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRelatedProduct(product.id)}
                                                        className="text-[11px] text-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {relatedProductIds.length >= 10 && (
                                    <p className="text-xs text-red-600">Max 10 products allowed.</p>
                                )}
                            </div>
                        )}
                    </section>
                </div>
                )}
            </div>

            {showRevisions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
                    <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-800">Revision History</h3>
                            <button onClick={() => setShowRevisions(false)} className="text-xs text-gray-500">Close</button>
                        </div>
                        <div className="p-4 space-y-3">
                            {revisions.length === 0 ? (
                                <p className="text-sm text-gray-500">No revisions yet.</p>
                            ) : (
                                revisions.map((rev) => (
                                    <div key={rev.id} className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium text-gray-800">{rev.save_type}</p>
                                            <p className="text-xs text-gray-500">{formatDate(rev.created_at)}</p>
                                        </div>
                                        <button
                                            onClick={() => restoreRevision(rev.id)}
                                            className="px-2 py-1 rounded border border-gray-300 text-xs"
                                        >
                                            Restore
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <BlogMediaLibraryModal
                open={showMediaLibrary}
                title={
                    mediaTarget === "cover"
                        ? "Select Cover Media"
                        : mediaTarget === "og"
                        ? "Select OG Image"
                        : "Blog Media Library (Upload & Copy Links)"
                }
                onClose={() => setShowMediaLibrary(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
}
