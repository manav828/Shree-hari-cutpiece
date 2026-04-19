"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, Search, Trash2, X } from "lucide-react";

export type BlogMediaItem = {
    id: string;
    file_name: string;
    public_url: string;
    alt_text: string | null;
    file_size_bytes: number | null;
    width: number | null;
    height: number | null;
    created_at: string | null;
};

type Props = {
    open: boolean;
    title?: string;
    onClose: () => void;
    onSelect: (media: BlogMediaItem) => void;
};

function formatBytes(value: number | null): string {
    if (!value || value <= 0) return "-";
    const units = ["B", "KB", "MB", "GB"];
    let size = value;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit += 1;
    }
    return `${size.toFixed(1)} ${units[unit]}`;
}

function formatDate(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function BlogMediaLibraryModal({ open, title, onClose, onSelect }: Props) {
    const [media, setMedia] = useState<BlogMediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadAltText, setUploadAltText] = useState("");
    const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
    const [savingAlt, setSavingAlt] = useState<Record<string, boolean>>({});

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "24");
        if (search.trim()) params.set("search", search.trim());
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        return params.toString();
    }, [page, search, dateFrom, dateTo]);

    const loadMedia = useCallback(async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`/api/admin/blogs/media?${queryString}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load media");
            setMedia(json.media ?? []);
            setTotalPages(json.total_pages ?? 1);
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : "Failed to load media");
        } finally {
            setLoading(false);
        }
    }, [queryString]);

    useEffect(() => {
        if (!open) return;
        loadMedia();
    }, [open, loadMedia]);

    useEffect(() => {
        if (!open) return;
        setPage(1);
    }, [open, search, dateFrom, dateTo]);

    const handleUpload = async () => {
        if (!uploadFile) {
            setMessage("Select an image file to upload.");
            return;
        }

        setSaving(true);
        setMessage("");
        try {
            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("alt_text", uploadAltText.trim());

            const res = await fetch("/api/admin/blogs/media", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to upload media");

            setUploadFile(null);
            setUploadAltText("");
            await loadMedia();
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : "Failed to upload media");
        } finally {
            setSaving(false);
        }
    };

    const handleAltSave = async (id: string) => {
        const nextAlt = altDrafts[id] ?? "";
        setSavingAlt((prev) => ({ ...prev, [id]: true }));
        setMessage("");
        try {
            const res = await fetch("/api/admin/blogs/media", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, alt_text: nextAlt }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update alt text");
            setMedia((prev) => prev.map((item) => (item.id === id ? { ...item, alt_text: nextAlt } : item)));
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : "Failed to update alt text");
        } finally {
            setSavingAlt((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleDelete = async (id: string) => {
        const ok = window.confirm("Delete this media asset? This cannot be undone.");
        if (!ok) return;
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/admin/blogs/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to delete media");
            setMedia((prev) => prev.filter((item) => item.id !== id));
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : "Failed to delete media");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{title || "Blog Media Library"}</h2>
                        <p className="text-xs text-gray-500">Upload, search, and reuse blog media assets.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                        aria-label="Close media library"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    {message && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_2fr]">
                        <div className="rounded-xl border border-gray-200 bg-slate-50/60 p-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-700">Upload New Media</p>
                            <div className="rounded-md border border-dashed border-gray-300 bg-white px-3 py-4 text-xs text-gray-500">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                                    className="text-xs"
                                />
                                <p className="mt-2">Allowed: JPG, PNG, WebP up to 10 MB.</p>
                            </div>
                            <input
                                type="text"
                                value={uploadAltText}
                                onChange={(e) => setUploadAltText(e.target.value)}
                                placeholder="Alt text (recommended)"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
                            />
                            <button
                                onClick={handleUpload}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white"
                            >
                                <ImagePlus className="h-4 w-4" />
                                {saving ? "Uploading..." : "Upload"}
                            </button>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative flex-1 min-w-[180px]">
                                    <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search filename or alt text"
                                        className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-2 text-xs"
                                    />
                                </div>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="rounded-md border border-gray-300 px-2 py-2 text-xs"
                                />
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="rounded-md border border-gray-300 px-2 py-2 text-xs"
                                />
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setDateFrom("");
                                        setDateTo("");
                                    }}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-xs"
                                >
                                    Reset
                                </button>
                            </div>

                            {loading ? (
                                <p className="text-xs text-gray-500">Loading media...</p>
                            ) : media.length === 0 ? (
                                <p className="text-xs text-gray-500">No media found.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {media.map((item) => (
                                        <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-2">
                                            <div className="aspect-[4/3] w-full overflow-hidden rounded-md border border-gray-100 bg-slate-50">
                                                <img src={item.public_url} alt={item.alt_text || item.file_name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{item.file_name}</p>
                                                <p className="text-[11px] text-gray-500">{formatBytes(item.file_size_bytes)} · {formatDate(item.created_at)}</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={altDrafts[item.id] ?? item.alt_text ?? ""}
                                                        onChange={(e) => setAltDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                        placeholder="Alt text"
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px]"
                                                    />
                                                    <button
                                                        onClick={() => handleAltSave(item.id)}
                                                        className="rounded-md border border-gray-300 px-2 py-1 text-[11px]"
                                                        disabled={savingAlt[item.id]}
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <button
                                                    onClick={() => onSelect(item)}
                                                    className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white"
                                                >
                                                    Use
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-md border border-red-200 px-2 py-1 text-[11px] text-red-600"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                                <span>Page {page} of {totalPages}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={page <= 1}
                                        className="rounded-md border border-gray-300 px-2 py-1 text-[11px]"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={page >= totalPages}
                                        className="rounded-md border border-gray-300 px-2 py-1 text-[11px]"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
