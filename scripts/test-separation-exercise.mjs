import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { loadPureTypeScript as load } from "./helpers/pure-typescript.mjs";

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
test("authored phrases preserve source IDs while grouping complete instructions",()=>{
  for(const diagram of separationDiagrams) {
    const targets=collectBlankTargets(diagram);
    for(const edge of diagram.edges.filter(e=>!e.display.hideLabel)) {
      const phrases=edge.display.problemPhrases;
      assert.ok(phrases?.length);
      const fields=[edge.reagent,edge.condition,edge.operation,edge.operation.amount,...edge.operation.actions,...edge.operation.notes].filter(Boolean);
      for(const phrase of phrases) {
        const target=targets.find(t=>t.id===phrase.id);
        assert.equal(target.answer,phrase.text);
        assert.equal(target.blankCategory,"operation");
        assert.ok(phrase.sourceIds.length);
        assert.ok(phrase.sourceIds.every(id=>fields.some(f=>f.id===id)));
        assert.ok(phrase.x+phrase.width<=diagram.width);
      }
      assert.equal(targets.some(t=>t.id===edge.reagent.id),false,"no word-level duplicate");
    }
  }
  const metal=collectBlankTargets(separationDiagrams[0]);
  assert.equal(metal.find(t=>t.id==="chlorides:line:0").answer,"AgCl（白）");
  assert.equal(metal.some(t=>t.id==="chlorides:line:0:result"),false);
  assert.equal(metal.find(t=>t.id==="chlorides:label").answer,"塩化物");
  assert.equal(metal.find(t=>t.id==="metal-2-residue:phrase:pass-gas").answer,"H₂Sを酸性条件で十分に通じる");
  assert.equal(metal.filter(t=>t.edgeId==="metal-3-residue" && t.location==="diagram").length,3);
  const organic=collectBlankTargets(separationDiagrams[1]);
  assert.equal(organic.find(t=>t.id==="benzoate:layer").blankCategory,"result");
  assert.ok(organic.find(t=>t.id==="organic-2-extract-action-vent"));
  assert.equal(organic.filter(t=>t.blankCategory==="species").length,17);
});

test("invalid configuration is rejected and generator never uses ambient randomness",()=>{
  for(const rate of [-1,0,100,NaN,Infinity,20.5]) assert.throws(()=>createSeparationExercise(separationDiagrams[0],{...options,rate}));
  for(const mode of ["unknown","constructor","toString"]) assert.throws(()=>createSeparationExercise(separationDiagrams[0],{...options,mode}));
  assert.throws(()=>createSeparationExercise(separationDiagrams[0],{...options,seed:""}));
  assert.doesNotMatch(fs.readFileSync("src/lib/separationExercise.ts","utf8"),/Math\.random\s*\(/);
});
