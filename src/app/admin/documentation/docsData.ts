export type Task = {
    title: string;
    steps: string[];
};

export type Section = {
    id: string;
    title: string;
    subtitle: string;
    routeHints: string[];
    whatThisDoes: string[];
    tasks: Task[];
    howItWorks: string[];
    tips: string[];
};

export type DocMode = "handbook" | "technical";

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
            "Status, note, and address actions write interaction logs for audit trail.",
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
            "Coupon analytics computes influenced revenue from redemption order IDs and orders table totals.",
            "Assignments to specific users are stored separately and updated in edit flow.",
        ],
        tips: [
            "Use clear campaign naming and avoid overlapping coupon intent.",
        ],
    },
    {
        id: "cms-overview",
        title: "CMS Content and Banners Overview",
        subtitle: "How to use Content and Banners module end to end in daily operations.",
        routeHints: ["/admin/cms", "/admin/cms (Hero)", "/admin/cms (Description)", "/admin/cms (Store Info)", "/admin/cms (Categories)", "/admin/cms (Banners)"],
        whatThisDoes: [
            "Centralizes homepage copy, media, category cards, and campaign banners.",
            "Lets admin publish UI changes without code deployments for most content updates.",
            "Supports operational campaign scheduling using start date, end date, and active toggles.",
        ],
        tasks: [
            {
                title: "Daily CMS publishing workflow",
                steps: [
                    "Open Content and Banners from sidebar.",
                    "Check Hero tab first and verify copy, CTA labels, and layout mode are correct for current campaign.",
                    "Open Categories tab and confirm active category list and order matches merchandising plan.",
                    "Open Banners tab and verify announcement, hero, popup, and shop_top placement states.",
                    "After any change, click Save (or Save Changes in modal), then verify on storefront home and shop pages.",
                    "Record completed content changes in team handover notes with timestamp and campaign reference.",
                ],
            },
            {
                title: "Safe change sequence",
                steps: [
                    "Change one area at a time (Hero, then Categories, then Banners).",
                    "Save and verify each area before moving to the next tab.",
                    "If unsaved changes prompt appears while switching tabs, review and save first instead of discarding.",
                    "For seasonal campaigns, activate new banners only after validating mobile and desktop storefront views.",
                ],
            },
        ],
        howItWorks: [
            "CMS tab content is loaded from API routes backed by Supabase tables and storage.",
            "Site config text and URL fields are upserted by key-value semantics.",
            "Image uploads store to cms-assets bucket and save generated public URLs in database.",
        ],
        tips: [
            "Do not combine many campaign edits in one publish window when high traffic is expected.",
            "Always validate visual output after cache refresh window for accurate QA.",
        ],
    },
    {
        id: "cms-categories",
        title: "CMS Categories Detailed Usage",
        subtitle: "Step-by-step guide for create, edit, reorder, activate, and soft-delete category cards.",
        routeHints: ["/admin/cms (Categories)", "/api/admin/cms/categories", "src/components/admin/cms/CategoriesManager.tsx"],
        whatThisDoes: [
            "Controls category cards used by homepage and shop filtering journeys.",
            "Provides slug-driven URLs for category-based navigation.",
            "Maintains display order through sort_order swap actions.",
        ],
        tasks: [
            {
                title: "Create a category with image",
                steps: [
                    "Open Categories tab and click Add Category.",
                    "Type category name; confirm slug auto-generation or edit slug manually.",
                    "Add description for contextual merchandising copy.",
                    "Upload image from local machine or paste image URL.",
                    "Keep Active on storefront checked unless preparing hidden draft.",
                    "Click Create Category and verify category appears in list with thumbnail and slug.",
                ],
            },
            {
                title: "Reorder and edit a category",
                steps: [
                    "Use move up and move down controls on row actions to adjust order.",
                    "Click edit icon to open row details in form panel.",
                    "Update name, slug, description, image, or active state.",
                    "Click Save Changes and verify order and metadata in list refresh.",
                    "Open storefront to confirm card position and click-through URL are correct.",
                ],
            },
            {
                title: "Soft-delete a category safely",
                steps: [
                    "Click delete icon on category row.",
                    "Confirm soft-delete prompt only when you are sure the card must be hidden.",
                    "Verify row disappears from active list after refresh.",
                    "Check homepage category section to ensure intended replacement cards are visible.",
                ],
            },
        ],
        howItWorks: [
            "Slug validation enforces lowercase letters, numbers, and hyphens only.",
            "Create and edit both enforce uniqueness checks for active non-deleted rows.",
            "Soft delete updates deleted_at timestamp and keeps row for audit and historical trace.",
        ],
        tips: [
            "Keep slugs stable after public campaigns start to avoid broken historical links.",
            "Use consistent naming conventions across categories for cleaner filtering UX.",
        ],
    },
    {
        id: "cms-banners",
        title: "CMS Banners and Hero Set Detailed Usage",
        subtitle: "In-depth guide for placements, grouped hero rows, bulk upload, and save-time image removal.",
        routeHints: ["/admin/cms (Banners)", "/api/admin/cms/banners", "src/components/admin/cms/BannersManager.tsx", "src/lib/cms.ts"],
        whatThisDoes: [
            "Manages announcement_bar, homepage_hero, shop_top, and popup placements.",
            "Shows homepage hero as one grouped row even when multiple hero records exist.",
            "Supports single and bulk image workflows for hero campaigns.",
            "Supports schedule windows, priorities, and quick active toggles.",
        ],
        tasks: [
            {
                title: "Create normal placement banner (announcement, shop_top, popup)",
                steps: [
                    "Open Banners tab and click Create Banner.",
                    "Enter title and select placement except homepage_hero.",
                    "Enter content text and link URL.",
                    "Upload image or paste image URL.",
                    "Set colors, dates, priority, and active state.",
                    "Click Create Banner and verify status badge in list.",
                ],
            },
            {
                title: "Create homepage hero set with multiple images",
                steps: [
                    "Create Banner and set placement to homepage_hero.",
                    "Select banner width mode (Normal Banner Width or Full Width Banner).",
                    "Set title prefix, content text, link URL, colors, dates, and base priority.",
                    "Select multiple files in one upload field.",
                    "Click Upload and Create All to create all hero rows in one flow.",
                    "Verify grouped Homepage Hero Banners row shows updated image count.",
                ],
            },
            {
                title: "Edit hero group with save-gated remove",
                steps: [
                    "Click edit on grouped Homepage Hero Banners row.",
                    "Use x on thumbnail to mark specific existing hero images for removal.",
                    "Optionally add new files; in edit mode first selected file replaces primary edited row and remaining files create additional hero rows.",
                    "Review pending removal note in modal.",
                    "Click Save Changes to apply removals and any new uploads together.",
                    "Use Cancel if you want to discard removal marks and leave DB unchanged.",
                ],
            },
            {
                title: "Quick campaign control actions",
                steps: [
                    "Use row toggle for a single non-hero banner.",
                    "Use grouped toggle on Homepage Hero Banners row to enable or disable all hero rows.",
                    "Use row soft delete for single banner retirement.",
                    "Use placement soft delete only for complete placement cleanup.",
                ],
            },
        ],
        howItWorks: [
            "Banner list is priority sorted and hero placement is transformed into a grouped synthetic row.",
            "Status badge computes Active, Scheduled, Expired, or Inactive using active flag and date window.",
            "Hero image removals are queued in local state and only persisted during Save Changes.",
            "Hero layout mode writes to site_config key hero_banner_layout.",
        ],
        tips: [
            "For large hero campaigns, upload all slides first and verify sequence using priority values.",
            "Avoid placement soft delete if only one or two banners need retirement.",
        ],
    },
    {
        id: "blog-builder-prd-v2",
        title: "Blog Builder PRD v2 Planning and Tracker",
        subtitle: "Detailed implementation plan, requirement checklist, and documentation update gate for the blog module.",
        routeHints: [
            "/admin/documentation",
            "docs/blog/blog_builder_prd_v2_requirements_checklist.md",
            "docs/trackers/blog_builder_prd_v2_implementation_tracker.md",
            "docs/blog/blog_builder_admin_api_contract_v1.md",
            "docs/blog/blog_builder_db_schema.md",
            "docs/blog/blog_builder_admin_list_ux.md",
            "docs/blog/blog_builder_admin_editor_ux.md",
            "docs/blog/blog_builder_section_library.md",
            "docs/shree_hari_blog_prd_v2.docx",
        ],
        whatThisDoes: [
            "Provides a complete requirement checklist derived from the PRD.",
            "Defines phased implementation milestones across data, APIs, admin UX, public UX, SEO, and analytics.",
            "Keeps admin APIs theme-agnostic so any storefront theme can integrate without backend rewrites.",
            "Enforces a documentation-first completion gate after each delivered functionality.",
        ],
        tasks: [
            {
                title: "Use the requirement checklist before implementation",
                steps: [
                    "Open blog_builder_prd_v2_requirements_checklist.md and confirm the target requirement group.",
                    "Break work into one milestone from the implementation tracker.",
                    "Implement only the selected milestone scope and validate against PRD acceptance points.",
                    "Mark checklist items progressively as the implementation is verified.",
                ],
            },
            {
                title: "Track current implementation baseline",
                steps: [
                    "Verify initial schema scaffold exists at db/migrations/supabase_blog_builder_v2_migration.sql.",
                    "Verify shared blog domain types exist at src/types/blogs.ts.",
                    "Verify API contract exists at docs/blog/blog_builder_admin_api_contract_v1.md.",
                    "Review DB schema doc at docs/blog/blog_builder_db_schema.md for table and relationship coverage.",
                    "Verify admin blog APIs exist under src/app/api/admin/blogs and include list, detail, quick-edit, bulk, categories, and tags routes.",
                    "Verify revision APIs exist at src/app/api/admin/blogs/[id]/revisions/route.ts for list, compare, and restore actions.",
                    "Verify preview token API exists at src/app/api/admin/blogs/[id]/preview/route.ts with 48-hour default validity.",
                    "Verify validation API exists at src/app/api/admin/blogs/[id]/validate/route.ts for publish readiness checks.",
                    "Verify scheduler API exists at src/app/api/admin/blogs/scheduler/route.ts for scheduled publish execution.",
                    "Verify media APIs exist at src/app/api/admin/blogs/media/route.ts for upload, list, and delete workflows.",
                    "Verify analytics API exists at src/app/api/admin/blogs/analytics/route.ts for summary cards and charts.",
                    "Use these baseline artifacts as the source for subsequent API and UI integration tasks.",
                    "Update this documentation section whenever a new milestone artifact is introduced.",
                ],
            },
            {
                title: "Update documentation after each completed functionality",
                steps: [
                    "After finishing a feature, update the corresponding guidance on /admin/documentation in the same session.",
                    "Update docs/trackers/blog_builder_prd_v2_implementation_tracker.md status and changelog immediately.",
                    "Do not mark task done until both implementation and documentation updates are completed.",
                    "Include route-level notes, operator steps, and edge-case behavior in documentation updates.",
                ],
            },
        ],
        howItWorks: [
            "The checklist captures PRD coverage and prevents requirement drift.",
            "The implementation tracker enforces milestone order and dependency clarity.",
            "Implementation started with schema and type foundations so APIs and UI can integrate against one model.",
            "Theme-agnostic API contracts isolate data behavior from storefront styling, so new themes only need renderer adapters.",
            "Revision snapshots are now persisted on create and update, and restore operations also create a reversible revision entry.",
            "Time-limited preview tokens decouple admin review workflows from theme rendering internals.",
            "Validation and scheduler APIs enforce publish readiness while keeping theme-specific rendering out of the admin backend.",
            "Analytics APIs return theme-agnostic metrics so each theme can render cards and charts independently.",
            "The documentation gate turns /admin/documentation into a live operational source of truth.",
        ],
        tips: [
            "Treat documentation updates as part of feature completion, not as a post-release task.",
            "Do not store theme IDs or theme-coupled CSS assumptions inside blog content payloads.",
            "Keep scheduler secrets in server env variables and never expose them to client bundles.",
            "Close milestone work in small vertical slices to keep docs and behavior in sync.",
        ],
    },
    {
        id: "blog-builder-admin",
        title: "Blog Builder Operations",
        subtitle: "How to create, edit, preview, and publish blog posts safely in the admin editor.",
        routeHints: [
            "/admin/blog",
            "/admin/blog/new",
            "/admin/blog/[id]",
            "src/components/admin/blog/BlogEditor.tsx",
            "docs/blog/blog_builder_admin_editor_ux.md",
        ],
        whatThisDoes: [
            "Creates theme-agnostic blog content in visual or code mode.",
            "Supports custom code blocks with publish safety acknowledgment.",
            "Provides validation, preview, and revisions for safe publishing.",
        ],
        tasks: [
            {
                title: "Create a visual post",
                steps: [
                    "Open /admin/blog and click Create Post.",
                    "Fill title, summary, cover media, category, tags, and author.",
                    "Add sections from the library and reorder as needed.",
                    "Use Preview to verify layout summary and section warnings.",
                    "Save draft before leaving the page.",
                ],
            },
            {
                title: "Use custom code blocks safely",
                steps: [
                    "Add Custom Code section from the library.",
                    "Paste HTML, CSS, and JS as needed (leave empty fields blank).",
                    "Review warnings for empty custom code blocks.",
                    "Acknowledge custom JS risks before save and publish if JS is present.",
                    "Publish only after validation errors are resolved.",
                ],
            },
            {
                title: "Switch to full code mode",
                steps: [
                    "Click Code to enter full page HTML/CSS/JS mode.",
                    "Enter HTML (required) and optional CSS/JS.",
                    "Check the code-only lock if you want to prevent returning to visual mode.",
                    "Acknowledge custom JS risks before save and publish.",
                    "Publish or schedule once validation passes.",
                ],
            },
            {
                title: "Rollback a bad publish",
                steps: [
                    "Open the post and click Revisions in the top bar.",
                    "Select the last known-good revision snapshot.",
                    "Restore the revision and review the editor state.",
                    "Run validation again and republish when ready.",
                ],
            },
        ],
        howItWorks: [
            "Visual mode stores sections in a theme-agnostic builder_layout JSON.",
            "Custom code blocks are stored in builder_layout with HTML/CSS/JS content fields.",
            "Code mode lock disables switching back to visual mode for the post.",
            "Publish validation enforces required metadata and custom JS acknowledgment.",
            "Syntax validation checks for unbalanced HTML tags and JS/CSS delimiters.",
            "Custom JS acknowledgment is required before saving when JS is present.",
            "Preview uses time-limited tokens for safe stakeholder review.",
            "Revisions are stored on create and update to support rollback.",
        ],
        tips: [
            "Keep custom JS minimal and well-scoped to reduce support risk.",
            "Use revisions to roll back if a publish introduces layout issues.",
            "Avoid embedding theme-specific CSS assumptions inside content.",
        ],
    },
    {
        id: "blog-media-library",
        title: "Blog Media Library",
        subtitle: "Upload, search, and reuse blog images with alt text governance.",
        routeHints: [
            "/admin/blog",
            "docs/blog/blog_builder_media_library.md",
            "src/app/api/admin/blogs/media/route.ts",
        ],
        whatThisDoes: [
            "Centralizes reusable images for cover and OG metadata.",
            "Enforces alt text updates before publish workflows.",
            "Blocks deletion of assets used by published posts.",
        ],
        tasks: [
            {
                title: "Upload a new image",
                steps: [
                    "Open media picker from Cover or OG image fields.",
                    "Upload JPG, PNG, or WebP and add alt text.",
                    "Confirm the image appears in the library grid.",
                ],
            },
            {
                title: "Select media for a post",
                steps: [
                    "Open the media picker from Cover or OG image fields.",
                    "Use search or date filters to find the asset.",
                    "Click Use to attach the media to the post.",
                ],
            },
            {
                title: "Update alt text",
                steps: [
                    "Locate the asset in the media grid.",
                    "Edit the alt text field and click save.",
                    "Re-run publish validation if errors were blocked by alt text.",
                ],
            },
        ],
        howItWorks: [
            "Uploads store the original image plus thumbnail, medium, and large variants.",
            "Media search supports filename and alt text matching.",
            "Deletion is blocked when media is referenced by published posts.",
        ],
        tips: [
            "Always write descriptive alt text for accessibility and SEO.",
            "Prefer reusing existing assets to keep media governance consistent.",
        ],
    },
    {
        id: "blog-seo-multilingual",
        title: "Blog SEO & Multilingual",
        subtitle: "Configure metadata, validate slugs, and link language variants.",
        routeHints: [
            "/admin/blog",
            "docs/blog/blog_builder_seo_multilingual.md",
            "src/components/admin/blog/BlogEditor.tsx",
        ],
        whatThisDoes: [
            "Adds SEO metadata controls and publish-time validation.",
            "Tracks redirect history when published slugs change.",
            "Links multilingual variants and emits hreflang alternates.",
        ],
        tasks: [
            {
                title: "Complete SEO metadata",
                steps: [
                    "Open the SEO panel and fill meta title/description.",
                    "Set canonical, robots, Twitter, and OG values as needed.",
                    "Confirm counters are within recommended limits.",
                ],
            },
            {
                title: "Link a language variant",
                steps: [
                    "Use the Language Variants selector to link to an existing post.",
                    "Verify the variant group ID persists after save.",
                    "Publish both variants and confirm the language switcher appears.",
                ],
            },
            {
                title: "Verify SEO output",
                steps: [
                    "Open the public post and inspect page metadata.",
                    "Confirm hreflang alternates appear for linked variants.",
                    "Check sitemap entries for published posts.",
                ],
            },
        ],
        howItWorks: [
            "Slug uniqueness is validated on save and publish.",
            "OG fields fall back to meta title/description when empty.",
            "Sitemap entries are generated from published posts only.",
        ],
        tips: [
            "Keep meta titles under 60 characters for best display.",
            "Use canonical URLs when a post is duplicated across languages.",
        ],
    },
    {
        id: "blog-scheduling",
        title: "Blog Scheduling & Publish Lifecycle",
        subtitle: "Schedule posts, track publish outcomes, and manage rollback behavior.",
        routeHints: [
            "/admin/blog",
            "docs/blog/blog_builder_scheduling.md",
            "src/app/api/admin/blogs/scheduler/route.ts",
        ],
        whatThisDoes: [
            "Uses IST input for schedule times with UTC storage.",
            "Publishes scheduled posts after validation checks.",
            "Records scheduler results for in-app visibility.",
        ],
        tasks: [
            {
                title: "Schedule a post",
                steps: [
                    "Set status to Scheduled and choose an IST datetime.",
                    "Save the post and confirm scheduled_for is stored.",
                    "Wait for the scheduler to publish at the target time.",
                ],
            },
            {
                title: "Review scheduler results",
                steps: [
                    "Open Blog Management and review Scheduler Updates.",
                    "Open any failed post to fix validation errors.",
                    "Reschedule once errors are resolved.",
                ],
            },
            {
                title: "Unpublish safely",
                steps: [
                    "Confirm redirects exist before unpublishing a slug.",
                    "Unpublish the post from the list or editor.",
                    "Verify 410 response for old URLs without redirects.",
                ],
            },
        ],
        howItWorks: [
            "Scheduler runs publish validation and reverts to draft on failure.",
            "Publish results are stored in blog_publish_notifications.",
            "Unpublished slugs return 410 when no redirect is present.",
        ],
        tips: [
            "Run the scheduler at least every 2 minutes to meet SLA targets.",
            "Check Scheduler Updates after big publish windows.",
        ],
    },
    {
        id: "blog-public-rendering",
        title: "Blog Public Experience",
        subtitle: "Verify public rendering, share actions, and SEO output.",
        routeHints: [
            "/blogs",
            "docs/blog/blog_builder_public_rendering.md",
            "src/app/blogs/[slug]/page.tsx",
        ],
        whatThisDoes: [
            "Documents public list and detail rendering behavior.",
            "Highlights related posts/products and share actions.",
            "Provides SEO verification checklist.",
        ],
        tasks: [
            {
                title: "Verify public pages",
                steps: [
                    "Open /blogs and confirm published posts list.",
                    "Open a detail page and confirm builder rendering.",
                    "Check related posts and products sections.",
                ],
            },
            {
                title: "Verify share actions",
                steps: [
                    "Test WhatsApp and Facebook share links.",
                    "Copy link for Instagram and confirm clipboard update.",
                    "Use native share on mobile where available.",
                ],
            },
        ],
        howItWorks: [
            "Public pages only render published posts.",
            "Full code mode outputs HTML/CSS/JS blocks directly.",
            "Share URLs use canonical routes by default.",
        ],
        tips: [
            "Run SEO verification from browser view-source.",
            "Keep related products updated for commerce impact.",
        ],
    },
    {
        id: "blog-analytics",
        title: "Blog Analytics",
        subtitle: "Review blog performance, conversions, and content health.",
        routeHints: [
            "/admin/blog/analytics",
            "docs/blog/blog_builder_analytics.md",
            "src/app/api/admin/blogs/analytics/route.ts",
        ],
        whatThisDoes: [
            "Tracks views, conversion clicks, and content health flags.",
            "Highlights top posts by CTR and referrer sources.",
            "Summarizes device split and engagement signals.",
        ],
        tasks: [
            {
                title: "Review performance",
                steps: [
                    "Open Blog Analytics and select a time range.",
                    "Scan summary cards for views and click-throughs.",
                    "Review top CTR posts for promotion.",
                ],
            },
            {
                title: "Investigate health flags",
                steps: [
                    "Check low-traffic and SEO incomplete counts.",
                    "Open flagged posts from the blog list.",
                    "Fix missing metadata or related products.",
                ],
            },
        ],
        howItWorks: [
            "Analytics events power summary cards and trend charts.",
            "CTR is calculated using product clicks divided by views.",
            "Health flags only evaluate published posts.",
        ],
        tips: [
            "Use short ranges to spot recent campaign impact.",
            "Update SEO fields to clear incomplete flags.",
        ],
    },
    {
        id: "blog-qa-release",
        title: "Blog QA & Release",
        subtitle: "Execute QA test cases and release readiness checks.",
        routeHints: [
            "docs/blog/blog_builder_qa_test_cases.md",
            "docs/blog/blog_builder_release_checklist.md",
        ],
        whatThisDoes: [
            "Provides executable QA test cases for admin and public flows.",
            "Defines release checklist and known limits.",
            "Standardizes pre-launch verification.",
        ],
        tasks: [
            {
                title: "Run QA test cases",
                steps: [
                    "Execute admin editor and media library checks.",
                    "Validate scheduling, redirects, and public rendering.",
                    "Document failures for remediation.",
                ],
            },
            {
                title: "Complete release checklist",
                steps: [
                    "Verify migration and storage prerequisites.",
                    "Confirm SEO validation and sitemap outputs.",
                    "Sign off on scheduler behavior and analytics.",
                ],
            },
        ],
        howItWorks: [
            "QA cases map to PRD acceptance criteria.",
            "Release checklist consolidates pre-launch safeguards.",
        ],
        tips: [
            "Re-run QA after any schema or API changes.",
            "Record known limits for support handoff.",
        ],
    },
];

