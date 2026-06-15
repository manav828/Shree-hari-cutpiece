# 07 — Graphify Guide

Graphify has fully analyzed the Shree Hari codebase and produced a structural knowledge graph.
Use it to understand how every file connects to every other file — without reading code manually.

---

## What Is Graphify?

Graphify scans the codebase and builds a **relationship graph**:
- **Nodes** = files, components, functions, types, API routes
- **Edges** = imports, dependencies, usages, relationships
- **Communities** = logical clusters of related files

---

## Graph Stats (June 2026)

| Metric | Value |
|--------|-------|
| Files analyzed | 350 |
| Total words | ~3,122,851 |
| Nodes | 1,008 |
| Edges | 1,270 |
| Communities detected | 56 |
| Extraction accuracy | 86% extracted · 14% inferred |

---

## Output Files

All output is in: `D:\Manav\website\ecomshrihari\graphify-out\`

| File | How to Use |
|------|-----------|
| `GRAPH_REPORT.md` | **Start here** — human-readable summary of all 56 communities and key node hubs |
| `graph.html` | Open in browser → interactive visual graph you can explore |
| `graph.json` | Machine-readable full graph (837KB) — all nodes + edges |
| `converted/EcommerceClientKit_v3_*.md` | Deep converted knowledge (111KB) — detailed component relationships |
| `converted/EcommerceClientKit_v2_*.md` | Previous version analysis |
| `converted/shree_hari_blog_prd_v2_*.md` | Blog PRD in converted graph format |

---

## How to Use in a New Session

### For architecture questions:
> "Read `graphify-out/GRAPH_REPORT.md` — find the community that contains [orders/products/checkout] and explain how those files relate."

### For finding file relationships:
> "Check `graphify-out/graph.json` — what files import from `src/app/admin/products/page.tsx`?"

### For deep component analysis:
> "Read `graphify-out/converted/EcommerceClientKit_v3_*.md` to understand how [component name] connects to the rest of the system."

---

## Graphify CLI Commands (if installed)

```bash
# Query the graph with a question
graphify query "how does the checkout flow work?"

# Find shortest path between two files/concepts
graphify path "CartDrawer" "Razorpay"

# Explain a concept
graphify explain "fabric calculator"

# Update graph after code changes (no API cost, AST-only)
graphify update .
```

---

## Graphify Rules (from `.agents/rules/graphify.md`)

- Before answering architecture or codebase questions → read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure
- If `graphify-out/wiki/index.md` exists → navigate it instead of reading raw files
- If graphify MCP server is active → use `query_graph`, `get_node`, `shortest_path` tools
- If MCP not active → use CLI commands above, prefer these over `grep` for cross-module questions
- After modifying code → run `graphify update .` to keep graph current

---

## Combined Context Strategy

For maximum AI context in a new session:

| Step | Action | Coverage |
|------|--------|---------|
| 1 | Read `_project-brain/README.md` | Know what files to read |
| 2 | Read `_project-brain/01-PROJECT-OVERVIEW.md` | Tech stack + structure |
| 3 | Read `_project-brain/02-ADMIN-PANEL-RULES.md` | Admin conventions |
| 4 | Read `_project-brain/08-DECISIONS-LOG.md` | Past decisions |
| 5 | Read `graphify-out/GRAPH_REPORT.md` | Deep code relationships |
| 6 | (Optional) Read specific brain files for your task | Targeted context |
