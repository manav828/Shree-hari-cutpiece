import Container from "@/components/ui/Container";

export default function StoreSection() {
  return (
    <section className="section-padding bg-background-secondary border-t border-border/40 overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Map */}
          <div className="relative aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-full min-h-[400px] bg-[#EFEFEF]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9567941785!2d72.5831968!3d23.0233481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f7b649a159%3A0xe48ab22d1cc32a10!2sTextile%20Market%2C%20Ring%20Road%2C%20Ahmedabad!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full object-cover filter grayscale-[30%] contrast-[1.1] opacity-90 transition-opacity duration-500 hover:opacity-100"
            />
            {/* Decorative */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-accent/20 hidden lg:block z-10 pointer-events-none" />
          </div>

          {/* Content */}
          <div className="lg:py-10">
            <p className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
              Visit Us
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] text-foreground mb-6">
              Our Store
            </h2>
            <p className="text-text-secondary text-lg font-light leading-relaxed mb-12">
              Experience our fabrics in person at our Ahmedabad store. Feel the
              quality, see the true colors, and get personalized recommendations
              from our experienced team.
            </p>

            {/* Store Details */}
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center flex-shrink-0 bg-background text-accent">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="pt-2">
                  <h4 className="font-medium text-foreground tracking-wide mb-2 uppercase text-xs">Address</h4>
                  <p className="text-text-secondary font-light leading-relaxed">
                    123, Textile Market, Ring Road<br />
                    Ahmedabad, Gujarat - 380001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center flex-shrink-0 bg-background text-accent">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="pt-2">
                  <h4 className="font-medium text-foreground tracking-wide mb-2 uppercase text-xs">Store Hours</h4>
                  <p className="text-text-secondary font-light leading-relaxed">
                    Monday - Saturday: 10:00 AM - 8:00 PM<br />
                    Sunday: 11:00 AM - 6:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center flex-shrink-0 bg-background text-accent">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="pt-2">
                  <h4 className="font-medium text-foreground tracking-wide mb-2 uppercase text-xs">Contact</h4>
                  <p className="text-text-secondary font-light leading-relaxed">
                    +91 XXXXX XXXXX<br />
                    info@shreeharicutpiece.com
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-14">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-foreground hover:text-accent transition-colors duration-300 font-medium tracking-wide text-sm uppercase group"
              >
                <span>Get Directions</span>
                <span className="w-8 h-[1px] bg-foreground transition-all duration-[400ms] group-hover:w-12 group-hover:bg-accent relative after:content-[''] after:absolute after:right-0 after:-top-[3px] after:w-2 after:h-2 after:border-t after:border-r after:border-current after:rotate-45" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
