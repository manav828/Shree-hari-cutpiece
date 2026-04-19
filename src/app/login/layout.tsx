import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
    title: "Login | Shree Hari Cutpiece",
    description: "Sign in to your Shree Hari Cutpiece account to track orders and manage saved details.",
    path: "/login",
    robots: {
        index: false,
        follow: false,
    },
});

export default function LoginLayout({ children }: { children: ReactNode }) {
    return children;
}