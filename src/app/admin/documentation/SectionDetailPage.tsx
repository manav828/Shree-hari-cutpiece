"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    Compass,
    FileCode2,
    Lightbulb,
    MapPinned,
    Wrench,
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tags,
    Layout,
    BookOpen,
    BarChart2,
    CreditCard,
    Truck,
    Settings,
    BookOpenText,
    Terminal,
    Image as ImageIcon,
    ChevronRight,
} from "lucide-react";
import type { DocMode, Section } from "./docsData";
import { getSection } from "./docsData";

type Props = {
    mode: DocMode;
    section: Section;
};

const getSectionIcon = (id: string): React.ElementType => {
    switch (id) {
        case "dashboard": return LayoutDashboard;
        case "products": return Package;
        case "orders": return ShoppingCart;
        case "customers": return Users;
        case "coupons": return Tags;
        case "content-management": return Layout;
        case "documentation": return BookOpen;
        case "reports": return BarChart2;
        case "payments": return CreditCard;
        case "shipping": return Truck;
        case "settings": return Settings;
        default: return BookOpen;
    }
};

function taskAnchor(index: number): string {
    return `task-${index + 1}`;
}

/** Screenshot placeholder widget */
function ScreenshotPlaceholder({ label }: { label: string }) {
    return (
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 overflow-hidden">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-100">
                <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-2 h-4 rounded bg-white border border-gray-200 flex items-center px-2">
                    <span className="text-[9px] text-gray-400 font-mono">localhost:3000/admin</span>
                </div>
            </div>
            {/* Content area */}
            <div className="px-6 py-8 flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-gray-200">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500">Screenshot Placeholder</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">{label}</p>
                </div>
                {/* Skeleton bars */}
                <div className="w-full max-w-sm space-y-2 mt-1">
                    <div className="h-2 rounded bg-gray-200 w-full" />
                    <div className="h-2 rounded bg-gray-200 w-3/4" />
                    <div className="h-2 rounded bg-gray-200 w-1/2" />
                </div>
            </div>
        </div>
    );
}

