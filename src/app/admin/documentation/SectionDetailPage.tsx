"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpenText, CheckCircle2, Compass, FileCode2, Lightbulb, MapPinned, Wrench } from "lucide-react";
import type { DocMode, Section } from "./docsData";
import { getSection } from "./docsData";

type Props = {
    mode: DocMode;
    section: Section;
};

function taskAnchor(index: number): string {
    return `task-${index + 1}`;
}

export default function SectionDetailPage({ mode, section }: Props) {
    const [activeTopic, setActiveTopic] = useState<string>("overview");
    const oppositeMode: DocMode = mode === "handbook" ? "technical" : "handbook";
    const matchingOppositeSection = getSection(oppositeMode, section.id);

    const oppositeModeHref = matchingOppositeSection
        ? `/admin/documentation/${oppositeMode}/${section.id}`
        : "/admin/documentation";

    const topics = useMemo(() => {
        const base = [
            { id: "overview", label: "Overview" },
            { id: "routes", label: "Routes and Files" },
            { id: "coverage", label: "What This Covers" },
        ];
        const tasks = section.tasks.map((task, index) => ({ id: taskAnchor(index), label: task.title }));
        const rest = [
            { id: "technical", label: "Technical Behavior" },
            { id: "notes", label: "Engineering Notes" },
        ];
        return [...base, ...tasks, ...rest];
    }, [section.tasks]);

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
            {
                root: null,
                rootMargin: "-20% 0px -60% 0px",
                threshold: [0.2, 0.4, 0.6],
            },
        );

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [topics]);

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 p-5 shadow-sm">
                <Link
                    href="/admin/documentation"
                    className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Documentation Index
                </Link>

                <div className="mt-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpenText className="h-6 w-6 text-blue-700" />
                        {section.title}
                    </h1>
                    <p className="text-sm text-slate-600 mt-2 max-w-4xl">{section.subtitle}</p>
                </div>

                <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm font-semibold">
                    <Link
                        href={mode === "handbook" ? "#" : oppositeModeHref}
                        className={`px-3 py-1.5 rounded-md ${mode === "handbook" ? "bg-blue-600 text-white cursor-default" : "text-slate-600 hover:bg-slate-100"}`}
                        aria-disabled={mode === "handbook"}
                    >
                        Operations Handbook
                    </Link>
                    <Link
                        href={mode === "technical" ? "#" : oppositeModeHref}
                        className={`px-3 py-1.5 rounded-md ${mode === "technical" ? "bg-indigo-600 text-white cursor-default" : "text-slate-600 hover:bg-slate-100"}`}
                        aria-disabled={mode === "technical"}
                    >
                        Technical Deep Dive
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[290px_1fr] gap-5 items-start">
                <aside className="xl:sticky xl:top-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-sm font-semibold text-slate-700">This Section Index</p>
                    </div>
                    <nav className="max-h-[76vh] overflow-auto px-2 py-2">
                        {topics.map((topic) => (
                            <a
                                key={topic.id}
                                href={`#${topic.id}`}
                                className={`block rounded-md px-2 py-2 text-sm transition-colors ${
                                    activeTopic === topic.id
                                        ? "bg-blue-100 text-blue-800 font-semibold"
                                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                            >
                                {topic.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                <div className="space-y-5">
                    <section id="overview" className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                        <h2 className="text-xl font-bold text-slate-900">Overview</h2>
                        <p className="text-sm text-slate-600 mt-2">This page contains detailed usage instructions and implementation notes for this single section.</p>
                    </section>

                    <section id="routes" className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                        <h3 className="text-lg font-semibold text-violet-700 flex items-center gap-2">
                            <MapPinned className="h-4 w-4" />
                            Routes and Files
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {section.routeHints.map((route) => (
                                <span key={route} className="rounded-md border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                                    {route}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section id="coverage" className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                        <h3 className="text-lg font-semibold text-emerald-700 flex items-center gap-2">
                            <Compass className="h-4 w-4" />
                            What This Covers
                        </h3>
                        <ul className="list-disc pl-5 mt-3 space-y-1 marker:text-emerald-500">
                            {section.whatThisDoes.map((point) => (
                                <li key={point} className="text-[15px] leading-7 text-slate-700">{point}</li>
                            ))}
                        </ul>
                    </section>

                    {section.tasks.map((task, index) => (
                        <section key={task.title} id={taskAnchor(index)} className="rounded-2xl border border-violet-200 bg-white shadow-sm p-5">
                            <h3 className="text-lg font-semibold text-violet-700 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {task.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Step-by-step usage instructions</p>
                            <ol className="list-decimal pl-5 mt-3 space-y-1.5 marker:text-violet-600">
                                {task.steps.map((step) => (
                                    <li key={step} className="text-[15px] leading-7 text-slate-700">{step}</li>
                                ))}
                            </ol>
                        </section>
                    ))}

                    <section id="technical" className="rounded-2xl border border-amber-200 bg-white shadow-sm p-5">
                        <h3 className="text-lg font-semibold text-amber-700 flex items-center gap-2">
                            <FileCode2 className="h-4 w-4" />
                            Technical Behavior
                        </h3>
                        <ul className="list-disc pl-5 mt-3 space-y-1 marker:text-amber-500">
                            {section.howItWorks.map((point) => (
                                <li key={point} className="text-[15px] leading-7 text-slate-700">{point}</li>
                            ))}
                        </ul>
                    </section>

                    <section id="notes" className="rounded-2xl border border-blue-200 bg-white shadow-sm p-5">
                        <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Engineering Notes
                        </h3>
                        <ul className="list-disc pl-5 mt-3 space-y-1 marker:text-blue-500">
                            {section.tips.map((tip) => (
                                <li key={tip} className="text-[15px] leading-7 text-slate-700">{tip}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm text-slate-700 inline-flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-slate-600" />
                            Review this page after each feature release touching this module so procedures stay accurate.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
