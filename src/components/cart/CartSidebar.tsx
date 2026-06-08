import { getThemeSync } from "@/lib/themeSync";
import ClassicCartSidebar from "@/themes/classic/components/cart/CartSidebar";
import BohemianCartSidebar from "@/themes/bohemian/components/cart/CartSidebar";

export default function CartSidebar() {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianCartSidebar />;
  // Luxury uses classic layout
  return <ClassicCartSidebar />;
}
