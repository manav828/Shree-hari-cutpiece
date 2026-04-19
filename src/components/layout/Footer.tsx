import Link from "next/link";
import Container from "@/components/ui/Container";
import { brand, getWhatsAppUrl } from "@/lib/brand";

const footerLinks = {
  shop: [
    { name: "All Fabrics", href: "/shop" },
    { name: "Cotton", href: "/shop?category=cotton" },
    { name: "Silk", href: "/shop?category=silk" },
    { name: "Georgette", href: "/shop?category=georgette" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blogs" },
    { name: "Contact", href: "/contact" },
    { name: "Store Location", href: "/contact#store" },
  ],
  legal: [
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Returns Policy", href: "/returns-policy" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#171311] text-white w-full">
      <Container>
        <div className="py-16 lg:py-20 border-b border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block">
                <h3 className="font-serif text-3xl sm:text-4xl mb-4">{brand.name}</h3>
              </Link>
              <p className="text-white/75 max-w-xl leading-relaxed text-sm sm:text-base">
                Curated premium fabrics for tailored wear, occasion ensembles, and designer-led custom creations.
                Explore handpicked cottons, silks, georgettes, chiffons, and artisanal blends sold per meter.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <a
                  href={brand.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 border border-white/20 text-xs tracking-[0.16em] uppercase hover:bg-white hover:text-black transition-all duration-300"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
                <a
                  href={getWhatsAppUrl("Hi, I want fabric recommendations for my outfit design.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 border border-white/20 text-xs tracking-[0.16em] uppercase hover:bg-white hover:text-black transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  WhatsApp
                </a>
              </div>
              <div className="mt-8 space-y-2 text-white/70 text-sm">
                <p>{brand.phoneDisplay}</p>
                <p>{brand.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <h4 className="font-medium text-sm tracking-widest uppercase mb-6">
                Shop
              </h4>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm tracking-widest uppercase mb-6">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm tracking-widest uppercase mb-6">
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>
        </div>

        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} {brand.name}. All rights reserved.
            </p>
            <p className="text-white/50 text-sm">
              {brand.city}, {brand.state}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
