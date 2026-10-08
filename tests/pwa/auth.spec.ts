import { test, expect, chromium, type TestInfo, type Page } from "@playwright/test";
import path from "node:path";
import { randomUUID } from "node:crypto";
const A="11111111-1111-4111-8111-111111111111",B="22222222-2222-4222-8222-222222222222";
const learningKey="chemica-flashcard-progress-v1";
function authSession(id:string,email:string){
 const exp=Math.floor(Date.now()/1000)+3600;
 const enc=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString("base64url");
 return {access_token:enc({alg:"HS256",typ:"JWT"})+"."+enc({sub:id,exp,role:"authenticated",aud:"authenticated"})+".mock",refresh_token:"mock-refresh",token_type:"bearer",expires_in:3600,expires_at:exp,user:{id,email,aud:"authenticated",role:"authenticated",app_metadata:{provider:"email",providers:["email"]},user_metadata:{},created_at:"2026-10-08T00:00:00Z"}};
}
async function launch(info:TestInfo){return chromium.launchPersistentContext(path.resolve(".next/pwa-tests",info.project.name+"-auth-"+randomUUID().slice(0,8)),{channel:info.project.metadata.channel as string,headless:true,viewport:{width:390,height:844}});}
async function mocks(page:Page,existing=false){
 const writes: {authorization:string;body:Record<string,unknown>}[]=[];
 let current=authSession(A,"a@example.test");
 let binding: {device_id:string;last_revision:number}|null=existing?{device_id:"dddddddd-dddd-4ddd-8ddd-dddddddddddd",last_revision:9}:null;
 await page.route("**/auth/v1/**",async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith("/verify")){const body=route.request().postDataJSON();current=authSession(body.email==="b@example.test"?B:A,body.email);await route.fulfill({json:current});}
  else if(url.pathname.endsWith("/user"))await route.fulfill({json:current.user});
  else if(url.pathname.endsWith("/logout"))await route.fulfill({status:204,body:""});
  else await route.fulfill({json:{}});
 });
 await page.route("**/rest/v1/**",async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith("/rpc/save_chemica_learning")){
   const body=route.request().postDataJSON();writes.push({authorization:route.request().headers().authorization,body});
   binding={device_id:body.p_device_id,last_revision:body.p_revision};
   await route.fulfill({json:{user_id:current.user.id,revision:body.p_revision,applied:true}});
  }else if(url.pathname.endsWith("/learning_cloud_bindings"))await route.fulfill({json:binding});
  else await route.fulfill({status:200,body:"",headers:{"content-range":"*/0"}});
 });
 return writes;
}
async function login(page:Page,email="a@example.test"){
 await page.getByLabel("メールアドレス",{exact:true}).fill(email);
 await page.getByRole("button",{name:"確認コードを送信",exact:true}).click();
 await page.getByLabel("確認コード",{exact:true}).fill("123456");
 await page.getByRole("button",{name:"コードでログイン",exact:true}).click();
 await expect(page.getByText("メール認証でログイン中："+email,{exact:true})).toBeVisible();
}
async function seed(page:Page){
 await page.goto("/settings/data");
 await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({"phase4-browser-card":{status:"known",lastReviewedAt:"2026-10-08T00:00:00Z"}})),learningKey);
 await page.reload();
}
test("OTP displays destination, resends, changes email, handles expired code and returns to source", async ({}, info) => {
 const context = await launch(info);
 try {
  const page = await context.newPage(); await mocks(page);
  await page.goto("/settings/data?returnTo=%2Fprogress");
  await page.getByLabel("メールアドレス", {exact:true}).fill("a@example.test");
  await page.getByRole("button", {name:"確認コードを送信",exact:true}).click();
  await expect(page.getByText(/送信先：a@example.test/)).toBeVisible();
  await expect(page.getByLabel("メールアドレス", {exact:true})).toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", {name:/再送まで/})).toBeDisabled();
  await page.clock.install(); await page.clock.fastForward(61000);
  await page.getByRole("button", {name:"コードを再送する",exact:true}).click();
  await expect(page.getByText("確認コードを再送しました。", {exact:true})).toBeVisible();
  await page.getByRole("button", {name:"メールアドレスを変更",exact:true}).click();
  await expect(page.getByLabel("確認コード", {exact:true})).toHaveCount(0);
  await page.getByLabel("メールアドレス", {exact:true}).fill("b@example.test");
  await page.getByRole("button", {name:"確認コードを送信",exact:true}).click();
  await page.route("**/auth/v1/verify", async route => route.fulfill({status:403,json:{code:"otp_expired",message:"Token has expired or is invalid"}}));
  await page.getByLabel("確認コード", {exact:true}).fill("000000");
  await page.getByRole("button", {name:"コードでログイン",exact:true}).click();
  await expect(page.locator(".account-settings [role='alert']")).toContainText("無効、または期限切れ");
  await page.unroute("**/auth/v1/verify");
  await page.getByLabel("確認コード", {exact:true}).fill("123456");
  await page.getByRole("button", {name:"コードでログイン",exact:true}).click();
  await expect(page.getByText("メール認証でログイン中：b@example.test",{exact:true})).toBeVisible();
  await page.getByRole("link", {name:"元のページへ戻る",exact:true}).click();
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.locator(".account-status")).toContainText("ログイン済み・クラウド保存未設定");
 } finally { await context.close(); }
});
test("email OTP session survives reload; explicit cloud upload, logout keeps local and B is blocked",async({},info)=>{
 const context=await launch(info);
 try{
  const page=await context.newPage(),writes=await mocks(page);
  await seed(page);const before=await page.evaluate(key=>localStorage.getItem(key),learningKey);
  await login(page);await expect(page.getByRole("button",{name:"バックアップしてクラウド保存"})).toBeVisible();
  expect(writes).toHaveLength(0);
  await page.getByRole("checkbox").check();await page.getByRole("button",{name:"バックアップしてクラウド保存"}).click();
  await expect(page.getByText("クラウド保存：有効",{exact:true})).toBeVisible();
  expect(writes).toHaveLength(1);expect(writes[0].body.p_records).toEqual(expect.arrayContaining([expect.objectContaining({kind:"flashcard",record_id:"phase4-browser-card"})]));
  expect(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith("chemica-storage-backup-v1:")))).toBe(true);
  await page.reload();await expect(page.getByText("メール認証でログイン中：a@example.test",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"ログアウト",exact:true}).click();
  await expect(page.getByLabel("メールアドレス",{exact:true})).toBeVisible();
  expect(await page.evaluate(key=>localStorage.getItem(key),learningKey)).toBe(before);
  await login(page,"b@example.test");await expect(page.getByText(/この端末のデータは別のアカウントに連携済み/)).toBeVisible();
  expect(writes).toHaveLength(1);expect(await page.evaluate(key=>localStorage.getItem(key),learningKey)).toBe(before);
 }finally{await context.close();}
});
test("existing cloud plus local is held without any upload",async({},info)=>{
 const context=await launch(info);
 try{const page=await context.newPage(),writes=await mocks(page,true);await seed(page);await login(page);await expect(page.getByText(/クラウドにも学習データがあります/)).toBeVisible();expect(writes).toHaveLength(0);expect(await page.evaluate(key=>localStorage.getItem(key),learningKey)).not.toBeNull();}
 finally{await context.close();}
});

