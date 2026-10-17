import { test, expect, chromium, type Page } from "@playwright/test";

async function blanks(page:Page) {
  return page.locator(".separation-exercise-preview [data-blank-id]").evaluateAll(elements=>[...new Set(elements.map(el=>el.getAttribute("data-blank-id")))].sort());
}
async function geometry(page:Page) {
  return page.locator(".separation-svg").evaluate(svg=>({
    box:svg.getAttribute("viewBox"),
    edges:[...svg.querySelectorAll("[data-edge-id] > path")].map(el=>el.getAttribute("d")),
    frames:[...svg.querySelectorAll(".separation-node > rect")].map(el=>["x","y","width","height"].map(attr=>el.getAttribute(attr))),
  }));
}
test("separation practice: modes, masks, structures, answers, reproducible seeds and offline",async({},info)=>{
  const browser=await chromium.launch({channel:info.project.metadata.channel as string,headless:true});
  const context=await browser.newContext({baseURL:"http://127.0.0.1:3211",viewport:{width:1440,height:1000}});
  try {
    const page=await context.newPage();
    page.setDefaultTimeout(20000);
    await page.goto("/separation/metal-analysis");
    const metalGeometry=await geometry(page);
    await page.getByRole("link",{name:"練習問題を作る"}).click();
    await expect(page.getByRole("heading",{name:"系統分離の穴埋め練習",exact:true})).toBeVisible();
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    await expect(page.locator(".separation-exercise-preview")).toBeVisible();
    expect(await geometry(page)).toEqual(metalGeometry);
    const all=await blanks(page);
    expect(all.length).toBeGreaterThan(20);
    await expect(page.locator('[data-node-id="metal-mix"]')).toContainText("Ag⁺");
    await expect(page.locator('[data-node-id="chlorides"]')).not.toContainText("AgCl");
    await expect(page.locator(".separation-details")).toHaveCount(0);
    await expect(page.locator(".separation-text")).toHaveCount(0);
    await page.locator(".separation-svg").screenshot({path:info.outputPath("metal-all.png"),style:"header { visibility:hidden !important; }"});
    await page.getByRole("button",{name:"答えを表示",exact:true}).click();
    await expect(page.locator('[data-node-id="chlorides"]')).toContainText("AgCl");
    const revealed=await page.locator("[data-revealed-id]").evaluateAll(elements=>[...new Set(elements.map(el=>el.getAttribute("data-revealed-id")))].sort());
    expect(revealed).toEqual(all);
    await page.getByRole("button",{name:"問題に戻す",exact:true}).click();
    expect(await blanks(page)).toEqual(all);
    await page.getByLabel("問題形式",{exact:true}).selectOption("species");
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    await expect(page.locator('svg [data-field-id="metal-2-residue-reagent"]')).toHaveText("H₂S");
    await expect(page.locator('[data-node-id="chlorides"]')).not.toContainText("AgCl");
    await expect(page.locator('svg [data-field-id="chlorides:line:0:result"]')).toHaveText("（白）");
    await page.getByLabel("問題形式",{exact:true}).selectOption("procedure");
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    await expect(page.locator('[data-node-id="chlorides"]')).toContainText("AgCl");
    await expect(page.locator('svg [data-blank-id="metal-2-residue-reagent"]')).toHaveCount(1);
    await expect(page.locator('svg [data-blank-id="metal-2-residue-condition"]')).toHaveCount(1);
    await expect(page.locator('svg [data-blank-id="metal-2-residue-amount"]')).toHaveCount(1);

    await page.goto("/separation/aromatic-separation");
    const organicGeometry=await geometry(page);
    await page.getByRole("link",{name:"練習問題を作る"}).click();
    await expect(page.getByLabel("分野",{exact:true})).toHaveValue("aromatic-separation");
    await page.getByLabel("問題形式",{exact:true}).selectOption("species");
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    expect(await geometry(page)).toEqual(organicGeometry);
    await expect(page.locator(".benzene-bonds polygon")).toHaveCount(22);
    await expect(page.locator('[data-node-id="benzoate"] .benzene-name')).toHaveCount(0);
    expect((await blanks(page)).length).toBe(17);
    await page.locator(".separation-svg").screenshot({path:info.outputPath("organic-species-hints.png"),style:"header { visibility:hidden !important; }"});
    await page.getByRole("button",{name:"答えを表示",exact:true}).click();
    await expect(page.locator('[data-node-id="benzoate"]')).toContainText("安息香酸ナトリウム");
    await page.getByLabel("問題形式",{exact:true}).selectOption("all");
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    await expect(page.locator(".benzene-bonds polygon")).toHaveCount(5);
    await expect(page.locator('[data-node-id="ether-start"]')).toContainText("安息香酸");
    await page.getByLabel("問題形式",{exact:true}).selectOption("procedure");
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    await expect(page.locator(".benzene-bonds polygon")).toHaveCount(22);
    await expect(page.locator('[data-node-id="benzoate"]')).toContainText("安息香酸ナトリウム");
    await expect(page.locator('[data-blank-id="organic-2-extract-action-vent"]')).toHaveCount(1);

    await page.getByLabel("問題形式",{exact:true}).selectOption("random");
    await page.getByLabel("穴埋め率",{exact:true}).selectOption("50");
    await page.getByLabel("seed",{exact:true}).fill("browser-seed");
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    const randomA=await blanks(page);
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    expect(await blanks(page)).toEqual(randomA);
    await page.getByRole("button",{name:"別の問題を生成",exact:true}).click();
    expect(await blanks(page)).not.toEqual(randomA);
    await page.getByLabel("seed",{exact:true}).fill("browser-seed");
    await page.getByRole("button",{name:"問題を生成",exact:true}).click();
    expect(await blanks(page)).toEqual(randomA);
    await page.setViewportSize({width:390,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
    await page.getByRole("button",{name:"拡大して読む",exact:true}).click();
    await expect(page.locator(".separation-svg")).toHaveClass(/is-zoomed/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
    await page.getByRole("button",{name:"全体を表示",exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>new Promise<boolean>(resolve=>{
      const worker=navigator.serviceWorker.controller;if(!worker){resolve(false);return;}
      const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve(false);},3000);
      channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data.ready===true);};
      worker.postMessage({type:"CHEMICA_STATUS"},[channel.port2]);
    })),{timeout:90000}).toBe(true);
    await context.setOffline(true);
    await page.reload();
    for(const diagram of ["metal-analysis","aromatic-separation"]) {
      await page.getByLabel("分野",{exact:true}).selectOption(diagram);
      await page.getByLabel("問題形式",{exact:true}).selectOption("random");
      await page.getByLabel("穴埋め率",{exact:true}).selectOption("30");
      await page.getByLabel("seed",{exact:true}).fill("offline-seed");
      await page.getByRole("button",{name:"問題を生成",exact:true}).click();
      expect((await blanks(page)).length).toBeGreaterThan(0);
      await page.getByRole("button",{name:"答えを表示",exact:true}).click();
      await expect(page.locator(".separation-exercise-preview [data-revealed-id]").first()).toBeVisible();
      await page.getByRole("button",{name:"問題に戻す",exact:true}).click();
    }
  } finally {await context.close();await browser.close();}
});
