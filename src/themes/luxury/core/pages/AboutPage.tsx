"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/themes/luxury/components/layout/Navbar";
import Footer from "@/themes/luxury/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import { ArrowRight, MapPin, Quote } from "lucide-react";

export default function LuxuryAboutPage() {
  return (
    <div className="bg-[#050505] text-[#F5F5F7] min-h-screen font-sans selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <CartSidebar />

      <main className="pt-20 pb-32">
        {/* Hero Section */}
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full z-0">
            <Image
              src="https://images.unsplash.com/photo-1584031402281-2244aa64c5d5?q=80&w=2670"
              alt="Premium Silk Fabric"
              fill
              className="object-cover opacity-60 mix-blend-luminosity scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
            <span className="text-[#D4AF37] tracking-[0.4em] text-[10px] uppercase font-bold block mb-8">
              A Textile Legacy Built on Trust
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[6.5rem] leading-[1.1] text-white mb-8">
              Crafting a Life<br />
              <span className="italic font-light text-[#D4AF37]">of</span> Warmth
            </h1>
            <p className="text-gray-300 font-light text-xs md:text-sm max-w-xl mx-auto mb-12 leading-relaxed tracking-wide">
              We believe that the spaces we inhabit should reflect the natural rhythms of life. Shree Hari is a curation of tactile, soulful objects designed to ground your daily rituals.
            </p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center border-t border-white/5">
          <span className="text-[#D4AF37] tracking-[0.3em] text-[10px] uppercase font-bold block mb-6">
            The Artisanal Philosophy
          </span>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-10 max-w-4xl mx-auto italic text-white/90">
            In a world accelerating towards the mass-produced, we choose the deliberate pace of the handmade.
          </h2>
          <div className="w-px h-24 bg-gradient-to-b from-[#D4AF37] to-transparent mx-auto mb-10" />
          <div className="text-gray-400 font-light text-sm max-w-2xl mx-auto leading-loose tracking-wide space-y-6">
            <p>
              We partner directly with master artisans—from the textile looms of Jaipur to the ceramic studios of Oaxaca—ensuring fair trade practices and the preservation of heritage techniques. Every piece in our collection is a testament to natural materials: organic cotton, responsibly sourced wool, and unglazed clay.
            </p>
            <p>
              This is not just commerce; it is an archive of human touch, designed to age beautifully within your sanctuary.
            </p>
          </div>
        </section>

        {/* Sanctuary Gallery */}
        <section className="py-24 px-6 md:px-12 bg-[#080808]">
          <Container className="max-w-[1600px] mx-auto">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="font-serif text-4xl text-white mb-3">Visit Our Sanctuary</h2>
              <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold">Flagship Studio &amp; Atelier</p>
              <p className="text-gray-400 font-light text-xs mt-4 leading-relaxed">
                Experience the tactile reality of our collections in our flagship studio in Jaipur. A space designed not just for retail, but for reflection.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 auto-rows-[300px]">
              {/* Large Feature */}
              <div className="md:col-span-8 md:row-span-2 relative group overflow-hidden bg-black">
                <Image
                  src="https://lh3.googleusercontent.com/aida/AP1WRLsdB8ykG0r9hgg-Cl3PIkw7p9p-Nm5BS6Mjks9oqSVJCayIHF0VdButeljN_xJkK-2lWk_xxQ247QfxXUU6V2dVXNdt_G20LaBs_GSqvUCTR2VRmsIHT3QBE2d6mqFO-ve6w88C623SzGCefRIEyZYdYmkVrUBKU8yzJnJS5NQNue5aPmhWZ9p7k6YG-snBRJZczF5x_bwpgj6dwLJQtiZ8s8tgkJYQSZGnmv6glt202Jv2eO655ATdOdY"
                  alt="Jaipur Atelier"
                  fill
                  className="object-cover transition-all duration-[2s] group-hover:scale-105 opacity-60 group-hover:opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 z-10">
                  <h3 className="text-white font-serif text-2xl lg:text-3xl tracking-wide italic">The Jaipur Atelier</h3>
                </div>
              </div>

              {/* Vertical image */}
              <div className="md:col-span-4 md:row-span-2 relative group overflow-hidden bg-black">
                <Image
                  src="https://lh3.googleusercontent.com/aida/AP1WRLstzZRAQNJJLG6Q3-ns0KJ5ofMtHfgwy3usq7JtoxamBKgUnG8US1qQuQw0_7JLOEOSxul6STN0mKJx2Jwg2_cIwOnGTIILLSiSS5a7_6o044ljzghbBeMXjVwVarYF8MZ6fVyhl-hCvVckOI0hJoYgrRGr_SiMqnjOGmdwhJpyNFKr72QVuT_FF0uID61PGDPFMqbpEdnHBWrxYx3yGkXK5t31O8M-guexVXTITVCSSuyn05Q6_aBWka4"
                  alt="Artisanal Corner"
                  fill
                  className="object-cover transition-all duration-[2s] group-hover:scale-105 opacity-50 group-hover:opacity-75"
                />
              </div>

              {/* Address card */}
              <div className="md:col-span-12 md:row-span-1 bg-[#0f0f0f] border border-white/5 p-10 flex flex-col justify-center items-center text-center">
                <MapPin className="w-8 h-8 text-[#D4AF37] mb-4" />
                <h4 className="font-serif text-white text-xl mb-2">Find Us</h4>
                <p className="text-gray-400 font-light text-xs tracking-wider uppercase">14 Heritage Way, Pink City, Jaipur, India</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Testimonial / Quote */}
        <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center border-t border-white/5">
          <Quote className="w-10 h-10 text-[#D4AF37]/35 mx-auto mb-8 rotate-180" />
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl leading-relaxed italic text-white/95 max-w-4xl mx-auto mb-10">
            &quot;True luxury is not about perfection, but about the presence of the human hand. A slightly irregular weave or a thumbprint on a bowl tells a story that machines cannot replicate.&quot;
          </blockquote>
          <cite className="text-[#D4AF37] tracking-[0.2em] text-[10px] uppercase font-bold not-italic">
            — Elena Rostova, Master Ceramicist
          </cite>
        </section>

        {/* Newsletter / Circle */}
        <section className="py-24 border-t border-white/5">
          <Container>
            <div className="max-w-4xl mx-auto bg-[#0f0f0f] border border-white/10 p-12 md:p-16 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="font-serif text-3xl text-white mb-4">Join the Circle</h2>
                <p className="text-gray-400 font-light text-xs leading-relaxed">
                  Subscribe for early access to new collections, artisan stories, and musings on slow living.
                </p>
              </div>
              <div className="flex-1 w-full">
                <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="YOUR EMAIL ADDRESS"
                    required
                    className="w-full bg-[#050505] border border-white/10 focus:border-[#D4AF37] focus:ring-0 px-4 py-3 text-white placeholder:text-gray-600 text-xs tracking-widest transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-xs tracking-widest px-8 py-3 transition-colors whitespace-nowrap"
                  >
                    SUBSCRIBE
                  </button>
                </form>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
