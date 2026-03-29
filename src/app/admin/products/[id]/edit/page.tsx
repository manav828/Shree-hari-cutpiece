/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Save, Trash2, Plus, Upload, X, Loader2, Eye, EyeOff,
    Star, Sparkles, CircleHelp, ExternalLink, Check, FileText, Palette,
    ShoppingBag, List, Search
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── Types ─── */
interface VariantImage { id?: string; image_url: string; is_primary: boolean; sort_order: number; media_type: "image" | "video"; file?: File; preview?: string; }
interface Variant { id?: string; color_name: string; color_hex: string; material_label: string; price: number; original_price: number; stock: number; sku: string; is_default: boolean; sort_order: number; images: VariantImage[]; }
interface FabricRow { key: string; value: string; }
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
    fabric_details: FabricRow[];
    description_html: string;
    description_css: string;
    use_custom_description: boolean;
    related_product_ids: string[];
    long_description: string;
    meta_title: string; meta_description: string; canonical_url: string;
    og_title: string; og_description: string; og_image_url: string;
    twitter_card_type: "summary" | "summary_large_image";
}

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-2xl animate-slide-up">
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
}

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg placeholder:text-gray-300 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all";
function Label({ children, tip }: { children: React.ReactNode; tip?: string }) {
    return (<div className="mb-1.5"><label className="text-sm font-semibold text-gray-700">{children}</label>{tip && <p className="text-xs text-gray-400 mt-0.5">{tip}</p>}</div>);
}

