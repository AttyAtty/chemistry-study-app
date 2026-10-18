import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import {createRequire} from "node:module";
const cache=new Map();
function load(file) {
 const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;
 const m={exports:{}};cache.set(absolute,m);
 const code=ts.transpileModule(fs.readFileSync(absolute,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const req=dep=>{if(dep.startsWith("@/")||dep.startsWith(".")){let p=dep.startsWith("@/")?path.resolve("src",dep.slice(2)):path.resolve(path.dirname(absolute),dep);p=fs.existsSync(`${p}.ts`)?`${p}.ts`:path.join(p,"index.ts");return load(p);}return createRequire(import.meta.url)(dep);};
 new Function("require","module","exports",code)(req,m,m.exports);return m.exports;
}
const {inorganicMaterial}=load("src/data/illustrated/inorganic.ts");
const {createInorganicExercise}=load("src/lib/inorganicExercise.ts");
const {gases}=load("src/data/gases.ts"),{electrochemistryCards}=load("src/data/electrochemistry.ts");
for(const slug of ["ionization","flame-tests","precipitates","gases","electrochemistry"])test(`${slug}: stable fields, typed modes, answers are local`,()=>{
 const d=inorganicMaterial(slug);assert.ok(d.fields.length>0);assert.equal(new Set(d.fields.map(f=>f.id)).size,d.fields.length);
 assert.deepEqual(d,inorganicMaterial(slug));assert.deepEqual(createInorganicExercise(d.fields,"learn").blankIds,[]);
 assert.equal(createInorganicExercise(d.fields,"all").blankIds.length,d.fields.length);
 const names=new Set(createInorganicExercise(d.fields,"names").blankIds);
 for(const f of d.fields)if(["reagent","collection","half-reaction"].includes(f.blankCategory))assert.equal(names.has(f.id),false);
});
test("ionization rank and meaningful reaction boundaries",()=>{const d=inorganicMaterial("ionization");assert.equal(d.elements.map(f=>f.text).join(" "),"Li K Ca Na Mg Al Zn Fe Ni Sn Pb (H) Cu Hg Ag Pt Au");assert.deepEqual(d.bands.map(b=>[b.start,b.end]),[[0,3],[4,4],[5,7],[0,10]]);assert.match(d.notes.join(" "),/皮膜/);});
test("precipitate formula and color form one answer; not-covered is distinct",()=>{const d=inorganicMaterial("precipitates");assert.equal(d.matrix.length,9);assert.equal(d.reagents.length,5);assert.match(d.matrix[0].cells[0].answer.text,/AgCl.*白色/);assert.equal(d.matrix[2].cells[0].status,"none");assert.equal(d.matrix[4].cells[3].status,"not-covered");assert.match(d.matrix[0].cells[2].answer.text,/Ag₂O/);});
test("gas and cell facts reuse canonical objects",()=>{const d=inorganicMaterial("gases");assert.equal(d.gases.length,8);for(const g of d.gases)assert.equal(g.source,gases.find(s=>s.id===g.source.id));assert.equal(d.gases.find(g=>g.source.id==="ammonia").method,"up");assert.equal(d.gases.find(g=>g.source.id==="hydrogen-chloride").method,"down");const c=inorganicMaterial("electrochemistry");for(const cell of c.cells)assert.equal(cell.source,electrochemistryCards.find(s=>s.id===cell.source.id));assert.equal(c.cells[0].source.electrodes[0].reactionType,"oxidation");});
