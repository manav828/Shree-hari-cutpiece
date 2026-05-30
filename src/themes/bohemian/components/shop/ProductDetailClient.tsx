/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Check,
	ChevronRight,
	Leaf,
	Minus,
	PackageCheck,
	Plus,
	ShieldCheck,
	Share2,
	Sparkles,
	Star,
} from "lucide-react";
import Navbar from "@/themes/bohemian/components/layout/Navbar";
import Footer from "@/themes/bohemian/components/layout/Footer";
import CartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { getWhatsAppUrl } from "@/lib/brand";
import { trackViewItem, trackWhatsAppClick } from "@/lib/tracking";
import { bohemianBodyFont, bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";

const reviewsData = [
	{
		id: 1,
		name: "Priya Sharma",
		rating: 5,
		date: "2 weeks ago",
		title: "Premium Weight & Texture",
		comment:
			"The texture is simply divine. It has a weight to it that feels very premium. Exactly what I was looking for to complete my master bedroom update.",
		verified: true,
	},
	{
		id: 2,
		name: "David Kapoor",
		rating: 5,
		date: "1 month ago",
		title: "The Perfect Terracotta Hue",
		comment:
			"Finally found the perfect terracotta hue. It ties my entire reading nook together. It is soft yet durable, and the handmade quality is evident in the weave.",
		verified: true,
	},
	{
		id: 3,
		name: "Ananya Rao",
		rating: 5,
		date: "1 month ago",
		title: "Beautiful Craftsmanship",
		comment:
			"The level of detail is amazing. You can tell this was not mass-produced. Shipping was faster than expected and the packaging was completely plastic-free.",
		verified: true,
	},
];

const SOCIAL_PROOF_IMAGES = [
	"https://lh3.googleusercontent.com/aida/ADBb0uhvI4FQAELyMd-G76z5ng0GbHlvE1urtb0u4phNLg0JTwoTOHasWot2avroYFXXBHvW0KdJ6BTr81DfmWVxTcs285UMpWpj0NM9FDoA5kc5bVEL2w85SUvqTOiwYejZQLAildPUwAYNN5Y7JCG-pbIFc03p1k5EROoiyeSB2GboOte_DsWmOriVzCU8rVmzBNAYW_A2tMHsqyG4Bd1GeVTSOPUMKv2js0xosOXAcluTT2fd13d1EifFVV29N-uY61i89QW_bjJInQ",
	"https://lh3.googleusercontent.com/aida/ADBb0ujPZjPN5x_bEI5rY63GI9q5EwLK1q6tCkba-WnnRazuAXz2JWrFSPCnTEUyEUV8poi7MsOQCgo3lsg6H2Xp-56Xm5hfUzKTlZIF-vcL8HaUfj03Jhd2yvU1KapR-ZPHmmvJBT7fqP1-jSO9BaC1t11yXPV5nrkSpyB6fR5M-StfX-DcE8TILPNEprfS_P8X8THnBhtlLq_G60l85AyfjgJ-JOap5bYUZDXACRr_23FGz4qVc-6_XEHrH99_MtSmt354p53u2Q_NvQ",
	"https://lh3.googleusercontent.com/aida-public/AB6AXuDUIo9my-oFVkdGRNfVaGJbRdloyGATA7l9qeAtmnMosYtf7AbeKUYPW21XRdkRjCwhXBwHfa0RdVCJ4ZPGUKiPyPikbGnrDJ2bpPZoAwVQw21GIz4-HNswOEZ9pcdOqayO9H7TO-1Y4B4uyuV6MHeb63EklhPvCVa97TTY2YiIaHpDMUTO8SomKyY-bxTCeqZteDp5WY7aqx4EfnFXvvJ8bFsVk6JTk-_XwizN8j9GQRt6kNMpkylc2uxI0OIFvX_3ZU7d3IpmucU",
	"https://lh3.googleusercontent.com/aida-public/AB6AXuAojYohP2NSOxANC-uay4zrBq9I1flPNnyGa3QMUwhLKo7B22ZgUJpV2wsqP_OPjSSOdxojdRS_6VS3YgkytgsCHgVN8TyG4hIjhXuh9GeCULS6xCTL8e6se6-KRCE3wH5qUeegubc1XRjq0cnX8L6GvZ_nKVAgHWVNPWlpNb7GO1MOOXteDtYdCz0-NFwRnCaSc4VB4DmluxSyPoFa5mF-u8fOMD6FKcOiKxyTtfeDxhNYu1X7hm1X-AklF7Ll8_zVSA3KCGljHTM",
	"https://lh3.googleusercontent.com/aida-public/AB6AXuB0xcef04zIgK5pkjZXtm6FECqWhQ0fcbv_jlAMSYBfAAu2j5YkAjtDm2Kl3F8rC19sMXlFjjZB9pJO6bcZkCUINdPm68jr-RdfJQkVn2p23u9QpO3-6E6w6hvHPnbEDfl11qO9YMceYZDOF5CGQBmWWAWLNXMzFBFkzHJqe4JzESpSceuUgXbrhr6GxlHTxiJ769x-iV781K8eH9etpjlwfqVDIQC9kel-CcDq0g25K-MNWlgfD1WckMP3a3TA3Ci8Oug6KKK3ato",
];

const LIFESTYLE_BANNER_IMAGE =
	"https://lh3.googleusercontent.com/aida/ADBb0ui8nOrpG-V9m3I3jbTfJgEmLvjFr4FEh1YoSy3xbocip_LNebo7W6YJ7CmPJZh2Jy_8vJKn5-djR5kuNbr2-dlMgZoDTyCRI_36ImK6ZiqbrhWArIbthgSgShP2RaP2Tb8oaNeWS2QKQWWyv9Mkqs13JmWXhdqUIxN3bPvTgKxTIDy5H9uNQwjmBh97xj8bm1HPtuDOhaL6KE89S9wIBsiQIXrcXQCZJW8tehJanziJYuNDMwsGAVAADbOryAYQPH_SVQIo-Ew66A";


type RelatedProductCard = {
	id: string;
	name: string;
	slug: string;
	price: number;
	originalPrice: number;
	unit: string;
	image: string;
	fabricType: string;
};

interface ProductDetailClientProps {
	slug: string;
}

function normalizeSpecKey(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getInstagramEmbedUrl(url: string): string {
	if (!url) return "";
	try {
		const cleanUrl = url.split("?")[0].replace(/\/+$/, "");
		return `${cleanUrl}/embed/`;
	} catch (e) {
		return url;
	}
}

function mapRelatedProducts(products: any[]): RelatedProductCard[] {
	return products.map((product: any) => {
		const variants = Array.isArray(product.product_variants) ? product.product_variants : [];
		const defaultVariant = variants.find((variant: any) => variant.is_default) || variants[0];
		const image =
			defaultVariant?.variant_images?.find((img: any) => img.is_primary)?.image_url
			|| defaultVariant?.variant_images?.[0]?.image_url
			|| "";

		return {
			id: product.id,
			name: product.name,
			slug: product.slug,
			price: defaultVariant?.price || 0,
			originalPrice: defaultVariant?.original_price || defaultVariant?.price || 0,
			unit: product.sell_mode === "meter" ? "meter" : "pc",
			image,
			fabricType: product.fabric || "Premium Fabric",
		} satisfies RelatedProductCard;
	});
}

function mergeUniqueRelated(base: RelatedProductCard[], incoming: RelatedProductCard[]): RelatedProductCard[] {
	const seenIds = new Set(base.map((item) => item.id));
	const merged = [...base];

	incoming.forEach((item) => {
		if (!seenIds.has(item.id)) {
			seenIds.add(item.id);
			merged.push(item);
		}
	});

	return merged;
}

function extractReviewInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function getMediaLabel(index: number, type?: string): string {
	if (type === "video") return "Motion Preview";
	const labels = ["Fabric Hero", "Texture Detail", "Drape Look", "Styled Space", "Craft Detail"];
	return labels[index] || `Gallery View ${index + 1}`;
}

const DUMMY_GALLERY_IMAGES = [
	"https://lh3.googleusercontent.com/aida-public/AB6AXuDUIo9my-oFVkdGRNfVaGJbRdloyGATA7l9qeAtmnMosYtf7AbeKUYPW21XRdkRjCwhXBwHfa0RdVCJ4ZPGUKiPyPikbGnrDJ2bpPZoAwVQw21GIz4-HNswOEZ9pcdOqayO9H7TO-1Y4B4uyuV6MHeb63EklhPvCVa97TTY2YiIaHpDMUTO8SomKyY-bxTCeqZteDp5WY7aqx4EfnFXvvJ8bFsVk6JTk-_XwizN8j9GQRt6kNMpkylc2uxI0OIFvX_3ZU7d3IpmucU",
	"https://lh3.googleusercontent.com/aida-public/AB6AXuB0xcef04zIgK5pkjZXtm6FECqWhQ0fcbv_jlAMSYBfAAu2j5YkAjtDm2Kl3F8rC19sMXlFjjZB9pJO6bcZkCUINdPm68jr-RdfJQkVn2p23u9QpO3-6E6w6hvHPnbEDfl11qO9YMceYZDOF5CGQBmWWAWLNXMzFBFkzHJqe4JzESpSceuUgXbrhr6GxlHTxiJ769x-iV781K8eH9etpjlwfqVDIQC9kel-CcDq0g25K-MNWlgfD1WckMP3a3TA3Ci8Oug6KKK3ato",
	"https://lh3.googleusercontent.com/aida-public/AB6AXuAojYohP2NSOxANC-uay4zrBq9I1flPNnyGa3QMUwhLKo7B22ZgUJpV2wsqP_OPjSSOdxojdRS_6VS3YgkytgsCHgVN8TyG4hIjhXuh9GeCULS6xCTL8e6se6-KRCE3wH5qUeegubc1XRjq0cnX8L6GvZ_nKVAgHWVNPWlpNb7GO1MOOXteDtYdCz0-NFwRnCaSc4VB4DmluxSyPoFa5mF-u8fOMD6FKcOiKxyTtfeDxhNYu1X7hm1X-AklF7Ll8_zVSA3KCGljHTM",
];

const DUMMY_RELATED_PRODUCTS: RelatedProductCard[] = [
	{
		id: "dummy-related-vase",
		name: "Earthen Table Vase",
		slug: "earthen-table-vase",
		price: 1450,
		originalPrice: 1890,
		unit: "piece",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1kptc02QUmb8RrVGj96mZDnZ-ssBeYlTcKBTcirR48prjBIBjA2qZlRhf04Vt5CViwOZNhksngb9jly8L62I4GgXskgWDoxL5F2mARqkk0G0hW7UNBlLM9sCzpAna7CkyTV0fJ9bP-T_pQJrSpjw0--YHebUwtfzc8s-Vw2F-nDv8gqHCh8FZjdrZGXdBfZCKKRmxLCcgduAZL4Oqk2cV8OseX1Cg8xTRnhguLvb-R1_XWLYUHKdalR2bkkwurNqHqLibUEy6jDo",
		fabricType: "Decor",
	},
	{
		id: "dummy-related-candle",
		name: "Dipped Taper Set",
		slug: "dipped-taper-set",
		price: 980,
		originalPrice: 1250,
		unit: "piece",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2pwcMOxCpHeASZ3_mDEzHijusCvyT12eHBeJv_Fl0mM4IFzD4_uZtt_we_Pq_N1V8A98u6xn3G2Mu0yeuscGl53jthLhXG0771r9mpQxYt1OVxXu9JWXbbNgZt0ttMQ9L291n4v0WFXpBkRMdh0MPwDlHZ-_cKCbfI159DZesPMZLaYrHXgqlzV9Z0kFUNzYVxquqFZ6JjcOCV5zSLjulpMmODwLxDtRJ0cumKxjibWfh7XqGozlRWpiLZrNatvOXUlmhiMCLJOg",
		fabricType: "Ambient",
	},
	{
		id: "dummy-related-linen",
		name: "Hand-Dyed Linen Pillow",
		slug: "hand-dyed-linen-pillow",
		price: 1720,
		originalPrice: 2100,
		unit: "piece",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-Jsomm42UXqDy1bSsx82U3XFN7n3TNobf-Z8wgrQ5yfxmqdH1imOazthJtF4HJgR8bkOzpAIZXxR4i-OK54n2PNEpRGOcOoAtZ-AV9VVuqMEgKf3E291N8XsljdxgWaqNo0v2QVbSCfwfbaaP0BceZuCkCxJE44FnYu7rTKUpNKhYlKKRBl3HEWzGKhSgrkdDi-yQ6IM3Alhop80JyXEJiz7ucoRsJjoz37ryqy1hvWJOidSnMQLw3IyuZ9Xp-pkvOJy5JEtZiAU",
		fabricType: "Textile",
	},
	{
		id: "dummy-related-tray",
		name: "White Oak Catch-all",
		slug: "white-oak-catch-all",
		price: 890,
		originalPrice: 1100,
		unit: "piece",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7l2GeMCcg8wcDB3-fa-1P5H7ApGgGOYhO9wVXUqB-A_gHIaik6qIMKJfDr_6OGz3Xhl4GOB-LujNfShKkCNsmU1Vf9H7TnTgeju9ciWt9GNt7IjS-yT9idedkaHp0LmJuekMzElSB_8nvv2S45p4ZDf_hVvYEQBNrhNvca54TSrZ_6TDPPm5aVIWi6rNd6-ZDv2l9gslTBJq_GT08LrhgE_74CEfaCYWDfOr0au_-iCpwvqYEOKvP_TegWWObzRwx1ZczPUMTLTY",
		fabricType: "Woodcraft",
	},
];

function toTitleFromSlug(rawSlug: string): string {
	const cleaned = rawSlug.trim();
	if (!cleaned) {
		return "The Solstice Throw";
	}

	return cleaned
		.split("-")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function buildDummyProduct(slug: string) {
	const safeSlug = slug.trim() || "solstice-throw";
	const title = toTitleFromSlug(safeSlug);

	return {
		id: `dummy-${safeSlug}`,
		name: title,
		slug: safeSlug,
		description:
			"This is a temporary demo product rendered as a fallback while real product records are being prepared.",
		short_description:
			"A handcrafted textile with warm tones, tactile weave, and story-led design for premium testing.",
		long_description:
			"Inspired by earthy palettes and artisan weaving traditions, this fallback product is available for UI and checkout flow testing. Replace this with your real catalog item when production data is ready.",
		description_html: "",
		description_css: "",
		use_custom_description: false,
		related_product_ids: [],
		highlights: [
			"Handcrafted weave with soft drape",
			"Breathable natural-fiber blend",
			"Colorfast finish for daily use",
		],
		faqs: [
			{ question: "Is this a real catalog product?", answer: "This is a temporary fallback product used for storefront testing." },
			{ question: "Can I place an order with this?", answer: "Yes, you can test cart and checkout behavior with this item." },
		],
		fabric: "Handloom Cotton",
		width: "44 inches",
		care_instructions: "Gentle hand wash in cold water. Dry in shade.",
		fabric_details: [
			{ label: "GSM", value: "220" },
			{ label: "Feel", value: "Soft matte handfeel" },
			{ label: "Transparency", value: "Opaque" },
			{ label: "Stretch", value: "Minimal" },
			{ label: "Drape", value: "Flowing and structured" },
		],
		sell_mode: "meter",
		categories: [{ id: "dummy-category", name: "Textiles", slug: "textiles" }],
		product_variants: [
			{
				id: `dummy-variant-${safeSlug}-terracotta`,
				color_name: "Terracotta",
				color_hex: "#9f3f29",
				material_label: "Handloom Cotton",
				price: 1850,
				original_price: 2400,
				stock: 18,
				sku: `DUMMY-${safeSlug.slice(0, 10).toUpperCase()}`,
				is_default: true,
				variant_images: DUMMY_GALLERY_IMAGES.map((imageUrl, index) => ({
					image_url: imageUrl,
					is_primary: index === 0,
					media_type: "image",
				})),
			},
			{
				id: `dummy-variant-${safeSlug}-sage`,
				color_name: "Sage",
				color_hex: "#5a6245",
				material_label: "Handloom Cotton",
				price: 1850,
				original_price: 2400,
				stock: 10,
				sku: `DUMMY-SAGE-${safeSlug.slice(0, 6).toUpperCase()}`,
				is_default: false,
				variant_images: DUMMY_GALLERY_IMAGES.map((imageUrl, index) => ({
					image_url: imageUrl,
					is_primary: index === 0,
					media_type: "image",
				})),
			},
		],
		product_option_groups: [],
		custom_tabs: [
			{
				id: "story",
				label: "Artisan Story",
				type: "custom",
				headline: "A Loom with a Legacy",
				description: "Each fabric lot is curated from artisan clusters with deliberate attention to drape, comfort, and longevity. We work directly with makers to preserve process authenticity and consistent quality.",
				image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrRoBODPT1WPovjEC3-z05DbR7rAjGoBXWTN9oRddrm4H9qBuRSg9mQ-i7PtVnKE8MnR0nMgo2p0666EqiS07Y9lR6JNdGxxovsDizZk6tn4vRE1nxRAtuZEyS5k7bN9C0jzK7K5Gdj--xaNlcVHMER-gLGNTxCIoNruv7KMRDVJ4Emyy24IS6M01bSWQOt9GakKMz4oUAlNpo_UzXzJg2sQwCkgCLKE4WQEEmc25XHz-VTZvqDAKOlmgUegANZOiUvUbriD3qwCkgCLKE4WQEEmc25XHz-VTZvqDAKOlmgUegANZOiUvUbriD3qcFg",
				quote: "This fabric feels like a warm hug from the earth itself.",
				link_label: "Meet the weavers",
				link_url: "",
			},
			{ id: "materials", label: "Materials", type: "materials" },
			{ id: "dimensions", label: "Dimensions", type: "dimensions" }
		],
	};
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
	const router = useRouter();
	const { addToCart, setIsCartOpen } = useCart();

	const [product, setProduct] = useState<any>(null);
	const [relatedProducts, setRelatedProducts] = useState<RelatedProductCard[]>([]);
	const [loading, setLoading] = useState(true);
	const [meters, setMeters] = useState(1);
	const [activeTab, setActiveTab] = useState<string>("");
	const [activeMedia, setActiveMedia] = useState(0);
	const [selectedVariant, setSelectedVariant] = useState<any>(null);
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[] | number>>({});
	const [optionErrors, setOptionErrors] = useState<Record<string, string>>({});
	const [expandedAccordionItems, setExpandedAccordionItems] = useState<Record<string, boolean>>({});
	const viewedProductVariantRef = useRef<string | null>(null);

	const [shareText, setShareText] = useState("Share Product");

	const handleShareProduct = async () => {
		const shareData = {
			title: product?.name || "E-commerce product",
			text: `Check out ${product?.name} at Shree Hari Cutpiece!`,
			url: typeof window !== "undefined" ? window.location.href : "",
		};

		if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
			try {
				await navigator.share(shareData);
			} catch (err: any) {
				if (err.name !== "AbortError") {
					copyToClipboard();
				}
			}
		} else {
			copyToClipboard();
		}
	};

	const copyToClipboard = () => {
		if (typeof navigator !== "undefined") {
			navigator.clipboard.writeText(window.location.href);
			setShareText("Link Copied!");
			setTimeout(() => {
				setShareText("Share Product");
			}, 2000);
		}
	};

	useEffect(() => {
		async function fetchProduct() {
			const { data, error } = await supabase
				.from("products")
				.select(`
					id, name, slug, description, short_description, long_description, description_html, description_css, use_custom_description, related_product_ids,
					artisan_headline, artisan_description, artisan_image, artisan_quote, custom_tabs,
					highlights, faqs, fabric, width, care_instructions, fabric_details,
					sell_mode,
					categories ( id, name, slug ),
					product_variants ( id, color_name, color_hex, material_label, price, original_price, stock, sku, is_default, variant_images ( image_url, is_primary, media_type ) ),
					product_option_groups ( id, name, input_type, input_data_type, required, min_selections, max_selections, placeholder, help_text, input_min_length, input_max_length, input_min_value, input_max_value, sort_order, is_active, product_option_values ( id, label, value, is_default, sort_order, is_active ) )
				`)
				.eq("slug", slug)
				.single();

			if (error || !data) {
				const dummyProduct = buildDummyProduct(slug);
				setProduct(dummyProduct);
				setSelectedOptions({});
				setOptionErrors({});
				setSelectedVariant(dummyProduct.product_variants[0]);
				setRelatedProducts(DUMMY_RELATED_PRODUCTS);
				const dummyTabs = (dummyProduct.custom_tabs && dummyProduct.custom_tabs.length > 0)
					? dummyProduct.custom_tabs.filter((tab: any) => tab && tab.type !== "reviews")
					: [];
				if (dummyTabs.length > 0) {
					setActiveTab(dummyTabs[0].id);
				} else {
					setActiveTab("description");
				}
				setLoading(false);
				return;
			}

			const resData = data as any;
			setProduct(resData);
			const tabsList = (Array.isArray(resData.custom_tabs) ? resData.custom_tabs : [])
				.filter((tab: any) => tab && tab.type !== "reviews");
			if (tabsList.length > 0) {
				setActiveTab(tabsList[0].id);
			} else {
				// Set default active tab based on available fallback data
				const longDesc = resData.long_description || resData.description || "";
				const highlightItemsList = Array.isArray(resData.highlights) ? resData.highlights : [];
				const hasSpecInfo = resData.fabric || resData.width || resData.care_instructions || (Array.isArray(resData.fabric_details) && resData.fabric_details.length > 0);
				const faqItemsList = Array.isArray(resData.faqs) ? resData.faqs : [];
				
				if (longDesc.trim() || highlightItemsList.length > 0) {
					setActiveTab("description");
				} else if (hasSpecInfo) {
					setActiveTab("materials");
				} else if (faqItemsList.length > 0) {
					setActiveTab("faq");
				}
			}
			const groups = Array.isArray(resData.product_option_groups) ? resData.product_option_groups : [];
			const defaults: Record<string, string | string[]> = {};
			groups.forEach((group: any) => {
				if (group?.is_active === false) return;
				const values = Array.isArray(group.product_option_values)
					? group.product_option_values.filter((v: any) => v.is_active !== false)
					: [];
				if (group.input_type === "multi") {
					const def = values.filter((v: any) => v.is_default).map((v: any) => v.id);
					if (def.length) defaults[group.id] = def;
				} else if (group.input_type === "radio" || group.input_type === "dropdown") {
					const def = values.find((v: any) => v.is_default);
					if (def) defaults[group.id] = def.id;
				}
			});
			setSelectedOptions(defaults);
			setOptionErrors({});
			const defVariant = resData.product_variants.find((v: any) => v.is_default) || resData.product_variants[0];
			setSelectedVariant(defVariant);

			const relatedIds = Array.isArray(resData.related_product_ids)
				? resData.related_product_ids.filter((id: string) => id && id !== resData.id)
				: [];
			let finalRelatedProducts: RelatedProductCard[] = [];

			if (relatedIds.length > 0) {
				const { data: related } = await supabase
					.from("products")
					.select("id, name, slug, sell_mode, fabric, product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )")
					.in("id", relatedIds)
					.eq("is_active", true)
					.limit(8);

				if (related) {
					const orderMap = new Map(relatedIds.map((id: string, idx: number) => [id, idx]));
					const orderedRelated = related
						.sort((a: any, b: any) => Number(orderMap.get(a.id) ?? 0) - Number(orderMap.get(b.id) ?? 0))
						.slice(0, 8);

					finalRelatedProducts = mapRelatedProducts(orderedRelated);
				}
			}

			if (relatedIds.length === 0) {
				let fallbackQuery = supabase
					.from("products")
					.select("id, name, slug, sell_mode, fabric, is_featured, product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )")
					.eq("is_active", true)
					.neq("id", resData.id)
					.limit(16);

				if (resData.fabric) {
					fallbackQuery = fallbackQuery.ilike("fabric", `%${resData.fabric}%`);
				}

				const { data: fallbackProducts } = await fallbackQuery;

				if (fallbackProducts && fallbackProducts.length > 0) {
					const fallbackMapped = mapRelatedProducts(fallbackProducts);
					finalRelatedProducts = mergeUniqueRelated(finalRelatedProducts, fallbackMapped);
				}
			}

			setRelatedProducts(finalRelatedProducts.slice(0, 8));
			setLoading(false);
		}

		fetchProduct();
	}, [slug]);

	useEffect(() => {
		if (!product || !selectedVariant) return;

		const viewKey = `${product.id}:${selectedVariant.id || "default"}`;
		if (viewedProductVariantRef.current === viewKey) return;
		viewedProductVariantRef.current = viewKey;

		const category = Array.isArray(product.categories)
			? product.categories[0]?.name
			: product.categories?.name;

		trackViewItem({
			productId: product.id,
			productSlug: product.slug,
			productName: product.name,
			variantId: selectedVariant.id,
			unitPrice: selectedVariant.price || 0,
			sellingMode: product.sell_mode === "meter" ? "meter" : "piece",
			category: category || "",
		});
	}, [product, selectedVariant]);

	if (loading) {
		return (
			<>
				<Navbar activePage="shop" />
				<CartSidebar />
				<main className={`${bohemianBodyFont.className} min-h-[70vh] bg-[#fcf9f4]`}>
					<section className={`${BOHEMIAN_SITE_CONTAINER} flex min-h-[60vh] items-center justify-center py-16`}>
						<div className="flex flex-col items-center gap-4 text-center">
							<div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ddc0ba] border-t-[#9f3f29]" />
							<p className="text-sm text-[#6f645d]">Loading product details...</p>
						</div>
					</section>
				</main>
				<Footer />
			</>
		);
	}

	if (!product) {
		return (
			<>
				<Navbar activePage="shop" />
				<CartSidebar />
				<main className={`${bohemianBodyFont.className} min-h-[70vh] bg-[#fcf9f4]`}>
					<section className={`${BOHEMIAN_SITE_CONTAINER} flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center`}>
						<h1 className={`${bohemianHeadingFont.className} text-4xl text-[#9f3f29]`}>Product not found</h1>
						<p className="max-w-md text-sm text-[#6f645d]">The product you are looking for may no longer be available.</p>
						<Link
							href="/shop"
							className="inline-flex items-center justify-center rounded-lg bg-[#9f3f29] px-7 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#bf573f]"
						>
							Back to Shop
						</Link>
					</section>
				</main>
				<Footer />
			</>
		);
	}

	const optionGroups = Array.isArray(product.product_option_groups)
		? product.product_option_groups
			.filter((g: any) => g.is_active !== false)
			.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
		: [];

	const clearOptionError = (groupId: string) => {
		setOptionErrors((prev) => {
			if (!prev[groupId]) return prev;
			const next = { ...prev };
			delete next[groupId];
			return next;
		});
	};

	const validateOptions = () => {
		const errors: Record<string, string> = {};
		optionGroups.forEach((group: any) => {
			const selection = selectedOptions[group.id];
			if (group.input_type === "input") {
				const raw = selection !== undefined && selection !== null ? String(selection).trim() : "";
				if (group.required && !raw) {
					errors[group.id] = "This field is required.";
					return;
				}
				if (raw) {
					if (group.input_data_type === "number") {
						const num = Number(raw);
						if (Number.isNaN(num)) {
							errors[group.id] = "Enter a valid number.";
							return;
						}
						if (group.input_min_value !== null && group.input_min_value !== undefined && num < group.input_min_value) {
							errors[group.id] = `Minimum value is ${group.input_min_value}.`;
							return;
						}
						if (group.input_max_value !== null && group.input_max_value !== undefined && num > group.input_max_value) {
							errors[group.id] = `Maximum value is ${group.input_max_value}.`;
							return;
						}
					} else {
						if (group.input_min_length && raw.length < group.input_min_length) {
							errors[group.id] = `Minimum length is ${group.input_min_length}.`;
							return;
						}
						if (group.input_max_length && raw.length > group.input_max_length) {
							errors[group.id] = `Maximum length is ${group.input_max_length}.`;
							return;
						}
					}
				}
				return;
			}

			if (group.input_type === "multi") {
				const list = Array.isArray(selection) ? selection : [];
				if (group.required && list.length === 0) {
					errors[group.id] = "Select at least one option.";
					return;
				}
				if (group.min_selections && list.length < group.min_selections) {
					errors[group.id] = `Select at least ${group.min_selections}.`;
					return;
				}
				if (group.max_selections && list.length > group.max_selections) {
					errors[group.id] = `Select up to ${group.max_selections}.`;
					return;
				}
				return;
			}

			if (group.required && !selection) {
				errors[group.id] = "Please select an option.";
			}
		});

		setOptionErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const buildOptionSnapshots = () => {
		return optionGroups
			.map((group: any) => {
				const selection = selectedOptions[group.id];
				if (group.input_type === "input") {
					if (selection === undefined || selection === null || String(selection).trim() === "") return null;
					return {
						group_id: group.id,
						group_name: group.name,
						input_type: group.input_type,
						input_value: group.input_data_type === "number" ? Number(selection) : String(selection),
					};
				}

				const values = Array.isArray(group.product_option_values)
					? group.product_option_values.filter((v: any) => v.is_active !== false)
					: [];

				if (group.input_type === "multi") {
					const ids = Array.isArray(selection) ? selection : [];
					if (!ids.length) return null;
					const selected = values.filter((v: any) => ids.includes(v.id));
					return {
						group_id: group.id,
						group_name: group.name,
						input_type: group.input_type,
						value_ids: selected.map((v: any) => v.id),
						value_labels: selected.map((v: any) => v.label),
					};
				}

				if (!selection) return null;
				const selected = values.find((v: any) => v.id === selection);
				return {
					group_id: group.id,
					group_name: group.name,
					input_type: group.input_type,
					value_ids: [String(selection)],
					value_labels: selected ? [selected.label] : [],
				};
			})
			.filter(Boolean);
	};

	const isMeterProduct = product.sell_mode === "meter";
	const quantityStep = isMeterProduct ? 0.5 : 1;

	const normalizeQuantity = (value: number) => {
		const stepped = Math.round(value / quantityStep) * quantityStep;
		const next = Math.max(quantityStep, stepped);
		return Number(next.toFixed(isMeterProduct ? 1 : 0));
	};

	const updateQuantity = (value: number) => {
		setMeters(normalizeQuantity(value));
	};

	const createCartPayload = (source: string) => {
		if (!validateOptions()) return null;
		const optionSnapshots = buildOptionSnapshots() as any[];
		const img =
			selectedVariant?.variant_images?.find((i: any) => i.is_primary)?.image_url
			|| selectedVariant?.variant_images?.[0]?.image_url
			|| "";

		return {
			id: selectedVariant?.id || product.id,
			product_id: product.id,
			variant_id: selectedVariant?.id || undefined,
			name: `${product.name} ${selectedVariant?.color_name ? `(${selectedVariant.color_name})` : ""}`.trim(),
			slug: product.slug,
			price: selectedVariant?.price || 0,
			image: img,
			meters,
			selling_mode: (product.sell_mode === "meter" ? "meter" : "piece") as "meter" | "piece",
			selected_options: optionSnapshots,
			analytics_source: source,
		};
	};

	const handleAddToCart = () => {
		const payload = createCartPayload("bohemian_pdp_add_to_cart") as any;
		if (!payload) return;
		addToCart(payload);
	};

	const handleBuyNow = () => {
		const payload = createCartPayload("bohemian_pdp_buy_now") as any;
		if (!payload) return;
		addToCart(payload);
		setIsCartOpen(false);
		router.push("/checkout");
	};

	const handleQuickAddRelated = (related: RelatedProductCard) => {
		addToCart({
			id: related.id,
			product_id: related.id,
			name: related.name,
			slug: related.slug,
			price: related.price,
			image: related.image,
			meters: 1,
			selling_mode: (related.unit === "meter" ? "meter" : "piece") as "meter" | "piece",
			analytics_source: "bohemian_pdp_related_quick_add",
		});
	};

	const averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
	const categoryName = Array.isArray(product.categories) ? product.categories[0]?.name : product.categories?.name;
	const shortDescription = product.short_description || product.description || "";
	const descriptionHtml = product.description_html || "";
	const descriptionCss = product.description_css || "";
	const useCustomDescription = Boolean(product.use_custom_description);
	const hasCustomDescription = descriptionHtml.trim().length > 0;
	const showCustomDescription = useCustomDescription && hasCustomDescription;
	const faqItems = Array.isArray(product.faqs) ? product.faqs : [];
	const highlightItems = Array.isArray(product.highlights) ? product.highlights : [];
	const fabricRows = Array.isArray(product.fabric_details) ? product.fabric_details : [];

	const extraFabricRows = fabricRows
		.map((row: any, index: number) => {
			if (!row || typeof row !== "object") return null;
			const label = String(row.label || row.title || row.name || row.key || `Detail ${index + 1}`).trim();
			const valueRaw = row.value ?? row.text ?? row.description ?? row.detail;
			const value = valueRaw !== undefined && valueRaw !== null ? String(valueRaw).trim() : "";
			if (!value) return null;
			return { label, value };
		})
		.filter(Boolean) as Array<{ label: string; value: string }>;

	const extractSpecValue = (keywords: string[]) => {
		const match = extraFabricRows.find((row) => {
			const normalizedLabel = normalizeSpecKey(row.label);
			return keywords.some((keyword) => normalizedLabel.includes(keyword));
		});
		return match?.value || "";
	};

	const textileSpecs = [
		{ label: "GSM", value: extractSpecValue(["gsm", "weight"]) || "Not specified" },
		{ label: "Feel", value: extractSpecValue(["feel", "touch", "texture", "hand"]) || "Not specified" },
		{ label: "Transparency", value: extractSpecValue(["transparency", "opacity", "sheer"]) || "Not specified" },
		{ label: "Stretch", value: extractSpecValue(["stretch", "elasticity"]) || "Not specified" },
		{ label: "Drape", value: extractSpecValue(["drape", "fall"]) || "Not specified" },
		{ label: "Care", value: product.care_instructions || extractSpecValue(["care", "wash"]) || "Not specified" },
	];

	const detailRows: Array<{ label: string; value: string }> = [
		{ label: "Fabric Type", value: product.fabric || "N/A" },
		{ label: "Width", value: product.width || "N/A" },
		{ label: "Care Instructions", value: product.care_instructions || "N/A" },
		{ label: "Sold By", value: `Per ${isMeterProduct ? "Meter" : "Piece"}` },
		{ label: "Category", value: categoryName || "N/A" },
	];

	const seenDetailKeys = new Set(detailRows.map((row) => normalizeSpecKey(row.label)));
	extraFabricRows.forEach((row) => {
		const rowKey = normalizeSpecKey(row.label);
		if (!seenDetailKeys.has(rowKey)) {
			seenDetailKeys.add(rowKey);
			detailRows.push(row);
		}
	});

	const meterGuideRows = [
		{ use: "Straight Kurti", min: 2.5, max: 3 },
		{ use: "Anarkali / Flared Kurti", min: 4, max: 5.5 },
		{ use: "Suit Set (Top + Bottom + Dupatta)", min: 6.5, max: 8 },
		{ use: "Saree Blouse", min: 0.8, max: 1.2 },
	];

	const fittingGuideMatch = isMeterProduct
		? meterGuideRows.find((row) => meters >= row.min && meters <= row.max)
		: null;

	const media = (Array.isArray(selectedVariant?.variant_images)
		? [...selectedVariant.variant_images]
			.filter((img: any) => Boolean(img?.image_url))
			.sort((a: any, b: any) => Number(Boolean(b?.is_primary)) - Number(Boolean(a?.is_primary)))
		: [])
		.map((img: any, idx: number) => ({
			type: img.media_type || "image",
			url: img.image_url,
			label: getMediaLabel(idx, img.media_type),
		}));

	const activeMediaItem = media[activeMedia];
	const stylistAssistUrl = getWhatsAppUrl(
		`Hi, I need help selecting the right quantity and styling for ${product.name}${selectedVariant?.color_name ? ` (${selectedVariant.color_name})` : ""}.`,
	);
	// Resolve active tabs list
	const configuredTabs = (product && Array.isArray(product.custom_tabs) ? product.custom_tabs : [])
		.filter((tab: any) => tab && tab.type !== "reviews");

	// If no custom tabs are configured in the database, build default tabs list
	const defaultTabs = [];
	if (configuredTabs.length === 0 && product) {
		const longDesc = product.long_description || product.description || "";
		if (longDesc.trim() || highlightItems.length > 0) {
			defaultTabs.push({
				id: "description",
				label: "Description",
				type: "custom",
				layout: "split",
				headline: "Fabric Details & Artisan Story",
				description: longDesc,
			});
		}

		// Spec fields fallback
		const hasSpecInfo = product.fabric || product.width || product.care_instructions || (Array.isArray(product.fabric_details) && product.fabric_details.length > 0);
		if (hasSpecInfo) {
			defaultTabs.push({
				id: "materials",
				label: "Specifications",
				type: "materials",
				specs: textileSpecs,
				faqs: [],
			});
		}

		// FAQs fallback (if faqs exist at product level)
		if (faqItems.length > 0) {
			defaultTabs.push({
				id: "faq",
				label: "FAQs",
				type: "materials", // materials type contains faqs list
				specs: [],
				faqs: faqItems,
			});
		}
	}

	const tabsToRender = configuredTabs.length > 0 ? configuredTabs : defaultTabs;

	return (
		<>
			<Navbar activePage="shop" />
			<CartSidebar />

			<main className={`${bohemianBodyFont.className} bg-[#fcf9f4] pb-20 text-[#1c1c19]`}>
				<section className={`${BOHEMIAN_SITE_CONTAINER} pb-8 pt-8 md:pt-10`}>
					<nav className="mb-8">
						<ol className="flex flex-wrap items-center gap-2 text-xs tracking-[0.08em] text-[#7d7069] uppercase">
							<li>
								<Link href="/" className="transition-colors hover:text-[#9f3f29]">Home</Link>
							</li>
							<li>/</li>
							<li>
								<Link href="/shop" className="transition-colors hover:text-[#9f3f29]">Shop</Link>
							</li>
							<li>/</li>
							<li className="text-[#56423d]">{product.name}</li>
						</ol>
					</nav>

					<section className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
						<div className="lg:col-span-7">
							<div className="flex flex-col gap-5 md:flex-row-reverse">
								<div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-lg bg-[#f6f3ee]">
									{activeMediaItem?.type === "video" ? (
										<video src={activeMediaItem.url} controls autoPlay loop muted className="h-full w-full object-cover" />
									) : activeMediaItem ? (
										<Image
											src={activeMediaItem.url}
											alt={product.name}
											fill
											priority
											sizes="(max-width: 1024px) 100vw, 55vw"
											className="object-cover"
										/>
									) : (
										<div className="flex h-full items-center justify-center text-sm text-[#7a6f68]">No image available</div>
									)}

									<div className="absolute left-4 top-4 rounded-full bg-[#fcf9f4]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9f3f29] backdrop-blur-sm">
										Limited Batch
									</div>
								</div>

								{media.length > 1 ? (
									<div className="flex gap-3 overflow-x-auto pb-1 md:max-h-[640px] md:w-24 md:flex-col md:overflow-y-auto md:pb-0">
										{media.map((item, idx) => (
											<button
												key={`media-${item.url}-${idx}`}
												type="button"
												onClick={() => setActiveMedia(idx)}
												className={`relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-opacity md:h-32 md:w-full ${
													activeMedia === idx
														? "ring-2 ring-[#9f3f29] ring-offset-2 ring-offset-[#fcf9f4]"
														: "opacity-70 hover:opacity-100"
												}`}
											>
												{item.type === "video" ? (
													<div className="flex h-full w-full items-center justify-center bg-[#ebe8e3] text-xs text-[#6f645d]">Video</div>
												) : (
													<Image
														src={item.url}
														alt={`${product.name} thumbnail ${idx + 1}`}
														fill
														sizes="96px"
														className="object-cover"
													/>
												)}
											</button>
										))}
									</div>
								) : null}
							</div>
						</div>

						<div className="lg:col-span-5 lg:pt-2">
							<div className="mb-6 flex flex-wrap items-center gap-2">
								<span className="inline-flex items-center gap-1 rounded-full bg-[#dbe4c0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a6245]">
									<Sparkles className="h-3.5 w-3.5" />
									Artisan Crafted
								</span>
								{selectedVariant?.sku && selectedVariant.sku !== "N/A" ? (
									<span className="text-[11px] uppercase tracking-[0.12em] text-[#7a6f68]">SKU: {selectedVariant.sku}</span>
								) : null}
							</div>

							<h1 className={`${bohemianHeadingFont.className} text-5xl leading-[0.95] text-[#1c1c19] md:text-6xl`}>{product.name}</h1>

							<div className="mt-5 flex items-center gap-4">
								<p className={`${bohemianHeadingFont.className} text-[34px] leading-none text-[#9f3f29]`}>{formatPrice(selectedVariant?.price || 0)}</p>
								{selectedVariant?.original_price > selectedVariant?.price ? (
									<>
										<p className={`${bohemianHeadingFont.className} text-2xl text-[#8f847d] line-through`}>{formatPrice(selectedVariant.original_price)}</p>
										<span className="rounded bg-[#ffdf9e] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#785900]">
											Save {Math.round((1 - selectedVariant.price / selectedVariant.original_price) * 100)}%
										</span>
									</>
								) : null}
							</div>

							<div className="mt-4 flex items-center gap-2 text-[#785900]">
								{[1, 2, 3, 4, 5].map((star) => (
									<Star key={`rating-${star}`} className="h-4 w-4 fill-current" />
								))}
								<span className="text-xs text-[#7a6f68]">({reviewsData.length} curated reviews)</span>
							</div>

							{shortDescription ? (
								<p className="mt-6 text-lg leading-relaxed text-[#56423d]">{shortDescription}</p>
							) : null}

							{product.product_variants?.length > 0 ? (
								<div className="mt-8">
									<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a6f68]">
										Select Hue: <span className="text-[#1c1c19]">{selectedVariant?.color_name || "Default"}</span>
									</p>
									<div className="mt-3 flex flex-wrap gap-3">
										{product.product_variants.map((variant: any) => {
											const isSelected = selectedVariant?.id === variant.id;
											return (
												<button
													key={variant.id}
													type="button"
													onClick={() => {
														setSelectedVariant(variant);
														setActiveMedia(0);
													}}
													className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
														isSelected
															? "ring-2 ring-[#9f3f29] ring-offset-2 ring-offset-[#fcf9f4]"
															: "ring-1 ring-[#ddc0ba] hover:ring-[#9f3f29]"
													}`}
													title={variant.color_name || "Color variant"}
												>
													<span className="h-10 w-10 rounded-full border border-black/5" style={{ backgroundColor: variant.color_hex || "#c5b9ad" }} />
													{isSelected ? <Check className="absolute h-3.5 w-3.5 text-white drop-shadow" /> : null}
												</button>
											);
										})}
									</div>
								</div>
							) : null}

							{optionGroups.length > 0 ? (
								<div className="mt-8 space-y-5">
									{optionGroups.map((group: any) => {
										const values = Array.isArray(group.product_option_values)
											? group.product_option_values
												.filter((v: any) => v.is_active !== false)
												.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
											: [];
										const selection = selectedOptions[group.id];

										return (
											<div key={group.id}>
												<div className="mb-2 flex items-center justify-between">
													<label className="text-sm font-semibold text-[#1c1c19]">
														{group.name}
														{group.required ? <span className="text-red-500"> *</span> : null}
													</label>
													{group.help_text ? <span className="text-xs text-[#7a6f68]">{group.help_text}</span> : null}
												</div>

												{group.input_type === "input" ? (
													<input
														type={group.input_data_type === "number" ? "number" : "text"}
														value={selection ?? ""}
														onChange={(event) => {
															const value = group.input_data_type === "number" ? event.target.value : event.target.value;
															setSelectedOptions((prev) => ({ ...prev, [group.id]: value }));
															clearOptionError(group.id);
														}}
														min={group.input_min_value ?? undefined}
														max={group.input_max_value ?? undefined}
														placeholder={group.placeholder || ""}
														className="w-full rounded-lg bg-[#f0ede8] px-3 py-2.5 text-sm text-[#1c1c19] outline-none ring-[#9f3f29] transition focus:ring-1"
													/>
												) : null}

												{group.input_type === "dropdown" ? (
													<select
														value={typeof selection === "string" ? selection : ""}
														onChange={(event) => {
															setSelectedOptions((prev) => ({ ...prev, [group.id]: event.target.value }));
															clearOptionError(group.id);
														}}
														className="w-full rounded-lg bg-[#f0ede8] px-3 py-2.5 text-sm text-[#1c1c19] outline-none ring-[#9f3f29] transition focus:ring-1"
													>
														<option value="">Select {group.name}</option>
														{values.map((val: any) => (
															<option key={val.id} value={val.id}>{val.label}</option>
														))}
													</select>
												) : null}

												{group.input_type === "radio" ? (
													<div className="flex flex-wrap gap-2">
														{values.map((val: any) => (
															<button
																key={val.id}
																type="button"
																onClick={() => {
																	setSelectedOptions((prev) => ({ ...prev, [group.id]: val.id }));
																	clearOptionError(group.id);
																}}
																className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
																	selection === val.id
																		? "bg-[#9f3f29] text-white"
																		: "bg-[#f0ede8] text-[#5f5954] hover:bg-[#e7dfd6]"
																}`}
															>
																{val.label}
															</button>
														))}
													</div>
												) : null}

												{group.input_type === "multi" ? (
													<div className="flex flex-wrap gap-4 rounded-lg bg-[#f0ede8] px-3 py-2.5">
														{values.map((val: any) => {
															const list = Array.isArray(selection) ? selection : [];
															const checked = list.includes(val.id);
															return (
																<label key={val.id} className="flex items-center gap-2 text-sm text-[#4f4741]">
																	<input
																		type="checkbox"
																		checked={checked}
																		onChange={() => {
																			const next = checked
																				? list.filter((id: string) => id !== val.id)
																				: [...list, val.id];
																			setSelectedOptions((prev) => ({ ...prev, [group.id]: next }));
																			clearOptionError(group.id);
																		}}
																		className="h-4 w-4 rounded border-[#ddc0ba] text-[#9f3f29] focus:ring-[#9f3f29]"
																	/>
																	{val.label}
																</label>
															);
														})}
													</div>
												) : null}

												{optionErrors[group.id] ? <p className="mt-1 text-xs text-red-500">{optionErrors[group.id]}</p> : null}
											</div>
										);
									})}
								</div>
							) : null}

							<div className="mt-8 rounded-lg bg-[#f6f3ee] p-4">
								<label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7a6f68]">
									{isMeterProduct ? "Select Quantity (meters)" : "Select Quantity"}
								</label>
								<div className="mt-3 flex flex-wrap items-center justify-between gap-4">
									<div className="inline-flex items-center overflow-hidden rounded-md bg-[#ebe8e3]">
										<button
											type="button"
											onClick={() => updateQuantity(meters - quantityStep)}
											className="flex h-9 w-9 items-center justify-center text-[#6f645d] transition-colors hover:bg-[#dfd8cf] hover:text-[#9f3f29]"
											aria-label="Decrease quantity"
										>
											<Minus className="h-4 w-4" />
										</button>
										<input
											type="number"
											step={quantityStep}
											value={meters}
											onChange={(event) => updateQuantity(Number(event.target.value) || quantityStep)}
											className="h-9 w-20 bg-transparent text-center text-sm font-semibold text-[#1c1c19] border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
											min={quantityStep}
										/>
										<button
											type="button"
											onClick={() => updateQuantity(meters + quantityStep)}
											className="flex h-9 w-9 items-center justify-center text-[#6f645d] transition-colors hover:bg-[#dfd8cf] hover:text-[#9f3f29]"
											aria-label="Increase quantity"
										>
											<Plus className="h-4 w-4" />
										</button>
									</div>

									<p className="text-sm text-[#56423d]">
										Total: <span className={`${bohemianHeadingFont.className} text-xl text-[#9f3f29]`}>{formatPrice((selectedVariant?.price || 0) * meters)}</span>
									</p>
								</div>

								{isMeterProduct ? (
									<p className="mt-3 text-xs leading-relaxed text-[#7a6f68]">
										{fittingGuideMatch
											? `Your selected quantity is commonly used for ${fittingGuideMatch.use}.`
											: "Share measurements on WhatsApp for exact cut guidance from our stylist."}
									</p>
								) : null}
							</div>

							<div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
								<button
									type="button"
									onClick={handleAddToCart}
									className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#9f3f29] px-5 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#bf573f]"
								>
									Add to Cart
								</button>

								<button
									type="button"
									onClick={handleBuyNow}
									className="inline-flex items-center justify-center rounded-lg border-2 border-[#9f3f29] px-5 py-4 text-sm font-bold uppercase tracking-[0.08em] text-[#9f3f29] transition hover:bg-[#9f3f29]/5"
								>
									Buy Now
								</button>
							</div>

							<div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#ddc0ba]/20 pb-4">
								<a
									href={stylistAssistUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f645d] transition-colors hover:text-[#9f3f29]"
									onClick={() =>
										trackWhatsAppClick({
											location: "bohemian_pdp_stylist_cta",
											productId: product.id,
											productSlug: product.slug,
										})
									}
								>
									Ask Stylist on WhatsApp
									<ChevronRight className="h-4 w-4" />
								</a>

								<button
									type="button"
									onClick={handleShareProduct}
									className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f645d] transition-colors hover:text-[#9f3f29] cursor-pointer"
								>
									<Share2 className="h-3.5 w-3.5 text-[#6f645d]" />
									{shareText}
								</button>
							</div>

							<div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#ddc0ba]/40 pt-7">
								<div className="flex flex-col items-center text-center">
									<Leaf className="h-7 w-7 text-[#5a6245]" />
									<span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7a6f68]">Sustainable</span>
								</div>
								<div className="flex flex-col items-center text-center">
									<PackageCheck className="h-7 w-7 text-[#5a6245]" />
									<span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7a6f68]">Handmade</span>
								</div>
								<div className="flex flex-col items-center text-center">
									<ShieldCheck className="h-7 w-7 text-[#5a6245]" />
									<span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7a6f68]">Fair Trade</span>
								</div>
							</div>
						</div>
					</section>
				</section>

				{product?.long_description && (
					<section className={`${BOHEMIAN_SITE_CONTAINER} mt-24 border-b border-[#ddc0ba]/30 pb-16`}>
						<div className="mx-auto max-w-3xl text-center space-y-6">
							<h2 className={`${bohemianHeadingFont.className} text-4xl text-[#1c1c19]`}>Product Story</h2>
							<p className="text-lg leading-relaxed text-[#56423d] whitespace-pre-wrap">{product.long_description}</p>
						</div>
					</section>
				)}

				<section className={`${BOHEMIAN_SITE_CONTAINER} mt-16`}>
					{product && tabsToRender.length > 0 && (
						<>
							<div className="hide-scrollbar flex overflow-x-auto border-b border-[#ddc0ba]/40">
								{tabsToRender.map((tab: any) => {
										return (
											<button
												key={tab.id}
												type="button"
												onClick={() => setActiveTab(tab.id)}
												className={`whitespace-nowrap border-b-2 px-6 py-4 text-sm font-semibold transition-colors ${
													activeTab === tab.id
														? "border-[#9f3f29] text-[#9f3f29]"
														: "border-transparent text-[#7a6f68] hover:text-[#9f3f29]"
												}`}
											>
												{tab.label}
											</button>
										);
									})}
							</div>

							<div className="py-10 md:py-12">
								{tabsToRender.map((tab: any) => {
									if (activeTab !== tab.id) return null;

									if (tab.type === "custom") {
										const layout = tab.layout || "split";

										if (layout === "hero") {
											const headlineToRender = tab.headline || (tab.id === "story" && product.artisan_headline) || (tab.id === "description" && "Description") || "";
											const descriptionToRender = tab.description || product.description || "";
											const imageUrlToRender = tab.image_url || (tab.id === "story" && product.artisan_image) || "";
											const quoteToRender = tab.quote || (tab.id === "story" && product.artisan_quote) || "";

											return (
												<div key={tab.id} className="max-w-5xl mx-auto space-y-8 text-center text-[#56423d] animate-fade-in">
													<div className="max-w-3xl mx-auto space-y-6">
														{headlineToRender && (
															<h3 className={`${bohemianHeadingFont.className} text-4xl italic text-[#1c1c19]`}>
																{headlineToRender}
															</h3>
														)}
														{tab.id === "story" && showCustomDescription && descriptionCss ? (
															<style dangerouslySetInnerHTML={{ __html: descriptionCss }} />
														) : null}

														{tab.id === "story" && showCustomDescription ? (
															<div className="product-desc leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
														) : (
															descriptionToRender && <p className="text-lg leading-relaxed whitespace-pre-wrap">{descriptionToRender}</p>
														)}

														{tab.link_label && (
															<div className="pt-2">
																<a
																	href={tab.link_url || stylistAssistUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center gap-2 text-sm font-semibold text-[#9f3f29] transition-opacity hover:opacity-75"
																	onClick={() =>
 																		trackWhatsAppClick({
 																			location: `bohemian_pdp_tab_${tab.id}_cta`,
 																			productId: product.id,
 																			productSlug: product.slug,
 																		})
 																	}
																>
																	{tab.link_label}
																	<ArrowRight className="h-4 w-4" />
																</a>
															</div>
														)}
													</div>
													{imageUrlToRender && (
														<div className="relative">
															<div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-[#f0ede8]">
																<Image
																	src={imageUrlToRender}
																	alt={headlineToRender || tab.label}
																	fill
																	sizes="100vw"
																	className="object-cover"
																/>
															</div>
															{quoteToRender && (
																<div className="mt-6 mx-auto max-w-xl rounded-lg bg-[#dbe4c0] p-4 text-center">
																	<p className={`${bohemianHeadingFont.className} text-lg italic leading-tight text-[#5a6245]`}>
																		&quot;{quoteToRender}&quot;
																	</p>
																</div>
															)}
														</div>
													)}
												</div>
											);
										}

										if (layout === "accordion") {
											const headlineToRender = tab.headline || (tab.id === "story" && product.artisan_headline) || (tab.id === "description" && "Description") || "";
											const descriptionToRender = tab.description || product.description || "";

											return (
												<div key={tab.id} className="max-w-3xl mx-auto space-y-6 text-[#56423d] animate-fade-in">
													{headlineToRender && (
														<h3 className={`${bohemianHeadingFont.className} text-3xl italic text-[#1c1c19] text-center mb-6`}>
															{headlineToRender}
														</h3>
													)}
													{tab.id === "story" && showCustomDescription && descriptionCss ? (
														<style dangerouslySetInnerHTML={{ __html: descriptionCss }} />
													) : null}

													{tab.id === "story" && showCustomDescription ? (
														<div className="product-desc leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
													) : (
														descriptionToRender && <p className="text-center text-base leading-relaxed max-w-2xl mx-auto mb-8 whitespace-pre-wrap">{descriptionToRender}</p>
													)}

													<div className="divide-y divide-[#e8e4dc] border-t border-b border-[#e8e4dc]">
														{(tab.items || []).map((item: any, idx: number) => {
															const isExpanded = !!expandedAccordionItems[`${tab.id}-${item.id || idx}`];
															return (
																<div key={item.id || idx} className="py-4">
																	<button
																		type="button"
																		onClick={() => setExpandedAccordionItems(prev => ({
																			...prev,
																			[`${tab.id}-${item.id || idx}`]: !isExpanded
																		}))}
																		className="flex w-full items-center justify-between text-left focus:outline-none"
																	>
																		<span className="font-semibold text-lg text-[#1c1c19]">{item.title}</span>
																		<span className="ml-6 flex-shrink-0 text-[#9f3f29]">
																			{isExpanded ? (
																				<Minus className="h-5 w-5" />
																			) : (
																				<Plus className="h-5 w-5" />
																			)}
																		</span>
																	</button>
																	{isExpanded && (
																		<div className="mt-3 text-base leading-relaxed text-[#56423d] whitespace-pre-wrap animate-fade-in">
																			{item.content}
																		</div>
																	)}
																</div>
															);
														})}
													</div>
												</div>
											);
										}

										if (layout === "grid") {
											const headlineToRender = tab.headline || (tab.id === "story" && product.artisan_headline) || (tab.id === "description" && "Description") || "";
											const descriptionToRender = tab.description || product.description || "";

											return (
												<div key={tab.id} className="max-w-6xl mx-auto space-y-8 text-[#56423d] animate-fade-in">
													{headlineToRender && (
														<h3 className={`${bohemianHeadingFont.className} text-3xl italic text-[#1c1c19] text-center`}>
															{headlineToRender}
														</h3>
													)}
													{tab.id === "story" && showCustomDescription && descriptionCss ? (
														<style dangerouslySetInnerHTML={{ __html: descriptionCss }} />
													) : null}

													{tab.id === "story" && showCustomDescription ? (
														<div className="product-desc leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
													) : (
														descriptionToRender && <p className="text-center text-base leading-relaxed max-w-2xl mx-auto mb-8 whitespace-pre-wrap">{descriptionToRender}</p>
													)}

													<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
														{(tab.items || []).map((item: any, idx: number) => (
															<div key={item.id || idx} className="flex flex-col items-center text-center p-6 bg-[#f6f3ee] rounded-xl space-y-4">
																{item.image_url ? (
																	<div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#e8e4dc]">
																		<Image
																			src={item.image_url}
																			alt={item.title}
																			fill
																			className="object-cover"
																		/>
																	</div>
																) : (
																	<div className="w-20 h-20 rounded-full bg-[#e8e4dc] flex items-center justify-center text-[#7a6f68]">
																		<Sparkles className="h-8 w-8" />
																	</div>
																)}
																<h4 className="font-semibold text-lg text-[#1c1c19]">{item.title}</h4>
																<p className="text-sm leading-relaxed text-[#56423d]">{item.content}</p>
															</div>
														))}
													</div>
												</div>
											);
										}

										const headlineToRender = tab.headline || (tab.id === "story" && product.artisan_headline) || (tab.id === "description" && "Description") || "";
										const descriptionToRender = tab.description || product.description || "";
										const imageUrlToRender = tab.image_url || (tab.id === "story" && product.artisan_image) || "";
										const quoteToRender = tab.quote || (tab.id === "story" && product.artisan_quote) || "";
										const hasImage = !!imageUrlToRender;

										return (
											<div key={tab.id} className={hasImage ? "grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 animate-fade-in" : "max-w-4xl space-y-6 text-[#56423d] animate-fade-in"}>
												<div className="space-y-6 text-[#56423d]">
													{headlineToRender && (
														<h3 className={`${bohemianHeadingFont.className} text-4xl italic text-[#1c1c19]`}>
															{headlineToRender}
														</h3>
													)}

													{tab.id === "story" && showCustomDescription && descriptionCss ? (
														<style dangerouslySetInnerHTML={{ __html: descriptionCss }} />
													) : null}

													{tab.id === "story" && showCustomDescription ? (
														<div className="product-desc leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
													) : (
														descriptionToRender && <p className="text-lg leading-relaxed whitespace-pre-wrap">{descriptionToRender}</p>
													)}

													{tab.link_label && (
														<a
															href={tab.link_url || stylistAssistUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-2 text-sm font-semibold text-[#9f3f29] transition-opacity hover:opacity-75"
															onClick={() =>
																trackWhatsAppClick({
																	location: `bohemian_pdp_tab_${tab.id}_cta`,
																	productId: product.id,
																	productSlug: product.slug,
																})
															}
														>
															{tab.link_label}
															<ArrowRight className="h-4 w-4" />
														</a>
													)}
												</div>

												{hasImage && (
													<div className="relative">
														<div className="relative aspect-video overflow-hidden rounded-xl bg-[#f0ede8]">
															<Image
																src={imageUrlToRender}
																alt={headlineToRender || tab.label}
																fill
																sizes="(max-width: 1024px) 100vw, 45vw"
																className="object-cover"
															/>
														</div>
														{quoteToRender && (
															<div className="mt-4 rounded-lg bg-[#dbe4c0] p-4 md:absolute md:-bottom-6 md:-right-6 md:mt-0 md:max-w-[220px]">
																<p className={`${bohemianHeadingFont.className} text-lg italic leading-tight text-[#5a6245]`}>
																	&quot;{quoteToRender}&quot;
																</p>
															</div>
														)}
													</div>
												)}
											</div>
										);
									}

									if (tab.type === "materials") {
										const specsToRender = Array.isArray(tab.specs) && tab.specs.length > 0 ? tab.specs : textileSpecs;
										const faqsToRender = Array.isArray(tab.faqs) && tab.faqs.length > 0 ? tab.faqs : faqItems;
										
										const visibleSpecs = specsToRender.filter((s: any) => s && s.label && s.value && s.value !== "Not specified");

										return (
											<div key={tab.id} className="space-y-8 animate-fade-in">
												{visibleSpecs.length > 0 && (
													<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
														{visibleSpecs.map((spec: any, idx: number) => (
															<div key={`${spec.label}-${idx}`} className="rounded-lg bg-[#f6f3ee] p-4">
																<p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a6f68]">{spec.label}</p>
																<p className="mt-2 text-sm leading-snug text-[#1c1c19]">{spec.value}</p>
															</div>
														))}
													</div>
												)}

												{/* FAQs removed from tab layout */}
											</div>
										);
									}

									if (tab.type === "dimensions") {
										const detailsToRender = Array.isArray(tab.details) && tab.details.length > 0 ? tab.details : detailRows;
										const guideToRender = Array.isArray(tab.guide) && tab.guide.length > 0 ? tab.guide : meterGuideRows;

										const visibleDetails = detailsToRender.filter((d: any) => d && d.label && d.value && d.value !== "N/A" && d.value !== "Not specified");

										return (
											<div key={tab.id} className="grid grid-cols-1 gap-8 lg:grid-cols-2 animate-fade-in">
												{visibleDetails.length > 0 && (
													<div className="rounded-lg bg-[#f6f3ee] p-5">
														<h4 className={`${bohemianHeadingFont.className} text-2xl text-[#1c1c19]`}>Product Details</h4>
														<div className="mt-4 space-y-3">
															{visibleDetails.map((row: any, idx: number) => (
																<div key={`${row.label}-${idx}`} className="grid grid-cols-2 gap-3 text-sm">
																	<span className="text-[#7a6f68]">{row.label}</span>
																	<span className="text-[#1c1c19]">{row.value}</span>
																</div>
															))}
														</div>
													</div>
												)}

												{guideToRender.length > 0 && (
													<div className="rounded-lg bg-[#f0ede8] p-5">
														<h4 className={`${bohemianHeadingFont.className} text-2xl text-[#1c1c19]`}>Quantity Guide</h4>
														<div className="mt-4 space-y-3 text-sm text-[#56423d]">
															{guideToRender.map((row: any, idx: number) => (
																<div key={`${row.use}-${idx}`} className="flex items-center justify-between gap-4">
																	<span>{row.use}</span>
																	<span className="text-[#7a6f68]">{row.min} - {row.max} m</span>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										);
									}

									if (tab.type === "reviews") {
										return (
											<div key={tab.id} className="space-y-7 animate-fade-in">
												<div className="flex flex-wrap items-end justify-between gap-4">
													<div>
														<p className={`${bohemianHeadingFont.className} text-5xl leading-none text-[#1c1c19]`}>{averageRating.toFixed(1)}</p>
														<p className="mt-1 text-sm text-[#7a6f68]">Average from {reviewsData.length} verified reviews</p>
													</div>
													<div className="flex items-center gap-1 text-[#785900]">
														{[1, 2, 3, 4, 5].map((star) => (
															<Star key={`rating-summary-${star}`} className="h-4 w-4 fill-current" />
														))}
													</div>
												</div>

												<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
													{reviewsData.map((review) => (
														<article key={review.id} className="rounded-xl bg-[#f6f3ee] p-5">
															<div className="mb-3 flex items-center gap-1 text-[#785900]">
																{[1, 2, 3, 4, 5].map((star) => (
																	<Star
																		key={`${review.id}-${star}`}
																		className={`h-3.5 w-3.5 ${star <= review.rating ? "fill-current" : "text-[#bcae9a]"}`}
																	/>
																))}
															</div>
															<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#1c1c19]">{review.title}</p>
															<p className="mt-3 text-sm leading-relaxed text-[#56423d]">{review.comment}</p>
															<div className="mt-5 flex items-center gap-3 border-t border-[#ddc0ba]/40 pt-4">
																<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5e2dd] text-[10px] font-bold text-[#5f5954]">
																	{extractReviewInitials(review.name)}
																</div>
																<p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5f5954]">{review.name}</p>
															</div>
														</article>
													))}
												</div>
											</div>
										);
									}

									return null;
								})}
							</div>
						</>
					)}
				</section>

				{/* Standalone Video Highlights Section */}
				{product?.highlights && typeof product.highlights === "object" && !Array.isArray(product.highlights) && (product.highlights.video_url || product.highlights.reel_url) ? (
					<section className={`${BOHEMIAN_SITE_CONTAINER} mt-24`}>
						<div className="mb-12 text-center">
							<h2 className={`${bohemianHeadingFont.className} text-5xl text-[#1c1c19]`}>See It in Action</h2>
							<p className="mt-3 text-sm text-[#6f645d]">Curated styling highlights and videos from our community.</p>
						</div>
						<div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[#f6f3ee] p-4 sm:p-8 shadow-sm border border-[#ddc0ba]/30">
							{product.highlights.video_url ? (
								<div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
									<video 
										src={product.highlights.video_url} 
										controls 
										className="h-full w-full object-contain"
									/>
								</div>
							) : product.highlights.reel_url ? (
								<div className="relative flex justify-center w-full min-h-[500px]">
									<iframe
										src={getInstagramEmbedUrl(product.highlights.reel_url)}
										className="w-full max-w-[400px] border-0 rounded-xl"
										scrolling="no"
										allowTransparency
										allow="encrypted-media"
										style={{ minHeight: "500px" }}
									/>
								</div>
							) : null}
						</div>
					</section>
				) : null}

				<section className="mt-24 overflow-hidden">
					<div className="relative h-[260px] sm:h-[320px] lg:h-[420px]">
						<Image
							src={LIFESTYLE_BANNER_IMAGE}
							alt="Lifestyle fabric usage"
							fill
							sizes="100vw"
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-black/25" />
						<div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
							<h2 className={`${bohemianHeadingFont.className} text-4xl italic leading-[0.92] md:text-6xl`}>A ritual of slow living.</h2>
							<p className="mt-4 max-w-2xl text-sm text-white/90 md:text-base">
								Designed to be draped over shoulders during sunset or styled across your favorite living corner.
							</p>
						</div>
					</div>
				</section>

				<section className={`${BOHEMIAN_SITE_CONTAINER} mt-24`}>
					<div className="mb-12 text-center">
						<h2 className={`${bohemianHeadingFont.className} text-5xl text-[#1c1c19]`}>Loved in Homes Worldwide</h2>
						<p className="mt-3 text-sm text-[#6f645d]">Join our community of curators. Mention @ArtisanalArchive to be featured.</p>
					</div>

					<div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
						{SOCIAL_PROOF_IMAGES.map((image, index) => (
							<div key={`social-proof-${index}`} className="group relative aspect-square overflow-hidden rounded-xl bg-[#f0ede8]">
								<Image
									src={image}
									alt={`Styled customer home ${index + 1}`}
									fill
									sizes="(max-width: 768px) 50vw, 20vw"
									className="object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 gap-5 md:grid-cols-3">
						{reviewsData.map((review) => (
							<article key={`review-card-${review.id}`} className="rounded-xl bg-[#f6f3ee] p-6">
								<div className="mb-3 flex items-center gap-1 text-[#785900]">
									{[1, 2, 3, 4, 5].map((star) => (
										<Star key={`social-${review.id}-${star}`} className="h-3.5 w-3.5 fill-current" />
									))}
								</div>
								<h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#1c1c19]">{review.title}</h3>
								<p className="mt-3 text-sm leading-relaxed text-[#56423d]">{review.comment}</p>
								<div className="mt-5 flex items-center gap-3 border-t border-[#ddc0ba]/40 pt-4">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5e2dd] text-[10px] font-bold text-[#5f5954]">
										{extractReviewInitials(review.name)}
									</div>
									<p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5f5954]">{review.name}</p>
								</div>
							</article>
						))}
					</div>
				</section>

				{/* Standalone FAQs Section */}
				{faqItems && faqItems.length > 0 && (
					<section className={`${BOHEMIAN_SITE_CONTAINER} mt-24`}>
						<div className="mb-12 text-center">
							<h2 className={`${bohemianHeadingFont.className} text-5xl text-[#1c1c19]`}>Frequently Asked Questions</h2>
							<p className="mt-3 text-sm text-[#6f645d]">Everything you need to know about the product and care.</p>
						</div>
						<div className="mx-auto max-w-4xl divide-y divide-[#e8e4dc] border-t border-b border-[#e8e4dc]">
							{faqItems.map((faq: any, idx: number) => (
								<div key={`faq-item-${idx}`} className="py-6 animate-fade-in">
									<h4 className="font-semibold text-lg text-[#1c1c19]">{faq.question || faq.q}</h4>
									<p className="mt-2 text-base leading-relaxed text-[#56423d]">{faq.answer || faq.a}</p>
								</div>
							))}
						</div>
					</section>
				)}

				<section className={`${BOHEMIAN_SITE_CONTAINER} mt-24`}>
					<div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<h2 className={`${bohemianHeadingFont.className} text-4xl text-[#1c1c19]`}>Complete the Sanctuary</h2>
						<Link href="/shop" className="text-sm font-semibold text-[#9f3f29] transition-opacity hover:opacity-70">
							Browse Living Collection
						</Link>
					</div>

					{relatedProducts.length > 0 ? (
						<div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
							{relatedProducts.map((related) => (
								<article key={related.id} className="group">
									<Link href={`/shop/${related.slug}`} className="block">
										<div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-[#f0ede8]">
											{related.image ? (
												<Image
													src={related.image}
													alt={related.name}
													fill
													sizes="(max-width: 1024px) 50vw, 25vw"
													className="object-cover transition-transform duration-700 group-hover:scale-105"
												/>
											) : (
												<div className="h-full w-full bg-[#ebe8e3]" />
											)}

											<button
												type="button"
												onClick={(event) => {
													event.preventDefault();
													handleQuickAddRelated(related);
												}}
												className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#1c1c19] opacity-0 shadow transition-all group-hover:translate-y-0 group-hover:opacity-100"
												aria-label={`Quick add ${related.name}`}
											>
												<Plus className="h-4 w-4" />
											</button>
										</div>
									</Link>

									<p className="text-[10px] uppercase tracking-[0.16em] text-[#89726c]">{related.fabricType}</p>
									<Link href={`/shop/${related.slug}`} className={`${bohemianHeadingFont.className} mt-1 block text-2xl leading-[1.06] text-[#1c1c19] transition-colors hover:text-[#9f3f29]`}>
										{related.name}
									</Link>
									<p className="mt-2 text-sm text-[#5f5954]">
										{formatPrice(related.price)} / {related.unit}
									</p>
								</article>
							))}
						</div>
					) : (
						<div className="rounded-xl bg-[#f6f3ee] p-6 text-center text-sm text-[#56423d]">
							Recommendations are being refreshed for this product.
						</div>
					)}
				</section>
			</main>

			<Footer />
		</>
	);
}