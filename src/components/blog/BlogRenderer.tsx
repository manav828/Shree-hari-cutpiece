import { getThemeSync } from "@/lib/themeSync";
import ClassicBlogRenderer from "@/themes/classic/components/blog/BlogRenderer";
import BohemianBlogRenderer from "@/themes/bohemian/components/blog/BlogRenderer";

export default function BlogRenderer(props: any) {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianBlogRenderer {...props} />;
  return <ClassicBlogRenderer {...props} />;
}
