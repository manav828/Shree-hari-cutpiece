"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenText, CheckCircle2, Compass, FileCode2, LifeBuoy, MapPinned, Sparkles } from "lucide-react";

type Task = {
    title: string;
    steps: string[];
};

type Section = {
    id: string;
    title: string;
    subtitle: string;
    routeHints: string[];
    whatThisDoes: string[];
    tasks: Task[];
    howItWorks: string[];
    tips: string[];
};

const HANDBOOK_SECTIONS: Section[] = [
    {
        id: "start",
        title: "Getting Started",
        subtitle: "How to begin each shift and avoid missing important work.",
        routeHints: ["/admin/login", "/admin/orders", "/admin/customers", "/admin/coupons"],
        whatThisDoes: [
            "Gives admin team a fixed daily routine.",
            "Reduces missed orders and missed customer follow-ups.",
            "Makes shift handover consistent.",
        ],
        tasks: [
            {
                title: "Start of day checklist",
                steps: [
                    "Open admin login and sign in.",
                    "Open Orders first and filter pending or newly paid orders.",
                    "Open Customers and review new signups or blocked accounts.",
                    "Open Coupons and verify active campaigns and expiry timelines.",
                    "Write a quick shift-start note in your team log.",
                ],
            },
            {
                title: "End of day checklist",
                steps: [
                    "Make sure no critical pending orders are left unreviewed.",
                    "Confirm customer support actions are noted in customer timelines.",
                    "Verify no accidental product status changes happened.",
                    "Deactivate expired coupons if required.",
                    "Log out and share shift summary with manager.",
                ],
            },
        ],
        howItWorks: [
            "Admin access currently uses a localStorage flag after login.",
            "All module pages are in sidebar and share one admin layout shell.",
            "Operational truth should come from Orders, Customers, Products, and Coupons pages.",
        ],
        tips: [
            "Always start with Orders before doing catalog edits.",
            "Avoid doing campaign changes and price changes at the exact same time.",
        ],
    },
    {
        id: "orders",
        title: "Orders Management",
        subtitle: "How to process, track, print, and close orders correctly.",
        routeHints: ["/admin/orders", "/admin/orders/[id]", "/admin/orders/[id]/print"],
        whatThisDoes: [
            "Shows all orders with filters and status badges.",
            "Allows status updates, tracking updates, and internal notes.",
            "Provides printable invoice/label view.",
        ],
        tasks: [
            {
                title: "Process a new order",
                steps: [
                    "Go to Orders and filter by pending status.",
                    "Open order detail and confirm customer address and phone.",
                    "Check payment status before moving to processing.",
                    "Update status sequentially: pending to confirmed to processing to packed to shipped.",
                    "Add a short admin note for any unusual case.",
                ],
            },
            {
                title: "Ship and add tracking",
                steps: [
                    "Open order detail page.",
                    "Add or update tracking URL in order actions panel.",
                    "Set status to shipped.",
                    "Use print page if invoice/label hardcopy is required.",
                ],
            },
        ],
        howItWorks: [
            "Orders list and summary cards are loaded from lib query helpers.",
            "Order detail combines order, items, addresses, and status history.",
            "Status, tracking, and notes updates are done through server actions and revalidated pages.",
        ],
        tips: [
            "Never mark shipped before tracking is set if courier pickup is pending.",
            "Use notes for audit trail so next admin can continue smoothly.",
        ],
    },
    {
        id: "customers",
        title: "Customers and Support",
        subtitle: "How to review customer history, update status, and manage addresses.",
        routeHints: ["/admin/customers", "/admin/customers/[id]"],
        whatThisDoes: [
            "Shows customer list with advanced filtering and CSV export.",
            "Provides customer detail view with order history and interaction logs.",
            "Supports notes, account status updates, and address CRUD.",
        ],
        tasks: [
            {
                title: "Find and analyze customer",
                steps: [
                    "Use search and default filters first for fast narrowing.",
                    "Enable extra filters from Add More Filters if needed.",
                    "Open customer detail before changing any status.",
                ],
            },
            {
                title: "Support actions",
                steps: [
                    "Add factual note in timeline.",
                    "Apply status only with clear reason.",
                    "Update addresses and defaults when delivery issues are found.",
                ],
            },
        ],
        howItWorks: [
            "Customer list and export endpoints share filter logic.",
            "Customer detail endpoint merges profile, orders, addresses, and interactions.",
            "Status/note/address actions write interaction logs for audit trail.",
        ],
        tips: [
            "For risky actions (blocked/suspended), leave a precise note first.",
            "Use CSV export only after confirming filter state.",
        ],
    },
    {
        id: "coupons",
        title: "Coupons and Campaigns",
        subtitle: "How to create discount campaigns and publish them safely.",
        routeHints: ["/admin/coupons", "/admin/coupons/new", "/admin/coupons/[id]"],
        whatThisDoes: [
            "Creates and updates coupon rules and status.",
            "Supports percentage and fixed discounts.",
            "Shows analytics for redemptions and influenced revenue.",
        ],
        tasks: [
            {
                title: "Create campaign",
                steps: [
                    "Set code, value, eligibility, and campaign window.",
                    "Set placement and destination URL.",
                    "Test with checkout before announcing publicly.",
                ],
            },
        ],
        howItWorks: [
            "Coupon analytics now computes influenced revenue from redemption order IDs and orders table totals.",
            "Assignments to specific users are stored separately and updated in edit flow.",
        ],
        tips: [
            "Use clear campaign naming and avoid overlapping coupon intent.",
        ],
    },
];

