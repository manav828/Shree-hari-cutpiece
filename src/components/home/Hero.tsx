import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-20 bg-background">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <p className="text-accent text-sm tracking-[0.3em] uppercase mb-6">
              Premium Fabric Collection
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-display leading-tight text-foreground mb-6">
              Premium Cutpiece Fabric
              <span className="block text-text-secondary">Per Meter</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Design your own outfits with our curated collection of high-quality 
              fabrics. From everyday cotton to luxurious silk, find the perfect 
              fabric for your creative vision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/shop">
                Explore Collection
              </Button>
              <Button href="/about" variant="secondary">
                Our Story
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-8 mt-12 pt-12 border-t border-border">
              <div>
                <p className="text-3xl font-serif text-foreground">10+</p>
                <p className="text-text-secondary text-sm">Years Experience</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-serif text-foreground">5000+</p>
                <p className="text-text-secondary text-sm">Happy Customers</p>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-3xl font-serif text-foreground">100%</p>
                <p className="text-text-secondary text-sm">Quality Assured</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-[4/5] relative overflow-hidden bg-background-secondary">
              <Image
                src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80"
                alt="Premium fabric collection"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-accent/20 hidden lg:block" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent-light hidden lg:block" />
          </div>
        </div>
      </Container>
    </section>
  );
}
