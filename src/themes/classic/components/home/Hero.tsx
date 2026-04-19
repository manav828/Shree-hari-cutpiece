import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { getSiteConfigMap } from "@/lib/cms";

export default async function Hero() {
  const config = await getSiteConfigMap();

  const heroBadge = config.hero_badge ?? "Premium Fabric Collection";
  const heroHeadline = config.hero_headline ?? "Premium Cutpiece";
  const heroSubheading = config.hero_subheading ?? "Per Meter";
  const heroDescription = config.hero_description ?? "Design your own outfits with our curated collection of high-quality fabrics. From everyday cotton to luxurious silk, find the perfect fabric for your creative vision.";
  const heroCta1Label = config.hero_cta1_label ?? "Explore Collection";
  const heroCta1Url = config.hero_cta1_url ?? "/shop";
  const heroCta2Label = config.hero_cta2_label ?? "Our Story";
  const heroCta2Url = config.hero_cta2_url ?? "/about";
  const heroStat1Number = config.hero_stat1_number ?? "10+";
  const heroStat1Label = config.hero_stat1_label ?? "Years Experience";
  const heroStat2Number = config.hero_stat2_number ?? "5k+";
  const heroStat2Label = config.hero_stat2_label ?? "Happy Customers";
  const heroStat3Number = config.hero_stat3_number ?? "100%";
  const heroStat3Label = config.hero_stat3_label ?? "Quality Assured";
  const desktopImage = config.hero_desktop_image || "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1000&q=85";
  const mobileImage = config.hero_mobile_image || desktopImage;

  return (
    <section className="lg:h-[90vh] lg:min-h-[650px] lg:max-h-[900px] flex items-center pt-10 pb-8 mt-2 lg:pt-16 lg:pb-24 bg-background overflow-hidden relative">
      {/* Mobile Background Image - strictly shown on mobile */}
      <div className="absolute inset-0 lg:hidden z-0">
        <Image
          src={mobileImage}
          alt="Close-up premium cutpiece fabric texture backdrop"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Semi-transparent overlay to ensure text readability while showing image */}
        <div className="absolute inset-0 bg-background/80 md:bg-background/70" />
      </div>

      <Container className="h-full flex items-center relative z-10 w-full">
        {/* On mobile it's a 1-column layout covering the full height. On desktop it's a 2-col grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-24 items-center w-full">
          {/* Text Content */}
          <div className="order-1 flex flex-col justify-center text-center lg:text-left z-10 w-full max-w-2xl mx-auto lg:max-w-none">
            <p className="text-accent text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4 lg:mb-6 font-medium">
              {heroBadge}
            </p>
            <h1 className="font-serif text-[3.25rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[5rem] text-foreground mb-6 lg:mb-8 text-balance">
              {heroHeadline}
              <span className="block text-text-secondary font-light mt-1 lg:mt-2 text-[2.25rem] sm:text-4xl lg:text-[4rem]">{heroSubheading}</span>
            </h1>
            <p className="text-text-secondary text-[15px] sm:text-base lg:text-xl leading-relaxed mb-8 lg:mb-10 max-w-xl mx-auto lg:mx-0 font-light">
              {heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button href={heroCta1Url} className="w-full sm:w-auto text-center justify-center py-3.5">
                {heroCta1Label}
              </Button>
              <Button href={heroCta2Url} variant="secondary" className="w-full sm:w-auto text-center justify-center py-3.5 bg-background/50 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none border-border/80">
                {heroCta2Label}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center lg:justify-start items-center gap-x-6 gap-y-6 mt-10 pt-8 lg:mt-16 lg:pt-12 border-t border-border/60">
              <div className="text-center lg:text-left">
                <p className="text-3xl sm:text-3xl lg:text-4xl font-serif text-foreground mb-1">{heroStat1Number}</p>
                <p className="text-text-secondary text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-widest leading-tight">{heroStat1Label}</p>
              </div>
              <div className="w-px h-10 lg:h-12 bg-border/60" />
              <div className="text-center lg:text-left">
                <p className="text-3xl sm:text-3xl lg:text-4xl font-serif text-foreground mb-1">{heroStat2Number}</p>
                <p className="text-text-secondary text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-widest leading-tight">{heroStat2Label}</p>
              </div>
              <div className="hidden lg:block w-px h-12 bg-border/60" />
              <div className="hidden lg:block text-left">
                <p className="text-4xl font-serif text-foreground mb-1">{heroStat3Number}</p>
                <p className="text-text-secondary text-xs uppercase tracking-widest">{heroStat3Label}</p>
              </div>
            </div>
          </div>

          {/* Desktop Image */}
          <div className="hidden lg:block order-2 relative w-full h-auto max-w-none mt-0 z-0">
            <div className="w-full lg:aspect-[4/5] relative overflow-hidden bg-background-secondary group rounded-xl shadow-sm">
              <Image
                src={desktopImage}
                alt="Premium cutpiece fabric drape and texture hero visual"
                fill
                className="object-cover transition-transform duration-[10000ms] ease-out group-hover:scale-110"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle inner shadow for depth */}
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.03)] pointer-events-none" />
            </div>

            {/* Decorative Elements - Refined for luxury feel */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 border-[0.5px] border-accent/30 pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent-light -z-10 pointer-events-none" />
          </div>
        </div>
      </Container>
    </section>
  );
}