const TECH_SECTIONS: Section[] = [
    {
        id: "tech-architecture",
        title: "Architecture and Boundaries",
        subtitle: "What is implemented in UI, API, and data layer for customer module.",
        routeHints: [
            "src/app/admin/customers/page.tsx",
            "src/app/admin/customers/[id]/page.tsx",
            "src/app/api/admin/customers/*",
        ],
        whatThisDoes: [
            "Defines clear separation between list UI, detail UI, and API routes.",
            "Provides contract layer for customer list, export, detail, notes, interactions, and addresses.",
            "Connects admin workflows with account-side APIs for export and delete request compliance flows.",
        ],
        tasks: [
            {
                title: "Understand request flow",
                steps: [
                    "UI builds query params and requests admin APIs.",
                    "API applies validated filters on admin summary view.",
                    "UI receives normalized response and renders list/table.",
                ],
            },
        ],
        howItWorks: [
            "Read model: `admin_customer_summary` view for list speed and stable shape.",
            "Detail model: joins from profiles, orders, addresses, interactions.",
            "Write model: profile upsert + interaction logging side-effects.",
        ],
        tips: [
            "For future changes, keep list API shape stable because export and table both depend on it.",
        ],
    },
    {
        id: "tech-filters",
        title: "Filters, Query Semantics, and Export Parity",
        subtitle: "Technical behavior for filters and how CSV export mirrors list results.",
        routeHints: [
            "GET /api/admin/customers",
            "GET /api/admin/customers/export",
            "src/components/admin/customers/CustomersFilters.tsx",
        ],
        whatThisDoes: [
            "Applies optional query filters only when selected/filled.",
            "Sanitizes search values before OR ilike conditions.",
            "Guarantees export endpoint uses same filter set as list endpoint.",
        ],
        tasks: [
            {
                title: "Add a new filter safely",
                steps: [
                    "Add filter state in customers page.",
                    "Add UI control in CustomersFilters component.",
                    "Append param in list and export query builders.",
                    "Implement same condition in both APIs.",
                ],
            },
        ],
        howItWorks: [
            "Order count uses range buckets mapped to explicit numeric conditions.",
            "Date filters convert to full-day ranges using T00:00:00 / T23:59:59.",
            "When optional filters are unchecked, related values are cleared in UI state.",
        ],
        tips: [
            "Always test list/export parity after adding or changing any filter.",
        ],
    },
    {
        id: "tech-detail",
        title: "Customer Detail Aggregation",
        subtitle: "How detailed data is assembled and which derived values are computed.",
        routeHints: ["GET /api/admin/customers/[id]"],
        whatThisDoes: [
            "Fetches summary, profile, orders, addresses, interactions in parallel.",
            "Aggregates order item lines and units counts by order.",
            "Returns derived metrics like avg order value and repeat approximation.",
        ],
        tasks: [
            {
                title: "Debug missing detail data",
                steps: [
                    "Verify customer exists in `admin_customer_summary`.",
                    "Verify profile row in `user_profiles` and order rows for user id.",
                    "Check address soft delete flags and interaction rows.",
                ],
            },
        ],
        howItWorks: [
            "Orders are enriched with shipping city/state/pincode snapshots.",
            "Profile preferences are normalized with defaults when absent.",
            "Detail response is shaped for single-request page rendering.",
        ],
        tips: [
            "Keep derived metric math in API, not UI, for consistency across clients.",
        ],
    },
    {
        id: "tech-writes",
        title: "Write Paths, Side Effects, and Logging",
        subtitle: "Non-visual behavior triggered by status, notes, and address operations.",
        routeHints: [
            "PATCH /api/admin/customers/[id]",
            "POST /api/admin/customers/[id]/notes",
            "*/addresses (POST/PATCH/DELETE)",
        ],
        whatThisDoes: [
            "Performs profile upsert for missing records.",
            "Writes interaction log entries automatically for key actions.",
            "Maintains single default shipping/billing by clearing existing defaults first.",
        ],
        tasks: [
            {
                title: "Trace a status change",
                steps: [
                    "Status update request reaches PATCH customer endpoint.",
                    "Profile upsert writes new account_status.",
                    "Interaction log records status_changed event.",
                    "UI refresh loads updated timeline and badge.",
                ],
            },
            {
                title: "Trace address delete",
                steps: [
                    "Delete endpoint soft-deletes row (`is_deleted=true`).",
                    "Default flags are unset.",
                    "Interaction log records address delete event metadata.",
                ],
            },
        ],
        howItWorks: [
            "Address operations call a default-clearing helper before setting new default.",
            "No hard delete occurs in address delete path.",
            "Event metadata in logs helps audit action source.",
        ],
        tips: [
            "When debugging support issues, inspect interaction logs before code changes.",
        ],
    },
    {
        id: "tech-compliance",
        title: "Account-Side APIs and Compliance Support",
        subtitle: "Implemented non-admin endpoints that support customer operations.",
        routeHints: [
            "/api/account/profile",
            "/api/account/preferences",
            "/api/account/addresses",
            "/api/account/export",
            "/api/account/delete-request",
        ],
        whatThisDoes: [
            "Supports self-service customer profile and preferences.",
            "Provides account data export and delete request capture.",
            "Gives support/admin process a technical base for compliance requests.",
        ],
        tasks: [
            {
                title: "Handle customer data request",
                steps: [
                    "Customer triggers export request from account profile.",
                    "Export endpoint prepares account-related data payload/response.",
                    "Support team validates and communicates expected timeline.",
                ],
            },
            {
                title: "Handle delete request",
                steps: [
                    "Customer submits delete request from account profile section.",
                    "Request is persisted for admin follow-up.",
                    "Support applies policy workflow before destructive actions.",
                ],
            },
        ],
        howItWorks: [
            "Compliance endpoints are separate from admin-customer endpoints but related operationally.",
            "Delete request endpoint is a logging/intake stage, not immediate hard delete.",
        ],
        tips: [
            "Document every compliance request with case ID and timestamps.",
        ],
    },
];

