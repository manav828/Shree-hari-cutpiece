#!/usr/bin/env node

import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const mapPath = path.join(rootDir, "docs", "design", "premium_theme_asset_replacement_map.json");
const shouldApply = process.argv.includes("--apply");

if (!fs.existsSync(mapPath)) {
  console.error("Asset replacement map not found:", mapPath);
  process.exit(1);
}

const mapJson = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const replacements = Array.isArray(mapJson.replacements) ? mapJson.replacements : [];

let matchedCount = 0;
let replacedCount = 0;
const touchedFiles = new Set();
const pendingEntries = [];

for (const entry of replacements) {
  if (!entry || typeof entry !== "object") continue;

  const id = String(entry.id || "unknown");
  const current = String(entry.current || "");
  const replacement = String(entry.replacement || "");
  const targets = Array.isArray(entry.targets) ? entry.targets : [];

  if (!current || !replacement || targets.length === 0) continue;

  const isPlaceholderReplacement = replacement.includes("__REPLACE_WITH_FINAL__");
  if (isPlaceholderReplacement) {
    pendingEntries.push(id);
  }

  for (const target of targets) {
    const filePath = path.join(rootDir, String(target));
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const source = fs.readFileSync(filePath, "utf8");
    if (!source.includes(current)) {
      continue;
    }

    const occurrences = source.split(current).length - 1;
    matchedCount += occurrences;

    if (!shouldApply) {
      const modeLabel = isPlaceholderReplacement ? "pending-map" : "dry-run";
      console.log(`[${modeLabel}] ${id}: ${target} (${occurrences} matches)`);
      continue;
    }

    if (isPlaceholderReplacement) {
      continue;
    }

    const updated = source.split(current).join(replacement);
    fs.writeFileSync(filePath, updated, "utf8");
    replacedCount += occurrences;
    touchedFiles.add(target);
    console.log(`[applied] ${id}: ${target} (${occurrences} replacements)`);
  }
}

console.log("\nSummary");
console.log(`- Entries loaded: ${replacements.length}`);
console.log(`- Pending entries (placeholder replacement): ${pendingEntries.length}`);
console.log(`- URL matches found: ${matchedCount}`);

if (shouldApply) {
  console.log(`- URL replacements applied: ${replacedCount}`);
  console.log(`- Files touched: ${touchedFiles.size}`);
} else {
  console.log("- No files changed (dry-run mode)");
  console.log("- To apply replacements: npm run assets:replacement:apply");
}
