# 🧠 _project-brain — Single Source of Truth

This folder is the **complete knowledge base** of the Shree Hari Cutpiece project.
Any AI agent or developer starting a new session should read this folder first.

---

## 📋 How to Use This Folder

### For a new AI session — say this:
> "Read all files in `_project-brain/` folder for full project context, then help me with [task]."

### With deep codebase graph — add this:
> "Also read `graphify-out/GRAPH_REPORT.md` for the full file relationship graph."

---

## 📁 Brain Files (Read These)

| File | Contents | Must Read? |
|------|---------|------------|
| `README.md` | This index | ✅ Always |
| `01-PROJECT-OVERVIEW.md` | What the project is, tech stack, full folder structure, sidebar menu | ✅ Always |
| `02-ADMIN-PANEL-RULES.md` | Admin theme rules, all 12 modules, shared UI components | ✅ Always |
| `03-DEVELOPMENT-RULES.md` | Theme override engine, caching policy, migrations, auth | ✅ Always |
| `04-STOREFRONT-RULES.md` | UI/UX requirements per page (PLP, PDP, Cart, Checkout, Account, Blog) | When touching storefront |
| `05-BUSINESS-LOGIC.md` | Selling modes, fabric calculator formula, pricing, order flow, coupons, shipping | When touching features |
| `06-DATABASE-SCHEMA.md` | Every table, column, type, and relationship | When touching DB/API |
| `07-GRAPHIFY-GUIDE.md` | How to use graphify for deep code context and CLI commands | When exploring code |
| `08-DECISIONS-LOG.md` | Past decisions, rejected approaches, active code patterns | ✅ Always |
| `09-THEME-AND-STITCH-RULES.md` | Multi-theme architecture, Stitch MCP prompts, sector adaptations, design tokens | When building themes/UI |
| `10-AI-SKILLS-REFERENCE.md` | Best Antigravity skills + Graphify MCP tools for this project | When starting a task |

---

## 🗺️ Map of ALL .md Files in the Project

### ✅ Consolidated into Brain (read brain files instead of these)
| Original File | Consolidated Into |
|--------------|------------------|
| `ANTIGRAVITY.md` (root) | Entry-point → points here |
| `DEVELOPMENT_RULES.md` | `03-DEVELOPMENT-RULES.md` |
| `RECOMMENDED_SKILLS.md` | `10-AI-SKILLS-REFERENCE.md` |
| `STITCH_THEME_RULES.md` | `09-THEME-AND-STITCH-RULES.md` |
| `STITCH_STOREFRONT_GENERATOR.md` | `09-THEME-AND-STITCH-RULES.md` |
| `ECOMMERCE_UI_UX_DESIGN_SKILL.md` | `04-STOREFRONT-RULES.md` + `09-THEME-AND-STITCH-RULES.md` |
| `docs/design/theme_design_rules.md` | `04-STOREFRONT-RULES.md` |
| `docs/design/theme_development_rules.md` | `09-THEME-AND-STITCH-RULES.md` |
| `docs/design/design_system.md` | `09-THEME-AND-STITCH-RULES.md` |
| `docs/about/DESIGN.md` | `09-THEME-AND-STITCH-RULES.md` |
| `.github/copilot-instructions.md` | `09-THEME-AND-STITCH-RULES.md` |
| `.agents/rules/graphify.md` | `07-GRAPHIFY-GUIDE.md` |
| `graphify-out/GRAPH_REPORT.md` | `07-GRAPHIFY-GUIDE.md` (referenced) |
| `img/*/DESIGN.md` (all identical) | `09-THEME-AND-STITCH-RULES.md` |

### 📖 Standalone PRDs — Read When Working on That Module
| File | When to Read |
|------|-------------|
| `cms_prd.md` | When working on CMS / banners / homepage content |
| `docs/coupons/coupon_discount_management_prd.md` | When working on coupons |
| `docs/customer/customer_management_prd.md` | When working on customers |
| `docs/blog/blog_builder_prd.md` | When working on blog |
| `docs/blog/blog_builder_prd_v2_requirements_checklist.md` | Blog v2 full checklist |
| `docs/design/shree_hari_premium_theme_prd.md` | When working on premium theme |
| `docs/NEW_CLIENT_SETUP.md` | When setting up a new customer store |
| `docs/product_options_seo_prd.md` | When working on product options/SEO |

### 📋 Trackers & Checklists — Living Documents
| File | Purpose |
|------|---------|
| `TASK_CHECKLIST.md` | Current active tasks |
| `docs/trackers/premium_theme_master_tracker.md` | Premium theme implementation log |
| `docs/trackers/blog_builder_prd_v2_implementation_tracker.md` | Blog v2 progress |
| `docs/trackers/cms_implementation_checklist.md` | CMS implementation status |
| `docs/trackers/customer_management_implementation_tracker.md` | Customer module progress |

### 🗑️ Skip These (Duplicates / Not Useful)
| File | Why Skip |
|------|---------|
| `public/docs/*.md` | Duplicate copies of `docs/admin/*.md` |
| `img/*/DESIGN.md` (×10) | All identical — covered in brain |
| `docs/trackers/premium_theme_step_by_step_verification.md` | Very large, superseded by master tracker |

---

## 🗂️ Graphify Output Files
| File | Purpose |
|------|---------|
| `graphify-out/GRAPH_REPORT.md` | 1008 nodes, 1270 edges, 56 communities — start here |
| `graphify-out/graph.html` | Interactive visual graph (open in browser) |
| `graphify-out/graph.json` | Full machine-readable graph (837KB) |
| `graphify-out/converted/EcommerceClientKit_v3_*.md` | Deep component relationships (111KB) |

---

> **Keep this updated.** When major decisions are made or new modules are built,
> update the relevant brain file and note it in `08-DECISIONS-LOG.md`.
