import { getThemeSync } from "@/lib/themeSync";
import ClassicProductCard from "@/themes/classic/components/shop/ProductCard";
import BohemianProductCard from "@/themes/bohemian/components/shop/ProductCard";
import LuxuryProductCard from "@/themes/luxury/components/shop/ProductCard";

export default function ProductCard(props: any) {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianProductCard {...props} />;
  if (theme === "luxury") return <LuxuryProductCard {...props} />;
  return <ClassicProductCard {...props} />;
}
