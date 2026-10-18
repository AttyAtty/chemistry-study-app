import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const cache=new Map();
function moduleUrl(file) {
 const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute);
 let js=ts.transpileModule(fs.readFileSync(absolute,"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 js=js.replace(/from\s+["'](\.[^"']+)["']/g,(_,dep)=>`from ${JSON.stringify(moduleUrl(path.resolve(path.dirname(absolute),dep+".ts")))}`);
 const url=`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`;cache.set(absolute,url);return url;
}
export function loadPureTypeScript(file){return import(moduleUrl(file));}
