import { test, expect, chromium } from "@playwright/test";
const targets = [null, 'quick-start', 'daily-questions', 'main-fields', 'focused-tools', 'bottom-navigation'];
for (const width of [1440, 390, 320]) {
  test(`home block tour, states, keyboard and offline at ${width}px`, async ({}, info) => {
    const height = width === 320 ? 667 : 900;
    const browser = await chromium.launch({ channel: info.project.metadata.channel as string, headless: true });
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:3211', viewport: {width, height} });
    const page = await context.newPage();
    const guide = page.locator('.tutorial-card');
    const welcome = page.getByRole('dialog', {name:'Chemicaへようこそ'});
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('chemica-tutorial') || 'null'));
    const replay = async () => {
      await page.getByRole('link',{name:'使い方ガイドをもう一度見る'}).last().click();
      await expect(welcome).toBeVisible();
      await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
    };
    const settle = async () => {
      let previous = NaN, stable = 0;
      await expect.poll(async () => {
        const current = await page.evaluate(() => scrollY);
        stable = Math.abs(current - previous) < 1 ? stable + 1 : 0;
        previous = current;
        return stable >= 3;
      }).toBe(true);
    };
    try {
      await page.goto('/home');
      await expect(welcome).toBeVisible();
      await page.evaluate(() => localStorage.setItem('tutorial-sentinel','unchanged'));
      await page.keyboard.press('Escape');
      await expect(guide).toHaveCount(0);
      expect((await state()).tutorialStatus).toBe('skipped');
      await page.reload();
      await expect(welcome).toBeVisible();
      await guide.getByRole('button',{name:'今後は表示しない'}).click();
      expect((await state()).tutorialStatus).toBe('dismissed');
      await page.reload();
      await expect(guide).toHaveCount(0);
      // Replay works from a different page and does not reset permanent dismissal.
      await page.goto('/progress');
      await replay();
      await page.keyboard.press('Shift+Tab');
      expect(await guide.evaluate(el=>el.contains(document.activeElement))).toBe(true);
      await page.keyboard.press('Tab');
      expect(await guide.evaluate(el=>el.contains(document.activeElement))).toBe(true);
      await page.keyboard.press('Escape');
      expect((await state()).tutorialStatus).toBe('dismissed');
      if (width < 681) {
        await page.getByRole('button',{name:'その他',exact:true}).click();
        await page.locator('.mobile-more-menu').getByRole('link',{name:'使い方ガイドをもう一度見る'}).click();
        await expect(welcome).toBeVisible();
      } else await replay();
      // A missing whole block is skipped without crashing.
      await page.evaluate(()=>document.querySelector('[data-tutorial="daily-questions"]')?.remove());
      for(const step of [1,2,4,5,6]) {
        await expect(guide.locator('.tutorial-position')).toContainText(`${step} / 6`);
        await guide.getByRole('button',{name:step === 6 ? '完了' : '次へ',exact:true}).click();
      }
      expect((await state()).tutorialStatus).toBe('dismissed');
      await page.evaluate(()=>localStorage.removeItem('chemica-tutorial'));
      await page.reload();
      await expect(welcome).toBeVisible();
      await page.evaluate(()=>{
        const target = window as typeof window & { tourScrollSamples: number[] };
        target.tourScrollSamples=[scrollY];
        window.addEventListener('scroll',()=>{ if(document.querySelector('.tutorial-layer')) target.tourScrollSamples.push(scrollY); });
      });
      let previousDocumentTop = 0;
      for(let step=1;step<=6;step++) {
        await expect(guide.locator('.tutorial-position')).toContainText(`${step} / 6`);
        await settle();
        const bounds = await guide.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(height);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if(step>1) {
          const selector = `[data-tutorial="${targets[step-1]}"]`;
          await expect(page.locator('.tutorial-layer')).toHaveAttribute('data-tour-target',selector);
          const shape = await page.evaluate(selector=>{
            const target=document.querySelector(selector)!;
            const r=target.getBoundingClientRect();
            const ring=document.querySelector('.tutorial-spotlight')!.getBoundingClientRect();
            const card=document.querySelector('.tutorial-card')!.getBoundingClientRect();
            return {top:r.top+scrollY, visible:ring.width>0 && ring.height>0 && ring.top>=0 && ring.bottom<=innerHeight,
              aligned:Math.abs(ring.left-Math.max(4,r.left-4))<2 && Math.abs(ring.width-Math.min(innerWidth-8,r.width+8))<2,
              separate:card.bottom<=ring.top || card.top>=ring.bottom || card.right<=ring.left || card.left>=ring.right};
          },selector);
          expect(shape.visible).toBe(true);
          expect(shape.aligned).toBe(true);
          expect(shape.separate).toBe(true);
          if(step<6 || width>=681) { expect(shape.top).toBeGreaterThanOrEqual(previousDocumentTop); previousDocumentTop=shape.top; }
          expect(await page.locator('.home-main-field-grid > article').count()).toBe(4);
          expect(await page.locator('[data-tutorial="daily-questions"] .daily-card').count()).toBe(3);
          expect(await page.locator('[data-tutorial="focused-tools"] .home-diagram-hub-card').count()).toBe(1);
        }
        await page.screenshot({path:`test-results/tutorial-blocks-${info.project.name}-${width}-${step}.png`});
        await guide.getByRole('button',{name:step===6?'完了':'次へ',exact:true}).focus();
        await page.keyboard.press('Enter');
      }
      const samples = await page.evaluate(()=>(window as typeof window & {tourScrollSamples:number[]}).tourScrollSamples);
      expect(samples.every((value,i)=>i===0 || value>=samples[i-1]-1)).toBe(true);
      expect((await state()).tutorialStatus).toBe('completed');
      expect((await state()).tutorialVersion).toBe('0.7.0');
      expect(await page.evaluate(()=>localStorage.getItem('tutorial-sentinel'))).toBe('unchanged');
      await page.reload();
      await expect(guide).toHaveCount(0);
      await replay();
      for(let i=0;i<3;i++) await guide.getByRole('button',{name:'次へ'}).click();
      await settle();
      expect(await page.locator('.home-page').evaluate(el=>(el as HTMLElement).inert)).toBe(true);
      const beforeInspect = await page.evaluate(()=>scrollY);
      await page.mouse.move(50,150);
      await page.mouse.wheel(0,160);
      await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(beforeInspect);
      await expect(page.locator('.tutorial-layer')).toHaveAttribute('data-tour-target','[data-tutorial="main-fields"]');
      await page.keyboard.press('Escape');
      expect((await state()).tutorialStatus).toBe('completed');
      await expect.poll(()=>page.evaluate(()=>navigator.serviceWorker.controller!==null),{timeout:90000}).toBe(true);
      await page.reload();
      await context.setOffline(true);
      await page.reload();
      await replay();
      await guide.getByRole('button',{name:'次へ'}).click();
      await guide.getByRole('button',{name:'戻る'}).click();
      await expect(welcome).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(guide).toHaveCount(0);
      await replay();
      await guide.getByRole('button',{name:'今後は表示しない'}).click();
      expect((await state()).tutorialStatus).toBe('dismissed');
      await replay();
      for(let i=0;i<5;i++) await guide.getByRole('button',{name:'次へ'}).click();
      await guide.getByRole('button',{name:'完了',exact:true}).click();
      expect((await state()).tutorialStatus).toBe('dismissed');
    } finally { await context.close(); await browser.close(); }
  });
}
