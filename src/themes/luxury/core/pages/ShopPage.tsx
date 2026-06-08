import Navbar from "@/themes/luxury/components/layout/Navbar";
import Footer from "@/themes/luxury/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";

// Using the design from screen2.png (Wood background split with typography and large images)
export default function ShopPage() {
    return (
        <div className="bg-[#111312] text-white min-h-screen font-sans selection:bg-[#DE5C34] selection:text-white">
            <Navbar />

            <main className="pt-0">

                {/* Split Header */}
                <section className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                    <div className="relative h-full w-full min-h-[500px]">
                        <Image src="https://images.unsplash.com/photo-1597072689227-8882273e8f6a?q=80&w=2670&auto=format&fit=crop" fill className="object-cover" alt="Fabric" />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] uppercase tracking-[0.4em] text-white/50 w-[500px]">
                            ZERO COMPROMISE MATERIALS
                        </div>
                    </div>
                    <div className="flex flex-col justify-center px-12 lg:px-24 bg-[#111312] pt-32 lg:pt-0">
                        <span className="text-[#888] tracking-[0.2em] text-[8px] uppercase font-bold block mb-8">
                            AUTUMN / WINTER &apos;24
                        </span>
                        <h1 className="font-playfair text-6xl md:text-8xl leading-[1.1] text-white mb-10">
                            The<br />Art<br /><span className="italic">of</span><br />Living
                        </h1>
                        <p className="text-gray-400 font-light text-xs max-w-sm mb-16 leading-relaxed">
                            A curated dialogue between architectural precision and the raw soul of natural materials. Designed for the discerning.
                        </p>
                        <div className="flex items-center gap-8">
                            <button className="border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 px-10 py-5 tracking-[0.15em] text-[9px] uppercase font-bold">
                                Explore Collection
                            </button>
                            <Link href="#" className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#888] hover:text-white transition-colors flex items-center gap-4">
                                The Journal &rarr;
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Content Block */}
                <section className="bg-white text-black py-32 px-6 md:px-12 xl:px-24">
                    <div className="max-w-[1600px] mx-auto">

                        {/* Top wide image & text */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                            <div className="relative aspect-[16/9] w-full shadow-2xl">
                                <Image src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2664&auto=format&fit=crop" fill className="object-cover" alt="Interior" />
                            </div>
                            <div className="max-w-md">
                                <span className="text-[#888] tracking-[0.2em] text-[9px] uppercase font-bold block mb-6">
                                    PHILOSOPHY
                                </span>
                                <h2 className="font-playfair text-4xl md:text-5xl mb-8 italic">
                                    Honest materials, dishonest comfort.
                                </h2>
                                <p className="text-gray-500 font-light text-sm leading-relaxed">
                                    We believe that furniture should not only fill a space but define it. Each piece is a testament to the quiet power of understated luxury.
                                </p>
                            </div>
                        </div>

                        {/* Split grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                            <div className="flex flex-col">
                                <div className="relative aspect-square w-full mb-8">
                                    <Image src="https://images.unsplash.com/photo-1605335022137-05c05baef074?q=80&w=2669&auto=format&fit=crop" fill className="object-cover" alt="Leather" />
                                </div>
                                <h3 className="font-playfair text-2xl mb-4">Tactile Resilience</h3>
                                <p className="text-gray-500 font-light text-xs leading-relaxed max-w-xs">
                                    Hand-selected Italian hides that age with grace, developing a unique patina that tells the story of your home.
                                </p>
                            </div>

                            <div className="flex flex-col">
                                <div className="relative aspect-square w-full mb-8">
                                    <Image src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=2669&auto=format&fit=crop" fill className="object-cover" alt="Chair" />
                                </div>
                                <h3 className="font-playfair text-2xl mb-4">Sculptural Form</h3>
                                <p className="text-gray-500 font-light text-xs leading-relaxed max-w-xs">
                                    Inspired by mid-century modernism and contemporary architectural silhouettes.
                                </p>
                            </div>

                            <div className="flex items-center justify-center h-full min-h-[300px]">
                                <div className="border-l-2 border-black/10 pl-8 py-4">
                                    <h2 className="font-playfair text-3xl italic mb-6">
                                        &quot;Simplicity is the ultimate sophistication.&quot;
                                    </h2>
                                    <p className="text-[8px] tracking-[0.2em] font-bold text-gray-400 uppercase">
                                        &mdash; STUDIO LUXE
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
