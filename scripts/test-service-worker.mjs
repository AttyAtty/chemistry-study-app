import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const origin="https://chemica.test";
const config={version:"build-new",routes:["/home","/quiz","/offline"],assets:["/_next/static/a.js","/icons/icon-192.png"],fallback:"/offline"};
const prefix="chemica-pwa-v3:";
class Cache {
 values=new Map();
 key(value){return new URL(typeof value==="string"?value:value.url,origin).href;}
 async put(key,response){this.values.set(this.key(key),response.clone());}
 async match(key){return this.values.get(this.key(key))?.clone();}
 async keys(){return [...this.values.keys()].map(key=>new Request(key));}
 async delete(key){return this.values.delete(this.key(key));}
}
class Channels {
 constructor(){this.port1={onmessage:null,close(){}};this.port2={postMessage:data=>queueMicrotask(()=>this.port1.onmessage?.({data})),close(){}};}
}
function harness(){
 const buckets=new Map(),listeners=new Map();
 const state={offline:false,failPath:null,calls:[],windows:[],claimed:false,skipped:false,htmlVersion:config.version};
 const caches={async open(name){if(!buckets.has(name))buckets.set(name,new Cache());return buckets.get(name);},async keys(){return [...buckets.keys()];},async delete(name){return buckets.delete(name);}};
 const self={location:{origin},addEventListener:(name,callback)=>listeners.set(name,callback),clients:{matchAll:async()=>state.windows,claim:async()=>{state.claimed=true;}},skipWaiting:async()=>{state.skipped=true;}};
 const fetch=async request=>{
  const path=new URL(typeof request==="string"?request:request.url,origin).pathname;state.calls.push(path);
  if(state.offline||state.failPath===path)throw new Error("Network offline");
  return new Response(config.routes.includes(path)?'<meta name="chemica-build" content="'+state.htmlVersion+'"><h1>'+path+'</h1>':"asset",{headers:{"Content-Type":config.routes.includes(path)?"text/html":"text/javascript"}});
 };
 vm.runInNewContext("const CONFIG="+JSON.stringify(config)+";\n"+fs.readFileSync("scripts/service-worker.template.js","utf8"),{self,caches,fetch,Response,Request,URL,Headers,AbortController,MessageChannel:Channels,setTimeout,clearTimeout,console});
 async function event(name,details={}){
  const waits=[];let response;
  listeners.get(name)({...details,waitUntil:promise=>waits.push(promise),respondWith:promise=>{response=promise;}});
  await Promise.all(waits);return response?await response:undefined;
 }
 const request=(path,mode="navigate",headers={},method="GET")=>({url:origin+path,mode,headers:new Headers(headers),method});
 const status=async()=>{let result;await event("message",{data:{type:"CHEMICA_STATUS"},ports:[{postMessage:value=>{result=value;}}]});return result;};
 return {buckets,caches,state,event,request,status};
}
test("install precaches complete pages/assets and claims without automatic update",async()=>{
 const h=harness();await h.event("install");assert.equal((await h.status()).ready,true);
 await h.event("activate");assert.equal(h.state.claimed,true);assert.equal(h.state.skipped,false);
});
test("offline reload supports direct pages and arbitrary quiz query",async()=>{
 const h=harness();await h.event("install");h.state.offline=true;
 for(const path of ["/home","/quiz?unit=all&count=5"]){const response=await h.event("fetch",{request:h.request(path)});assert.equal(response.status,200);assert.match(await response.text(),/h1/);}
});
test("unseen route/feedback receives offline fallback",async()=>{
 const h=harness();await h.event("install");h.state.offline=true;
 for(const path of ["/unseen","/feedback"]){const response=await h.event("fetch",{request:h.request(path)});assert.match(await response.text(),/\/offline/);}
});
test("RSC never enters the HTML cache; offline response enables document fallback",async()=>{
 const h=harness();await h.event("install");h.state.offline=true;
 const response=await h.event("fetch",{request:h.request("/home?_rsc=opaque","cors",{RSC:"1","Next-Router-State-Tree":"different"})});
 assert.equal(response.status,503);assert.match(response.headers.get("content-type"),/text\/html/);
 const cache=await h.caches.open(prefix+config.version+":precache");assert.match(await (await cache.match("/home")).text(),/<h1>/);
});
test("API, POST, third party and analytics are network only",async()=>{
 const h=harness();h.state.offline=true;
 for(const request of [h.request("/api/feedback","cors",{},"POST"),h.request("/api/private"),h.request("/_vercel/insights/script.js"),{...h.request("/image"),url:"https://outside.test/image"}])assert.equal(await h.event("fetch",{request}),undefined);
});
test("cache-first assets remain available without network",async()=>{
 const h=harness();await h.event("install");h.state.offline=true;const before=h.state.calls.length;
 const response=await h.event("fetch",{request:h.request(config.assets[0],"cors")});assert.equal(await response.text(),"asset");assert.equal(h.state.calls.length,before);
});
test("failed installation leaves old and unrelated caches untouched",async()=>{
 const h=harness();await h.caches.open(prefix+"build-old:precache");await h.caches.open("unrelated");
 h.state.failPath="/home";await assert.rejects(h.event("install"));
 assert.equal(h.buckets.has(prefix+"build-old:precache"),true);assert.equal(h.buckets.has(prefix+config.version+":precache"),false);assert.equal(h.buckets.has("unrelated"),true);
});
test("cleanup removes obsolete application caches, keeps old live tabs and other caches",async()=>{
 const h=harness();await h.event("install");
 for(const name of [prefix+"old-live:precache",prefix+"obsolete:runtime","unrelated"])await h.caches.open(name);
 h.state.windows=[{postMessage:(message,ports)=>ports[0].postMessage({version:"old-live"})}];await h.event("activate");
 assert.equal(h.buckets.has(prefix+"old-live:precache"),true);assert.equal(h.buckets.has(prefix+"obsolete:runtime"),false);assert.equal(h.buckets.has("unrelated"),true);
 h.state.windows=[];await h.event("message",{data:{type:"CHEMICA_CLEANUP"},ports:[]});assert.equal(h.buckets.has(prefix+"old-live:precache"),false);
});
test("update activates only on explicit request",async()=>{
 const h=harness();await h.event("message",{data:{type:"CHEMICA_SKIP_WAITING"},ports:[]});assert.equal(h.state.skipped,true);
});
test("missing cache has a self-contained fallback and can be repaired online",async()=>{
 const h=harness();h.state.offline=true;const response=await h.event("fetch",{request:h.request("/home")});assert.equal(response.status,503);assert.match(await response.text(),/Chemica/);
 h.state.offline=false;await h.event("message",{data:{type:"CHEMICA_REPAIR"},ports:[{postMessage(){}}]});assert.equal((await h.status()).ready,true);
});
test("online return resumes network navigation and keeps the cached edition",async()=>{
 const h=harness();await h.event("install");h.state.offline=true;await h.event("fetch",{request:h.request("/home")});
 h.state.offline=false;const before=h.state.calls.length;await h.event("fetch",{request:h.request("/home")});assert.ok(h.state.calls.length>before);assert.equal((await h.status()).ready,true);
});
test("worker uses Cache Storage only; learning storage has no duplicate writer",()=>{
 const source=fs.readFileSync("scripts/service-worker.template.js","utf8");
 assert.doesNotMatch(source,/indexedDB|localStorage|deleteDatabase|learningStorage|\.clear\(/);
});


test("a mismatched deployment cannot complete precache or discard an old edition",async()=>{
 const h=harness();await h.caches.open(prefix+"build-old:precache");h.state.htmlVersion="another-build";
 await assert.rejects(h.event("install"),/HTML build mismatch/);
 assert.equal(h.buckets.has(prefix+"build-old:precache"),true);assert.equal((await h.status()).ready,false);
});

test("new network HTML is served online but cannot overwrite the cached edition",async()=>{
 const h=harness();await h.event("install");h.state.htmlVersion="another-build";
 const online=await h.event("fetch",{request:h.request("/home")});assert.match(await online.text(),/another-build/);
 h.state.offline=true;const offline=await h.event("fetch",{request:h.request("/home")});assert.match(await offline.text(),/build-new/);
});
