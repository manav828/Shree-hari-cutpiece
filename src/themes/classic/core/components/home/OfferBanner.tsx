import CouponAnnouncementBar from "../../../../../components/coupons/CouponAnnouncementBar";
import { getActiveCmsBannersByPlacement } from "@/lib/cms";
import CmsAnnouncementBar from "@/themes/classic/components/home/CmsAnnouncementBar";

export default async function OfferBanner() {
  const banners = await getActiveCmsBannersByPlacement("announcement_bar");

  if (banners.length > 0) {
    return <CmsAnnouncementBar banners={banners} />;
  }

  return <CouponAnnouncementBar theme="classic" />;
}
