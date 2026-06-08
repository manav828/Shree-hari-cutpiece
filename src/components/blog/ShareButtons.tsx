import { getThemeSync } from "@/lib/themeSync";
import ClassicShareButtons from "@/themes/classic/components/blog/ShareButtons";
import BohemianShareButtons from "@/themes/bohemian/components/blog/ShareButtons";

export default function ShareButtons(props: any) {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianShareButtons {...props} />;
  return <ClassicShareButtons {...props} />;
}
