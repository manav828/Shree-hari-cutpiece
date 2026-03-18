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

export default function ClassicHomePage() {
    return (
        <>
            <OfferBanner />
            <Navbar />
            <CartSidebar />
            <main>
                <Hero />
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
