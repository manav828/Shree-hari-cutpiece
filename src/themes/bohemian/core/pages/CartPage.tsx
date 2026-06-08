import Navbar from "@/themes/bohemian/components/layout/Navbar";
import Footer from "@/themes/bohemian/components/layout/Footer";
import CartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import BohemianCartFullPageClient from "@/themes/bohemian/components/cart/BohemianCartFullPageClient";

export default function BohemianCartPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f4]">
      <Navbar activePage="shop" />
      <CartSidebar />
      <BohemianCartFullPageClient />
      <Footer />
    </div>
  );
}