const TECH_SECTIONS_MIRRORED: Section[] = [
    {
        id: "start",
        title: "Getting Started - Technical Deep Dive",
        subtitle: "System-level behavior behind admin access, layout shell, and daily operational entry points.",
        routeHints: ["/admin/login", "src/app/admin/layout.tsx", "Auth context and local session behavior"],
        whatThisDoes: [
            "Explains how admin shell and route access patterns initialize.",
            "Clarifies why certain modules should be reviewed first from a data freshness perspective.",
            "Documents handover-critical checks to reduce operational drift.",
        ],
        tasks: [
            {
                title: "Technical startup checks",
                steps: [
                    "Open admin login and authenticate to establish session context.",
                    "Load dashboard shell and confirm sidebar routes render without hydration issues.",
                    "Open Orders and Customers to verify core operational APIs return responses.",
                    "Check browser console for auth or API errors before starting content operations.",
                ],
            },
        ],
        howItWorks: [
            "Admin area is routed through a shared layout that controls navigation consistency.",
            "Operational pages depend on API reachability and current role/session state.",
            "Shift readiness should be validated at route and data layers, not UI text alone.",
        ],
        tips: [
            "If one core module fails to load, diagnose auth and API first before retrying workflows.",
            "Start with high-impact modules to catch breakage early in the shift.",
        ],
    },
    {
        id: "orders",
        title: "Orders Management - Technical Deep Dive",
        subtitle: "Data flow, mutation behavior, and validation points for order lifecycle operations.",
        routeHints: ["/admin/orders", "/admin/orders/[id]", "src/app/actions/order.ts", "src/lib/orders.ts"],
        whatThisDoes: [
            "Explains order state transitions and consistency expectations.",
            "Documents tracking and note update pathways.",
            "Clarifies print-view dependencies for shipping operations.",
        ],
        tasks: [
            {
                title: "Status transition integrity flow",
                steps: [
                    "Load order detail and validate current payment and fulfillment context.",
                    "Apply status updates in correct sequence to avoid workflow regressions.",
                    "Persist tracking data before or with shipped state when courier handoff is complete.",
                    "Re-open updated order to confirm persisted state and timeline records.",
                ],
            },
        ],
        howItWorks: [
            "Order list reads aggregate and summary data from server-side helpers.",
            "Detail view joins header, items, addresses, and status history for complete operations.",
            "Write actions revalidate relevant views to keep list and detail in sync.",
        ],
        tips: [
            "Never skip intermediate states in bulk unless business logic explicitly supports it.",
            "Tracking links should be validated for correct courier format before publish.",
        ],
    },
    {
        id: "customers",
        title: "Customers and Support - Technical Deep Dive",
        subtitle: "Query semantics, profile write behavior, and audit logging for support workflows.",
        routeHints: ["/admin/customers", "GET /api/admin/customers", "GET /api/admin/customers/[id]", "customer interaction logs"],
        whatThisDoes: [
            "Documents how customer filters and exports stay logically aligned.",
            "Explains profile and status updates with interaction-side effects.",
            "Covers address operations and support traceability requirements.",
        ],
        tasks: [
            {
                title: "Support update technical flow",
                steps: [
                    "Locate customer via filter set and open detail API-backed page.",
                    "Apply status or note mutation and confirm successful response payload.",
                    "Reload detail timeline to verify interaction log was written.",
                    "For address changes, confirm default address invariants remain valid.",
                ],
            },
        ],
        howItWorks: [
            "List and export should share equivalent filtering semantics to avoid reporting drift.",
            "Customer detail combines profile, orders, addresses, and interactions in one payload.",
            "Writes prioritize auditability through interaction metadata.",
        ],
        tips: [
            "Always verify post-mutation timeline entries before closing support ticket.",
            "Prefer API-level derived values over client-only calculations.",
        ],
    },
    {
        id: "coupons",
        title: "Coupons and Campaigns - Technical Deep Dive",
        subtitle: "Campaign configuration behavior, assignment handling, and influenced revenue interpretation.",
        routeHints: ["/admin/coupons", "coupon create and edit APIs", "coupon analytics reads"],
        whatThisDoes: [
            "Explains technical implications of coupon windowing and eligibility.",
            "Documents assignment persistence for targeted campaigns.",
            "Clarifies analytics interpretation based on redemption-linked orders.",
        ],
        tasks: [
            {
                title: "Technical campaign publish flow",
                steps: [
                    "Create or edit coupon with deterministic code, window, and discount configuration.",
                    "Validate assignment scope and ensure no conflicting campaign logic exists.",
                    "Run controlled checkout verification in staging-like flow.",
                    "Verify redemption and influenced-revenue metrics after initial usage.",
                ],
            },
        ],
        howItWorks: [
            "Campaign behavior is governed by coupon rules, date windows, and assignment scope.",
            "Analytics derive influenced revenue using redemption references and order totals.",
            "Edit flow updates assignment records as part of campaign maintenance.",
        ],
        tips: [
            "Keep campaign code naming deterministic for easier analytics reconciliation.",
            "Avoid overlapping high-priority coupons targeting same audience segment.",
        ],
    },
    {
        id: "blog-builder-admin",
        title: "Blog Builder Operations - Technical Deep Dive",
        subtitle: "Data flow, validation, and persistence for visual and code modes.",
        routeHints: [
            "/admin/blog",
            "src/components/admin/blog/BlogEditor.tsx",
            "src/app/api/admin/blogs/[id]/route.ts",
            "src/app/api/admin/blogs/[id]/validate/route.ts",
            "src/lib/blogValidation.ts",
            "src/types/blogs.ts",
        ],
        whatThisDoes: [
            "Maps editor UI state to blog payload fields for visual and code modes.",
            "Explains publish validation for metadata, alt text, and JS acknowledgment.",
            "Documents code mode lock and custom code storage behavior.",
        ],
        tasks: [
            {
                title: "Save and autosave payload flow",
                steps: [
                    "Load blog post and hydrate editor state from API payload.",
                    "Update state on form inputs and section builder operations.",
                    "Save posts with editor_mode, builder_layout, and full_page fields.",
                    "Trigger autosave when title is present to keep drafts synced.",
                ],
            },
            {
                title: "Publish validation pipeline",
                steps: [
                    "Call validate route before publish or schedule actions.",
                    "Enforce required metadata and cover image requirements.",
                    "Validate builder_layout image alt text and custom code summary.",
                    "Require custom JS acknowledgment when JS is present.",
                ],
            },
            {
                title: "Code mode lock behavior",
                steps: [
                    "Persist code_mode_locked flag on save.",
                    "Disable switching back to visual mode when locked.",
                    "Keep code-only content in full_page_html/css/js fields.",
                ],
            },
        ],
        howItWorks: [
            "Blog posts store editor_mode with either builder_layout JSON or full_page HTML/CSS/JS fields.",
            "Custom code blocks are stored inside builder_layout under type custom_code.",
            "Validation runs in blogValidation and returns errors and warnings for publish gating.",
            "Custom JS acknowledgment is required for full code mode and visual custom code blocks.",
            "Custom JS acknowledgment is required before saving when JS is present.",
            "Syntax validation flags unbalanced HTML tags and JS/CSS delimiters.",
            "Preview tokens are generated by the preview API with a 48-hour default.",
            "Revision snapshots persist on create and update for rollback workflows.",
        ],
        tips: [
            "Add syntax validation and sanitization before exposing custom code on the storefront.",
            "Keep custom JS acknowledgment gating in the publish pipeline.",
            "Preserve theme-agnostic payloads so storefront themes can render independently.",
        ],
    },
    {
        id: "blog-media-library",
        title: "Blog Media Library - Technical Deep Dive",
        subtitle: "Upload pipeline, variant generation, and deletion safeguards.",
        routeHints: [
            "src/app/api/admin/blogs/media/route.ts",
            "blog_media_library table",
            "supabase storage bucket blog-media",
        ],
        whatThisDoes: [
            "Documents media upload validation and size limits.",
            "Explains variant generation and metadata capture.",
            "Covers deletion guards for published post usage.",
        ],
        tasks: [
            {
                title: "Media upload pipeline",
                steps: [
                    "Validate file size and MIME type constraints.",
                    "Upload original file and generate size variants.",
                    "Persist metadata and variant paths in blog_media_library.",
                ],
            },
            {
                title: "Safe delete flow",
                steps: [
                    "Check if media is referenced by published posts.",
                    "Block delete when usage exists.",
                    "Remove original and variant files when delete is allowed.",
                ],
            },
        ],
        howItWorks: [
            "Variants store storage paths and public URLs for thumbnail, medium, and large sizes.",
            "Media metadata stores width, height, and alt text for validation checks.",
            "Date filters operate on created_at for operational reporting.",
        ],
        tips: [
            "Use storage lifecycle policies if media retention needs to be enforced.",
            "Keep MIME restrictions aligned with storefront rendering support.",
        ],
    },
    {
        id: "blog-seo-multilingual",
        title: "Blog SEO & Multilingual - Technical Deep Dive",
        subtitle: "Metadata emission, hreflang alternates, and sitemap generation.",
        routeHints: [
            "src/app/blogs/[slug]/page.tsx",
            "src/app/sitemap.ts",
            "docs/blog/blog_builder_seo_multilingual.md",
        ],
        whatThisDoes: [
            "Maps SEO fields to public metadata and open graph output.",
            "Generates hreflang alternates for linked variants.",
            "Builds the blog sitemap from published posts only.",
        ],
        tasks: [
            {
                title: "Metadata pipeline",
                steps: [
                    "Load the published post record and media assets.",
                    "Apply OG fallback logic to meta and cover data.",
                    "Emit robots and canonical values in metadata.",
                ],
            },
            {
                title: "Hreflang alternates",
                steps: [
                    "Fetch all published variants by variant_group_id.",
                    "Map languages to the correct public route path.",
                    "Expose alternates in metadata and switcher UI.",
                ],
            },
            {
                title: "Sitemap generation",
                steps: [
                    "Query published posts with slug and language.",
                    "Build canonical URLs using the site base URL.",
                    "Return sitemap entries with last modified timestamps.",
                ],
            },
        ],
        howItWorks: [
            "Variant linkage uses a shared variant_group_id across languages.",
            "Sitemap routes include /blogs and /hi/blogs entries.",
            "Redirect pages keep /blog paths compatible with legacy links.",
        ],
        tips: [
            "Keep metadataBase aligned with NEXT_PUBLIC_SITE_URL.",
            "Ensure canonical URLs are absolute when overriding defaults.",
        ],
    },
    {
        id: "blog-scheduling",
        title: "Blog Scheduling & Publish Lifecycle - Technical Deep Dive",
        subtitle: "Scheduler execution, notifications, and rollback behavior.",
        routeHints: [
            "src/app/api/admin/blogs/scheduler/route.ts",
            "src/app/api/admin/blogs/notifications/route.ts",
            "blog_publish_notifications table",
        ],
        whatThisDoes: [
            "Executes scheduled publishes with validation gating.",
            "Writes scheduler outcomes to notification storage.",
            "Supports rollback to draft when validation fails.",
        ],
        tasks: [
            {
                title: "Scheduled publish flow",
                steps: [
                    "Query scheduled posts due for publish.",
                    "Run publish validation and gate failures.",
                    "Publish and write revisions for successful posts.",
                ],
            },
            {
                title: "Notification feed",
                steps: [
                    "Insert notification row for each scheduler result.",
                    "Expose notifications via admin API.",
                    "Render results in admin list UI.",
                ],
            },
        ],
        howItWorks: [
            "Scheduler validates cover, SEO, and code requirements.",
            "Failure results revert status to draft and log errors.",
            "Success results set published_at and log a publish notification.",
        ],
        tips: [
            "Use the scheduler secret in automated jobs.",
            "Monitor failed schedules and fix validation errors quickly.",
        ],
    },
    {
        id: "blog-public-rendering",
        title: "Blog Public Experience - Technical Deep Dive",
        subtitle: "Server rendering, share helpers, and SEO output mapping.",
        routeHints: [
            "src/app/blogs/page.tsx",
            "src/app/blogs/[slug]/page.tsx",
            "src/components/blog/ShareButtons.tsx",
        ],
        whatThisDoes: [
            "Maps blog content to public list and detail pages.",
            "Documents share button behavior and native share fallback.",
            "Explains related posts/products rendering.",
        ],
        tasks: [
            {
                title: "Public rendering flow",
                steps: [
                    "Query published posts and build list cards.",
                    "Load detail page data with builder layout or code mode.",
                    "Render related posts/products from linkage tables.",
                ],
            },
            {
                title: "Share actions",
                steps: [
                    "Use canonical URL for share targets.",
                    "Fallback to clipboard copy for Instagram.",
                    "Expose native share on supported devices.",
                ],
            },
        ],
        howItWorks: [
            "Share buttons are client-side to access clipboard and Web Share API.",
            "Product cards reuse existing product component patterns.",
            "Related posts/products order respects stored sort order.",
        ],
        tips: [
            "Keep share URLs consistent with canonical metadata.",
            "Verify related products have active inventory.",
        ],
    },
    {
        id: "blog-analytics",
        title: "Blog Analytics - Technical Deep Dive",
        subtitle: "Metric computation, events pipeline, and dashboard composition.",
        routeHints: [
            "src/app/admin/blog/analytics/page.tsx",
            "src/app/api/admin/blogs/analytics/route.ts",
            "blog_analytics_events table",
        ],
        whatThisDoes: [
            "Defines aggregation logic for views, clicks, and CTR.",
            "Documents referrer and device bucket rules.",
            "Explains content health calculations.",
        ],
        tasks: [
            {
                title: "Aggregate analytics",
                steps: [
                    "Query events within the selected range.",
                    "Compute per-post counters and totals.",
                    "Bucket referrers and devices for charts.",
                ],
            },
            {
                title: "Dashboard delivery",
                steps: [
                    "Expose summary, series, and CTR ranking in API.",
                    "Render dashboard cards and tables in the UI.",
                    "Call out unavailable metrics when missing.",
                ],
            },
        ],
        howItWorks: [
            "Events are stored in blog_analytics_events with type and referrer.",
            "Top posts by CTR derive from product clicks divided by views.",
            "Low-traffic flags inspect 30-day page view totals.",
        ],
        tips: [
            "Keep event instrumentation consistent across builder sections.",
            "Backfill analytics events before relying on trends.",
        ],
    },
    {
        id: "blog-qa-release",
        title: "Blog QA & Release - Technical Deep Dive",
        subtitle: "Test coverage mapping and release readiness instrumentation.",
        routeHints: [
            "docs/blog/blog_builder_qa_test_cases.md",
            "docs/blog/blog_builder_release_checklist.md",
        ],
        whatThisDoes: [
            "Maps acceptance criteria to QA checks.",
            "Provides a standardized release gate.",
            "Captures known limits for technical handoff.",
        ],
        tasks: [
            {
                title: "Validate acceptance coverage",
                steps: [
                    "Review PRD acceptance criteria alignment.",
                    "Confirm QA cases cover scheduling, SEO, and media.",
                    "Update cases when scope changes.",
                ],
            },
            {
                title: "Release readiness",
                steps: [
                    "Confirm migration and storage prerequisites.",
                    "Verify scheduler secret and automation.",
                    "Capture known limits before handoff.",
                ],
            },
        ],
        howItWorks: [
            "QA cases double as regression checks.",
            "Release checklist reduces launch risk across teams.",
        ],
        tips: [
            "Track QA execution timestamps for audit trails.",
            "Include analytics backfill status in release notes.",
        ],
    },
    {
        id: "cms-overview",
        title: "CMS Content and Banners Overview - Technical Deep Dive",
        subtitle: "Architecture and state management behavior across Hero, Description, Store Info, Categories, and Banners tabs.",
        routeHints: ["/admin/cms", "src/app/admin/cms/page.tsx", "/api/admin/cms/site-config"],
        whatThisDoes: [
            "Explains CMS tab composition and per-tab save behavior.",
            "Documents dirty-state checks and upload pathways.",
            "Provides technical publish sequence for reliable updates.",
        ],
        tasks: [
            {
                title: "CMS technical publish sequence",
                steps: [
                    "Load site config map from API and initialize tab fields.",
                    "Apply edits in one tab and persist via JSON updates or multipart upload.",
                    "Respect unsaved-change prompt before tab navigation.",
                    "Validate storefront render after cache window to confirm successful publish.",
                ],
            },
        ],
        howItWorks: [
            "CMS main page orchestrates field groups and delegates categories and banners to dedicated managers.",
            "Text-like site settings upsert by key; images upload to storage then persist URL.",
            "State reset and message channels provide explicit success and failure feedback.",
        ],
        tips: [
            "Publish in small batches to isolate failures quickly.",
            "When troubleshooting, inspect API payload and response before UI assumptions.",
        ],
    },
    {
        id: "cms-categories",
        title: "CMS Categories Detailed Usage - Technical Deep Dive",
        subtitle: "Validation, reorder mechanics, and soft-delete behavior for category entities.",
        routeHints: ["/admin/cms (Categories)", "POST/PATCH /api/admin/cms/categories", "src/components/admin/cms/CategoriesManager.tsx"],
        whatThisDoes: [
            "Documents category entity constraints and write paths.",
            "Explains sort_order swap logic during reorder operations.",
            "Clarifies storefront visibility rules for active and non-deleted rows.",
        ],
        tasks: [
            {
                title: "Category technical mutation flow",
                steps: [
                    "Create payload with normalized slug and validated fields.",
                    "Run uniqueness checks against non-deleted categories.",
                    "For reorder action, swap sort_order of source and target rows.",
                    "For soft-delete, set deleted_at and verify removal from active list queries.",
                ],
            },
        ],
        howItWorks: [
            "Slugify and validation guard route-safe values.",
            "GET query filters out deleted rows and orders by sort_order ascending.",
            "Image uploads write to cms-assets and return public URL for draft binding.",
        ],
        tips: [
            "Treat reorder operations as data mutations requiring post-action verification.",
            "Keep slug changes minimal after launch to preserve URL consistency.",
        ],
    },
    {
        id: "cms-banners",
        title: "CMS Banners and Hero Set Detailed Usage - Technical Deep Dive",
        subtitle: "Placement-level APIs, grouped hero rendering, and save-gated hero image removal internals.",
        routeHints: ["/admin/cms (Banners)", "POST/PATCH /api/admin/cms/banners", "src/components/admin/cms/BannersManager.tsx", "src/lib/cms.ts"],
        whatThisDoes: [
            "Explains banner action model including bulk-upload and bulk-create.",
            "Documents grouped homepage hero UI model and placement-level controls.",
            "Details save-time hero removal sequencing and layout-mode persistence.",
        ],
        tasks: [
            {
                title: "Hero group technical save flow",
                steps: [
                    "Load banners and build grouped homepage_hero synthetic row for UI.",
                    "Track pending hero removals locally when thumbnail x is clicked.",
                    "On save, optionally upload new files, create extra rows, and patch primary row.",
                    "Apply queued soft-delete calls for pending removals.",
                    "Persist hero_banner_layout to site_config and reload list for final consistency.",
                ],
            },
            {
                title: "Storefront resolution flow",
                steps: [
                    "Read banners by placement through cached cms helpers.",
                    "Filter by active flag and date window using IST semantics.",
                    "For homepage_hero with one-or-less active result, apply fallback to all uploaded hero images.",
                    "Render carousel mode based on hero_banner_layout value.",
                ],
            },
        ],
        howItWorks: [
            "Banner APIs support action discriminator for bulk and placement operations.",
            "Grouped hero row is a UI transformation over normalized banner rows.",
            "Hero removals are intentionally deferred until save to prevent accidental immediate data loss.",
        ],
        tips: [
            "After major hero edits, validate both admin grouped row count and storefront slide count.",
            "Use placement-level actions carefully because they affect all banners in that placement.",
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
            "Read model: admin_customer_summary view for list speed and stable shape.",
            "Detail model: joins from profiles, orders, addresses, interactions.",
            "Write model: profile upsert plus interaction logging side-effects.",
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
            "Applies optional query filters only when selected or filled.",
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
            "Date filters convert to full-day ranges using T00:00:00 and T23:59:59.",
            "When optional filters are unchecked, related values are cleared in UI state.",
        ],
        tips: [
            "Always test list and export parity after adding or changing any filter.",
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
            "Returns derived metrics like average order value and repeat approximation.",
        ],
        tasks: [
            {
                title: "Debug missing detail data",
                steps: [
                    "Verify customer exists in admin_customer_summary.",
                    "Verify profile row in user_profiles and order rows for user id.",
                    "Check address soft delete flags and interaction rows.",
                ],
            },
        ],
        howItWorks: [
            "Orders are enriched with shipping city, state, and pincode snapshots.",
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
            "Maintains single default shipping and billing by clearing existing defaults first.",
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
                    "Delete endpoint soft-deletes row (is_deleted=true).",
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
            "Gives support and admin process a technical base for compliance requests.",
        ],
        tasks: [
            {
                title: "Handle customer data request",
                steps: [
                    "Customer triggers export request from account profile.",
                    "Export endpoint prepares account-related data payload or response.",
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
            "Delete request endpoint is a logging and intake stage, not immediate hard delete.",
        ],
        tips: [
            "Document every compliance request with case ID and timestamps.",
        ],
    },
    {
        id: "cms-tech-api",
        title: "CMS API Contracts and Validation",
        subtitle: "Detailed behavior of site config, categories, and banners APIs.",
        routeHints: [
            "GET/POST /api/admin/cms/site-config",
            "GET/POST/PATCH /api/admin/cms/categories",
            "GET/POST/PATCH /api/admin/cms/banners",
        ],
        whatThisDoes: [
            "Defines strict payload validation and action-based branching for CMS mutations.",
            "Supports multipart media upload and JSON upsert and insert operations.",
            "Implements soft-delete as default destructive behavior for content safety.",
        ],
        tasks: [
            {
                title: "Site config mutation flow",
                steps: [
                    "For image updates, send multipart form-data with file plus key and group metadata.",
                    "Upload to cms-assets, get public URL, and upsert site_config by key.",
                    "For text and url updates, send JSON updates array and run validation before upsert.",
                    "Reject invalid required fields or malformed URL-like values with 400 status.",
                ],
            },
            {
                title: "Categories and banners action flow",
                steps: [
                    "Categories POST action handles create, reorder, and soft-delete.",
                    "Banners POST action handles single-upload, bulk-upload, bulk-create, soft-delete, and soft-delete-placement.",
                    "Banners PATCH handles single row update and placement-wide active state updates.",
                    "All routes return explicit success or error payloads consumed by admin UI message state.",
                ],
            },
        ],
        howItWorks: [
            "Banner color validation requires strict #RRGGBB format for background and text colors.",
            "Banner link accepts relative paths and absolute http or https URLs.",
            "Date validation rejects end_date values earlier than start_date.",
            "Category slug validation and uniqueness checks prevent routing conflicts.",
        ],
        tips: [
            "Keep API error messages user-readable because they are directly shown in admin notices.",
            "Prefer additive actions and soft-delete for operational recovery.",
        ],
    },
    {
        id: "cms-tech-storefront",
        title: "CMS to Storefront Read Pipeline",
        subtitle: "How CMS records are filtered, cached, and rendered in classic theme components.",
        routeHints: [
            "src/lib/cms.ts",
            "src/themes/classic/pages/HomePage.tsx",
            "src/themes/classic/components/home/HeroBannerCarousel.tsx",
            "src/themes/classic/components/home/OfferBanner.tsx",
            "src/themes/classic/components/home/PopupBannerGate.tsx",
            "src/themes/classic/components/shop/ShopTopBanner.tsx",
        ],
        whatThisDoes: [
            "Loads CMS data with unstable_cache and short revalidation.",
            "Applies active and date-window filtering to banner placements.",
            "Provides fallback behavior for hero and categories when data is sparse.",
        ],
        tasks: [
            {
                title: "Banner placement resolution",
                steps: [
                    "Load non-deleted banners sorted by priority then created_at.",
                    "Filter by requested placement and active status for current IST date.",
                    "For homepage_hero when active result count is one or less, return all hero images to preserve slider UX.",
                    "Render placement-specific UI component in theme page and component layer.",
                ],
            },
            {
                title: "Hero layout resolution",
                steps: [
                    "Read hero_banner_layout from site_config map.",
                    "Default to contained mode unless value equals full_width.",
                    "Pass layout mode prop to HeroBannerCarousel.",
                    "Apply corresponding size classes and container rules in carousel.",
                ],
            },
        ],
        howItWorks: [
            "Site config, categories, and banners each have independent cache keys with revalidate 30 seconds.",
            "Date computation for active banners uses IST date string behavior.",
            "If no hero banners are returned, home page falls back to static Hero component.",
        ],
        tips: [
            "When debugging stale content, validate both cache window and browser hard refresh.",
            "Validate remote image domain allowlist when new storage endpoints are introduced.",
        ],
    },
];

export const handbookSections = HANDBOOK_SECTIONS;
export const technicalSections = [...TECH_SECTIONS_MIRRORED, ...TECH_SECTIONS];

export function getSectionsByMode(mode: DocMode): Section[] {
    return mode === "handbook" ? handbookSections : technicalSections;
}

export function getSection(mode: DocMode, sectionId: string): Section | undefined {
    return getSectionsByMode(mode).find((section) => section.id === sectionId);
}
