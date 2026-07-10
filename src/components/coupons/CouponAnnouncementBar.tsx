"use client";

import { useEffect, useState } from "react";
import { getThemeSync } from "@/lib/themeSync";
import ClassicCouponAnnouncementBar from "@/themes/classic/components/coupons/CouponAnnouncementBar";
import BohemianCouponAnnouncementBar from "@/themes/bohemian/components/coupons/CouponAnnouncementBar";
import LuxuryCouponAnnouncementBar from "@/themes/luxury/components/coupons/CouponAnnouncementBar";
import { parseThemeValue, STOREFRONT_THEME_COOKIE } from "@/lib/themeSelection";

export default function CouponAnnouncementBar(props: any) {
  const [theme, setTheme] = useState(() => props.theme || getThemeSync());

  useEffect(() => {
    if (props.theme) {
      setTheme(props.theme);
      return;
    }
    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp('(^| )' + STOREFRONT_THEME_COOKIE + '=([^;]+)'));
      if (match) {
        const cookieTheme = parseThemeValue(match[2]);
        if (cookieTheme && cookieTheme !== theme) {
          setTheme(cookieTheme);
        }
      }
    }
  }, [theme, props.theme]);

  if (theme === "bohemian") return <BohemianCouponAnnouncementBar {...props} />;
  if (theme === "luxury") return <LuxuryCouponAnnouncementBar {...props} />;
  return <ClassicCouponAnnouncementBar {...props} />;
}
