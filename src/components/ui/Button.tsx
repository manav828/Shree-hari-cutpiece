import { getThemeSync } from "@/lib/themeSync";
import ClassicButton from "@/themes/classic/components/ui/Button";
import BohemianButton from "@/themes/bohemian/components/ui/Button";
import LuxuryButton from "@/themes/luxury/components/ui/Button";

export default function Button(props: any) {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianButton {...props} />;
  if (theme === "luxury") return <LuxuryButton {...props} />;
  return <ClassicButton {...props} />;
}
