# 08 — Decisions Log & What NOT To Do

This file records all important decisions made during development.
**Always read this before making changes** — don't repeat past mistakes.

---

## ✅ Decisions Made (June 2026)

### Reports & Analytics Page
- **Decision**: All filter controls in ONE place only — not duplicated between chart section and table section
- **Decision**: Chart component is NOT rendered if chart data is empty/unavailable
- **Decision**: Report type selector (Sales, Products, Customers, Inventory, Revenue) moved to **sidebar submenu** — removed from Reports page header to save space
- **File**: `src/app/admin/reports/page.tsx`

### Documentation Module
- **Decision**: Documentation page must follow the standard admin theme (white + gray) — NOT dark mode
- **Decision**: All 11 module docs rebuilt with in-depth content (handbook + technical views)
- **Decision**: Screenshot placeholder steps (`[Screenshot Placeholder: ...]`) render as a visual widget with browser chrome and skeleton bars
- **Decision**: `**bold**` markdown in step text renders as `<strong>` tags
- **Decision**: Mode preference saved to localStorage key: `shreehari_docs_mode`
- **Files**: `src/app/admin/documentation/docsData.ts`, `page.tsx`, `SectionDetailPage.tsx`

### Admin Panel Theme (IMPORTANT)
- **Decision**: Admin panel uses white background, gray borders, Playfair font — matches Orders/Coupons/Customers pages exactly
- **Rejected**: Dark mode `#0a0a0f` background — looked completely different from rest of admin
- **Rejected**: Glassmorphism, backdrop-blur in admin pages
- **Rule**: Never introduce new design systems to admin without showing the user and getting approval

### Project Knowledge Base
- **Decision**: Created `_project-brain/` folder as single source of truth for all project knowledge
- **Decision**: Created `ANTIGRAVITY.md` at project root as quick-start context file for AI sessions
- **Decision**: Referenced `graphify-out/` for deep codebase relationship graph

---

## ❌ What NOT To Do

### Admin Panel
- ❌ Never use dark backgrounds in admin pages (`bg-slate-900`, `bg-[#0a0a0f]`, etc.)
- ❌ Never add glassmorphism or `backdrop-blur` to admin UI
- ❌ Never duplicate filter controls — one filter, one place
- ❌ Never render chart components when chart data is empty
- ❌ Never use raw `<table>` or `<input>` HTML — use `<Table>` and `<Input>` from UI components
- ❌ Never add `className` overrides that break the admin's consistent look

### Theme / Storefront
- ❌ Never edit files inside `core/` folder in customer repos
- ❌ Never put customer-specific changes in the core upstream repo
- ❌ Never use `text-loaders` ("Loading...") instead of shimmer skeletons on PLPs/PDPs
- ❌ Never use `#000000` pure black for dark backgrounds — use charcoal/off-black

### Database / Caching
- ❌ Never skip `revalidateTag()` after admin mutations
- ❌ Never hard-delete customers — use `is_active = false` (soft delete)
- ❌ Never write raw SQL migrations without adding them to the migration history tracker

### Code Quality
- ❌ Never use `console.log` in production code
- ❌ Never skip loading/disabled state on buttons that trigger async operations
- ❌ Never expose Supabase service role key on the client side

---

## 📋 Active Conventions

### Price Formatting
```ts
`₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
```

### Toast Notifications
```ts
import { showToast } from "@/lib/toast";
showToast("Product saved successfully", "success");
showToast("Failed to save product", "error");
```

### Async Button Pattern
```tsx
<button
  onClick={handleSave}
  disabled={isSaving}
  className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
>
  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
</button>
```

### Admin Card Pattern
```tsx
<div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
  <h2 className="text-sm font-semibold text-gray-900 mb-4">Section Title</h2>
  {/* content */}
</div>
```

### Admin Page Header Pattern
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-playfair font-bold text-gray-900">Page Title</h1>
  <button className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium">
    Create New
  </button>
</div>
```

---

## 🔄 Update This File

Whenever you make a significant decision during development, add it here:

```markdown
### [Module Name] — [Date]
- **Decision**: What was decided and why
- **Rejected**: What alternative was considered and rejected
- **File**: Which files were affected
```
