import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

async function load(file) {
  const js=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
}
const {separationDiagrams}=await load("src/data/separation/diagrams.ts");
const {collectBlankTargets,createSeparationExercise,nextSeparationExercise}=await load("src/lib/separationExercise.ts");
const options={mode:"all",rate:30,seed:"seed-a",structurePolicy:"hide"};

for(const diagram of separationDiagrams) {
  test(`${diagram.id}: four modes preserve the mixture and keep categories separate`,()=>{
    const original=JSON.stringify(diagram);
    const targets=collectBlankTargets(diagram);
    assert.equal(new Set(targets.map(t=>t.id)).size,targets.length);
    for(const target of targets) assert.notEqual(diagram.nodes.find(n=>n.id===target.nodeId)?.kind,"mixture");
    const all=createSeparationExercise(diagram,options);
    assert.deepEqual(all.blankIds,targets.map(t=>t.id));
    const species=createSeparationExercise(diagram,{...options,mode:"species",structurePolicy:"hint"});
    assert.ok(species.blankIds.length>0);
    assert.ok(targets.filter(t=>species.blankIds.includes(t.id)).every(t=>t.blankCategory==="species"));
    const procedure=createSeparationExercise(diagram,{...options,mode:"procedure"});
    assert.ok(procedure.blankIds.length>0);
    assert.ok(targets.filter(t=>procedure.blankIds.includes(t.id)).every(t=>["reagent","condition","operation","amount","action"].includes(t.blankCategory)));
    assert.equal(species.blankIds.some(id=>procedure.blankIds.includes(id)),false);
    for(const mode of ["all","species","procedure","random"]) createSeparationExercise(diagram,{...options,mode});
    assert.equal(JSON.stringify(diagram),original,"generation must not mutate layout or chemistry");
  });
  test(`${diagram.id}: seed and rate reproduce a precise, unique subset`,()=>{
    for(const rate of [20,30,50,70]) {
      const a=createSeparationExercise(diagram,{...options,mode:"random",rate});
      const b=createSeparationExercise(diagram,{...options,mode:"random",rate});
      assert.deepEqual(a,b);
      assert.equal(a.blankIds.length,Math.max(1,Math.round(a.targets.length*rate/100)));
      assert.equal(new Set(a.blankIds).size,a.blankIds.length);
      const c=createSeparationExercise(diagram,{...options,mode:"random",rate,seed:"seed-b"});
      assert.notDeepEqual(a.blankIds,c.blankIds);
      const next=nextSeparationExercise(diagram,a);
      assert.notDeepEqual(next.blankIds,a.blankIds);
      assert.deepEqual(next,createSeparationExercise(diagram,next));
    }
  });
}
test("typed operation metadata supplies categories and supplements missing from the small SVG",()=>{
  const metal=collectBlankTargets(separationDiagrams[0]);
  const organic=collectBlankTargets(separationDiagrams[1]);
  for(const [id,category] of [["metal-2-residue-reagent","reagent"],["metal-2-residue-condition","condition"],["metal-2-residue-amount","amount"],["metal-2-residue-action-pass-gas","action"],["metal-lead-hot-water-operation","operation"]]) {
    assert.equal(metal.find(t=>t.id===id)?.blankCategory,category);
  }
  for(const key of ["vent","separate"]) {
    const target=organic.find(t=>t.id===`organic-2-extract-action-${key}`);
    assert.equal(target?.location,"supplement"); assert.equal(target.blankCategory,"action");
  }
  assert.equal(organic.find(t=>t.id==="organic-2-extract-operation-note-0").blankCategory,"result");
  assert.equal(organic.some(t=>t.id==="organic-distill-nitrobenzene-reagent"),false);
  assert.equal(organic.filter(t=>t.blankCategory==="species").length,17);
  assert.equal(metal.find(t=>t.id==="chlorides:line:0").answer,"AgCl");
  assert.equal(metal.find(t=>t.id==="chlorides:line:0:result").blankCategory,"result");
});
test("blankable and category overrides come from metadata, not displayed chemical text",()=>{
  const copy=structuredClone(separationDiagrams[0]);
  const field=copy.edges[0].reagent;
  field.label="arbitrary non-chemical display";
  assert.equal(collectBlankTargets(copy).find(t=>t.id===field.id).blankCategory,"reagent");
  field.blankCategory="condition";
  assert.equal(collectBlankTargets(copy).find(t=>t.id===field.id).blankCategory,"condition");
  field.blankable=false;
  assert.equal(collectBlankTargets(copy).some(t=>t.id===field.id),false);
});
test("invalid configuration is rejected and generator never uses ambient randomness",()=>{
  for(const rate of [-1,0,100,NaN,Infinity,20.5]) assert.throws(()=>createSeparationExercise(separationDiagrams[0],{...options,rate}));
  for(const mode of ["unknown","constructor","toString"]) assert.throws(()=>createSeparationExercise(separationDiagrams[0],{...options,mode}));
  assert.throws(()=>createSeparationExercise(separationDiagrams[0],{...options,seed:""}));
  assert.doesNotMatch(fs.readFileSync("src/lib/separationExercise.ts","utf8"),/Math\.random\s*\(/);
});
