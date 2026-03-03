"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Save, Trash2, Plus, Upload, X, Loader2, Eye, EyeOff,
    Star, Sparkles, CircleHelp, Check
} from "lucide-react";

/* ─── Types ─── */
interface VariantImage {
    id?: string; image_url: string; is_primary: boolean; sort_order: number;
    media_type: "image" | "video"; file?: File; preview?: string;
}
interface Variant {
    id?: string; color_name: string; color_hex: string; material_label: string;
    price: number; original_price: number; stock: number; sku: string;
    is_default: boolean; sort_order: number; images: VariantImage[];
}
interface ProductForm {
    name: string; slug: string; category_id: string; description: string;
    fabric: string; width: string; care_instructions: string;
    sell_mode: "meter" | "quantity"; is_featured: boolean; is_new_arrival: boolean;
    is_active: boolean; sort_order: number;
    discount_type: "percent" | "flat"; discount_label: string;
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
const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg placeholder:text-gray-300 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all";

/* ─── Main ─── */
export default function AddProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const [form, setForm] = useState<ProductForm>({
        name: "", slug: "", category_id: "", description: "", fabric: "", width: "",
        care_instructions: "", sell_mode: "meter", is_featured: false, is_new_arrival: false,
        is_active: true, sort_order: 0, discount_type: "percent", discount_label: "",
    });

    const [variants, setVariants] = useState<Variant[]>([{
        color_name: "", color_hex: "#000000", material_label: "", price: 0,
        original_price: 0, stock: 0, sku: "", is_default: true, sort_order: 0, images: [],
    }]);

    useEffect(() => { supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => { if (data) setCategories(data); }); }, []);

    const genSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const upd = (k: keyof ProductForm, v: string | boolean | number) => { setForm((p) => { const u = { ...p, [k]: v }; if (k === "name") u.slug = genSlug(v as string); return u; }); };
    const updV = (i: number, k: keyof Variant, v: string | number | boolean) => {
        setVariants((p) => { const u = [...p]; (u[i] as unknown as Record<string, unknown>)[k] = v; if (k === "is_default" && v === true) u.forEach((x, j) => { if (j !== i) x.is_default = false; }); return u; });
    };
    const addVariant = () => setVariants((p) => [...p, { color_name: "", color_hex: "#000000", material_label: "", price: 0, original_price: 0, stock: 0, sku: "", is_default: false, sort_order: p.length, images: [] }]);
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

    const getDiscount = (price: number, mrp: number) => {
        if (!mrp || mrp <= price) return "";
        return form.discount_type === "percent" ? `${Math.round(((mrp - price) / mrp) * 100)}% off` : `₹${mrp - price} off`;
    };

    const handleSave = async (draft = false) => {
        if (!form.name.trim()) return alert("Product name is required");
        if (variants.some((v) => !v.color_name.trim())) return alert("All variants need a color name");
        setSaving(true);
        try {
            const { data: product, error: pErr } = await supabase.from("products")
                .insert({ ...form, is_active: draft ? false : form.is_active, category_id: form.category_id || null })
                .select("id").single();
            if (pErr || !product) throw pErr;

            for (const v of variants) {
                const { data: iv, error: vErr } = await supabase.from("product_variants")
                    .insert({ product_id: product.id, color_name: v.color_name, color_hex: v.color_hex, material_label: v.material_label || null, price: v.price, original_price: v.original_price || null, stock: v.stock, sku: v.sku || null, is_default: v.is_default, sort_order: v.sort_order })
                    .select("id").single();
                if (vErr || !iv) throw vErr;

                for (const img of v.images) {
                    let url = img.image_url;
                    if (img.file) {
                        const ext = img.file.name.split(".").pop();
                        const name = `${product.id}/${iv.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
                        const { error: uErr } = await supabase.storage.from("product-images").upload(name, img.file);
                        if (uErr) { console.error(uErr); continue; }
                        url = supabase.storage.from("product-images").getPublicUrl(name).data.publicUrl;
                    }
                    if (url) await supabase.from("variant_images").insert({ variant_id: iv.id, image_url: url, is_primary: img.is_primary, sort_order: img.sort_order, media_type: img.media_type });
                }
            }
            router.push("/admin/products");
        } catch (e) { console.error(e); alert("Failed to save"); } finally { setSaving(false); }
    };

    return (
        <div className="max-w-5xl">
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
                            <div><Label tip="Full description shown on product info page.">Description</Label><textarea value={form.description} onChange={(e) => upd("description", e.target.value)} rows={4} className={`${inputCls} resize-none`} placeholder="Describe the fabric quality, pattern..." /></div>
                        </div>
                    </Section>

                    {/* 2 - Fabric */}
                    <Section title="Fabric & Care Details" step={2}>
                        <p className="text-xs text-gray-400 -mt-3 mb-4">Shown in the &quot;Fabric Details&quot; tab on the product page.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Fabric Type</Label><input type="text" value={form.fabric} onChange={(e) => upd("fabric", e.target.value)} className={inputCls} placeholder="100% Cotton" /></div>
                            <div><Label>Care Instructions</Label><input type="text" value={form.care_instructions} onChange={(e) => upd("care_instructions", e.target.value)} className={inputCls} placeholder="Gentle hand wash" /></div>
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
