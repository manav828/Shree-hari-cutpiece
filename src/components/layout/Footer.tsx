import { getThemeSync } from "@/lib/themeSync";
import ClassicFooter from "@/themes/classic/components/layout/Footer";
import BohemianFooter from "@/themes/bohemian/components/layout/Footer";
import LuxuryFooter from "@/themes/luxury/components/layout/Footer";

export default function Footer() {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianFooter />;
  if (theme === "luxury") return <LuxuryFooter />;
  return <ClassicFooter />;
}
