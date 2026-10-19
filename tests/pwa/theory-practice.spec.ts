import {test,expect,chromium} from "@playwright/test";
test.setTimeout(180000);
test("theory practice, formula blocks, corrected litmus, energy map, changelog and A4/offline",async({},info)=>{
 const browser=await chromium.launch({channel:info.project.metadata.channel as string,headless:true});
 const context=await browser.newContext({baseURL:"http://127.0.0.1:3211",viewport:{width:1365,height:950}});
 try{
  const page=await context.newPage(),errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/theory/practice");
  await expect(page.getByRole("heading",{name:"理論化学 典型例題・練習問題"})).toBeVisible();
  await expect(page.locator(".worked-card")).toHaveCount(15);await expect(page.locator(".practice-question-card")).toHaveCount(12);
  await expect(page.locator("#hess")).toContainText("−110.5 kJ/mol");
  await page.getByRole("button",{name:"PV = nRT"}).click();await expect(page.locator("#choose-gas")).toContainText("正解");
  await page.locator("#gas-law").getByRole("button",{name:"数値を変えた類題"}).click();await expect(page.locator("#gas-law")).toContainText("12.5 L");
  await page.locator("#practice-p-kc details summary").click();await expect(page.locator("#practice-p-kc details")).toContainText("0.75 L/mol");
  await page.goto("/theory/formulas");await expect(page.locator(".formula-block").first()).toBeVisible();
  await expect(page.getByRole("link",{name:/典型例題・練習問題/}).first()).toHaveAttribute("href","/theory/practice");
  await page.goto("/units/chemistry-basic-acid-base-redox#indicators");
  await expect(page.getByText("リトマス",{exact:true}).first()).toBeVisible();
  await expect(page.locator("tr").filter({hasText:"リトマス"}).first()).toContainText("紫");
  await page.goto("/illustrated/energy-map");await expect(page.getByRole("heading",{name:/エネルギー変化の総まとめ図/})).toBeVisible();
  await expect(page.locator(".energy-map-material .illustrated-diagram")).toHaveCount(3);
  await page.getByLabel("表示・問題形式").selectOption("all");await expect(page.locator('[data-blank-id="energy-map:lattice"]')).toBeVisible();
  await page.getByRole("button",{name:"答えを表示"}).click();await expect(page.locator('[data-blank-id="energy-map:lattice"]')).toHaveCount(0);
  await page.emulateMedia({media:"print"});const pdf=await page.pdf({path:info.outputPath("energy-map-a4.pdf"),preferCSSPageSize:true});expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)?.length).toBeGreaterThanOrEqual(4);await page.emulateMedia({media:"screen"});
  await page.goto("/about/changelog");await expect(page.getByRole("heading",{name:"更新履歴"})).toBeVisible();await expect(page.getByText("Beta v0.6.0")).toBeVisible();
  await page.goto("/theory/practice");await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>undefined));await page.reload();await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),{timeout:15000}).toBe(true);
  await context.setOffline(true);await page.reload();await expect(page.getByRole("heading",{name:"理論化学 典型例題・練習問題"})).toBeVisible();await expect(page.locator(".worked-card")).toHaveCount(15);await expect(page.locator(".practice-question-card")).toHaveCount(12);
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
 }finally{await context.close();await browser.close();}
});
