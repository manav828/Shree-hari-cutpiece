"use client";

import Navbar from "@/themes/luxury/components/layout/Navbar";
import Footer from "@/themes/luxury/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import CouponAnnouncementBar from "@/components/coupons/CouponAnnouncementBar";

export default function HomePage() {
    return (
        <div className="bg-[#050505] text-[#F5F5F7] min-h-screen font-sans selection:bg-[#D4AF37] selection:text-black">
            <CouponAnnouncementBar />
            <Navbar />

            <main>
                {/* 1. HERO SECTION */}
                <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                    {/* High-end Fabric Background */}
                    <div className="absolute inset-0 w-full h-full z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1584031402281-2244aa64c5d5?q=80&w=2670&auto=format&fit=crop"
                            alt="Premium Silk Fabric"
                            fill
                            className="object-cover opacity-60 mix-blend-luminosity scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
                        <span className="text-[#D4AF37] tracking-[0.4em] text-[10px] uppercase font-bold block mb-8">
                            The Pinnacle of Textile Artistry
                        </span>
                        <h1 className="font-serif text-5xl md:text-7xl lg:text-[7.5rem] leading-[1] text-white mb-8">
                            Elegance Woven<br /><span className="italic font-light text-[#D4AF37]">into</span> Reality
                        </h1>
                        <p className="text-gray-300 font-light text-xs md:text-sm max-w-xl mx-auto mb-12 leading-relaxed tracking-wide">
                            Discover our curated collection of haute couture fabrics and bespoke tailoring materials, sourced from the finest mills globally.
                        </p>
                        <Link href="/shop" className="inline-flex items-center gap-4 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-500 px-10 py-5 tracking-[0.2em] text-[10px] uppercase font-bold group">
                            View Collections
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>

                {/* 2. HORIZONTAL SCROLLING BANNER */}
                <section className="border-y border-white/10 bg-[#0a0a0a] py-6 overflow-hidden flex whitespace-nowrap relative">
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
                    <div className="animate-marquee flex items-center gap-12 text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]">
                        <span className="flex items-center gap-12">BESPOKE TAILORING <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">PREMIUM SILKS <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">ITALIAN LINENS <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">HAUTE COUTURE <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">EXOTIC BLENDS <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">ROYAL VELVETS <Star className="w-3 h-3" /></span>
                        {/* Duplicated for smooth loop */}
                        <span className="flex items-center gap-12">BESPOKE TAILORING <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">PREMIUM SILKS <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">ITALIAN LINENS <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">HAUTE COUTURE <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">EXOTIC BLENDS <Star className="w-3 h-3" /></span>
                        <span className="flex items-center gap-12">ROYAL VELVETS <Star className="w-3 h-3" /></span>
                    </div>
                </section>

                {/* 3. TEXT INFO / PHILOSOPHY SECTION */}
                <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center">
                    <span className="text-[#D4AF37] tracking-[0.3em] text-[10px] uppercase font-bold block mb-6">Our Legacy</span>
                    <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-10 max-w-4xl mx-auto italic text-white/90">
                        &quot;True luxury is found in the meticulous attention to detail and the uncompromising quality of the thread.&quot;
                    </h2>
                    <div className="w-px h-24 bg-gradient-to-b from-[#D4AF37] to-transparent mx-auto mb-10"></div>
                    <p className="text-gray-400 font-light text-sm max-w-2xl mx-auto leading-loose tracking-wide">
                        Founded on the principles of heritage craftsmanship, Shree Hari Cutpiece has spent decades curating fabrics that define eras. We bridge the gap between traditional weaving techniques and contemporary fashion demands, ensuring every yard of fabric tells a story of elegance and durability.
                    </p>
                </section>

                {/* 4. CATEGORIES (Visual Grid) */}
                <section className="py-20 px-6 md:px-12 bg-[#080808]">
                    <div className="max-w-[1600px] mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div>
                                <h2 className="font-serif text-4xl text-white mb-3">Curated Categories</h2>
                                <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold">Explore by materiality</p>
                            </div>
                            <Link href="/shop" className="text-[10px] uppercase tracking-[0.2em] font-bold text-white hover:text-[#D4AF37] border-b border-white hover:border-[#D4AF37] pb-1 transition-all">
                                View All Collections
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                            {[
                                { title: "Pure Silks", img: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2670&auto=format&fit=crop" },
                                { title: "Handwoven Cottons", img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2572&auto=format&fit=crop" },
                                { title: "Velvet & Jacquard", img: "https://images.unsplash.com/photo-1605335022137-05c05baef074?q=80&w=2669&auto=format&fit=crop" }
                            ].map((cat, i) => (
                                <Link href="/shop" key={i} className="group relative aspect-[4/5] overflow-hidden flex items-end p-8 lg:p-12 cursor-pointer bg-black">
                                    {/* Image layer */}
                                    <Image
                                        src={cat.img}
                                        alt={cat.title}
                                        fill
                                        className="object-cover transition-all duration-[2s] group-hover:scale-105 opacity-60 group-hover:opacity-90"
                                    />
                                    {/* Gradient overlay for text legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent"></div>

                                    {/* Content */}
                                    <div className="relative z-10 w-full flex justify-between items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-white font-serif text-2xl lg:text-3xl tracking-wide italic">{cat.title}</h3>
                                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] group-hover:text-black transition-all duration-500">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. SPECIAL DESIGNER / CRAFTSMANSHIP SECTION */}
                <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-white/5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative aspect-[3/4] w-full max-w-lg mx-auto lg:mx-0">
                            {/* Artistic decorative frame */}
                            <div className="absolute -inset-6 border border-[#D4AF37]/30 z-0 hidden md:block"></div>
                            <Image
                                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2670&auto=format&fit=crop"
                                alt="Designer at work"
                                fill
                                className="object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-1000"
                            />
                            <div className="absolute -bottom-10 -right-10 bg-[#0a0a0a] border border-[#D4AF37]/20 p-8 z-20 max-w-xs shadow-2xl hidden md:block">
                                <p className="font-serif italic text-lg text-white mb-4 leading-relaxed">&quot;The fabric speaks long before the silhouette is even drawn.&quot;</p>
                                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Head Designer</span>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 lg:pl-10">
                            <span className="text-[#D4AF37] tracking-[0.3em] text-[10px] uppercase font-bold block mb-6">Master Craftsmanship</span>
                            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-8 italic leading-tight">
                                Exclusive Designer<br />Reserves
                            </h2>
                            <p className="text-gray-400 font-light text-sm leading-loose mb-10 max-w-xl">
                                Our Designer Reserves represent the apex of our collection—limited-run bolts of fabric originally commissioned for runway shows and haute couture houses. These pieces possess unparalleled drape, luster, and structural memory.
                            </p>
                            <ul className="space-y-6 mb-14 max-w-lg">
                                {[
                                    "Sourced from historic Italian, French, and local mills.",
                                    "Strictly limited quantities—once gone, never restocked.",
                                    "Complimentary bespoke consultation with every purchase."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-xs tracking-widest uppercase leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/about" className="inline-flex items-center gap-4 bg-white text-black hover:bg-gray-200 transition-colors px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-bold">
                                Meet The Artisans
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
