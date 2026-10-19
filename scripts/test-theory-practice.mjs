import {test} from "node:test";
import assert from "node:assert/strict";
import {loadPureTypeScript} from "./helpers/pure-typescript.mjs";

const {workedExamples,practiceQuestions,formulaChoiceQuestions}=await loadPureTypeScript("src/data/theoryPractice.ts");
const {formulas}=await loadPureTypeScript("src/data/illustrated/formulas.ts");
const {theoryLessons,theoryFields}=await loadPureTypeScript("src/data/illustrated/theory.ts");
const models=await loadPureTypeScript("src/lib/theoryModels.ts");

test("worked theory examples cover calculation families with complete solution steps",()=>{
 const topics=new Set(workedExamples.map(x=>x.topic));
 for(const topic of ["物質量","モル濃度","気体","溶解度・再結晶","pH","中和","化学平衡","反応速度","熱化学","電気分解"])assert.ok(topics.has(topic),`missing ${topic}`);
 for(const item of workedExamples){for(const key of ["problem","choose","thinking","formula","substitution","answer","point","variation"])assert.ok(item[key]?.trim(),`${item.id}.${key}`);assert.ok(formulas.some(f=>f.id===item.formulaId),`${item.id}: missing formula`);assert.equal(item.href,`/theory/formulas#formula-${item.formulaId}`);}
});

test("practice questions and formula selection drills have keyed answers and explanations",()=>{
 assert.ok(practiceQuestions.length>=10);assert.ok(formulaChoiceQuestions.length>=3);
 assert.equal(new Set(practiceQuestions.map(x=>x.id)).size,practiceQuestions.length);
 for(const q of practiceQuestions){assert.ok(q.problem&&q.choose&&q.answer&&q.explanation);assert.ok(formulas.some(f=>f.id===q.formulaId));}
 for(const q of formulaChoiceQuestions){assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.ok(q.reason);}
});

test("predefined numerical variants remain finite and meaningful",()=>{
 const variants=workedExamples.flatMap(x=>x.variants??[]);assert.ok(variants.length>=4);
 for(const v of variants)assert.ok(v.problem&&v.formula&&v.substitution&&v.answer);
 const recrystallization=workedExamples.find(x=>x.id==="solubility-crystals");assert.equal(recrystallization.variants[0].answer,"60 g");
 const gas=workedExamples.find(x=>x.id==="gas-law");assert.deepEqual(gas.variants.map(v=>v.answer),["12.5 L","45.4 L"]);
});

test("energy map has stable, separately blankable state and enthalpy targets",()=>{
 assert.ok(theoryLessons.some(x=>x.slug==="energy-map"));
 const fields=Object.values(theoryFields["energy-map"]),ids=fields.map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);assert.ok(ids.length>=20);
 const exerciseIds=models.createTheoryExercise("energy-map","all").blankIds;for(const id of ids)assert.ok(exerciseIds.includes(id));
 assert.ok(fields.some(x=>x.id==="energy-map:lattice-reverse"));
 for(const id of ["energy-map:born-standard","energy-map:born-na-gas","energy-map:born-atoms","energy-map:born-cation","energy-map:born-gas-ions","energy-map:born-crystal","energy-map:cl-atom-electron","energy-map:cl-anion"])assert.ok(exerciseIds.includes(id),`missing state blank ${id}`);
 for(const id of ["formation","hess","bond-energy"])assert.ok(formulas.some(f=>f.id===id));
});

test("fraction-bearing equilibrium and weak-acid formulas remain authored for MathML layout",()=>{
 const kc=formulas.find(f=>f.id==="kc"),ka=formulas.find(f=>f.id==="ka"),buffer=formulas.find(f=>f.id==="buffer");
 assert.match(kc.rhs.text,/\//);assert.match(kc.rhs.text,/\^[cd]/);
 assert.match(ka.rhs.text,/Cα\^2\/\(1−α\)/);assert.match(ka.rhs.text,/√\(Ka\/C\)/);
 assert.match(buffer.rhs.text,/\[A⁻\]\/\[HA\]/);
});
