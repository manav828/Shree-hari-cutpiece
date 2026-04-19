import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowRight,
  ChevronDown,
  Leaf,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Users,
} from "lucide-react";
import OfferBanner from "@/themes/classic/components/home/OfferBanner";
import PopupBannerGate from "@/themes/classic/components/home/PopupBannerGate";
import { getActiveCmsBannersByPlacement, getActiveCmsCategories, getSiteConfigMap, type CmsCategory } from "@/lib/cms";
import Navbar from "@/themes/bohemian/components/layout/Navbar";
import Footer from "@/themes/bohemian/components/layout/Footer";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";

const manrope = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const archiveCardsFallback = [
  {
    title: "Textiles",
    slug: "textiles",
    subtitle: "Woven by hand in the High Atlas",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgGWz_CGhyiG1VT1RaZgZQpOuiV3guxCmGGg-Ck_hWfMQnik09h6EHA7CtwkZ78lh8iXTWLwnaQ5or0JoglQz7WmGj1E463Cu1KJxs5Z-JHhiYy6yw2kcjOBb9G2Pm-0mL998AEO_lZFv6_yj-Wdf2ARuaOeqZ8xFLEbuenIKB5LEIeqSRJlKerMc-O82U4xh705A7TylzQ_5ofxtA9wg9TGtTjM0IEYECWv4dP6bF3T-Cd885YMS6uwq9fZQrB99U9Jp57394idc",
    alt: "Close up of various textured linen textiles and woven blankets stacked neatly in earthy tones of sage, terracotta and cream",
    large: true,
  },
  {
    title: "Ceramics",
    slug: "ceramics",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZ-_C9CHCuUxDPzka7hT-mxE7s22WEDsn9MJR6FG3fMMWnp_DQtnZTRzMaO9JejH3xbQkMqRIDZ6DOl7DF31yMPaL-9mbmvu2X5zw1yiNg14xoKJL4w6TjTalZgDZUzygjUPH7ZXN2s0AAjxPuteN-Sfckqm6ysSglWre-iczbhsQKxCY7BTu3r3KpAQFULLQtKpxw01CreZodwTIMnOAPKrou_j0gTR1S75RsD-hUb7ZS3wZCG3Wylo88PLSD7jnwpt77v8dPvyk",
    alt: "Collection of minimalist handmade ceramic bowls and plates on a stone ledge with soft morning light",
  },
  {
    title: "Wall Art",
    slug: "wall-art",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7SMIREBK8NFKT284mkGwxiibTc2k6703pHAZMd0awV3y5FPsfqABVsN5fbdp26SKmMifDc8MJLDesJ1yLSjK_4pVlw-g8SF12248TZPYyon2Obea0n6SOpIhI8r-kR648LeLs5AY1PSxvz3TZqVOkIw1TKN2FW3RUeHOzHpy5pESdIymywJCFNgOb55AczeLfIx9ObL_olFFdBUBkmdwynuVRNHisgsa5WJN6o-AP_IbKd5CV_X0hvvn0_lTDtquCu7-6yIK9d20",
    alt: "Bohemian wall art featuring abstract line drawings and framed woven macrame hanging on a light beige wall",
  },
];

