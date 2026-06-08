import Link from "next/link";
import { getActiveCmsBannersByPlacement } from "@/lib/cms";

export default async function ShopTopBanner() {
    const banners = await getActiveCmsBannersByPlacement("shop_top");
    const banner = banners[0];

    if (!banner) return null;

    return (
        <div
            className="rounded-xl p-4 mb-8 border border-black/10"
            style={{ backgroundColor: banner.bg_color, color: banner.text_color }}
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="font-semibold text-base">{banner.title}</p>
                    {banner.content_text ? <p className="text-sm opacity-90 mt-1">{banner.content_text}</p> : null}
                </div>
                <Link
                    href={banner.link_url || "/shop"}
                    className="px-3 py-2 text-sm font-medium rounded-md bg-black/20 hover:bg-black/30"
                >
                    Explore
                </Link>
            </div>
        </div>
    );
}
