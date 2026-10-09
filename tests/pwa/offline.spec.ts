import { test, expect, chromium, type Page, type BrowserContext, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
const base="http://127.0.0.1:3211";
const keys=["chemica-flashcard-progress-v1","chemistry-question-history-v1","chemistry-study-progress-v1"];
function loadData(filename:string,modules=new Map<string,Record<string,unknown>>):Record<string,unknown>{
 const file=path.resolve(filename);const saved=modules.get(file);if(saved)return saved;
 const exports:Record<string,unknown>={};modules.set(file,exports);
 const code=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,module:{exports},require(id:string){
  const root=id.startsWith("@/")?path.resolve("src",id.slice(2)):path.resolve(path.dirname(file),id);
  return loadData(fs.existsSync(root+".ts")?root+".ts":path.join(root,"index.ts"),modules);
 }});
 return exports;
}
type Question={prompt:string;answerIndex:number;choices:string[]};
const units=loadData("src/data/chemistry.ts").chemistryUnits as {slug:string;questions:Question[]}[];
const pool=units.find(unit=>unit.slug==="chemistry-basic-composition")!.questions;
const profiles=new Map<string,string>();
async function launch(info:TestInfo){
 if(!profiles.has(info.testId))profiles.set(info.testId,path.resolve(".next/pwa-tests",info.project.name+"-"+randomUUID().slice(0,8)));
 return chromium.launchPersistentContext(profiles.get(info.testId)!,{channel:info.project.metadata.channel as string,headless:true,viewport:{width:1280,height:900}});
}
async function waitReady(page:Page){
 await expect.poll(()=>page.evaluate(()=>new Promise<boolean>(resolve=>{
  const worker=navigator.serviceWorker.controller;
  if(!worker){resolve(false);return;}
  const channel=new MessageChannel();
  const timer=setTimeout(()=>{channel.port1.close();resolve(false);},5000);
  channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data.ready===true);};
  worker.postMessage({type:"CHEMICA_STATUS"},[channel.port2]);
 })),{timeout:90000}).toBe(true);
}
async function prepare(context:BrowserContext){
 const page=context.pages()[0]??await context.newPage();
 await page.goto(base+"/home");
 await waitReady(page);
 await expect(page.locator(".pwa-update-notice")).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
 return page;
}
async function raw(page:Page){return page.evaluate(keys=>keys.map(key=>localStorage.getItem(key)),keys);}
async function database(page:Page){
 return page.evaluate(()=>new Promise<Record<string,unknown[]>>((resolve,reject)=>{
  const req=indexedDB.open("chemica-learning",1);
  req.onerror=()=>reject(req.error);
  req.onsuccess=()=>{
   const db=req.result,names=["flashcardProgress","questionHistory","studyProgress","metadata"];
   const tx=db.transaction(names,"readonly");const result:Record<string,unknown[]>={};
   for(const name of names){const read=tx.objectStore(name).getAll();read.onsuccess=()=>{result[name]=read.result;};}
   tx.oncomplete=()=>{db.close();resolve(result);};tx.onabort=()=>{db.close();reject(tx.error);};
  };
 }));
}
test("precache, direct offline routes, soft navigation, search, mobile and fallback",async({},info)=>{
 const context=await launch(info);
 try{
  const page=await prepare(context);
  const registration=await page.evaluate(async()=>({scope:(await navigator.serviceWorker.getRegistration())?.scope,secure:window.isSecureContext}));
  expect(registration.scope).toBe(base+"/");expect(registration.secure).toBe(true);
  await context.setOffline(true);
  for(const route of ["/home","/courses/chemistry-basic","/units/theory-chemistry","/units/inorganic-reactions","/units/organic-reactions","/units/chemistry-basic-composition","/flashcards/review","/progress","/settings/data","/tools/memory-quiz","/quiz?unit=all&count=5&mode=unseen","/search?q=NH3"]){
   await page.goto(base+route);
   await expect(page.locator("main")).toBeVisible();
   await expect(page.locator(".pwa-status")).toContainText("オフライン");
   expect(await page.locator("main").innerText()).not.toContain("このページはオフラインでは開けません");
  }
  await expect(page.locator(".knowledge-search-results")).toBeVisible();
  await page.goto(base+"/tools/memory-quiz");
  const oldQuestions=await page.locator(".memory-question-list").innerText();
  await page.getByRole("button",{name:"問題を作り直す"}).click();
  await expect(page.locator(".memory-question-list li")).toHaveCount(10);
  await expect(page.locator(".memory-question-list")).not.toHaveText(oldQuestions);
  await page.goto(base+"/home");
  await page.locator(".main-nav a[href='/quiz']").click();
  await expect(page).toHaveURL(/\/quiz$/);await expect(page.locator(".quiz-select-grid")).toBeVisible();
  await page.goto(base+"/units/organic-reactions");await expect(page.locator(".reaction-map-studio .reaction-edge-layer").first()).toBeVisible();
  await page.locator(".reaction-map-studio .map-options summary").first().click();
  await page.locator(".reaction-map-studio .variant-buttons button").nth(1).click();
  await expect(page.locator(".reaction-map-studio .variant-buttons button").nth(1)).toHaveClass(/active/);
  await page.setViewportSize({width:390,height:844});await page.goto(base+"/home");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  await page.screenshot({path:info.outputPath("offline-mobile.png"),fullPage:false,animations:"disabled"});
  const manifest=await page.evaluate(async()=>await (await fetch("/site.webmanifest")).json());
  expect(manifest.display).toBe("standalone");expect(manifest.start_url).toBe("/");expect(manifest.id).toBe("/");
  for(const icon of manifest.icons){expect(await page.evaluate(async(url:string)=>(await fetch(url)).status,icon.src)).toBe(200);}
  await page.goto(base+"/not-cached-test");await expect(page.getByRole("heading",{name:"このページはオフラインでは開けません"})).toBeVisible();
  await page.goto(base+"/feedback");await expect(page.getByRole("heading",{name:"このページはオフラインでは開けません"})).toBeVisible();
  await context.setOffline(false);await page.goto(base+"/home");await waitReady(page);await expect(page.locator(".pwa-status")).toHaveCount(0);
 }finally{await context.close();}
});
test("offline card/quiz/history/dirty/backup/restore and persistent browser restart",async({},info)=>{
 let context=await launch(info);
 try{
  let page=await prepare(context);await context.setOffline(true);
  await page.goto(base+"/units/chemistry-basic-composition");
  await page.locator(".universal-flashcard").first().click();await page.locator(".flashcard-judgement .needs-review").first().click();
  await expect.poll(()=>page.evaluate(key=>Object.keys(JSON.parse(localStorage.getItem(key)??"{}")).length,keys[0])).toBe(1);
  await page.goto(base+"/quiz?unit=chemistry-basic-composition&count=5&mode=unseen");
  await page.getByRole("button",{name:"演習を始める",exact:true}).click();
  for(let index=0;index<5;index++){
   const prompt=await page.locator(".question-card h2").innerText();const question=pool.find(question=>question.prompt===prompt);expect(question).toBeDefined();
   await page.locator(".choice-button").nth((question!.answerIndex+1)%question!.choices.length).click();
   await page.locator(".question-footer button").click();
  }
  const history=JSON.parse((await raw(page))[1]!);
  expect(Object.values(history)).toHaveLength(5);
  for(const entry of Object.values(history) as {needsReview:boolean;attemptCount:number}[]){expect(entry.needsReview).toBe(true);expect(entry.attemptCount).toBe(1);}
  const progress=JSON.parse((await raw(page))[2]!);expect(progress["chemistry-basic-composition"].attempts).toBe(1);
  await expect.poll(async()=>((await database(page)).questionHistory).length).toBe(5);
  for(const store of ["flashcardProgress","questionHistory","studyProgress"]){for(const record of (await database(page))[store] as {dirty:boolean;updatedAt:string}[]){expect(record.dirty).toBe(true);expect(Date.parse(record.updatedAt)).not.toBeNaN();}}
  const before=await raw(page);await page.reload();expect(await raw(page)).toEqual(before);
  await page.goto(base+"/");await expect(page.locator(".start-button")).toBeVisible();expect(await raw(page)).toEqual(before);
  await page.locator(".start-button").click();await expect(page).toHaveURL(base+"/home");expect(await raw(page)).toEqual(before);
  await page.goto(base+"/progress");await expect(page.locator("main")).toBeVisible();
  await page.goto(base+"/flashcards/review?flashcards=due");await expect(page.locator(".universal-flashcard")).toBeVisible();
  await page.goto(base+"/settings/data");
  const downloaded=page.waitForEvent("download");await page.getByRole("button",{name:"JSONバックアップを保存"}).click();
  const download=await downloaded;const backup=fs.readFileSync((await download.path())!,"utf8");expect(JSON.parse(backup).schemaVersion).toBe(1);
  await page.evaluate(key=>{const values=JSON.parse(localStorage.getItem(key)!);Object.values(values).forEach(entry=>{(entry as {attemptCount:number}).attemptCount++;});localStorage.setItem(key,JSON.stringify(values));},keys[1]);
  await page.locator("#learning-backup").setInputFiles({name:"backup.json",mimeType:"application/json",buffer:Buffer.from(backup)});
  page.once("dialog",dialog=>dialog.accept());await page.getByRole("button",{name:"確認して復元する"}).click();
  await expect.poll(()=>raw(page)).toEqual(before);
  await expect.poll(async()=>((await database(page)).metadata.find(record=>(record as {id:string}).id==="current") as {source:Record<string,string>}).source[keys[1]]).toBe(before[1]);
  await context.close();
  context=await launch(info);await context.setOffline(true);page=context.pages()[0]??await context.newPage();
  await page.goto(base+"/home");await expect(page.locator("main")).toBeVisible();expect(await raw(page)).toEqual(before);
  await context.setOffline(false);await expect(page.locator(".pwa-status")).toHaveCount(0);
  expect(await raw(page)).toEqual(before);
 }finally{await context.close();}
});
test("cache cleanup/repair leaves learning data untouched",async({},info)=>{
 const context=await launch(info);
 try{
  const page=await prepare(context);
  await page.goto(base+"/units/chemistry-basic-composition");await page.locator(".universal-flashcard").first().click();await page.locator(".flashcard-judgement .known").first().click();
  await expect.poll(async()=>((await database(page)).flashcardProgress).length).toBe(1);const before=await raw(page),dbBefore=await database(page);
  await page.evaluate(async()=>{
   await caches.open("chemica-pwa-v3:obsolete:precache");await caches.open("other-application-cache");
   navigator.serviceWorker.controller!.postMessage({type:"CHEMICA_CLEANUP"});
  });
  await expect.poll(()=>page.evaluate(async()=>!(await caches.keys()).includes("chemica-pwa-v3:obsolete:precache"))).toBe(true);
  expect(await page.evaluate(async()=>(await caches.keys()).includes("other-application-cache"))).toBe(true);
  expect(await raw(page)).toEqual(before);
  await page.evaluate(async()=>{for(const name of await caches.keys())if(name.startsWith("chemica-pwa-v3:"))await caches.delete(name);});
  expect(await raw(page)).toEqual(before);expect((await database(page)).flashcardProgress).toEqual(dbBefore.flashcardProgress);
  await context.setOffline(true);await page.goto(base+"/home");
  await expect(page.getByRole("heading",{name:"このページはまだオフライン保存されていません"})).toBeVisible();
  await context.setOffline(false);await page.goto(base+"/settings/data");
  await expect(page.getByRole("button",{name:"保存を再確認"})).toBeVisible();await page.getByRole("button",{name:"保存を再確認"}).click();
  await waitReady(page);
  expect(await raw(page)).toEqual(before);expect((await database(page)).flashcardProgress).toEqual(dbBefore.flashcardProgress);
 }finally{await context.close();}
});

test("IndexedDB unavailable still saves cards offline through localStorage",async({},info)=>{
 const context=await launch(info);
 try{
  await context.addInitScript(()=>{Object.defineProperty(window,"indexedDB",{get(){throw new DOMException("Test IndexedDB unavailable","SecurityError");}});});
  const page=await prepare(context);await context.setOffline(true);
  await page.goto(base+"/units/chemistry-basic-composition");
  await page.locator(".universal-flashcard").first().click();await page.locator(".flashcard-judgement .known").first().click();
  await expect.poll(()=>page.evaluate(key=>Object.keys(JSON.parse(localStorage.getItem(key)??"{}")).length,keys[0])).toBe(1);
  const before=await raw(page);await page.reload();expect(await raw(page)).toEqual(before);
  await page.goto(base+"/settings/data");await expect(page.locator(".data-panel").last()).toContainText("localStorageで継続します");
 }finally{await context.close();}
});