const roomCards = [
  {
    room: "Living Room",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCm7n_OQfY22IJF7wJGnyr3EOg7ZC2fdZz3IdCLT6TRk-xW6FRJAl_88GVgdxSQLCiCGbh6CNjbEdUxrbIZKreY8WHH_tB95Ugk1xRiR6r5w-FBXSpVPop-LczhOnBo0NFhx2cRm3IODR9FzE_YOsKANpdSUDE7RzHeTdOADmZJv2JMCWXv-2gt5nUC0zfHekwZvmbgzqu9y_GgzZWDyTXJ17xdZXKX2fmUg0b_8n8_5VdLn5E-vM-5nKWp34pLgODozOcP0NV0DAs",
    alt: "Modern living room with low wooden furniture, floor cushions, and large green leafy plants in sunbeams",
  },
  {
    room: "Bedroom",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIpV0cZeRk2jp8Cj2XkoHx3kuFw9Yly4PbXUPAM4YHVgi0uQvuDn4nKJMMib0H3rUAP8uh5DbzDhGDzsSRAH6NRFw6YvLTMDdOjuEjWbS_6Q1hSUaG2xBj6zAxddzT3qy1EFkPfIH4XNOLRi2Kdhhdz9pGF1ssV9ti56aWewch82wVfyw1igseCIx4fImY1OyNLCb4XzwHZ_xbUuQsJyzJoLu1btF0PbSICsOLSJcpo39u_p4b-rotMppre1fPC-prlC8uEcfBErw",
    alt: "Cozy bedroom with white linen bedding, a natural wood headboard, and warm ambient lighting",
  },
  {
    room: "Balcony",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8xOGl24iEBrATb0d9MTV_gCyZM_fkYaEQ-EZLFU4GK-MyS1O4_ED8cbgzLHIOJV59NqBWUlNXrNCjPmo44OB30nGqwHaHogAdWQiFmY-TwhtIc38YMDxx52NmZXLglK58Baadh_OqM9I2pH2YcDQwz6-4_DFhWsKHY7pnVJ3Pjo_ErvHX0MOP8qJOExyqc-3l_q-gjivj5TBX5u9IFZNSDHfuKghSVA66e1oNXkJxdn8r28zVnjOpj0LA0hTiN18h7kea_juR7uo",
    alt: "Outdoor balcony with rattan furniture, hanging plants, and a small wooden coffee table at sunset",
  },
  {
    room: "Workspace",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHKo9r2n4ZupyXkGLuZimpf5BHUz1nrzHrWBlPW9QcNu57pwQj8YRvFd7zlkiOw1rOGhmdcB299MHEhkMcUeNWAebJV1u4T0yhcVtYrv5zNX2wwkHynpgHZjTLK50LG2fSn3RkbnmG0E7RWEmQCxGs5TXN3BiQ3klJhd2qom6qkT4KyHIAzEpXrwXJlClRBvu0wWvTKe3xy6XlGkwGf9zI0Cn5UWbiQ0hxsKv0XYIL7T2f_muFJw-NPTu9Rx17czdSDOi_zg_lH4s",
    alt: "Minimalist home workspace with a light oak desk, ergonomic chair, and artisanal desk accessories",
  },
];

const newArrivals = [
  {
    title: "Arid Clay Vase",
    price: "$88.00",
    tag: "Limited",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBE7n-xjJ0KT5jhua9ISVzx6avgS6zJZ8CDTg2pFMpJIdmgOSY_dg5yv5YRxLZH6VrrZEQSAqXGuGGtnB7YcR7sEuBpTirTSK3sEr5ffAHL3tHeuAq4hqEAdVqqanDdb2EX7eJ0eGFkY-ePkUpytWnNu9L2OafVY5ZtOLaxTH5tEB8D7-F1cQWXeJ8wQVbs9_hWazqFhbZl4FmJGuAiKAZSPkOPaji5ySu7cWvo9U6Td_v-l2lyV9TfMtcBt1ezznW-CRZ45IFxjNg",
    alt: "Tall minimalist clay vase with a rough, sandy texture and single dried flower stem",
  },
  {
    title: "Dusk Glow Candle",
    price: "$34.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAU6KYGk0mGhSIzp9AieDxEfKb2FJ6hB3iRKg6JaQBIyzLcbLzxU5rvfucrdz4a8lJTVs6wmenbFDWGGYnKmF6ljlfxIOXBNMZMToAhDfnq_4gCoMgpXR1RhlsqLNIRGvyQN3sXjRVFpOXkbPM2136JjOq4KFboKkptV7J4FlJ4Im12xpSheKhFnLhutXGQLrOgANgAGh9zeAiRe5X1iq4Ga9nXxpwjhTE8t8B8XP9pOx2XfZePDLGm50Dfqss-7rO6dfAlzna9ZsE",
    alt: "Handcrafted beeswax candles in textured amber glass jars on a rustic wooden tray",
  },
  {
    title: "Seagrass Coven Basket",
    price: "$110.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAJPLjNZbaft28_YyZeWuIGgjNADIWXncBGWppgDIPNRXW-707oz_4v_5NfPcUl2uArriTUeJjVOoGNGQMyTQHRz4NylAF9smjBSpo-JipydMxgmC31CiQkC4dKwHaze2cb69iJfZE4EvYHtM_5TlUNMvytgM-zvcnW2HtqH0Ztg0ZWMUoZ3OH1TSs6g7YvEuks2dlX39CkOqQNey3zu9EDJpyaYKSI0ZfarsCxk3N7swPFRD_Jk72B7BruwQBXqrWsYUoUUMU76A",
    alt: "Natural woven seagrass storage baskets in various sizes with leather handles",
  },
  {
    title: "Plaster Muse Wall Sculpture",
    price: "$165.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5qKUxT83TaJjeQ3_CwnPtkpdP9JrviycoOt7JxZjzXKeSuZSB6xusNIl2sojEo_yROXyk6Qmy642M7uGH-CqSV-OaL4qJLPxCiXuL1xPpHNDPy5zOH8tdNdKIaGice7zbwIY1Rv3wwXrsDQfG4OZi2u544qO0Gs7NTUFUVN9N1UQHOlmSCvzt2ROPBZ9-JE-pfipLhKWVI6ZuTT1JNDZCiQmN_QV6b2S7OfHwIyYYcSdaMJHemMxbn-Xc18Zv7t24yCwkHQblUhQ",
    alt: "Minimalist abstract face wall sculpture made of white plaster on a warm beige wall",
  },
];

