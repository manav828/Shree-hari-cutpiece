import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { getSiteConfigMap } from "@/lib/cms";
import { getHighQualityImageUrl } from "@/lib/imageQuality";

export default async function DescriptionSection() {
  const config = await getSiteConfigMap();

  const descBadge = config.desc_badge ?? "Why Choose Us";
  const descHeadline = config.desc_headline ?? "Crafting Dreams,";
  const descHeadlineAccent = config.desc_headline_accent ?? "One Fabric at a Time";
  const descParagraph = config.desc_paragraph ?? "At Shree Hari Cutpiece, we believe every outfit tells a story. Our carefully curated collection of premium fabrics empowers you to bring your unique vision to life. From the finest cotton to luxurious silk, each fabric is handpicked for its quality, texture, and beauty.";
  const point1Title = config.desc_point1_title ?? "Premium Quality";
  const point1Text = config.desc_point1_text ?? "Sourced from trusted manufacturers";
  const point2Title = config.desc_point2_title ?? "Sold Per Meter";
  const point2Text = config.desc_point2_text ?? "Buy exactly what you need";
  const point3Title = config.desc_point3_title ?? "Design Freedom";
  const point3Text = config.desc_point3_text ?? "Create outfits that are uniquely yours";
  const descStatNumber = config.desc_stat_number ?? "10+";
  const descStatLabel = config.desc_stat_label ?? "Years of Excellence";
  const descImage1 = getHighQualityImageUrl(
    config.desc_image1 || "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=1800&q=88",
    "sectionCard",
  );
  const descImage2 = getHighQualityImageUrl(
    config.desc_image2 || "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
    "sectionCard",
  );

  return (
    <section className="section-padding bg-background">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1 mt-8 lg:mt-0">
            <div className="grid grid-cols-12 gap-4 lg:gap-6">
              <div className="col-span-7 aspect-[3/4] relative overflow-hidden bg-[#F5F5F5] rounded-xl lg:rounded-none">
                <Image
                  src={descImage1}
                  alt="Premium cutpiece fabric texture and weave close-up"
                  fill
                  sizes="(max-width: 1024px) 58vw, 34vw"
                  className="object-cover"
                />
              </div>
              <div className="col-span-5 space-y-4 lg:space-y-6 pt-12">
                <div className="aspect-square relative overflow-hidden bg-[#F5F5F5] rounded-xl lg:rounded-none">
                  <Image
                    src={descImage2}
                    alt="Fabric drape detail for tailoring preview"
                    fill
                    sizes="(max-width: 1024px) 42vw, 18vw"
                    className="object-cover"
                  />
                </div>
                <div className="aspect-square relative overflow-hidden bg-background-secondary border border-border/40 flex items-center justify-center p-6 rounded-xl lg:rounded-none shadow-sm">
                  <div className="text-center">
                    <p className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-1 lg:mb-2">{descStatNumber}</p>
                    <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-widest font-medium">{descStatLabel}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -bottom-8 -right-8 w-40 h-40 border border-accent/20 hidden lg:block pointer-events-none" />

            {/* Mobile Button placed below image */}
            <div className="flex justify-center mt-10 lg:hidden relative z-10 w-full">
              <Button href="/about" className="btn-primary inline-flex items-center justify-center uppercase tracking-wider text-sm w-full sm:w-auto">
                Learn More About Us
              </Button>
            </div>
          </div>

          {/* Text Side */}
          <div className="lg:pl-8 order-1 lg:order-2 text-center lg:text-left">
            <p className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
              {descBadge}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] text-foreground mb-8">
              {descHeadline}
              <span className="block text-accent mt-2">{descHeadlineAccent}</span>
            </h2>
            <p className="text-text-secondary text-lg font-light leading-relaxed mb-10">
              {descParagraph}
            </p>
            <ul className="space-y-6 mb-8 lg:mb-12 text-left inline-block lg:block max-w-md mx-auto lg:mx-0">
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full border border-border/60 bg-background flex items-center justify-center flex-shrink-0 mt-0.5 text-accent shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-text-secondary font-light leading-relaxed pt-1">
                  <strong className="text-foreground font-medium">{point1Title}</strong> - {point1Text}
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full border border-border/60 bg-background flex items-center justify-center flex-shrink-0 mt-0.5 text-accent shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-text-secondary font-light leading-relaxed pt-1">
                  <strong className="text-foreground font-medium">{point2Title}</strong> - {point2Text}
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full border border-border/60 bg-background flex items-center justify-center flex-shrink-0 mt-0.5 text-accent shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-text-secondary font-light leading-relaxed pt-1">
                  <strong className="text-foreground font-medium">{point3Title}</strong> - {point3Text}
                </span>
              </li>
            </ul>

            {/* Desktop Button placed below text list */}
            <div className="hidden lg:flex justify-start">
              <Button href="/about" className="btn-primary inline-flex items-center justify-center uppercase tracking-wider text-sm">
                Learn More About Us
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
