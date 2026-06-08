"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    slug: string;
    status: "draft" | "scheduled" | "published" | "unpublished";
    language: "en" | "hi" | "other";
    author_name: string | null;
    published_at: string | null;
    scheduled_for: string | null;
    category: BlogCategory | null;
    tags: BlogTag[];
    created_at: string;
    updated_at: string;
};

type BlogAnalyticsSummary = {
    total_published_posts: number;
    total_views: number;
    total_product_clicks: number;
    top_post: { id: string; title: string; views: number } | null;
};

type BlogAnalyticsResponse = {
    summary: BlogAnalyticsSummary;
    content_health: {
        low_traffic_post_ids: string[];
        seo_incomplete_post_ids: string[];
        unlinked_post_ids: string[];
    };
    post_metrics: Array<{
        post_id: string;
        views: number;
    }>;
};

type BlogPublishNotification = {
    id: string;
    post_id: string | null;
    status: "published" | "draft" | "error";
    message: string | null;
    details?: { errors?: string[] } | null;
    created_at: string;
    blog_posts?: { title?: string | null; slug?: string | null } | null;
};

const STATUS_LABELS: Record<BlogListPost["status"], string> = {
    draft: "Draft",
    scheduled: "Scheduled",
    published: "Published",
    unpublished: "Unpublished",
};

function formatDate(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

function formatIstDateTime(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });
}

