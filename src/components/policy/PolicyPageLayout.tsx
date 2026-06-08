import { getThemeSync } from "@/lib/themeSync";
import ClassicPolicyPageLayout from "@/themes/classic/components/policy/PolicyPageLayout";
import BohemianPolicyPageLayout from "@/themes/bohemian/components/policy/PolicyPageLayout";
import LuxuryPolicyPageLayout from "@/themes/luxury/components/policy/PolicyPageLayout";

export default function PolicyPageLayout(props: any) {
  const theme = getThemeSync();
  if (theme === "bohemian") return <BohemianPolicyPageLayout {...props} />;
  if (theme === "luxury") return <LuxuryPolicyPageLayout {...props} />;
  return <ClassicPolicyPageLayout {...props} />;
}
