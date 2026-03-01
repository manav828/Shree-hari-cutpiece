import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";

const projects = [
    {
        id: 1,
        title: "Bespoke Tailoring",
        description: "Suits, Blazers & Formal Wear",
        image: "https://images.unsplash.com/photo-1594938298598-70f70df33100?w=600&q=80",
        link: "/shop",
    },
    {
        id: 2,
        title: "Resort Essentials",
        description: "Linens & Lightweight Cottons",
        image: "https://images.unsplash.com/photo-1515347619252-12e6bfb6a4dc?w=600&q=80",
        link: "/shop",
    },
    {
        id: 3,
        title: "Evening Glam",
        description: "Silks, Satins & Brocades",
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
        link: "/shop",
    },
    {
        id: 4,
        title: "Luxe Home",
        description: "Velvets & Heavy Textures",
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80",
        link: "/shop",
    },
];

export default function TrendingProjects() {
    return (
        <section className="section-padding bg-[#F7F0F1]">
            <Container>
                <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
                    <p className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
                        Curated Selections
                    </p>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
                        Premium Collection
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-2xl overflow-hidden group flex flex-col"
                        >
                            <Link href={project.link} className="block relative aspect-square sm:aspect-[4/5] lg:aspect-square overflow-hidden bg-background-secondary">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                            </Link>
                            <div className="p-6 md:p-8 flex flex-col flex-1 text-left">
                                <h3 className="font-serif text-xl text-foreground mb-2">
                                    {project.title}
                                </h3>
                                <p className="text-text-secondary text-sm font-light mb-6 flex-1">
                                    {project.description}
                                </p>
                                <Link
                                    href={project.link}
                                    className="inline-flex items-center text-accent text-sm font-medium hover:text-accent-dark transition-colors group/btn"
                                >
                                    View Bundle
                                    <svg
                                        className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
