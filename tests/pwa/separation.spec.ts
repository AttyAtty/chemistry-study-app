import { test, expect, chromium } from "@playwright/test";

test("separation diagrams: navigation, mobile controls and offline rendering", async ({}, info) => {
  const browser = await chromium.launch({ channel: info.project.metadata.channel as string, headless: true });
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3211", viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("/units/inorganic-reactions");
    await page.getByRole("link", { name: "系統図で学ぶ" }).click();
    await expect(page.getByRole("heading", { name: "金属イオンの系統分析", exact: true })).toBeVisible();
    await expect(page.locator("[data-node-id]")).toHaveCount(8);
    await expect(page.locator('[data-node-id="after-hcl"]')).toHaveCount(0);
    await expect(page.locator('[data-node-id="chlorides"]')).toContainText("第1属：塩化物沈殿");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator(".separation-svg").screenshot({ path: test.info().outputPath("metal-desktop.png"), style: "header { visibility: hidden !important; }" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "詳細表示", exact: true }).click();
    await expect(page.locator(".separation-details")).toContainText("再酸化");
    await expect(page.locator('[data-operation-id="metal-3-residue-operation"]')).toContainText("過剰に");
    await expect(page.locator('svg [data-field-id="metal-2-residue-condition"]')).toHaveText("酸性");
    await expect(page.locator('svg [data-field-id="metal-2-residue-amount"]')).toHaveText("十分に");
    await page.getByRole("button", { name: "拡大して読む" }).click();
    await expect(page.locator(".separation-svg")).toHaveClass(/is-zoomed/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: test.info().outputPath("metal-mobile.png"), fullPage: true });
    await page.goto("/units/organic-reactions");
    await page.getByRole("link", { name: "系統図で学ぶ" }).click();
    await expect(page.locator("[data-node-id]")).toHaveCount(12);
    await expect(page.locator("[data-compound-id]")).toHaveCount(22);
    await expect(page.locator(".benzene-bonds polygon")).toHaveCount(22);
    await expect(page.locator('[data-edge-id="organic-distill-nitrobenzene"]')).toContainText("分留");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.locator(".separation-scroll").evaluate(el => { el.scrollLeft = el.scrollWidth; });
    await page.screenshot({ path: test.info().outputPath("organic-mobile.png"), fullPage: true });
    await page.getByRole("button", { name: "詳細表示", exact: true }).click();
    await expect(page.locator(".separation-details")).toContainText("NaHCO₃では通常ほとんど");
    await expect(page.locator('[data-operation-id="organic-2-extract-operation"]')).toContainText("適宜ガス抜き");
    await expect(page.locator('[data-operation-id="organic-2-extract-operation"]')).toContainText("静置");
    await page.getByRole("button", {name:"基本表示",exact:true}).click();
    await expect(page.locator(".separation-operation-details")).toHaveCount(0);
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const slug of ["metal-analysis", "aromatic-separation"]) {
      await page.goto(`/separation/${slug}`);
      expect(await page.locator(".separation-svg").evaluate(svg => {
        const bounds = svg.getBoundingClientRect();
        return [...svg.querySelectorAll("text")].every(text => {
          const box = text.getBoundingClientRect();
          return box.left >= bounds.left-1 && box.top >= bounds.top-1 && box.right <= bounds.right+1 && box.bottom <= bounds.bottom+1;
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
      await expect(page.locator(".separation-operation-details")).toBeVisible();
    }
  } finally { await context.close(); await browser.close(); }
});
