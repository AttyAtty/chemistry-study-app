import { test, expect, chromium } from "@playwright/test";

test("separation diagrams: navigation, mobile controls and offline rendering", async ({}, info) => {
  const browser = await chromium.launch({ channel: info.project.metadata.channel as string, headless: true });
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3211", viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("/units/inorganic-reactions");
    await page.getByRole("link", { name: "系統図で学ぶ" }).click();
    await expect(page.getByRole("heading", { name: "金属イオンの系統分析", exact: true })).toBeVisible();
    await expect(page.locator("[data-node-id]")).toHaveCount(11);
    await expect(page.locator('[data-node-id="chlorides"]')).toContainText("第1属：塩化物沈殿");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator(".separation-svg").screenshot({ path: test.info().outputPath("metal-desktop.png"), style: "header { visibility: hidden !important; }" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "詳細表示", exact: true }).click();
    await expect(page.locator(".separation-details")).toContainText("再酸化");
    await page.getByRole("button", { name: "拡大して読む" }).click();
    await expect(page.locator(".separation-svg")).toHaveClass(/is-zoomed/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: test.info().outputPath("metal-mobile.png"), fullPage: true });
    await page.goto("/units/organic-reactions");
    await page.getByRole("link", { name: "系統図で学ぶ" }).click();
    await expect(page.locator("[data-node-id]")).toHaveCount(10);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.locator(".separation-scroll").evaluate(el => { el.scrollLeft = el.scrollWidth; });
    await page.screenshot({ path: test.info().outputPath("organic-mobile.png"), fullPage: true });
    await page.getByRole("button", { name: "詳細表示", exact: true }).click();
    await expect(page.locator(".separation-details")).toContainText("NaHCO₃では通常ほとんど");
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const slug of ["metal-analysis", "aromatic-separation"]) {
      await page.goto(`/separation/${slug}`);
      expect(await page.locator(".separation-svg").evaluate(svg => {
        const bounds = (svg as SVGSVGElement).viewBox.baseVal;
        return [...svg.querySelectorAll("text")].every(text => {
          const box = text.getBBox();
          return box.x >= 0 && box.y >= 0 && box.x + box.width <= bounds.width && box.y + box.height <= bounds.height;
        });
      })).toBe(true);
    }
    await page.locator(".separation-svg").screenshot({ path: test.info().outputPath("organic-diagram.png"), style: "header { visibility: hidden !important; }" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: test.info().outputPath("organic-desktop.png"), fullPage: true });
    await expect.poll(() => page.evaluate(() => new Promise<boolean>(resolve => {
      const worker = navigator.serviceWorker.controller;
      if (!worker) { resolve(false); return; }
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); resolve(false); }, 3000);
      channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data.ready === true); };
      worker.postMessage({ type: "CHEMICA_STATUS" }, [channel.port2]);
    })), { timeout: 90000 }).toBe(true);
    await context.setOffline(true);
    for (const slug of ["metal-analysis", "aromatic-separation"]) {
      await page.goto(`/separation/${slug}`);
      await page.reload();
      await expect(page.locator(".separation-svg")).toBeVisible();
      await page.getByRole("button", { name: "詳細表示", exact: true }).click();
      await expect(page.locator(".separation-details")).toBeVisible();
    }
  } finally { await context.close(); await browser.close(); }
});
