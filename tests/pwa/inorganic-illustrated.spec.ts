import {test,expect,chromium} from "@playwright/test";
test("inorganic: five lessons, masks, A4, mobile and offline",async({},info)=>{
 const browser=await chromium.launch({channel:info.project.metadata.channel as string,headless:true});
 const context=await browser.newContext({baseURL:"http://127.0.0.1:3211",viewport:{width:1440,height:1000}});
 try {const page=await context.newPage(),errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/units/inorganic-reactions");await expect(page.getByRole("heading",{name:"図で理解する無機化学",exact:true})).toBeVisible();
 const slugs=["ionization","flame-tests","precipitates","gases","electrochemistry"];
 for(const slug of slugs){
  await page.goto(`/illustrated/${slug}`);await expect(page.locator(".illustrated-diagram").first()).toBeVisible();
  await page.locator(".illustrated-sheet").first().screenshot({path:info.outputPath(`${slug}.png`),style:"header {visibility:hidden!important;}"});
  if(slug==="electrochemistry")await expect(page.locator('.inorganic-tube').first()).toHaveAttribute("d","M180 290 V95 H760 V290");
  if(slug==="precipitates")await expect(page.locator(".illustrated-sheet").nth(1)).toContainText("再沈殿");
  await page.emulateMedia({media:"print"});const learned=await page.pdf({path:info.outputPath(`${slug}-learn-a4.pdf`),preferCSSPageSize:true});
  expect(learned.toString("latin1").match(/\/Type \/Page\b/g)?.length).toBe(await page.locator(".illustrated-sheet").count());await page.emulateMedia({media:"screen"});
  await page.getByLabel("表示・問題形式",{exact:true}).selectOption("all");await expect(page.locator("[data-blank-id]").first()).toBeVisible();
  if(slug==="flame-tests")await expect(page.locator('[data-flame-paint="masked"]')).toHaveCount(7);
  if(slug==="ionization")await expect(page.locator('[data-range-masked="true"]')).toHaveCount(4);
  if(slug==="gases")await expect(page.locator('[data-collection-mask="true"]')).toHaveCount(8);
  if(slug==="electrochemistry")await expect(page.locator('[data-electron-arrow]')).toHaveCount(0);
  if(slug==="precipitates")await expect(page.locator('[data-cell="0-0"]')).not.toContainText("白色");
  await page.getByRole("button",{name:"答えを表示",exact:true}).click();await expect(page.locator("[data-blank-id]")).toHaveCount(0);await expect(page.locator("[data-revealed-id]").first()).toBeVisible();
  await page.getByRole("button",{name:"問題に戻す",exact:true}).click();
  if(slug==="flame-tests"){
   await page.getByLabel("表示・問題形式",{exact:true}).selectOption("names");await expect(page.locator('[data-flame-paint="visible"]')).toHaveCount(7);await expect(page.locator('[data-blank-id="flame-tests-Li-element"]')).toHaveCount(1);
   await page.getByLabel("表示・問題形式",{exact:true}).selectOption("properties");await expect(page.locator('[data-flame-paint="masked"]')).toHaveCount(7);await expect(page.locator('[data-blank-id="flame-tests-Li-element"]')).toHaveCount(0);
   await page.getByLabel("表示・問題形式",{exact:true}).selectOption("all");
  }
  await page.emulateMedia({media:"print"});const pdf=await page.pdf({path:info.outputPath(`${slug}-a4.pdf`),preferCSSPageSize:true});
  expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)?.length).toBe(await page.locator(".illustrated-sheet").count());await page.emulateMedia({media:"screen"});
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.getByRole("button",{name:"拡大表示",exact:true}).click();expect(await page.locator(".illustrated-scroll").first().evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  await page.setViewportSize({width:1440,height:1000});
 }
 await expect.poll(()=>page.evaluate(()=>new Promise<boolean>(resolve=>{const worker=navigator.serviceWorker.controller;if(!worker){resolve(false);return;}const channel=new MessageChannel(),timer=setTimeout(()=>resolve(false),3000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data.ready===true);};worker.postMessage({type:"CHEMICA_STATUS"},[channel.port2]);})),{timeout:90000}).toBe(true);
 await context.setOffline(true);for(const slug of slugs){await page.goto(`/illustrated/${slug}`);await page.getByLabel("表示・問題形式",{exact:true}).selectOption("all");await expect(page.locator("[data-blank-id]").first()).toBeVisible();await page.getByRole("button",{name:"答えを表示",exact:true}).click();await expect(page.locator("[data-revealed-id]").first()).toBeVisible();await page.reload();await expect(page.locator(".illustrated-diagram").first()).toBeVisible();}expect(errors).toEqual([]);
 }finally{await context.close();await browser.close();}
});
