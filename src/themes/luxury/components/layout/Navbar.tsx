"use client";

import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
    const { items } = useCart();
    const itemCount = items.reduce((total, item) => total + (item.quantity || 1), 0);

    return (
        <header className="absolute w-full top-0 z-50 transition-all duration-500 bg-transparent text-white mix-blend-difference">
            <div className="px-8 py-8 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <Link href="/" className="font-serif text-2xl tracking-[0.2em] flex items-center gap-2">
                        <span className="font-light">SHREE</span> HARI
                    </Link>

                    {/* Left Links */}
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/shop" className="text-[11px] uppercase tracking-[0.15em] hover:opacity-70 transition-opacity">Collections</Link>
                        <Link href="/shop" className="text-[11px] uppercase tracking-[0.15em] hover:opacity-70 transition-opacity">Living</Link>
                        <Link href="/shop" className="text-[11px] uppercase tracking-[0.15em] hover:opacity-70 transition-opacity">Dining</Link>
                        <Link href="/about" className="text-[11px] uppercase tracking-[0.15em] hover:opacity-70 transition-opacity">Heritage</Link>
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center border-b border-white/30 pb-1">
                        <Search className="w-4 h-4 stroke-[1.5] mr-2" />
                        <input
                            type="text"
                            placeholder="SEARCH"
                            className="bg-transparent border-none outline-none text-[11px] tracking-[0.15em] w-32 placeholder:text-white/60 text-white"
                        />
                    </div>
                    <button className="relative hover:opacity-70 transition-opacity">
                        <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 text-[10px] w-4 h-4 bg-white text-black rounded-full flex items-center justify-center font-medium">
                                {itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
