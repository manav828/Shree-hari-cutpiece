import { getThemeSync } from "@/lib/themeSync";
import ClassicBlogCard from "@/themes/classic/components/blog/BlogCard";
import BohemianBlogCard from "@/themes/bohemian/components/blog/BlogCard";

export default function BlogCard(props: any) {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianBlogCard {...props} />;
  // Luxury uses classic layout
  return <ClassicBlogCard {...props} />;
}
