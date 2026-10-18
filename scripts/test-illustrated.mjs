import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Compile pure TypeScript data in memory, including its local dependencies.
const cache=new Map();
function moduleUrl(file) {
  const absolute=path.resolve(file);
  if(cache.has(absolute))return cache.get(absolute);
  let js=ts.transpileModule(fs.readFileSync(absolute,"utf8"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
  js=js.replace(/from\s+["'](\.[^"']+)["']/g,(_,dep)=>`from ${JSON.stringify(moduleUrl(path.resolve(path.dirname(absolute),dep+".ts")))}`);
  const url=`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`;cache.set(absolute,url);return url;
}
const {polymers}=await import(moduleUrl("src/data/illustrated/polymers.ts"));
const {sugars}=await import(moduleUrl("src/data/illustrated/carbohydrates.ts"));
const {collectLessonFields,createLessonExercise,lessonModes}=await import(moduleUrl("src/lib/illustratedExercise.ts"));

test("all required polymer reactions are authored, with no false periodic network repeat",()=>{
  assert.equal(polymers.length,15);
  assert.deepEqual(polymers.filter(p=>p.family==="addition").map(p=>p.id),["pe","pp","pvc","ps","pan","ptfe"]);
  for(const p of polymers.filter(p=>p.family==="addition")) {
    assert.equal(p.monomers.length,1);
    assert.equal(p.monomers[0].structure.bonds.find(b=>b.id==="c0-c1").order,2);
    assert.equal(p.repeat.bonds.find(b=>b.id==="c0-c1").order,1);
    assert.equal(p.byproduct,"なし");
    assert.ok(p.repeat.repeat);
  }
  assert.deepEqual(polymers.find(p=>p.id==="pet").monomers.map(m=>m.id),["terephthalic-acid","ethylene-glycol"]);
  assert.deepEqual(polymers.find(p=>p.id==="nylon66").monomers.map(m=>m.id),["adipic-acid","hexamethylenediamine"]);
  for(const id of ["pet","nylon66"])assert.match(polymers.find(p=>p.id===id).byproduct,/H₂O/);
  assert.equal(polymers.find(p=>p.id==="nylon6").family,"ring-opening");
  for(const p of polymers.filter(p=>p.family==="network"||p.id==="sbr"))assert.equal(p.repeat,undefined);
});
test("molecular graphs have unique IDs, connected bonds, readable coordinates and repeat ends",()=>{
  const graphs=new Map();
  for(const p of polymers)for(const g of [...p.monomers.map(m=>m.structure),p.repeat].filter(Boolean)) {
    if(graphs.has(g.id))assert.deepEqual(graphs.get(g.id),g);
    graphs.set(g.id,g);
    const ids=new Set(g.atoms.map(a=>a.id));assert.equal(ids.size,g.atoms.length,g.id);
    assert.equal(new Set(g.bonds.map(b=>b.id)).size,g.bonds.length);
    for(const a of g.atoms)assert.ok(a.x>=0&&a.y>=0&&a.x<=g.width&&a.y<=g.height,`${g.id}/${a.id}`);
    const reached=new Set([g.atoms[0].id]);
    for(const b of g.bonds) {
      assert.ok(ids.has(b.from)&&ids.has(b.to));assert.ok([1,2,3].includes(b.order));
      const a=g.atoms.find(a=>a.id===b.from),z=g.atoms.find(a=>a.id===b.to);assert.ok(Math.hypot(z.x-a.x,z.y-a.y)>0);
    }
    for(let n=0;n<g.atoms.length;n++)for(const b of g.bonds) {if(reached.has(b.from))reached.add(b.to);if(reached.has(b.to))reached.add(b.from);}
    assert.equal(reached.size,g.atoms.length,g.id);
    if(g.repeat) {
      assert.ok(g.repeat.left<g.repeat.right&&g.repeat.top<g.repeat.bottom);
      assert.ok(g.atoms.some(a=>a.x<g.repeat.left));assert.ok(g.atoms.some(a=>a.x>g.repeat.right));
    }
  }
  const nylon6=polymers.find(p=>p.id==="nylon6").monomers[0].structure;
  assert.equal(nylon6.atoms.filter(a=>a.id.startsWith("ring")).length,7);
  const styrene=polymers.find(p=>p.id==="ps").monomers[0].structure;
  assert.equal(styrene.atoms.filter(a=>a.id.startsWith("ring")).length,6);
  assert.ok(styrene.bonds.some(b=>b.from==="c1"&&b.to==="ring0"));
});
test("sugar classes, hydrolysis stoichiometry and reducing behaviour agree",()=>{
  for(const category of ["mono","di","poly"])assert.equal(sugars.filter(s=>s.category===category).length,3);
  const get=id=>sugars.find(s=>s.id===id);
  assert.deepEqual(get("maltose").hydrolysisProducts,["glucose","glucose"]);
  assert.deepEqual(get("sucrose").hydrolysisProducts,["glucose","fructose"]);
  assert.deepEqual(get("lactose").hydrolysisProducts,["galactose","glucose"]);
  for(const s of sugars) {
    if(s.category==="mono")assert.equal(s.hydrolysisProducts.length,0);
    if(s.category==="di")assert.deepEqual(s.units,s.hydrolysisProducts);
    if(s.category==="poly") {assert.deepEqual(s.hydrolysisProducts,["glucose"]);assert.equal(s.reducingKind,"negligible");}
  }
  assert.equal(get("sucrose").reducingKind,"no");assert.equal(get("fructose").reducingKind,"yes");
  assert.match(get("fructose").note,/異性化/);assert.match(get("cellulose").linkage,/β/);
  assert.deepEqual(get("glucose").fischer.ohSides,["right","left","right","right"]);
  assert.deepEqual(get("galactose").fischer.ohSides,["right","left","left","right"]);
  assert.deepEqual(get("fructose").fischer.ohSides,["left","right","right"]);
});
for(const [slug,items] of [["polymers",polymers],["carbohydrates",sugars]])test(`${slug}: typed problem categories preserve shared IDs and data`,()=>{
  const before=JSON.stringify(items),fields=collectLessonFields(items);
  assert.equal(new Set(fields.map(f=>f.id)).size,fields.length);
  for(const mode of lessonModes[slug]) {
    const exercise=createLessonExercise(fields,slug,mode.id);
    assert.deepEqual(exercise.blankIds,fields.filter(f=>mode.categories.includes(f.blankCategory)).map(f=>f.id));
    assert.deepEqual(exercise,createLessonExercise(fields,slug,mode.id));
  }
  assert.deepEqual(createLessonExercise(fields,slug,"learn").blankIds,[]);
  const custom=[{...fields[0],id:"arbitrary",text:"no chemical name here"}];
  assert.deepEqual(createLessonExercise(custom,slug,"all").blankIds,["arbitrary"]);
  custom[0].blankable=false;assert.deepEqual(createLessonExercise(custom,slug,"all").blankIds,[]);
  assert.throws(()=>createLessonExercise(fields,slug,"invalid"));
  assert.equal(JSON.stringify(items),before);
});
test("composition and hydrolysis clues are masked together",()=>{
  const fields=collectLessonFields(sugars);
  assert.deepEqual(createLessonExercise(fields,"carbohydrates","composition").blankIds,createLessonExercise(fields,"carbohydrates","hydrolysis").blankIds);
  const reducing=createLessonExercise(fields,"carbohydrates","reducing");
  assert.ok(fields.filter(f=>reducing.blankIds.includes(f.id)).every(f=>f.blankCategory==="reducing"));
});
