"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
const sb = supabase as any;
import { removeMissingProductsColumnFromPayload } from "@/lib/productsSchemaFallback";
import { processImageForUpload } from "@/lib/imageOptimization";
import {
    ArrowLeft, Save, Trash2, Plus, Upload, X, Loader2, Eye, EyeOff,
    Star, Sparkles, CircleHelp, ChevronUp, ChevronDown
} from "lucide-react";
import { inputClassName } from "@/components/admin/ui/Input";

/* ─── Types ─── */
interface VariantImage {
    id?: string; image_url: string; is_primary: boolean; sort_order: number;
    media_type: "image" | "video"; file?: File; preview?: string;
}
interface Variant {
    id?: string; color_name: string; color_hex: string; material_label: string;
    price: number; original_price: number; stock: number; sku: string;
    is_default: boolean; sort_order: number; images: VariantImage[];
    place: string;
}
type OptionInputType = "radio" | "multi" | "dropdown" | "input";
type OptionInputDataType = "text" | "number";

interface OptionValue {
    id?: string; label: string; value: string; is_default: boolean;
    sort_order: number; is_active: boolean;
}

interface OptionGroup {
    id?: string; name: string; input_type: OptionInputType; input_data_type: OptionInputDataType;
    required: boolean; min_selections?: number | null; max_selections?: number | null;
    placeholder?: string; help_text?: string;
    input_min_length?: number | null; input_max_length?: number | null;
    input_min_value?: number | null; input_max_value?: number | null;
    sort_order: number; is_active: boolean; values: OptionValue[];
}

interface FaqRow {
    question: string;
    answer: string;
}
interface ProductForm {
    name: string; slug: string; category_id: string; description: string;
    fabric: string; width: string; care_instructions: string;
    sell_mode: "meter" | "quantity"; is_featured: boolean; is_new_arrival: boolean;
    is_active: boolean; sort_order: number;
    discount_type: "percent" | "flat"; discount_label: string;
    description_html: string;
    description_css: string;
    use_custom_description: boolean;
    related_product_ids: string[];
    long_description: string;
    meta_title: string; meta_description: string; canonical_url: string;
    og_title: string; og_description: string; og_image_url: string;
    twitter_card_type: "summary" | "summary_large_image";
    custom_tabs?: any[];
}

/* ─── Reusable ─── */
function Section({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
            <div className="flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</span>
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            </div>
            {children}
        </div>
    );
}
function Label({ children, tip }: { children: React.ReactNode; tip?: string }) {
    return (<div className="mb-1.5"><label className="text-sm font-semibold text-gray-700">{children}</label>{tip && <p className="text-xs text-gray-400 mt-0.5">{tip}</p>}</div>);
}
const inputCls = inputClassName;

