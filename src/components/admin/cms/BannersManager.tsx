"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

type BannerPlacement = "announcement_bar" | "homepage_hero" | "shop_top" | "popup";
type BannerLayoutMode = "contained" | "full_width";

type Banner = {
    id: string;
    title: string;
    content_text: string | null;
    image_url: string | null;
    link_url: string | null;
    placement: BannerPlacement;
    bg_color: string;
    text_color: string;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    priority: number;
};

type Draft = {
    id?: string;
    title: string;
    content_text: string;
    image_url: string;
    link_url: string;
    placement: BannerPlacement;
    bg_color: string;
    text_color: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
    priority: number;
};

type BulkDraft = {
    placement: BannerPlacement;
    hero_layout: BannerLayoutMode;
    title_prefix: string;
    content_text: string;
    link_url: string;
    bg_color: string;
    text_color: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
    priority_start: number;
};

type HeroExistingBanner = {
    id: string;
    image_url: string;
};

type HeroGroupRow = {
    kind: "homepage_hero_group";
    banners: Banner[];
    representative: Banner;
    count: number;
    activeCount: number;
};

const placements: BannerPlacement[] = ["announcement_bar", "homepage_hero", "shop_top", "popup"];

function getStatus(banner: Banner): "Scheduled" | "Active" | "Expired" | "Inactive" {
    if (!banner.is_active) return "Inactive";

    const now = new Date();
    const nowIst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = new Date(nowIst.getFullYear(), nowIst.getMonth(), nowIst.getDate());

    const start = banner.start_date ? new Date(banner.start_date) : null;
    const end = banner.end_date ? new Date(banner.end_date) : null;

    if (start && start > today) return "Scheduled";
    if (end && end < today) return "Expired";
    return "Active";
}

function isHeroGroupRow(row: Banner | HeroGroupRow): row is HeroGroupRow {
    return (row as HeroGroupRow).kind === "homepage_hero_group";
}

