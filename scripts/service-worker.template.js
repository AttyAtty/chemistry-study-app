/* global CONFIG */
const PREFIX = "chemica-pwa-v3:";
const PRECACHE = PREFIX + CONFIG.version + ":precache";
const RUNTIME = PREFIX + CONFIG.version + ":runtime";
const READY = "/__chemica_offline_ready__";
const origin = self.location.origin;
const excluded = path => path === "/sw.js" || path === "/auth" || path.startsWith("/auth/") || path.startsWith("/api/") || path.startsWith("/_vercel/");
const routePath = path => path.length > 1 ? path.replace(/\/$/, "") : path;
const isFlight = request => request.headers.get("RSC") === "1" || new URL(request.url).searchParams.has("_rsc");
const buildMatches = html => html.includes('name="chemica-build" content="' + CONFIG.version + '"');
async function ready() {
  const cache = await caches.open(PRECACHE);
  const keys = new Set((await cache.keys()).map(request => new URL(request.url).pathname));
  return keys.has(READY) && [...CONFIG.routes, ...CONFIG.assets].every(path => keys.has(path));
}
async function precache() {
  const cache = await caches.open(PRECACHE);
  const entries = [...CONFIG.assets.map(path => ({path,page:false})), ...CONFIG.routes.map(path => ({path,page:true}))];
  // Bounded parallelism; the installing worker is not active until all entries succeed.
  let cursor=0;
  async function fill() {
    while(cursor < entries.length) {
      const {path,page}=entries[cursor++];
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),15000);
      try {
        const response=await fetch(path,{signal:controller.signal,cache:"reload",credentials:"omit",headers:page?{Accept:"text/html"}:{}});
        if(!response.ok || response.redirected)throw new Error("Precache fetch failed: " + path);
        if(page && (!response.headers.get("content-type")?.includes("text/html") || !buildMatches(await response.clone().text())))
          throw new Error("HTML build mismatch: " + path);
        await cache.put(path,response);
      } finally { clearTimeout(timeout); }
    }
  }
  const results=await Promise.allSettled(Array.from({length:4},fill));
  const failed=results.find(result=>result.status==="rejected");
  if(failed)throw failed.reason;
  await cache.put(READY,new Response(CONFIG.version));
}
function emergencyFallback() {
  return new Response('<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chemica オフライン</title><body style="margin:0;background:#f8fbff;color:#24364b;font-family:system-ui"><main style="max-width:640px;margin:15vh auto;padding:24px"><p>Chemica</p><h1 style="font-size:24px">このページはまだオフライン保存されていません</h1><p>オンラインに戻って、オフライン保存を再確認してください。学習データは端末内に保持しています。</p><a href="/home">学習ホーム</a> · <a href="/settings/data">バックアップ・データ管理</a></main></body></html>',{status:503,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
}
async function fallback() { return (await (await caches.open(PRECACHE)).match(CONFIG.fallback)) ?? emergencyFallback(); }
async function network(request) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),3000);
  try { const response=await fetch(request,{signal:controller.signal}); await response.clone().arrayBuffer(); return response; }
  finally {clearTimeout(timer);}
}
async function navigation(request) {
  const path=routePath(new URL(request.url).pathname);
  try {
    const response=await network(request);
    if(response.ok && CONFIG.routes.includes(path) && response.headers.get("content-type")?.includes("text/html")
       && buildMatches(await response.clone().text()))await (await caches.open(PRECACHE)).put(path,response.clone());
    return response;
  }catch { return await (await caches.open(PRECACHE)).match(path) ?? fallback(); }
}
async function asset(request) {
  const path=new URL(request.url).pathname;
  for(const name of [PRECACHE,RUNTIME,...(await caches.keys()).filter(name=>name.startsWith(PREFIX)&&name!==PRECACHE&&name!==RUNTIME)]) {
    const hit=await (await caches.open(name)).match(path);
    if(hit)return hit;
  }
  const response=await fetch(request);
  if(response.ok && response.type!=="opaque") {
    const cache=await caches.open(RUNTIME);
    await cache.put(path,response.clone());
    const keys=await cache.keys();
    for(const key of keys.slice(0,Math.max(0,keys.length-80)))await cache.delete(key);
  }
  return response;
}
function clientVersion(client) {
  return new Promise(resolve=>{
    const channel=new MessageChannel();
    const timer=setTimeout(()=>{channel.port1.close();resolve(null);},1500);
    channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(typeof event.data?.version==="string"?event.data.version:null);};
    try {client.postMessage({type:"CHEMICA_CLIENT_VERSION"},[channel.port2]);}
    catch {clearTimeout(timer);channel.port1.close();resolve(null);}
  });
}
async function cleanup() {
  const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  const versions=await Promise.all(windows.map(clientVersion));
  if(versions.includes(null))return; // Unknown/live old tabs keep their assets; retry on focus/startup.
  const keep=new Set([CONFIG.version,...versions]);
  await Promise.all((await caches.keys()).filter(name=>name.startsWith(PREFIX)&&![...keep].some(version=>name.startsWith(PREFIX+version+":"))).map(name=>caches.delete(name)));
}
self.addEventListener("install",event=>{
  event.waitUntil(precache().catch(async error=>{await caches.delete(PRECACHE);throw error;}));
  // No automatic skipWaiting: an update waits until users finish learning.
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{await self.clients.claim();await cleanup();})());
});
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(url.origin!==origin || request.method!=="GET" || request.headers.has("Authorization") || excluded(url.pathname))return;
  if(isFlight(request)) {
    // Never mix router-state-dependent RSC responses with HTML.
    // Next 16's non-RSC response fallback performs a document navigation.
    event.respondWith(network(request).catch(()=>new Response("",{status:503,headers:{"Content-Type":"text/html","Cache-Control":"no-store"}})));
  }else if(request.mode==="navigate")event.respondWith(navigation(request));
  else if(CONFIG.assets.includes(url.pathname) || /^\/_next\/static\/.+\.(js|css|woff2?)$/.test(url.pathname))event.respondWith(asset(request));
});
self.addEventListener("message",event=>{
  if(event.data?.type==="CHEMICA_SKIP_WAITING")event.waitUntil(self.skipWaiting());
  if(event.data?.type==="CHEMICA_STATUS")event.waitUntil(ready().then(value=>event.ports[0]?.postMessage({version:CONFIG.version,ready:value})));
  if(event.data?.type==="CHEMICA_REPAIR")event.waitUntil(precache().then(()=>event.ports[0]?.postMessage({version:CONFIG.version,ready:true})).catch(()=>event.ports[0]?.postMessage({version:CONFIG.version,ready:false})));
  if(event.data?.type==="CHEMICA_CLEANUP")event.waitUntil(cleanup());
});
