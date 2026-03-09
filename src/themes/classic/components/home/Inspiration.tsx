import Image from "next/image";
import Container from "@/components/ui/Container";

const inspirationItems = [
  {
    id: 1,
    title: "Designer Kurti",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80",
  },
  {
    id: 2,
    title: "Elegant Lehenga",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  },
  {
    id: 3,
    title: "Traditional Choli",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
  },
  {
    id: 4,
    title: "Festive Dress",
    image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80",
  },
];

export default function Inspiration() {
  return (
    <section className="section-padding bg-background">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            Design Your Dream
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] text-foreground mb-6">
            What Our Customers Created
          </h2>
          <p className="text-text-secondary text-lg font-light leading-relaxed">
            Our fabrics are perfect for creating stunning custom outfits.
            Get inspired by what our customers have designed.
          </p>
        </div>

        {/* Inspiration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {inspirationItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-[#F5F5F5] cursor-pointer"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-[10000ms] ease-out group-hover:scale-110"
              />
              {/* Overlay - More delicate */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-[700ms]" />

              {/* Title */}
              <div className="absolute inset-x-0 bottom-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-[700ms] ease-premium text-center">
                <p className="text-white font-serif text-2xl mb-2">
                  {item.title}
                </p>
                <div className="w-8 h-[1px] bg-accent mx-auto scale-x-0 group-hover:scale-x-100 transition-transform duration-[700ms] ease-premium origin-center" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-text-secondary mb-6 font-light">
            Have a design in mind? Share it with us!
          </p>
          <a
            href="https://wa.me/91XXXXXXXXXX?text=Hi!%20I%20have%20a%20design%20idea%20and%20need%20fabric%20suggestions."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-foreground text-foreground hover:bg-foreground hover:text-white transition-all duration-[400ms] ease-premium tracking-wide text-sm uppercase"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat with us on WhatsApp
          </a>
        </div>
      </Container>
    </section>
  );
}
