"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";

type BannerPlacement = "announcement_bar" | "homepage_hero" | "shop_top" | "popup";

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
    button_text?: string | null;
};

type HeroGroupRow = {
    kind: "homepage_hero_group";
    banners: Banner[];
    representative: Banner;
    count: number;
    activeCount: number;
};

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
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
            const nextActive = !banner.is_active;

            if (banner.placement === "homepage_hero" && nextActive) {
                const activeHeroes = banners.filter(b => b.placement === "homepage_hero" && b.is_active && b.id !== banner.id);
                for (const activeHero of activeHeroes) {
                    await fetch("/api/admin/cms/banners", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...activeHero,
                            is_active: false,
                        }),
                    });
                }
            }

            const res = await fetch("/api/admin/cms/banners", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...banner,
                    is_active: nextActive,
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

    return (
        <div className="relative space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Banners</h2>
                    <p className="text-sm text-gray-500">Create and schedule promotional banners by placement.</p>
                </div>
                <Link
                    href="/admin/cms/banners/new"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Banner
                </Link>
            </div>

            {message ? (
                <div className={`rounded-lg px-4 py-3 text-sm border ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {message.text}
                </div>
            ) : null}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-sm text-gray-500">Loading banners...</div>
                ) : listRows.length === 0 ? (
                    <div className="p-8 text-sm text-gray-500">No banners found.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Preview</TableHead>
                                <TableHead>Placement & Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listRows.map((row) => {
                                if (isHeroGroupRow(row)) {
                                    const representative = row.representative;
                                    const status = row.activeCount > 0 ? getStatus(representative) : "Inactive";
                                    const nextActive = row.activeCount === 0;

                                    return (
                                        <TableRow key="homepage_hero_group" className="group">
                                            <TableCell>
                                                <div className="w-20 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 grid grid-cols-2 gap-px">
                                                    {row.banners.slice(0, 4).map((banner) => (
                                                        <div key={banner.id} className="bg-gray-100">
                                                            {banner.image_url ? <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" /> : null}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900 truncate">Homepage Hero Banners</span>
                                                    <span className="text-xs text-gray-500 truncate">{row.count} images · {representative.placement} · Top Priority {representative.priority}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded ${status === "Active" ? "bg-emerald-100 text-emerald-700" : status === "Scheduled" ? "bg-amber-100 text-amber-700" : status === "Expired" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}>
                                                    {status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => quickTogglePlacement("homepage_hero", nextActive)}
                                                        disabled={saving}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${row.activeCount > 0 ? "bg-emerald-500" : "bg-gray-300"}`}
                                                        title={row.activeCount > 0 ? "Turn all off" : "Turn all on"}
                                                        aria-label={row.activeCount > 0 ? "Turn all homepage hero banners off" : "Turn all homepage hero banners on"}
                                                    >
                                                        <span
                                                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${row.activeCount > 0 ? "translate-x-5" : "translate-x-1"}`}
                                                        />
                                                    </button>
                                                    <Link
                                                        href={`/admin/cms/banners/${representative.id}/edit`}
                                                        className="p-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors inline-block"
                                                        title="Edit hero banner set"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => softDeletePlacement("homepage_hero")}
                                                        disabled={saving}
                                                        className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Soft delete all hero banners"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }

                                const b = row;
                                const status = getStatus(b);
                                return (
                                    <TableRow key={b.id} className="group">
                                        <TableCell>
                                            <div className="w-14 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                                                {b.image_url ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" /> : null}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900 truncate">{b.title}</span>
                                                <span className="text-xs text-gray-500 truncate">{b.placement} · Priority {b.priority}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-1 rounded ${status === "Active" ? "bg-emerald-100 text-emerald-700" : status === "Scheduled" ? "bg-amber-100 text-amber-700" : status === "Expired" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}>
                                                {status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => quickToggle(b)}
                                                    disabled={saving}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${b.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                                                    title={b.is_active ? "Turn off" : "Turn on"}
                                                    aria-label={b.is_active ? "Turn banner off" : "Turn banner on"}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${b.is_active ? "translate-x-5" : "translate-x-1"}`}
                                                    />
                                                </button>
                                                <Link
                                                    href={`/admin/cms/banners/${b.id}/edit`}
                                                    className="p-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors inline-block"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => softDelete(b.id)}
                                                    disabled={saving}
                                                    className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Soft delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
