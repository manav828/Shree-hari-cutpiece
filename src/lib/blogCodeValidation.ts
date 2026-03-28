export type CustomCodeBlock = {
    index: number;
    html: string;
    css: string;
    js: string;
};

export type CodeIssue = {
    errors: string[];
    warnings: string[];
};

const VOID_HTML_TAGS = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);

const MAX_ISSUES = 3;

function asTrimmedString(value: unknown): string {
    if (typeof value !== "string") return "";
    return value.trim();
}

export function getCustomCodeBlocks(layout: Record<string, unknown> | null): CustomCodeBlock[] {
    if (!layout) return [];
    if (!Array.isArray(layout.sections)) return [];

    const blocks: CustomCodeBlock[] = [];

    layout.sections.forEach((section, index) => {
        if (!section || typeof section !== "object") return;
        const block = section as Record<string, unknown>;
        if (block.type !== "custom_code") return;
        const content = (block.content ?? {}) as Record<string, unknown>;
        blocks.push({
            index,
            html: asTrimmedString(content.html),
            css: asTrimmedString(content.css),
            js: asTrimmedString(content.js),
        });
    });

    return blocks;
}

export function hasCustomJsInLayout(layout: Record<string, unknown> | null): boolean {
    return getCustomCodeBlocks(layout).some((block) => Boolean(block.js));
}

function checkHtmlIssues(html: string): CodeIssue {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!html.trim()) return { errors, warnings };

    if (/<script[\s>]/i.test(html)) {
        warnings.push("HTML contains <script> tags; move JS to the JS field.");
    }
    if (/<style[\s>]/i.test(html)) {
        warnings.push("HTML contains <style> tags; move CSS to the CSS field.");
    }

    const stack: string[] = [];
    const tagRegex = /<\/?([a-zA-Z0-9-]+)(\s[^>]*)?>/g;
    let match: RegExpExecArray | null = null;

    while ((match = tagRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();
        const isClosing = fullTag.startsWith("</");
        const isSelfClosing = fullTag.endsWith("/>") || VOID_HTML_TAGS.has(tagName);

        if (isClosing) {
            const expected = stack.pop();
            if (!expected) {
                errors.push(`HTML has an unmatched closing tag: </${tagName}>.`);
            } else if (expected !== tagName) {
                errors.push(`HTML tag mismatch: expected </${expected}> but found </${tagName}>.`);
            }
        } else if (!isSelfClosing) {
            stack.push(tagName);
        }

        if (errors.length >= MAX_ISSUES) break;
    }

    if (stack.length > 0 && errors.length < MAX_ISSUES) {
        const unclosed = stack.slice(-MAX_ISSUES).join(", ");
        errors.push(`HTML has unclosed tags: ${unclosed}.`);
    }

    return { errors, warnings };
}

function checkDelimiterBalance(value: string, label: string): string[] {
    const errors: string[] = [];
    const stack: string[] = [];
    const openers: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
    const closers = new Set(Object.values(openers));

    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;
    let inLineComment = false;
    let inBlockComment = false;
    let escaped = false;

    for (let i = 0; i < value.length; i += 1) {
        const char = value[i];
        const next = value[i + 1];

        if (inLineComment) {
            if (char === "\n") inLineComment = false;
            continue;
        }

        if (inBlockComment) {
            if (char === "*" && next === "/") {
                inBlockComment = false;
                i += 1;
            }
            continue;
        }

        if (inSingle) {
            if (!escaped && char === "'") {
                inSingle = false;
            }
            escaped = !escaped && char === "\\";
            continue;
        }

        if (inDouble) {
            if (!escaped && char === "\"") {
                inDouble = false;
            }
            escaped = !escaped && char === "\\";
            continue;
        }

        if (inTemplate) {
            if (!escaped && char === "`") {
                inTemplate = false;
            }
            escaped = !escaped && char === "\\";
            continue;
        }

        if (char === "/" && next === "/") {
            inLineComment = true;
            i += 1;
            continue;
        }

        if (char === "/" && next === "*") {
            inBlockComment = true;
            i += 1;
            continue;
        }

        if (char === "'") {
            inSingle = true;
            escaped = false;
            continue;
        }

        if (char === "\"") {
            inDouble = true;
            escaped = false;
            continue;
        }

        if (char === "`") {
            inTemplate = true;
            escaped = false;
            continue;
        }

        if (openers[char]) {
            stack.push(openers[char]);
            continue;
        }

        if (closers.has(char)) {
            const expected = stack.pop();
            if (expected !== char) {
                errors.push(`${label} has mismatched delimiter '${char}'.`);
                if (errors.length >= MAX_ISSUES) break;
            }
        }
    }

    if (stack.length > 0 && errors.length < MAX_ISSUES) {
        errors.push(`${label} has unclosed delimiters.`);
    }

    return errors;
}

export function getCodeIssuesForBlock(block: { html?: string; css?: string; js?: string }): CodeIssue {
    const errors: string[] = [];
    const warnings: string[] = [];

    const html = asTrimmedString(block.html);
    const css = asTrimmedString(block.css);
    const js = asTrimmedString(block.js);

    if (html) {
        const htmlIssues = checkHtmlIssues(html);
        errors.push(...htmlIssues.errors);
        warnings.push(...htmlIssues.warnings);
    }

    if (css) {
        errors.push(...checkDelimiterBalance(css, "CSS"));
    }

    if (js) {
        errors.push(...checkDelimiterBalance(js, "JS"));
    }

    return { errors, warnings };
}
