"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
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
    Search,
    X,
    ChevronRight,
    BookOpenText,
    Terminal,
} from "lucide-react";
import { handbookSections, technicalSections, Section, DocMode } from "./docsData";

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

function highlightText(text: string, search: string) {
    if (!search.trim()) return <>{text}</>;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part)
                    ? <mark key={i} className="bg-yellow-100 text-yellow-800 font-semibold px-0.5 rounded">{part}</mark>
                    : part
            )}
        </>
    );
}

function SectionCard({
    href,
    section,
    type,
    searchQuery,
}: {
    href: string;
    section: Section;
    type: DocMode;
    searchQuery: string;
}) {
    const IconComponent = getSectionIcon(section.id);

    const matchingHighlights = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return null;
        const highlights: string[] = [];
        section.tasks.forEach((task) => {
            if (task.title.toLowerCase().includes(query)) highlights.push(`Task: ${task.title}`);
            task.steps.forEach((step) => {
                if (step.toLowerCase().includes(query)) highlights.push(`Step: "${step.substring(0, 80)}"`);
            });
        });
        section.whatThisDoes.forEach((point) => {
            if (point.toLowerCase().includes(query)) highlights.push(`Feature: "${point.substring(0, 80)}"`);
        });
        section.tips.forEach((tip) => {
            if (tip.toLowerCase().includes(query)) highlights.push(`Tip: "${tip.substring(0, 80)}"`);
        });
        return highlights.length > 0 ? highlights.slice(0, 2) : null;
    }, [section, searchQuery]);

    return (
        <Link
            href={href}
            className="group block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-150"
        >
            <div className="flex items-start justify-between gap-3">
                <div className={`p-2 rounded-md ${type === "handbook" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                    <IconComponent className="h-4.5 w-4.5" strokeWidth={1.8} />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        type === "handbook"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-purple-50 text-purple-600 border border-purple-100"
                    }`}>
                        {type === "handbook" ? "Handbook" : "Technical"}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>

            <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {highlightText(section.title, searchQuery)}
            </h3>

            <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
                {highlightText(section.subtitle, searchQuery)}
            </p>

            <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
                <span>{section.tasks.length} {section.tasks.length === 1 ? "guide" : "guides"}</span>
                <span>·</span>
                <span>{section.whatThisDoes.length} features</span>
                <span>·</span>
                <span>{section.tips.length} tips</span>
            </div>

            {matchingHighlights && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <Search className="h-2.5 w-2.5" />
                        Matches in this section:
                    </p>
                    {matchingHighlights.map((hl, idx) => (
                        <p key={idx} className="text-xs text-gray-500 truncate">
                            {highlightText(hl, searchQuery)}
                        </p>
                    ))}
                </div>
            )}
        </Link>
    );
}

export default function AdminDocumentationPage() {
    const [docMode, setDocMode] = useState<DocMode>("handbook");
    const [searchQuery, setSearchQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("shreehari_docs_mode");
        if (stored === "handbook" || stored === "technical") {
            setDocMode(stored as DocMode);
        }
    }, []);

    const handleModeChange = (mode: DocMode) => {
        setDocMode(mode);
        localStorage.setItem("shreehari_docs_mode", mode);
    };

    const activeSections = useMemo(() => {
        return docMode === "handbook" ? handbookSections : technicalSections;
    }, [docMode]);

    const filteredSections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return activeSections;
        return activeSections.filter((section) =>
            section.title.toLowerCase().includes(query) ||
            section.subtitle.toLowerCase().includes(query) ||
            section.routeHints.some(r => r.toLowerCase().includes(query)) ||
            section.whatThisDoes.some(p => p.toLowerCase().includes(query)) ||
            section.tasks.some(t =>
                t.title.toLowerCase().includes(query) ||
                t.steps.some(s => s.toLowerCase().includes(query))
            ) ||
            section.howItWorks.some(h => h.toLowerCase().includes(query)) ||
            section.tips.some(n => n.toLowerCase().includes(query))
        );
    }, [activeSections, searchQuery]);

    return (
        <div className="space-y-6 max-w-6xl">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Documentation</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        In-depth guides and technical references for all 11 admin modules.
                    </p>
                </div>

                {/* Mode switcher */}
                {isMounted && (
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1 shadow-sm">
                        <button
                            onClick={() => handleModeChange("handbook")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                                docMode === "handbook"
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <BookOpenText className="h-3.5 w-3.5" />
                            Operations Handbook
                        </button>
                        <button
                            onClick={() => handleModeChange("technical")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                                docMode === "technical"
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <Terminal className="h-3.5 w-3.5" />
                            Technical Deep Dive
                        </button>
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder={`Search ${docMode === "handbook" ? "checklists, operations, guides" : "database schemas, routes, APIs"}… e.g. "shipping", "GST", "Razorpay", "calculator"`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {searchQuery && (
                <p className="text-xs text-gray-500">
                    Found <span className="font-semibold text-gray-800">{filteredSections.length}</span> matching section{filteredSections.length !== 1 ? "s" : ""} in{" "}
                    {docMode === "handbook" ? "Operations Handbook" : "Technical Deep Dive"}
                </p>
            )}

            {/* Section label */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    {docMode === "handbook" ? (
                        <><BookOpenText className="h-4 w-4 text-blue-500" /> Operations Handbook</>
                    ) : (
                        <><Terminal className="h-4 w-4 text-purple-500" /> Technical Deep Dive</>
                    )}
                </h2>
                <span className="text-xs text-gray-400">
                    Showing {filteredSections.length} of {activeSections.length}
                </span>
            </div>

            {/* Grid */}
            {filteredSections.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white py-16 flex flex-col items-center gap-3 text-center shadow-sm">
                    <div className="p-3 bg-gray-50 rounded-full">
                        <Search className="h-6 w-6 text-gray-300" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">No results for "{searchQuery}"</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            Try terms like "shipping", "tax", "calculator", "Razorpay", "blog", or "theme".
                        </p>
                    </div>
                    <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-md transition-colors"
                    >
                        Clear Search
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSections.map((section) => (
                        <SectionCard
                            key={section.id}
                            href={`/admin/documentation/${docMode}/${section.id}`}
                            section={section}
                            type={docMode}
                            searchQuery={searchQuery}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
