"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, ImagePlus, Search, Trash2, UploadCloud, X } from "lucide-react";

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
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, "pending" | "uploading" | "success" | "error">>({});
    const [uploadAltText, setUploadAltText] = useState("");
    const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
    const [savingAlt, setSavingAlt] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);

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
        setSelectedIds(new Set());
    }, [open, search, dateFrom, dateTo]);

    const handleUpload = async () => {
        if (uploadFiles.length === 0) {
            setMessage("Select one or more image files to upload.");
            return;
        }

        setUploading(true);
        setMessage("");

        let successCount = 0;
        let failCount = 0;
        const filesToUpload = [...uploadFiles];

        for (const file of filesToUpload) {
            setUploadProgress((prev) => ({ ...prev, [file.name]: "uploading" }));
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("alt_text", uploadAltText.trim());

                const res = await fetch("/api/admin/blogs/media", {
                    method: "POST",
                    body: formData,
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Upload failed");

                setUploadProgress((prev) => ({ ...prev, [file.name]: "success" }));
                successCount++;
            } catch (err: unknown) {
                console.error("Failed to upload " + file.name, err);
                setUploadProgress((prev) => ({ ...prev, [file.name]: "error" }));
                failCount++;
            }
        }

        // Clean queue of successful uploads
        setUploadFiles((prev) => prev.filter((f) => uploadProgress[f.name] !== "success" && uploadProgress[f.name] !== "error"));
        setUploadAltText("");

        if (failCount > 0) {
            setMessage(`Uploaded ${successCount} image(s). ${failCount} failed.`);
        } else {
            setMessage(`Successfully uploaded ${successCount} image(s).`);
            setUploadFiles([]);
            setUploadProgress({});
        }

        await loadMedia();
        setUploading(false);
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
        setDeleting(true);
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
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : "Failed to delete media");
        } finally {
            setDeleting(false);
        }
    };

    const handleCopyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Multiple selection helpers
    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAllOnPage = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const allSelected = media.every((item) => next.has(item.id));
            if (allSelected) {
                // Deselect all on this page
                media.forEach((item) => next.delete(item.id));
            } else {
                // Select all on this page
                media.forEach((item) => next.add(item.id));
            }
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const handleCopySelectedUrls = () => {
        const selectedUrls = media
            .filter((item) => selectedIds.has(item.id))
            .map((item, idx) => `Image ${idx + 1}: ${item.public_url}`)
            .join("\n");

        if (selectedUrls) {
            navigator.clipboard.writeText(selectedUrls);
            setMessage(`Copied ${selectedIds.size} URL(s) to clipboard! Paste them in the AI Chatbot.`);
            setTimeout(() => setMessage(""), 5000);
        }
    };

    const handleDeleteSelected = async () => {
        const count = selectedIds.size;
        const ok = window.confirm(`Delete ${count} selected media assets? This cannot be undone.`);
        if (!ok) return;

        setDeleting(true);
        setMessage("");
        let successCount = 0;
        let failCount = 0;

        for (const id of Array.from(selectedIds)) {
            try {
                const res = await fetch("/api/admin/blogs/media", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                });
                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch {
                failCount++;
            }
        }

        setMessage(`Deleted ${successCount} asset(s). ${failCount > 0 ? `${failCount} failed.` : ""}`);
        setMedia((prev) => prev.filter((item) => !selectedIds.has(item.id)));
        setSelectedIds(new Set());
        setDeleting(false);
        await loadMedia();
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files).filter((file) =>
            file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp"
        );
        if (files.length > 0) {
            setUploadFiles((prev) => [...prev, ...files]);
        }
    };

    if (!open) return null;

    const isAllPageSelected = media.length > 0 && media.every((item) => selectedIds.has(item.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
            <div className="w-full max-w-6xl rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">{title || "Blog Media Library"}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Upload, select, and copy links for blog images.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Close media library"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content Panel */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    {/* Left Column: Upload */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                            <p className="text-xs font-semibold text-slate-700">Upload Media Assets</p>

                            {/* Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("file-select-input")?.click()}
                                className={`rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2 bg-white ${
                                    isDragging
                                        ? "border-indigo-500 bg-indigo-50/20"
                                        : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/30"
                                }`}
                            >
                                <input
                                    id="file-select-input"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setUploadFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                                        }
                                    }}
                                    className="hidden"
                                />
                                <UploadCloud className="h-8 w-8 text-slate-400" />
                                <div>
                                    <p className="text-xs font-medium text-slate-700">Drag &amp; drop here, or click to browse</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 10 MB</p>
                                </div>
                            </div>

                            {/* File List */}
                            {uploadFiles.length > 0 && (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Queue ({uploadFiles.length})</p>
                                    {uploadFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80 text-xs">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                <span className="font-medium text-slate-700 truncate max-w-[130px]">{file.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {uploadProgress[file.name] === "uploading" && (
                                                    <span className="text-[10px] text-indigo-500 font-semibold animate-pulse">Uploading...</span>
                                                )}
                                                {uploadProgress[file.name] === "success" && (
                                                    <span className="text-[10px] text-emerald-500 font-semibold">Done</span>
                                                )}
                                                {uploadProgress[file.name] === "error" && (
                                                    <span className="text-[10px] text-red-500 font-semibold animate-pulse">Failed</span>
                                                )}
                                                {(!uploadProgress[file.name] || uploadProgress[file.name] === "pending") && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setUploadFiles((prev) => prev.filter((_, i) => i !== idx));
                                                        }}
                                                        className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded cursor-pointer"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Default Alt Text</label>
                                <input
                                    type="text"
                                    value={uploadAltText}
                                    onChange={(e) => setUploadAltText(e.target.value)}
                                    placeholder="e.g. Bohemian textured linen pillow"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 bg-transparent">
                            <button
                                onClick={handleUpload}
                                disabled={uploading || deleting || uploadFiles.length === 0}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-3 py-2 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                            >
                                <ImagePlus className="h-4 w-4" />
                                {uploading ? "Uploading..." : `Upload ${uploadFiles.length} File(s)`}
                            </button>
                            {uploadFiles.length > 0 && !uploading && (
                                <button
                                    onClick={() => setUploadFiles([])}
                                    disabled={deleting}
                                    className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-2 text-xs text-slate-700 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Gallery & Filters */}
                    <div className="flex flex-col space-y-4 overflow-hidden">
                        {/* Search & Filter Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                                <div className="relative flex-1 min-w-[150px] max-w-[240px]">
                                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search filename or alt text..."
                                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                                <span className="text-slate-300 text-xs">-</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setDateFrom("");
                                        setDateTo("");
                                    }}
                                    className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs text-slate-600 font-medium transition-colors cursor-pointer"
                                >
                                    Reset
                                </button>
                            </div>
                            <button
                                onClick={selectAllOnPage}
                                className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs text-slate-700 font-medium transition-colors cursor-pointer shrink-0"
                            >
                                {isAllPageSelected ? "Deselect Page" : "Select Page"}
                            </button>
                        </div>

                        {/* Message Banner */}
                        {message && (
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-xs text-indigo-700 flex items-center justify-between animate-fade-in shrink-0">
                                <span>{message}</span>
                                <button onClick={() => setMessage("")} className="text-indigo-400 hover:text-indigo-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Bulk Action Panel */}
                        {selectedIds.size > 0 && (
                            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs shrink-0 select-none">
                                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                                    <div className="flex items-center justify-center bg-indigo-600 text-white rounded-full h-5 w-5 text-[10px] font-bold">
                                        {selectedIds.size}
                                    </div>
                                    <span>asset(s) selected</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={handleCopySelectedUrls}
                                        disabled={deleting}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy Selected URLs
                                    </button>
                                    <button
                                        onClick={handleDeleteSelected}
                                        disabled={deleting}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    >
                                        {deleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent animate-pulse mr-1" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete Selected
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={clearSelection}
                                        disabled={deleting}
                                        className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition-colors font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Gallery Grid */}
                        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                            {loading ? (
                                <div className="flex items-center justify-center py-20 text-slate-400 text-xs">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent mr-2" />
                                    Loading media library...
                                </div>
                            ) : media.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-2">
                                    <UploadCloud className="h-10 w-10 text-slate-300" />
                                    <span>No media files found. Upload some above!</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                                    {media.map((item) => {
                                        const isSelected = selectedIds.has(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                className={`relative rounded-xl border p-2.5 transition-all duration-200 bg-white flex flex-col justify-between group ${
                                                    isSelected
                                                        ? "border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                                                        : "border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md"
                                                }`}
                                            >
                                                {/* Select Checkbox Indicator */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSelect(item.id)}
                                                    disabled={deleting}
                                                    className={`absolute top-4 right-4 z-10 h-5 w-5 rounded-full border shadow-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        isSelected
                                                            ? "bg-indigo-600 border-indigo-600 text-white"
                                                            : "bg-white/80 backdrop-blur-xs border-slate-300 hover:border-indigo-400 hover:scale-105"
                                                    }`}
                                                >
                                                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                                </button>

                                                {/* Image card preview toggles selection */}
                                                <div className="space-y-2 cursor-pointer" onClick={() => !deleting && toggleSelect(item.id)}>
                                                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center">
                                                        <img
                                                            src={item.public_url}
                                                            alt={item.alt_text || item.file_name}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-slate-800 truncate" title={item.file_name}>
                                                            {item.file_name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            {formatBytes(item.file_size_bytes)} · {formatDate(item.created_at)}
                                                        </p>

                                                        {/* Alt editor */}
                                                        <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="text"
                                                                value={altDrafts[item.id] ?? item.alt_text ?? ""}
                                                                onChange={(e) => setAltDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                                placeholder="Add Alt text..."
                                                                disabled={deleting}
                                                                className="w-full rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            />
                                                            <button
                                                                onClick={() => handleAltSave(item.id)}
                                                                className="rounded-md border border-slate-200 hover:bg-slate-50 p-1 text-slate-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={savingAlt[item.id] || deleting}
                                                                title="Save Alt text"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card actions */}
                                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => onSelect(item)}
                                                        disabled={deleting || uploading}
                                                        className="flex-1 inline-flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2 py-1.5 text-[11px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Use Image
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopyUrl(item.public_url, item.id)}
                                                        disabled={deleting}
                                                        className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-2 py-1.5 text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Copy URL to clipboard"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                        {copiedId === item.id ? "Copied!" : "Link"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={deleting}
                                                        className="rounded-lg border border-red-200 hover:bg-red-50 text-red-600 px-2 py-1.5 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete image asset"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pagination Row */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 shrink-0">
                            <span>Page {page} of {totalPages}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page <= 1}
                                    className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed px-3 py-1.5 text-xs text-slate-600 font-semibold transition-colors cursor-pointer"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={page >= totalPages}
                                    className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed px-3 py-1.5 text-xs text-slate-600 font-semibold transition-colors cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
