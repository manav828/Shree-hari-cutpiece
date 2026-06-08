import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import categoriesData from "@/data/categories.json";

export default function Categories() {
  const bentoCategories = categoriesData.slice(0, 3);

  return (
    <>
      {/* --- NEW BENTO VIEW --- */}
      <section className="section-padding bg-background border-b border-border/40">
        <Container>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <h2 className="font-sans font-bold text-2xl md:text-3xl lg:text-4xl text-foreground">
              Shop by Category
            </h2>
            <Link
              href="/shop"
              className="text-accent hover:text-foreground font-medium text-sm md:text-base flex items-center gap-2 transition-colors"
            >
              Browse all categories <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Left large card */}
            <Link
              href={`/shop?category=${bentoCategories[0].slug}`}
              className="group relative h-[300px] md:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden bg-background-secondary block"
            >
              <Image
                src={bentoCategories[0].image}
                alt={bentoCategories[0].name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-[600ms] ease-out">
                <h3 className="font-sans font-bold text-xl sm:text-2xl md:text-3xl text-white mb-1 md:mb-2">
                  {bentoCategories[0].name}
                </h3>
                <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium">
                  Shop now
                </p>
              </div>
            </Link>

            {/* Right smaller cards */}
            <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-4 lg:gap-6 h-auto md:h-[600px]">
              {bentoCategories.slice(1, 3).map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group relative h-[200px] sm:h-[250px] md:h-auto rounded-2xl md:rounded-3xl overflow-hidden bg-background-secondary block"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 50vw"
                    className="object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-[600ms] ease-out">
                    <h3 className="font-sans font-bold text-lg sm:text-xl md:text-2xl text-white mb-1 md:mb-2">
                      {category.name}
                    </h3>
                    <p className="text-white/90 text-xs sm:text-sm font-medium">
                      Shop now
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* --- CLASSIC GRID VIEW --- */}
      <section className="section-padding bg-background">
        <Container>
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
              Browse By
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] text-foreground">
              Fabric Categories
            </h2>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {categoriesData.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative aspect-[4/5] sm:aspect-auto sm:h-[60vh] md:h-[500px] overflow-hidden bg-background-secondary block"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[10000ms] ease-out group-hover:scale-110"
                />
                {/* Overlay - More delicate gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-[700ms]" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-[700ms] ease-premium">
                  <h3 className="font-serif text-3xl text-white mb-3">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-[700ms] delay-100 max-w-[90%]">
                    {category.description}
                  </p>
                </div>

                {/* Hover Border - Refined */}
                <div className="absolute inset-6 border border-white/0 group-hover:border-white/20 transition-colors duration-[700ms] pointer-events-none" />
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
