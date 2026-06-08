import { getThemeSync } from "@/lib/themeSync";
import ClassicContainer from "@/themes/classic/components/ui/Container";
import BohemianContainer from "@/themes/bohemian/components/ui/Container";
import LuxuryContainer from "@/themes/luxury/components/ui/Container";

export default function Container(props: any) {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianContainer {...props} />;
  if (theme === "luxury") return <LuxuryContainer {...props} />;
  return <ClassicContainer {...props} />;
}
