import Container from "@/components/ui/Container";

const trustItems = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "WhatsApp Confirmation",
    description: "Direct order confirmation via WhatsApp for your convenience",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Physical Store",
    description: "Visit our Ahmedabad store to see and feel the fabric quality",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Quality Assured",
    description: "Every fabric is handpicked and quality-checked before delivery",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Easy Returns",
    description: "Hassle-free returns within 7 days if you're not satisfied",
  },
];

export default function TrustSection() {
  return (
    <section className="section-padding bg-background border-t border-border/40">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {trustItems.map((item, index) => (
            <div key={index} className="text-center group cursor-default">
              <div className="mx-auto w-16 h-16 rounded-full bg-background-secondary border border-border/60 flex items-center justify-center mb-6 text-foreground group-hover:bg-foreground group-hover:text-white transition-colors duration-500 ease-premium shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-3 tracking-wide">
                {item.title}
              </h3>
              <p className="text-text-secondary text-sm font-light leading-relaxed max-w-[250px] mx-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