/* ─── Section Tabs Config ─── */
const TABS = [
    { id: "details", label: "Details", icon: FileText },
    { id: "fabric", label: "Product Description", icon: List },
    { id: "pricing", label: "Selling & Pricing", icon: ShoppingBag },
    { id: "variants", label: "Color Variants", icon: Palette },
    { id: "options", label: "Options", icon: List },
    { id: "seo", label: "SEO", icon: Search },
    { id: "content", label: "Content", icon: FileText },
];

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */
export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);
    const [toast, setToast] = useState("");
    const [activeTab, setActiveTab] = useState("details");

    const [form, setForm] = useState<ProductForm>({
        name: "", slug: "", category_id: "", description: "", fabric: "", width: "",
        care_instructions: "", sell_mode: "meter", is_featured: false, is_new_arrival: false,
        is_active: true, sort_order: 0, discount_type: "percent", discount_label: "",
        fabric_details: [],
        description_html: "",
        description_css: "",
        use_custom_description: false,
        related_product_ids: [],
        long_description: "",
        meta_title: "", meta_description: "", canonical_url: "",
        og_title: "", og_description: "", og_image_url: "",
        twitter_card_type: "summary_large_image",
    });
    const [variants, setVariants] = useState<Variant[]>([]);
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [highlights, setHighlights] = useState<string[]>([]);
    const [faqs, setFaqs] = useState<FaqRow[]>([]);

    /* ─── Save ─── */
    const handleSave = async () => {
        if (!form.name.trim()) return alert("Product name is required");
        setSaving(true);
        const sb = supabase as any;
        console.log("🚀 --- STARTING SAVE PROCESS --- 🚀");
        console.log("📦 Product Form Data:", form);
        console.log("🎨 Variants Data:", variants);

        try {
            // Update Product
            console.log("➤ Sending Product Update API Call...");
            const productUpdatePayload = {
                name: form.name, slug: form.slug, category_id: form.category_id || null,
                description: form.description, fabric: form.fabric, width: form.width,
                care_instructions: form.care_instructions, sell_mode: form.sell_mode,
                is_featured: form.is_featured, is_new_arrival: form.is_new_arrival,
                is_active: form.is_active, sort_order: form.sort_order,
                discount_type: form.discount_type, discount_label: form.discount_label,
                fabric_details: form.fabric_details.filter(r => r.key.trim() || r.value.trim()),
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
            };

            const { data: pData, error: pErr } = await sb
                .from("products")
                .update(productUpdatePayload as never)
                .eq("id", productId)
                .select(); // ADDED SELECT to force return data

            console.log("✅ Product Update Response:", { data: pData, error: pErr });
            if (pErr) throw new Error("Products update err: " + pErr.message);
            if (!pData || pData.length === 0) {
                console.error("🚨 CRITICAL ERROR: Product update returned 0 rows! This means Row Level Security (RLS) blocked the update or the ID is wrong.");
                throw new Error("Product update failed silently. Are you missing database edit permissions (RLS)?");
            }

            // Variants
            const { data: ev } = await sb.from("product_variants").select("id").eq("product_id", productId);
            const existingVarIds = ((ev || []) as Array<{ id: string }>).map((v) => v.id);
            const currentVarIds = new Set(variants.filter(v => v.id).map(v => v.id));
            for (const id of existingVarIds) {
                if (!currentVarIds.has(id)) {
                    console.log(`🗑️ Deleting removed variant ${id}`);
                    await sb.from("variant_images").delete().eq("variant_id", id);
                    await sb.from("product_variants").delete().eq("id", id);
                }
            }

            const updatedVariants = [...variants];
            for (let i = 0; i < updatedVariants.length; i++) {
                const v = updatedVariants[i];
                let vid = v.id;

                // Parse numbers safely
                const safePrice = parseFloat(v.price as any) || 0;
                const safeOriginalPrice = parseFloat(v.original_price as any) || 0;
                // If original price is 0 or less than selling price, set it to the selling price so no discount shows
                const finalOriginalPrice = (safeOriginalPrice <= safePrice || !safeOriginalPrice) ? safePrice : safeOriginalPrice;

                console.log(`➤ Processing Variant [${i}]: ${v.color_name}`);

                if (vid) {
                    const { data: vData, error: vErr } = await sb.from("product_variants").update({
                        color_name: v.color_name, color_hex: v.color_hex, material_label: v.material_label || null,
                        price: safePrice,
                        original_price: finalOriginalPrice,
                        stock: parseFloat(v.stock as any) || 0,
                        sku: v.sku || null, is_default: v.is_default, sort_order: v.sort_order,
                    }).eq("id", vid).select(); // ADDED SELECT

                    console.log(`✅ Variant [${i}] Update Response:`, { data: vData, error: vErr });
                    if (vErr) throw new Error("Variant update err: " + vErr.message);
                    if (!vData || vData.length === 0) {
                        console.error(`🚨 CRITICAL ERROR: Variant [${i}] update returned 0 rows! RLS Blocked it.`);
                    }
                } else {
                    const { data: iv, error: isvErr } = await sb.from("product_variants").insert({
                        product_id: productId, color_name: v.color_name, color_hex: v.color_hex,
                        material_label: v.material_label || null, price: safePrice,
                        original_price: finalOriginalPrice,
                        stock: parseFloat(v.stock as any) || 0, sku: v.sku || null, is_default: v.is_default, sort_order: v.sort_order,
                    }).select("id").single();

                    console.log(`✅ Variant [${i}] Insert Response:`, { data: iv, error: isvErr });
                    if (isvErr) throw new Error("Variant insert err: " + isvErr.message);
                    if (iv) { updatedVariants[i] = { ...v, id: iv.id }; vid = iv.id; }
                }
                if (!vid) continue;

                const { data: ei } = await sb.from("variant_images").select("id").eq("variant_id", vid);
                const existingImgIds = ((ei || []) as Array<{ id: string }>).map((im) => im.id);
                const currentImgIds = new Set(v.images.filter(im => im.id).map(im => im.id));
                for (const id of existingImgIds) {
                    if (!currentImgIds.has(id)) await sb.from("variant_images").delete().eq("id", id);
                }
                for (const img of v.images) {
                    if (img.id) await sb.from("variant_images").update({ is_primary: img.is_primary, sort_order: img.sort_order }).eq("id", img.id);
                }
                for (const img of v.images) {
                    if (img.file) {
                        const ext = img.file.name.split(".").pop();
                        const name = `${productId}/${vid}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
                        const { error: uErr } = await sb.storage.from("product-images").upload(name, img.file);
                        if (uErr) continue;
                        const url = sb.storage.from("product-images").getPublicUrl(name).data.publicUrl;
                        await sb.from("variant_images").insert({ variant_id: vid, image_url: url, is_primary: img.is_primary, sort_order: img.sort_order, media_type: img.media_type });
                    }
                }
            }

            await saveOptionGroups();
            setVariants(updatedVariants);
            console.log("🎉 SAVE COMPLETE");
            setToast("Product saved successfully!");
        } catch (e: any) {
            console.error("❌ SAVE FAILED:", e);
            alert("Failed to save: " + e.message);
        } finally {
            setSaving(false);
        }
    };
    /* ─── Fetch ─── */
    const fetchProduct = useCallback(async () => {
        setLoading(true);
        const sb = supabase as any;
        const { data: p } = await sb.from("products")
            .select(`*,
                product_variants ( *, variant_images ( * ) ),
                product_option_groups ( *, product_option_values ( * ) )
            `).eq("id", productId).single();
        if (p) {
            const rawDetails: FabricRow[] = Array.isArray(p.fabric_details) ? p.fabric_details : [];
            setForm({
                name: p.name, slug: p.slug, category_id: p.category_id || "", description: p.short_description || p.description || "",
                fabric: p.fabric || "", width: p.width || "", care_instructions: p.care_instructions || "",
                sell_mode: p.sell_mode, is_featured: p.is_featured, is_new_arrival: p.is_new_arrival,
                is_active: p.is_active, sort_order: p.sort_order || 0,
                discount_type: p.discount_type || "percent", discount_label: p.discount_label || "",
                fabric_details: rawDetails.length > 0 ? rawDetails : [
                    { key: "Fabric Type", value: p.fabric || "" },
                    { key: "Width", value: p.width || "" },
                    { key: "Care Instructions", value: p.care_instructions || "" },
                ],
                description_html: p.description_html || "",
                description_css: p.description_css || "",
                use_custom_description: !!p.use_custom_description,
                related_product_ids: Array.isArray(p.related_product_ids) ? p.related_product_ids : [],
                long_description: p.long_description || "",
                meta_title: p.meta_title || "",
                meta_description: p.meta_description || "",
                canonical_url: p.canonical_url || "",
                og_title: p.og_title || "",
                og_description: p.og_description || "",
                og_image_url: p.og_image_url || "",
                twitter_card_type: p.twitter_card_type || "summary_large_image",
            });
            setHighlights(Array.isArray(p.highlights) ? p.highlights : []);
            setFaqs(Array.isArray(p.faqs) ? p.faqs : []);
            interface RawImg { id: string; image_url: string; is_primary: boolean; sort_order: number; media_type: "image" | "video"; }
            interface RawVar { id: string; color_name: string; color_hex: string; material_label: string | null; price: number; original_price: number | null; stock: number; sku: string | null; is_default: boolean; sort_order: number; variant_images: RawImg[]; }
            setVariants((p.product_variants as RawVar[]).map((v) => ({
                id: v.id, color_name: v.color_name, color_hex: v.color_hex || "#000000", material_label: v.material_label || "",
                price: +v.price, original_price: +(v.original_price || 0), stock: v.stock, sku: v.sku || "",
                is_default: v.is_default, sort_order: v.sort_order,
                images: (v.variant_images || []).map((i) => ({ id: i.id, image_url: i.image_url, is_primary: i.is_primary, sort_order: i.sort_order, media_type: i.media_type })),
            })).sort((a, b) => a.sort_order - b.sort_order));

            const groups = Array.isArray(p.product_option_groups) ? p.product_option_groups : [];
            setOptionGroups(groups.map((g: any) => ({
                id: g.id,
                name: g.name,
                input_type: g.input_type,
                input_data_type: g.input_data_type || "text",
                required: !!g.required,
                min_selections: g.min_selections,
                max_selections: g.max_selections,
                placeholder: g.placeholder || "",
                help_text: g.help_text || "",
                input_min_length: g.input_min_length,
                input_max_length: g.input_max_length,
                input_min_value: g.input_min_value,
                input_max_value: g.input_max_value,
                sort_order: g.sort_order || 0,
                is_active: g.is_active !== false,
                values: (g.product_option_values || []).map((v: any) => ({
                    id: v.id,
                    label: v.label,
                    value: v.value,
                    is_default: !!v.is_default,
                    sort_order: v.sort_order || 0,
                    is_active: v.is_active !== false,
                })).sort((a: any, b: any) => a.sort_order - b.sort_order),
            })).sort((a: any, b: any) => a.sort_order - b.sort_order));

        }
        setLoading(false);
    }, [productId]);

    useEffect(() => {
        fetchProduct();
        supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => { if (data) setCategories(data); });
        supabase.from("products").select("id, name").order("name").then(({ data }) => {
            if (data) setAllProducts(data.filter((p: { id: string }) => p.id !== productId));
        });
    }, [fetchProduct]);

    /* ─── Helpers ─── */
    const genSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const upd = (k: keyof ProductForm, v: string | boolean | number | FabricRow[] | string[]) => { setForm((p) => { const u = { ...p, [k]: v }; if (k === "name") u.slug = genSlug(v as string); return u; }); };

    const updV = (i: number, k: keyof Variant, v: string | number | boolean) => {
        setVariants((p) => {
            const u = [...p];
            u[i] = { ...u[i], [k]: v };
            if (k === "is_default" && v === true) {
                u.forEach((x, j) => { if (j !== i) u[j] = { ...u[j], is_default: false }; });
            }
            return u;
        });
    };

    const addVariant = () => setVariants((p) => [...p, { color_name: "", color_hex: "#000000", material_label: "", price: 0, original_price: 0, stock: 0, sku: "", is_default: p.length === 0, sort_order: p.length, images: [] }]);
    const rmVariant = (i: number) => { if (variants.length <= 1) return; setVariants((p) => { const u = p.filter((_, j) => j !== i); if (!u.some(x => x.is_default) && u.length) u[0].is_default = true; return u; }); };

    /* Fabric details key-value */
    const addFabricRow = () => upd("fabric_details", [...form.fabric_details, { key: "", value: "" }]);
    const updFabricRow = (i: number, field: "key" | "value", val: string) => {
        const rows = [...form.fabric_details]; rows[i] = { ...rows[i], [field]: val }; upd("fabric_details", rows);
    };
    const rmFabricRow = (i: number) => upd("fabric_details", form.fabric_details.filter((_, j) => j !== i));

    /* Images */
    const addImgs = (vi: number, files: FileList | null) => {
        if (!files) return;
        const ni: VariantImage[] = Array.from(files).map((f, i) => ({
            image_url: "", is_primary: variants[vi].images.length === 0 && i === 0,
            sort_order: variants[vi].images.length + i, media_type: f.type.startsWith("video") ? "video" : "image", file: f, preview: URL.createObjectURL(f),
        }));
        setVariants((p) => { const u = [...p]; u[vi] = { ...u[vi], images: [...u[vi].images, ...ni] }; return u; });
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

    const getDiscountInfo = (price: number, mrp: number) => {
        if (!mrp || mrp <= price) return "";
        if (form.discount_type === "percent") return `${Math.round(((mrp - price) / mrp) * 100)}% off`;
        return `₹${mrp - price} off`;
    };

    const saveOptionGroups = async () => {
        const sb = supabase as any;
        const { data: existingGroups } = await sb
            .from("product_option_groups")
            .select("id")
            .eq("product_id", productId);

        const existingIds = new Set((existingGroups || []).map((g: { id: string }) => g.id));
        const currentIds = new Set(optionGroups.filter((g) => g.id).map((g) => g.id as string));

        for (const id of existingIds) {
            if (!currentIds.has(id)) {
                await sb.from("product_option_groups").delete().eq("id", id);
            }
        }

        for (let i = 0; i < optionGroups.length; i++) {
            const group = optionGroups[i];
            if (!group.name.trim()) continue;
            let groupId = group.id;

            const payload = {
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
            };

            if (groupId) {
                const { error } = await sb.from("product_option_groups").update(payload).eq("id", groupId);
                if (error) throw error;
            } else {
                const { data, error } = await sb.from("product_option_groups").insert(payload).select("id").single();
                if (error || !data) throw error;
                groupId = data.id;
            }

            if (!groupId) continue;

            if (group.input_type === "input") {
                await sb.from("product_option_values").delete().eq("group_id", groupId);
                continue;
            }

            const { data: existingValues } = await sb
                .from("product_option_values")
                .select("id")
                .eq("group_id", groupId);

            const existingValueIds = new Set((existingValues || []).map((v: { id: string }) => v.id));
            const currentValueIds = new Set(group.values.filter((v) => v.id).map((v) => v.id as string));

            for (const id of existingValueIds) {
                if (!currentValueIds.has(id)) {
                    await sb.from("product_option_values").delete().eq("id", id);
                }
            }

            const filteredValues = (group.values || []).filter((v) => v.label.trim() || v.value.trim());
            for (let vi = 0; vi < filteredValues.length; vi++) {
                const val = filteredValues[vi];
                const valuePayload = {
                    group_id: groupId,
                    label: val.label,
                    value: val.value || val.label,
                    is_default: val.is_default,
                    sort_order: vi,
                    is_active: val.is_active,
                };

                if (val.id) {
                    const { error } = await sb.from("product_option_values").update(valuePayload).eq("id", val.id);
                    if (error) throw error;
                } else {
                    const { error } = await sb.from("product_option_values").insert(valuePayload);
                    if (error) throw error;
                }
            }
        }
    };

    const handleDelete = async () => {
        const sb = supabase as any;
        const { data: vs } = await sb.from("product_variants").select("id").eq("product_id", productId);
        const variantRows = (vs || []) as Array<{ id: string }>;
        if (variantRows.length) {
            await sb.from("variant_images").delete().in("variant_id", variantRows.map((v) => v.id));
            await sb.from("product_variants").delete().eq("product_id", productId);
        }
        await sb.from("products").delete().eq("id", productId);
        router.push("/admin/products");
    };

    if (loading) return (<div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-5 w-5 animate-spin text-gray-300" /><span className="ml-2 text-sm text-gray-400">Loading...</span></div>);
    const isDetailsTab = activeTab === "details";

    /* ═══════════════════ RENDER ═══════════════════ */
    return (
        <div className="w-full max-w-none">
            {toast && <Toast message={toast} onClose={() => setToast("")} />}

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Link href="/admin/products" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><ArrowLeft className="h-5 w-5" /></Link>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-gray-900">Edit Product</h1>
                    <p className="text-sm text-gray-400">{form.name || "Untitled"}</p>
                </div>
                <Link href={`/shop/${form.slug}`} target="_blank" className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"><ExternalLink className="h-4 w-4" /> View on Store</Link>
                <Link href="/admin/products" className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Back to Products</Link>
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
                </button>
                <button onClick={() => setDeleteModal(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100"><Trash2 className="h-4 w-4" /> Delete</button>
            </div>

            {/* ═══ TAB BAR — Toggle active section ═══ */}
            <div className="flex items-stretch gap-1 bg-white border border-gray-200 rounded-xl p-1.5 mb-5">
                {TABS.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-0 flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-semibold rounded-lg transition-all text-center leading-tight ${activeTab === tab.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}>
                        <tab.icon className="h-4 w-4" />{tab.label}
                    </button>
                ))}
            </div>

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setDeleteModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Delete this product?</h3>
                        <p className="text-sm text-gray-500 mb-5">&quot;{form.name}&quot; and all variants will be permanently removed.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-1 gap-5 ${isDetailsTab ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
                {/* ═══ LEFT COLUMN — Only active tab shows ═══ */}
                <div className={isDetailsTab ? "lg:col-span-2" : ""}>

                    {/* ──── TAB: Details ──── */}
                    {activeTab === "details" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2.5 mb-5">
                                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">1</span>
                                <h2 className="text-base font-semibold text-gray-900">Product Details</h2>
                            </div>
                            <div className="space-y-4">
                                <div><Label tip="The main title customers see.">Product Name</Label><input type="text" value={form.name} onChange={(e) => upd("name", e.target.value)} className={inputCls} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label tip="URL path.">Slug</Label><input type="text" value={form.slug} onChange={(e) => upd("slug", e.target.value)} className={`${inputCls} text-gray-400`} /></div>
                                    <div><Label tip="Product group.">Category</Label><select value={form.category_id} onChange={(e) => upd("category_id", e.target.value)} className={inputCls}><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                </div>
                                <div><Label tip="Short summary shown near the product title.">Short Description</Label><textarea value={form.description} onChange={(e) => upd("description", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Short summary for quick scanning..." /></div>
                            </div>
                        </div>
                    )}

                    {/* ──── TAB: Product Description (Dynamic Key-Value) ──── */}
                    {activeTab === "fabric" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">2</span>
                                    <h2 className="text-base font-semibold text-gray-900">Product Description</h2>
                                </div>
                                <button onClick={addFabricRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Plus className="h-3.5 w-3.5" /> Add Row
                                </button>
                            </div>

                            {/* Info banner */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 flex items-start gap-2">
                                <CircleHelp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Use HTML/CSS below for a rich product description. If left blank, the Long Description is used.
                                    The rows below appear in the <strong>&quot;Specifications&quot;</strong> tab as <strong>label → value</strong> pairs.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-6">
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
                                        <div>
                                            <Label tip="Optional: custom HTML shown in the Description tab.">Description HTML</Label>
                                            <textarea value={form.description_html} onChange={(e) => upd("description_html", e.target.value)} rows={6} className={`${inputCls} font-mono text-xs`} placeholder="<p>Write rich HTML description here</p>" />
                                        </div>
                                        <div>
                                            <Label tip="Optional: CSS to style the HTML above.">Description CSS</Label>
                                            <textarea value={form.description_css} onChange={(e) => upd("description_css", e.target.value)} rows={5} className={`${inputCls} font-mono text-xs`} placeholder=".product-desc h2 { margin-top: 16px; }" />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Key-Value Table */}
                            {form.fabric_details.length === 0 ? (
                                <div className="text-center py-10 text-gray-300">
                                    <List className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm">No fabric details yet</p>
                                    <button onClick={addFabricRow} className="mt-2 text-sm font-medium text-gray-900 underline">Add first row</button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Header */}
                                    <div className="grid grid-cols-[1fr_1fr_40px] gap-3 px-1">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Label</span>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</span>
                                        <span></span>
                                    </div>
                                    {form.fabric_details.map((row, i) => (
                                        <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-3 items-center group">
                                            <input
                                                type="text" value={row.key}
                                                onChange={(e) => updFabricRow(i, "key", e.target.value)}
                                                className={inputCls} placeholder="e.g. Fabric Type"
                                            />
                                            <input
                                                type="text" value={row.value}
                                                onChange={(e) => updFabricRow(i, "value", e.target.value)}
                                                className={inputCls} placeholder="e.g. Pure Silk"
                                            />
                                            <button onClick={() => rmFabricRow(i)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Preview */}
                            {form.fabric_details.some(r => r.key.trim() && r.value.trim()) && (
                                <div className="mt-5 pt-5 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preview — How it looks on product page</p>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        {form.fabric_details.filter(r => r.key.trim() && r.value.trim()).map((row, i) => (
                                            <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-200/60 last:border-0">
                                                <span className="text-sm text-gray-500">{row.key}</span>
                                                <span className="text-sm font-medium text-gray-900">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ──── TAB: Selling & Pricing ──── */}
                    {activeTab === "pricing" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2.5 mb-5">
                                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">3</span>
                                <h2 className="text-base font-semibold text-gray-900">Selling & Pricing</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label tip="Per Meter = customer enters meters. Per Piece = quantity.">Sell Mode</Label>
                                        <div className="flex gap-2 mt-1">
                                            {(["meter", "quantity"] as const).map(m => (
                                                <button key={m} type="button" onClick={() => upd("sell_mode", m)}
                                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${form.sell_mode === m ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-400"}`}>
                                                    {m === "meter" ? "📏 Per Meter" : "📦 Per Piece"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {form.sell_mode === "meter" && <div><Label tip="Width of fabric roll.">Fabric Width</Label><input type="text" value={form.width} onChange={(e) => upd("width", e.target.value)} className={inputCls} placeholder="44 inches" /></div>}
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                    <Label tip="How discount displays. Example: '25% off' or '₹100 off'.">Discount Display</Label>
                                    <div className="flex gap-2 mt-1">
                                        <button type="button" onClick={() => upd("discount_type", "percent")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${form.discount_type === "percent" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-400"}`}>Show as % off</button>
                                        <button type="button" onClick={() => upd("discount_type", "flat")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${form.discount_type === "flat" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-400"}`}>Show as ₹ off</button>
                                    </div>
                                    {variants.length > 0 && variants[0].original_price > 0 && variants[0].original_price > variants[0].price && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                                            <span className="text-xs text-gray-400">Preview:</span>
                                            <span className="text-sm font-semibold text-gray-900">₹{variants[0].price}</span>
                                            <span className="text-sm text-gray-400 line-through">₹{variants[0].original_price}</span>
                                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">{getDiscountInfo(variants[0].price, variants[0].original_price)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ──── TAB: Color Variants ──── */}
                    {activeTab === "variants" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">4</span>
                                    <h2 className="text-base font-semibold text-gray-900">Color Variants</h2>
                                </div>
                                <button onClick={addVariant} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <Plus className="h-3.5 w-3.5" /> Add Color
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-start gap-2">
                                <CircleHelp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-700">Each color has its <strong>own price, stock, and images</strong>. Customer picks a color → sees that color&apos;s images.</p>
                            </div>

                            <div className="space-y-4">
                                {variants.map((v, vi) => (
                                    <div key={v.id || vi} className="border border-gray-200 rounded-xl p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: v.color_hex }} />
                                                <span className="text-sm font-semibold text-gray-700">{v.color_name || `Color ${vi + 1}`}</span>
                                                {v.is_default && <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-900 text-white rounded">Default</span>}
                                            </div>
                                            {variants.length > 1 && <button onClick={() => rmVariant(vi)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Color Name</label><input type="text" value={v.color_name} onChange={(e) => updV(vi, "color_name", e.target.value)} className={inputCls} placeholder="Royal Red" /></div>
                                            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Color</label><div className="flex gap-2"><input type="color" value={v.color_hex} onChange={(e) => updV(vi, "color_hex", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" /><input type="text" value={v.color_hex} onChange={(e) => updV(vi, "color_hex", e.target.value)} className={`${inputCls} font-mono text-gray-400 flex-1`} /></div></div>
                                            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Selling Price ₹</label><input type="number" value={v.price || ""} onChange={(e) => updV(vi, "price", +e.target.value)} className={inputCls} placeholder="299" /></div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">MRP ₹ <span className="text-gray-300">(original)</span></label>
                                                <input type="number" value={v.original_price || ""} onChange={(e) => updV(vi, "original_price", +e.target.value)} className={inputCls} placeholder="399" />
                                                {v.original_price > 0 && v.original_price > v.price && <span className="text-[11px] text-green-600 mt-1 block">{getDiscountInfo(v.price, v.original_price)}</span>}
                                            </div>
                                            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Stock</label><input type="number" value={v.stock || ""} onChange={(e) => updV(vi, "stock", +e.target.value)} className={inputCls} placeholder="50" /></div>
                                            <div><label className="text-xs font-medium text-gray-500 mb-1 block">SKU</label><input type="text" value={v.sku} onChange={(e) => updV(vi, "sku", e.target.value)} className={`${inputCls} font-mono`} /></div>
                                            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Material Label</label><input type="text" value={v.material_label} onChange={(e) => updV(vi, "material_label", e.target.value)} className={inputCls} /></div>
                                            <div className="flex items-end"><label className="flex items-center gap-2 py-2.5 cursor-pointer"><input type="radio" name="default_variant" checked={v.is_default} onChange={() => updV(vi, "is_default", true)} className="w-4 h-4" /><span className="text-sm font-medium text-gray-500">Default</span></label></div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-2 block">Images for {v.color_name || "this color"}</label>
                                            <div className="flex flex-wrap gap-2.5">
                                                {v.images.map((img, ii) => (
                                                    <div key={img.id || ii} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
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
                        </div>
                    )}

                    {/* ──── TAB: Options ──── */}
                    {activeTab === "options" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">Product Options</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Add option groups like Size, Pack, Custom Text.</p>
                                </div>
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
                        </div>
                    )}

                    {/* ──── TAB: SEO ──── */}
                    {activeTab === "seo" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                        </div>
                    )}

                    {/* ──── TAB: Content ──── */}
                    {activeTab === "content" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                                </div>

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
                    )}
                </div>

                {/* ═══ RIGHT COLUMN ═══ */}
                {isDetailsTab && (
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
                                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800">{opt.label}</p><p className="text-xs text-gray-400">{opt.desc}</p></div>
                                            <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${form[opt.key] ? "bg-gray-900" : "bg-gray-200"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form[opt.key] ? "left-[18px]" : "left-0.5"}`} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
