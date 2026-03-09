import { getActiveTheme } from "@/lib/theme";
import themes from "@/themes/registry";

export const metadata = {
  title: "Shop All Fabrics | Shree Hari Cutpiece",
  description: "Browse our complete collection of premium cutpiece fabrics. Cotton, silk, georgette, rayon and more - all sold per meter.",
};

export default async function ShopAppPage() {
  const activeTheme = await getActiveTheme();

  // ThemeResolver handles resolving the correct page UI
  const themeConfig = themes[activeTheme] || themes["classic"];
  const ThemeShopPage = themeConfig.ShopPage;

  return <ThemeShopPage />;
}
