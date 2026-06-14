import { getActiveCmsBannersByPlacement } from "@/lib/cms";
import PopupBanner from "@/themes/classic/components/home/PopupBanner";

export default async function PopupBannerGate() {
    const banners = await getActiveCmsBannersByPlacement("popup");
    const banner = banners[0];

    if (!banner) return null;

    return (
        <PopupBanner
            title={banner.title}
            contentText={banner.content_text}
            imageUrl={banner.image_url}
            linkUrl={banner.link_url}
            bgColor={banner.bg_color}
            textColor={banner.text_color}
            buttonText={banner.button_text}
        />
    );
}
