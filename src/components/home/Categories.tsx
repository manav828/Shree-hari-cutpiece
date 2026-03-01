import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import categoriesData from "@/data/categories.json";

export default function Categories() {
  return (
    <section className="section-padding bg-background">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-accent text-sm tracking-[0.3em] uppercase mb-4">
            Browse By
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
            Fabric Categories
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {categoriesData.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative aspect-[4/5] overflow-hidden bg-background-secondary"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-serif text-2xl text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-white/70 text-sm hidden sm:block">
                  {category.description}
                </p>
              </div>

              {/* Hover Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-colors duration-500" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
