import Image from "next/image";
import Navbar from "@/themes/classic/components/layout/Navbar";
import Footer from "@/themes/classic/components/layout/Footer";
import CartSidebar from "@/themes/classic/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { brand, getWhatsAppUrl } from "@/lib/brand";

const milestones = [
  {
    year: "2011",
    title: "Store Foundation",
    description: "Started as a neighborhood textile counter focused on quality-driven cutpiece fabrics.",
  },
  {
    year: "2016",
    title: "Category Expansion",
    description: "Expanded into bridal, festive, and premium designer textile collections.",
  },
  {
    year: "2021",
    title: "Digital Orders",
    description: "Introduced assisted online ordering with WhatsApp consultation and verified dispatch flow.",
  },
  {
    year: "Today",
    title: "Trusted Fabric Partner",
    description: "Serving thousands of repeat customers from Ahmedabad and across India.",
  },
];

const values = [
  {
    title: "Quality Without Compromise",
    description: "Every fabric lot is hand-checked for texture, drape, and finishing before it reaches the shelf.",
  },
  {
    title: "Honest Fabric Advice",
    description: "We recommend what suits your design, occasion, and budget instead of pushing one-size choices.",
  },
  {
    title: "Personalized Support",
    description: "From first-time buyers to boutique owners, each customer gets practical, personal guidance.",
  },
];

export default function ClassicAboutPage() {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="pt-0 pb-20 bg-background-secondary">
        <section className="relative h-[360px] sm:h-[420px] lg:h-[500px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1800&q=80"
            alt="Textile rolls in a curated store"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1f1815]/85 via-[#1f1815]/60 to-[#1f1815]/20" />
          <Container className="relative h-full flex items-center">
            <div className="max-w-2xl text-white">
              <p className="text-xs sm:text-sm tracking-[0.32em] uppercase mb-4 text-white/80">Our Story</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">A Textile Legacy Built on Trust</h1>
              <p className="text-white/85 text-base sm:text-lg leading-relaxed">
                From local tailoring needs to premium occasion wear, Shree Hari Cutpiece has become a trusted fabric destination for families and designers.
              </p>
            </div>
          </Container>
        </section>

        <section className="-mt-10 relative z-10 mb-16">
          <Container>
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
              <div className="lg:col-span-7 bg-white border border-border/70 shadow-premium p-6 sm:p-8 lg:p-10">
                <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-5">From Ahmedabad, with Craft in Every Meter</h2>
                <p className="text-text-secondary text-lg leading-relaxed mb-6">
                  We began with one clear idea: give customers better fabric options with transparent guidance. Over the years, we have helped thousands of families, tailors, and boutique teams select the right fabrics for bridalwear, festive outfits, daily wear, and custom designs.
                </p>
                <p className="text-text-secondary text-lg leading-relaxed">
                  At our store in {brand.city}, you can compare textures in person, understand drape before purchase, and get practical support on quantity planning, styling direction, and care instructions.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mt-8">
                  <div className="bg-accent-light border border-accent/15 p-4">
                    <p className="font-serif text-3xl text-accent">10+</p>
                    <p className="text-xs tracking-[0.2em] uppercase text-text-secondary mt-1">Years</p>
                  </div>
                  <div className="bg-accent-light border border-accent/15 p-4">
                    <p className="font-serif text-3xl text-accent">5000+</p>
                    <p className="text-xs tracking-[0.2em] uppercase text-text-secondary mt-1">Customers</p>
                  </div>
                  <div className="bg-accent-light border border-accent/15 p-4">
                    <p className="font-serif text-3xl text-accent">500+</p>
                    <p className="text-xs tracking-[0.2em] uppercase text-text-secondary mt-1">Fabric Types</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="relative aspect-[4/5] overflow-hidden bg-background-secondary border border-border/70 shadow-premium">
                  <Image
                    src="https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=1200&q=80"
                    alt="Premium fabric counter with color palettes"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>

                <div className="bg-white border border-border/70 shadow-premium p-6">
                  <p className="text-xs tracking-[0.22em] uppercase text-accent mb-3">Visit Us</p>
                  <p className="text-text-secondary text-sm leading-relaxed mb-1">{brand.addressLines[0]}</p>
                  <p className="text-text-secondary text-sm leading-relaxed mb-1">{brand.addressLines[1]}</p>
                  <p className="text-text-secondary text-sm leading-relaxed">{brand.addressLines[2]}</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-8 lg:py-10">
          <Container>
            <div className="mb-16">
              <p className="text-accent text-xs tracking-[0.28em] uppercase mb-3">Our Milestones</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">How We Grew</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
              {milestones.map((item) => (
                <div key={item.title} className="bg-white border border-border/70 shadow-premium p-6">
                  <p className="font-serif text-3xl text-accent mb-3">{item.year}</p>
                  <h3 className="font-medium text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">What We Stand For</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">These principles drive every recommendation, every meter sold, and every customer conversation.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((item) => (
                <div key={item.title} className="bg-white border border-border/70 shadow-premium p-6 sm:p-7">
                  <h3 className="font-serif text-2xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="pt-14">
          <Container>
            <div className="bg-foreground text-white p-8 sm:p-10 lg:p-14">
              <div className="max-w-3xl">
                <p className="text-xs tracking-[0.28em] uppercase text-white/70 mb-4">Let Us Help You</p>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-5">Planning a Custom Outfit or Bulk Requirement?</h2>
                <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8">
                  Visit our store, call our team, or start on WhatsApp for quick recommendations and availability checks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button href="/shop" className="bg-white text-foreground hover:bg-white/90">
                    Shop Collection
                  </Button>
                  <Button href={getWhatsAppUrl("Hi, I would like fabric guidance for my upcoming outfit.")} variant="secondary" className="border-white text-white hover:bg-white hover:text-foreground">
                    Chat on WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