export default function BannersManager() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [bulkFiles, setBulkFiles] = useState<File[]>([]);
    const [bulkPreviews, setBulkPreviews] = useState<Array<{ name: string; url: string }>>([]);
    const [heroExistingBanners, setHeroExistingBanners] = useState<HeroExistingBanner[]>([]);
    const [pendingHeroRemovals, setPendingHeroRemovals] = useState<string[]>([]);
    const [draft, setDraft] = useState<Draft>({
        title: "",
        content_text: "",
        image_url: "",
        link_url: "",
        placement: "announcement_bar",
        bg_color: "#000000",
        text_color: "#FFFFFF",
        is_active: true,
        start_date: "",
        end_date: "",
        priority: 0,
    });
    const [bulkDraft, setBulkDraft] = useState<BulkDraft>({
        placement: "homepage_hero",
        hero_layout: "contained",
        title_prefix: "Hero Banner",
        content_text: "",
        link_url: "/shop",
        bg_color: "#000000",
        text_color: "#FFFFFF",
        is_active: true,
        start_date: "",
        end_date: "",
        priority_start: 100,
    });

    const load = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/cms/banners", { cache: "no-store" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load banners");
            setBanners(json.banners || []);
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to load banners";
            setMessage({ type: "error", text });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!createOpen && !editId) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [createOpen, editId]);

    useEffect(() => {
        if (bulkFiles.length === 0) {
            setBulkPreviews([]);
            return;
        }

        const previews = bulkFiles.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setBulkPreviews(previews);

        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [bulkFiles]);

    const sorted = useMemo(
        () => [...banners].sort((a, b) => b.priority - a.priority),
        [banners],
    );

    const listRows = useMemo<(Banner | HeroGroupRow)[]>(() => {
        const hero = sorted.filter((b) => b.placement === "homepage_hero");
        const others = sorted.filter((b) => b.placement !== "homepage_hero");

        const rows: (Banner | HeroGroupRow)[] = [];

        if (hero.length > 0) {
            rows.push({
                kind: "homepage_hero_group",
                banners: hero,
                representative: hero[0],
                count: hero.length,
                activeCount: hero.filter((b) => b.is_active).length,
            });
        }

        rows.push(...others);
        return rows;
    }, [sorted]);

    const resetDraft = () => {
        setDraft({
            title: "",
            content_text: "",
            image_url: "",
            link_url: "",
            placement: "announcement_bar",
            bg_color: "#000000",
            text_color: "#FFFFFF",
            is_active: true,
            start_date: "",
            end_date: "",
            priority: 0,
        });
    };

    const resetBulk = () => {
        setBulkFiles([]);
        setHeroExistingBanners([]);
        setPendingHeroRemovals([]);
        setBulkDraft({
            placement: "homepage_hero",
            hero_layout: "contained",
            title_prefix: "Hero Banner",
            content_text: "",
            link_url: "/shop",
            bg_color: "#000000",
            text_color: "#FFFFFF",
            is_active: true,
            start_date: "",
            end_date: "",
            priority_start: 100,
        });
    };

    const saveHeroLayoutMode = async (layout: BannerLayoutMode) => {
        const updates = [{
            key: "hero_banner_layout",
            value: layout,
            type: "text",
            label: "Homepage Hero Banner Layout",
            group: "hero",
        }];

        const res = await fetch("/api/admin/cms/site-config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates }),
        });

        const json = await res.json();
        if (!res.ok) {
            throw new Error(json.error || "Failed to save hero banner layout mode");
        }
    };

    const uploadBulkImages = async (files: File[]): Promise<string[]> => {
        if (files.length === 0) return [];

        const uploadForm = new FormData();
        uploadForm.append("action", "bulk-upload");
        files.forEach((file) => uploadForm.append("files", file));

        const uploadRes = await fetch("/api/admin/cms/banners", {
            method: "POST",
            body: uploadForm,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || "Failed to upload images");

        const imageUrls: string[] = Array.isArray(uploadJson.imageUrls) ? uploadJson.imageUrls : [];
        if (imageUrls.length === 0) {
            throw new Error("No image URLs returned from upload.");
        }
        return imageUrls;
    };

    const bulkUploadAndCreate = async () => {
        if (bulkFiles.length === 0) {
            setMessage({ type: "error", text: "Select at least one image for bulk upload." });
            return;
        }

        setBulkSubmitting(true);
        setMessage(null);
        try {
            const imageUrls = await uploadBulkImages(bulkFiles);

            const titlePrefix = bulkDraft.title_prefix.trim() || "Banner";
            const payloadBanners = imageUrls.map((imageUrl, idx) => ({
                title: `${titlePrefix} ${idx + 1}`,
                content_text: bulkDraft.content_text,
                image_url: imageUrl,
                link_url: bulkDraft.link_url,
                placement: bulkDraft.placement,
                bg_color: bulkDraft.bg_color,
                text_color: bulkDraft.text_color,
                is_active: bulkDraft.is_active,
                start_date: bulkDraft.start_date || null,
                end_date: bulkDraft.end_date || null,
                priority: bulkDraft.priority_start - idx,
            }));

            const createRes = await fetch("/api/admin/cms/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "bulk-create",
                    banners: payloadBanners,
                }),
            });
            const createJson = await createRes.json();
            if (!createRes.ok) throw new Error(createJson.error || "Failed to create banners");

            if (bulkDraft.placement === "homepage_hero") {
                await saveHeroLayoutMode(bulkDraft.hero_layout);
            }

            setMessage({
                type: "success",
                text: `Created ${payloadBanners.length} banners successfully.${bulkDraft.placement === "homepage_hero" ? ` Layout set to ${bulkDraft.hero_layout}.` : ""}`,
            });
            resetBulk();
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to bulk upload banners";
            setMessage({ type: "error", text });
        } finally {
            setBulkSubmitting(false);
        }
    };

    const startEdit = (banner: Banner) => {
        setEditId(banner.id);
        setCreateOpen(false);
        setPendingHeroRemovals([]);
        if (banner.placement === "homepage_hero") {
            const existing = banners
                .filter((b) => b.placement === "homepage_hero")
                .map((b) => ({ id: b.id, image_url: (b.image_url || "").trim() }))
                .filter((b) => Boolean(b.image_url));
            setHeroExistingBanners(existing);
        } else {
            setHeroExistingBanners([]);
        }
        setDraft({
            id: banner.id,
            title: banner.title,
            content_text: banner.content_text || "",
            image_url: banner.image_url || "",
            link_url: banner.link_url || "",
            placement: banner.placement,
            bg_color: banner.bg_color,
            text_color: banner.text_color,
            is_active: banner.is_active,
            start_date: banner.start_date || "",
            end_date: banner.end_date || "",
            priority: banner.priority || 0,
        });
    };

    const saveCreate = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/cms/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to create banner");

            if (draft.placement === "homepage_hero") {
                await saveHeroLayoutMode(bulkDraft.hero_layout);
            }

            setMessage({ type: "success", text: "Banner created." });
            setCreateOpen(false);
            resetDraft();
            resetBulk();
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to create banner";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const saveEdit = async () => {
        if (!draft.id) return;
        setSaving(true);
        setMessage(null);
        try {
            let payload = { ...draft };
            let extraCreated = 0;
            let updatedPrimary = false;
            const removalIds = payload.placement === "homepage_hero" ? [...pendingHeroRemovals] : [];

            if (payload.placement === "homepage_hero" && payload.id && removalIds.includes(payload.id)) {
                const fallback = banners.find(
                    (b) => b.placement === "homepage_hero" && !removalIds.includes(b.id),
                );
                if (fallback) {
                    payload = {
                        ...payload,
                        id: fallback.id,
                        image_url: fallback.image_url || payload.image_url,
                    };
                } else {
                    payload = {
                        ...payload,
                        id: undefined,
                    };
                }
            }

            if (payload.placement === "homepage_hero" && bulkFiles.length > 0) {
                const imageUrls = await uploadBulkImages(bulkFiles);

                if (payload.id) {
                    payload = { ...payload, image_url: imageUrls[0] };
                    const extraImageUrls = imageUrls.slice(1);
                    if (extraImageUrls.length > 0) {
                        const titlePrefix = bulkDraft.title_prefix.trim() || payload.title || "Hero Banner";
                        const extraBanners = extraImageUrls.map((imageUrl, idx) => ({
                            title: `${titlePrefix} ${idx + 2}`,
                            content_text: payload.content_text,
                            image_url: imageUrl,
                            link_url: payload.link_url,
                            placement: payload.placement,
                            bg_color: payload.bg_color,
                            text_color: payload.text_color,
                            is_active: payload.is_active,
                            start_date: payload.start_date || null,
                            end_date: payload.end_date || null,
                            priority: (payload.priority || 0) - (idx + 1),
                        }));

                        const createRes = await fetch("/api/admin/cms/banners", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                action: "bulk-create",
                                banners: extraBanners,
                            }),
                        });
                        const createJson = await createRes.json();
                        if (!createRes.ok) throw new Error(createJson.error || "Failed to create extra hero banners");
                        extraCreated = extraBanners.length;
                    }
                } else {
                    const titlePrefix = bulkDraft.title_prefix.trim() || payload.title || "Hero Banner";
                    const newBanners = imageUrls.map((imageUrl, idx) => ({
                        title: `${titlePrefix} ${idx + 1}`,
                        content_text: payload.content_text,
                        image_url: imageUrl,
                        link_url: payload.link_url,
                        placement: payload.placement,
                        bg_color: payload.bg_color,
                        text_color: payload.text_color,
                        is_active: payload.is_active,
                        start_date: payload.start_date || null,
                        end_date: payload.end_date || null,
                        priority: (payload.priority || 0) - idx,
                    }));

                    const createRes = await fetch("/api/admin/cms/banners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "bulk-create",
                            banners: newBanners,
                        }),
                    });
                    const createJson = await createRes.json();
                    if (!createRes.ok) throw new Error(createJson.error || "Failed to create hero banners");
                    extraCreated = newBanners.length;
                }
            }

            if (removalIds.length > 0) {
                for (const id of removalIds) {
                    const deleteRes = await fetch("/api/admin/cms/banners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "soft-delete", id }),
                    });
                    const deleteJson = await deleteRes.json();
                    if (!deleteRes.ok) throw new Error(deleteJson.error || "Failed to remove hero image(s)");
                }
            }

            if (payload.id) {
                const res = await fetch("/api/admin/cms/banners", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to update banner");
                updatedPrimary = true;
            }

            if (payload.placement === "homepage_hero") {
                await saveHeroLayoutMode(bulkDraft.hero_layout);
            }

            const parts: string[] = [];
            if (updatedPrimary) parts.push("Banner updated");
            if (removalIds.length > 0) parts.push(`${removalIds.length} image(s) removed`);
            if (extraCreated > 0) parts.push(`${extraCreated} new hero banner(s) created`);
            setMessage({ type: "success", text: parts.length > 0 ? `${parts.join(" and ")}.` : "Changes saved." });
            setEditId(null);
            resetDraft();
            resetBulk();
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to update banner";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const softDelete = async (id: string) => {
        const ok = window.confirm("Soft-delete this banner?");
        if (!ok) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/cms/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "soft-delete", id }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to delete banner");
            setMessage({ type: "success", text: "Banner soft-deleted." });
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to delete banner";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const softDeletePlacement = async (placement: BannerPlacement) => {
        const ok = window.confirm(`Soft-delete all banners in ${placement}?`);
        if (!ok) return;

        setSaving(true);
        try {
            const res = await fetch("/api/admin/cms/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "soft-delete-placement", placement }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to delete banner placement");
            setMessage({ type: "success", text: `All ${placement} banners soft-deleted.` });
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to delete banner placement";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const quickToggle = async (banner: Banner) => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/cms/banners", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...banner,
                    is_active: !banner.is_active,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to toggle banner");
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to toggle banner";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const quickTogglePlacement = async (placement: BannerPlacement, nextActive: boolean) => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/cms/banners", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "set-placement-active", placement, is_active: nextActive }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to toggle placement banners");
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to toggle placement banners";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const uploadBannerImage = async (file: File) => {
        setUploadingImage(true);
        setMessage(null);
        try {
            const form = new FormData();
            form.append("file", file);

            const res = await fetch("/api/admin/cms/banners", {
                method: "POST",
                body: form,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to upload banner image");

            setDraft((prev) => ({ ...prev, image_url: String(json.imageUrl || "") }));
            setMessage({ type: "success", text: "Banner image uploaded." });
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to upload banner image";
            setMessage({ type: "error", text });
        } finally {
            setUploadingImage(false);
        }
    };

    const openCreate = () => {
        setEditId(null);
        resetDraft();
        resetBulk();
        setHeroExistingBanners([]);
        setCreateOpen(true);
    };

    const removeHeroImage = async (bannerId: string) => {
        const nextHero = heroExistingBanners.filter((b) => b.id !== bannerId);
        setHeroExistingBanners(nextHero);
        setPendingHeroRemovals((prev) => (prev.includes(bannerId) ? prev : [...prev, bannerId]));

        if (editId === bannerId) {
            const nextEditable = banners.find((b) => b.id === nextHero[0]?.id);
            if (nextEditable) {
                setEditId(nextEditable.id);
                setDraft({
                    id: nextEditable.id,
                    title: nextEditable.title,
                    content_text: nextEditable.content_text || "",
                    image_url: nextEditable.image_url || "",
                    link_url: nextEditable.link_url || "",
                    placement: nextEditable.placement,
                    bg_color: nextEditable.bg_color,
                    text_color: nextEditable.text_color,
                    is_active: nextEditable.is_active,
                    start_date: nextEditable.start_date || "",
                    end_date: nextEditable.end_date || "",
                    priority: nextEditable.priority || 0,
                });
            }
        }
    };

    return (
        <div className="relative space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Banners</h2>
                    <p className="text-sm text-gray-500">Create and schedule promotional banners by placement.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Create Banner
                </button>
            </div>

            {message ? (
                <div className={`rounded-lg px-4 py-3 text-sm border ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {message.text}
                </div>
            ) : null}

            {(createOpen || editId) ? (
                <div className="fixed inset-0 z-[100] bg-black/45 flex items-center justify-center p-3 sm:p-4 md:pl-[252px]" onClick={() => {
                    setCreateOpen(false);
                    setEditId(null);
                    resetDraft();
                    resetBulk();
                }}>
                    <div className="w-full max-w-5xl max-h-[88vh] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-4 sm:p-5 md:p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-semibold text-gray-900">{editId ? "Edit Banner" : "Create Banner"}</h3>
                            <button
                                onClick={() => {
                                    setCreateOpen(false);
                                    setEditId(null);
                                    resetDraft();
                                    resetBulk();
                                }}
                                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
                                aria-label="Close banner form modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            value={draft.title}
                            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Title"
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                        />
                        <select
                            value={draft.placement}
                            onChange={(e) => {
                                const placement = e.target.value as BannerPlacement;
                                setDraft((prev) => ({ ...prev, placement }));
                                setBulkDraft((prev) => ({ ...prev, placement }));
                                if (placement !== "homepage_hero") {
                                    setBulkFiles([]);
                                }
                            }}
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                        >
                            {placements.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <textarea
                            value={draft.content_text}
                            onChange={(e) => {
                                const next = e.target.value;
                                setDraft((prev) => ({ ...prev, content_text: next }));
                                setBulkDraft((prev) => ({ ...prev, content_text: next }));
                            }}
                            placeholder="Content text"
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm md:col-span-2"
                            rows={2}
                        />
                        <input
                            value={draft.link_url}
                            onChange={(e) => {
                                const next = e.target.value;
                                setDraft((prev) => ({ ...prev, link_url: next }));
                                setBulkDraft((prev) => ({ ...prev, link_url: next }));
                            }}
                            placeholder="Link URL"
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm md:col-span-2"
                        />
                        {draft.placement !== "homepage_hero" ? (
                            <>
                                <input
                                    value={draft.image_url}
                                    onChange={(e) => setDraft((prev) => ({ ...prev, image_url: e.target.value }))}
                                    placeholder="Image URL"
                                    className="px-3 py-2 rounded-md border border-gray-300 text-sm md:col-span-2"
                                />
                                <div className="md:col-span-2 space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadBannerImage(file);
                                        }}
                                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-900 file:text-white"
                                    />
                                    {uploadingImage ? <p className="text-xs text-indigo-600">Uploading image...</p> : null}
                                    {draft.image_url ? (
                                        <div className="w-full max-w-xs h-24 rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                                            <img src={draft.image_url} alt="Banner preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : null}
                                </div>
                            </>
                        ) : null}
                        <input
                            type="color"
                            value={draft.bg_color}
                            onChange={(e) => {
                                const next = e.target.value;
                                setDraft((prev) => ({ ...prev, bg_color: next }));
                                setBulkDraft((prev) => ({ ...prev, bg_color: next }));
                            }}
                            className="h-10 w-full rounded-md border border-gray-300"
                            title="Background color"
                        />
                        <input
                            type="color"
                            value={draft.text_color}
                            onChange={(e) => {
                                const next = e.target.value;
                                setDraft((prev) => ({ ...prev, text_color: next }));
                                setBulkDraft((prev) => ({ ...prev, text_color: next }));
                            }}
                            className="h-10 w-full rounded-md border border-gray-300"
                            title="Text color"
                        />
                        <input
                            type="date"
                            value={draft.start_date}
                            onChange={(e) => {
                                const next = e.target.value;
                                setDraft((prev) => ({ ...prev, start_date: next }));
                                setBulkDraft((prev) => ({ ...prev, start_date: next }));
                            }}
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                        />
                        <input
                            type="date"
                            value={draft.end_date}
                            onChange={(e) => {
                                const next = e.target.value;
                                setDraft((prev) => ({ ...prev, end_date: next }));
                                setBulkDraft((prev) => ({ ...prev, end_date: next }));
                            }}
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                        />
                        <input
                            type="number"
                            value={draft.priority}
                            onChange={(e) => {
                                const next = Number(e.target.value || 0);
                                setDraft((prev) => ({ ...prev, priority: next }));
                                setBulkDraft((prev) => ({ ...prev, priority_start: next }));
                            }}
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                            placeholder="Priority"
                        />
                    </div>

                    {draft.placement === "homepage_hero" ? (
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 space-y-3">
                            <div>
                                <p className="text-sm font-medium text-indigo-900">Homepage Hero Settings</p>
                                <p className="text-xs text-indigo-700 mt-1">Choose banner width mode and optionally upload multiple hero images in one go.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="text-xs text-gray-600">Banner width mode</label>
                                <span className="hidden md:block" />
                                <select
                                    value={bulkDraft.hero_layout}
                                    onChange={(e) => setBulkDraft((prev) => ({ ...prev, hero_layout: e.target.value as BannerLayoutMode }))}
                                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                                >
                                    <option value="contained">Normal Banner Width</option>
                                    <option value="full_width">Full Width Banner</option>
                                </select>
                                <input
                                    value={bulkDraft.title_prefix}
                                    onChange={(e) => setBulkDraft((prev) => ({ ...prev, title_prefix: e.target.value }))}
                                    placeholder="Title prefix (e.g., Hero Banner)"
                                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                {editId && heroExistingBanners.length > 0 ? (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-600">Current hero images ({heroExistingBanners.length})</p>
                                        <div className="max-h-32 overflow-auto border border-gray-200 rounded-md p-2 bg-white">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                                {heroExistingBanners.map((banner, idx) => (
                                                    <div key={`${banner.id}-${idx}`} className="relative rounded-md border border-gray-200 bg-white p-1">
                                                        <div className="w-full h-14 rounded overflow-hidden bg-gray-100">
                                                            <img src={banner.image_url} alt={`Hero image ${idx + 1}`} className="w-full h-full object-cover" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeHeroImage(banner.id)}
                                                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center"
                                                            title="Remove this image"
                                                            aria-label="Remove this image"
                                                        >
                                                            x
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setBulkFiles(Array.from(e.target.files || []))}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-900 file:text-white"
                                />
                                <p className="text-xs text-gray-500">
                                    {bulkFiles.length > 0
                                        ? editId
                                            ? `${bulkFiles.length} file(s) selected. On Save: first file replaces this banner, remaining files create new hero banners.`
                                            : `${bulkFiles.length} file(s) selected. Use Upload & Create All to create all hero banners at once.`
                                        : editId
                                            ? "Select files to replace/add hero images for this set."
                                            : "Optional: select multiple files for one-click hero banner creation."}
                                </p>
                                {editId && pendingHeroRemovals.length > 0 ? (
                                    <p className="text-xs text-amber-700">{pendingHeroRemovals.length} image(s) marked for removal. Click Save Changes to apply.</p>
                                ) : null}
                                {bulkFiles.length > 0 ? (
                                    <div className="max-h-44 overflow-auto border border-gray-200 rounded-md p-2 bg-white">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {bulkPreviews.map((preview, idx) => (
                                                <div key={`${preview.name}-${idx}`} className="rounded-md border border-gray-200 bg-white p-1.5">
                                                    <div className="w-full h-20 rounded overflow-hidden bg-gray-100">
                                                        <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-gray-500 truncate" title={preview.name}>
                                                        {idx + 1}. {preview.name}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={draft.is_active}
                            onChange={(e) => {
                                const next = e.target.checked;
                                setDraft((prev) => ({ ...prev, is_active: next }));
                                setBulkDraft((prev) => ({ ...prev, is_active: next }));
                            }}
                        />
                        Active banner
                    </label>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={editId ? saveEdit : saveCreate}
                            disabled={saving || bulkSubmitting}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-60"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Saving..." : editId ? "Save Changes" : "Create Banner"}
                        </button>
                        {!editId && draft.placement === "homepage_hero" ? (
                            <button
                                onClick={bulkUploadAndCreate}
                                disabled={bulkFiles.length === 0 || bulkSubmitting || saving}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50"
                            >
                                {bulkSubmitting ? "Uploading..." : "Upload & Create All"}
                            </button>
                        ) : null}
                        <button
                            onClick={() => {
                                setCreateOpen(false);
                                setEditId(null);
                                resetDraft();
                                resetBulk();
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                    </div>
                </div>
            ) : null}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-sm text-gray-500">Loading banners...</div>
                ) : listRows.length === 0 ? (
                    <div className="p-8 text-sm text-gray-500">No banners found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {listRows.map((row) => {
                            if (isHeroGroupRow(row)) {
                                const representative = row.representative;
                                const status = row.activeCount > 0 ? getStatus(representative) : "Inactive";
                                const nextActive = row.activeCount === 0;

                                return (
                                    <div key="homepage_hero_group" className="p-4 flex items-center gap-3">
                                        <div className="w-20 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 grid grid-cols-2 gap-px">
                                            {row.banners.slice(0, 4).map((banner) => (
                                                <div key={banner.id} className="bg-gray-100">
                                                    {banner.image_url ? <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" /> : null}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">Homepage Hero Banners</p>
                                            <p className="text-xs text-gray-500 truncate">{row.count} images · {representative.placement} · Top Priority {representative.priority}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${status === "Active" ? "bg-emerald-100 text-emerald-700" : status === "Scheduled" ? "bg-amber-100 text-amber-700" : status === "Expired" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}>
                                            {status}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => quickTogglePlacement("homepage_hero", nextActive)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${row.activeCount > 0 ? "bg-emerald-500" : "bg-gray-300"}`}
                                                title={row.activeCount > 0 ? "Turn all off" : "Turn all on"}
                                                aria-label={row.activeCount > 0 ? "Turn all homepage hero banners off" : "Turn all homepage hero banners on"}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${row.activeCount > 0 ? "translate-x-5" : "translate-x-1"}`}
                                                />
                                            </button>
                                            <button
                                                onClick={() => startEdit(representative)}
                                                className="p-1.5 rounded border border-gray-200 text-gray-600"
                                                title="Edit hero banner set"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => softDeletePlacement("homepage_hero")}
                                                className="p-1.5 rounded border border-red-200 text-red-600"
                                                title="Soft delete all hero banners"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            const b = row;
                            const status = getStatus(b);
                            return (
                                <div key={b.id} className="p-4 flex items-center gap-3">
                                    <div className="w-14 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                                        {b.image_url ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" /> : null}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{b.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{b.placement} · Priority {b.priority}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${status === "Active" ? "bg-emerald-100 text-emerald-700" : status === "Scheduled" ? "bg-amber-100 text-amber-700" : status === "Expired" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}>
                                        {status}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => quickToggle(b)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${b.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                                            title={b.is_active ? "Turn off" : "Turn on"}
                                            aria-label={b.is_active ? "Turn banner off" : "Turn banner on"}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${b.is_active ? "translate-x-5" : "translate-x-1"}`}
                                            />
                                        </button>
                                        <button
                                            onClick={() => startEdit(b)}
                                            className="p-1.5 rounded border border-gray-200 text-gray-600"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => softDelete(b.id)}
                                            className="p-1.5 rounded border border-red-200 text-red-600"
                                            title="Soft delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
