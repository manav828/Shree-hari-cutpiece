"use client";

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/themes/bohemian/components/layout/Navbar";
import Footer from "@/themes/bohemian/components/layout/Footer";
import CartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import { MapPin, Quote } from "lucide-react";

const manrope = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const newsreader = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function BohemianAboutPage() {
  return (
    <div className={`${manrope.className} bg-[#fcf9f4] text-[#1c1c19] selection:bg-[#ffdad2] selection:text-[#3d0600] min-h-screen`}>
      <Navbar />
      <CartSidebar />

      <main>
        {/* Hero Section */}
        <section className="w-full relative min-h-[716px] flex flex-col justify-center bg-[#ffffff]">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[716px] w-full">
            <div className="md:col-span-5 flex flex-col justify-center p-8 md:p-24 bg-[#ffffff] z-10">
              <div className="max-w-md">
                <h1 className={`${newsreader.className} text-4xl md:text-5xl lg:text-6xl text-[#9f3f29] leading-tight mb-6`}>
                  Crafting a Life of Warmth
                </h1>
                <p className="text-[#56423d] text-lg leading-relaxed font-light">
                  We believe that the spaces we inhabit should reflect the natural rhythms of life. Terra &amp; Loom is a curation of tactile, soulful objects designed to ground your daily rituals.
                </p>
              </div>
            </div>
            <div className="md:col-span-7 relative overflow-hidden min-h-[400px] md:min-h-0">
              <Image
                alt="Artisanal boutique interior"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover"
                src="https://lh3.googleusercontent.com/aida/AP1WRLsdB8ykG0r9hgg-Cl3PIkw7p9p-Nm5BS6Mjks9oqSVJCayIHF0VdButeljN_xJkK-2lWk_xxQ247QfxXUU6V2dVXNdt_G20LaBs_GSqvUCTR2VRmsIHT3QBE2d6mqFO-ve6w88C623SzGCefRIEyZYdYmkVrUBKU8yzJnJS5NQNue5aPmhWZ9p7k6YG-snBRJZczF5x_bwpgj6dwLJQtiZ8s8tgkJYQSZGnmv6glt202Jv2eO655ATdOdY"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff] via-transparent to-transparent md:block hidden" />
            </div>
          </div>
        </section>

        {/* Mission & Process */}
        <section className="relative py-32 px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              alt="Natural textures background"
              fill
              sizes="100vw"
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida/AP1WRLs2aiu0_q59c-Jp7b8qgcAmSNmZ9nxcxBw6MFivqtiQ5odJEyVjt2R8MuzedycNqLrZTdLXrYMeWbNxKPATWVsWZPoQAl3wea9xOKucuCbPUFXvpu-22BXkJ7A2rNDaDvZCP6D5w8RC4yjfSVSRCiLWwXqkjovIe4Ms8btqj8byfF9Zf9LMlfHrli1SBvbS2mtOvyOGJlYOZI6XOT1GrJtbScqgyYaHI0xOnw432b56lSaIqRbuTXxioKg"
            />
            <div className="absolute inset-0 bg-[#fcf9f4]/80 backdrop-blur-[2px]" />
          </div>
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="w-full md:w-1/2 md:sticky md:top-40">
                <h2 className={`${newsreader.className} text-3xl md:text-4xl text-[#1c1c19] mb-4`}>
                  The Artisanal Philosophy
                </h2>
                <div className="h-1 w-12 bg-[#9f3f29] mb-8" />
              </div>
              <div className="w-full md:w-1/2 space-y-8 text-[#56423d] text-lg leading-relaxed font-light">
                <p>
                  In a world accelerating towards the mass-produced, we choose the deliberate pace of the handmade. Our philosophy is rooted in the conviction that objects carry the energy of their makers.
                </p>
                <p>
                  We partner directly with master artisans—from the textile looms of Jaipur to the ceramic studios of Oaxaca—ensuring fair trade practices and the preservation of heritage techniques. Every piece in our collection is a testament to natural materials: organic cotton, responsibly sourced wool, and unglazed clay.
                </p>
                <p>
                  This is not just commerce; it is an archive of human touch, designed to age beautifully within your sanctuary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Studio & Shop Gallery */}
        <section className="py-24 px-8 bg-[#f6f3ee] relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className={`${newsreader.className} text-3xl md:text-4xl text-[#9f3f29] mb-4`}>Visit Our Sanctuary</h2>
              <p className="text-[#56423d]">Experience the tactile reality of our collections in our flagship studio in Jaipur. A space designed not just for retail, but for reflection.</p>
            </div>
            {/* Bento-style Asymmetric Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 auto-rows-[300px]">
              {/* Large Feature */}
              <div className="md:col-span-8 md:row-span-2 relative group overflow-hidden rounded bg-[#f0ede8]">
                <div className="w-full h-full relative">
                  <Image
                    alt="The Jaipur Atelier"
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLsdB8ykG0r9hgg-Cl3PIkw7p9p-Nm5BS6Mjks9oqSVJCayIHF0VdButeljN_xJkK-2lWk_xxQ247QfxXUU6V2dVXNdt_G20LaBs_GSqvUCTR2VRmsIHT3QBE2d6mqFO-ve6w88C623SzGCefRIEyZYdYmkVrUBKU8yzJnJS5NQNue5aPmhWZ9p7k6YG-snBRJZczF5x_bwpgj6dwLJQtiZ8s8tgkJYQSZGnmv6glt202Jv2eO655ATdOdY"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-8">
                  <h3 className={`${newsreader.className} text-2xl text-white`}>The Jaipur Atelier</h3>
                </div>
              </div>
              {/* Vertical Detail */}
              <div className="md:col-span-4 md:row-span-2 relative group overflow-hidden rounded bg-[#f0ede8]">
                <div className="w-full h-full relative">
                  <Image
                    alt="Artisanal shop corner"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLstzZRAQNJJLG6Q3-ns0KJ5ofMtHfgwy3usq7JtoxamBKgUnG8US1qQuQw0_7JLOEOSxul6STN0mKJx2Jwg2_cIwOnGTIILLSiSS5a7_6o044ljzghbBeMXjVwVarYF8MZ6fVyhl-hCvVckOI0hJoYgrRGr_SiMqnjOGmdwhJpyNFKr72QVuT_FF0uID61PGDPFMqbpEdnHBWrxYx3yGkXK5t31O8M-guexVXTITVCSSuyn05Q6_aBWka4"
                  />
                </div>
              </div>
              {/* Horizontal Detail */}
              <div className="md:col-span-12 md:row-span-1 bg-[#dbe4c0] rounded p-10 flex flex-col justify-center items-center text-center">
                <MapPin className="h-10 w-10 text-[#5e6649] mb-4" />
                <h4 className={`${newsreader.className} text-2xl text-[#5e6649] mb-2`}>Find Us</h4>
                <p className="text-[#5e6649]/80 font-medium">14 Heritage Way, Pink City, Jaipur, India</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Quote */}
        <section className="py-32 px-8 bg-[#e5e2dd] flex items-center justify-center relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9f3f29]/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <Quote className="h-16 w-16 text-[#9f3f29]/30 mx-auto mb-6 rotate-180" />
            <blockquote className={`${newsreader.className} text-2xl md:text-4xl text-[#1c1c19] leading-tight mb-8 italic`}>
              &quot;True luxury is not about perfection, but about the presence of the human hand. A slightly irregular weave or a thumbprint on a bowl tells a story that machines cannot replicate.&quot;
            </blockquote>
            <cite className="text-[#9f3f29] font-bold tracking-widest uppercase text-sm not-italic">
              — Elena Rostova, Master Ceramicist
            </cite>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24 px-8 bg-[#fcf9f4]">
          <div className="max-w-4xl mx-auto bg-[#f6f3ee] p-12 md:p-16 rounded border border-[#ddc0ba]/15 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className={`${newsreader.className} text-3xl text-[#9f3f29] mb-4`}>Join the Circle</h2>
              <p className="text-[#56423d] mb-6 md:mb-0">Subscribe for early access to new collections, artisan stories, and musings on slow living.</p>
            </div>
            <div className="flex-1 w-full">
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="w-full bg-[#ebe8e3] border-0 border-b border-[#9f3f29]/20 focus:border-[#9f3f29] focus:ring-0 px-4 py-3 text-[#1c1c19] placeholder:text-[#56423d]/50 transition-colors"
                  placeholder="Your email address"
                  required
                  type="email"
                />
                <button className="bg-[#9f3f29] hover:bg-[#9f3f29]/90 text-white font-medium px-8 py-3 rounded transition-colors whitespace-nowrap shadow-[0_8px_32px_-4px_rgba(159,63,41,0.15)]" type="submit">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
