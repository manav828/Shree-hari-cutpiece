import { getThemeSync } from "@/lib/themeSync";
import ClassicNavbar from "@/themes/classic/components/layout/Navbar";
import BohemianNavbar from "@/themes/bohemian/components/layout/Navbar";
import LuxuryNavbar from "@/themes/luxury/components/layout/Navbar";

export default function Navbar() {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianNavbar />;
  if (theme === "luxury") return <LuxuryNavbar />;
  return <ClassicNavbar />;
}
