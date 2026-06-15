import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchSupabase(path: string, params: URLSearchParams) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    const url = `${SUPABASE_URL}/rest/v1/${path}?${params.toString()}`;
    const res = await fetch(url, {
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            Accept: "application/json",
        },
        cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
}

async function resolveRedirect(slug: string, language: string) {
    const params = new URLSearchParams({
        select: "new_slug,blog_posts(slug,language,status)",
        old_slug: `eq.${slug}`,
    });
    const data = await fetchSupabase("blog_slug_redirects", params);
    if (!Array.isArray(data) || data.length === 0) return null;
    const record = data[0] as { new_slug: string; blog_posts?: { slug?: string; language?: string; status?: string } | null };
    const target = record.blog_posts;
    if (!target || target.status !== "published") return null;
    if (target.language !== language) return null;
    return record.new_slug || target.slug || null;
}

async function isUnpublished(slug: string, language: string) {
    const params = new URLSearchParams({
        select: "id",
        slug: `eq.${slug}`,
        language: `eq.${language}`,
        status: "eq.unpublished",
        limit: "1",
    });
    const data = await fetchSupabase("blog_posts", params);
    return Array.isArray(data) && data.length > 0;
}

async function getUserIdFromToken(token: string) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });
        if (!res.ok) return null;
        const user = await res.json();
        return user?.id || null;
    } catch {
        return null;
    }
}

async function checkAdminRole(userId: string) {
    const params = new URLSearchParams({
        select: "role",
        id: `eq.${userId}`,
    });
    const data = await fetchSupabase("user_profiles", params);
    if (!Array.isArray(data) || data.length === 0) return false;
    return data[0].role === "admin";
}

export async function middleware(req: NextRequest) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return NextResponse.next();

    const { pathname } = req.nextUrl;

    // Admin Access Security Check
    if (pathname === "/admin/login") {
        const token = req.cookies.get("shreehari_admin_session")?.value;
        if (token) {
            const userId = await getUserIdFromToken(token);
            if (userId && await checkAdminRole(userId)) {
                return NextResponse.redirect(new URL("/admin", req.url));
            }
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/admin")) {
        const token = req.cookies.get("shreehari_admin_session")?.value;
        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
        const userId = await getUserIdFromToken(token);
        if (!userId || !(await checkAdminRole(userId))) {
            const response = NextResponse.redirect(new URL("/admin/login", req.url));
            response.cookies.delete("shreehari_admin_session");
            return response;
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/blog-gone") || pathname.startsWith("/hi/blog-gone")) return NextResponse.next();

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return NextResponse.next();

    let slug = "";
    let language = "en";
    let gonePath = "/blog-gone";

    if (segments[0] === "blogs") {
        if (segments.length < 2) return NextResponse.next();
        slug = segments[1];
        language = "en";
    } else if (segments[0] === "hi" && segments[1] === "blogs") {
        if (segments.length < 3) return NextResponse.next();
        slug = segments[2];
        language = "hi";
        gonePath = "/hi/blog-gone";
    } else {
        return NextResponse.next();
    }

    if (!slug) return NextResponse.next();

    const redirectSlug = await resolveRedirect(slug, language);
    if (redirectSlug) {
        const targetPath = language === "hi" ? `/hi/blogs/${redirectSlug}` : `/blogs/${redirectSlug}`;
        return NextResponse.redirect(new URL(targetPath, req.url), 301);
    }

    if (await isUnpublished(slug, language)) {
        return NextResponse.rewrite(new URL(gonePath, req.url), { status: 410 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/blogs/:path*", "/hi/blogs/:path*", "/admin/:path*"],
};
