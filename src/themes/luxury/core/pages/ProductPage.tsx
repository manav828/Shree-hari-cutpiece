"use client";

import Navbar from "@/themes/luxury/components/layout/Navbar";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ProductPage({ slug, serverData }: { slug: string; serverData?: any }) {
    const [selectedFabric, setSelectedFabric] = useState("boucle");

    return (
        <div className="bg-[#FAF9F8] text-black min-h-screen font-sans selection:bg-[#DE5C34] selection:text-white">
            {/* Navbar in dark mode using inverted colors or we can force a light mode nav. We will leave it as is, but it uses mix-blend-difference so it will invert automatically! */}
            <Navbar />

            <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

                {/* Left Side: Images */}
                <div className="bg-[#EBEBEB] w-full h-[60vh] lg:h-screen sticky top-0 flex flex-col items-center justify-center p-12">
                    <div className="relative w-full h-4/5 max-w-2xl">
                        <Image src={`https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2665&auto=format&fit=crop`} alt={slug} fill className="object-contain drop-shadow-2xl mix-blend-multiply" />
                    </div>

                    {/* Gallery Thumbnails */}
                    <div className="flex gap-4 mt-8">
                        <button className="w-16 h-16 border-2 border-[#D35334] p-1 bg-white relative">
                            <Image src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2665&auto=format&fit=crop" alt="thumb1" fill className="object-cover" />
                        </button>
                        <button className="w-16 h-16 border border-black/10 p-1 bg-white relative hover:border-black/30 transition-colors">
                            <Image src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=2669&auto=format&fit=crop" alt="thumb2" fill className="object-cover" />
                        </button>
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="p-10 md:p-20 overflow-y-auto">
                    <div className="pt-24 lg:pt-32 max-w-xl mx-auto">
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-8 flex gap-3">
                            <span className="hover:text-black cursor-pointer transition-colors">COLLECTION</span>
                            <span>&rsaquo;</span>
                            <span className="hover:text-black cursor-pointer transition-colors">SEATING</span>
                            <span>&rsaquo;</span>
                            <span className="text-black">LOUNGE CHAIRS</span>
                        </div>

                        <h1 className="font-playfair text-5xl md:text-7xl mb-6 capitalize leading-none tracking-tight">
                            The {slug.replace(/-/g, ' ')}
                        </h1>

                        <div className="flex items-center gap-6 mb-12">
                            <p className="text-3xl text-gray-400 font-light">$4,250</p>
                            <span className="text-[9px] uppercase tracking-widest text-[#D35334] bg-[#D35334]/10 px-3 py-1 font-bold">
                                Handcrafted To Order
                            </span>
                        </div>

                        <div className="space-y-6 text-gray-600 font-light text-[15px] leading-relaxed mb-12">
                            <p className="italic text-lg">
                                A masterclass in sculptural comfort. This signature piece blends mid-century silhouettes with contemporary organic forms, hand-crafted to order in our Italian atelier.
                            </p>
                            <p>
                                Designed by Alessandro Moretti, the Ethereal Chair is a celebration of negative space and premium materiality. Each frame is hand-carved from solid FSC-certified walnut and upholstered using traditional methods that ensure a lifetime of elegance and support.
                            </p>
                        </div>

                        {/* Upholstery Selector */}
                        <div className="mb-12">
                            <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] mb-6">Select Upholstery</h4>
                            <div className="flex gap-6">
                                <button onClick={() => setSelectedFabric("boucle")} className="flex flex-col items-center gap-3">
                                    <div className={`w-14 h-14 rounded-full border-2 p-1 ${selectedFabric === "boucle" ? "border-black" : "border-transparent"}`}>
                                        <div className="w-full h-full rounded-full bg-[#f4f1eb] shadow-inner" />
                                    </div>
                                    <span className="text-[9px] font-bold tracking-widest uppercase">Boucl&eacute;</span>
                                </button>

                                <button onClick={() => setSelectedFabric("velvet")} className="flex flex-col items-center gap-3">
                                    <div className={`w-14 h-14 rounded-full border-2 p-1 ${selectedFabric === "velvet" ? "border-black" : "border-transparent"}`}>
                                        <div className="w-full h-full rounded-full bg-[#2a2a2a] shadow-inner" />
                                    </div>
                                    <span className="text-[9px] font-bold tracking-widest uppercase text-gray-500">Velvet</span>
                                </button>

                                <button onClick={() => setSelectedFabric("leather")} className="flex flex-col items-center gap-3">
                                    <div className={`w-14 h-14 rounded-full border-2 p-1 ${selectedFabric === "leather" ? "border-black" : "border-transparent"}`}>
                                        <div className="w-full h-full rounded-full bg-[#a67b5b] shadow-inner" />
                                    </div>
                                    <span className="text-[9px] font-bold tracking-widest uppercase text-gray-500">Leather</span>
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-16">
                            <button className="flex-1 bg-[#2C2826] text-white py-5 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-black transition-colors">
                                Add To Bag
                            </button>
                            <button className="flex-1 border border-black/20 text-black py-5 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-black/5 transition-colors">
                                Request Concierge
                            </button>
                        </div>

                        {/* Accordions */}
                        <div className="border-t border-black/10">
                            <div className="py-6 border-b border-black/10 flex justify-between items-center cursor-pointer group">
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Dimensions</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                            <div className="py-6 border-b border-black/10 flex justify-between items-center cursor-pointer group">
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Materials</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                            <div className="py-6 border-b border-black/10 flex justify-between items-center cursor-pointer group">
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Care</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                        </div>

                    </div>
                </div>

            </main>

        </div>
    );
}
