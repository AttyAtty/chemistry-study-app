import { test, expect, chromium, type Page } from "@playwright/test";

async function printPages(page:Page,path:string) {
  await page.emulateMedia({media:"print"});
  const pdf=await page.pdf({path,preferCSSPageSize:true});
  const source=pdf.toString("latin1");
  const pageCount=source.match(/\/Type \/Page\b/g)?.length;
  const boxes=[...source.matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)];
  expect(boxes.length).toBeGreaterThan(0);
  for(const box of boxes) {expect(Math.abs(Number(box[1])-595.276)).toBeLessThan(1);expect(Math.abs(Number(box[2])-841.89)).toBeLessThan(1);}
  expect(pageCount).toBe(await page.locator(".illustrated-sheet").count());
  expect(await page.locator(".illustrated-diagram").evaluateAll(elements=>elements.every(el=>el.getBoundingClientRect().width<720))).toBe(true);
  await page.emulateMedia({media:"screen"});
}
test("organic illustrated lessons: structures, diagrams, tables, masks, A4 and offline",async({},info)=>{
  const browser=await chromium.launch({channel:info.project.metadata.channel as string,headless:true});
  const context=await browser.newContext({baseURL:"http://127.0.0.1:3211",viewport:{width:1440,height:1000}});
  try {
    const page=await context.newPage();
    const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
    await page.goto("/units/organic-reactions");
    await page.getByRole("link",{name:/高分子を図で理解/}).click();
    await expect(page.getByRole("heading",{name:"高分子を図で理解",exact:true})).toBeVisible();
    await expect(page.locator("[data-polymer-row]")).toHaveCount(15);
    await expect(page.locator('[data-polymer-id="ps"] [data-structure-id="styrene-structure"]')).toHaveCount(1);
    await expect(page.locator("[data-repeat-bracket]").first()).toBeVisible();
    await page.locator(".illustrated-sheet").first().screenshot({path:info.outputPath("polymers-overview.png"),style:"header {visibility:hidden!important;}"});
    await page.locator(".illustrated-sheet").nth(2).screenshot({path:info.outputPath("polymer-condensation.png"),style:"header {visibility:hidden!important;}"});
    for(const [mode,field] of [["monomer","monomer:ethylene"],["polymer","pe:name"],["polymerization","pe:method"]]) {
      await page.getByLabel("表示・問題形式",{exact:true}).selectOption(mode);
      await expect(page.locator(`[data-blank-id="${field}"]`).first()).toBeVisible();
      await expect(page.locator("[data-repeat-bracket]").first()).toBeVisible();
      await page.getByRole("button",{name:"答えを表示",exact:true}).click();
      await expect(page.locator(`[data-revealed-id="${field}"]`).first()).toBeVisible();
      await page.getByRole("button",{name:"問題に戻す",exact:true}).click();
    }
    await page.getByLabel("表示・問題形式",{exact:true}).selectOption("learn");
    await printPages(page,info.outputPath("polymers-a4.pdf"));
    await page.getByRole("button",{name:"A4印刷プレビュー",exact:true}).click();
    await expect(page.locator(".is-a4-preview")).toBeVisible();
    await page.locator(".illustrated-sheet").nth(5).screenshot({path:info.outputPath("polymer-table-preview.png"),style:"header {visibility:hidden!important;}"});
    await page.getByRole("button",{name:"通常表示に戻す",exact:true}).click();
    await page.getByRole("link",{name:"糖を図で理解",exact:true}).click();
    await expect(page.locator("[data-sugar-row]")).toHaveCount(9);
    await expect(page.locator('[data-fischer-id="glucose"]')).toHaveCount(2);
    await expect(page.locator('[data-sugar-row="sucrose"]')).toContainText("なし");
    await expect(page.locator('[data-sugar-row="fructose"]')).toContainText("あり");
    for(const [index,name] of [[0,"sugar-classification"],[1,"sugar-fischer"],[2,"sugar-hydrolysis"],[3,"sugar-polysaccharides"]] as const)
      await page.locator(".illustrated-sheet").nth(index).screenshot({path:info.outputPath(`${name}.png`),style:"header {visibility:hidden!important;}"});
    await printPages(page,info.outputPath("sugars-a4.pdf"));
    for(const mode of ["sugar","composition","reducing","hydrolysis","all"]) {
      await page.getByLabel("表示・問題形式",{exact:true}).selectOption(mode);
      const blanks=await page.locator("[data-blank-id]").count();expect(blanks).toBeGreaterThan(0);
      if(mode==="reducing") {
        await expect(page.locator('[data-sugar-row="sucrose"]')).not.toContainText("陰性");
        await expect(page.locator('[data-sugar-row="fructose"]')).not.toContainText("陽性");
      }
      if(mode==="composition"||mode==="hydrolysis") {
        await expect(page.locator('[data-sugar-row="maltose"] [data-blank-id="maltose:composition"]')).toHaveCount(1);
        await expect(page.locator('[data-sugar-row="maltose"] [data-blank-id="maltose:hydrolysis"]')).toHaveCount(1);
      }
      await page.getByRole("button",{name:"答えを表示",exact:true}).click();
      await expect(page.locator("[data-blank-id]")).toHaveCount(0);
      await page.getByRole("button",{name:"問題に戻す",exact:true}).click();
      expect(await page.locator("[data-blank-id]").count()).toBe(blanks);
    }
    await printPages(page,info.outputPath("sugars-problems-a4.pdf"));
    await page.setViewportSize({width:390,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.getByRole("button",{name:"図を拡大",exact:true}).click();
    expect(await page.locator(".illustrated-scroll").first().evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    expect(await page.locator(".illustrated-table-scroll").first().evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
    await expect.poll(()=>page.evaluate(()=>new Promise<boolean>(resolve=>{
      const worker=navigator.serviceWorker.controller;if(!worker){resolve(false);return;}
      const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve(false);},3000);
      channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data.ready===true);};
      worker.postMessage({type:"CHEMICA_STATUS"},[channel.port2]);
    })),{timeout:90000}).toBe(true);
    await context.setOffline(true);
    for(const slug of ["polymers","carbohydrates"]) {
      await page.goto(`/illustrated/${slug}`);
      await expect(page.locator(".illustrated-diagram").first()).toBeVisible();
      await page.getByLabel("表示・問題形式",{exact:true}).selectOption("all");
      await expect(page.locator("[data-blank-id]").first()).toBeVisible();
      await page.getByRole("button",{name:"答えを表示",exact:true}).click();
      await expect(page.locator("[data-revealed-id]").first()).toBeVisible();
      await page.reload();await expect(page.locator(".illustrated-diagram").first()).toBeVisible();
    }
    expect(errors).toEqual([]);
  } finally {await context.close();await browser.close();}
});
