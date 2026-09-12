import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require=createRequire(import.meta.url),cache=new Map();
function load(file,baseline=false){
  const key=file+baseline;if(cache.has(key))return cache.get(key);
  let source=baseline?execFileSync('git',['show',`HEAD:${file}`],{encoding:'utf8'}):fs.readFileSync(file,'utf8');
  if(file.endsWith('ReactionMapStudio.tsx'))source+=`\nexport { buildGraph, layoutGraph, nodeDimensions };`;
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const exports={};cache.set(key,exports);
  vm.runInNewContext(code,{exports,module:{exports},require:(id)=>{
    if(!id.startsWith('@/'))return require(id);
    const base='src/'+id.slice(2),next=['.ts','.tsx'].map(ext=>base+ext).find(f=>fs.existsSync(f));
    return load(next,baseline&&(/reactionLayout|ReactionMapStudio/.test(next)));
  },console},{filename:file});return exports;
}
const maps=load('src/data/reactionMaps.ts').reactionMaps;
const current=load('src/components/ReactionMapStudio.tsx'),before=load('src/components/ReactionMapStudio.tsx',true);
const overlap=(a,b)=>Math.min(a.r,b.r)-Math.max(a.l,b.l)>0.1&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>0.1;
function inspect(layout,graph,baseline=false){
  const rect=(x,y,w,h)=>({l:x-w/2,r:x+w/2,t:y-h/2,b:y+h/2});
  const nodes=graph.nodes.map(({id,node})=>{
    const {width,height}=(baseline?before:current).nodeDimensions(node);
    return {id,...rect(layout.positions[id].x,layout.positions[id].y,width,height)};
  });
  const labels=Object.values(layout.routes).map(r=>rect(r.label.x,r.label.y,r.labelWidth,r.labelHeight));
  const lines=graph.edges.flatMap(e=>layout.routes[e.id].points.slice(1).map((b,i)=>{const a=layout.routes[e.id].points[i];return {id:e.id,from:e.from,to:e.to,l:Math.min(a.x,b.x)-.2,r:Math.max(a.x,b.x)+.2,t:Math.min(a.y,b.y)-.2,b:Math.max(a.y,b.y)+.2};}));
  const pairs=items=>items.reduce((sum,a,i)=>sum+items.slice(i+1).filter(b=>overlap(a,b)).length,0);
  const ee=lines.reduce((sum,a,i)=>sum+lines.slice(i+1).filter(b=>a.id!==b.id&&overlap(a,b)&&((a.r-a.l<1&&b.r-b.l<1)||(a.b-a.t<1&&b.b-b.t<1))).length,0);
  return {ee,nn:pairs(nodes),nl:nodes.reduce((sum,n)=>sum+labels.filter(l=>overlap(n,l)).length,0),ll:pairs(labels),el:lines.reduce((sum,e)=>sum+labels.filter(l=>overlap(e,l)).length,0),en:lines.reduce((sum,e)=>sum+nodes.filter(n=>n.id!==e.from&&n.id!==e.to&&overlap(e,n)).length,0)};
}
const {computeReactionGraphLayout}=load('src/lib/reactionLayout.ts');
const empty=computeReactionGraphLayout([],[],"",false);
if(empty.canvas.width!==1)throw new Error('Empty graph regression');
const self=computeReactionGraphLayout([{id:'a',width:200,height:100}],[{id:'loop',from:'a',to:'a',label:'loop'}],'a');
if(self.routes.loop.points.length<2)throw new Error('Self-loop route missing');
let failures=0;const records=[];
for(const map of maps)for(const mobile of [false,true]){
 const graph=current.buildGraph(map),start=performance.now(),layout=current.layoutGraph(map,graph,mobile),ms=Math.round(performance.now()-start);
 const stats=inspect(layout,graph),old=inspect(before.layoutGraph(map,graph,mobile),graph,true);
 const invalid=Object.values(layout.positions).some(p=>!Number.isFinite(p.x+p.y))||Object.values(layout.routes).some(r=>r.label.x-r.labelWidth/2<0||r.label.y-r.labelHeight/2<0);
 if(stats.nn||stats.nl||stats.ll||stats.el||stats.en||invalid)failures++;
 records.push({id:map.id,mobile,nodes:graph.nodes.length,edges:graph.edges.length,before:old,after:stats,canvas:layout.canvas,ms});
 console.log(`${map.id} ${mobile?'mobile':'desktop'} ${JSON.stringify(old)} -> ${JSON.stringify(stats)} ${ms}ms`);
}
fs.mkdirSync('docs/verification',{recursive:true});fs.writeFileSync('docs/verification/reaction-layout-audit.json',JSON.stringify(records,null,2)+'\n');
console.log(`${records.length} layouts checked; ${failures} layouts with collisions`);process.exitCode=failures?1:0;
