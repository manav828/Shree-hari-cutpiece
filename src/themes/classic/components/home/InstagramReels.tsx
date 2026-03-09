import Image from "next/image";
import Container from "@/components/ui/Container";
import reelsData from "@/data/reels.json";

export default function InstagramReels() {
  return (
    <section className="section-padding bg-background border-t border-border/40">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            Follow Us
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] text-foreground mb-6">
            @shreeharicutpiece
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto font-light text-lg">
            Watch our latest fabric showcases and customer creations on Instagram
          </p>
        </div>

        {/* Reels Horizontal Scroll */}
        <div className="relative -mx-6 px-6 lg:mx-0 lg:px-0">
          <div
            className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reelsData.map((reel) => (
              <a
                key={reel.id}
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-shrink-0 w-[60vw] sm:w-[240px] md:w-[280px] snap-center sm:snap-start cursor-pointer block"
              >
                <div className="aspect-[9/16] relative overflow-hidden bg-[#F5F5F5]">
                  <Image
                    src={reel.thumbnail}
                    alt={reel.title}
                    fill
                    sizes="(max-width: 640px) 60vw, 280px"
                    className="object-cover transition-transform duration-[10000ms] ease-out group-hover:scale-110"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors duration-[700ms]">
                    <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-premium scale-90 group-hover:scale-100 transition-transform duration-[700ms] ease-premium">
                      <svg
                        className="w-6 h-6 text-foreground ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Title Fade */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[700ms]">
                    <p className="text-white text-sm font-medium tracking-wide">
                      {reel.title}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Instagram CTA */}
        <div className="text-center mt-16">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-foreground text-foreground hover:bg-foreground hover:text-white transition-all duration-[400ms] ease-premium tracking-wide text-sm uppercase group"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="font-medium">Follow Profile</span>
            <svg
              className="w-4 h-4 transition-transform duration-[400ms] group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </Container>
    </section>
  );
}
