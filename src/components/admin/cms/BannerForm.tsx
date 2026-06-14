"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

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
    button_text: string | null;
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
    button_text: string;
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
    button_text: string;
};

const placements: BannerPlacement[] = ["announcement_bar", "homepage_hero", "shop_top", "popup"];

interface Props {
    editId?: string | null;
}

export default function BannerForm({ editId = null }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        button_text: "",
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
        button_text: "",
    });

    const [banners, setBanners] = useState<Banner[]>([]);
    const [heroExistingBanners, setHeroExistingBanners] = useState<Banner[]>([]);
    const [pendingHeroRemovals, setPendingHeroRemovals] = useState<string[]>([]);
    const [bulkFiles, setBulkFiles] = useState<File[]>([]);
    const [bulkPreviews, setBulkPreviews] = useState<Array<{ name: string; url: string }>>([]);

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

    // Load banner details if editing
    const loadBanners = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/cms/banners", { cache: "no-store" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load banners");
            const allBanners = json.banners || [];
            setBanners(allBanners);

            if (editId) {
                const activeBanner = allBanners.find((b: any) => b.id === editId);
                if (activeBanner) {
                    setDraft({
                        id: activeBanner.id,
                        title: activeBanner.title,
                        content_text: activeBanner.content_text || "",
                        image_url: activeBanner.image_url || "",
                        link_url: activeBanner.link_url || "",
                        placement: activeBanner.placement,
                        bg_color: activeBanner.bg_color,
                        text_color: activeBanner.text_color,
                        is_active: activeBanner.is_active,
                        start_date: activeBanner.start_date || "",
                        end_date: activeBanner.end_date || "",
                        priority: activeBanner.priority || 0,
                        button_text: activeBanner.button_text || "",
                    });

                    if (activeBanner.placement === "homepage_hero") {
                        const existing = allBanners.filter(
                            (b: any) => b.placement === "homepage_hero" && b.image_url?.trim()
                        );
                        setHeroExistingBanners(existing);
                    }
                } else {
                    setMessage({ type: "error", text: "Banner not found." });
                }
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to load banner details" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, [editId]);

    const updateDraftField = <K extends keyof Draft>(field: K, value: Draft[K]) => {
        setDraft((prev) => {
            const next = { ...prev, [field]: value };
            if (prev.placement === "homepage_hero" && editId && prev.id) {
                setHeroExistingBanners((existing) =>
                    existing.map((b) => {
                        if (b.id === prev.id) {
                            const val = (field === "start_date" || field === "end_date" || field === "content_text" || field === "image_url" || field === "link_url" || field === "button_text") && !value
                                ? null
                                : value;
                            return {
                                ...b,
                                [field]: val
                            } as Banner;
                        }
                        return b;
                    })
                );
            }
            return next;
        });
    };

    const removeHeroImage = async (bannerId: string) => {
        const nextHero = heroExistingBanners.filter((b) => b.id !== bannerId);
        setHeroExistingBanners(nextHero);
        setPendingHeroRemovals((prev) => (prev.includes(bannerId) ? prev : [...prev, bannerId]));

        if (draft.id === bannerId) {
            const nextEditable = nextHero[0];
            if (nextEditable) {
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
                    button_text: nextEditable.button_text || "",
                });
            } else {
                setDraft({
                    title: "",
                    content_text: "",
                    image_url: "",
                    link_url: "",
                    placement: "homepage_hero",
                    bg_color: "#000000",
                    text_color: "#FFFFFF",
                    is_active: true,
                    start_date: "",
                    end_date: "",
                    priority: 0,
                    button_text: "",
                });
            }
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

            const newUrl = String(json.imageUrl || "");
            updateDraftField("image_url", newUrl);
            setMessage({ type: "success", text: "Banner image uploaded." });
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to upload banner image";
            setMessage({ type: "error", text });
        } finally {
            setUploadingImage(false);
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

        return Array.isArray(uploadJson.imageUrls) ? uploadJson.imageUrls : [];
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
        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || "Failed to save hero banner layout mode");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            if (editId) {
                // UPDATE ACTION
                if (draft.placement === "homepage_hero" && draft.is_active) {
                    const activeHeroes = banners.filter(b => b.placement === "homepage_hero" && b.is_active && b.id !== draft.id);
                    for (const activeHero of activeHeroes) {
                        await fetch("/api/admin/cms/banners", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...activeHero, is_active: false }),
                        });
                    }
                }

                const removalIds = draft.placement === "homepage_hero" ? [...pendingHeroRemovals] : [];

                if (removalIds.length > 0) {
                    for (const id of removalIds) {
                        await fetch("/api/admin/cms/banners", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "soft-delete", id }),
                        });
                    }
                }

                if (draft.placement === "homepage_hero") {
                    const activeExisting = heroExistingBanners.filter((b) => !removalIds.includes(b.id));
                    for (const b of activeExisting) {
                        const res = await fetch("/api/admin/cms/banners", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(b),
                        });
                        if (!res.ok) {
                            const json = await res.json();
                            throw new Error(json.error || `Failed to update banner: ${b.title}`);
                        }
                    }
                } else {
                    const res = await fetch("/api/admin/cms/banners", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(draft),
                    });
                    if (!res.ok) {
                        const json = await res.json();
                        throw new Error(json.error || "Failed to update banner");
                    }
                }

                if (draft.placement === "homepage_hero" && bulkFiles.length > 0) {
                    const imageUrls = await uploadBulkImages(bulkFiles);
                    const titlePrefix = bulkDraft.title_prefix.trim() || "Hero Banner";
                    const extraBanners = imageUrls.map((imageUrl, idx) => ({
                        title: `${titlePrefix} ${idx + 1}`,
                        content_text: bulkDraft.content_text || draft.content_text || "",
                        image_url: imageUrl,
                        link_url: bulkDraft.link_url || draft.link_url || "/shop",
                        placement: draft.placement,
                        bg_color: bulkDraft.bg_color || draft.bg_color || "#000000",
                        text_color: bulkDraft.text_color || draft.text_color || "#FFFFFF",
                        is_active: bulkDraft.is_active ?? true,
                        start_date: bulkDraft.start_date || draft.start_date || null,
                        end_date: bulkDraft.end_date || draft.end_date || null,
                        priority: (bulkDraft.priority_start || draft.priority || 100) - (idx + 1),
                        button_text: bulkDraft.button_text || draft.button_text || "",
                    }));

                    const createRes = await fetch("/api/admin/cms/banners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "bulk-create", banners: extraBanners }),
                    });
                    if (!createRes.ok) {
                        const createJson = await createRes.json();
                        throw new Error(createJson.error || "Failed to create bulk hero banners");
                    }
                }

                if (draft.placement === "homepage_hero") {
                    await saveHeroLayoutMode(bulkDraft.hero_layout);
                }
            } else {
                // CREATE ACTION
                if (draft.placement === "homepage_hero" && draft.is_active) {
                    const activeHeroes = banners.filter(b => b.placement === "homepage_hero" && b.is_active);
                    for (const activeHero of activeHeroes) {
                        await fetch("/api/admin/cms/banners", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...activeHero, is_active: false }),
                        });
                    }
                }

                const res = await fetch("/api/admin/cms/banners", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(draft),
                });
                if (!res.ok) {
                    const json = await res.json();
                    throw new Error(json.error || "Failed to create banner");
                }

                if (draft.placement === "homepage_hero") {
                    await saveHeroLayoutMode(bulkDraft.hero_layout);
                }
            }

            router.push("/admin/cms");
            router.refresh();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to save changes" });
        } finally {
            setSaving(false);
        }
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

            if (bulkDraft.placement === "homepage_hero" && bulkDraft.is_active) {
                const activeHeroes = banners.filter(b => b.placement === "homepage_hero" && b.is_active);
                for (const activeHero of activeHeroes) {
                    await fetch("/api/admin/cms/banners", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...activeHero, is_active: false }),
                    });
                }
            }

            const titlePrefix = bulkDraft.title_prefix.trim() || "Banner";
            const payloadBanners = imageUrls.map((imageUrl, idx) => ({
                title: `${titlePrefix} ${idx + 1}`,
                content_text: bulkDraft.content_text,
                image_url: imageUrl,
                link_url: bulkDraft.link_url,
                placement: bulkDraft.placement,
                bg_color: bulkDraft.bg_color,
                text_color: bulkDraft.text_color,
                is_active: bulkDraft.placement === "homepage_hero" ? (bulkDraft.is_active && idx === 0) : bulkDraft.is_active,
                start_date: bulkDraft.start_date || null,
                end_date: bulkDraft.end_date || null,
                priority: bulkDraft.priority_start - idx,
                button_text: bulkDraft.button_text,
            }));

            const createRes = await fetch("/api/admin/cms/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "bulk-create", banners: payloadBanners }),
            });
            if (!createRes.ok) {
                const createJson = await createRes.json();
                throw new Error(createJson.error || "Failed to create banners");
            }

            if (bulkDraft.placement === "homepage_hero") {
                await saveHeroLayoutMode(bulkDraft.hero_layout);
            }

            router.push("/admin/cms");
            router.refresh();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to bulk upload banners" });
        } finally {
            setBulkSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                <p className="text-sm text-gray-500 font-medium">Loading banner details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/cms"
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Back to CMS Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{editId ? "Edit Banner" : "Create New Banner"}</h2>
                        <p className="text-sm text-gray-500">{editId ? "Update visual details, schedules and slide properties." : "Define settings and publish a new promotional banner placement."}</p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`rounded-lg px-4 py-3 text-sm border ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Banner Title (Heading)</label>
                        <input
                            value={draft.title}
                            onChange={(e) => updateDraftField("title", e.target.value)}
                            placeholder="e.g. Hero Banner 1"
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Placement Slot</label>
                        <select
                            value={draft.placement}
                            onChange={(e) => {
                                const placement = e.target.value as BannerPlacement;
                                updateDraftField("placement", placement);
                                setBulkDraft((prev) => ({ ...prev, placement }));
                                if (placement !== "homepage_hero") {
                                    setBulkFiles([]);
                                }
                            }}
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 bg-white"
                        >
                            {placements.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Content Text (Description)</label>
                        <textarea
                            value={draft.content_text}
                            onChange={(e) => {
                                const next = e.target.value;
                                updateDraftField("content_text", next);
                                setBulkDraft((prev) => ({ ...prev, content_text: next }));
                            }}
                            placeholder="Description paragraph text"
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 md:col-span-2"
                            rows={3}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Redirect Link URL</label>
                        <input
                            value={draft.link_url}
                            onChange={(e) => {
                                const next = e.target.value;
                                updateDraftField("link_url", next);
                                setBulkDraft((prev) => ({ ...prev, link_url: next }));
                            }}
                            placeholder="e.g. /shop"
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Banner Button Text (CTA Label)</label>
                        <input
                            value={draft.button_text}
                            onChange={(e) => {
                                const next = e.target.value;
                                updateDraftField("button_text", next);
                                setBulkDraft((prev) => ({ ...prev, button_text: next }));
                            }}
                            placeholder="e.g. Explore Collection"
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Image URL</label>
                        <input
                            value={draft.image_url}
                            onChange={(e) => updateDraftField("image_url", e.target.value)}
                            placeholder="Image path or external link"
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 md:col-span-2 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Upload Image File</label>
                        <div className="md:col-span-2 space-y-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadBannerImage(file);
                                }}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-950 file:text-white cursor-pointer"
                            />
                            {uploadingImage ? <p className="text-xs text-indigo-600">Uploading image...</p> : null}
                            {draft.image_url ? (
                                <div className="w-full max-w-xs h-32 rounded-md overflow-hidden border border-gray-200 bg-gray-100 mt-2">
                                    <img src={draft.image_url} alt="Banner preview" className="w-full h-full object-cover" />
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Background Color</label>
                        <input
                            type="color"
                            value={draft.bg_color}
                            onChange={(e) => {
                                const next = e.target.value;
                                updateDraftField("bg_color", next);
                                setBulkDraft((prev) => ({ ...prev, bg_color: next }));
                            }}
                            className="h-10 w-full rounded-md border border-gray-300 cursor-pointer"
                            title="Background color"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Text Color</label>
                        <input
                            type="color"
                            value={draft.text_color}
                            onChange={(e) => {
                                const next = e.target.value;
                                updateDraftField("text_color", next);
                                setBulkDraft((prev) => ({ ...prev, text_color: next }));
                            }}
                            className="h-10 w-full rounded-md border border-gray-300 cursor-pointer"
                            title="Text color"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Visibility Start Date</label>
                        <input
                            type="date"
                            value={draft.start_date}
                            onChange={(e) => {
                                const next = e.target.value;
                                updateDraftField("start_date", next);
                                setBulkDraft((prev) => ({ ...prev, start_date: next }));
                            }}
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Visibility End Date</label>
                        <input
                            type="date"
                            value={draft.end_date}
                            onChange={(e) => {
                                const next = e.target.value;
                                updateDraftField("end_date", next);
                                setBulkDraft((prev) => ({ ...prev, end_date: next }));
                            }}
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Display Priority Rank</label>
                        <input
                            type="number"
                            value={draft.priority}
                            onChange={(e) => {
                                const next = Number(e.target.value || 0);
                                updateDraftField("priority", next);
                                setBulkDraft((prev) => ({ ...prev, priority_start: next }));
                            }}
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 bg-white"
                            placeholder="Priority"
                        />
                    </div>
                </div>

                {draft.placement === "homepage_hero" && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-indigo-900">Homepage Hero Settings</p>
                            <p className="text-xs text-indigo-700 mt-1">Choose banner width mode and optionally upload multiple hero images in one go.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Banner Width Mode</label>
                                <select
                                    value={bulkDraft.hero_layout}
                                    onChange={(e) => setBulkDraft((prev) => ({ ...prev, hero_layout: e.target.value as BannerLayoutMode }))}
                                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/5"
                                >
                                    <option value="contained">Normal Banner Width</option>
                                    <option value="full_width">Full Width Banner</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Bulk Banner Title Prefix</label>
                                <input
                                    value={bulkDraft.title_prefix}
                                    onChange={(e) => setBulkDraft((prev) => ({ ...prev, title_prefix: e.target.value }))}
                                    placeholder="Title prefix (e.g., Hero Banner)"
                                    className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/5"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {editId && heroExistingBanners.length > 0 ? (
                                <div className="space-y-1.5">
                                    <p className="text-xs text-gray-600 font-semibold">Current hero images ({heroExistingBanners.length}) - Click a slide thumbnail below to edit its specific details above:</p>
                                    <div className="max-h-40 overflow-auto border border-gray-200 rounded-md p-2 bg-white">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                            {heroExistingBanners.map((banner, idx) => {
                                                const isSelected = banner.id === draft.id;
                                                return (
                                                    <div
                                                        key={`${banner.id}-${idx}`}
                                                        onClick={() => {
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
                                                                button_text: banner.button_text || "",
                                                            });
                                                        }}
                                                        className={`relative rounded-md border p-1 cursor-pointer transition-all hover:bg-gray-50 flex flex-col justify-between ${
                                                            isSelected
                                                                ? "border-indigo-600 ring-2 ring-indigo-600/35 bg-indigo-50/10"
                                                                : "border-gray-200 bg-white"
                                                        }`}
                                                        title="Click to edit details for this slide"
                                                    >
                                                        <div className="w-full h-14 rounded overflow-hidden bg-gray-100">
                                                            {banner.image_url ? (
                                                                <img src={banner.image_url} alt={`Hero image ${idx + 1}`} className="w-full h-full object-cover" />
                                                            ) : null}
                                                        </div>
                                                        <div className="mt-1 text-[10px] text-center text-gray-500 font-semibold truncate px-1">
                                                            {banner.title || `Slide ${idx + 1}`}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeHeroImage(banner.id);
                                                            }}
                                                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center hover:bg-red-700 shadow-sm"
                                                            title="Remove this image"
                                                            aria-label="Remove this image"
                                                        >
                                                            x
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Select/Upload Hero Images</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setBulkFiles(Array.from(e.target.files || []))}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-950 file:text-white cursor-pointer"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                {bulkFiles.length > 0
                                    ? editId
                                        ? `${bulkFiles.length} file(s) selected. On Save: all selected files will be uploaded and created as new hero banners.`
                                        : `${bulkFiles.length} file(s) selected. Use Upload & Create All to create all hero banners at once.`
                                    : editId
                                        ? "Select files to append new hero images to this set."
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
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 font-semibold cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={draft.is_active}
                            onChange={(e) => {
                                const next = e.target.checked;
                                updateDraftField("is_active", next);
                                setBulkDraft((prev) => ({ ...prev, is_active: next }));
                            }}
                            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900/5 h-4 w-4"
                        />
                        Active banner
                    </label>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving || bulkSubmitting}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {editId ? "Save Changes" : "Create Banner"}
                                </>
                            )}
                        </button>
                        {!editId && draft.placement === "homepage_hero" ? (
                            <button
                                onClick={bulkUploadAndCreate}
                                disabled={bulkFiles.length === 0 || bulkSubmitting || saving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {bulkSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Upload & Create All
                                    </>
                                )}
                            </button>
                        ) : null}
                        <Link
                            href="/admin/cms"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
