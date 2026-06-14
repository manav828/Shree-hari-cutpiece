"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import theme-specific reviews pages
const BohemianReviewsPage = dynamic(
    () => import("@/themes/bohemian/pages/ReviewsPage"),
    { loading: () => <PageLoader /> }
);

const ClassicReviewsPage = dynamic(
    () => import("@/themes/classic/pages/ReviewsPage"),
    { loading: () => <PageLoader /> }
);

const LuxuryReviewsPage = dynamic(
    () => import("@/themes/luxury/pages/ReviewsPage"),
    { loading: () => <PageLoader /> }
);

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    );
}

export default function ReviewsPageRouter() {
    const params = useParams();
    const slug = params?.slug as string;
    const [activeTheme, setActiveTheme] = useState<"classic" | "luxury" | "bohemian">("classic");
    const [showReviews, setShowReviews] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/theme", { cache: "no-store" }).then((res) => res.json().catch(() => ({}))),
            fetch("/api/admin/settings/reviews", { cache: "no-store" }).then((res) => res.json().catch(() => ({})))
        ])
        .then(([themeData, settingsData]) => {
            if (themeData.theme && ["classic", "luxury", "bohemian"].includes(themeData.theme)) {
                setActiveTheme(themeData.theme);
            }
            setShowReviews(settingsData.showProductReviews ?? true);
        })
        .catch(() => {
            setActiveTheme("classic");
            setShowReviews(true);
        })
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <PageLoader />;
    }

    if (showReviews === false) {
        notFound();
    }

    if (activeTheme === "bohemian") {
        return (
            <Suspense fallback={<PageLoader />}>
                <BohemianReviewsPage />
            </Suspense>
        );
    } else if (activeTheme === "luxury") {
        return (
            <Suspense fallback={<PageLoader />}>
                <LuxuryReviewsPage />
            </Suspense>
        );
    } else {
        return (
            <Suspense fallback={<PageLoader />}>
                <ClassicReviewsPage />
            </Suspense>
        );
    }
}
