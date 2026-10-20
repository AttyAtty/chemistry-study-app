import { test, expect, chromium } from "@playwright/test";
for (const width of [1440, 390, 320]) {
  test(`tutorial lifecycle, keyboard, missing target, offline at ${width}px`, async ({}, info) => {
    const height = width === 320 ? 667 : 900;
    const browser = await chromium.launch({ channel: info.project.metadata.channel as string, headless: true });
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:3211', viewport: {width, height} });
    const page = await context.newPage();
    const dialog = page.getByRole('dialog', {name:'Chemicaへようこそ'});
    const guide = page.locator('.tutorial-card');
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('chemica-tutorial') || 'null'));
    try {
      await page.goto('/home');
      await expect(dialog).toBeVisible();
      await page.evaluate(() => localStorage.setItem('tutorial-sentinel', 'unchanged'));
      await page.keyboard.press('Escape');
      await expect(guide).toHaveCount(0);
      expect((await state()).tutorialStatus).toBe('skipped');
      await page.reload();
      await expect(dialog).toBeVisible();
      await guide.getByRole('button',{name:'今後は表示しない'}).click();
      expect((await state()).tutorialStatus).toBe('dismissed');
      await page.reload();
      await expect(guide).toHaveCount(0);
      await page.goto('/home?guide=1');
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Shift+Tab');
      expect(await guide.evaluate(el=>el.contains(document.activeElement))).toBe(true);
      await page.keyboard.press('Tab');
      expect(await guide.evaluate(el=>el.contains(document.activeElement))).toBe(true);
      await page.keyboard.press('Escape');
      expect((await state()).tutorialStatus).toBe('dismissed');
      await page.getByRole('link',{name:'使い方ガイドをもう一度見る'}).last().click();
      await expect(dialog).toBeVisible();
      await page.evaluate(()=>document.querySelector('.home-diagram-hub-card')?.remove());
      for (let step = 1; step <= 7; step++) {
        if (step === 4) continue;
        await expect(guide.locator('.tutorial-position')).toContainText(`${step} / 7`);
        const bounds = await guide.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({path:`test-results/tutorial-${info.project.name}-${width}-${step}.png`});
        if(step === 7) await guide.getByRole('button',{name:'完了',exact:true}).click();
        else await guide.getByRole('button',{name:'次へ'}).click();
      }
      expect((await state()).tutorialStatus).toBe('dismissed');
      await page.evaluate(()=>localStorage.removeItem('chemica-tutorial'));
      await page.reload();
      await expect(dialog).toBeVisible();
      for(let i=0;i<6;i++) {
        if (i > 0) {
          let lastScroll = NaN, settled = 0;
          await expect.poll(async () => {
            const current = await page.evaluate(() => scrollY);
            settled = Math.abs(current - lastScroll) < 1 ? settled + 1 : 0;
            lastScroll = current;
            return settled >= 3;
          }).toBe(true);
          // The card must settle outside the highlighted target, including on phones.
          await expect.poll(async () => page.evaluate(() => {
            const a = document.querySelector('.tutorial-card')!.getBoundingClientRect();
            const b = document.querySelector('.tutorial-spotlight')!.getBoundingClientRect();
            return b.top >= 0 && b.bottom <= innerHeight && (a.bottom <= b.top || a.top >= b.bottom || a.right <= b.left || a.left >= b.right);
          })).toBe(true);
          await page.screenshot({path:`test-results/tutorial-final-${info.project.name}-${width}-${i+1}.png`});
        }
        await guide.getByRole('button',{name:'次へ'}).focus();
        await page.keyboard.press('Enter');
      }
      await guide.getByRole('button',{name:'完了',exact:true}).click();
      expect((await state()).tutorialStatus).toBe('completed');
      expect(await page.evaluate(()=>localStorage.getItem('tutorial-sentinel'))).toBe('unchanged');
      await page.reload();
      await expect(guide).toHaveCount(0);
      await expect.poll(()=>page.evaluate(()=>navigator.serviceWorker.controller !== null),{timeout:90000}).toBe(true);
      // Let the service worker finish caching the home route before disconnecting.
      await page.reload();
      await context.setOffline(true);
      await page.reload();
      await page.getByRole('link',{name:'使い方ガイドをもう一度見る'}).last().click();
      await expect(dialog).toBeVisible();
      await guide.getByRole('button',{name:'次へ'}).click();
      await guide.getByRole('button',{name:'戻る'}).click();
      await page.keyboard.press('Escape');
      await expect(guide).toHaveCount(0);
      await page.getByRole('link',{name:'使い方ガイドをもう一度見る'}).last().click();
      await expect(dialog).toBeVisible();
      await guide.getByRole('button',{name:'今後は表示しない'}).click();
      expect((await state()).tutorialStatus).toBe('dismissed');
      await page.getByRole('link',{name:'使い方ガイドをもう一度見る'}).last().click();
      await expect(dialog).toBeVisible();
      for(let i=0;i<6;i++) await guide.getByRole('button',{name:'次へ'}).click();
      await guide.getByRole('button',{name:'完了',exact:true}).click();
      expect((await state()).tutorialStatus).toBe('dismissed');
    } finally { await context.close(); await browser.close(); }
  });
}