export default function AdminBlog() {
    const [posts, setPosts] = useState<BlogListPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [tags, setTags] = useState<BlogTag[]>([]);
    const [analytics, setAnalytics] = useState<BlogAnalyticsResponse | null>(null);
    const [notifications, setNotifications] = useState<BlogPublishNotification[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [language, setLanguage] = useState("all");
    const [categoryId, setCategoryId] = useState("all");
    const [tagId, setTagId] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const params = useMemo(() => {
        const query = new URLSearchParams();
        query.set("page", String(page));
        query.set("limit", String(limit));
        query.set("sortBy", "updated_at");
        query.set("sortOrder", "desc");
        if (search.trim()) query.set("search", search.trim());
        if (status !== "all") query.set("status", status);
        if (language !== "all") query.set("language", language);
        if (categoryId !== "all") query.set("categoryId", categoryId);
        if (tagId !== "all") query.set("tagId", tagId);
        if (dateFrom) query.set("dateFrom", dateFrom);
        if (dateTo) query.set("dateTo", dateTo);
        return query.toString();
    }, [page, limit, search, status, language, categoryId, tagId, dateFrom, dateTo]);

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [categoryRes, tagRes] = await Promise.all([
                    fetch("/api/admin/blogs/categories"),
                    fetch("/api/admin/blogs/tags"),
                ]);

                const categoryJson = await categoryRes.json();
                const tagJson = await tagRes.json();

                if (categoryRes.ok) setCategories(categoryJson.categories ?? []);
                if (tagRes.ok) setTags(tagJson.tags ?? []);
            } catch {
                // Ignore filter load errors.
            }
        };

        loadFilters();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadPosts = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/admin/blogs?${params}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to fetch blog posts");

                if (!isMounted) return;

                setPosts(json.posts ?? []);
                setTotal(json.total ?? 0);
                setTotalPages(json.total_pages ?? 1);
                setSelected({});
            } catch (err: unknown) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to fetch blog posts");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPosts();
        return () => {
            isMounted = false;
        };
    }, [params]);

    useEffect(() => {
        let isMounted = true;

        const loadAnalytics = async () => {
            setAnalyticsLoading(true);
            try {
                const res = await fetch("/api/admin/blogs/analytics?days=30");
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to load analytics");
                if (!isMounted) return;
                setAnalytics(json as BlogAnalyticsResponse);
            } catch {
                if (!isMounted) return;
                setAnalytics(null);
            } finally {
                if (isMounted) setAnalyticsLoading(false);
            }
        };

        loadAnalytics();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadNotifications = async () => {
            setNotificationsLoading(true);
            try {
                const res = await fetch("/api/admin/blogs/notifications?limit=10");
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to load notifications");
                if (!isMounted) return;
                setNotifications(json.notifications ?? []);
            } catch {
                if (!isMounted) return;
                setNotifications([]);
            } finally {
                if (isMounted) setNotificationsLoading(false);
            }
        };

        loadNotifications();
        return () => {
            isMounted = false;
        };
    }, []);

    const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
    const viewsByPost = useMemo(() => {
        const map = new Map<string, number>();
        analytics?.post_metrics?.forEach((row) => map.set(row.post_id, row.views));
        return map;
    }, [analytics]);

    const healthFlags = useMemo(() => {
        const lowTraffic = new Set(analytics?.content_health?.low_traffic_post_ids ?? []);
        const seoIncomplete = new Set(analytics?.content_health?.seo_incomplete_post_ids ?? []);
        const unlinked = new Set(analytics?.content_health?.unlinked_post_ids ?? []);
        return { lowTraffic, seoIncomplete, unlinked };
    }, [analytics]);

    const toggleSelectAll = () => {
        if (selectedIds.length === posts.length) {
            setSelected({});
            return;
        }
        const next: Record<string, boolean> = {};
        posts.forEach((post) => {
            next[post.id] = true;
        });
        setSelected(next);
    };



    const runBulkAction = async (action: "publish" | "unpublish" | "delete") => {
        if (selectedIds.length === 0) return;
        if (action === "delete") {
            const confirmed = window.confirm("Delete selected posts? This cannot be undone.");
            if (!confirmed) return;
        }

        try {
            const payload = action === "delete"
                ? { action: "bulk-delete", ids: selectedIds }
                : { action: "bulk-status", ids: selectedIds, status: action === "publish" ? "published" : "unpublished" };

            const res = await fetch("/api/admin/blogs", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Bulk action failed");

            setSelected({});
            const refresh = await fetch(`/api/admin/blogs?${params}`);
            const refreshJson = await refresh.json();
            if (refresh.ok) {
                setPosts(refreshJson.posts ?? []);
                setTotal(refreshJson.total ?? 0);
                setTotalPages(refreshJson.total_pages ?? 1);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Bulk action failed");
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Blog Management</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} posts across all statuses</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/blog/analytics"
                        className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50"
                    >
                        Analytics
                    </Link>
                    <Link
                        href="/admin/blog/new"
                        className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium"
                    >
                        Create Post
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Published Posts</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {analyticsLoading ? "..." : (analytics?.summary?.total_published_posts ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Views (30 days)</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {analyticsLoading ? "..." : (analytics?.summary?.total_views ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Product Clicks</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {analyticsLoading ? "..." : (analytics?.summary?.total_product_clicks ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Top Post (Views)</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                        {analyticsLoading
                            ? "..."
                            : (analytics?.summary?.top_post?.title || "No data")}
                    </p>
                </div>
            </div>

            {!notificationsLoading && notifications.length > 0 && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-gray-900">Scheduler Updates</h2>
                        <span className="text-[11px] text-gray-400">IST</span>
                    </div>
                    <ul className="space-y-3 text-sm">
                        {notifications.map((item) => {
                            const title = item.blog_posts?.title || "Unknown post";
                            const message = item.message
                                || (item.details?.errors && item.details.errors.length > 0
                                    ? item.details.errors.join(" ")
                                    : "Update recorded.");
                            const badgeClass = item.status === "published"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "draft"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700";

                            return (
                                <li key={item.id} className="flex flex-col gap-2 rounded-md border border-gray-100 px-3 py-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        {item.post_id ? (
                                            <Link href={`/admin/blog/${item.post_id}`} className="font-medium text-gray-900 hover:underline">
                                                {title}
                                            </Link>
                                        ) : (
                                            <p className="font-medium text-gray-900">{title}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">{message}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                        <p className="text-[11px] text-gray-400 mt-1">{formatIstDateTime(item.created_at)}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Search by title or slug"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full lg:w-96 px-3 py-2 rounded-md border border-gray-300 text-sm"
                        />

                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="published">Published</option>
                            <option value="unpublished">Unpublished</option>
                        </select>

                        <select
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                        >
                            <option value="all">All Languages</option>
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="other">Other</option>
                        </select>

                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>

                        <select
                            value={tagId}
                            onChange={(e) => {
                                setTagId(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                        >
                            <option value="all">All Tags</option>
                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                            />
                        </div>

                        <div className="flex items-end sm:col-span-2">
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setStatus("all");
                                    setLanguage("all");
                                    setCategoryId("all");
                                    setTagId("all");
                                    setDateFrom("");
                                    setDateTo("");
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                        <span className="text-gray-600">{selectedIds.length} selected</span>
                        <button
                            onClick={() => runBulkAction("publish")}
                            className="px-3 py-1.5 rounded border border-gray-300 text-xs font-medium hover:bg-gray-50"
                        >
                            Publish
                        </button>
                        <button
                            onClick={() => runBulkAction("unpublish")}
                            className="px-3 py-1.5 rounded border border-gray-300 text-xs font-medium hover:bg-gray-50"
                        >
                            Unpublish
                        </button>
                        <button
                            onClick={() => runBulkAction("delete")}
                            className="px-3 py-1.5 rounded border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                            Delete
                        </button>
                    </div>
                )}

                {loading ? (
                    <p className="text-sm text-gray-500">Loading posts...</p>
                ) : posts.length === 0 ? (
                    <p className="text-sm text-gray-500">No blog posts found.</p>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th className="py-2 pl-6 pr-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length > 0 && selectedIds.length === posts.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="py-2 pr-4">Title</th>
                                    <th className="py-2 pr-4">Category</th>
                                    <th className="py-2 pr-4">Language</th>
                                    <th className="py-2 pr-4">Status</th>
                                    <th className="py-2 pr-4 text-left">Schedule</th>
                                    <th className="py-2 pr-4 text-left">Publish Date</th>
                                    <th className="py-2 pr-4 text-left">Views (30d)</th>
                                    <th className="py-2 pr-4 text-left">Health</th>
                                    <th className="py-2 pl-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => {
                                    const views = viewsByPost.get(post.id) ?? 0;
                                    const lowTraffic = healthFlags.lowTraffic.has(post.id);
                                    const seoIncomplete = healthFlags.seoIncomplete.has(post.id);
                                    const unlinked = healthFlags.unlinked.has(post.id);

                                    return (
                                        <tr key={post.id} className="border-b border-gray-100">
                                            <td className="py-3 pl-6 pr-4">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(selected[post.id])}
                                                    onChange={(e) => setSelected((prev) => ({ ...prev, [post.id]: e.target.checked }))}
                                                />
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Link href={`/admin/blog/${post.id}`} className="font-medium text-gray-900 hover:underline">
                                                    {post.title}
                                                </Link>
                                                <p className="text-xs text-gray-500">/{post.slug}</p>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-700">{post.category?.name ?? "-"}</td>
                                            <td className="py-3 pr-4 text-gray-700">{post.language.toUpperCase()}</td>
                                            <td className="py-3 pr-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${post.status === "published"
                                                    ? "bg-green-100 text-green-700"
                                                    : post.status === "scheduled"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : post.status === "draft"
                                                            ? "bg-gray-100 text-gray-700"
                                                            : "bg-slate-100 text-slate-700"
                                                    }`}
                                                >
                                                    {STATUS_LABELS[post.status]}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-750 whitespace-nowrap">
                                                {formatIstDateTime(post.scheduled_for)}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-700">{formatDate(post.published_at)}</td>
                                            <td className="py-3 pr-4 text-gray-700">{views}</td>
                                            <td className="py-3 pr-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {lowTraffic && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[11px]">Low Traffic</span>}
                                                    {seoIncomplete && <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px]">SEO Incomplete</span>}
                                                    {unlinked && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[11px]">Unlinked</span>}
                                                    {!lowTraffic && !seoIncomplete && !unlinked && (
                                                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[11px]">Healthy</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 pl-4 pr-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/blog/${post.id}`}
                                                        className="px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-750 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-xs bg-white"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                        <p className="text-[12px] text-gray-500">
                            Showing{" "}
                            <span className="font-medium text-gray-700">
                                {posts.length > 0 ? (page - 1) * limit + 1 : 0}–
                                {Math.min(page * limit, total)}
                            </span>{" "}
                            of <span className="font-medium text-gray-700">{total}</span> blogs
                        </p>
                        <div className="flex items-center justify-center">
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white text-gray-600 outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={250}>250</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page <= 1 || loading}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-[12px] text-gray-600 font-medium">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page >= totalPages || loading}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
