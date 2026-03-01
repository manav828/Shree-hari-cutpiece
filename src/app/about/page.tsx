import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "About Us | Shree Hari Cutpiece",
  description: "Learn about Shree Hari Cutpiece - your trusted Ahmedabad-based premium cutpiece fabric brand with over 10 years of experience.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="mb-20">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-accent text-sm tracking-[0.3em] uppercase mb-4">
                  Our Story
                </p>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
                  A Legacy of Quality Fabrics
                </h1>
                <p className="text-text-secondary text-lg leading-relaxed mb-6">
                  For over a decade, Shree Hari Cutpiece has been serving customers 
                  in Ahmedabad with the finest quality fabrics. What started as a 
                  small family business has grown into a trusted name in the textile 
                  industry.
                </p>
                <p className="text-text-secondary text-lg leading-relaxed">
                  We believe in the art of self-expression through fabric. Every 
                  meter of fabric we sell is carefully selected to help you create 
                  outfits that reflect your unique style and personality.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] relative overflow-hidden bg-background-secondary">
                  <Image
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
                    alt="Our fabric store"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-accent/20 hidden lg:block" />
              </div>
            </div>
          </Container>
        </section>

        {/* Values Section */}
        <section className="bg-background-secondary py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                What We Stand For
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Our values guide everything we do, from selecting fabrics to serving customers.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-light flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">Quality First</h3>
                <p className="text-text-secondary">
                  Every fabric is handpicked and quality-checked to ensure you receive only the best.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-light flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">Customer Love</h3>
                <p className="text-text-secondary">
                  Building lasting relationships through exceptional service and genuine care.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-light flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">Fair Pricing</h3>
                <p className="text-text-secondary">
                  Premium quality at honest prices, making beautiful fabrics accessible to all.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Numbers Section */}
        <section className="py-20">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="font-serif text-4xl md:text-5xl text-accent mb-2">10+</p>
                <p className="text-text-secondary">Years Experience</p>
              </div>
              <div>
                <p className="font-serif text-4xl md:text-5xl text-accent mb-2">5000+</p>
                <p className="text-text-secondary">Happy Customers</p>
              </div>
              <div>
                <p className="font-serif text-4xl md:text-5xl text-accent mb-2">500+</p>
                <p className="text-text-secondary">Fabric Varieties</p>
              </div>
              <div>
                <p className="font-serif text-4xl md:text-5xl text-accent mb-2">100%</p>
                <p className="text-text-secondary">Quality Assured</p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="bg-foreground text-white py-20">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl mb-6">
                Ready to Create Something Beautiful?
              </h2>
              <p className="text-white/70 mb-8">
                Visit our store or browse our collection online. We're here to help 
                you find the perfect fabric for your vision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button href="/shop" className="bg-white text-foreground hover:bg-white/90">
                  Shop Collection
                </Button>
                <Button href="/contact" variant="secondary" className="border-white text-white hover:bg-white hover:text-foreground">
                  Contact Us
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
