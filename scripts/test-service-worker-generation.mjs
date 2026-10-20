import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
const source=fs.readFileSync("scripts/generate-service-worker.mjs","utf8");
const required=[...source.matchAll(/for\(const route of (\[[^\]]+\])/g)].flatMap(match=>JSON.parse(match[1]));
function generate({root=true,rootHtml=true,missing,missingHtml}={}) {
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),"chemica-sw-test-"));
 try {
  for(const dir of [".next/server/app",".next/static","src/lib","scripts","public/icons","node_modules/next"])fs.mkdirSync(path.join(folder,dir),{recursive:true});
  fs.writeFileSync(path.join(folder,".next/BUILD_ID"),"fixture-build");
  fs.writeFileSync(path.join(folder,"src/lib/pwaBuild.ts"),'export const id="fixture-build";');
  fs.writeFileSync(path.join(folder,"node_modules/next/package.json"),JSON.stringify({version:"fixture-next"}));
  const routes=[...required,...(root?["/"]:[])].filter(route=>route!==missing);
  fs.writeFileSync(path.join(folder,".next/prerender-manifest.json"),JSON.stringify({routes:Object.fromEntries(routes.map(route=>[route,{}]))}));
  for(const route of routes) {
   if((route==="/"&&!rootHtml)||route===missingHtml)continue;
   const html=path.join(folder,".next/server/app",route==="/"?"index.html":route.slice(1)+".html");
   fs.mkdirSync(path.dirname(html),{recursive:true});fs.writeFileSync(html,"fixture");
  }
  for(const file of ["generate-service-worker.mjs","service-worker.template.js"])fs.copyFileSync("scripts/"+file,path.join(folder,"scripts",file));
  const result=spawnSync(process.execPath,["scripts/generate-service-worker.mjs"],{cwd:folder,encoding:"utf8"});
  return {...result,config:result.status===0?JSON.parse(fs.readFileSync(path.join(folder,"docs/verification/phase3-precache.json"),"utf8")):null};
 } finally {fs.rmSync(folder,{recursive:true,force:true});}
}
test("generator retains a statically rendered welcome screen",()=>{
 const result=generate();assert.equal(result.status,0,result.stderr);assert.ok(result.config.routes.includes("/"));assert.deepEqual(result.config.navigationFallbacks,{});
});
for(const options of [{root:false},{rootHtml:false}])test("generator accepts optional root: "+JSON.stringify(options),()=>{
 const result=generate(options);assert.equal(result.status,0,result.stderr);assert.ok(!result.config.routes.includes("/"));assert.ok(result.config.routes.includes("/home"));assert.deepEqual(result.config.navigationFallbacks,{"/":"/home"});
});
for(const missing of ["/home","/offline","/illustrated","/theory/formulas"])test("generator rejects missing required static page "+missing,()=>{
 const result=generate({root:false,missing});assert.notEqual(result.status,0);assert.ok(result.stderr.includes("not prerendered: "+missing));
});

test("generator distinguishes an absent manifest entry from missing HTML",()=>{
 const absent=generate({missing:"/home"});
 assert.notEqual(absent.status,0);
 assert.match(absent.stderr,/"manifestEntry": null/);
 assert.match(absent.stderr,/"htmlExists": false/);
 const noHtml=generate({missingHtml:"/home"});
 assert.notEqual(noHtml.status,0);
 assert.match(noHtml.stderr,/"manifestEntry": \{\}/);
 assert.match(noHtml.stderr,/"htmlExists": false/);
 assert.match(noHtml.stderr,/not prerendered: \/home/);
});
