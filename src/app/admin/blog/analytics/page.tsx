"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { showToast } from "@/lib/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";

type AnalyticsResponse = {
    range_days: number;
    summary: {
        total_published_posts: number;
        total_views: number;
        total_product_clicks: number;
        top_post: { id: string; title: string; views: number } | null;
    };
    series: Array<{
        date: string;
        views: number;
        product_clicks: number;
        collection_clicks: number;
        cta_clicks: number;
        share_clicks: number;
    }>;
    referrers: Array<{ source: string; count: number }>;
    devices: Record<string, number>;
    top_posts_by_ctr: Array<{ id: string; title: string; views: number; product_clicks: number; ctr: number }>;
    content_health: {
        low_traffic_post_ids: string[];
        seo_incomplete_post_ids: string[];
        unlinked_post_ids: string[];
    };
    unavailable_metrics: string[];
};

function formatDateLabel(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function BlogAnalyticsPage() {
    const [rangeDays, setRangeDays] = useState(30);
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadAnalytics = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/blogs/analytics?days=${rangeDays}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to load analytics");
                if (!isMounted) return;
                setData(json as AnalyticsResponse);
            } catch (err: unknown) {
                if (!isMounted) return;
                showToast(err instanceof Error ? err.message : "Failed to load analytics", "error");
                setData(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadAnalytics();
        return () => {
            isMounted = false;
        };
    }, [rangeDays]);

    const totals = useMemo(() => {
        if (!data) return { product: 0, collection: 0, cta: 0, share: 0 };
        return data.series.reduce(
            (acc, item) => {
                acc.product += item.product_clicks;
                acc.collection += item.collection_clicks;
                acc.cta += item.cta_clicks;
                acc.share += item.share_clicks;
                return acc;
            },
            { product: 0, collection: 0, cta: 0, share: 0 },
        );
    }, [data]);

    const maxViews = useMemo(() => {
        if (!data || data.series.length === 0) return 1;
        return Math.max(...data.series.map((item) => item.views), 1);
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Blog Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Track blog traffic and conversion signals.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/blog"
                        className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                    >
                        Back to Blog
                    </Link>
                    <select
                        value={rangeDays}
                        onChange={(e) => setRangeDays(Number(e.target.value))}
                        className="px-3 py-2 rounded-md border border-gray-300 text-xs bg-white"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500">Loading analytics...</p>
            ) : data ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs text-gray-500">Total Views</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-2">{data.summary.total_views}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs text-gray-500">Published Posts</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-2">{data.summary.total_published_posts}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs text-gray-500">Product Clicks</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-2">{data.summary.total_product_clicks}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs text-gray-500">Top Post</p>
                            <p className="text-sm font-semibold text-gray-900 mt-2">
                                {data.summary.top_post?.title || "No data"}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-900">Views Over Time</h2>
                            <span className="text-xs text-gray-400">{data.range_days} days</span>
                        </div>
                        <div className="space-y-2">
                            {data.series.map((item) => (
                                <div key={item.date} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-16">{formatDateLabel(item.date)}</span>
                                    <div className="flex-1 h-2 rounded-full bg-gray-100">
                                        <div
                                            className="h-2 rounded-full bg-gray-900"
                                            style={{ width: `${(item.views / maxViews) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-600 w-12 text-right">{item.views}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Referrers</h2>
                            <ul className="space-y-2 text-sm">
                                {data.referrers.map((item) => (
                                    <li key={item.source} className="flex items-center justify-between">
                                        <span className="text-gray-600">{item.source}</span>
                                        <span className="font-medium text-gray-900">{item.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Device Split</h2>
                            <ul className="space-y-2 text-sm">
                                {Object.entries(data.devices).map(([device, count]) => (
                                    <li key={device} className="flex items-center justify-between">
                                        <span className="text-gray-600">{device}</span>
                                        <span className="font-medium text-gray-900">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Conversion Events</h2>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-600">Product clicks</span>
                                    <span className="font-medium text-gray-900">{totals.product}</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-600">Collection clicks</span>
                                    <span className="font-medium text-gray-900">{totals.collection}</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-600">CTA clicks</span>
                                    <span className="font-medium text-gray-900">{totals.cta}</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-600">Share clicks</span>
                                    <span className="font-medium text-gray-900">{totals.share}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Posts by CTR</h2>
                        {data.top_posts_by_ctr.length === 0 ? (
                            <p className="text-sm text-gray-500">No CTR data yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Post</TableHead>
                                        <TableHead>Views</TableHead>
                                        <TableHead>Product Clicks</TableHead>
                                        <TableHead>CTR</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.top_posts_by_ctr.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium text-gray-900">
                                                <Link href={`/admin/blog/${row.id}`} className="hover:underline">
                                                    {row.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-gray-700 font-medium">{row.views}</TableCell>
                                            <TableCell className="text-gray-700 font-medium">{row.product_clicks}</TableCell>
                                            <TableCell className="text-gray-750 font-bold">{(row.ctr * 100).toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Content Health</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="rounded-md border border-gray-100 px-4 py-3">
                                <p className="text-gray-500">Low Traffic</p>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{data.content_health.low_traffic_post_ids.length}</p>
                            </div>
                            <div className="rounded-md border border-gray-100 px-4 py-3">
                                <p className="text-gray-500">SEO Incomplete</p>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{data.content_health.seo_incomplete_post_ids.length}</p>
                            </div>
                            <div className="rounded-md border border-gray-100 px-4 py-3">
                                <p className="text-gray-500">Unlinked Products</p>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{data.content_health.unlinked_post_ids.length}</p>
                            </div>
                        </div>
                    </div>

                    {data.unavailable_metrics.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                            <p className="font-semibold">Unavailable metrics</p>
                            <p className="mt-1">{data.unavailable_metrics.join(", ")}</p>
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}
