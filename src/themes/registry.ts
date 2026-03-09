import dynamic from "next/dynamic";

const themes: Record<string, {
    HomePage: React.ComponentType;
    ShopPage: React.ComponentType;
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
};

export type ThemeName = string;
export default themes;
