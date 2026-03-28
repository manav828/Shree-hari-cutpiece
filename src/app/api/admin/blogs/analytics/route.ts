import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { cleanString, toNumber } from "@/lib/blogs";

const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 180;

function clampRangeDays(value: number): number {
    if (!Number.isFinite(value)) return DEFAULT_RANGE_DAYS;
    return Math.min(Math.max(value, 1), MAX_RANGE_DAYS);
}

function dateKey(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "unknown";
    return date.toISOString().slice(0, 10);
}

function bucketReferrer(referrer: string | null): string {
    if (!referrer) return "Direct";
    const lower = referrer.toLowerCase();

    if (lower.includes("google")) return "Google Organic";
    if (lower.includes("whatsapp") || lower.includes("wa.me")) return "WhatsApp";
    if (lower.includes("instagram")) return "Instagram";
    if (lower.includes("facebook") || lower.includes("fb.com")) return "Facebook";

    return "Other";
}

type EventCounters = {
    views: number;
    productClicks: number;
    collectionClicks: number;
    ctaClicks: number;
    shareClicks: number;
};

function emptyCounters(): EventCounters {
    return { views: 0, productClicks: 0, collectionClicks: 0, ctaClicks: 0, shareClicks: 0 };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const rangeDays = clampRangeDays(toNumber(searchParams.get("days"), DEFAULT_RANGE_DAYS));
        const postId = cleanString(searchParams.get("postId"));

        const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
        const lowTrafficSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        let postQuery = supabaseAdmin
            .from("blog_posts")
            .select("id, title, status, seo_meta_title, seo_meta_description, cover_media_id, show_cover, published_at");

        if (postId) {
            postQuery = postQuery.eq("id", postId);
        } else {
            postQuery = postQuery.eq("status", "published");
        }

        const [postsRes, eventsRes] = await Promise.all([
            postQuery,
            supabaseAdmin
                .from("blog_analytics_events")
                .select("post_id, event_type, referrer, device_type, event_at")
                .gte("event_at", since),
        ]);

        if (postsRes.error) throw postsRes.error;
        if (eventsRes.error && eventsRes.error.code !== "PGRST116") throw eventsRes.error;

        const posts = (postsRes.data ?? []) as Array<{
            id: string;
            title: string;
            status: string;
            seo_meta_title: string | null;
            seo_meta_description: string | null;
            cover_media_id: string | null;
            show_cover?: boolean | null;
        }>;

        const events = (eventsRes.data ?? []) as Array<{
            post_id: string;
            event_type: string;
            referrer: string | null;
            device_type: string | null;
            event_at: string;
        }>;

        let lowTrafficEvents: Array<{ post_id: string; event_type: string; event_at: string }> = events.map((event) => ({
            post_id: event.post_id,
            event_type: event.event_type,
            event_at: event.event_at,
        }));

        const countersByPost = new Map<string, EventCounters>();
        const seriesMap = new Map<string, EventCounters>();
        const referrerCounts = new Map<string, number>();
        const deviceCounts = new Map<string, number>();

        for (const event of events) {
            if (!countersByPost.has(event.post_id)) countersByPost.set(event.post_id, emptyCounters());
            const counters = countersByPost.get(event.post_id) ?? emptyCounters();

            if (event.event_type === "page_view") counters.views += 1;
            if (event.event_type === "product_click") counters.productClicks += 1;
            if (event.event_type === "collection_click") counters.collectionClicks += 1;
            if (event.event_type === "cta_click") counters.ctaClicks += 1;
            if (event.event_type === "share_click") counters.shareClicks += 1;

            countersByPost.set(event.post_id, counters);

            const key = dateKey(event.event_at);
            if (!seriesMap.has(key)) seriesMap.set(key, emptyCounters());
            const seriesCounters = seriesMap.get(key) ?? emptyCounters();

            if (event.event_type === "page_view") seriesCounters.views += 1;
            if (event.event_type === "product_click") seriesCounters.productClicks += 1;
            if (event.event_type === "collection_click") seriesCounters.collectionClicks += 1;
            if (event.event_type === "cta_click") seriesCounters.ctaClicks += 1;
            if (event.event_type === "share_click") seriesCounters.shareClicks += 1;

            seriesMap.set(key, seriesCounters);

            const refBucket = bucketReferrer(event.referrer);
            referrerCounts.set(refBucket, (referrerCounts.get(refBucket) ?? 0) + 1);

            const device = event.device_type ?? "unknown";
            deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);
        }

        const totalViews = Array.from(countersByPost.values()).reduce((acc, item) => acc + item.views, 0);
        const totalProductClicks = Array.from(countersByPost.values()).reduce((acc, item) => acc + item.productClicks, 0);

        const topPost = posts
            .map((post) => ({
                id: post.id,
                title: post.title,
                views: countersByPost.get(post.id)?.views ?? 0,
            }))
            .sort((a, b) => b.views - a.views)[0] ?? null;

        const topPostsByCtr = posts
            .map((post) => {
                const counters = countersByPost.get(post.id) ?? emptyCounters();
                const ctr = counters.views > 0 ? counters.productClicks / counters.views : 0;
                return { id: post.id, title: post.title, views: counters.views, product_clicks: counters.productClicks, ctr };
            })
            .filter((row) => row.views > 0)
            .sort((a, b) => b.ctr - a.ctr)
            .slice(0, 5);

        const postMetrics = posts.map((post) => {
            const counters = countersByPost.get(post.id) ?? emptyCounters();
            return {
                post_id: post.id,
                views: counters.views,
                product_clicks: counters.productClicks,
                collection_clicks: counters.collectionClicks,
                cta_clicks: counters.ctaClicks,
                share_clicks: counters.shareClicks,
            };
        });

        const coverMediaIds = posts.map((post) => post.cover_media_id).filter(Boolean) as string[];
        let coverAltById = new Map<string, string | null>();
        if (coverMediaIds.length > 0) {
            const { data: mediaRows, error: mediaError } = await supabaseAdmin
                .from("blog_media_library")
                .select("id, alt_text")
                .in("id", coverMediaIds);

            if (mediaError) throw mediaError;
            coverAltById = new Map((mediaRows ?? []).map((row) => [row.id, row.alt_text ?? null]));
        }

        if (rangeDays < 30) {
            const { data: lowTrafficData, error: lowTrafficError } = await supabaseAdmin
                .from("blog_analytics_events")
                .select("post_id, event_type, event_at")
                .gte("event_at", lowTrafficSince);

            if (lowTrafficError) throw lowTrafficError;
            lowTrafficEvents = (lowTrafficData ?? []) as Array<{ post_id: string; event_type: string; event_at: string }>;
        }

        const lowTrafficCounts = new Map<string, number>();
        for (const event of lowTrafficEvents) {
            if (event.event_type !== "page_view") continue;
            lowTrafficCounts.set(event.post_id, (lowTrafficCounts.get(event.post_id) ?? 0) + 1);
        }

        const lowTrafficPostIds = posts
            .filter((post) => (lowTrafficCounts.get(post.id) ?? 0) === 0)
            .map((post) => post.id);

        const seoIncompletePostIds = posts
            .filter((post) => {
                if (!post.seo_meta_title?.trim()) return true;
                if (!post.seo_meta_description?.trim()) return true;
                const requiresCover = post.show_cover !== false;
                if (!requiresCover) return false;
                if (!post.cover_media_id) return true;
                const coverAlt = coverAltById.get(post.cover_media_id);
                if (coverAlt === null || typeof coverAlt === "undefined") return true;
                return coverAlt.trim() === "";
            })
            .map((post) => post.id);

        const relatedProductsRes = await supabaseAdmin
            .from("blog_post_related_products")
            .select("post_id")
            .in("post_id", posts.map((post) => post.id));

        if (relatedProductsRes.error) throw relatedProductsRes.error;

        const relatedPostSet = new Set((relatedProductsRes.data ?? []).map((row: { post_id: string }) => row.post_id));
        const unlinkedPostIds = posts.filter((post) => !relatedPostSet.has(post.id)).map((post) => post.id);

        const series = Array.from(seriesMap.entries())
            .map(([day, counters]) => ({
                date: day,
                views: counters.views,
                product_clicks: counters.productClicks,
                collection_clicks: counters.collectionClicks,
                cta_clicks: counters.ctaClicks,
                share_clicks: counters.shareClicks,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const referrers = Array.from(referrerCounts.entries())
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count);

        const devices = Array.from(deviceCounts.entries()).reduce<Record<string, number>>((acc, [device, count]) => {
            acc[device] = count;
            return acc;
        }, {});

        return NextResponse.json({
            range_days: rangeDays,
            post_id: postId || null,
            summary: {
                total_published_posts: posts.length,
                total_views: totalViews,
                total_product_clicks: totalProductClicks,
                top_post: topPost,
            },
            post_metrics: postMetrics,
            series,
            referrers,
            devices,
            top_posts_by_ctr: topPostsByCtr,
            content_health: {
                low_traffic_post_ids: lowTrafficPostIds,
                seo_incomplete_post_ids: seoIncompletePostIds,
                unlinked_post_ids: unlinkedPostIds,
            },
            unavailable_metrics: [
                "unique_visitors",
                "average_time_on_page",
                "bounce_rate",
            ],
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch blog analytics";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
