import dynamic from "next/dynamic";

type ThemeShopPageProps = {
    searchParams?: {
        category?: string;
    };
};

const themes: Record<string, {
    HomePage: React.ComponentType;
    ShopPage: React.ComponentType<ThemeShopPageProps>;
    ProductPage: React.ComponentType<{ slug: string }>;
}> = {
    classic: {
        HomePage: dynamic(() => import("@/themes/classic/pages/HomePage")),
        ShopPage: dynamic(() => import("@/themes/classic/pages/ShopPage")),
        ProductPage: dynamic(() => import("@/themes/classic/pages/ProductPage")),
    },
    luxury: {
        HomePage: dynamic(() => import("@/themes/luxury/pages/HomePage")),
        ShopPage: dynamic(() => import("@/themes/luxury/pages/ShopPage")),
        ProductPage: dynamic(() => import("@/themes/luxury/pages/ProductPage")),
    },
    bohemian: {
        HomePage: dynamic(() => import("@/themes/bohemian/pages/HomePage")),
        ShopPage: dynamic(() => import("@/themes/bohemian/pages/ShopPage")),
        ProductPage: dynamic(() => import("@/themes/bohemian/pages/ProductPage")),
    },
};

export type ThemeName = keyof typeof themes;
export default themes;