export default function SectionDetailPage({ mode, section }: Props) {
    const [activeTopic, setActiveTopic] = useState<string>("overview");

    const IconComponent = getSectionIcon(section.id);
    const oppositeMode: DocMode = mode === "handbook" ? "technical" : "handbook";
    const matchingOppositeSection = getSection(oppositeMode, section.id);
    const oppositeModeHref = matchingOppositeSection
        ? `/admin/documentation/${oppositeMode}/${section.id}`
        : "/admin/documentation";

    const topics = useMemo(() => {
        const base: { id: string; label: string }[] = [{ id: "overview", label: "Overview" }];
        if (mode === "technical") {
            base.push({ id: "routes", label: "Routes & Files" });
        }
        base.push({ id: "coverage", label: "What This Covers" });
        section.tasks.forEach((task, index) => {
            base.push({ id: taskAnchor(index), label: task.title });
        });
        if (mode === "technical") {
            base.push({ id: "technical", label: "System Behavior" });
        }
        base.push({ id: "notes", label: mode === "handbook" ? "Important Tips" : "Engineering Notes" });
        return base;
    }, [section.tasks, mode]);

    useEffect(() => {
        const nodes = topics
            .map((topic) => document.getElementById(topic.id))
            .filter((node): node is HTMLElement => Boolean(node));
        if (nodes.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length === 0) return;
                setActiveTopic(visible[0].target.id);
            },
            { root: null, rootMargin: "-20% 0px -60% 0px", threshold: [0.2, 0.4, 0.6] }
        );
        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [topics]);

    return (
        <div className="space-y-6 max-w-6xl">

            {/* Header */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                    <Link href="/admin/documentation" className="hover:text-gray-700 transition-colors flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Documentation
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-600">{section.title}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-md ${mode === "handbook" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                            <IconComponent className="h-5 w-5" strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                                    mode === "handbook"
                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                        : "bg-purple-50 text-purple-600 border-purple-100"
                                }`}>
                                    {mode === "handbook" ? "Operations Handbook" : "Technical Deep Dive"}
                                </span>
                            </div>
                            <h1 className="text-xl font-playfair font-bold text-gray-900">{section.title}</h1>
                            <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">{section.subtitle}</p>
                        </div>
                    </div>

                    {/* Mode switcher */}
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1 self-start flex-shrink-0">
                        <Link
                            href={mode === "handbook" ? "#" : oppositeModeHref}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                                mode === "handbook"
                                    ? "bg-white text-blue-700 shadow-sm border border-gray-200 cursor-default"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <BookOpenText className="h-3.5 w-3.5" />
                            Operations
                        </Link>
                        <Link
                            href={mode === "technical" ? "#" : oppositeModeHref}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                                mode === "technical"
                                    ? "bg-white text-purple-700 shadow-sm border border-gray-200 cursor-default"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <Terminal className="h-3.5 w-3.5" />
                            Technical
                        </Link>
                    </div>
                </div>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6 items-start">

                {/* Sidebar TOC */}
                <aside className="hidden xl:block xl:sticky xl:top-6 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Page Index</p>
                    </div>
                    <nav className="max-h-[70vh] overflow-y-auto px-2 py-2 space-y-0.5">
                        {topics.map((topic) => (
                            <a
                                key={topic.id}
                                href={`#${topic.id}`}
                                className={`block rounded-md px-3 py-2 text-xs font-medium transition-all duration-150 leading-tight ${
                                    activeTopic === topic.id
                                        ? mode === "handbook"
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-purple-50 text-purple-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                {topic.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Main content */}
                <div className="space-y-5">

                    {/* Overview */}
                    <section id="overview" className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-2">
                        <h2 className="text-base font-semibold text-gray-900">Overview</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {mode === "handbook"
                                ? `This operational guide provides step-by-step checklists and best practices for managing the ${section.title} module in the Shree Hari admin panel.`
                                : `This technical reference documents the code architecture, database schema, API routes, and system-level behavior for the ${section.title} module.`
                            }
                        </p>
                        <div className="flex flex-wrap gap-4 pt-1 text-xs text-gray-500">
                            <span><span className="font-semibold text-gray-700">{section.tasks.length}</span> step-by-step guides</span>
                            <span><span className="font-semibold text-gray-700">{section.whatThisDoes.length}</span> features covered</span>
                            <span><span className="font-semibold text-gray-700">{section.tips.length}</span> tips & notes</span>
                        </div>
                    </section>

                    {/* Routes & Files (Technical only) */}
                    {mode === "technical" && (
                        <section id="routes" className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <MapPinned className="h-4 w-4 text-purple-500" />
                                Routes & File References
                            </h3>
                            <div className="rounded-md border border-gray-200 bg-gray-50 overflow-hidden font-mono text-xs">
                                {/* Terminal chrome */}
                                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-200 bg-gray-100">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                    <span className="ml-2 text-[10px] text-gray-400">file paths</span>
                                </div>
                                <div className="p-4 space-y-1.5">
                                    {section.routeHints.map((route, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="text-gray-400 select-none">{i + 1}.</span>
                                            <span className="text-green-700 break-all">{route}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* What This Covers */}
                    <section id="coverage" className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Compass className="h-4 w-4 text-emerald-500" />
                            {mode === "handbook" ? "Core Features Covered" : "Key Technical Objectives"}
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {section.whatThisDoes.map((point, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Step-by-step Guides */}
                    {section.tasks.map((task, index) => (
                        <section
                            key={task.title}
                            id={taskAnchor(index)}
                            className={`rounded-lg border bg-white shadow-sm p-6 space-y-4 ${
                                mode === "handbook" ? "border-blue-100" : "border-purple-100"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    Guide {index + 1} of {section.tasks.length}
                                </p>
                                <h3 className={`text-sm font-semibold flex items-center gap-2 ${
                                    mode === "handbook" ? "text-blue-800" : "text-purple-800"
                                }`}>
                                    <FileCode2 className="h-4 w-4 flex-shrink-0" />
                                    {task.title}
                                </h3>
                            </div>

                            <ol className="space-y-3">
                                {task.steps.map((step, sIdx) => {
                                    const isPlaceholder = step.toLowerCase().includes("[screenshot placeholder");
                                    if (isPlaceholder) {
                                        const label = step.replace(/\[Screenshot Placeholder:\s*/i, "").replace(/\]$/, "");
                                        return <ScreenshotPlaceholder key={sIdx} label={label} />;
                                    }
                                    return (
                                        <li key={sIdx} className="flex items-start gap-3 text-sm text-gray-700">
                                            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                                                mode === "handbook"
                                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                    : "bg-purple-50 text-purple-700 border border-purple-100"
                                            }`}>
                                                {sIdx + 1}
                                            </span>
                                            <span className="leading-relaxed">
                                                {step.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
                                                    part.startsWith("**") && part.endsWith("**")
                                                        ? <strong key={pi} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
                                                        : <span key={pi}>{part}</span>
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        </section>
                    ))}

                    {/* System Behavior (Technical only) */}
                    {mode === "technical" && (
                        <section id="technical" className="rounded-lg border border-amber-100 bg-white shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                                <FileCode2 className="h-4 w-4" />
                                System Level Behavior
                            </h3>
                            <ul className="space-y-2.5">
                                {section.howItWorks.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Tips / Notes */}
                    <section id="notes" className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            {mode === "handbook" ? "Important Operational Tips" : "Engineering & Database Notes"}
                        </h3>
                        <ul className="space-y-2.5">
                            {section.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed list-none">
                                    <span className="flex-shrink-0 text-yellow-500 mt-0.5">›</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Cross-link to opposite view */}
                    {matchingOppositeSection && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-sm text-gray-600">
                                {mode === "handbook"
                                    ? `Want the database schemas, routes, and technical details for ${section.title}?`
                                    : `Want the step-by-step operations guide for ${section.title}?`
                                }
                            </p>
                            <Link
                                href={oppositeModeHref}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                                    mode === "handbook"
                                        ? "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                }`}
                            >
                                {mode === "handbook" ? <Terminal className="h-3.5 w-3.5" /> : <BookOpenText className="h-3.5 w-3.5" />}
                                {mode === "handbook" ? "View Technical Docs" : "View Operations Guide"}
                            </Link>
                        </div>
                    )}

                    {/* Footer note */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex items-start gap-2.5">
                        <Wrench className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Keep this documentation current. Update the matching entry in{" "}
                            <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-gray-700 text-[11px]">docsData.ts</code>{" "}
                            whenever you modify routes, business logic, or file layouts in this module.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
