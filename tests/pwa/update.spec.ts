import { test, expect, chromium } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
const workerTemplate=fs.readFileSync("scripts/service-worker.template.js","utf8");
test("real worker: two versions wait, explicit activation, other clients stay, restart activates naturally",async({},info)=>{
  let version="old";
  const server=http.createServer((req,res)=>{
    res.setHeader("Cache-Control","no-store");
    if(req.url==="/sw.js"){
      res.setHeader("Content-Type","application/javascript");
      res.end("const CONFIG="+JSON.stringify({version,routes:["/"],assets:[],fallback:"/"})+";\n"+workerTemplate);
    }else{
      res.setHeader("Content-Type","text/html");
      res.end('<meta name="chemica-build" content="'+version+'"><body>fixture</body>');
    }
  });
  await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
  const address=server.address() as {port:number};
  const base="http://127.0.0.1:"+address.port;
  const context=await chromium.launchPersistentContext(path.resolve(".next/pwa-tests/update-"+randomUUID().slice(0,8)),{channel:info.project.metadata.channel as string,headless:true});
  try{
    const page=context.pages()[0]??await context.newPage();await page.goto(base);
    await page.evaluate(async()=>{
      localStorage.setItem("learning-sentinel","keep");
      (window as unknown as {events:string[]}).events=[];
      navigator.serviceWorker.addEventListener("controllerchange",()=>{(window as unknown as {events:string[]}).events.push("controllerchange");});
      const reg=await navigator.serviceWorker.register("/sw.js");
      reg.addEventListener("updatefound",()=>{(window as unknown as {events:string[]}).events.push("updatefound");});
    });
    await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
    const second=await context.newPage();await second.goto(base);
    version="new";
    await page.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration())!.update();});
    await expect.poll(()=>page.evaluate(async()=>(await navigator.serviceWorker.getRegistration())?.waiting?.state)).toBe("installed");
    const status=()=>page.evaluate(async()=>{
      const worker=navigator.serviceWorker.controller!;
      return new Promise<{version:string;ready:boolean}>(resolve=>{
        const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve({version:"timeout",ready:false});},5000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};
        worker.postMessage({type:"CHEMICA_STATUS"},[channel.port2]);
      });
    });
    expect((await status()).version).toBe("old");
    const url=page.url();
    const eventCount=await page.evaluate(()=>(window as unknown as {events:string[]}).events.filter(e=>e==="controllerchange").length);
    await page.waitForTimeout(1200);
    expect((await status()).version).toBe("old");
    expect(await page.evaluate(()=>localStorage.getItem("learning-sentinel"))).toBe("keep");
    await page.evaluate(async()=>{(await navigator.serviceWorker.getRegistration())!.waiting!.postMessage({type:"CHEMICA_SKIP_WAITING"});});
    await expect.poll(async()=>(await status()).version).toBe("new");
    expect(page.url()).toBe(url);
    expect(await second.locator("body").innerText()).toBe("fixture");
    expect(await page.evaluate(()=>(window as unknown as {events:string[]}).events)).toContain("updatefound");
    expect(await page.evaluate(()=>(window as unknown as {events:string[]}).events.filter(e=>e==="controllerchange").length)).toBeGreaterThan(eventCount);
    version="restart";
    await page.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration())!.update();});
    await expect.poll(()=>page.evaluate(async()=>Boolean((await navigator.serviceWorker.getRegistration())?.waiting))).toBe(true);
    await page.close();await second.close();
    await new Promise(resolve=>setTimeout(resolve,2000));
    const restarted=await context.newPage();await restarted.goto(base,{timeout:15000});
    await expect.poll(()=>restarted.evaluate(async()=>{
      const reg=await navigator.serviceWorker.getRegistration();
      if(!reg?.active)return "";
      return new Promise<string>(resolve=>{
        const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve("timeout");},5000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data.version);};
        reg.active!.postMessage({type:"CHEMICA_STATUS"},[channel.port2]);
      });
    })).toBe("restart");
    expect(await restarted.evaluate(()=>localStorage.getItem("learning-sentinel"))).toBe("keep");
  }finally{await context.close();server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
for(const initialWaiting of [true,false]){
 test("notification persists; explicit reload only; waiting "+initialWaiting,async({},info)=>{
  const context=await chromium.launchPersistentContext(path.resolve(".next/pwa-tests/update-"+randomUUID().slice(0,8)),{channel:info.project.metadata.channel as string,headless:true,baseURL:"http://127.0.0.1:3211",viewport:{width:390,height:844}});
  try{
    await context.addInitScript(({initialWaiting})=>{
      const container=new EventTarget();
      const active=Object.assign(new EventTarget(),{state:"activated",postMessage(message:{type:string},ports:MessagePort[]=[]){
        if(message.type==="CHEMICA_STATUS")ports[0]?.postMessage({version:document.querySelector('meta[name="chemica-build"]')?.getAttribute("content"),ready:true});
      }});
      const candidate=Object.assign(new EventTarget(),{state:"installing",postMessage(message:{type:string}){
        if(message.type==="CHEMICA_SKIP_WAITING"){Object.assign(container,{controller:candidate});container.dispatchEvent(new Event("controllerchange"));}
      }});
      const reg=Object.assign(new EventTarget(),{active,waiting:initialWaiting?candidate:null,installing:null as typeof candidate|null,
        async update(){return reg;}});
      Object.assign(container,{controller:active,async register(){return reg;}});
      Object.defineProperty(navigator,"serviceWorker",{value:container,configurable:true});
      Object.assign(window,{triggerUpdate(){
        reg.installing=candidate;reg.dispatchEvent(new Event("updatefound"));
        candidate.state="installed";reg.waiting=candidate;reg.installing=null;candidate.dispatchEvent(new Event("statechange"));
      },changeController(){container.dispatchEvent(new Event("controllerchange"));}});
    },{initialWaiting});
    const page=await context.newPage();await page.goto("/home");
    await expect(page.getByRole("button",{name:"更新を確認",exact:true})).toBeVisible();
    if(!initialWaiting){
      await expect(page.locator(".pwa-update-notice")).toHaveCount(0);
      await page.evaluate(()=>(window as unknown as {triggerUpdate:()=>void}).triggerUpdate());
    }
    const notice=page.locator(".pwa-update-notice");
    await expect(notice).toBeVisible();
    let navigations=0;page.on("framenavigated",frame=>{if(frame===page.mainFrame())navigations++;});
    await page.evaluate(()=>(window as unknown as {changeController:()=>void}).changeController());
    await page.getByRole("button",{name:"更新を確認",exact:true}).click();
    await page.evaluate(()=>{window.dispatchEvent(new Event("focus"));document.dispatchEvent(new Event("visibilitychange"));window.scrollTo(0,document.body.scrollHeight);});
    await page.waitForTimeout(1500);
    await expect(notice).toBeVisible();
    expect(await notice.evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
    expect(navigations).toBe(0);
    await Promise.all([page.waitForEvent("framenavigated"),notice.getByRole("button",{name:"再読み込み",exact:true}).click()]);
    expect(navigations).toBe(1);
  }finally{await context.close();}
 });
}
