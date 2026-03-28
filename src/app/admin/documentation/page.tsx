import Link from "next/link";
import { BookOpenText, Compass, FileCode2 } from "lucide-react";
import { handbookSections, technicalSections } from "./docsData";

function SectionCard({
    href,
    title,
    subtitle,
    type,
}: {
    href: string;
    title: string;
    subtitle: string;
    type: "handbook" | "technical";
}) {
    return (
        <Link
            href={href}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {type === "handbook" ? "Operations Handbook" : "Technical Deep Dive"}
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-6">{subtitle}</p>
            <p className="mt-3 text-sm font-medium text-blue-700">Open section page</p>
        </Link>
    );
}

export default function AdminDocumentationPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 p-5 shadow-sm">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpenText className="h-6 w-6 text-blue-700" />
                    Admin Documentation Index
                </h1>
                <p className="text-sm text-slate-600 mt-2 max-w-4xl">
                    Each section now opens as a separate page. Every section page includes its own topic index and detailed step-by-step instructions for usage and implementation.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-blue-700" />
                    Operations Handbook Sections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {handbookSections.map((section) => (
                        <SectionCard
                            key={section.id}
                            href={`/admin/documentation/handbook/${section.id}`}
                            title={section.title}
                            subtitle={section.subtitle}
                            type="handbook"
                        />
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileCode2 className="h-5 w-5 text-indigo-700" />
                    Technical Deep Dive Sections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {technicalSections.map((section) => (
                        <SectionCard
                            key={section.id}
                            href={`/admin/documentation/technical/${section.id}`}
                            title={section.title}
                            subtitle={section.subtitle}
                            type="technical"
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
