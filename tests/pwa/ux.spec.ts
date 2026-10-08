import { test, expect, chromium, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

function load(filename: string, cache = new Map<string, Record<string, unknown>>()): Record<string, unknown> {
  const file = path.resolve(filename); if (cache.has(file)) return cache.get(file)!;
  const exports: Record<string, unknown> = {}; cache.set(file, exports);
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("exports", "require", "module", source)(exports, (id: string) => {
    const base = id.startsWith("@/") ? path.resolve("src", id.slice(2)) : path.resolve(path.dirname(file), id);
    return load(fs.existsSync(base + ".ts") ? base + ".ts" : path.join(base, "index.ts"), cache);
  }, { exports }); return exports;
}
type Question = { prompt: string; choices: string[]; answerIndex: number };
const units = load("src/data/chemistry.ts").chemistryUnits as { slug: string; questions: Question[] }[];
const pool = units.find(unit => unit.slug === "chemistry-basic-composition")!.questions;

async function setup(info: TestInfo, width: number, suppressInstall = true) {
  const browser = await chromium.launch({ channel: info.project.metadata.channel as string, headless: true });
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3211", viewport: { width, height: 900 }, serviceWorkers: "block" });
  await context.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  if (suppressInstall) await context.addInitScript(() => { localStorage.setItem("chemica-install-offered", "1"); });
  const page = await context.newPage();
  return { page, browser };
}
async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
async function atTarget(page: Page) {
  await expect.poll(() => page.locator("#inorganic-fe-knowledge").evaluate(element => {
    const top = element.getBoundingClientRect().top;
    let ancestor: Element | null = element;
    while (ancestor) { if (ancestor instanceof HTMLDetailsElement && !ancestor.open) return false; ancestor = ancestor.parentElement; }
    return top >= 0 && top < 180;
  })).toBe(true);
}
for (const width of [1280, 390]) {
  test(`diagram controls, mobile table and conditional electrolysis examples at ${width}px`, async ({}, info) => {
    const { page, browser } = await setup(info, width);
    try {
      for (const category of ["organic", "inorganic"]) {
        await page.goto(`/units/${category}-reactions#${category}-reaction-map-studio`);
        await expect(page.locator(".reaction-map-studio")).toBeVisible();
        await expect(page.locator(".map-options").nth(1)).not.toHaveAttribute("open", "");
        await expect(page.locator(".map-options").first()).not.toHaveAttribute("open", "");
        await page.getByRole("button", { name: "系統図を拡大", exact: true }).click();
        await page.getByRole("button", { name: "全体表示", exact: true }).click();
        await expect(page.locator('output[aria-label="表示倍率"]')).toHaveText("全体");
        await fits(page);
        await page.screenshot({ path: info.outputPath(`diagram-${category}-${width}.png`), fullPage: false });
      }
      await page.goto("/units/batteries-electrolysis#electrolysis-workbench");
      await expect(page.getByText(/自己採点用です。入力内容の自動採点/)).toBeVisible();
      await page.getByRole("tab", { name: "CuSO₄水溶液｜Pt", exact: true }).click();
      await expect(page.getByLabel("陽極式", { exact: true })).toHaveAttribute("placeholder", "例：2H₂O → O₂ + 4H⁺ + 4e⁻");
      await page.getByRole("tab", { name: "CuSO₄水溶液｜Cu", exact: true }).click();
      await expect(page.getByLabel("陽極式", { exact: true })).toHaveAttribute("placeholder", "例：Cu → Cu²⁺ + 2e⁻");
      await page.getByLabel("陰極式", { exact: true }).fill("Cu²⁺ + 2e⁻ → Cu");
      await page.getByRole("button", { name: "解答を表示", exact: true }).click();
      await expect(page.locator(".practice-answer")).toBeVisible();
      await fits(page);
      if (width < 620) {
        const table = page.locator("#electrolysis-pattern-table .table-wrap");
        await table.scrollIntoViewIfNeeded();
        expect(await table.locator("td").first().evaluate(el => getComputedStyle(el).position)).toBe("sticky");
        await table.evaluate(el => { el.scrollLeft = 150; });
        const difference = await table.evaluate(el => el.querySelector("td")!.getBoundingClientRect().left - el.getBoundingClientRect().left);
        expect(Math.abs(difference)).toBeLessThan(4);
      }
    } finally { await browser.close(); }
  });
  test(`search, direct hash, same-page disclosure and titles at ${width}px`, async ({}, info) => {
    const { page, browser } = await setup(info, width);
    try {
      await page.goto("/search?q=Fe");
      await page.locator('a[href="/units/inorganic-reactions#inorganic-fe-knowledge"]').first().click();
      await atTarget(page);
      await expect(page.locator("#inorganic-fe-knowledge")).toHaveClass(/anchor-highlight/);
      expect((await page.title()).match(/Chemica/g)).toHaveLength(1);
      await fits(page);
      await page.reload(); await atTarget(page);
      await page.locator("#unit-details").evaluate((element: HTMLDetailsElement) => { element.open = false; });
      await page.locator(".material-toc > summary").click();
      await page.locator('.material-toc a[href="#inorganic-fe-knowledge"]').click(); await atTarget(page);
      await page.goto("/courses/chemistry-basic");
      expect((await page.title()).match(/Chemica/g)).toHaveLength(1);
      await expect(page.getByText("最高得点70%以上の単元", { exact: true })).toBeVisible();
      await page.screenshot({ path: info.outputPath(`course-${width}.png`), fullPage: false });
    } finally { await browser.close(); }
  });
  test(`unit list returns to saved position and share never floats at ${width}px`, async ({}, info) => {
    const { page, browser } = await setup(info, width);
    try {
      await page.goto("/home#fields");
      await page.locator('a.card-primary-link[href="/units/inorganic-reactions"]').click();
      const saved = await page.evaluate(() => Number(sessionStorage.getItem("chemica-unit-list-scroll")));
      await page.locator(".back-link").click();
      await expect.poll(() => page.evaluate(expected => Math.abs(scrollY - expected), saved)).toBeLessThan(16);
      await fits(page);
      if (width < 620) {
        await page.getByRole("button", { name: "その他", exact: true }).click();
        await page.locator(".mobile-more-menu .share-trigger").click();
      } else await page.locator(".site-footer .share-trigger").click();
      await expect(page.getByRole("dialog", { name: "このページを共有" })).toBeVisible();
      expect(await page.locator(".share-url input").inputValue()).toContain("127.0.0.1:3211/home");
      await page.getByRole("button", { name: "閉じる", exact: true }).click();
      expect(await page.locator(".site-footer .share-trigger").evaluate(element => getComputedStyle(element).position)).toBe("static");
    } finally { await browser.close(); }
  });
  test(`quiz pause, reload, resume and result preserve answer counts at ${width}px`, async ({}, info) => {
    const { page, browser } = await setup(info, width);
    try {
      await page.goto("/quiz?unit=chemistry-basic-composition&count=5");
      await page.getByRole("button", { name: "演習を始める", exact: true }).click();
      const prompt = await page.locator(".question-card h2").innerText();
      const answer = pool.find(q => q.prompt === prompt)!;
      await page.locator(".choice-button").nth(answer.answerIndex).click();
      const history = await page.evaluate(() => localStorage.getItem("chemistry-question-history-v1"));
      await page.getByRole("button", { name: "中断・終了" }).click();
      await expect(page.getByRole("button", { name: "演習を再開" })).toBeVisible();
      await page.reload();
      await page.getByRole("button", { name: "演習を再開" }).click();
      expect(await page.evaluate(() => localStorage.getItem("chemistry-question-history-v1"))).toBe(history);
      await expect(page.locator(".choice-button").first()).toBeDisabled();
      await page.getByRole("button", { name: "次の問題", exact: true }).click();
      for (let i = 1; i < 5; i++) {
        const nextPrompt = await page.locator(".question-card h2").innerText();
        const q = pool.find(q => q.prompt === nextPrompt)!;
        await page.locator(".choice-button").nth(q.answerIndex).click();
        await page.getByRole("button", { name: i === 4 ? "結果を見る" : "次の問題", exact: true }).click();
      }
      await expect(page.getByRole("heading", { name: "5 / 5 問正解" })).toBeVisible();
      const records = await page.evaluate(() => JSON.parse(localStorage.getItem("chemistry-question-history-v1")!));
      expect(Object.values(records).reduce((n: number, item) => n + (item as { attemptCount: number }).attemptCount, 0)).toBe(5);
      const result = await page.evaluate(() => JSON.parse(localStorage.getItem("chemistry-study-progress-v1")!)["chemistry-basic-composition"]);
      expect(result.attempts).toBe(1); expect(result.correct).toBe(5);
      await page.goto("/progress"); await expect(page.locator(".progress-empty-welcome")).toHaveCount(0);
      await fits(page); await page.screenshot({ path: info.outputPath(`progress-${width}.png`), fullPage: false });
    } finally { await browser.close(); }
  });
  test(`empty records, first and returning home, print quiz filters at ${width}px`, async ({}, info) => {
    const { page, browser } = await setup(info, width);
    try {
      await page.goto("/progress"); await expect(page.locator(".progress-empty-welcome")).toBeVisible();
      await expect(page.locator(".summary-grid")).toContainText("未受験");
      await expect(page.locator(".progress-numbers").first()).toContainText("—");
      await page.goto("/home"); await expect(page.getByText("化学基礎から始める", { exact: true })).toBeVisible();
      await page.evaluate(() => localStorage.setItem("chemistry-study-progress-v1", JSON.stringify({ all: { attempts: 1, correct: 3, total: 5, bestPercent: 60, lastStudied: new Date().toISOString() } })));
      await page.reload(); await expect(page.getByText("前回の続き", { exact: true })).toBeVisible();
      await expect(page.getByText("新しいカードへ", { exact: true })).toBeVisible();
      await page.goto("/"); await expect(page).toHaveURL(/\/home$/);
      await page.goto("/tools/memory-quiz");
      await expect(page.locator(".memory-answer-disclosure")).not.toHaveAttribute("open", "");
      await page.getByLabel("分野", { exact: true }).selectOption("theory");
      const scope = await page.getByLabel("範囲", { exact: true }).locator("option").nth(1).getAttribute("value");
      // Without an explicit value, HTML uses the option text.
      await page.getByLabel("範囲", { exact: true }).selectOption(scope ?? await page.getByLabel("範囲", { exact: true }).locator("option").nth(1).innerText());
      await page.getByLabel("問題数", { exact: true }).selectOption("5");
      await expect(page.locator(".memory-problem-sheet .memory-quiz-item")).toHaveCount(5);
      await page.getByRole("button", { name: "問題を作り直す" }).click();
      await page.locator(".memory-answer-disclosure > summary").click();
      await expect(page.locator(".memory-answer-sheet")).toBeVisible();
      await page.locator(".memory-answer-disclosure > summary").click();
      await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
      await page.emulateMedia({ media: "print" });
      await expect(page.locator(".memory-answer-sheet")).toBeVisible();
      await page.emulateMedia({ media: "screen" });
      await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
      await expect(page.locator(".memory-answer-sheet")).not.toBeVisible();
      await fits(page);
      await page.screenshot({ path: info.outputPath(`print-quiz-${width}.png`), fullPage: false });
    } finally { await browser.close(); }
  });
}

test("install guide uses browser prompt, can be dismissed, and stays hidden in app display", async ({}, info) => {
  const { page, browser } = await setup(info, 390, false);
  try {
    await page.goto("/home");
    await expect(page.locator(".site-footer .install-trigger")).toBeVisible();
    await page.evaluate(() => {
      const event = new Event("beforeinstallprompt", { cancelable: true });
      Object.assign(event, { prompt: async () => { sessionStorage.setItem("ux-prompt-called", "1"); }, userChoice: Promise.resolve({ outcome: "dismissed" }) });
      window.dispatchEvent(event);
    });
    await page.getByRole("button", { name: "その他", exact: true }).click();
    await page.locator(".mobile-more-menu .install-trigger").click();
    await expect(page.getByRole("dialog", { name: "ホーム画面に追加" })).toBeVisible();
    await page.getByRole("button", { name: "アプリを追加する" }).click();
    await expect(page.getByText(/追加はキャンセルされました/)).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("ux-prompt-called"))).toBe("1");
    await page.getByRole("button", { name: "今は閉じる" }).click();
    expect(await page.evaluate(() => localStorage.getItem("chemica-install-offered"))).toBe("1");
    await page.evaluate(() => localStorage.setItem("chemica-flashcard-progress-v1", JSON.stringify({ "ux-card": { status: "known", lastReviewedAt: new Date().toISOString() } })));
    await page.reload(); await expect(page.getByRole("dialog", { name: "ホーム画面に追加" })).toHaveCount(0);
    await page.addInitScript(() => {
      const original = window.matchMedia.bind(window);
      window.matchMedia = query => query === "(display-mode: standalone)" ? { ...original(query), matches: true } as MediaQueryList : original(query);
    });
    await page.reload(); await expect(page.locator(".install-trigger")).toHaveCount(0);
  } finally { await browser.close(); }
});
