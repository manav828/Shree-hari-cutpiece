import dynamic from "next/dynamic";
import { BlogPageProps, BlogDetailPageProps } from "@/types/blog";

type ThemeShopPageProps = {
    searchParams?: {
        category?: string;
    };
};

const themes: Record<string, {
    HomePage: React.ComponentType;
    ShopPage: React.ComponentType<ThemeShopPageProps>;
    ProductPage: React.ComponentType<{ slug: string }>;
    BlogPage: React.ComponentType<BlogPageProps>;
    BlogDetailPage: React.ComponentType<BlogDetailPageProps>;
    AboutPage: React.ComponentType;
}> = {
    classic: {
        HomePage: dynamic(() => import("@/themes/classic/pages/HomePage")),
        ShopPage: dynamic(() => import("@/themes/classic/pages/ShopPage")),
        ProductPage: dynamic(() => import("@/themes/classic/pages/ProductPage")),
        BlogPage: dynamic(() => import("@/themes/classic/pages/BlogPage")),
        BlogDetailPage: dynamic(() => import("@/themes/classic/pages/BlogDetailPage")),
        AboutPage: dynamic(() => import("@/themes/classic/pages/AboutPage")),
    },
    luxury: {
        HomePage: dynamic(() => import("@/themes/luxury/pages/HomePage")),
        ShopPage: dynamic(() => import("@/themes/luxury/pages/ShopPage")),
        ProductPage: dynamic(() => import("@/themes/luxury/pages/ProductPage")),
        BlogPage: dynamic(() => import("@/themes/luxury/pages/BlogPage")),
        BlogDetailPage: dynamic(() => import("@/themes/luxury/pages/BlogDetailPage")),
        AboutPage: dynamic(() => import("@/themes/luxury/pages/AboutPage")),
    },
    bohemian: {
        HomePage: dynamic(() => import("@/themes/bohemian/pages/HomePage")),
        ShopPage: dynamic(() => import("@/themes/bohemian/pages/ShopPage")),
        ProductPage: dynamic(() => import("@/themes/bohemian/pages/ProductPage")),
        BlogPage: dynamic(() => import("@/themes/bohemian/pages/BlogPage")),
        BlogDetailPage: dynamic(() => import("@/themes/bohemian/pages/BlogDetailPage")),
        AboutPage: dynamic(() => import("@/themes/bohemian/pages/AboutPage")),
    },
};

export type ThemeName = keyof typeof themes;
export default themes;