function SectionCard({ section }: { section: Section }) {
    return (
        <section id={section.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50">
                <h2 className="text-2xl font-bold text-blue-800">{section.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{section.subtitle}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                    {section.routeHints.map((route) => (
                        <span key={route} className="rounded-md border border-blue-100 bg-white px-2.5 py-1 text-xs font-medium text-blue-700">
                            {route}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-5 space-y-5">
                <div>
                    <h3 className="text-lg font-semibold text-emerald-700 mb-2">What this section covers</h3>
                    <ul className="list-disc pl-5 space-y-1 marker:text-emerald-500">
                        {section.whatThisDoes.map((point) => (
                            <li key={point} className="text-[15px] leading-7 text-slate-700">{point}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-violet-700 mb-2">Implementation flows</h3>
                    <div className="space-y-3">
                        {section.tasks.map((task) => (
                            <div key={task.title} className="rounded-xl border border-violet-100 bg-violet-50/35 p-4">
                                <p className="text-[15px] font-semibold text-violet-800 mb-2">{task.title}</p>
                                <ol className="list-decimal pl-5 space-y-1.5 marker:text-violet-600">
                                    {task.steps.map((step) => (
                                        <li key={step} className="text-[15px] leading-7 text-slate-700">{step}</li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-amber-700 mb-2">Technical behavior</h3>
                    <ul className="list-disc pl-5 space-y-1 marker:text-amber-500">
                        {section.howItWorks.map((point) => (
                            <li key={point} className="text-[15px] leading-7 text-slate-700">{point}</li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Engineering notes</h3>
                    <ul className="list-disc pl-5 space-y-1 marker:text-blue-500">
                        {section.tips.map((tip) => (
                            <li key={tip} className="text-[15px] leading-7 text-slate-700">{tip}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

export default function AdminDocumentationPage() {
    const [mode, setMode] = useState<"handbook" | "technical">("handbook");

    const currentSections = useMemo(
        () => (mode === "handbook" ? HANDBOOK_SECTIONS : TECH_SECTIONS),
        [mode],
    );

    const [activeSection, setActiveSection] = useState(currentSections[0].id);

    useEffect(() => {
        setActiveSection(currentSections[0]?.id ?? "");
    }, [currentSections]);

    useEffect(() => {
        const sectionNodes = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
        if (sectionNodes.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible.length === 0) return;
                const id = (visible[0].target as HTMLElement).id;
                if (id) setActiveSection(id);
            },
            {
                root: null,
                rootMargin: "-20% 0px -55% 0px",
                threshold: [0.1, 0.25, 0.5, 0.75],
            },
        );

        sectionNodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [mode]);

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <BookOpenText className="h-6 w-6 text-blue-700" />
                            Admin Documentation Center
                        </h1>
                        <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                            Choose Operations Handbook for process learning or Technical Deep Dive for implementation details that are not visible on UI.
                        </p>
                    </div>
                </div>

                <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white p-1">
                    <button
                        type="button"
                        onClick={() => setMode("handbook")}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${mode === "handbook"
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <Compass className="h-4 w-4" />
                            Operations Handbook
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("technical")}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${mode === "technical"
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <FileCode2 className="h-4 w-4" />
                            Technical Deep Dive
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div className="rounded-xl border border-emerald-100 bg-white/80 p-3">
                        <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5"><Compass className="h-4 w-4" /> Practical Workflow</p>
                        <p className="text-xs text-slate-600 mt-1">Step-by-step instructions for everyday admin operations.</p>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-white/80 p-3">
                        <p className="text-sm font-semibold text-violet-700 flex items-center gap-1.5"><MapPinned className="h-4 w-4" /> Route Aware</p>
                        <p className="text-xs text-slate-600 mt-1">Every section includes where to go in panel and what to click.</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-white/80 p-3">
                        <p className="text-sm font-semibold text-amber-700 flex items-center gap-1.5"><LifeBuoy className="h-4 w-4" /> Escalation Ready</p>
                        <p className="text-xs text-slate-600 mt-1">Includes issue handling and escalation guidelines.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[290px_1fr] gap-5 items-start">
                <aside className="xl:sticky xl:top-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-sm font-semibold text-slate-700">Index</p>
                    </div>
                    <nav className="max-h-[76vh] overflow-auto px-2 py-2">
                        {currentSections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className={`block rounded-md px-2 py-2 text-sm transition-colors ${activeSection === section.id
                                    ? "bg-blue-100 text-blue-800 font-semibold"
                                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                            >
                                {section.title}
                            </a>
                        ))}
                    </nav>
                </aside>

                <div className="space-y-5">
                    {currentSections.map((section) => (
                        <SectionCard key={section.id} section={section} />
                    ))}

                    {mode === "handbook" ? (
                        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                            <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                How to train a new admin using this page
                            </h2>
                            <ol className="list-decimal pl-5 mt-3 space-y-1.5 marker:text-emerald-700">
                                <li className="text-[15px] text-slate-700">Start with Getting Started and Orders sections.</li>
                                <li className="text-[15px] text-slate-700">Then train on Customers, Products, Coupons, and Settings.</li>
                                <li className="text-[15px] text-slate-700">Make trainee execute one real workflow per module.</li>
                            </ol>
                            <p className="text-xs text-slate-600 mt-3 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                                Last reviewed: 2026-03-17
                            </p>
                        </section>
                    ) : (
                        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/55 p-5">
                            <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                                <FileCode2 className="h-5 w-5" />
                                Technical maintenance checklist
                            </h2>
                            <ol className="list-decimal pl-5 mt-3 space-y-1.5 marker:text-indigo-700">
                                <li className="text-[15px] text-slate-700">Validate list/export parity whenever filters are changed.</li>
                                <li className="text-[15px] text-slate-700">Keep interaction logs intact for all customer write operations.</li>
                                <li className="text-[15px] text-slate-700">Prefer API-level derivations for shared metrics and not UI-only math.</li>
                                <li className="text-[15px] text-slate-700">Review admin API role-hardening tasks before production launch.</li>
                            </ol>
                            <p className="text-xs text-slate-600 mt-3 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-700" />
                                Technical doc mode maintained in-app (no raw markdown view required)
                            </p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
