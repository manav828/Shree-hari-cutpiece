import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
    title: "Create Account | Shree Hari Cutpiece",
    description: "Create your Shree Hari Cutpiece customer account for faster checkout and order tracking.",
    path: "/signup",
    robots: {
        index: false,
        follow: false,
    },
});

export default function SignupLayout({ children }: { children: ReactNode }) {
    return children;
}