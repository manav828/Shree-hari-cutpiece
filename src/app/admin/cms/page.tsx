"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HeroConfigForm from "@/components/admin/cms/HeroConfigForm";
import DescriptionConfigForm from "@/components/admin/cms/DescriptionConfigForm";
import StoreConfigForm from "@/components/admin/cms/StoreConfigForm";
import CategoriesManager from "@/components/admin/cms/CategoriesManager";
import BannersManager from "@/components/admin/cms/BannersManager";
import type { SiteConfigField } from "@/components/admin/cms/SiteConfigFormSection";

type TabId = "hero" | "description" | "store" | "categories" | "banners";

type ConfigType = "text" | "textarea" | "number" | "url";

type SaveUpdate = {
    key: string;
    value: string;
    type: ConfigType;
    label: string;
    group: "hero" | "description" | "store" | "stats";
    required?: boolean;
};

const tabs: { id: TabId; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "description", label: "Description" },
    { id: "store", label: "Store Info" },
    { id: "categories", label: "Categories" },
    { id: "banners", label: "Banners" },
];

const heroFields: SiteConfigField[] = [
    {
        key: "hero_banner_layout",
        label: "Homepage Hero Banner Layout",
        type: "select",
        group: "hero",
        helpText: "Choose how homepage_hero banners render on website.",
        options: [
            { label: "Current (Contained)", value: "contained" },
            { label: "Full Width", value: "full_width" },
        ],
    },
    { key: "hero_badge", label: "Hero Badge", type: "text", group: "hero", required: true },
    { key: "hero_headline", label: "Hero Headline", type: "text", group: "hero", required: true },
    { key: "hero_subheading", label: "Hero Subheading", type: "text", group: "hero", required: true },
    { key: "hero_description", label: "Hero Description", type: "textarea", group: "hero", required: true },
    { key: "hero_cta1_label", label: "CTA 1 Label", type: "text", group: "hero", required: true },
    { key: "hero_cta1_url", label: "CTA 1 URL", type: "url", group: "hero", required: true },
    { key: "hero_cta2_label", label: "CTA 2 Label", type: "text", group: "hero", required: true },
    { key: "hero_cta2_url", label: "CTA 2 URL", type: "url", group: "hero", required: true },
    { key: "hero_stat1_number", label: "Stat 1 Number", type: "text", group: "stats", required: true },
    { key: "hero_stat1_label", label: "Stat 1 Label", type: "text", group: "stats", required: true },
    { key: "hero_stat2_number", label: "Stat 2 Number", type: "text", group: "stats", required: true },
    { key: "hero_stat2_label", label: "Stat 2 Label", type: "text", group: "stats", required: true },
    { key: "hero_stat3_number", label: "Stat 3 Number", type: "text", group: "stats", required: true },
    { key: "hero_stat3_label", label: "Stat 3 Label", type: "text", group: "stats", required: true },
    { key: "hero_desktop_image", label: "Desktop Hero Image", type: "image", group: "hero", helpText: "Recommended wide image for desktop hero." },
    { key: "hero_mobile_image", label: "Mobile Hero Image", type: "image", group: "hero", helpText: "Recommended portrait image for mobile hero." },
];

const descriptionFields: SiteConfigField[] = [
    { key: "desc_badge", label: "Section Badge", type: "text", group: "description", required: true },
    { key: "desc_headline", label: "Headline", type: "text", group: "description", required: true },
    { key: "desc_headline_accent", label: "Headline Accent", type: "text", group: "description", required: true },
    { key: "desc_paragraph", label: "Main Paragraph", type: "textarea", group: "description", required: true },
    { key: "desc_point1_title", label: "Point 1 Title", type: "text", group: "description", required: true },
    { key: "desc_point1_text", label: "Point 1 Text", type: "text", group: "description", required: true },
    { key: "desc_point2_title", label: "Point 2 Title", type: "text", group: "description", required: true },
    { key: "desc_point2_text", label: "Point 2 Text", type: "text", group: "description", required: true },
    { key: "desc_point3_title", label: "Point 3 Title", type: "text", group: "description", required: true },
    { key: "desc_point3_text", label: "Point 3 Text", type: "text", group: "description", required: true },
    { key: "desc_stat_number", label: "Floating Stat Number", type: "text", group: "description", required: true },
    { key: "desc_stat_label", label: "Floating Stat Label", type: "text", group: "description", required: true },
    { key: "desc_image1", label: "Description Image 1", type: "image", group: "description" },
    { key: "desc_image2", label: "Description Image 2", type: "image", group: "description" },
];

