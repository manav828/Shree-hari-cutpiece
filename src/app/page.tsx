import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import OfferBanner from "@/components/home/OfferBanner";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import DescriptionSection from "@/components/home/DescriptionSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import InstagramReels from "@/components/home/InstagramReels";
import TrustSection from "@/components/home/TrustSection";
import Inspiration from "@/components/home/Inspiration";
import StoreSection from "@/components/home/StoreSection";

export default function Home() {
  return (
    <>
      <OfferBanner />
      <Navbar />
      <CartSidebar />
      <main>
        <Hero />
        <Categories />
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
