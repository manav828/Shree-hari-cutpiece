"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type BannerCoupon = {
    id: string;
    code: string;
    title: string;
    description: string | null;
    destination_url: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
};

export default function CouponAnnouncementBar() {
    const { user } = useAuth();
    const [coupons, setCoupons] = useState<BannerCoupon[]>([]);
    const [currentOffer, setCurrentOffer] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const run = async () => {
            const query = user?.id ? `?userId=${encodeURIComponent(user.id)}` : "";
            const res = await fetch(`/api/coupons/banner${query}`);
            const json = await res.json();
            if (!res.ok) return;
            setCoupons(json.coupons || []);
        };
        run();
    }, [user?.id]);

    useEffect(() => {
        if (coupons.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentOffer((prev) => (prev + 1) % coupons.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [coupons.length]);

    const offer = useMemo(() => coupons[currentOffer], [coupons, currentOffer]);

    if (!isVisible || !offer) return null;

    const savingsText = offer.discount_type === "percentage"
        ? `${offer.discount_value}% OFF`
        : `₹${offer.discount_value} OFF`;

    return (
        <div className="bg-[#9f3f29] text-[#fcf9f4] relative overflow-hidden border-b border-[#e8ddd3]/10">
            <div className="container-premium py-3 flex items-center justify-center gap-4 text-sm font-sans tracking-wide">
                <Link href={offer.destination_url || "/shop"} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <span className="animate-pulse">✨</span>
                    <span>{offer.title || offer.description || "Exclusive Offer"}</span>
                    <span className="bg-[#fcf9f4]/20 text-[#fcf9f4] px-2 py-0.5 rounded text-xs font-semibold">
                        {savingsText}
                    </span>
                    <span className="bg-[#fcf9f4]/20 text-[#fcf9f4] px-2 py-0.5 rounded text-xs font-semibold">
                        Code: {offer.code}
                    </span>
                    <svg className="w-4 h-4 text-[#fcf9f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[#fcf9f4]/20 rounded-full transition-colors"
                    aria-label="Close offer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {coupons.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex">
                    {coupons.map((coupon, index) => (
                        <div
                            key={coupon.id}
                            className={`h-0.5 flex-1 transition-all duration-300 ${
                                index === currentOffer ? "bg-[#fcf9f4]" : "bg-[#fcf9f4]/30"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