const storeFields: SiteConfigField[] = [
    { key: "store_address", label: "Store Address", type: "textarea", group: "store", required: true },
    { key: "store_hours_weekday", label: "Weekday Hours", type: "text", group: "store", required: true },
    { key: "store_hours_weekend", label: "Weekend Hours", type: "text", group: "store", required: true },
    { key: "store_phone", label: "Phone", type: "text", group: "store", required: true },
    { key: "store_email", label: "Email", type: "text", group: "store", required: true },
    { key: "store_maps_url", label: "Directions URL", type: "url", group: "store", required: true },
    { key: "store_embed_url", label: "Maps Embed URL", type: "url", group: "store", required: true },
];

function mapToSaveUpdates(fields: SiteConfigField[], values: Record<string, string>): SaveUpdate[] {
    return fields
        .filter((f) => f.type !== "image")
        .map((f) => ({
            key: f.key,
            value: values[f.key] ?? "",
            type: (f.type === "select" ? "text" : f.type) as ConfigType,
            label: f.label,
            group: f.group,
            required: f.required,
        }));
}

export default function AdminCmsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("hero");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const [initialValues, setInitialValues] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setMessage(null);
            try {
                const res = await fetch("/api/admin/cms/site-config", { cache: "no-store" });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to load CMS config");
                setValues(json.map || {});
                setInitialValues(json.map || {});
            } catch (err: unknown) {
                const text = err instanceof Error ? err.message : "Failed to load CMS config";
                setMessage({ type: "error", text });
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const fieldsForTab = useMemo(() => {
        if (activeTab === "hero") return heroFields;
        if (activeTab === "description") return descriptionFields;
        if (activeTab === "categories") return [];
        if (activeTab === "banners") return [];
        return storeFields;
    }, [activeTab]);

    const isDirty = useMemo(() => {
        for (const f of fieldsForTab) {
            const current = values[f.key] ?? "";
            const original = initialValues[f.key] ?? "";
            if (current !== original) return true;
        }
        return false;
    }, [fieldsForTab, initialValues, values]);

    const switchTab = (next: TabId) => {
        if (next === activeTab) return;
        if (isDirty) {
            const discard = window.confirm("You have unsaved changes. Discard and switch tabs?");
            if (!discard) return;
        }
        setActiveTab(next);
        setMessage(null);
    };

    const onChange = (key: string, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const saveCurrentTab = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const updates = mapToSaveUpdates(fieldsForTab, values);
            const res = await fetch("/api/admin/cms/site-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save changes");

            setInitialValues((prev) => ({ ...prev, ...Object.fromEntries(updates.map((u) => [u.key, u.value])) }));
            setMessage({ type: "success", text: "Saved successfully. Changes are now live." });
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to save changes";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const uploadImage = async (field: SiteConfigField, file: File) => {
        setUploadingKey(field.key);
        setMessage(null);
        try {
            const form = new FormData();
            form.append("key", field.key);
            form.append("label", field.label);
            form.append("group", field.group);
            form.append("file", file);

            const res = await fetch("/api/admin/cms/site-config", {
                method: "POST",
                body: form,
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to upload image");

            const nextValue = String(json.value || "");
            setValues((prev) => ({ ...prev, [field.key]: nextValue }));
            setInitialValues((prev) => ({ ...prev, [field.key]: nextValue }));
            setMessage({ type: "success", text: `${field.label} uploaded successfully.` });
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to upload image";
            setMessage({ type: "error", text });
        } finally {
            setUploadingKey(null);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Content & Banners</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage homepage content and store information.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        target="_blank"
                        className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Open Website
                    </Link>
                    <button
                        onClick={saveCurrentTab}
                        disabled={saving || loading}
                        className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {isDirty ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    You have unsaved changes. Save before leaving this tab.
                </div>
            ) : null}

            {message ? (
                <div
                    className={`rounded-lg px-4 py-3 text-sm border ${message.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-red-50 border-red-200 text-red-700"
                        }`}
                >
                    {message.text}
                </div>
            ) : null}

            <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-2 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => switchTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
                    Loading CMS configuration...
                </div>
            ) : null}

            {!loading && activeTab === "hero" ? (
                <HeroConfigForm
                    fields={heroFields}
                    values={values}
                    uploadingKey={uploadingKey}
                    onChange={onChange}
                    onUpload={uploadImage}
                />
            ) : null}

            {!loading && activeTab === "description" ? (
                <DescriptionConfigForm
                    fields={descriptionFields}
                    values={values}
                    uploadingKey={uploadingKey}
                    onChange={onChange}
                    onUpload={uploadImage}
                />
            ) : null}

            {!loading && activeTab === "store" ? (
                <StoreConfigForm
                    fields={storeFields}
                    values={values}
                    uploadingKey={uploadingKey}
                    onChange={onChange}
                    onUpload={uploadImage}
                />
            ) : null}

            {!loading && activeTab === "categories" ? (
                <CategoriesManager />
            ) : null}

            {!loading && activeTab === "banners" ? (
                <BannersManager />
            ) : null}
        </div>
    );
}
