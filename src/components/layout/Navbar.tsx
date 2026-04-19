"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { brand, getWhatsAppUrl } from "@/lib/brand";
import { trackWhatsAppClick } from "@/lib/tracking";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blogs" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const closeOnEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", closeOnEsc);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEsc);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40">
        <div className="hidden md:block bg-[#1E1A19] text-white">
          <Container>
            <div className="h-10 flex items-center justify-between text-[11px] tracking-[0.16em] uppercase">
              <p className="text-white/85">Premium fabrics sold per meter</p>
              <div className="flex items-center gap-6 text-white/80">
                <a
                  href={getWhatsAppUrl("Hi, I need help choosing fabric for my outfit.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  onClick={() => trackWhatsAppClick({ location: "navbar_top_strip" })}
                >
                  WhatsApp stylist
                </a>
                <span>{brand.phoneDisplay}</span>
              </div>
            </div>
          </Container>
        </div>

        <nav
          className={`transition-all duration-300 w-full bg-white/95 backdrop-blur ${isScrolled
            ? "shadow-premium py-2.5 border-b border-black/10"
            : "py-3.5 border-b border-black/5"
            }`}
        >
          <Container>
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-baseline gap-2">
                <span className="font-serif text-2xl lg:text-3xl text-foreground">
                  {brand.shortName}
                </span>
                <span className="hidden sm:inline text-text-secondary text-[11px] tracking-[0.28em] uppercase">
                  Cutpiece
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-9">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm tracking-[0.08em] transition-colors duration-300 ${isActive ? "text-accent" : "text-foreground hover:text-accent"}`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href={user ? "/account" : "/login"}
                  className="relative p-2 hover:bg-background-secondary rounded-full transition-colors"
                  aria-label={user ? `Account: ${user.name}` : "Sign In"}
                >
                  {user ? (
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-white text-[10px] font-medium tracking-wide">
                        {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </Link>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 hover:bg-background-secondary rounded-full transition-colors"
                  aria-label="Open cart"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-accent text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                      {totalItems}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2"
                  aria-label="Toggle menu"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-nav-panel"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </Container>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <div
          id="mobile-nav-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Close menu overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative h-full flex flex-col bg-[#FAF7F2]">
            <div className="flex items-center justify-between px-6 py-6 border-b border-black/10">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                <span className="font-serif text-2xl text-foreground">
                  {brand.shortName}
                </span>
                <span className="text-text-secondary text-xs tracking-[0.2em] uppercase">
                  Cutpiece
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8">
              <nav className="space-y-7">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-4xl font-serif text-foreground hover:text-accent transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-6 border-t border-black/10 space-y-3">
              <a
                href={getWhatsAppUrl("Hi, I need fabric suggestions for an outfit.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center"
                onClick={() => trackWhatsAppClick({ location: "navbar_mobile_menu" })}
              >
                WhatsApp Stylist
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full btn-primary justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                View Cart {totalItems > 0 && `(${totalItems})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