const instagramShots = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7nZPkMfU5eU_TF7QCEbsa9SDj2GHRKJogt7KIljdGoDYdOCZpK28JjYQaaADjQVaFUTjq_dVYY6QPhoBZiJ2f1_kAmJYeSuTkcR1-cQfG9TDR_HnOYYDF9CkkkE5ZD2Cb5C-Moc0umuPbv-GeyGZNFiiorEdPeelYjb6ncw8AYP0X4qA7qtW-xMP7uN9ftSikL-YOcoZT7ezYWCr1-v7ryTN5S-gLy7i5HsnlPnB2uTzxtf10x6IPp0wWLF5QzoyVDwH7cHgs9uU",
    alt: "Instagram user photo of a cozy reading nook",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5CsHUP4Y7i6Et5cgSszF7tEoBylVcMlxE9djmCcUBqBXh3Kq5LvEYNU0Nc84rVgyof2zOaXweHRX1FCNDYOc_WZHv9NDzAlyn_oGuEsnCvmEhmNRixNVA4Q9U2yWWj2IVvh5MQrGncYUDJ1HOcsux5IzVWm51AKlFBLHixSB-MaADYc6wTqdzXXsG8_mAPiRIdamlS20OMUvmtfwmyIFPzpxAvl-AJ9Nc4a3MJ7duOGdSK_jNljNAXhGkRdJuth8DUb_5_OftLTc",
    alt: "Instagram user photo of a minimalist shelf with brand's pottery",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCsZBb9zoV4K74MCj6WEFCyQk9QncKKIc4I64TyJWKSngoxHr23L4djcBfJjExQSwsIE7xGmwlIIOICwcZ9hf99vj3L-Mg2H2UNFHB-McgV__OQ9ZquEr0PCJ8KACDWER6V77h9lPMvMcVVFwHx7ACL7QUsS2bjCq4J-gb_ceY1Yv7dlHeDqFrG3h9xHFdq3ubyQE04kHTY6zLoojxgMgu7TN2yNMKf5IehiXL0Ragop8koMzYvyWg-OP11Yz3PVRA2s63Kgk6c6bI",
    alt: "Instagram user photo of a morning coffee setting on artisan coasters",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAlmTuso_D7TYh_00RfzQqaufVsXK3l57UOX-av3SuL6dnO2Tcvt0B7C4tdiyo_MDAFF9kzi0kk5rpGzpTzCp6rzLpgZtF6SfRlaOZQcFRhuM3sM9clZGsDncABqb25pO6KEShm_taFKYOjqffJF0QV_AOL5wpesSFzLtdBK_u3xEliKuaSZS95agDEEPr-Yv4snx5asViNwQ2PzssgrAOIVmmIfg3ifWq5q8_qRzYVMYJETxdiYEBfDRCdpMNH5R7NMIWnCkvLbYg",
    alt: "Instagram user photo of a sunny kitchen window with terracotta pots",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6lXphEzPWCpzq49bQT9TFEI1YSFATFa7LDu-ifTbHXspPXxi1yRX3QuiynHzfeDRnKiDRPO_iYzzkRZ0fNkYhTrapI95-4dt-rT-sChIRpjVtuWY8ZIDVprkPVzF872RSTgZfkZxmeorBJ32LkZqqElKijZWroOKfZpDfYvvOSgF8rEjjgA2PMGPAmzRrIhYt7MWVM0OC8Bt3UlaLp5ttO9XquKG-EivIgWv6yV-asy1yeFV7PM_ONkevc1rsAq3qg_8F4rEMjQU",
    alt: "Instagram user photo of a beautifully made bed with brand's linens",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtaw2-OabNbP3MOCZleN4dhrEG8M7wre76iqTm8grBjXYiziIxOF-8BoiAMivv2BY5zzDt9Zh_xKrz15JOtJwTtiWy1IETtERbz95V7yeK5Qmlvavut3n7YvbcoBtO907nvEraSX-2S5Y7q-y1HYhXq5LPSt5QYpDc-1m7yeOR8a5hn458ujTMf-yvFYF7CkF2aLSJMH61crZaSnbfXcyhtK3wtPDBZwI51K8Xk-wr3fBrzD1v5tDECVvyXc6YINOrzAD5NwdCbVo",
    alt: "Instagram user photo of a minimalist home office setup",
  },
];