/* ─── Main ─── */
export default function AddProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([]);
    const [productSearch, setProductSearch] = useState("");

    const [form, setForm] = useState<ProductForm>({
        name: "", slug: "", category_id: "", description: "", fabric: "", width: "",
        care_instructions: "", sell_mode: "meter", is_featured: false, is_new_arrival: false,
        is_active: true, sort_order: 0, discount_type: "percent", discount_label: "",
        description_html: "",
        description_css: "",
        use_custom_description: false,
        related_product_ids: [],
        long_description: "",
        meta_title: "", meta_description: "", canonical_url: "",
        og_title: "", og_description: "", og_image_url: "",
        twitter_card_type: "summary_large_image",
        custom_tabs: [],
    });

    const [variants, setVariants] = useState<Variant[]>([{
        color_name: "", color_hex: "#000000", material_label: "", price: 0,
        original_price: 0, stock: 0, sku: "", is_default: true, sort_order: 0, images: [], place: "",
    }]);

    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [highlights, setHighlights] = useState<string[]>([]);
    const [faqs, setFaqs] = useState<FaqRow[]>([]);
    const [tabFiles, setTabFiles] = useState<Record<string, File>>({});
    const [tabPreviews, setTabPreviews] = useState<Record<string, string>>({});

    const addTab = () => {
        const newTab = {
            id: `tab-${Date.now()}`,
            label: "New Tab",
            type: "custom",
            headline: "",
            description: "",
            image_url: "",
            quote: "",
            link_label: "",
            link_url: "",
        };
        upd("custom_tabs", [...(form.custom_tabs || []), newTab]);
    };

    const deleteTab = (id: string) => {
        const filtered = (form.custom_tabs || []).filter((t: any) => t.id !== id);
        upd("custom_tabs", filtered);
        setTabFiles(prev => { const c = { ...prev }; delete c[id]; return c; });
        setTabPreviews(prev => { const c = { ...prev }; delete c[id]; return c; });
    };

    const getPrefilledSpecs = () => {
        const formFabric = form.fabric || "";
        const formWidth = form.width || "";
        const formCare = form.care_instructions || "";
        
        return [
            { label: "Material", value: formFabric || "100% Cotton" },
            { label: "Origin", value: "Handwoven in India" },
            { label: "Dye Method", value: "Natural Dyes" },
            { label: "GSM", value: "160 GSM" },
            { label: "Width", value: formWidth || "Not specified" },
            { label: "Care", value: formCare || "Gentle hand wash" }
        ].filter(s => s.value && s.value !== "Not specified");
    };

    const getPrefilledFaqs = () => {
        if (faqs && faqs.length > 0) {
            return faqs.map(f => ({ question: f.question, answer: f.answer }));
        }
        return [
            { question: "Is this fabric pre-shrunk?", answer: "No, handloom cotton can shrink 3-5% on the first wash. We recommend washing before sewing." },
            { question: "Are color variations normal?", answer: "Yes, natural dyes and handweaving create organic, subtle variations that make each piece unique." }
        ];
    };

    const getPrefilledDetails = () => {
        const formWidth = form.width || "";
        
        return [
            { label: "Fabric Width", value: formWidth || "44 inches (112 cm)" },
            { label: "Weight", value: "160 GSM" },
            { label: "Shrinkage", value: "3% - 5%" },
            { label: "Transparency", value: "Semi-Opaque" }
        ].filter(d => d.value && d.value !== "Not specified" && d.value !== "N/A");
    };

    const getPrefilledGuide = () => {
        return [
            { use: "Straight Kurti", min: 2.5, max: 3 },
            { use: "Anarkali / Flared Kurti", min: 4, max: 5.5 },
            { use: "Suit Set (Top + Bottom + Dupatta)", min: 6.5, max: 8 },
            { use: "Saree Blouse", min: 0.8, max: 1.2 }
        ];
    };

    const updateTab = (id: string, fields: any) => {
        const updated = (form.custom_tabs || []).map((t: any) => {
            if (t.id === id) {
                const merged = { ...t, ...fields };
                if (fields.type === "materials") {
                    if (!merged.specs) merged.specs = getPrefilledSpecs();
                    if (!merged.faqs) merged.faqs = getPrefilledFaqs();
                } else if (fields.type === "dimensions") {
                    if (!merged.details) merged.details = getPrefilledDetails();
                    if (!merged.guide) merged.guide = getPrefilledGuide();
                }
                return merged;
            }
            return t;
        });
        upd("custom_tabs", updated);
    };

    const moveTab = (index: number, direction: "up" | "down") => {
        const tabsList = [...(form.custom_tabs || [])];
        if (direction === "up" && index > 0) {
            const temp = tabsList[index];
            tabsList[index] = tabsList[index - 1];
            tabsList[index - 1] = temp;
        } else if (direction === "down" && index < tabsList.length - 1) {
            const temp = tabsList[index];
            tabsList[index] = tabsList[index + 1];
            tabsList[index + 1] = temp;
        }
        upd("custom_tabs", tabsList);
    };

    useEffect(() => {
        sb.from("categories").select("id, name").order("sort_order").then(({ data }: any) => { if (data) setCategories(data); });
        sb.from("products").select("id, name").order("name").then(({ data }: any) => { if (data) setAllProducts(data); });
    }, []);

    const genSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const upd = (k: keyof ProductForm, v: string | boolean | number | string[]) => { setForm((p) => { const u = { ...p, [k]: v }; if (k === "name") u.slug = genSlug(v as string); return u; }); };
    const updV = (i: number, k: keyof Variant, v: string | number | boolean) => {
        setVariants((p) => { const u = [...p]; (u[i] as unknown as Record<string, unknown>)[k] = v; if (k === "is_default" && v === true) u.forEach((x, j) => { if (j !== i) x.is_default = false; }); return u; });
    };
    const addVariant = () => setVariants((p) => [...p, { color_name: "", color_hex: "#000000", material_label: "", price: 0, original_price: 0, stock: 0, sku: "", is_default: false, sort_order: p.length, images: [], place: "" }]);
    const rmVariant = (i: number) => { if (variants.length <= 1) return; setVariants((p) => { const u = p.filter((_, j) => j !== i); if (!u.some((x) => x.is_default) && u.length) u[0].is_default = true; return u; }); };
    const addImgs = (vi: number, files: FileList | null) => {
        if (!files) return;
        const newImgs: VariantImage[] = Array.from(files).map((f, i) => ({
            image_url: "", is_primary: variants[vi].images.length === 0 && i === 0,
            sort_order: variants[vi].images.length + i, media_type: f.type.startsWith("video") ? "video" : "image", file: f, preview: URL.createObjectURL(f),
        }));
        setVariants((p) => { const u = [...p]; u[vi] = { ...u[vi], images: [...u[vi].images, ...newImgs] }; return u; });
    };
    const rmImg = (vi: number, ii: number) => {
        setVariants((p) => { const u = [...p]; const imgs = [...u[vi].images]; const rm = imgs.splice(ii, 1); if (rm[0]?.preview) URL.revokeObjectURL(rm[0].preview); if (rm[0]?.is_primary && imgs.length) imgs[0].is_primary = true; u[vi] = { ...u[vi], images: imgs }; return u; });
    };
    const setPrimary = (vi: number, ii: number) => {
        setVariants((p) => { const u = [...p]; u[vi] = { ...u[vi], images: u[vi].images.map((img, i) => ({ ...img, is_primary: i === ii })) }; return u; });
    };

    const addOptionGroup = () => {
        setOptionGroups((p) => ([
            ...p,
            {
                name: "",
                input_type: "radio",
                input_data_type: "text",
                required: false,
                min_selections: null,
                max_selections: null,
                placeholder: "",
                help_text: "",
                input_min_length: null,
                input_max_length: null,
                input_min_value: null,
                input_max_value: null,
                sort_order: p.length,
                is_active: true,
                values: [
                    { label: "", value: "", is_default: false, sort_order: 0, is_active: true },
                ],
            },
        ]));
    };

    const updateOptionGroup = (i: number, field: keyof OptionGroup, value: any) => {
        setOptionGroups((p) => {
            const next = [...p];
            const current = { ...next[i], [field]: value } as OptionGroup;
            if (field === "input_type") {
                if (value === "input") {
                    current.values = [];
                } else if (!current.values || current.values.length === 0) {
                    current.values = [{ label: "", value: "", is_default: false, sort_order: 0, is_active: true }];
                }
            }
            next[i] = current;
            return next;
        });
    };

    const removeOptionGroup = (i: number) => {
        setOptionGroups((p) => p.filter((_, idx) => idx !== i));
    };

    const addOptionValue = (groupIndex: number) => {
        setOptionGroups((p) => {
            const next = [...p];
            const group = { ...next[groupIndex] };
            const values = group.values ? [...group.values] : [];
            values.push({ label: "", value: "", is_default: false, sort_order: values.length, is_active: true });
            group.values = values;
            next[groupIndex] = group;
            return next;
        });
    };

    const updateOptionValue = (groupIndex: number, valueIndex: number, field: keyof OptionValue, value: any) => {
        setOptionGroups((p) => {
            const next = [...p];
            const group = { ...next[groupIndex] };
            const values = group.values ? [...group.values] : [];
            const updated = { ...values[valueIndex], [field]: value } as OptionValue;
            if ((group.input_type === "radio" || group.input_type === "dropdown") && field === "is_default" && value === true) {
                values.forEach((v, idx) => {
                    values[idx] = { ...v, is_default: idx === valueIndex };
                });
            }
            values[valueIndex] = updated;
            group.values = values;
            next[groupIndex] = group;
            return next;
        });
    };

    const removeOptionValue = (groupIndex: number, valueIndex: number) => {
        setOptionGroups((p) => {
            const next = [...p];
            const group = { ...next[groupIndex] };
            group.values = (group.values || []).filter((_, idx) => idx !== valueIndex);
            next[groupIndex] = group;
            return next;
        });
    };

    const addHighlight = () => setHighlights((p) => [...p, ""]);
    const updateHighlight = (i: number, value: string) => setHighlights((p) => p.map((v, idx) => idx === i ? value : v));
    const removeHighlight = (i: number) => setHighlights((p) => p.filter((_, idx) => idx !== i));

    const addFaq = () => setFaqs((p) => [...p, { question: "", answer: "" }]);
    const updateFaq = (i: number, field: keyof FaqRow, value: string) => setFaqs((p) => p.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
    const removeFaq = (i: number) => setFaqs((p) => p.filter((_, idx) => idx !== i));

    const toggleRelatedProduct = (id: string) => {
        setForm((prev) => {
            const exists = prev.related_product_ids.includes(id);
            const nextIds = exists
                ? prev.related_product_ids.filter((pid) => pid !== id)
                : [...prev.related_product_ids, id];
            return { ...prev, related_product_ids: nextIds };
        });
    };

    const getDiscount = (price: number, mrp: number) => {
        if (!mrp || mrp <= price) return "";
        return form.discount_type === "percent" ? `${Math.round(((mrp - price) / mrp) * 100)}% off` : `₹${mrp - price} off`;
    };

    const saveOptionGroups = async (productId: string) => {
        for (let i = 0; i < optionGroups.length; i++) {
            const group = optionGroups[i];
            if (!group.name.trim()) continue;
            const { data: createdGroup, error: groupErr } = await sb
                .from("product_option_groups")
                .insert({
                    product_id: productId,
                    name: group.name,
                    input_type: group.input_type,
                    input_data_type: group.input_data_type,
                    required: group.required,
                    min_selections: group.min_selections || null,
                    max_selections: group.max_selections || null,
                    placeholder: group.placeholder || null,
                    help_text: group.help_text || null,
                    input_min_length: group.input_min_length || null,
                    input_max_length: group.input_max_length || null,
                    input_min_value: group.input_min_value || null,
                    input_max_value: group.input_max_value || null,
                    sort_order: i,
                    is_active: group.is_active,
                })
                .select("id")
                .single();

            if (groupErr || !createdGroup) throw groupErr;

            if (group.input_type === "input") continue;

            const values = (group.values || []).filter((v) => v.label.trim() || v.value.trim());
            if (!values.length) continue;

            const valueRows = values.map((v, idx) => ({
                group_id: createdGroup.id,
                label: v.label,
                value: v.value || v.label,
                is_default: v.is_default,
                sort_order: idx,
                is_active: v.is_active,
            }));

            const { error: valueErr } = await sb.from("product_option_values").insert(valueRows);
            if (valueErr) throw valueErr;
        }
    };

    const handleSave = async (draft = false) => {
        if (!form.name.trim()) return alert("Product name is required");
        if (variants.some((v) => !v.color_name.trim())) return alert("All variants need a color name");
        setSaving(true);
        try {
            const formWithoutTabs = { ...form };
            // @ts-ignore
            delete formWithoutTabs.custom_tabs;
            const productInsertPayload: Record<string, unknown> = {
                ...formWithoutTabs,
                short_description: form.description || null,
                description_html: form.description_html || null,
                description_css: form.description_css || null,
                use_custom_description: form.use_custom_description || false,
                related_product_ids: form.related_product_ids || [],
                long_description: form.long_description || null,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                canonical_url: form.canonical_url || null,
                og_title: form.og_title || null,
                og_description: form.og_description || null,
                og_image_url: form.og_image_url || null,
                twitter_card_type: form.twitter_card_type || "summary_large_image",
                highlights: highlights.filter((h) => h.trim()),
                faqs: faqs.filter((f) => f.question.trim() || f.answer.trim()),
                is_active: draft ? false : form.is_active,
                category_id: form.category_id || null,
            };

            let payloadForInsert = { ...productInsertPayload };
            let product: { id: string } | null = null;
            let pErr: { message: string } | null = null;

            for (let attempt = 0; attempt < 20; attempt += 1) {
                const { data, error } = await sb.from("products")
                    .insert(payloadForInsert)
                    .select("id").single();

                product = data;
                pErr = error;

                if (!pErr) {
                    break;
                }

                const { nextPayload, removedColumn } = removeMissingProductsColumnFromPayload(payloadForInsert, pErr.message);

                if (!removedColumn) {
                    break;
                }

                console.warn(`Skipping missing products column "${removedColumn}" and retrying create.`);
                payloadForInsert = nextPayload;
            }

            if (pErr || !product) throw pErr || new Error("Failed to create product");

            // Process dynamic custom tabs uploads
            const updatedTabs = JSON.parse(JSON.stringify(form.custom_tabs || []));
            for (let i = 0; i < updatedTabs.length; i++) {
                const tab = updatedTabs[i];
                if (tab.type === "custom") {
                    // Upload main tab image if a new file is attached
                    if (tabFiles[tab.id]) {
                        const file = tabFiles[tab.id];
                        const { large } = await processImageForUpload(file);
                        const ext = large.name.split(".").pop();
                        const name = `${product.id}/tabs/${tab.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
                        console.log(`Uploading dynamic tab file for ${tab.id}...`);
                        const { error: uErr } = await sb.storage.from("product-images").upload(name, large);
                        if (uErr) {
                            console.error(`Tab ${tab.id} image upload failed:`, uErr);
                        } else {
                            const publicUrl = sb.storage.from("product-images").getPublicUrl(name).data.publicUrl;
                            updatedTabs[i].image_url = publicUrl;
                        }
                    }

                    // Upload sub-item images/icons if new files are attached
                    if ((tab.layout === "accordion" || tab.layout === "grid") && tab.items) {
                        for (let j = 0; j < tab.items.length; j++) {
                            const item = tab.items[j];
                            const previewKey = `${tab.id}_${item.id || j}`;
                            if (tabFiles[previewKey]) {
                                const file = tabFiles[previewKey];
                                const { large } = await processImageForUpload(file);
                                const ext = large.name.split(".").pop();
                                const name = `${product.id}/tabs/${tab.id}/items/${item.id || `item-${j}`}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
                                console.log(`Uploading dynamic tab sub-item file for ${previewKey}...`);
                                const { error: uErr } = await sb.storage.from("product-images").upload(name, large);
                                if (uErr) {
                                    console.error(`Sub-item ${previewKey} image upload failed:`, uErr);
                                } else {
                                    const publicUrl = sb.storage.from("product-images").getPublicUrl(name).data.publicUrl;
                                    updatedTabs[i].items[j].image_url = publicUrl;
                                }
                            }
                        }
                    }
                }
            }

            // Sync legacy columns with the "story" custom tab for backward compatibility
            const storyTab = updatedTabs.find((t: any) => t.id === "story" && t.type === "custom");
            const artisanHeadline = storyTab?.headline || null;
            const artisanDescription = storyTab?.description || null;
            const artisanImage = storyTab?.image_url || null;
            const artisanQuote = storyTab?.quote || null;

            // Update product with resolved custom tabs & legacy fields
            const { error: finalUpdErr } = await sb
                .from("products")
                .update({
                    custom_tabs: updatedTabs,
                    artisan_headline: artisanHeadline,
                    artisan_description: artisanDescription,
                    artisan_image: artisanImage,
                    artisan_quote: artisanQuote,
                } as any)
                .eq("id", product.id);

            if (finalUpdErr) {
                console.error("Failed to update product with final custom tabs payload:", finalUpdErr);
            }

            for (const v of variants) {
                const { data: iv, error: vErr } = await sb.from("product_variants")
                    .insert({ product_id: product.id, color_name: v.color_name, color_hex: v.color_hex, material_label: v.material_label || null, price: v.price, original_price: v.original_price || null, stock: v.stock, sku: v.sku || null, is_default: v.is_default, sort_order: v.sort_order, place: v.place || null })
                    .select("id").single();
                if (vErr || !iv) throw vErr;

                for (const img of v.images) {
                    let url = img.image_url;
                    if (img.file) {
                        const { large, thumbnail } = await processImageForUpload(img.file);
                        const ext = large.name.split(".").pop();
                        const name = `${product.id}/${iv.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
                        const lastDot = name.lastIndexOf(".");
                        const thumbName = lastDot !== -1 
                            ? name.substring(0, lastDot) + "_thumb" + name.substring(lastDot)
                            : name + "_thumb";

                        const { error: uErr } = await sb.storage.from("product-images").upload(name, large);
                        if (uErr) { console.error(uErr); continue; }

                        // Upload thumbnail in background
                        sb.storage.from("product-images").upload(thumbName, thumbnail).catch((e: any) => {
                            console.error("Failed to upload thumbnail:", e);
                        });

                        url = sb.storage.from("product-images").getPublicUrl(name).data.publicUrl;
                    }
                    if (url) await sb.from("variant_images").insert({ variant_id: iv.id, image_url: url, is_primary: img.is_primary, sort_order: img.sort_order, media_type: img.media_type });
                }
            }

            await saveOptionGroups(product.id);
            router.push("/admin/products");
        } catch (e) { console.error(e); alert("Failed to save"); } finally { setSaving(false); }
    };

    return (
        <div className="w-full max-w-none">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/products" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><ArrowLeft className="h-5 w-5" /></Link>
                <div><h1 className="text-lg font-semibold text-gray-900">New Product</h1><p className="text-sm text-gray-400 mt-0.5">Follow the steps to add a product</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT */}
                <div className="lg:col-span-2">
                    {/* 1 - Details */}
                    <Section title="Product Details" step={1}>
                        <div className="space-y-4">
                            <div><Label tip="The main title customers see.">Product Name</Label><input type="text" value={form.name} onChange={(e) => upd("name", e.target.value)} className={inputCls} placeholder="e.g., Premium Floral Cotton" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label tip="Auto-generated URL path.">Slug</Label><input type="text" value={form.slug} onChange={(e) => upd("slug", e.target.value)} className={`${inputCls} text-gray-400`} /></div>
                                <div><Label tip="Organize into groups like Cotton, Silk.">Category</Label><select value={form.category_id} onChange={(e) => upd("category_id", e.target.value)} className={inputCls}><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            </div>
                            <div><Label tip="Short summary shown near the product title.">Short Description</Label><textarea value={form.description} onChange={(e) => upd("description", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Short summary for quick scanning..." /></div>
                        </div>
                    </Section>

                    {/* 2 - Product Description */}
                    <Section title="Product Description" step={2}>
                        <p className="text-xs text-gray-400 -mt-3 mb-4">Optional HTML/CSS for the Description tab. Fabric/care details show in Specifications.</p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500">Description Mode</span>
                                <button
                                    type="button"
                                    onClick={() => upd("use_custom_description", false)}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${!form.use_custom_description ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500"}`}
                                >
                                    Default
                                </button>
                                <button
                                    type="button"
                                    onClick={() => upd("use_custom_description", true)}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${form.use_custom_description ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500"}`}
                                >
                                    Custom HTML/CSS
                                </button>
                                {!form.use_custom_description && (
                                    <span className="text-xs text-gray-400">Uses Long Description from Content tab.</span>
                                )}
                            </div>
                            {form.use_custom_description && (
                                <>
                                    <div><Label tip="Optional: custom HTML shown in the Description tab.">Description HTML</Label><textarea value={form.description_html} onChange={(e) => upd("description_html", e.target.value)} rows={6} className={`${inputCls} font-mono text-xs`} placeholder="<p>Write rich HTML description here</p>" /></div>
                                    <div><Label tip="Optional: CSS to style the HTML above.">Description CSS</Label><textarea value={form.description_css} onChange={(e) => upd("description_css", e.target.value)} rows={5} className={`${inputCls} font-mono text-xs`} placeholder=".product-desc h2 { margin-top: 16px; }" /></div>
                                </>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Fabric Type</Label><input type="text" value={form.fabric} onChange={(e) => upd("fabric", e.target.value)} className={inputCls} placeholder="100% Cotton" /></div>
                                <div><Label>Care Instructions</Label><input type="text" value={form.care_instructions} onChange={(e) => upd("care_instructions", e.target.value)} className={inputCls} placeholder="Gentle hand wash" /></div>
                            </div>
                        </div>
                    </Section>

                    {/* 3 - Selling */}
                    <Section title="Selling & Pricing" step={3}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label tip="Per Meter = customer enters meters. Per Piece = quantity.">Sell Mode</Label>
                                    <div className="flex gap-2 mt-1">
                                        {(["meter", "quantity"] as const).map((m) => (
                                            <button key={m} type="button" onClick={() => upd("sell_mode", m)}
                                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${form.sell_mode === m ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-400"}`}>
                                                {m === "meter" ? "📏 Per Meter" : "📦 Per Piece"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {form.sell_mode === "meter" && <div><Label>Fabric Width</Label><input type="text" value={form.width} onChange={(e) => upd("width", e.target.value)} className={inputCls} placeholder="44 inches" /></div>}
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <Label tip="How discounts display. Example: '25% off' or '₹100 off'.">Discount Display</Label>
                                <div className="flex gap-2 mt-1">
                                    <button type="button" onClick={() => upd("discount_type", "percent")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${form.discount_type === "percent" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-400"}`}>Show as % off</button>
                                    <button type="button" onClick={() => upd("discount_type", "flat")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${form.discount_type === "flat" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-400"}`}>Show as ₹ off</button>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 4 - Variants */}
                    <Section title="Color Variants" step={4}>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-start gap-2">
                            <CircleHelp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700">Each color has its <strong>own price, stock, and images</strong>. Customer picks a color → sees that color&apos;s images.</p>
                        </div>
                        <div className="space-y-4">
                            {variants.map((v, vi) => (
                                <div key={vi} className="border border-gray-200 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: v.color_hex }} /><span className="text-sm font-semibold text-gray-700">{v.color_name || `Color ${vi + 1}`}</span>{v.is_default && <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-900 text-white rounded">Default</span>}</div>
                                        {variants.length > 1 && <button onClick={() => rmVariant(vi)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div><label className="text-xs font-medium text-gray-500 mb-1 block">Color Name</label><input type="text" value={v.color_name} onChange={(e) => updV(vi, "color_name", e.target.value)} className={inputCls} placeholder="Royal Red" /></div>
                                        <div><label className="text-xs font-medium text-gray-500 mb-1 block">Color</label><div className="flex gap-2"><input type="color" value={v.color_hex} onChange={(e) => updV(vi, "color_hex", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" /><input type="text" value={v.color_hex} onChange={(e) => updV(vi, "color_hex", e.target.value)} className={`${inputCls} font-mono text-gray-400 flex-1`} /></div></div>
                                        <div><label className="text-xs font-medium text-gray-500 mb-1 block">Selling Price ₹</label><input type="number" value={v.price || ""} onChange={(e) => updV(vi, "price", +e.target.value)} className={inputCls} placeholder="299" /></div>
                                        <div><label className="text-xs font-medium text-gray-500 mb-1 block">MRP ₹</label><input type="number" value={v.original_price || ""} onChange={(e) => updV(vi, "original_price", +e.target.value)} className={inputCls} placeholder="399" />{v.original_price > 0 && v.original_price > v.price && <span className="text-[11px] text-green-600 mt-1 block">{getDiscount(v.price, v.original_price)}</span>}</div>
                                        <div><label className="text-xs font-medium text-gray-500 mb-1 block">Stock</label><input type="number" value={v.stock || ""} onChange={(e) => updV(vi, "stock", +e.target.value)} className={inputCls} placeholder="50" /></div>
                                        <div><label className="text-xs font-medium text-gray-500 mb-1 block">SKU</label><input type="text" value={v.sku} onChange={(e) => updV(vi, "sku", e.target.value)} className={`${inputCls} font-mono`} placeholder="PFC-RR" /></div>
                                        <div><label className="text-xs font-medium text-gray-500 mb-1 block">Material Label</label><input type="text" value={v.material_label} onChange={(e) => updV(vi, "material_label", e.target.value)} className={inputCls} placeholder="Premium" /></div>
                                        <div><label className="text-xs font-medium text-gray-500 mb-1 block">Place</label><input type="text" value={v.place || ""} onChange={(e) => updV(vi, "place", e.target.value)} className={inputCls} placeholder="e.g. Shelf A-1" /></div>
                                        <div className="flex items-end"><label className="flex items-center gap-2 py-2.5 cursor-pointer"><input type="radio" name="default_variant" checked={v.is_default} onChange={() => updV(vi, "is_default", true)} className="w-4 h-4" /><span className="text-sm font-medium text-gray-500">Default</span></label></div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-2 block">Images for {v.color_name || "this color"}</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {v.images.map((img, ii) => (
                                                <div key={ii} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={img.preview || img.image_url} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                        <button onClick={() => setPrimary(vi, ii)} className={`p-1 rounded ${img.is_primary ? "bg-amber-500 text-white" : "bg-white/80 text-gray-600"}`}><Star className="h-3 w-3" /></button>
                                                        <button onClick={() => rmImg(vi, ii)} className="p-1 rounded bg-white/80 text-red-500"><X className="h-3 w-3" /></button>
                                                    </div>
                                                    {img.is_primary && <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-[8px] text-center text-white font-bold py-0.5">MAIN</span>}
                                                </div>
                                            ))}
                                            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-gray-400 cursor-pointer transition-colors">
                                                <Upload className="h-5 w-5" /><span className="text-[9px] font-medium mt-1">Upload</span>
                                                <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => addImgs(vi, e.target.files)} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addVariant} className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"><Plus className="h-4 w-4" /> Add another color</button>
                    </Section>

                    {/* 5 - Options */}
                    <Section title="Product Options" step={5}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-gray-400">Add option groups like Size, Pack, Custom Text.</p>
                            <button onClick={addOptionGroup} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <Plus className="h-3.5 w-3.5" /> Add Option Group
                            </button>
                        </div>

                        {optionGroups.length === 0 ? (
                            <p className="text-sm text-gray-400">No option groups yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {optionGroups.map((group, gi) => (
                                    <div key={gi} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <input
                                                type="text"
                                                value={group.name}
                                                onChange={(e) => updateOptionGroup(gi, "name", e.target.value)}
                                                placeholder="Option group name"
                                                className={`${inputCls} max-w-xs`}
                                            />
                                            <button onClick={() => removeOptionGroup(gi)} className="text-gray-300 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Input Type</label>
                                                <select value={group.input_type} onChange={(e) => updateOptionGroup(gi, "input_type", e.target.value as OptionInputType)} className={inputCls}>
                                                    <option value="radio">Radio</option>
                                                    <option value="multi">Multi-select</option>
                                                    <option value="dropdown">Dropdown</option>
                                                    <option value="input">Input field</option>
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                                    <input type="checkbox" checked={group.required} onChange={(e) => updateOptionGroup(gi, "required", e.target.checked)} className="w-4 h-4" />
                                                    Required
                                                </label>
                                            </div>
                                            {group.input_type === "input" && (
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Input Data Type</label>
                                                    <select value={group.input_data_type} onChange={(e) => updateOptionGroup(gi, "input_data_type", e.target.value as OptionInputDataType)} className={inputCls}>
                                                        <option value="text">Text</option>
                                                        <option value="number">Number</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Placeholder</label>
                                                <input type="text" value={group.placeholder || ""} onChange={(e) => updateOptionGroup(gi, "placeholder", e.target.value)} className={inputCls} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Help Text</label>
                                                <input type="text" value={group.help_text || ""} onChange={(e) => updateOptionGroup(gi, "help_text", e.target.value)} className={inputCls} />
                                            </div>
                                        </div>

                                        {group.input_type === "multi" && (
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Min Selections</label>
                                                    <input type="number" value={group.min_selections ?? ""} onChange={(e) => updateOptionGroup(gi, "min_selections", e.target.value ? Number(e.target.value) : null)} className={inputCls} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Max Selections</label>
                                                    <input type="number" value={group.max_selections ?? ""} onChange={(e) => updateOptionGroup(gi, "max_selections", e.target.value ? Number(e.target.value) : null)} className={inputCls} />
                                                </div>
                                            </div>
                                        )}

                                        {group.input_type === "input" && (
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Min Length / Value</label>
                                                    <input type="number" value={group.input_data_type === "text" ? (group.input_min_length ?? "") : (group.input_min_value ?? "")} onChange={(e) => updateOptionGroup(gi, group.input_data_type === "text" ? "input_min_length" : "input_min_value", e.target.value ? Number(e.target.value) : null)} className={inputCls} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Max Length / Value</label>
                                                    <input type="number" value={group.input_data_type === "text" ? (group.input_max_length ?? "") : (group.input_max_value ?? "")} onChange={(e) => updateOptionGroup(gi, group.input_data_type === "text" ? "input_max_length" : "input_max_value", e.target.value ? Number(e.target.value) : null)} className={inputCls} />
                                                </div>
                                            </div>
                                        )}

                                        {group.input_type !== "input" && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-medium text-gray-500">Option Values</label>
                                                    <button onClick={() => addOptionValue(gi)} className="text-xs text-gray-600 hover:text-gray-900">+ Add Value</button>
                                                </div>
                                                <div className="space-y-2">
                                                    {group.values.map((val, vi) => (
                                                        <div key={vi} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_30px] gap-2 items-center">
                                                            <input type="text" value={val.label} onChange={(e) => updateOptionValue(gi, vi, "label", e.target.value)} placeholder="Label" className={inputCls} />
                                                            <input type="text" value={val.value} onChange={(e) => updateOptionValue(gi, vi, "value", e.target.value)} placeholder="Value" className={inputCls} />
                                                            <label className="flex items-center gap-2 text-xs text-gray-500">
                                                                <input type="checkbox" checked={val.is_default} onChange={(e) => updateOptionValue(gi, vi, "is_default", e.target.checked)} className="w-4 h-4" /> Default
                                                            </label>
                                                            <button onClick={() => removeOptionValue(gi, vi)} className="text-gray-300 hover:text-red-500">
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* 6 - SEO */}
                    <Section title="SEO" step={6}>
                        <div className="space-y-4">
                            <div><Label tip="Browser title and Google result title (50-60 chars).">Meta Title</Label><input type="text" value={form.meta_title} onChange={(e) => upd("meta_title", e.target.value)} className={inputCls} /></div>
                            <div><Label tip="Google snippet text (140-160 chars).">Meta Description</Label><textarea value={form.meta_description} onChange={(e) => upd("meta_description", e.target.value)} rows={3} className={`${inputCls} resize-none`} /></div>
                            <div><Label tip="Preferred URL for this product to avoid duplicates.">Canonical URL</Label><input type="text" value={form.canonical_url} onChange={(e) => upd("canonical_url", e.target.value)} className={inputCls} placeholder="https://example.com/shop/product" /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label tip="Title shown on WhatsApp/Facebook shares.">OG Title</Label><input type="text" value={form.og_title} onChange={(e) => upd("og_title", e.target.value)} className={inputCls} /></div>
                                <div><Label tip="Description shown on social shares.">OG Description</Label><input type="text" value={form.og_description} onChange={(e) => upd("og_description", e.target.value)} className={inputCls} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label tip="Image URL for social share card.">OG Image URL</Label><input type="text" value={form.og_image_url} onChange={(e) => upd("og_image_url", e.target.value)} className={inputCls} /></div>
                                <div><Label tip="Use large image for better preview.">Twitter Card</Label>
                                    <select value={form.twitter_card_type} onChange={(e) => upd("twitter_card_type", e.target.value)} className={inputCls}>
                                        <option value="summary_large_image">Summary Large Image</option>
                                        <option value="summary">Summary</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 7 - Content */}
                    <Section title="Product Content" step={7}>
                        <div className="space-y-5">
                            <div><Label tip="Detailed description shown in the Description tab.">Long Description</Label><textarea value={form.long_description} onChange={(e) => upd("long_description", e.target.value)} rows={5} className={`${inputCls} resize-none`} /></div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label>Highlights</Label>
                                    <button onClick={addHighlight} className="text-xs text-gray-600 hover:text-gray-900">+ Add Highlight</button>
                                </div>
                                {highlights.length === 0 ? (
                                    <p className="text-sm text-gray-400">No highlights added.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {highlights.map((h, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input type="text" value={h} onChange={(e) => updateHighlight(i, e.target.value)} className={inputCls} />
                                                <button onClick={() => removeHighlight(i)} className="text-gray-300 hover:text-red-500"><X className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label>FAQs</Label>
                                    <button onClick={addFaq} className="text-xs text-gray-600 hover:text-gray-900">+ Add FAQ</button>
                                </div>
                                {faqs.length === 0 ? (
                                    <p className="text-sm text-gray-400">No FAQs added.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {faqs.map((f, i) => (
                                            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                                                <input type="text" value={f.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Question" className={inputCls} />
                                                <textarea value={f.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Answer" rows={3} className={`${inputCls} resize-none`} />
                                                <button onClick={() => removeFaq(i)} className="text-xs text-red-500">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <Label tip="Products shown in the 'You May Also Like' section on the product page.">Recommended Products</Label>
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Search products..."
                                        className={`${inputCls} mb-2`}
                                    />
                                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white">
                                        {(productSearch ? allProducts.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase())) : allProducts).map((p) => (
                                            <label key={p.id} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.related_product_ids.includes(p.id)}
                                                    onChange={() => toggleRelatedProduct(p.id)}
                                                    className="h-4 w-4"
                                                />
                                                <span className="truncate">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Selected: {form.related_product_ids.length}</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 8 - Product Tabs */}
                    <Section title="Product Tabs" step={8}>
                        <div className="space-y-6">
                            <p className="text-xs text-gray-500">Configure content tabs for this product. You can add, remove, and reorder tabs.</p>

                            <div className="space-y-6">
                                {(form.custom_tabs || []).map((tab: any, index: number) => (
                                    <div key={tab.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4 relative">
                                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold text-gray-600">{index + 1}</span>
                                                <span className="text-sm font-bold text-gray-800">{tab.label || "Unnamed Tab"}</span>
                                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-200/80 text-gray-600 tracking-wider">{tab.type}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() => moveTab(index, "up")}
                                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Move Up"
                                                >
                                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={index === (form.custom_tabs || []).length - 1}
                                                    onClick={() => moveTab(index, "down")}
                                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Move Down"
                                                >
                                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteTab(tab.id)}
                                                    className="p-1 hover:bg-red-50 text-red-500 rounded ml-2"
                                                    title="Delete Tab"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tab Label / Display Name</label>
                                                <input
                                                    type="text"
                                                    value={tab.label || ""}
                                                    onChange={(e) => updateTab(tab.id, { label: e.target.value })}
                                                    className={inputCls}
                                                    placeholder="e.g., Artisan Story, Materials"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tab Type</label>
                                                <select
                                                    value={tab.type}
                                                    onChange={(e) => updateTab(tab.id, { type: e.target.value })}
                                                    className={inputCls}
                                                >
                                                    <option value="custom">Custom Content</option>
                                                    <option value="materials">Materials Grid (specs & FAQs)</option>
                                                    <option value="dimensions">Dimensions / Quantity Guide</option>
                                                </select>
                                            </div>
                                        </div>

                                        {tab.type === "custom" && (
                                            <div className="space-y-6 pt-4 border-t border-dashed border-gray-200 animate-fade-in">
                                                {/* Layout Template Style Selector */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-2">Layout Template Style</label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {[
                                                            { id: "split", name: "Split Content", desc: "Text left, image right" },
                                                            { id: "hero", name: "Centered Hero", desc: "Large hero banner centered" },
                                                            { id: "accordion", name: "Accordion list", desc: "FAQ collapsible items" },
                                                            { id: "grid", name: "Grid Cards", desc: "Grid of featured items" },
                                                        ].map((opt) => {
                                                            const isActive = (tab.layout || "split") === opt.id;
                                                            return (
                                                                <button
                                                                    key={opt.id}
                                                                    type="button"
                                                                    onClick={() => updateTab(tab.id, { layout: opt.id })}
                                                                    className={`group flex flex-col p-3 rounded-xl border-2 text-left transition-all ${
                                                                        isActive
                                                                            ? "border-gray-950 bg-gray-950 text-white shadow-md scale-[1.01]"
                                                                            : "border-gray-205 hover:border-gray-300 bg-white text-gray-700"
                                                                    }`}
                                                                >
                                                                    {/* Mini layout wireframe mock */}
                                                                    {opt.id === "split" && (
                                                                        <div className={`w-full h-11 border rounded flex items-center p-1.5 gap-1.5 mb-2.5 transition-colors ${isActive ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                                                                            <div className="flex-1 space-y-1">
                                                                                <div className={`w-4/5 h-1 rounded ${isActive ? "bg-gray-600" : "bg-gray-305"}`}></div>
                                                                                <div className={`w-full h-1 rounded ${isActive ? "bg-gray-700" : "bg-gray-200"}`}></div>
                                                                                <div className={`w-2/3 h-1 rounded ${isActive ? "bg-gray-700" : "bg-gray-200"}`}></div>
                                                                            </div>
                                                                            <div className={`w-9 h-full rounded flex-shrink-0 ${isActive ? "bg-gray-700" : "bg-gray-350"}`}></div>
                                                                        </div>
                                                                    )}
                                                                    {opt.id === "hero" && (
                                                                        <div className={`w-full h-11 border rounded flex flex-col items-center justify-center p-1 gap-1 mb-2.5 transition-colors ${isActive ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                                                                            <div className={`w-1/2 h-1 rounded ${isActive ? "bg-gray-600" : "bg-gray-305"}`}></div>
                                                                            <div className={`w-full h-5 rounded mt-0.5 ${isActive ? "bg-gray-750" : "bg-gray-305"}`}></div>
                                                                        </div>
                                                                    )}
                                                                    {opt.id === "accordion" && (
                                                                        <div className={`w-full h-11 border rounded flex flex-col p-1.5 gap-1 justify-center mb-2.5 transition-colors ${isActive ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                                                                            {[1, 2, 3].map(i => (
                                                                                <div key={i} className={`flex justify-between items-center border-b pb-0.5 ${isActive ? "border-gray-800" : "border-gray-100"}`}>
                                                                                    <div className={`w-3/5 h-1 rounded ${isActive ? "bg-gray-700" : "bg-gray-305"}`}></div>
                                                                                    <div className={`w-1 h-1 rounded-full ${isActive ? "bg-gray-500" : "bg-gray-400"}`}></div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {opt.id === "grid" && (
                                                                        <div className={`w-full h-11 border rounded grid grid-cols-3 p-1 gap-1 mb-2.5 transition-colors ${isActive ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                                                                            {[1, 2, 3].map(i => (
                                                                                <div key={i} className={`rounded p-0.5 flex flex-col items-center justify-center gap-0.5 ${isActive ? "bg-gray-800" : "bg-gray-200/60"}`}>
                                                                                    <div className={`w-2 h-2 rounded-full ${isActive ? "bg-gray-600" : "bg-gray-305"}`}></div>
                                                                                    <div className={`w-4/5 h-0.5 rounded ${isActive ? "bg-gray-500" : "bg-gray-400"}`}></div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[11px] font-bold leading-tight">{opt.name}</span>
                                                                    <span className={`text-[9px] mt-0.5 leading-tight ${isActive ? "text-gray-400" : "text-gray-500"}`}>{opt.desc}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Live Storefront Mock Preview */}
                                                <div className="p-4 bg-[#fbfaf8] border border-gray-200 rounded-xl space-y-2">
                                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storefront Visual Preview ({(tab.layout || "split").toUpperCase()})</span>
                                                        <span className="text-[9px] bg-[#e8e4dc] text-gray-600 px-1.5 py-0.5 rounded font-mono">Bohemian Theme Styling</span>
                                                    </div>
                                                    
                                                    {/* Browser mockup container */}
                                                    <div className="bg-white border border-[#e8e4dc] rounded-lg shadow-sm font-sans text-left max-w-2xl mx-auto overflow-hidden animate-fade-in">
                                                        {/* Browser header bar */}
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                                                            <div className="flex gap-1.5 flex-shrink-0">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                                                            </div>
                                                            <div className="flex-1 max-w-xs sm:max-w-md mx-auto h-5 bg-white border border-gray-200 rounded text-[9px] text-gray-400 flex items-center justify-center font-mono select-none px-2 truncate">
                                                                shreeharicutpiece.com/products/{form.slug || "product-slug"}
                                                            </div>
                                                            <div className="w-8 flex-shrink-0"></div>
                                                        </div>

                                                        {/* Preview content viewport */}
                                                        <div className="p-6">
                                                            {(tab.layout || "split") === "split" && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                                                    <div className="space-y-2">
                                                                        <h5 className="font-serif italic text-[#1c1c19] text-base leading-tight font-semibold">{tab.headline || "Headline Placeholder"}</h5>
                                                                        <p className="text-[11px] text-[#56423d] line-clamp-3 leading-relaxed">{tab.description || "Description placeholder body text..."}</p>
                                                                        {tab.link_label && <span className="text-[10px] font-bold text-[#9f3f29] inline-flex items-center gap-1">{tab.link_label} →</span>}
                                                                    </div>
                                                                    <div className="relative aspect-video rounded bg-[#f6f3ee] border border-[#e8e4dc] flex items-center justify-center overflow-hidden">
                                                                        {(tabPreviews[tab.id] || tab.image_url) ? (
                                                                            <img src={tabPreviews[tab.id] || tab.image_url} className="w-full h-full object-cover" alt="preview" />
                                                                        ) : (
                                                                            <span className="text-[10px] text-gray-400">Image Preview</span>
                                                                        )}
                                                                        {tab.quote && (
                                                                            <div className="absolute bottom-2 right-2 max-w-[100px] bg-[#dbe4c0] p-1 text-[8px] italic text-[#5a6245] rounded shadow-sm">
                                                                                &quot;{tab.quote}&quot;
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {(tab.layout || "split") === "hero" && (
                                                                <div className="space-y-4 text-center">
                                                                    <div className="max-w-md mx-auto space-y-2">
                                                                        <h5 className="font-serif italic text-[#1c1c19] text-base leading-tight font-semibold">{tab.headline || "Headline Placeholder"}</h5>
                                                                        <p className="text-[11px] text-[#56423d] line-clamp-2 leading-relaxed">{tab.description || "Description placeholder body text..."}</p>
                                                                        {tab.link_label && <span className="text-[10px] font-bold text-[#9f3f29] inline-flex items-center gap-1">{tab.link_label} →</span>}
                                                                    </div>
                                                                    <div className="relative aspect-[21/9] w-full rounded bg-[#f6f3ee] border border-[#e8e4dc] flex items-center justify-center overflow-hidden">
                                                                        {(tabPreviews[tab.id] || tab.image_url) ? (
                                                                            <img src={tabPreviews[tab.id] || tab.image_url} className="w-full h-full object-cover" alt="preview" />
                                                                        ) : (
                                                                            <span className="text-[10px] text-gray-400">Hero Banner Image Preview</span>
                                                                        )}
                                                                    </div>
                                                                    {tab.quote && (
                                                                        <div className="max-w-xs mx-auto bg-[#dbe4c0] p-2 text-[9px] italic text-[#5a6245] rounded">
                                                                            &quot;{tab.quote}&quot;
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {(tab.layout || "split") === "accordion" && (
                                                                <div className="space-y-3">
                                                                    {tab.headline && <h5 className="font-serif italic text-center text-[#1c1c19] text-base font-semibold">{tab.headline}</h5>}
                                                                    {tab.description && <p className="text-[10px] text-center text-[#56423d] max-w-sm mx-auto leading-normal">{tab.description}</p>}
                                                                    <div className="divide-y divide-[#e8e4dc] border-t border-b border-[#e8e4dc] mt-2">
                                                                        {((tab.items && tab.items.length > 0) ? tab.items : [
                                                                            { title: "Item 1 (Example)", content: "Content details for item 1..." },
                                                                            { title: "Item 2 (Example)", content: "Content details for item 2..." }
                                                                        ]).map((item: any, idx: number) => (
                                                                            <div key={idx} className="py-2 flex justify-between items-center text-xs">
                                                                                <span className="font-medium text-[#1c1c19]">{item.title || `Item ${idx + 1} title`}</span>
                                                                                <span className="text-[#9f3f29] font-bold">+</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {(tab.layout || "split") === "grid" && (
                                                                <div className="space-y-4">
                                                                    {tab.headline && <h5 className="font-serif italic text-center text-[#1c1c19] text-base font-semibold">{tab.headline}</h5>}
                                                                    {tab.description && <p className="text-[10px] text-center text-[#56423d] max-w-sm mx-auto leading-normal">{tab.description}</p>}
                                                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                                                        {((tab.items && tab.items.length > 0) ? tab.items : [
                                                                            { title: "Eco Woven", content: "Organic practices..." },
                                                                            { title: "Handloomed", content: "Made by hand..." },
                                                                            { title: "Non-Toxic", content: "Natural dyes..." }
                                                                        ]).map((item: any, idx: number) => {
                                                                            const subPreviewKey = `${tab.id}_${item.id || idx}`;
                                                                            const hasImg = !!(tabPreviews[subPreviewKey] || item.image_url);
                                                                            return (
                                                                                <div key={idx} className="flex flex-col items-center text-center p-2 bg-[#f6f3ee] border border-[#e8e4dc] rounded space-y-1">
                                                                                    <div className="w-8 h-8 rounded-full bg-[#e8e4dc] flex items-center justify-center text-[10px] overflow-hidden">
                                                                                        {hasImg ? (
                                                                                            <img src={tabPreviews[subPreviewKey] || item.image_url} className="w-full h-full object-cover" />
                                                                                        ) : (
                                                                                            "✨"
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="font-bold text-[9px] text-[#1c1c19] truncate w-full">{item.title || `Item ${idx + 1}`}</span>
                                                                                    <p className="text-[8px] text-[#56423d] line-clamp-2 leading-tight">{item.content || "Description..."}</p>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                     </div>
                                                </div>

                                                {/* Headline Input (Applies to all layouts) */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Headline (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={tab.headline || ""}
                                                        onChange={(e) => updateTab(tab.id, { headline: e.target.value })}
                                                        className={inputCls}
                                                        placeholder="e.g., A Loom with a Legacy"
                                                    />
                                                </div>

                                                {/* Text / Description Input (Applies to all layouts) */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description (Optional)</label>
                                                    <textarea
                                                        value={tab.description || ""}
                                                        onChange={(e) => updateTab(tab.id, { description: e.target.value })}
                                                        rows={3}
                                                        className={`${inputCls} resize-none`}
                                                        placeholder="Enter the main body text for this tab..."
                                                    />
                                                </div>

                                                {/* Edit Fields for Split / Hero Layouts */}
                                                {((tab.layout || "split") === "split" || tab.layout === "hero") && (
                                                    <div className="space-y-4 pt-2 border-t border-dashed border-gray-100 animate-fade-in">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Quote / Testimonial (Optional)</label>
                                                                <input
                                                                    type="text"
                                                                    value={tab.quote || ""}
                                                                    onChange={(e) => updateTab(tab.id, { quote: e.target.value })}
                                                                    className={inputCls}
                                                                    placeholder="e.g., This fabric feels like a warm hug..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Link Label (Optional - hide if empty)</label>
                                                                <input
                                                                    type="text"
                                                                    value={tab.link_label || ""}
                                                                    onChange={(e) => updateTab(tab.id, { link_label: e.target.value })}
                                                                    className={inputCls}
                                                                    placeholder="e.g., Meet the weavers"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Link URL (Optional - defaults to WhatsApp)</label>
                                                                <input
                                                                    type="text"
                                                                    value={tab.link_url || ""}
                                                                    onChange={(e) => updateTab(tab.id, { link_url: e.target.value })}
                                                                    className={inputCls}
                                                                    placeholder="https://..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tab Image (Optional)</label>
                                                                <div className="flex gap-4 items-center">
                                                                    {(tabPreviews[tab.id] || tab.image_url) ? (
                                                                        <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                                                            <img src={tabPreviews[tab.id] || tab.image_url} alt="Tab Preview" className="w-full h-full object-cover" />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setTabFiles(prev => { const c = { ...prev }; delete c[tab.id]; return c; });
                                                                                    setTabPreviews(prev => { const c = { ...prev }; delete c[tab.id]; return c; });
                                                                                    updateTab(tab.id, { image_url: "" });
                                                                                }}
                                                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded text-white shadow"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 text-xs">No image</div>
                                                                    )}
                                                                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-4 hover:border-gray-400 cursor-pointer transition-colors">
                                                                        <Upload className="h-5 w-5 text-gray-400" />
                                                                        <span className="text-xs font-semibold text-gray-500 mt-1">Upload image file</span>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    setTabFiles(prev => ({ ...prev, [tab.id]: file }));
                                                                                    setTabPreviews(prev => ({ ...prev, [tab.id]: URL.createObjectURL(file) }));
                                                                                }
                                                                            }}
                                                                        />
                                                                    </label>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Or paste an image URL:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={tab.image_url || ""}
                                                                        onChange={(e) => {
                                                                            setTabFiles(prev => { const c = { ...prev }; delete c[tab.id]; return c; });
                                                                            setTabPreviews(prev => { const c = { ...prev }; delete c[tab.id]; return c; });
                                                                            updateTab(tab.id, { image_url: e.target.value });
                                                                        }}
                                                                        className={`${inputCls} mt-1`}
                                                                        placeholder="https://..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Edit Fields for Accordion / Grid Layouts */}
                                                {(tab.layout === "accordion" || tab.layout === "grid") && (
                                                    <div className="space-y-4 pt-4 border-t border-dashed border-gray-100 animate-fade-in">
                                                        <div className="flex justify-between items-center">
                                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Sub-items List</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newItem = {
                                                                        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                                        title: "",
                                                                        content: "",
                                                                        image_url: ""
                                                                    };
                                                                    const items = [...(tab.items || []), newItem];
                                                                    updateTab(tab.id, { items });
                                                                }}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                                Add Item
                                                            </button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {(tab.items || []).map((item: any, subIdx: number) => {
                                                                const subPreviewKey = `${tab.id}_${item.id || subIdx}`;
                                                                return (
                                                                    <div key={item.id || subIdx} className="p-4 bg-white border border-gray-200 rounded-lg space-y-3 shadow-sm relative">
                                                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                                                            <span className="text-xs font-bold text-gray-800">Item #{subIdx + 1}</span>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={subIdx === 0}
                                                                                    onClick={() => {
                                                                                        const items = [...(tab.items || [])];
                                                                                        const temp = items[subIdx];
                                                                                        items[subIdx] = items[subIdx - 1];
                                                                                        items[subIdx - 1] = temp;
                                                                                        updateTab(tab.id, { items });
                                                                                    }}
                                                                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                                    title="Move Up"
                                                                                >
                                                                                    <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={subIdx === (tab.items || []).length - 1}
                                                                                    onClick={() => {
                                                                                        const items = [...(tab.items || [])];
                                                                                        const temp = items[subIdx];
                                                                                        items[subIdx] = items[subIdx + 1];
                                                                                        items[subIdx + 1] = temp;
                                                                                        updateTab(tab.id, { items });
                                                                                    }}
                                                                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                                    title="Move Down"
                                                                                >
                                                                                    <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const items = (tab.items || []).filter((_: any, j: number) => j !== subIdx);
                                                                                        updateTab(tab.id, { items });
                                                                                        setTabFiles(prev => { const c = { ...prev }; delete c[subPreviewKey]; return c; });
                                                                                        setTabPreviews(prev => { const c = { ...prev }; delete c[subPreviewKey]; return c; });
                                                                                    }}
                                                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                                                    title="Remove Item"
                                                                                >
                                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            <div>
                                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">Item Title / Question</label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.title || ""}
                                                                                    onChange={(e) => {
                                                                                        const items = (tab.items || []).map((it: any, j: number) => j === subIdx ? { ...it, title: e.target.value } : it);
                                                                                        updateTab(tab.id, { items });
                                                                                    }}
                                                                                    className={inputCls}
                                                                                    placeholder={tab.layout === "accordion" ? "e.g., How do I clean this fabric?" : "e.g., Organic Cotton"}
                                                                                />
                                                                            </div>

                                                                            {tab.layout === "grid" && (
                                                                                <div>
                                                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Item Image / Icon (Optional)</label>
                                                                                    <div className="flex gap-2 items-center">
                                                                                        {(tabPreviews[subPreviewKey] || item.image_url) ? (
                                                                                            <div className="relative w-12 h-10 rounded border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0">
                                                                                                <img src={tabPreviews[subPreviewKey] || item.image_url} alt="Item Preview" className="w-full h-full object-cover" />
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => {
                                                                                                        setTabFiles(prev => { const c = { ...prev }; delete c[subPreviewKey]; return c; });
                                                                                                        setTabPreviews(prev => { const c = { ...prev }; delete c[subPreviewKey]; return c; });
                                                                                                        const items = (tab.items || []).map((it: any, j: number) => j === subIdx ? { ...it, image_url: "" } : it);
                                                                                                        updateTab(tab.id, { items });
                                                                                                    }}
                                                                                                    className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 rounded text-white shadow"
                                                                                                >
                                                                                                    <X className="h-2 w-2" />
                                                                                                </button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="w-12 h-10 rounded border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 text-[8px]">No Image</div>
                                                                                        )}
                                                                                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded py-1.5 hover:border-gray-400 cursor-pointer transition-colors">
                                                                                            <Upload className="h-3 w-3 text-gray-400" />
                                                                                            <span className="text-[9px] font-semibold text-gray-500">Upload icon</span>
                                                                                            <input
                                                                                                type="file"
                                                                                                accept="image/*"
                                                                                                className="hidden"
                                                                                                onChange={(e) => {
                                                                                                    const file = e.target.files?.[0];
                                                                                                    if (file) {
                                                                                                        setTabFiles(prev => ({ ...prev, [subPreviewKey]: file }));
                                                                                                        setTabPreviews(prev => ({ ...prev, [subPreviewKey]: URL.createObjectURL(file) }));
                                                                                                    }
                                                                                                }}
                                                                                            />
                                                                                        </label>
                                                                                    </div>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={item.image_url || ""}
                                                                                        onChange={(e) => {
                                                                                            setTabFiles(prev => { const c = { ...prev }; delete c[subPreviewKey]; return c; });
                                                                                            setTabPreviews(prev => { const c = { ...prev }; delete c[subPreviewKey]; return c; });
                                                                                            const items = (tab.items || []).map((it: any, j: number) => j === subIdx ? { ...it, image_url: e.target.value } : it);
                                                                                            updateTab(tab.id, { items });
                                                                                        }}
                                                                                        className={`${inputCls} py-1 px-2 text-[11px] mt-1`}
                                                                                        placeholder="Or paste image URL"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Item Description / Answer</label>
                                                                            <textarea
                                                                                value={item.content || ""}
                                                                                onChange={(e) => {
                                                                                    const items = (tab.items || []).map((it: any, j: number) => j === subIdx ? { ...it, content: e.target.value } : it);
                                                                                    updateTab(tab.id, { items });
                                                                                }}
                                                                                rows={2}
                                                                                className={`${inputCls} resize-none`}
                                                                                placeholder="Enter content body text..."
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}

                                                            {(tab.items || []).length === 0 && (
                                                                <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                                                                    No sub-items added. Click &quot;Add Item&quot; to add some.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                                              {tab.type === "materials" && (
                                            <div className="space-y-6 pt-4 border-t border-dashed border-gray-200 animate-fade-in">
                                                {/* Specifications Grid Editor */}
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Specifications Grid</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const specs = [...(tab.specs || []), { label: "", value: "" }];
                                                                updateTab(tab.id, { specs });
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add Specification
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {(tab.specs || []).map((spec: any, specIdx: number) => (
                                                            <div key={specIdx} className="p-3 bg-white border border-gray-250 rounded-lg space-y-2 relative shadow-sm">
                                                                <div className="flex justify-between items-center border-b border-gray-50 pb-1.5 mb-1.5">
                                                                    <span className="text-[10px] font-bold text-gray-400">Spec #{specIdx + 1}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            type="button"
                                                                            disabled={specIdx === 0}
                                                                            onClick={() => {
                                                                                const specs = [...(tab.specs || [])];
                                                                                const temp = specs[specIdx];
                                                                                specs[specIdx] = specs[specIdx - 1];
                                                                                specs[specIdx - 1] = temp;
                                                                                updateTab(tab.id, { specs });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            disabled={specIdx === (tab.specs || []).length - 1}
                                                                            onClick={() => {
                                                                                const specs = [...(tab.specs || [])];
                                                                                const temp = specs[specIdx];
                                                                                specs[specIdx] = specs[specIdx + 1];
                                                                                specs[specIdx + 1] = temp;
                                                                                updateTab(tab.id, { specs });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const specs = (tab.specs || []).filter((_: any, idx: number) => idx !== specIdx);
                                                                                updateTab(tab.id, { specs });
                                                                            }}
                                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-gray-505 mb-0.5">Label</label>
                                                                        <input
                                                                            type="text"
                                                                            value={spec.label || ""}
                                                                            onChange={(e) => {
                                                                                const specs = (tab.specs || []).map((s: any, idx: number) => idx === specIdx ? { ...s, label: e.target.value } : s);
                                                                                updateTab(tab.id, { specs });
                                                                            }}
                                                                            className={inputCls}
                                                                            placeholder="e.g., GSM"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-gray-505 mb-0.5">Value</label>
                                                                        <input
                                                                            type="text"
                                                                            value={spec.value || ""}
                                                                            onChange={(e) => {
                                                                                const specs = (tab.specs || []).map((s: any, idx: number) => idx === specIdx ? { ...s, value: e.target.value } : s);
                                                                                updateTab(tab.id, { specs });
                                                                            }}
                                                                            className={inputCls}
                                                                            placeholder="e.g., 160 GSM"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {(tab.specs || []).length === 0 && (
                                                        <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                                                            No specifications. Click &quot;Add Specification&quot; to build the grid.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* FAQs Editor */}
                                                <div className="space-y-4 pt-4 border-t border-gray-150">
                                                    <div className="flex justify-between items-center">
                                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Tab FAQs</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const faqsList = [...(tab.faqs || []), { question: "", answer: "" }];
                                                                updateTab(tab.id, { faqs: faqsList });
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add FAQ
                                                        </button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {(tab.faqs || []).map((faq: any, faqIdx: number) => (
                                                            <div key={faqIdx} className="p-4 bg-white border border-gray-250 rounded-lg space-y-3 shadow-sm relative">
                                                                <div className="flex justify-between items-center border-b border-gray-50 pb-1.5 mb-1.5">
                                                                    <span className="text-[10px] font-bold text-gray-400">FAQ #{faqIdx + 1}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            type="button"
                                                                            disabled={faqIdx === 0}
                                                                            onClick={() => {
                                                                                const faqsList = [...(tab.faqs || [])];
                                                                                const temp = faqsList[faqIdx];
                                                                                faqsList[faqIdx] = faqsList[faqIdx - 1];
                                                                                faqsList[faqIdx - 1] = temp;
                                                                                updateTab(tab.id, { faqs: faqsList });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            disabled={faqIdx === (tab.faqs || []).length - 1}
                                                                            onClick={() => {
                                                                                const faqsList = [...(tab.faqs || [])];
                                                                                const temp = faqsList[faqIdx];
                                                                                faqsList[faqIdx] = faqsList[faqIdx + 1];
                                                                                faqsList[faqIdx + 1] = temp;
                                                                                updateTab(tab.id, { faqs: faqsList });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const faqsList = (tab.faqs || []).filter((_: any, idx: number) => idx !== faqIdx);
                                                                                updateTab(tab.id, { faqs: faqsList });
                                                                            }}
                                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Question</label>
                                                                        <input
                                                                            type="text"
                                                                            value={faq.question || faq.q || ""}
                                                                            onChange={(e) => {
                                                                                const faqsList = (tab.faqs || []).map((f: any, idx: number) => idx === faqIdx ? { ...f, question: e.target.value } : f);
                                                                                updateTab(tab.id, { faqs: faqsList });
                                                                            }}
                                                                            className={inputCls}
                                                                            placeholder="e.g., Is this fabric pre-shrunk?"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Answer</label>
                                                                        <textarea
                                                                            value={faq.answer || faq.a || ""}
                                                                            onChange={(e) => {
                                                                                const faqsList = (tab.faqs || []).map((f: any, idx: number) => idx === faqIdx ? { ...f, answer: e.target.value } : f);
                                                                                updateTab(tab.id, { faqs: faqsList });
                                                                            }}
                                                                            rows={2}
                                                                            className={`${inputCls} resize-none`}
                                                                            placeholder="Enter the FAQ answer..."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {(tab.faqs || []).length === 0 && (
                                                        <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                                                            No FAQs. Click &quot;Add FAQ&quot; to build the FAQ list.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Visual Preview */}
                                                <div className="p-4 bg-[#fbfaf8] border border-gray-200 rounded-xl space-y-2">
                                                    <div className="flex justify-between items-center border-b border-gray-150 pb-2 mb-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storefront Visual Preview (MATERIALS)</span>
                                                        <span className="text-[9px] bg-[#e8e4dc] text-gray-600 px-1.5 py-0.5 rounded font-mono">Bohemian Theme Styling</span>
                                                    </div>

                                                    <div className="bg-white border border-[#e8e4dc] rounded-lg shadow-sm font-sans text-left max-w-2xl mx-auto overflow-hidden">
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-150">
                                                            <div className="flex gap-1.5 flex-shrink-0">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                                                            </div>
                                                            <div className="flex-1 max-w-xs sm:max-w-md mx-auto h-5 bg-white border border-gray-200 rounded text-[9px] text-gray-400 flex items-center justify-center font-mono select-none px-2 truncate">
                                                                shreeharicutpiece.com/products/{form.slug || "product-slug"}
                                                            </div>
                                                            <div className="w-8 flex-shrink-0"></div>
                                                        </div>

                                                        <div className="p-6 text-left">
                                                            <div className="space-y-6">
                                                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                                                    {(tab.specs || []).map((spec: any, idx: number) => (
                                                                        <div key={idx} className="rounded bg-[#f6f3ee] p-3 text-xs">
                                                                            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#7a6f68]">{spec.label}</p>
                                                                            <p className="mt-1 font-medium text-[#1c1c19]">{spec.value}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {(tab.faqs || []).length > 0 && (
                                                                    <div className="rounded bg-[#f6f3ee] p-4 text-xs">
                                                                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7a6f68] mb-2">FAQs</p>
                                                                        <div className="space-y-3">
                                                                            {(tab.faqs || []).map((faq: any, idx: number) => (
                                                                                <div key={idx}>
                                                                                    <p className="font-semibold text-[#1c1c19]">{faq.question || faq.q}</p>
                                                                                    <p className="mt-0.5 text-[#56423d] text-[11px] leading-relaxed">{faq.answer || faq.a}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {tab.type === "dimensions" && (
                                            <div className="space-y-6 pt-4 border-t border-dashed border-gray-200 animate-fade-in">
                                                {/* Product Details Grid Editor */}
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Product Details</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const details = [...(tab.details || []), { label: "", value: "" }];
                                                                updateTab(tab.id, { details });
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add Detail
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {(tab.details || []).map((detail: any, detailIdx: number) => (
                                                            <div key={detailIdx} className="p-3 bg-white border border-gray-250 rounded-lg space-y-2 relative shadow-sm">
                                                                <div className="flex justify-between items-center border-b border-gray-50 pb-1.5 mb-1.5">
                                                                    <span className="text-[10px] font-bold text-gray-400">Detail #{detailIdx + 1}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            type="button"
                                                                            disabled={detailIdx === 0}
                                                                            onClick={() => {
                                                                                const details = [...(tab.details || [])];
                                                                                const temp = details[detailIdx];
                                                                                details[detailIdx] = details[detailIdx - 1];
                                                                                details[detailIdx - 1] = temp;
                                                                                updateTab(tab.id, { details });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            disabled={detailIdx === (tab.details || []).length - 1}
                                                                            onClick={() => {
                                                                                const details = [...(tab.details || [])];
                                                                                const temp = details[detailIdx];
                                                                                details[detailIdx] = details[detailIdx + 1];
                                                                                details[detailIdx + 1] = temp;
                                                                                updateTab(tab.id, { details });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const details = (tab.details || []).filter((_: any, idx: number) => idx !== detailIdx);
                                                                                updateTab(tab.id, { details });
                                                                            }}
                                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-gray-550 mb-0.5">Label</label>
                                                                        <input
                                                                            type="text"
                                                                            value={detail.label || ""}
                                                                            onChange={(e) => {
                                                                                const details = (tab.details || []).map((d: any, idx: number) => idx === detailIdx ? { ...d, label: e.target.value } : d);
                                                                                updateTab(tab.id, { details });
                                                                            }}
                                                                            className={inputCls}
                                                                            placeholder="e.g., Fabric Width"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-gray-550 mb-0.5">Value</label>
                                                                        <input
                                                                            type="text"
                                                                            value={detail.value || ""}
                                                                            onChange={(e) => {
                                                                                const details = (tab.details || []).map((d: any, idx: number) => idx === detailIdx ? { ...d, value: e.target.value } : d);
                                                                                updateTab(tab.id, { details });
                                                                            }}
                                                                            className={inputCls}
                                                                            placeholder="e.g., 112 cm"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {(tab.details || []).length === 0 && (
                                                        <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                                                            No details. Click &quot;Add Detail&quot; to build the details.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quantity Guide Editor */}
                                                <div className="space-y-4 pt-4 border-t border-gray-150">
                                                    <div className="flex justify-between items-center">
                                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity / Fitting Guide</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const guide = [...(tab.guide || []), { use: "", min: 0, max: 0 }];
                                                                updateTab(tab.id, { guide });
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add Guide Item
                                                        </button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {(tab.guide || []).map((gRow: any, guideIdx: number) => (
                                                            <div key={guideIdx} className="p-4 bg-white border border-gray-250 rounded-lg space-y-3 shadow-sm relative">
                                                                <div className="flex justify-between items-center border-b border-gray-50 pb-1.5 mb-1.5">
                                                                    <span className="text-[10px] font-bold text-gray-400">Guide Row #{guideIdx + 1}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            type="button"
                                                                            disabled={guideIdx === 0}
                                                                            onClick={() => {
                                                                                const guide = [...(tab.guide || [])];
                                                                                const temp = guide[guideIdx];
                                                                                guide[guideIdx] = guide[guideIdx - 1];
                                                                                guide[guideIdx - 1] = temp;
                                                                                updateTab(tab.id, { guide });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            disabled={guideIdx === (tab.guide || []).length - 1}
                                                                            onClick={() => {
                                                                                const guide = [...(tab.guide || [])];
                                                                                const temp = guide[guideIdx];
                                                                                guide[guideIdx] = guide[guideIdx + 1];
                                                                                guide[guideIdx + 1] = temp;
                                                                                updateTab(tab.id, { guide });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const guide = (tab.guide || []).filter((_: any, idx: number) => idx !== guideIdx);
                                                                                updateTab(tab.id, { guide });
                                                                            }}
                                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                                    <div className="md:col-span-1">
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Use / Clothing Type</label>
                                                                        <input
                                                                            type="text"
                                                                            value={gRow.use || ""}
                                                                            onChange={(e) => {
                                                                                const guide = (tab.guide || []).map((g: any, idx: number) => idx === guideIdx ? { ...g, use: e.target.value } : g);
                                                                                updateTab(tab.id, { guide });
                                                                            }}
                                                                            className={inputCls}
                                                                            placeholder="e.g., Summer Dress"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Min Meters</label>
                                                                        <input
                                                                            type="number"
                                                                            step="0.1"
                                                                            value={gRow.min ?? ""}
                                                                            onChange={(e) => {
                                                                                const guide = (tab.guide || []).map((g: any, idx: number) => idx === guideIdx ? { ...g, min: e.target.value === "" ? 0 : Number(e.target.value) } : g);
                                                                                updateTab(tab.id, { guide });
                                                                            }}
                                                                            className={inputCls}
                                                                            placeholder="e.g., 2.5"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Max Meters</label>
                                                                        <input
                                                                            type="number"
                                                                            step="0.1"
                                                                            value={gRow.max ?? ""}
                                                                            onChange={(e) => {
                                                                                const guide = (tab.guide || []).map((g: any, idx: number) => idx === guideIdx ? { ...g, max: e.target.value === "" ? 0 : Number(e.target.value) } : g);
                                                                                updateTab(tab.id, { guide });
                                                                            }}
                                                                            className={inputCls}
                                                                            placeholder="e.g., 3.0"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {(tab.guide || []).length === 0 && (
                                                        <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                                                            No quantity guide items. Click &quot;Add Guide Item&quot; to build the list.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Visual Preview */}
                                                <div className="p-4 bg-[#fbfaf8] border border-gray-200 rounded-xl space-y-2">
                                                    <div className="flex justify-between items-center border-b border-gray-150 pb-2 mb-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storefront Visual Preview (DIMENSIONS)</span>
                                                        <span className="text-[9px] bg-[#e8e4dc] text-gray-600 px-1.5 py-0.5 rounded font-mono">Bohemian Theme Styling</span>
                                                    </div>

                                                    <div className="bg-white border border-[#e8e4dc] rounded-lg shadow-sm font-sans text-left max-w-2xl mx-auto overflow-hidden">
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-150">
                                                            <div className="flex gap-1.5 flex-shrink-0">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                                                            </div>
                                                            <div className="flex-1 max-w-xs sm:max-w-md mx-auto h-5 bg-white border border-gray-200 rounded text-[9px] text-gray-400 flex items-center justify-center font-mono select-none px-2 truncate">
                                                                shreeharicutpiece.com/products/{form.slug || "product-slug"}
                                                            </div>
                                                            <div className="w-8 flex-shrink-0"></div>
                                                        </div>

                                                        <div className="p-6 text-left">
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <div className="rounded bg-[#f6f3ee] p-4">
                                                                    <h5 className="font-serif italic text-base text-[#1c1c19] font-semibold mb-3">Product Details</h5>
                                                                    <div className="space-y-2 text-xs">
                                                                        {(tab.details || []).map((row: any, idx: number) => (
                                                                            <div key={idx} className="grid grid-cols-2 border-b border-[#e8e4dc]/50 pb-1">
                                                                                <span className="text-[#7a6f68]">{row.label}</span>
                                                                                <span className="text-[#1c1c19] font-medium">{row.value}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="rounded bg-[#f0ede8] p-4">
                                                                    <h5 className="font-serif italic text-base text-[#1c1c19] font-semibold mb-3">Quantity Guide</h5>
                                                                    <div className="space-y-2 text-xs text-[#56423d]">
                                                                        {(tab.guide || []).map((row: any, idx: number) => (
                                                                            <div key={idx} className="flex justify-between border-b border-[#dcd8cf]/50 pb-1">
                                                                                <span>{row.use}</span>
                                                                                <span className="text-[#7a6f68] font-medium">{row.min} - {row.max} m</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}            </div>
                                        )}
                                    </div>
                                ))}

                                {(form.custom_tabs || []).length === 0 && (
                                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                                        No tabs configured. Add tabs below to enable dynamic product detail sections.
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    type="button"
                                    onClick={addTab}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Custom Tab
                                </button>
                            </div>
                        </div>
                    </Section>
                </div>

                {/* RIGHT */}
                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-8 space-y-5">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Status & Visibility</h3>
                            <div className="space-y-3">
                                {[
                                    { key: "is_active" as const, icon: form.is_active ? Eye : EyeOff, label: "Live on store", desc: "Visible to customers", color: "text-emerald-500" },
                                    { key: "is_featured" as const, icon: Star, label: "Featured", desc: "Homepage section", color: "text-amber-500" },
                                    { key: "is_new_arrival" as const, icon: Sparkles, label: "New Arrival", desc: "Badge & section", color: "text-violet-500" },
                                ].map(opt => (
                                    <div key={opt.key} className="flex items-center gap-3 py-1.5 cursor-pointer" onClick={() => upd(opt.key, !form[opt.key])}>
                                        <opt.icon className={`h-4 w-4 flex-shrink-0 ${form[opt.key] ? opt.color : "text-gray-300"}`} />
                                        <div className="flex-1"><p className="text-sm font-medium text-gray-800">{opt.label}</p><p className="text-xs text-gray-400">{opt.desc}</p></div>
                                        <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${form[opt.key] ? "bg-gray-900" : "bg-gray-200"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form[opt.key] ? "left-[18px]" : "left-0.5"}`} /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <button onClick={() => handleSave(false)} disabled={saving} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 mb-2">
                                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Publish</>}
                            </button>
                            <button onClick={() => handleSave(true)} disabled={saving} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                                <EyeOff className="h-4 w-4" />Save as Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
