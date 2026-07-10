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

type TabId = "sections" | "categories" | "banners" | "store";

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

const THEME_OPTIONS = [
  { value: "classic", label: "Classic" },
  { value: "bohemian", label: "Bohemian" },
  { value: "luxury", label: "Luxury" },
] as const;

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("sections");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [selectedCmsTheme, setSelectedCmsTheme] = useState<string>("classic");
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

  // Local state for Follow Us (Instagram Reels)
  const [reelsData, setReelsData] = useState<Array<{ id: string; title: string; thumbnail: string; url: string }>>([]);

  // Track which section's product/blog selections are being edited
  const [editingSelectionFor, setEditingSelectionFor] = useState<string | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // 1. Fetch site config
      const resConfig = await fetch("/api/admin/cms/site-config", { cache: "no-store" });
      const jsonConfig = await resConfig.json();
      if (!resConfig.ok) throw new Error(jsonConfig.error || "Failed to load config");
      setValues(jsonConfig.map || {});

      // Set the default CMS theme from the active theme in the API response
      const apiTheme = jsonConfig.activeTheme || "classic";
      setSelectedCmsTheme((prev) => prev || apiTheme);

      // Initialize Spaces items from the active theme's config
      const apiKey = (suffix: string) => apiTheme === "classic" ? suffix : `${apiTheme}_${suffix}`;
      const spacesJsonStr = jsonConfig.map?.[apiKey("spaces_items")] || "";
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

      // Initialize Selected Blogs from the active theme's config
      const blogJsonStr = jsonConfig.map?.[apiKey("journal_selected")] || "";
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

      // Initialize Selected Products from the active theme's config
      const productJsonStr = jsonConfig.map?.[apiKey("freshly_harvested_products")] || "";
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

  // Helper: returns the full site_config key for the selected theme
  // Classic uses unprefixed keys from the original seed data (e.g. "hero_badge")
  // Bohemian/Luxury use prefixed keys (e.g. "bohemian_hero_badge")
  const themeKey = (suffix: string) => {
    if (selectedCmsTheme === "classic") return suffix;
    return `${selectedCmsTheme}_${suffix}`;
  };

  // Helper: returns the value for a themed key
  const themeValue = (suffix: string, fallback = "") => values[themeKey(suffix)] ?? fallback;

  // Helper: returns the value for a key without theme prefix (shared/global)
  const globalValue = (key: string, fallback = "") => values[key] ?? fallback;

  // When the selected CMS theme changes, reload the theme-specific local state
  const handleThemeChange = (newTheme: string) => {
    setSelectedCmsTheme(newTheme);

    // Classic uses unprefixed keys, other themes use {theme}_ prefix
    const tk = (suffix: string) => newTheme === "classic" ? suffix : `${newTheme}_${suffix}`;

    // Reload theme-specific local state from values
    const spacesStr = values[tk("spaces_items")] || "";
    if (spacesStr) {
      try { const parsed = JSON.parse(spacesStr); if (Array.isArray(parsed)) setSpacesItems(parsed); else setSpacesItems([]); }
      catch { setSpacesItems([]); }
    } else { setSpacesItems([]); }

    const blogStr = values[tk("journal_selected")] || "";
    if (blogStr) {
      try { const parsed = JSON.parse(blogStr); if (Array.isArray(parsed)) setSelectedBlogs(parsed); else setSelectedBlogs([]); }
      catch { setSelectedBlogs([]); }
    } else { setSelectedBlogs([]); }

    const prodStr = values[tk("freshly_harvested_products")] || "";
    if (prodStr) {
      try { const parsed = JSON.parse(prodStr); if (Array.isArray(parsed)) setSelectedProducts(parsed); else setSelectedProducts([]); }
      catch { setSelectedProducts([]); }
    } else { setSelectedProducts([]); }
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
        key: themeKey("spaces_items"),
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

  // Section List items data — changes based on selected theme
  const landingSections = selectedCmsTheme === "classic"
    ? [
        {
          id: "banner",
          name: "1. Hero Banner & Slider",
          type: "Hero Section",
          description: "Manage hero text, CTA buttons, stats, and background images.",
          preview: `Headline: "${themeValue("hero_headline", "Not set")}" • Badge: "${themeValue("hero_badge", "Not set")}"`,
          status: "Active",
          icon: <LayoutGrid className="w-5 h-5 text-[#9f3f29]" />,
          readOnly: false
        },
        {
          id: "shop-categories",
          name: "2. Shop by Category + Fabric Categories",
          type: "Category Bento + Grid",
          description: "Select which categories appear in the bento showcase and the full fabric grid.",
          preview: `Bento: ${[themeValue("shop_cat_pos1_slug"), themeValue("shop_cat_pos2_slug"), themeValue("shop_cat_pos3_slug")].filter(Boolean).length || "auto (top 3)"} categories selected`,
          status: themeValue("shop_cat_pos1_slug") ? "Custom Selection" : "Auto (top 3 from DB)",
          icon: <Sparkles className="w-5 h-5 text-amber-600" />,
          readOnly: false
        },
        {
          id: "description",
          name: "3. Why Choose Us",
          type: "Description Section",
          description: "Edit the 'Why Choose Us' section headline, description text, feature points, and images.",
          preview: `Headline: "${themeValue("desc_headline", "Not set")}" • Badge: "${themeValue("desc_badge", "Not set")}"`,
          status: "Active",
          icon: <Info className="w-5 h-5 text-blue-600" />,
          readOnly: false
        },
        {
          id: "premium-collection",
          name: "4. Premium Collection",
          type: "Curated Product Bento",
          description: "Showcase featured product bundles or manually select products to display.",
          preview: `Mode: ${themeValue("premium_collection_mode") === "manual" ? "Manual" : "Auto (latest)"}`,
          status: themeValue("premium_collection_mode") === "manual" ? `${selectedProducts.length} products selected` : "Auto (Latest Products)",
          icon: <Heart className="w-5 h-5 text-rose-600" />,
          readOnly: false
        },
        {
          id: "best-sellers",
          name: "5. Best Sellers",
          type: "Featured Products Slider",
          description: "Showcase featured products or manually select best-selling products to display.",
          preview: `Mode: ${themeValue("best_sellers_mode") === "manual" ? "Manual" : "Auto (featured)"}`,
          status: themeValue("best_sellers_mode") === "manual" ? `${selectedProducts.length} products selected` : "Auto (Featured Products)",
          icon: <Eye className="w-5 h-5 text-[#9f3f29]" />,
          readOnly: false
        },
        {
          id: "fabric-guides",
          name: "6. Fabric Guides for Smarter Buying",
          type: "Blog Preview",
          description: "Select blog posts manually or load dynamically from recent published articles.",
          preview: `Mode: ${themeValue("fabric_guides_mode") === "manual" ? "Manual" : "Auto (recent)"}`,
          status: themeValue("fabric_guides_mode") === "manual" ? `${selectedBlogs.length} posts selected` : "Auto (Recent Published)",
          icon: <Bookmark className="w-5 h-5 text-blue-600" />,
          readOnly: false
        },
        {
          id: "follow-us",
          name: "7. Follow Us",
          type: "Instagram Reels",
          description: "Manage Instagram reels/feed shown on the homepage. Add reel URLs, thumbnails, and titles.",
          preview: `${(() => { try { const d = JSON.parse(themeValue("instagram_reels_data", "[]") || "[]"); return Array.isArray(d) ? `${d.length} reels configured` : "No reels"; } catch { return "No reels"; } })()}`,
          status: "Configured via Editor",
          icon: <Heart className="w-5 h-5 text-pink-600" />,
          readOnly: false
        },
        {
          id: "trust",
          name: "8. Trust Badges",
          type: "Feature Icons Grid",
          description: "Hardcoded trust signals (WhatsApp Confirmation, Physical Store, Quality Assured, Easy Returns).",
          status: "Hardcoded",
          icon: <Star className="w-5 h-5 text-green-600" />,
          readOnly: true
        },
        {
          id: "design-dream",
          name: "9. Design Your Dream",
          type: "Inspiration Gallery",
          description: "Hardcoded inspiration images with WhatsApp consultation CTA.",
          status: "Hardcoded",
          icon: <Sparkles className="w-5 h-5 text-amber-600" />,
          readOnly: true
        },
        {
          id: "store",
          name: "10. Store Information",
          type: "Contact & Location",
          description: "Manage store address, hours, phone, email, and Google Maps embed.",
          preview: `Phone: "${themeValue("store_phone", "Not set")}"`,
          status: "Active",
          icon: <Star className="w-5 h-5 text-emerald-600" />,
          readOnly: false
        },
      ]
    : [
      {
        id: "banner",
        name: "1. Hero Banner & Slider",
        type: "Hero Section",
        description: `Manage high-resolution banners, promotional slider settings, and schedule visibility parameters.`,
        preview: `Headline: "${themeValue("hero_headline", "Not set")}"`,
        status: "Active",
        icon: <LayoutGrid className="w-5 h-5 text-[#9f3f29]" />,
        readOnly: false
      },
      {
        id: "archive",
        name: "2. The Curated Archive",
        type: "Category Showcase",
        description: `Position categories dynamically to showcase layouts.`,
        preview: `Title: "${themeValue("archive_title", "Not set")}"`,
        status: themeValue("archive_pos1_slug") ? "Configured" : "Default Fallbacks Active",
        icon: <Sparkles className="w-5 h-5 text-amber-600" />,
        readOnly: false
      },
      {
        id: "spaces",
        name: "3. Spaces to Inhabit",
        type: "Flexible Collections Grid",
        description: `Showcase round cards highlighting room-based categories or specific craft products.`,
        preview: `Title: "${themeValue("spaces_title", "Not set")}" • ${spacesItems.length} items`,
        status: spacesItems.length > 0 ? "Configured" : "Default Fallbacks Active",
        icon: <Sliders className="w-5 h-5 text-emerald-600" />,
        readOnly: false
      },
      {
        id: "journal",
        name: "4. Journal Highlights",
        type: "Blog Suggestions Carousel",
        description: `Control max slider display limit and select published blog posts manually or load dynamic recent posts.`,
        preview: `Title: "${themeValue("journal_title", "Not set")}" • Mode: ${themeValue("journal_mode") === "manual" ? "Manual" : "Auto"}`,
        status: themeValue("journal_mode") === "manual" ? "Manually Selected" : "Auto (Recent Published)",
        icon: <Bookmark className="w-5 h-5 text-blue-600" />,
        readOnly: false
      },
      {
        id: "harvested",
        name: "5. Freshly Harvested",
        type: "New Arrivals / Selected Products Grid",
        description: `Showcase the latest product catalog additions or pin specific collections manually.`,
        preview: `Title: "${themeValue("freshly_harvested_title", "Not set")}" • Mode: ${themeValue("freshly_harvested_mode") === "manual" ? "Manual" : "Auto"}`,
        status: themeValue("freshly_harvested_mode") === "manual" ? "Manually Selected" : "Auto (Recent Arrivals)",
        icon: <Heart className="w-5 h-5 text-rose-600" />,
        readOnly: false
      },
      {
        id: "testimonials",
        name: "6. Community Stories",
        type: "Testimonial Reviews Marquee",
        description: `Infinite sliding marquee layout featuring community and expert verified reviews. (Database-Driven CRUD)`,
        preview: `${testimonials.length} reviews configured`,
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
            onClick={() => setActiveTab("banners")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "banners"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            Banners CRUD
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Landing Page Section Managers</h3>
                    <p className="text-xs text-gray-500 mt-1">Configure layout, sources, and display behaviors for each homepage section.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="cms-theme-select" className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                      Managing:
                    </label>
                    <select
                      id="cms-theme-select"
                      value={selectedCmsTheme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer"
                    >
                      {THEME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
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
                        {section.preview && (
                          <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-50 inline-block px-2 py-0.5 rounded border border-gray-200/60">
                            {section.preview}
                          </p>
                        )}
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
                            // Load section-specific selections into local state
                            if (selectedCmsTheme === "classic") {
                              if (section.id === "premium-collection" || section.id === "best-sellers") {
                                const key = section.id === "premium-collection" ? "premium_collection_products" : "best_sellers_products";
                                const raw = values[key] || "[]";
                                try { const p = JSON.parse(raw); setSelectedProducts(Array.isArray(p) ? p : []); } catch { setSelectedProducts([]); }
                                setEditingSelectionFor(section.id);
                              }
                              if (section.id === "fabric-guides") {
                                const raw = values["fabric_guides_selected"] || "[]";
                                try { const p = JSON.parse(raw); setSelectedBlogs(Array.isArray(p) ? p : []); } catch { setSelectedBlogs([]); }
                                setEditingSelectionFor(section.id);
                              }
                              if (section.id === "follow-us") {
                                const raw = values["instagram_reels_data"] || "[]";
                                try { const p = JSON.parse(raw); setReelsData(Array.isArray(p) ? p : []); } catch { setReelsData([]); }
                              }
                            }
                            // For classic "Store Information", switch to Store tab
                            if (section.id === "store") {
                              setActiveTab("store");
                              setMessage(null);
                              return;
                            }
                            setActiveSection(section.id);
                            setMessage(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          {section.id === "store" ? "Edit in Store Tab" : "Edit Section"}
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
                      value={themeValue("hero_badge")}
                      onChange={(e) => onChangeValue(themeKey("hero_badge"), e.target.value)}
                      placeholder="e.g. TERRA & LOOM PRESENTS"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Hero Headline</label>
                    <input
                      type="text"
                      value={themeValue("hero_headline")}
                      onChange={(e) => onChangeValue(themeKey("hero_headline"), e.target.value)}
                      placeholder="e.g. Embrace the Warmth."
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Hero Description</label>
                    <textarea
                      value={themeValue("hero_description")}
                      onChange={(e) => onChangeValue(themeKey("hero_description"), e.target.value)}
                      placeholder="e.g. Curating the finest bohemian treasures..."
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">CTA Button Label</label>
                    <input
                      type="text"
                      value={themeValue("hero_cta1_label")}
                      onChange={(e) => onChangeValue(themeKey("hero_cta1_label"), e.target.value)}
                      placeholder="e.g. Explore Collection"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">CTA Button URL</label>
                    <input
                      type="text"
                      value={themeValue("hero_cta1_url")}
                      onChange={(e) => onChangeValue(themeKey("hero_cta1_url"), e.target.value)}
                      placeholder="e.g. /shop"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    onClick={async () => {
                      const updates: SaveUpdate[] = [
                        { key: themeKey("hero_badge"), value: themeValue("hero_badge"), type: "text", label: "Hero Badge", group: "hero" },
                        { key: themeKey("hero_headline"), value: themeValue("hero_headline"), type: "text", label: "Hero Headline", group: "hero" },
                        { key: themeKey("hero_description"), value: themeValue("hero_description"), type: "textarea", label: "Hero Description", group: "hero" },
                        { key: themeKey("hero_cta1_label"), value: themeValue("hero_cta1_label"), type: "text", label: "Hero CTA Label", group: "hero" },
                        { key: themeKey("hero_cta1_url"), value: themeValue("hero_cta1_url"), type: "url", label: "Hero CTA URL", group: "hero" },
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

          {/* Classic: Why Choose Us Description Editor */}
          {activeSection === "description" && (
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
                  <h3 className="text-lg font-bold text-gray-900">Why Choose Us — Section Editor</h3>
                  <p className="text-sm text-gray-500">Edit the headline, description text, feature points, and images for the classic theme's Why Choose Us section.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Badge Text</label>
                    <input
                      type="text"
                      value={themeValue("desc_badge")}
                      onChange={(e) => onChangeValue(themeKey("desc_badge"), e.target.value)}
                      placeholder="Why Choose Us"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Headline</label>
                    <input
                      type="text"
                      value={themeValue("desc_headline")}
                      onChange={(e) => onChangeValue(themeKey("desc_headline"), e.target.value)}
                      placeholder="Crafting Dreams,"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Headline Accent</label>
                    <input
                      type="text"
                      value={themeValue("desc_headline_accent")}
                      onChange={(e) => onChangeValue(themeKey("desc_headline_accent"), e.target.value)}
                      placeholder="One Fabric at a Time"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Paragraph</label>
                    <textarea
                      value={themeValue("desc_paragraph")}
                      onChange={(e) => onChangeValue(themeKey("desc_paragraph"), e.target.value)}
                      placeholder="At Shree Hari Cutpiece..."
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Feature Point 1 — Title</label>
                    <input
                      type="text"
                      value={themeValue("desc_point1_title")}
                      onChange={(e) => onChangeValue(themeKey("desc_point1_title"), e.target.value)}
                      placeholder="Premium Quality"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Feature Point 1 — Text</label>
                    <input
                      type="text"
                      value={themeValue("desc_point1_text")}
                      onChange={(e) => onChangeValue(themeKey("desc_point1_text"), e.target.value)}
                      placeholder="Sourced from trusted manufacturers"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Feature Point 2 — Title</label>
                    <input
                      type="text"
                      value={themeValue("desc_point2_title")}
                      onChange={(e) => onChangeValue(themeKey("desc_point2_title"), e.target.value)}
                      placeholder="Sold Per Meter"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Feature Point 2 — Text</label>
                    <input
                      type="text"
                      value={themeValue("desc_point2_text")}
                      onChange={(e) => onChangeValue(themeKey("desc_point2_text"), e.target.value)}
                      placeholder="Buy exactly what you need"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Feature Point 3 — Title</label>
                    <input
                      type="text"
                      value={themeValue("desc_point3_title")}
                      onChange={(e) => onChangeValue(themeKey("desc_point3_title"), e.target.value)}
                      placeholder="Design Freedom"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Feature Point 3 — Text</label>
                    <input
                      type="text"
                      value={themeValue("desc_point3_text")}
                      onChange={(e) => onChangeValue(themeKey("desc_point3_text"), e.target.value)}
                      placeholder="Create outfits that are uniquely yours"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Stat Number</label>
                    <input
                      type="text"
                      value={themeValue("desc_stat_number")}
                      onChange={(e) => onChangeValue(themeKey("desc_stat_number"), e.target.value)}
                      placeholder="10+"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Stat Label</label>
                    <input
                      type="text"
                      value={themeValue("desc_stat_label")}
                      onChange={(e) => onChangeValue(themeKey("desc_stat_label"), e.target.value)}
                      placeholder="Years of Excellence"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    onClick={async () => {
                      const updates: SaveUpdate[] = [
                        { key: themeKey("desc_badge"), value: themeValue("desc_badge"), type: "text", label: "Why Choose Us Badge", group: "description" },
                        { key: themeKey("desc_headline"), value: themeValue("desc_headline"), type: "text", label: "Why Choose Us Headline", group: "description" },
                        { key: themeKey("desc_headline_accent"), value: themeValue("desc_headline_accent"), type: "text", label: "Why Choose Us Headline Accent", group: "description" },
                        { key: themeKey("desc_paragraph"), value: themeValue("desc_paragraph"), type: "textarea", label: "Why Choose Us Paragraph", group: "description" },
                        { key: themeKey("desc_point1_title"), value: themeValue("desc_point1_title"), type: "text", label: "Feature Point 1 Title", group: "description" },
                        { key: themeKey("desc_point1_text"), value: themeValue("desc_point1_text"), type: "text", label: "Feature Point 1 Text", group: "description" },
                        { key: themeKey("desc_point2_title"), value: themeValue("desc_point2_title"), type: "text", label: "Feature Point 2 Title", group: "description" },
                        { key: themeKey("desc_point2_text"), value: themeValue("desc_point2_text"), type: "text", label: "Feature Point 2 Text", group: "description" },
                        { key: themeKey("desc_point3_title"), value: themeValue("desc_point3_title"), type: "text", label: "Feature Point 3 Title", group: "description" },
                        { key: themeKey("desc_point3_text"), value: themeValue("desc_point3_text"), type: "text", label: "Feature Point 3 Text", group: "description" },
                        { key: themeKey("desc_stat_number"), value: themeValue("desc_stat_number"), type: "text", label: "Stat Number", group: "description" },
                        { key: themeKey("desc_stat_label"), value: themeValue("desc_stat_label"), type: "text", label: "Stat Label", group: "description" },
                      ];
                      await handleSaveConfig(updates);
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Why Choose Us"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Classic: Shop by Category + Fabric Categories Editor */}
          {activeSection === "shop-categories" && (
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
                  <h3 className="text-lg font-bold text-gray-900">Shop by Category + Fabric Categories</h3>
                  <p className="text-sm text-gray-500">Select which categories appear in the bento showcase (3 slots) and the full fabric grid below. Leave empty to auto-pick from DB.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Bento Slot 1 (Large Card)</label>
                    <select value={themeValue("shop_cat_pos1_slug")} onChange={(e) => onChangeValue("shop_cat_pos1_slug", e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none">
                      <option value="">-- Auto (top category) --</option>
                      {categories.map((c: any) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Bento Slot 2 (Small Right Top)</label>
                    <select value={themeValue("shop_cat_pos2_slug")} onChange={(e) => onChangeValue("shop_cat_pos2_slug", e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none">
                      <option value="">-- Auto (2nd category) --</option>
                      {categories.map((c: any) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Bento Slot 3 (Small Right Bottom)</label>
                    <select value={themeValue("shop_cat_pos3_slug")} onChange={(e) => onChangeValue("shop_cat_pos3_slug", e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none">
                      <option value="">-- Auto (3rd category) --</option>
                      {categories.map((c: any) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button onClick={async () => { await handleSaveConfig([{ key: "shop_cat_pos1_slug", value: themeValue("shop_cat_pos1_slug"), type: "text", label: "Bento Slot 1 Category", group: "description" }, { key: "shop_cat_pos2_slug", value: themeValue("shop_cat_pos2_slug"), type: "text", label: "Bento Slot 2 Category", group: "description" }, { key: "shop_cat_pos3_slug", value: themeValue("shop_cat_pos3_slug"), type: "text", label: "Bento Slot 3 Category", group: "description" }]); }} disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                    {saving ? "Saving..." : "Save Category Selection"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Classic: Premium Collection Editor */}
          {activeSection === "premium-collection" && (
            <div className="space-y-6">
              <button onClick={() => setActiveSection(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Sections List</button>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Premium Collection</h3>
                  <p className="text-sm text-gray-500">Choose to show latest products automatically or manually select specific products to feature.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Product Selection Mode</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input type="radio" name="premium_mode" checked={(themeValue("premium_collection_mode", "auto")) === "auto"} onChange={() => onChangeValue("premium_collection_mode", "auto")} className="w-4 h-4 accent-gray-900" /> Auto (Latest Products)
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input type="radio" name="premium_mode" checked={themeValue("premium_collection_mode") === "manual"} onChange={() => onChangeValue("premium_collection_mode", "manual")} className="w-4 h-4 accent-gray-900" /> Manually Select Products
                    </label>
                  </div>
                </div>
                {themeValue("premium_collection_mode") === "manual" && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Select Products</h4>
                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                      {products.length === 0 ? <div className="p-6 text-center text-sm text-gray-500">No products found.</div> : products.map((p: any) => (
                        <label key={p.slug} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer bg-white">
                          <input type="checkbox" checked={selectedProducts.includes(p.slug)} onChange={() => { const u = selectedProducts.includes(p.slug) ? selectedProducts.filter((s: string) => s !== p.slug) : [...selectedProducts, p.slug]; setSelectedProducts(u); }} className="mt-1 w-4 h-4 accent-gray-900 rounded" />
                          <div><p className="text-sm font-bold text-gray-900">{p.name}</p><p className="text-xs text-gray-500">{p.slug}</p></div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button onClick={async () => { await handleSaveConfig([{ key: "premium_collection_mode", value: themeValue("premium_collection_mode", "auto"), type: "text", label: "Premium Collection Mode", group: "description" }, { key: "premium_collection_products", value: JSON.stringify(selectedProducts), type: "textarea", label: "Premium Collection Products (JSON)", group: "description" }]); }} disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                    {saving ? "Saving..." : "Save Premium Collection"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Classic: Best Sellers Editor */}
          {activeSection === "best-sellers" && (
            <div className="space-y-6">
              <button onClick={() => setActiveSection(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Sections List</button>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Best Sellers</h3>
                  <p className="text-sm text-gray-500">Show featured products automatically or manually pick best-selling products.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Product Selection Mode</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input type="radio" name="bestsellers_mode" checked={(themeValue("best_sellers_mode", "auto")) === "auto"} onChange={() => onChangeValue("best_sellers_mode", "auto")} className="w-4 h-4 accent-gray-900" /> Auto (Featured Products)
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input type="radio" name="bestsellers_mode" checked={themeValue("best_sellers_mode") === "manual"} onChange={() => onChangeValue("best_sellers_mode", "manual")} className="w-4 h-4 accent-gray-900" /> Manually Select Products
                    </label>
                  </div>
                </div>
                {themeValue("best_sellers_mode") === "manual" && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Select Products</h4>
                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                      {products.length === 0 ? <div className="p-6 text-center text-sm text-gray-500">No products found.</div> : products.map((p: any) => (
                        <label key={p.slug} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer bg-white">
                          <input type="checkbox" checked={selectedProducts.includes(p.slug)} onChange={() => { const u = selectedProducts.includes(p.slug) ? selectedProducts.filter((s: string) => s !== p.slug) : [...selectedProducts, p.slug]; setSelectedProducts(u); }} className="mt-1 w-4 h-4 accent-gray-900 rounded" />
                          <div><p className="text-sm font-bold text-gray-900">{p.name}</p><p className="text-xs text-gray-500">{p.slug}</p></div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button onClick={async () => { await handleSaveConfig([{ key: "best_sellers_mode", value: themeValue("best_sellers_mode", "auto"), type: "text", label: "Best Sellers Mode", group: "description" }, { key: "best_sellers_products", value: JSON.stringify(selectedProducts), type: "textarea", label: "Best Sellers Products (JSON)", group: "description" }]); }} disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                    {saving ? "Saving..." : "Save Best Sellers"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Classic: Fabric Guides for Smarter Buying Editor */}
          {activeSection === "fabric-guides" && (
            <div className="space-y-6">
              <button onClick={() => setActiveSection(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Sections List</button>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Fabric Guides for Smarter Buying</h3>
                  <p className="text-sm text-gray-500">Choose to show recent blog posts automatically or manually select specific guides.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Blog Selection Mode</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input type="radio" name="guides_mode" checked={(themeValue("fabric_guides_mode", "auto")) === "auto"} onChange={() => onChangeValue("fabric_guides_mode", "auto")} className="w-4 h-4 accent-gray-900" /> Auto (Recent Published Posts)
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input type="radio" name="guides_mode" checked={themeValue("fabric_guides_mode") === "manual"} onChange={() => onChangeValue("fabric_guides_mode", "manual")} className="w-4 h-4 accent-gray-900" /> Manually Select Blog Posts
                    </label>
                  </div>
                </div>
                {themeValue("fabric_guides_mode") === "manual" && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Select Blog Posts</h4>
                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                      {blogs.length === 0 ? <div className="p-6 text-center text-sm text-gray-500">No blog posts found.</div> : blogs.map((post: any) => (
                        <label key={post.slug} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer bg-white">
                          <input type="checkbox" checked={selectedBlogs.includes(post.slug)} onChange={() => handleToggleBlogSelection(post.slug)} className="mt-1 w-4 h-4 accent-gray-900 rounded" />
                          <div><p className="text-sm font-bold text-gray-900">{post.title}</p><p className="text-xs text-gray-500">{post.slug}</p></div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button onClick={async () => { await handleSaveConfig([{ key: "fabric_guides_mode", value: themeValue("fabric_guides_mode", "auto"), type: "text", label: "Fabric Guides Mode", group: "description" }, { key: "fabric_guides_selected", value: JSON.stringify(selectedBlogs), type: "textarea", label: "Fabric Guides Selected Posts (JSON)", group: "description" }]); }} disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                    {saving ? "Saving..." : "Save Fabric Guides"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Classic: Follow Us (Instagram Reels) Editor */}
          {activeSection === "follow-us" && (
            <div className="space-y-6">
              <button onClick={() => setActiveSection(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Sections List</button>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Follow Us — Instagram Reels</h3>
                    <p className="text-sm text-gray-500">Manage the Instagram reels/feed displayed on the homepage. Add, remove, or reorder reels.</p>
                  </div>
                  <button onClick={() => setReelsData([...reelsData, { id: `reel-${Date.now()}`, title: "", thumbnail: "", url: "" }])} className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                    <Plus className="w-4 h-4" /> Add Reel
                  </button>
                </div>
                {reelsData.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-500">No reels configured. Click "Add Reel" to add Instagram content.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reelsData.map((reel, idx) => (
                      <div key={reel.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Reel #{idx + 1}</span>
                          <button onClick={() => setReelsData(reelsData.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-600">Title</label>
                            <input type="text" value={reel.title} onChange={(e) => { const d = [...reelsData]; d[idx] = { ...d[idx], title: e.target.value }; setReelsData(d); }} className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none" placeholder="Fabric Showcase" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-600">Thumbnail URL</label>
                            <input type="text" value={reel.thumbnail} onChange={(e) => { const d = [...reelsData]; d[idx] = { ...d[idx], thumbnail: e.target.value }; setReelsData(d); }} className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none" placeholder="https://images.pexels.com/..." />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-600">Reel URL</label>
                            <input type="text" value={reel.url} onChange={(e) => { const d = [...reelsData]; d[idx] = { ...d[idx], url: e.target.value }; setReelsData(d); }} className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none" placeholder="https://instagram.com/..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button onClick={async () => { await handleSaveConfig([{ key: "instagram_reels_data", value: JSON.stringify(reelsData), type: "textarea", label: "Instagram Reels Data (JSON)", group: "description" }]); }} disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                    {saving ? "Saving..." : "Save Reels"}
                  </button>
                </div>
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
                      value={themeValue("archive_title")}
                      onChange={(e) => onChangeValue(themeKey("archive_title"), e.target.value)}
                      placeholder="e.g. The Curated Archive"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Section Subtitle</label>
                    <input
                      type="text"
                      value={themeValue("archive_subtitle")}
                      onChange={(e) => onChangeValue(themeKey("archive_subtitle"), e.target.value)}
                      placeholder="e.g. Discovery of ancient techniques in modern forms."
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Position 1 Category (Large Left Card)</label>
                    <select
                      value={themeValue("archive_pos1_slug")}
                      onChange={(e) => onChangeValue(themeKey("archive_pos1_slug"), e.target.value)}
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
                      value={themeValue("archive_pos2_slug")}
                      onChange={(e) => onChangeValue(themeKey("archive_pos2_slug"), e.target.value)}
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
                      value={themeValue("archive_pos3_slug")}
                      onChange={(e) => onChangeValue(themeKey("archive_pos3_slug"), e.target.value)}
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
                        { key: themeKey("archive_title"), value: themeValue("archive_title"), type: "text", label: "Archive Section Title", group: "description" },
                        { key: themeKey("archive_subtitle"), value: themeValue("archive_subtitle"), type: "text", label: "Archive Section Subtitle", group: "description" },
                        { key: themeKey("archive_pos1_slug"), value: themeValue("archive_pos1_slug"), type: "text", label: "Archive Position 1 Category", group: "description" },
                        { key: themeKey("archive_pos2_slug"), value: themeValue("archive_pos2_slug"), type: "text", label: "Archive Position 2 Category", group: "description" },
                        { key: themeKey("archive_pos3_slug"), value: themeValue("archive_pos3_slug"), type: "text", label: "Archive Position 3 Category", group: "description" },
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
                      value={themeValue("spaces_title")}
                      onChange={(e) => onChangeValue(themeKey("spaces_title"), e.target.value)}
                      placeholder="e.g. Spaces to Inhabit"
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Section Description</label>
                    <textarea
                      value={themeValue("spaces_description")}
                      onChange={(e) => onChangeValue(themeKey("spaces_description"), e.target.value)}
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
                        { key: themeKey("spaces_title"), value: themeValue("spaces_title"), type: "text", label: "Spaces Title", group: "description" },
                        { key: themeKey("spaces_description"), value: themeValue("spaces_description"), type: "textarea", label: "Spaces Description", group: "description" },
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
                      value={themeValue("journal_title")}
                      onChange={(e) => onChangeValue(themeKey("journal_title"), e.target.value)}
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
                          checked={(themeValue("journal_mode", "recent")) === "recent"}
                          onChange={() => onChangeValue(themeKey("journal_mode"), "recent")}
                          className="w-4 h-4 accent-gray-900"
                        />
                        Auto (Recent Published Entries)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="blog_mode"
                          checked={themeValue("journal_mode") === "manual"}
                          onChange={() => onChangeValue(themeKey("journal_mode"), "manual")}
                          className="w-4 h-4 accent-gray-900"
                        />
                        Manually Select Blog Posts
                      </label>
                    </div>
                  </div>
                </div>

                {themeValue("journal_mode") === "manual" && (
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
                      const limitVal = themeValue("journal_mode") === "manual" ? String(selectedBlogs.length) : "3";
                      const updates: SaveUpdate[] = [
                        { key: themeKey("journal_title"), value: themeValue("journal_title"), type: "text", label: "Journal Section Title", group: "description" },
                        { key: themeKey("journal_limit"), value: limitVal, type: "number", label: "Journal Section Limit", group: "description" },
                        { key: themeKey("journal_mode"), value: themeValue("journal_mode", "recent"), type: "text", label: "Journal Section Selection Mode", group: "description" },
                        { key: themeKey("journal_selected"), value: JSON.stringify(selectedBlogs), type: "textarea", label: "Journal Featured Selected Posts", group: "description" },
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
                      value={themeValue("freshly_harvested_title")}
                      onChange={(e) => onChangeValue(themeKey("freshly_harvested_title"), e.target.value)}
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
                          checked={(themeValue("freshly_harvested_mode", "recent")) === "recent"}
                          onChange={() => onChangeValue(themeKey("freshly_harvested_mode"), "recent")}
                          className="w-4 h-4 accent-gray-900"
                        />
                        Auto (Recent New Arrivals)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="product_mode"
                          checked={themeValue("freshly_harvested_mode") === "manual"}
                          onChange={() => onChangeValue(themeKey("freshly_harvested_mode"), "manual")}
                          className="w-4 h-4 accent-gray-900"
                        />
                        Manually Select Products
                      </label>
                    </div>
                  </div>
                </div>

                {themeValue("freshly_harvested_mode") === "manual" && (
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
                        { key: themeKey("freshly_harvested_title"), value: themeValue("freshly_harvested_title"), type: "text", label: "Freshly Harvested Title", group: "description" },
                        { key: themeKey("freshly_harvested_mode"), value: themeValue("freshly_harvested_mode", "recent"), type: "text", label: "Freshly Harvested Mode", group: "description" },
                        { key: themeKey("freshly_harvested_products"), value: JSON.stringify(selectedProducts), type: "textarea", label: "Freshly Harvested Pinned Products", group: "description" },
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

          {/* Banners Tab */}
          {activeTab === "banners" && activeSection === null && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <BannersManager />
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