const faqs = [
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to over 50 countries. Shipping rates and delivery times vary by location and are calculated at checkout.",
  },
  {
    question: "How do I care for my handmade ceramics?",
    answer:
      "Our ceramics are generally dishwasher safe, but we recommend hand-washing with mild soap to preserve the glazed finish for years.",
  },
  {
    question: "Are your products truly limited batch?",
    answer:
      "Because our artisans work by hand and use seasonal natural dyes, we produce small quantities of each design every quarter.",
  },
];

function buildArchiveCardsFromCms(categories: CmsCategory[]) {
  return archiveCardsFallback.map((fallback, index) => {
    const category = categories[index];

    return {
      ...fallback,
      title: category?.name?.trim() || fallback.title,
      slug: category?.slug?.trim() || fallback.slug,
      subtitle: category?.description?.trim() || fallback.subtitle,
      image: category?.image?.trim() || fallback.image,
      alt: category?.name?.trim() ? `${category.name} collection` : fallback.alt,
    };
  });
}

export default async function BohemianHomePage() {
  const [heroBanners, siteConfig, cmsCategories] = await Promise.all([
    getActiveCmsBannersByPlacement("homepage_hero"),
    getSiteConfigMap(),
    getActiveCmsCategories(),
  ]);

  const heroBanner = heroBanners.find((banner) => banner.image_url?.trim());
  const heroImage = siteConfig.hero_desktop_image?.trim()
    || heroBanner?.image_url?.trim()
    || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=2400&q=80";

  const heroBadge = siteConfig.hero_badge?.trim() || "TERRA & LOOM PRESENTS";
  const heroHeadline = (siteConfig.hero_headline?.trim() || heroBanner?.title?.trim() || "Embrace the Warmth.")
    .replace(/\\n/g, "\n");
  const heroDescription = siteConfig.hero_description?.trim()
    || heroBanner?.content_text?.trim()
    || "Curating the finest bohemian treasures - from hand-tufted textiles to sun-baked ceramics - to transform your space into a sanctuary of natural beauty.";
  const heroCtaLabel = siteConfig.hero_cta1_label?.trim() || "Explore Collection";
  const heroCtaUrl = siteConfig.hero_cta1_url?.trim() || heroBanner?.link_url?.trim() || "/shop";

  const archiveCards = buildArchiveCardsFromCms(cmsCategories);

  return (
    <div className={`${manrope.className} bg-[#fcf9f4] text-[#1c1c19] selection:bg-[#ffdad2] selection:text-[#3d0600]`}>
      <OfferBanner />
      <PopupBannerGate />
      <Navbar activePage="home" />

      <main>
        <section className="w-full overflow-hidden">
          <div className="relative h-[calc(100vh-72px)] min-h-[560px] w-full md:h-[calc(100vh-82px)]">
            <Image
              src={heroImage}
              alt={heroBanner?.title?.trim() || "Bohemian living room with warm orange sofa and natural decor"}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fcf9f4]/90 via-[#fcf9f4]/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

            <div className={`relative z-10 flex h-full items-center ${BOHEMIAN_SITE_CONTAINER}`}>
              <div className="max-w-[560px]">
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.38em] text-[#6f6156]">
                  {heroBadge}
                </p>

                <h1 className={`${newsreader.className} mb-6 whitespace-pre-line text-[62px] leading-[0.95] text-[#9f3f29] md:text-[82px]`}>
                  {heroHeadline}
                </h1>

                <p className="mb-10 max-w-[520px] text-base leading-relaxed text-[#4f4741] md:text-[18px]">
                  {heroDescription}
                </p>

                <Link
                  href={heroCtaUrl}
                  className="inline-flex items-center gap-3 rounded-lg bg-[#9f3f29] px-8 py-4 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
                >
                  {heroCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f3ee] py-12">
          <div className={`${BOHEMIAN_SITE_CONTAINER} grid grid-cols-2 gap-8 md:grid-cols-4`}>
            <div className="flex items-center gap-4">
              <Truck className="h-8 w-8 text-[#9f3f29]" />
              <div>
                <p className="text-sm font-bold">Free Shipping</p>
                <p className="text-xs text-[#56423d]">On orders over $150</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <RotateCcw className="h-8 w-8 text-[#9f3f29]" />
              <div>
                <p className="text-sm font-bold">Easy Returns</p>
                <p className="text-xs text-[#56423d]">30-day window</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-[#9f3f29]" />
              <div>
                <p className="text-sm font-bold">Secure Payments</p>
                <p className="text-xs text-[#56423d]">100% encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Sparkles className="h-8 w-8 text-[#9f3f29]" />
              <div>
                <p className="text-sm font-bold">Handmade Quality</p>
                <p className="text-xs text-[#56423d]">By global artisans</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${BOHEMIAN_SITE_CONTAINER} py-24`}>
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className={`${newsreader.className} text-4xl italic text-[#1c1c19] md:text-5xl`}>The Curated Archive</h2>
              <p className="mt-4 text-lg text-[#56423d]">Discovery of ancient techniques in modern forms.</p>
            </div>
            <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#9f3f29]">
              View All Categories
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid h-[800px] grid-cols-1 gap-6 md:h-[600px] md:grid-cols-12">
            <Link href={`/shop?category=${archiveCards[0].slug}`} className="group relative overflow-hidden rounded-xl md:col-span-8">
              <Image
                src={archiveCards[0].image}
                alt={archiveCards[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className={`${newsreader.className} mb-2 text-4xl`}>{archiveCards[0].title}</h3>
                {archiveCards[0].subtitle ? <p className="italic tracking-wide">{archiveCards[0].subtitle}</p> : null}
              </div>
            </Link>

            <div className="grid gap-6 md:col-span-4 md:grid-rows-2">
              {archiveCards.slice(1).map((card) => (
                <Link key={card.title} href={`/shop?category=${card.slug}`} className="group relative overflow-hidden rounded-xl">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className={`${newsreader.className} text-2xl`}>{card.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f0ede8] py-24 md:py-32">
          <div className={BOHEMIAN_SITE_CONTAINER}>
            <div className="mb-16 text-center">
              <h2 className={`${newsreader.className} mb-6 text-5xl italic text-[#1c1c19] md:text-7xl`}>Spaces to Inhabit</h2>
              <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-[#56423d] md:text-xl">
                Find harmony in every corner of your sanctuary with pieces designed for mindful living.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {roomCards.map((room) => (
                <div key={room.room} className="flex flex-col gap-4">
                  <div className="group aspect-[4/5] overflow-hidden rounded-full border-8 border-[#fcf9f4]">
                    <Image
                      src={room.image}
                      alt={room.alt}
                      width={460}
                      height={575}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <p className={`${newsreader.className} mt-2 text-center text-xl italic`}>{room.room}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden py-24">
          <div className={`${BOHEMIAN_SITE_CONTAINER} flex flex-col items-center gap-16 md:flex-row`}>
            <div className="relative w-full md:w-1/2">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#dbe4c0] opacity-20 blur-3xl" />
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdYMMrk_iP8YI9r1TcSRJChlJxrF5_rPlKZEDvnGgqJkL-Jll4RGcXwnKg8e0ykkeSKBg9a3Ie1LRnwnVoZ1-ecU3WcyO3gh5aBxN7Mn7e0DwIPSGuNkOij5DAvUNYncfMFCcqFr_rPV7MwRFHfJjocOv3n1XZ1qqgTlpuXA1SOiVZ866hFFLg62dcIOV8N0N4j_Nu5kKT8Wx0s8WINMpKrTpukDykyMcEhR7ugo6gTN6Hucq5sV83CZYbI-avqR7vUgCSupzP974"
                alt="Close-up of a hand-loomed wool rug with intricate geometric patterns in muted cream and ochre tones"
                width={900}
                height={900}
                className="relative z-10 aspect-square w-full rounded-2xl object-cover shadow-2xl"
              />
            </div>

            <div className="w-full md:w-1/2">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#9f3f29]">Featured Craft</p>
              <h2 className={`${newsreader.className} mb-6 text-5xl italic leading-tight text-[#1c1c19]`}>The Saharan Drift Throw</h2>
              <p className="mb-8 text-lg leading-relaxed text-[#56423d]">
                Each Saharan Drift throw is hand-woven by a collective of women in the Atlas Mountains, using wool naturally dyed with indigo and pomegranate skins. A process that takes 14 days of patient labor.
              </p>
              <div className="mb-10 flex flex-wrap items-center gap-6">
                <span className={`${newsreader.className} text-3xl text-[#1c1c19]`}>$245.00</span>
                <span className="h-8 w-px bg-[#ddc0ba]" />
                <div className="flex items-center gap-1 text-[#5a6245]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 text-xs text-[#56423d]">(48 reviews)</span>
                </div>
              </div>
              <button className="flex items-center gap-4 rounded-lg bg-[#9f3f29] px-12 py-5 text-white transition-all active:scale-95 hover:opacity-90">
                Pre-order for July Batch
                <ShoppingBag className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section id="new-arrivals" className="bg-[#f6f3ee] py-24">
          <div className={BOHEMIAN_SITE_CONTAINER}>
            <div className="mb-16 flex items-end justify-between">
              <h2 className={`${newsreader.className} text-4xl italic text-[#1c1c19]`}>Freshly Harvested</h2>
              <Link href="/shop" className="text-sm font-medium text-[#56423d] underline decoration-[#ddc0ba] underline-offset-8">
                See the full collection
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              {newArrivals.map((item) => (
                <article key={item.title} className="group cursor-pointer">
                  <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-xl bg-[#f0ede8]">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.tag ? (
                      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-tight text-[#1c1c19]">
                        {item.tag}
                      </span>
                    ) : null}
                  </div>
                  <h4 className={`${newsreader.className} mb-1 text-xl transition-colors group-hover:text-[#9f3f29]`}>{item.title}</h4>
                  <p className="text-sm font-medium text-[#56423d]">{item.price}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden py-24">
          <div className={BOHEMIAN_SITE_CONTAINER}>
            <div className="grid grid-cols-1 items-center gap-20 md:grid-cols-2">
              <div className="grid grid-cols-2 gap-4">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC95laBVGT7l33J0TdPoEJ76KhoB5HIpDY6huh4veCGguHOkMla5i7YChPLj1cPxhjLgIf5_vPH0pqPkOdkzZIb-BHfOPI2dhQjSk6OOOQDUyyRgyZBXJCc7VpQ28qMaz5ALSRvFnuGoeBMAp1Dwr5y6CTut6Php6GM-yQk8mK3VIcx09RvqyJPolh3evwZUbLmV0BDLjW_Rg2CFL8Mids_h7RgC5uddCVr9swqs-ZFi1RrkisVHowXQ15r8MnolmKV76Jj6gJQLMM"
                  alt="Satisfied customer relaxing on a sofa with artisan pillows from Terra and Loom"
                  width={600}
                  height={600}
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBirCtsOc-AvQjVfrcND0PCWDIPzMEOrFDD27TBvDpb0opEkhLUMy_iPfYP3M1hTKbyPKGXm8jAAq74NXDrA50JP4WtbaNhFqZchOsMe8cuvRJpdpAySJyuCe_l6t0GDzGJGvgCvdhsyHu2VKFuYIY7I08AhD_g3yjYInMzBktUOG1JOfkuc1sCqSXEAnyK_QhZcA2pTxuNz9S7vkjvhAgh_8_0MzsYHHWArQBz_MyXMCW48kDfuXEKNA1CafNX8IRMd7B1iGWS0E"
                  alt="Light-filled corner of a home decorated with brand's ceramics and woven art"
                  width={600}
                  height={600}
                  className="mt-8 aspect-square w-full rounded-xl object-cover"
                />
              </div>

              <div>
                <div className="mb-6 flex items-center gap-1 text-[#9f3f29]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <h2 className={`${newsreader.className} mb-8 text-4xl italic`}>
                  &quot;The texture of the linen is unlike anything I&apos;ve owned. It brings a soul to my living room that mass-market pieces just can&apos;t match.&quot;
                </h2>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-[#ddc0ba]">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXmrgm9EaP3SDPzQ9ZGCIr_dhazudE8m0DqpNUlMQEv7RKDOFaGoXbzeJFoeQJ05gmP5kDn2Z42LGXHM97GE6eG5xOLnXKUiSbSWnSi-gf8wZ8zLQvAV1cxPfUMSyTeN1tudNPcGcx-PKYsbofozmCbu9o9VFaXNqvgc7YvF_8U-MweDo0ai2p9Wmib6IP7Nv2Bx6cjeU3jB1dDzZLI2Nwj55KVVdcsPmrDBDx9jYRELqbkep1r0p0Y83VM8xnWAIV5pCsaQE6ev4"
                      alt="Portrait of a smiling woman who is a brand advocate"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold">Elena Thorne</p>
                    <p className="text-sm text-[#56423d]">Interior Designer, NYC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="our-story" className="bg-[#ebe8e3] py-24">
          <div className={`${BOHEMIAN_SITE_CONTAINER} flex flex-col items-center gap-16 md:flex-row`}>
            <div className="w-full md:w-1/2">
              <h2 className={`${newsreader.className} mb-8 text-5xl italic leading-tight text-[#1c1c19]`}>
                Crafting Slowly, Living Better.
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-[#56423d]">
                We partner directly with family-run workshops across 12 countries. By removing the middleman, we ensure that the people who weave your rugs and throw your pots earn a sustainable living wage while preserving techniques passed down through generations.
              </p>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <span className="rounded-lg bg-[#bf573f] p-2 text-white">
                    <Leaf className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold">Natural Materials Only</p>
                    <p className="text-sm text-[#56423d]">No synthetics. No toxic dyes. Just pure Earth.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="rounded-lg bg-[#bf573f] p-2 text-white">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold">Artisan Co-ops</p>
                    <p className="text-sm text-[#56423d]">Empowering craft communities globally.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full md:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTAGOm-1Hgep81V9xadrEFE86iPyvNkOjCAq1yTFVrbdQw_VP8ElMKeC5q_qwLd6Pz1y4lHLeI25PTzySpLK3czdgG_V5vI9TblVhUQVkiPhYKuOVLIYlbn4RXZx2cg-rdcMM9nVWX6-d9ya9PE2wANm-VEmsgYSwDScpP5MhQBSFQAmnWYylB4HDgLqpy6kHi-YhQNnt1vb8taavKe_PRKYwZ4dYCXf4ucBMF_h80qEs1G_3lZeY9Cw6b6Ip1YWpUuN2Ora811Q"
                  alt="An artisan's hands working with wet clay on a pottery wheel"
                  width={800}
                  height={900}
                  className="h-[400px] w-full rounded-xl object-cover"
                />
                <div className="flex flex-col gap-4">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC89tKp2Fckzy1f1sTe7RNtXPiOIrApdwot58y0c8lYX5L6faXogXbrlN1yyTuOdvND48XRbGR2kioF3ary1HiGuaHPnXdZ5pmgICRNXrPYmMv0xN_-r4po9mlFHBU2vOkiw5yH-c64F-uhRjhnoN5nJPelk2u2132rZRXVFtJ5GDAfk6mc5yoaqIq1GnJ2cQ7NbQJHf-ORmiSznkkaIe2o5TtqkJh9qEVSSfpTx-8TGf0Mr2b880P2c2ryWCfayDwvMd78922vHXo"
                    alt="Detail of a hand weaving process on a traditional wooden loom"
                    width={400}
                    height={300}
                    className="h-[192px] w-full rounded-xl object-cover"
                  />
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ3M3S0bZZ-F9GuF75EncXGRkTi5oRg2gUQok2c_MSOA6dC0penQC4_zpxgpxN9mn6otK45GyILyHz5W46FHvrOMgokYl7dKCc_oMNu3imLhc7HlMBM79M4vOkS5OZvTuOXg4-s7WxI_dROUe_bnQMT8mAHH_yPW12yhXjAqYqioiB-c4GeesJEVQ0rXv5mn9o1Dg4SK62e7Z4MlOa5cJh0O56DB9_ACEPFcLW2mtvlywUZZasFmHelErF4xf1xSero5uOxMo1t9o"
                    alt="Drying herbs and natural pigments used for dyeing fabrics"
                    width={400}
                    height={300}
                    className="h-[192px] w-full rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className={`${BOHEMIAN_SITE_CONTAINER} mb-12 text-center`}>
            <h2 className={`${newsreader.className} mb-4 text-3xl italic`}>In Your Sanctuaries</h2>
            <p className="text-[#56423d]">
              Tag <span className="font-bold text-[#9f3f29]">@TerraAndLoom</span> to be featured
            </p>
          </div>

          <div className={`${BOHEMIAN_SITE_CONTAINER} grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6`}>
            {instagramShots.map((shot) => (
              <Image
                key={shot.image}
                src={shot.image}
                alt={shot.alt}
                width={320}
                height={320}
                className="aspect-square cursor-pointer object-cover transition-all hover:opacity-80"
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex rounded-lg border border-[#89726c] px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#1c1c19] transition-all hover:bg-[#f0ede8]"
            >
              Shop the Look
            </Link>
          </div>
        </section>

        <section className="bg-[#f6f3ee] py-24">
          <div className={BOHEMIAN_SITE_CONTAINER}>
            <div className="mx-auto max-w-3xl">
            <h2 className={`${newsreader.className} mb-12 text-center text-4xl italic`}>Curiosity Corner</h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <details key={item.question} className="group rounded-xl border-b border-transparent bg-white p-6 transition-all open:shadow-md">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                    {item.question}
                    <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 leading-relaxed text-[#56423d]">{item.answer}</p>
                </details>
              ))}
            </div>
            </div>
          </div>
        </section>

        <section className="bg-[#9f3f29] py-24 text-white">
          <div className={BOHEMIAN_SITE_CONTAINER}>
            <div className="mx-auto max-w-4xl text-center">
            <h2 className={`${newsreader.className} mb-6 text-5xl italic`}>Join Our Journal</h2>
            <p className="mb-12 text-lg opacity-90">Sign up for soulful inspiration, artisan stories, and 10% off your first curation.</p>
            <form className="mx-auto flex max-w-lg flex-col gap-4 md:flex-row">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-6 py-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="rounded-lg bg-white px-8 py-4 font-bold text-[#9f3f29] transition-all hover:bg-white/90">
                Subscribe
              </button>
            </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
