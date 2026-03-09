import { getActiveTheme } from "@/lib/theme";
import themes from "@/themes/registry";

export default async function Home() {
  const activeTheme = await getActiveTheme();
  const ThemeHomePage = themes[activeTheme].HomePage;
  return <ThemeHomePage />;
}
