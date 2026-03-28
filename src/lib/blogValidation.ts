import type { BlogPost } from "@/types/blogs";
import { getCodeIssuesForBlock, getCustomCodeBlocks } from "@/lib/blogCodeValidation";

export type BlogValidationResult = {
    valid: boolean;
    errors: string[];
    warnings: string[];
};

function hasMissingAltText(layout: Record<string, unknown> | null): boolean {
    if (!layout) return false;
    if (!Array.isArray(layout.sections)) return false;

    return layout.sections.some((section) => {
        if (!section || typeof section !== "object") return false;
        const block = section as Record<string, unknown>;
        const type = typeof block.type === "string" ? block.type.toLowerCase() : "";
        if (!type.includes("image") && !type.includes("gallery")) return false;

        if (Object.prototype.hasOwnProperty.call(block, "alt_text")) {
            return !String(block.alt_text || "").trim();
        }
        if (Object.prototype.hasOwnProperty.call(block, "altText")) {
            return !String(block.altText || "").trim();
        }
        return false;
    });
}

function getCustomCodeSummary(layout: Record<string, unknown> | null) {
    const blocks = getCustomCodeBlocks(layout);
    let hasJs = false;
    let emptyBlocks = 0;

    blocks.forEach((block) => {
        if (block.js) hasJs = true;
        if (!block.html && !block.css && !block.js) emptyBlocks += 1;
    });

    return { hasJs, emptyBlocks, blocks };
}

export function validateBlogPostForPublish(post: BlogPost, coverAltText?: string | null): BlogValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiresCover = post.show_cover !== false;

    if (!post.title?.trim()) errors.push("Title is required.");
    if (!post.slug?.trim()) errors.push("Slug is required.");
    if (requiresCover && !post.cover_media_id) errors.push("Cover image is required for publish.");
    if (!post.seo_meta_title?.trim()) errors.push("SEO meta title is required for publish.");
    if (!post.seo_meta_description?.trim()) errors.push("SEO meta description is required for publish.");

    if (post.status === "scheduled" && !post.scheduled_for) {
        errors.push("Scheduled posts require a publish date/time.");
    }

    if (post.editor_mode === "full_code") {
        if (!post.full_page_html?.trim()) errors.push("Full page HTML is required in code mode.");
        const codeIssues = getCodeIssuesForBlock({
            html: post.full_page_html ?? "",
            css: post.full_page_css ?? "",
            js: post.full_page_js ?? "",
        });
        codeIssues.errors.forEach((issue) => errors.push(`Code mode: ${issue}`));
        codeIssues.warnings.forEach((issue) => warnings.push(`Code mode: ${issue}`));
        if (post.full_page_js?.trim() && !post.custom_js_acknowledged) {
            errors.push("Custom JS requires explicit acknowledgment before publish.");
        }
    }

    if (post.editor_mode === "visual") {
        const { hasJs, emptyBlocks, blocks } = getCustomCodeSummary(post.builder_layout as Record<string, unknown> | null);
        if (hasJs && !post.custom_js_acknowledged) {
            errors.push("Custom JS sections require explicit acknowledgment before publish.");
        }
        if (emptyBlocks > 0) {
            warnings.push("One or more custom code sections are empty.");
        }
        blocks.forEach((block) => {
            const issues = getCodeIssuesForBlock(block);
            issues.errors.forEach((issue) => errors.push(`Section ${block.index + 1} custom code: ${issue}`));
            issues.warnings.forEach((issue) => warnings.push(`Section ${block.index + 1} custom code: ${issue}`));
        });
    }

    if (post.editor_mode === "visual" && !post.builder_layout) {
        warnings.push("Visual builder content is empty.");
    }

    if (requiresCover && coverAltText === "") {
        errors.push("Cover image alt text is required for publish.");
    }

    if (hasMissingAltText(post.builder_layout as Record<string, unknown> | null)) {
        errors.push("One or more image blocks are missing alt text.");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
