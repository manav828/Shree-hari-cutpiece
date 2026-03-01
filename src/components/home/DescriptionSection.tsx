import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function DescriptionSection() {
  return (
    <section className="section-padding bg-background">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7 aspect-[3/4] relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80"
                  alt="Premium fabric texture"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="col-span-5 space-y-4">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80"
                    alt="Fabric detail"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="aspect-square relative overflow-hidden bg-accent-light flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="font-serif text-4xl text-accent mb-1">10+</p>
                    <p className="text-text-secondary text-sm">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-accent/20 hidden lg:block" />
          </div>

          {/* Text Side */}
          <div>
            <p className="text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Why Choose Us
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
              Crafting Dreams,
              <span className="block text-accent">One Fabric at a Time</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              At Shree Hari Cutpiece, we believe every outfit tells a story. Our carefully 
              curated collection of premium fabrics empowers you to bring your unique 
              vision to life. From the finest cotton to luxurious silk, each fabric is 
              handpicked for its quality, texture, and beauty.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-text-secondary">
                  <strong className="text-foreground">Premium Quality</strong> - Sourced from trusted manufacturers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-text-secondary">
                  <strong className="text-foreground">Sold Per Meter</strong> - Buy exactly what you need
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-text-secondary">
                  <strong className="text-foreground">Design Freedom</strong> - Create outfits that are uniquely yours
                </span>
              </li>
            </ul>
            <Button href="/about">
              Learn More About Us
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
