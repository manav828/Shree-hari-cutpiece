#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL || "http://localhost:3000";
const stamp = new Date().toISOString().slice(0, 10);
const root = process.cwd();
const outDir = path.join(root, "docs", "trackers", "artifacts", "premium-theme-qa", stamp);
const screenshotDir = path.join(outDir, "screenshots");

const routes = [
  "/",
  "/shop",
  "/about",
  "/contact",
  "/blogs",
  "/hi/blogs",
  "/shipping-policy",
  "/returns-policy",
  "/privacy-policy",
  "/terms-of-service",
  "/login",
  "/signup",
];

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

function safeName(route) {
  if (route === "/") return "home";
  return route.replace(/^\//, "").replace(/\//g, "-");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

ensureDir(screenshotDir);

const browser = await chromium.launch({ headless: true });
const routeChecks = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();

  for (const route of routes) {
    const target = `${baseUrl}${route}`;
    const routeName = safeName(route);
    const shotPath = path.join(screenshotDir, `${viewport.name}__${routeName}.png`);

    try {
      const response = await page.goto(target, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(900);
      await page.screenshot({ path: shotPath, fullPage: true });

      routeChecks.push({
        viewport: viewport.name,
        route,
        status: response?.status() ?? 0,
        screenshot: path.relative(root, shotPath).replace(/\\/g, "/"),
        ok: Boolean(response && response.status() >= 200 && response.status() < 400),
      });
    } catch (error) {
      routeChecks.push({
        viewport: viewport.name,
        route,
        status: 0,
        screenshot: path.relative(root, shotPath).replace(/\\/g, "/"),
        ok: false,
        error: String(error),
      });
    }
  }

  await context.close();
}

const analyticsContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const analyticsPage = await analyticsContext.newPage();

const analyticsReport = {
  baseUrl,
  checks: {
    view_item: false,
    add_to_cart: false,
    filter_use: false,
    whatsapp_click: false,
  },
  events: [],
  notes: [],
};

async function closeCartOverlayIfOpen() {
  const closeOverlayButton = analyticsPage.locator('button[aria-label="Close cart"]').first();
  if (await closeOverlayButton.count()) {
    try {
      await closeOverlayButton.click({ timeout: 3000 });
      await analyticsPage.waitForTimeout(350);
    } catch {
      // Ignore if overlay is not interactable in this moment.
    }
  }
}

try {
  await analyticsPage.goto(`${baseUrl}/shop`, { waitUntil: "networkidle", timeout: 60000 });
  await analyticsPage.evaluate(() => {
    window.dataLayer = [];
  });

  const plpAddBtn = analyticsPage.locator('button[aria-label="Add to cart"]').first();
  if (await plpAddBtn.count()) {
    await plpAddBtn.click();
    await analyticsPage.waitForTimeout(700);
    await closeCartOverlayIfOpen();
  } else {
    analyticsReport.notes.push("PLP Add to Cart button not found");
  }

  const sortSelect = analyticsPage.locator("#plp-sort");
  if (await sortSelect.count()) {
    await sortSelect.selectOption("price-low");
    await analyticsPage.waitForTimeout(700);
  } else {
    analyticsReport.notes.push("PLP sort select not found");
  }

  const filterFabric = analyticsPage.locator("#filter-fabric");
  if (await filterFabric.count()) {
    const values = await filterFabric.evaluate((el) => Array.from(el.options).map((opt) => opt.value));
    const candidate = values.find((value) => value !== "all");
    if (candidate) {
      await filterFabric.selectOption(candidate);
      await analyticsPage.waitForTimeout(700);
    }
  }

  const plpEvents = await analyticsPage.evaluate(() => {
    const list = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    return list.filter((entry) => entry && typeof entry === "object");
  });

  const plpEventNames = plpEvents.map((item) => String(item.event || ""));
  analyticsReport.checks.add_to_cart = plpEventNames.includes("add_to_cart");
  analyticsReport.checks.filter_use = plpEventNames.includes("filter_use");

  await analyticsPage.addInitScript(() => {
    window.dataLayer = [];
  });

  const firstProductLink = analyticsPage.locator('a[href^="/shop/"]').first();
  if (await firstProductLink.count()) {
    await Promise.all([
      analyticsPage.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }),
      firstProductLink.click(),
    ]);
    await analyticsPage.waitForTimeout(900);
  } else {
    analyticsReport.notes.push("No PDP link found from PLP grid");
  }

  const pdpAddBtn = analyticsPage.getByRole("button", { name: "Add to Cart" });
  if (await pdpAddBtn.count()) {
    await pdpAddBtn.first().click();
    await analyticsPage.waitForTimeout(700);
    await closeCartOverlayIfOpen();
  } else {
    analyticsReport.notes.push("PDP Add to Cart button not found");
  }

  const whatsappBtn = analyticsPage.getByRole("link", { name: /Ask Stylist on WhatsApp/i });
  if (await whatsappBtn.count()) {
    await whatsappBtn.first().click({ noWaitAfter: true });
    await analyticsPage.waitForTimeout(700);
  } else {
    analyticsReport.notes.push("PDP WhatsApp CTA not found");
  }

  const pdpEvents = await analyticsPage.evaluate(() => {
    const list = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    return list.filter((entry) => entry && typeof entry === "object");
  });

  analyticsReport.events = [...plpEvents, ...pdpEvents];
  const pdpEventNames = pdpEvents.map((item) => String(item.event || ""));

  analyticsReport.checks.view_item = pdpEventNames.includes("view_item");
  analyticsReport.checks.add_to_cart = analyticsReport.checks.add_to_cart || pdpEventNames.includes("add_to_cart");
  analyticsReport.checks.whatsapp_click = pdpEventNames.includes("whatsapp_click");
} catch (error) {
  analyticsReport.notes.push(`Analytics run failed: ${String(error)}`);
}

await analyticsContext.close();
await browser.close();

const routeSummary = {
  total: routeChecks.length,
  passed: routeChecks.filter((entry) => entry.ok).length,
  failed: routeChecks.filter((entry) => !entry.ok).length,
};

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  routeSummary,
  routeChecks,
  analyticsReport,
};

ensureDir(outDir);
const reportPath = path.join(outDir, "qa-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

console.log("Premium QA report generated:", path.relative(root, reportPath).replace(/\\/g, "/"));
console.log(`Routes: ${routeSummary.passed}/${routeSummary.total} passed`);
console.log("Analytics checks:", analyticsReport.checks);
