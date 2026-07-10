import Image from "next/image";
import ClassicNavbar from "@/themes/classic/components/layout/Navbar";
import ClassicFooter from "@/themes/classic/components/layout/Footer";
import ClassicCartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { getActiveTheme } from "@/lib/theme";
import { brand } from "@/lib/brand";
import type { ThemeName } from "@/themes/registry";
import BohemianNavbar from "@/themes/bohemian/components/layout/Navbar";
import BohemianFooter from "@/themes/bohemian/components/layout/Footer";
import BohemianCartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import LuxuryNavbar from "@/themes/luxury/components/layout/Navbar";
import LuxuryFooter from "@/themes/luxury/components/layout/Footer";

type PolicySection = {
  title: string;
  body: string[];
};

type PolicyPageLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: PolicySection[];
};

const themeDisplayName: Record<ThemeName, string> = {
  classic: brand.name,
  luxury: "Shree Hari Atelier",
  bohemian: "The Artisanal Archive",
};

export default async function PolicyPageLayout({
  eyebrow,
  title,
  subtitle,
  updatedAt,
  sections,
}: PolicyPageLayoutProps) {
  const activeTheme = await getActiveTheme();
  const supportLabel = themeDisplayName[activeTheme] ?? brand.name;
  const isBohemian = activeTheme === "bohemian";
  const isLuxury = activeTheme === "luxury";

  return (
    <>
      {isBohemian ? <BohemianNavbar activePage="home" /> : isLuxury ? <LuxuryNavbar /> : <ClassicNavbar />}
      {isBohemian ? <BohemianCartSidebar /> : <ClassicCartSidebar />}
      <main className="pt-0 pb-20 bg-background-secondary min-h-screen">
        <section className="relative h-[260px] sm:h-[320px] lg:h-[360px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1800&q=80"
            alt="Policy and support"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1f1815]/85 via-[#1f1815]/60 to-[#1f1815]/20" />
          <Container className="relative h-full flex items-center">
            <div className="max-w-3xl text-white">
              <p className="text-xs sm:text-sm tracking-[0.32em] uppercase mb-4 text-white/80">{eyebrow}</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">{title}</h1>
              <p className="text-white/85 text-base sm:text-lg leading-relaxed">{subtitle}</p>
            </div>
          </Container>
        </section>

        <section className="-mt-10 relative z-10">
          <Container>
            <article className="bg-white border border-border/70 shadow-premium p-6 sm:p-8 lg:p-10">
              <p className="text-xs tracking-[0.2em] uppercase text-accent mb-8">Last updated: {updatedAt}</p>

              <div className="space-y-10">
                {sections.map((section) => (
                  <section key={section.title} className="border-b border-border/60 pb-8 last:border-none last:pb-0">
                    <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-4">{section.title}</h2>
                    <div className="space-y-4">
                      {section.body.map((line, idx) => (
                        <p key={`${section.title}-${idx}`} className="text-text-secondary leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-12 p-5 bg-accent-light border border-accent/15">
                <p className="text-sm text-text-secondary leading-relaxed">
                  For policy clarifications, contact {supportLabel} at {brand.email} or visit our store in {brand.city}, {brand.state}.
                </p>
              </div>
            </article>
          </Container>
        </section>
      </main>
      {isBohemian ? <BohemianFooter /> : isLuxury ? <LuxuryFooter /> : <ClassicFooter />}
    </>
  );
}
