import OfferBanner from "../components/home/OfferBanner";
import Navbar from "../components/layout/Navbar";
import CartSidebar from "../components/cart/CartSidebar";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import DescriptionSection from "../components/home/DescriptionSection";
import TrendingProjects from "../components/home/TrendingProjects";
import FeaturedProducts from "../components/home/FeaturedProducts";
import InstagramReels from "../components/home/InstagramReels";
import TrustSection from "../components/home/TrustSection";
import Inspiration from "../components/home/Inspiration";
import StoreSection from "../components/home/StoreSection";
import Footer from "../components/layout/Footer";
import PopupBannerGate from "../components/home/PopupBannerGate";
import HeroBannerCarousel from "../components/home/HeroBannerCarousel";
import { getActiveCmsBannersByPlacement, getSiteConfigMap } from "@/lib/cms";

export default async function ClassicHomePage() {
    const [heroBanners, siteConfig] = await Promise.all([
        getActiveCmsBannersByPlacement("homepage_hero"),
        getSiteConfigMap(),
    ]);

    const heroBannerLayout = siteConfig.hero_banner_layout === "full_width"
        ? "full_width"
        : "contained";

    return (
        <>
            <OfferBanner />
            <PopupBannerGate />
            <Navbar />
            <CartSidebar />
            <main>
                {heroBanners.length > 0 ? (
                    <HeroBannerCarousel banners={heroBanners} layoutMode={heroBannerLayout} />
                ) : <Hero />}
                <Categories />
                <TrendingProjects />
                <DescriptionSection />
                <FeaturedProducts />
                <InstagramReels />
                <TrustSection />
                <Inspiration />
                <StoreSection />
            </main>
            <Footer />
        </>
    );
}
