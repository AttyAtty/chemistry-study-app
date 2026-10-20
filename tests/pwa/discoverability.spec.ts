import { diagramHubEntries } from "../../src/data/illustrated/hub";
import { test, expect, chromium } from "@playwright/test";

test("diagram hub is discoverable, searchable, responsive, and cached offline", async ({}, info) => {
  const browser = await chromium.launch({ channel: info.project.metadata.channel as string, headless: true });
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3211", viewport: { width: 1440, height: 1000 } });
  try {
    await context.addInitScript(() => { localStorage.setItem("chemica-tutorial", JSON.stringify({ tutorialStatus: "completed", tutorialVersion: "0.7.0" })); });
    const page = await context.newPage();
    await page.goto("/home");
    await page.getByRole("link", { name: "図で理解する教材を探す" }).click();
    await expect(page).toHaveURL(/\/illustrated$/);
    await expect(page.getByRole("heading", { name: "図で理解する", level: 1 })).toBeVisible();
    await expect(page.locator(".diagram-hub-card")).toHaveCount(diagramHubEntries.length);
    expect(await page.locator(".diagram-hub-grid").first().evaluate((element) => getComputedStyle(element).display)).toBe("grid");
    const sitemap = await page.request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/illustrated");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/illustrated$/);

    await page.getByRole("button", { name: "有機", exact: true }).click();
    await expect(page.locator('.diagram-hub-card[href="/illustrated/carbohydrates"]')).toBeVisible();
    await expect(page.locator(".diagram-hub-card")).toHaveCount(3);
    await page.getByRole("button", { name: "実験・操作", exact: true }).click();
    await expect(page.locator('.diagram-hub-card[href="/separation/metal-analysis"]')).toBeVisible();

    await page.goto("/search?q=ヘンリーの法則");
    await expect(page.locator('a[href="/illustrated/henry"]').first()).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/illustrated");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.getByRole("button", { name: "理論", exact: true }).click();
    await expect(page.locator(".diagram-hub-card").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.goto("/progress");
    await expect(page.locator(".progress-category-heading")).toHaveCount(4);

    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null), { timeout: 90000 }).toBe(true);
    await context.setOffline(true);
    await page.goto("/illustrated");
    await expect(page.locator(".diagram-hub-card")).toHaveCount(diagramHubEntries.length);
  } finally {
    await context.close();
    await browser.close();
  }
});
