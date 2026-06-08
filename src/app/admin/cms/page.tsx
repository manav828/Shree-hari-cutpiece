"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Info,
  Pencil,
  Eye,
  Sliders,
  Sparkles,
  LayoutGrid,
  Heart,
  Bookmark,
  Star,
  Upload
} from "lucide-react";
import StoreConfigForm from "@/components/admin/cms/StoreConfigForm";
import CategoriesManager from "@/components/admin/cms/CategoriesManager";
import BannersManager from "@/components/admin/cms/BannersManager";
import type { SiteConfigField } from "@/components/admin/cms/SiteConfigFormSection";

type TabId = "sections" | "categories" | "store";

type ConfigType = "text" | "textarea" | "number" | "url";

type SaveUpdate = {
  key: string;
  value: string;
  type: ConfigType;
  label: string;
  group: string;
  required?: boolean;
};

const storeFields: SiteConfigField[] = [
  { key: "store_address", label: "Store Address", type: "textarea", group: "store", required: true },
  { key: "store_hours_weekday", label: "Weekday Hours", type: "text", group: "store", required: true },
  { key: "store_hours_weekend", label: "Weekend Hours", type: "text", group: "store", required: true },
  { key: "store_phone", label: "Phone", type: "text", group: "store", required: true },
  { key: "store_email", label: "Email", type: "text", group: "store", required: true },
  { key: "store_maps_url", label: "Directions URL", type: "url", group: "store", required: true },
  { key: "store_embed_url", label: "Maps Embed URL", type: "url", group: "store", required: true },
];

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("sections");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Meta datasets
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Local state for Spaces to Inhabit editor
  const [spacesItems, setSpacesItems] = useState<Array<{ type: "category" | "product"; slug: string }>>([]);
  const [newSpaceType, setNewSpaceType] = useState<"category" | "product">("category");
  const [newSpaceSlug, setNewSpaceSlug] = useState<string>("");

  // Local state for selected items in manual modes
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Local state for Testimonials editor
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [savingTestimonial, setSavingTestimonial] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // 1. Fetch site config
      const resConfig = await fetch("/api/admin/cms/site-config", { cache: "no-store" });
      const jsonConfig = await resConfig.json();
      if (!resConfig.ok) throw new Error(jsonConfig.error || "Failed to load config");
      setValues(jsonConfig.map || {});

      // Initialize Spaces items from config
      const spacesJsonStr = jsonConfig.map?.bohemian_spaces_items || "";
      if (spacesJsonStr) {
        try {
          const parsed = JSON.parse(spacesJsonStr);
          if (Array.isArray(parsed)) setSpacesItems(parsed);
        } catch {
          setSpacesItems([]);
        }
      } else {
        setSpacesItems([]);
      }

      // Initialize Selected Blogs
      const blogJsonStr = jsonConfig.map?.bohemian_journal_selected || "";
      if (blogJsonStr) {
        try {
          const parsed = JSON.parse(blogJsonStr);
          if (Array.isArray(parsed)) setSelectedBlogs(parsed);
        } catch {
          setSelectedBlogs([]);
        }
      } else {
        setSelectedBlogs([]);
      }

      // Initialize Selected Products
      const productJsonStr = jsonConfig.map?.bohemian_freshly_harvested_products || "";
      if (productJsonStr) {
        try {
          const parsed = JSON.parse(productJsonStr);
          if (Array.isArray(parsed)) setSelectedProducts(parsed);
        } catch {
          setSelectedProducts([]);
        }
      } else {
        setSelectedProducts([]);
      }

      // 2. Fetch categories
      const resCats = await fetch("/api/admin/cms/categories");
      const jsonCats = await resCats.json();
      setCategories(jsonCats.categories || []);

      // 3. Fetch products
      const resProds = await fetch("/api/admin/products/search?all=true");
      const jsonProds = await resProds.json();
      setProducts(jsonProds.products || []);

      // 4. Fetch blogs
      const resBlogs = await fetch("/api/admin/blogs?limit=100");
      const jsonBlogs = await resBlogs.json();
      setBlogs(jsonBlogs.posts || []);

      // 5. Fetch testimonials
      const resTestimonials = await fetch("/api/admin/cms/testimonials");
      const jsonTestimonials = await resTestimonials.json();
      setTestimonials(jsonTestimonials.items || []);

    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Failed to load landing page configuration";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const onChangeValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async (updates: SaveUpdate[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cms/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save configuration changes");

      setMessage({ type: "success", text: "Section configuration saved successfully." });
      // Reload config map to sync state
      const resConfig = await fetch("/api/admin/cms/site-config", { cache: "no-store" });
      const jsonConfig = await resConfig.json();
      if (resConfig.ok) {
        setValues(jsonConfig.map || {});
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Failed to save changes";
      setMessage({ type: "error", text });
    } finally {
      setSaving(false);
    }
  };

  // Spaces to Inhabit Helpers
  const addSpaceItem = () => {
    if (!newSpaceSlug) return;
    if (spacesItems.some((item) => item.type === newSpaceType && item.slug === newSpaceSlug)) {
      alert("This item is already added to the section.");
      return;
    }
    const updated = [...spacesItems, { type: newSpaceType, slug: newSpaceSlug }];
    setSpacesItems(updated);
    newSpaceItemSave(updated);
  };

  const removeSpaceItem = (index: number) => {
    const updated = spacesItems.filter((_, i) => i !== index);
    setSpacesItems(updated);
    newSpaceItemSave(updated);
  };

  const moveSpaceItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === spacesItems.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...spacesItems];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setSpacesItems(updated);
    newSpaceItemSave(updated);
  };

  const newSpaceItemSave = async (updatedList: any[]) => {
    const jsonStr = JSON.stringify(updatedList);
    const updates: SaveUpdate[] = [
      {
        key: "bohemian_spaces_items",
        value: jsonStr,
        type: "textarea",
        label: "Spaces to Inhabit Items List",
        group: "description"
      }
    ];
    await handleSaveConfig(updates);
  };

  const resolveItemName = (type: "category" | "product", slug: string) => {
    if (type === "category") {
      const cat = categories.find((c) => c.slug === slug);
      return cat ? `Category: ${cat.name}` : `Category: ${slug}`;
    } else {
      const prod = products.find((p) => p.slug === slug);
      return prod ? `Product: ${prod.name}` : `Product: ${slug}`;
    }
  };

  // Manual selection toggle helpers
  const handleToggleBlogSelection = (slug: string) => {
    const updated = selectedBlogs.includes(slug)
      ? selectedBlogs.filter((s) => s !== slug)
      : [...selectedBlogs, slug];
    setSelectedBlogs(updated);
  };

  const handleToggleProductSelection = (slug: string) => {
    const updated = selectedProducts.includes(slug)
      ? selectedProducts.filter((s) => s !== slug)
      : [...selectedProducts, slug];
    setSelectedProducts(updated);
  };

  // Testimonial CRUD operations
  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/admin/cms/testimonials");
      const json = await res.json();
      setTestimonials(json.items || []);
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    }
  };

  const handleSaveTestimonial = async (testimonialData: any) => {
    setSavingTestimonial(true);
    try {
      const res = await fetch("/api/admin/cms/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testimonialData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save testimonial");
      setIsTestimonialModalOpen(false);
      setEditingTestimonial(null);
      await fetchTestimonials();
    } catch (err: any) {
      alert(err.message || "Failed to save testimonial");
    } finally {
      setSavingTestimonial(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/cms/testimonials?id=${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete testimonial");
      await fetchTestimonials();
    } catch (err: any) {
      alert(err.message || "Failed to delete testimonial");
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", `testimonial-avatar-${name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`);
      formData.append("group", "testimonials");
      formData.append("label", `Testimonial Avatar: ${name}`);

      const res = await fetch("/api/admin/cms/site-config", {
        method: "POST",
        body: formData
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to upload image");

      setEditingTestimonial((prev: any) => ({ ...prev, avatar: json.value }));
    } catch (err: any) {
      alert(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Section List items data
  const landingSections = [
    {
      id: "banner",
      name: "1. Hero Banner & Slider",
      type: "Hero Section",
      description: "Manage high-resolution banners, promotional slider settings, and schedule visibility parameters.",
      status: "Active",
      icon: <LayoutGrid className="w-5 h-5 text-[#9f3f29]" />,
      readOnly: false
    },
    {
      id: "archive",
      name: "2. The Curated Archive",
      type: "Category Showcase",
      description: "Position categories dynamically to showcase Textiles, Ceramics, and Wall Art layouts.",
      status: values.bohemian_archive_pos1_slug ? "Configured" : "Default Fallbacks Active",
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      readOnly: false
    },
    {
      id: "spaces",
      name: "3. Spaces to Inhabit",
      type: "Flexible Collections Grid",
      description: `Showcase round cards highlighting room-based categories or specific craft products. (${spacesItems.length} items configured)`,
      status: spacesItems.length > 0 ? "Configured" : "Default Fallbacks Active",
      icon: <Sliders className="w-5 h-5 text-emerald-600" />,
      readOnly: false
    },
    {
      id: "journal",
      name: "4. Journal Highlights",
      type: "Blog Suggestions Carousel",
      description: `Control max slider display limit and select published blog posts manually or load dynamic recent posts. (Limit: ${values.bohemian_journal_limit || "3"} posts)`,
      status: values.bohemian_journal_mode === "manual" ? "Manually Selected" : "Auto (Recent Published)",
      icon: <Bookmark className="w-5 h-5 text-blue-600" />,
      readOnly: false
    },
    {
      id: "harvested",
      name: "5. Freshly Harvested",
      type: "New Arrivals / Selected Products Grid",
      description: "Showcase the latest product catalog additions or pin specific collections manually.",
      status: values.bohemian_freshly_harvested_mode === "manual" ? "Manually Selected" : "Auto (Recent Arrivals)",
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      readOnly: false
    },
    {
      id: "testimonials",
      name: "6. Community Stories",
      type: "Testimonial Reviews Marquee",
      description: "Infinite sliding marquee layout featuring community and expert verified reviews. (Database-Driven CRUD)",
      status: `${testimonials.length} reviews configured`,
      icon: <Eye className="w-5 h-5 text-[#9f3f29]" />,
      readOnly: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Landing Page & CMS</h1>
          <p className="text-sm text-gray-500 mt-1">Manage physical store info, categories listing, and homepage modular sections.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Open Website
          </Link>
        </div>
      </div>

      {message ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm border flex items-center gap-2 ${message.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
            }`}
        >
          <Info className="w-4 h-4 shrink-0" />
          <p>{message.text}</p>
        </div>
      ) : null}

      {/* Primary Tab Navigation */}
      {activeSection === null && (
        <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-2 w-fit">
          <button
            onClick={() => setActiveTab("sections")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "sections"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            Landing Page Sections
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "categories"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            Categories CRUD
          </button>
          <button
            onClick={() => setActiveTab("store")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "store"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            Store Information
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-sm text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-900 mb-4" />
          <p>Syncing CMS details and loading catalogues...</p>
        </div>
      ) : (
        <>
          {/* Landing Page Sections Tab */}
          {activeTab === "sections" && activeSection === null && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Landing Page Section Managers</h3>
                <p className="text-xs text-gray-500 mt-1">Configure layout, sources, and display behaviors for each homepage section.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {landingSections.map((section) => (
                  <div key={section.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl shrink-0 mt-0.5">
                        {section.icon}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{section.name}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                        <span className={`inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${section.readOnly
                            ? "bg-gray-50 border-gray-200 text-gray-600"
                            : section.status.includes("Default")
                              ? "bg-amber-50 border-amber-200 text-amber-800"
                              : "bg-emerald-50 border-emerald-200 text-emerald-800"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${section.readOnly
                              ? "bg-gray-400"
                              : section.status.includes("Default")
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`} />
                          {section.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      {!section.readOnly ? (
                        <button
                          onClick={() => {
                            setActiveSection(section.id);
                            setMessage(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Section
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">Managed by Code</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Hero Banner & Details Editor */}
          {activeSection === "banner" && (
            <div className="space-y-6">
              <button
                onClick={() => setActiveSection(null)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sections List
              </button>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Hero Section Heading Config</h3>
                  <p className="text-sm text-gray-500">Edit the text fields displayed on top of the hero banner placement.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Hero Badge Text</label>
                    <input
                      type="text"
                      value={values.bohemian_hero_badge || ""}
                      onChange={(e) => onChangeValue("bohemian_hero_badge", e.target.value)}
                      placeholder="e.g. TERRA & LOOM PRESENTS"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Hero Headline</label>
                    <input
                      type="text"
                      value={values.bohemian_hero_headline || ""}
                      onChange={(e) => onChangeValue("bohemian_hero_headline", e.target.value)}
                      placeholder="e.g. Embrace the Warmth."
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Hero Description</label>
                    <textarea
                      value={values.bohemian_hero_description || ""}
                      onChange={(e) => onChangeValue("bohemian_hero_description", e.target.value)}
                      placeholder="e.g. Curating the finest bohemian treasures..."
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">CTA Button Label</label>
                    <input
                      type="text"
                      value={values.bohemian_hero_cta1_label || ""}
                      onChange={(e) => onChangeValue("bohemian_hero_cta1_label", e.target.value)}
                      placeholder="e.g. Explore Collection"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">CTA Button URL</label>
                    <input
                      type="text"
                      value={values.bohemian_hero_cta1_url || ""}
                      onChange={(e) => onChangeValue("bohemian_hero_cta1_url", e.target.value)}
                      placeholder="e.g. /shop"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    onClick={async () => {
                      const updates: SaveUpdate[] = [
                        { key: "bohemian_hero_badge", value: values.bohemian_hero_badge || "", type: "text", label: "Hero Badge", group: "hero" },
                        { key: "bohemian_hero_headline", value: values.bohemian_hero_headline || "", type: "text", label: "Hero Headline", group: "hero" },
                        { key: "bohemian_hero_description", value: values.bohemian_hero_description || "", type: "textarea", label: "Hero Description", group: "hero" },
                        { key: "bohemian_hero_cta1_label", value: values.bohemian_hero_cta1_label || "", type: "text", label: "Hero CTA Label", group: "hero" },
                        { key: "bohemian_hero_cta1_url", value: values.bohemian_hero_cta1_url || "", type: "url", label: "Hero CTA URL", group: "hero" },
                      ];
                      await handleSaveConfig(updates);
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Header Details"}
                  </button>
                </div>
              </div>

              {/* Banners listing manager */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <BannersManager />
              </div>
            </div>
          )}

          {/* Section 2: The Curated Archive Editor */}
          {activeSection === "archive" && (
            <div className="space-y-6">
              <button
                onClick={() => setActiveSection(null)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sections List
              </button>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Configure The Curated Archive</h3>
                  <p className="text-sm text-gray-500">Edit titles and select which categories load in each layout card position.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={values.bohemian_archive_title || ""}
                      onChange={(e) => onChangeValue("bohemian_archive_title", e.target.value)}
                      placeholder="e.g. The Curated Archive"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Section Subtitle</label>
                    <input
                      type="text"
                      value={values.bohemian_archive_subtitle || ""}
                      onChange={(e) => onChangeValue("bohemian_archive_subtitle", e.target.value)}
                      placeholder="e.g. Discovery of ancient techniques in modern forms."
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Position 1 Category (Large Left Card)</label>
                    <select
                      value={values.bohemian_archive_pos1_slug || ""}
                      onChange={(e) => onChangeValue("bohemian_archive_pos1_slug", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Position 2 Category (Small Top Right Card)</label>
                    <select
                      value={values.bohemian_archive_pos2_slug || ""}
                      onChange={(e) => onChangeValue("bohemian_archive_pos2_slug", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Position 3 Category (Small Bottom Right Card)</label>
                    <select
                      value={values.bohemian_archive_pos3_slug || ""}
                      onChange={(e) => onChangeValue("bohemian_archive_pos3_slug", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    onClick={async () => {
                      const updates: SaveUpdate[] = [
                        { key: "bohemian_archive_title", value: values.bohemian_archive_title || "", type: "text", label: "Archive Section Title", group: "description" },
                        { key: "bohemian_archive_subtitle", value: values.bohemian_archive_subtitle || "", type: "text", label: "Archive Section Subtitle", group: "description" },
                        { key: "bohemian_archive_pos1_slug", value: values.bohemian_archive_pos1_slug || "", type: "text", label: "Archive Position 1 Category", group: "description" },
                        { key: "bohemian_archive_pos2_slug", value: values.bohemian_archive_pos2_slug || "", type: "text", label: "Archive Position 2 Category", group: "description" },
                        { key: "bohemian_archive_pos3_slug", value: values.bohemian_archive_pos3_slug || "", type: "text", label: "Archive Position 3 Category", group: "description" },
                      ];
                      await handleSaveConfig(updates);
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Section Configuration"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Spaces to Inhabit Editor */}
          {activeSection === "spaces" && (
            <div className="space-y-6">
              <button
                onClick={() => setActiveSection(null)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sections List
              </button>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Configure Spaces to Inhabit</h3>
                  <p className="text-sm text-gray-500">Customize the round showcase cards with any mix of categories or specific products.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={values.bohemian_spaces_title || ""}
                      onChange={(e) => onChangeValue("bohemian_spaces_title", e.target.value)}
                      placeholder="e.g. Spaces to Inhabit"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Section Description</label>
                    <textarea
                      value={values.bohemian_spaces_description || ""}
                      onChange={(e) => onChangeValue("bohemian_spaces_description", e.target.value)}
                      placeholder="e.g. Find harmony in every corner of your sanctuary..."
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    onClick={async () => {
                      const updates: SaveUpdate[] = [
                        { key: "bohemian_spaces_title", value: values.bohemian_spaces_title || "", type: "text", label: "Spaces Title", group: "description" },
                        { key: "bohemian_spaces_description", value: values.bohemian_spaces_description || "", type: "textarea", label: "Spaces Description", group: "description" },
                      ];
                      await handleSaveConfig(updates);
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Texts"}
                  </button>
                </div>
              </div>

              {/* Manage circular card items */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Manage Showcase Items</h3>
                  <p className="text-sm text-gray-500">Add, reorder, or delete the cards shown in this section.</p>
                </div>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {spacesItems.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 font-medium">
                      No custom showcase items configured. Currently using default rooms (Living Room, Bedroom, Balcony, Workspace).
                    </div>
                  ) : (
                    spacesItems.map((item, index) => (
                      <div key={`${item.type}-${item.slug}-${index}`} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {resolveItemName(item.type, item.slug)}
                            </p>
                            <p className="text-xs text-gray-500">Slug: {item.slug}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSpaceItem(index, "up")}
                            disabled={index === 0}
                            className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => moveSpaceItem(index, "down")}
                            disabled={index === spacesItems.length - 1}
                            className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => removeSpaceItem(index)}
                            className="p-1.5 rounded border border-red-200 bg-red-50 hover:bg-red-100/70 ml-2"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-4">
                  <h4 className="text-sm font-bold text-gray-800">Add Item to Grid</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-600">Select Item Type</label>
                      <select
                        value={newSpaceType}
                        onChange={(e) => {
                          setNewSpaceType(e.target.value as any);
                          setNewSpaceSlug("");
                        }}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none"
                      >
                        <option value="category">Category</option>
                        <option value="product">Product</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-600">Choose Item</label>
                      <select
                        value={newSpaceSlug}
                        onChange={(e) => setNewSpaceSlug(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none"
                      >
                        <option value="">-- Select from Catalogue --</option>
                        {newSpaceType === "category" ? (
                          categories.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
                          ))
                        ) : (
                          products.map((p) => (
                            <option key={p.slug} value={p.slug}>{p.name} ({p.slug})</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={addSpaceItem}
                    disabled={!newSpaceSlug}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Append to Section
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Journal Highlights Editor */}
          {activeSection === "journal" && (
            <div className="space-y-6">
              <button
                onClick={() => setActiveSection(null)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sections List
              </button>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Configure Journal Highlights</h3>
                  <p className="text-sm text-gray-500">Edit titles, limit display count, and choose dynamic loading or specific blog selections.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={values.bohemian_journal_title || ""}
                      onChange={(e) => onChangeValue("bohemian_journal_title", e.target.value)}
                      placeholder="Journal Highlights"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="text-sm font-medium text-gray-700">Blog Selection Mode</label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="blog_mode"
                          checked={(values.bohemian_journal_mode || "recent") === "recent"}
                          onChange={() => onChangeValue("bohemian_journal_mode", "recent")}
                          className="w-4 h-4 accent-gray-900"
                        />
                        Auto (Recent Published Entries)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="blog_mode"
                          checked={values.bohemian_journal_mode === "manual"}
                          onChange={() => onChangeValue("bohemian_journal_mode", "manual")}
                          className="w-4 h-4 accent-gray-900"
                        />
                        Manually Select Blog Posts
                      </label>
                    </div>
                  </div>
                </div>

                {values.bohemian_journal_mode === "manual" && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Select Published Blog Posts</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Select the blog posts you want to feature on the homepage.</p>
                    </div>

                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                      {blogs.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">No blog entries found in the database.</div>
                      ) : (
                        blogs.map((post) => (
                          <label key={post.slug} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer bg-white">
                            <input
                              type="checkbox"
                              checked={selectedBlogs.includes(post.slug)}
                              onChange={() => handleToggleBlogSelection(post.slug)}
                              className="mt-1 w-4 h-4 accent-gray-900 rounded"
                            />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{post.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Status: <span className="capitalize font-medium text-emerald-600">{post.status}</span> • Author: {post.author_name || "Unknown"}
                              </p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    onClick={async () => {
                      const limitVal = values.bohemian_journal_mode === "manual" ? String(selectedBlogs.length) : "3";
                      const updates: SaveUpdate[] = [
                        { key: "bohemian_journal_title", value: values.bohemian_journal_title || "", type: "text", label: "Journal Section Title", group: "description" },
                        { key: "bohemian_journal_limit", value: limitVal, type: "number", label: "Journal Section Limit", group: "description" },
                        { key: "bohemian_journal_mode", value: values.bohemian_journal_mode || "recent", type: "text", label: "Journal Section Selection Mode", group: "description" },
                        { key: "bohemian_journal_selected", value: JSON.stringify(selectedBlogs), type: "textarea", label: "Journal Featured Selected Posts", group: "description" },
                      ];
                      await handleSaveConfig(updates);
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Section Configuration"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Freshly Harvested Editor */}
          {activeSection === "harvested" && (
            <div className="space-y-6">
              <button
                onClick={() => setActiveSection(null)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sections List
              </button>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Configure Freshly Harvested</h3>
                  <p className="text-sm text-gray-500">Edit titles and select whether products should load automatically (new arrivals) or be pinned manually.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={values.bohemian_freshly_harvested_title || ""}
                      onChange={(e) => onChangeValue("bohemian_freshly_harvested_title", e.target.value)}
                      placeholder="Freshly Harvested"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Product Selection Mode</label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="product_mode"
                          checked={(values.bohemian_freshly_harvested_mode || "recent") === "recent"}
                          onChange={() => onChangeValue("bohemian_freshly_harvested_mode", "recent")}
                          className="w-4 h-4 accent-gray-900"
                        />
                        Auto (Recent New Arrivals)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="product_mode"
                          checked={values.bohemian_freshly_harvested_mode === "manual"}
                          onChange={() => onChangeValue("bohemian_freshly_harvested_mode", "manual")}
                          className="w-4 h-4 accent-gray-900"
                        />
                        Manually Select Products
                      </label>
                    </div>
                  </div>
                </div>

                {values.bohemian_freshly_harvested_mode === "manual" && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Select Pinned Products</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Check the products you want to feature on the homepage.</p>
                    </div>

                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                      {products.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">No active products found in catalog.</div>
                      ) : (
                        products.map((p) => (
                          <label key={p.slug} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer bg-white">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(p.slug)}
                              onChange={() => handleToggleProductSelection(p.slug)}
                              className="mt-1 w-4 h-4 accent-gray-900 rounded"
                            />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Slug: {p.slug}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    onClick={async () => {
                      const updates: SaveUpdate[] = [
                        { key: "bohemian_freshly_harvested_title", value: values.bohemian_freshly_harvested_title || "", type: "text", label: "Freshly Harvested Title", group: "description" },
                        { key: "bohemian_freshly_harvested_mode", value: values.bohemian_freshly_harvested_mode || "recent", type: "text", label: "Freshly Harvested Mode", group: "description" },
                        { key: "bohemian_freshly_harvested_products", value: JSON.stringify(selectedProducts), type: "textarea", label: "Freshly Harvested Pinned Products", group: "description" },
                      ];
                      await handleSaveConfig(updates);
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Section Configuration"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Community Stories (Testimonials) Editor */}
          {activeSection === "testimonials" && (
            <div className="space-y-6">
              <button
                onClick={() => setActiveSection(null)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sections List
              </button>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Configure Community Stories</h3>
                    <p className="text-sm text-gray-500">Manage the testimonials shown in the horizontal marquee scroll on the home page.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTestimonial({
                        quote: "",
                        name: "",
                        location: "",
                        avatar: "",
                        rating: 5,
                        sort_order: testimonials.length
                      });
                      setIsTestimonialModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all self-start sm:self-center shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Testimonial
                  </button>
                </div>

                {testimonials.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-gray-200 rounded-xl">
                    <Info className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No testimonials configured yet</p>
                    <p className="text-xs text-gray-500 mt-1">Click the button above to create your first community story testimonial.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Avatar</th>
                          <th className="px-6 py-4">Author</th>
                          <th className="px-6 py-4">Rating</th>
                          <th className="px-6 py-4">Sort Order</th>
                          <th className="px-6 py-4">Quote</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {testimonials.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {t.avatar ? (
                                <img
                                  src={t.avatar}
                                  alt={t.name}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                                  N/A
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-bold text-gray-900">{t.name}</p>
                              <p className="text-xs text-gray-500">{t.location}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-0.5">
                                {Array.from({ length: t.rating || 5 }).map((x, i) => (
                                  <Star key={`${i}-${x}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                              {t.sort_order}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-600 line-clamp-2 max-w-[320px] italic">
                                &quot;{t.quote}&quot;
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => {
                                    setEditingTestimonial(t);
                                    setIsTestimonialModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTestimonial(t.id)}
                                  className="text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Testimonial Form Modal/Overlay */}
          {isTestimonialModalOpen && editingTestimonial && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingTestimonial.id ? "Edit Testimonial" : "Add Testimonial"}
                  </h3>
                  <button
                    onClick={() => {
                      setIsTestimonialModalOpen(false);
                      setEditingTestimonial(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 font-semibold"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Author Name</label>
                      <input
                        type="text"
                        value={editingTestimonial.name || ""}
                        onChange={(e) => setEditingTestimonial((prev: any) => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                        placeholder="Elena Thorne"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Author Location</label>
                      <input
                        type="text"
                        value={editingTestimonial.location || ""}
                        onChange={(e) => setEditingTestimonial((prev: any) => ({ ...prev, location: e.target.value }))}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                        placeholder="New York, NY"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Rating (Stars)</label>
                      <select
                        value={editingTestimonial.rating || 5}
                        onChange={(e) => setEditingTestimonial((prev: any) => ({ ...prev, rating: Number(e.target.value) }))}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                      >
                        <option value={5}>5 Stars ★★★★★</option>
                        <option value={4}>4 Stars ★★★★</option>
                        <option value={3}>3 Stars ★★★</option>
                        <option value={2}>2 Stars ★★</option>
                        <option value={1}>1 Star ★</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Sort Order</label>
                      <input
                        type="number"
                        value={editingTestimonial.sort_order || 0}
                        onChange={(e) => setEditingTestimonial((prev: any) => ({ ...prev, sort_order: Number(e.target.value) }))}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Avatar Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingTestimonial.avatar || ""}
                        onChange={(e) => setEditingTestimonial((prev: any) => ({ ...prev, avatar: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer select-none">
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingAvatar ? "Uploading..." : "Upload File"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingAvatar || !editingTestimonial.name}
                          onChange={(e) => handleAvatarFileChange(e, editingTestimonial.name || "temp")}
                        />
                      </label>
                    </div>
                    {!editingTestimonial.name && (
                      <p className="text-[10px] text-amber-600">Please enter the Author Name before uploading an avatar file.</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Review Quote</label>
                    <textarea
                      value={editingTestimonial.quote || ""}
                      onChange={(e) => setEditingTestimonial((prev: any) => ({ ...prev, quote: e.target.value }))}
                      rows={3}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
                      placeholder="The texture of the linen is unlike..."
                      required
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                  <button
                    onClick={() => {
                      setIsTestimonialModalOpen(false);
                      setEditingTestimonial(null);
                    }}
                    className="px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveTestimonial(editingTestimonial)}
                    disabled={savingTestimonial || uploadingAvatar}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {savingTestimonial ? "Saving..." : "Save Testimonial"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && activeSection === null && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <CategoriesManager />
            </div>
          )}

          {/* Store Info Tab */}
          {activeTab === "store" && activeSection === null && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <StoreConfigForm
                fields={storeFields}
                values={values}
                uploadingKey={null}
                onChange={onChangeValue}
                onUpload={async () => { }}
              />
              <div className="flex justify-end border-t border-gray-100 pt-4 mt-6">
                <button
                  onClick={async () => {
                    const updates = storeFields.map((f) => ({
                      key: f.key,
                      value: values[f.key] ?? "",
                      type: f.type as ConfigType,
                      label: f.label,
                      group: f.group,
                    }));
                    await handleSaveConfig(updates);
                  }}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving changes..." : "Save Store Information"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