test("offline signed-in card saves locally, then the bound cloud write resumes online",async({},info)=>{
 const context=await launch(info);
 try{
  const page=await context.newPage(),writes=await mocks(page);
  await seed(page);await login(page);await page.getByRole("checkbox").check();await page.getByRole("button",{name:"バックアップしてクラウド保存"}).click();
  await expect(page.getByText("クラウド保存：有効",{exact:true})).toBeVisible();
  await page.goto("/units/chemistry-basic-composition");
  await expect.poll(()=>page.evaluate(()=>new Promise<boolean>(resolve=>{
   const worker=navigator.serviceWorker.controller;if(!worker){resolve(false);return;}
   const channel=new MessageChannel(),timer=setTimeout(()=>resolve(false),5000);
   channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data.ready===true);};
   worker.postMessage({type:"CHEMICA_STATUS"},[channel.port2]);
  })),{timeout:90000}).toBe(true);
  await context.setOffline(true);
  await page.locator(".universal-flashcard").first().click();await page.locator(".flashcard-judgement .known").first().click();
  await expect.poll(()=>page.evaluate(key=>Object.keys(JSON.parse(localStorage.getItem(key)??"{}")).length,learningKey)).toBe(2);
  await expect.poll(()=>page.evaluate(()=>{const b=JSON.parse(localStorage.getItem("chemica-cloud-binding-v1")??"{}");return b.revision>b.lastUploadedRevision;})).toBe(true);
  expect(writes).toHaveLength(1);
  const before=await page.evaluate(key=>localStorage.getItem(key),learningKey);
  await page.goto("/settings/data");await page.reload();
  await expect(page.getByText("メール認証でログイン中：a@example.test",{exact:true})).toBeVisible();
  expect(await page.evaluate(key=>localStorage.getItem(key),learningKey)).toBe(before);
  await context.setOffline(false);
  await expect.poll(()=>writes.length).toBe(2);
  await expect(page.getByText("クラウド保存：有効",{exact:true})).toBeVisible();
  expect(await page.evaluate(key=>localStorage.getItem(key),learningKey)).toBe(before);
  await context.setOffline(true);
  await page.route("**/auth/v1/logout*",route=>route.abort("internetdisconnected"));
  await page.getByRole("button",{name:"ログアウト",exact:true}).click();
  await expect(page.getByLabel("メールアドレス",{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("メールアドレス",{exact:true})).toBeVisible();
  expect(await page.evaluate(key=>localStorage.getItem(key),learningKey)).toBe(before);
 }finally{await context.close();}
});
test("cloud upload failure leaves the local source and verified backup intact",async({},info)=>{
 const context=await launch(info);
 try{
  const page=await context.newPage();await mocks(page);
  await page.route("**/rest/v1/rpc/save_chemica_learning",route=>route.fulfill({status:503,json:{message:"unavailable"}}));
  await seed(page);const before=await page.evaluate(key=>localStorage.getItem(key),learningKey);
  await login(page);await page.getByRole("checkbox").check();await page.getByRole("button",{name:"バックアップしてクラウド保存"}).click();
  await expect(page.getByText(/クラウド保存できませんでした。端末内データとバックアップは保持/)).toBeVisible();
  expect(await page.evaluate(key=>localStorage.getItem(key),learningKey)).toBe(before);
  expect(await page.evaluate(()=>{const b=JSON.parse(localStorage.getItem("chemica-cloud-binding-v1")??"{}");return b.ownerUserId==="11111111-1111-4111-8111-111111111111"&&!b.enabled&&localStorage.getItem(b.backupKey)!==null;})).toBe(true);
 }finally{await context.close();}
});
