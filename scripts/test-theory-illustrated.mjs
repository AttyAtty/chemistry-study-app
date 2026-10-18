import {test} from "node:test";
import assert from "node:assert/strict";
import {loadPureTypeScript} from "./helpers/pure-typescript.mjs";
const m=await loadPureTypeScript("src/lib/theoryModels.ts");
const {theoryFields,theoryLessons}=await loadPureTypeScript("src/data/illustrated/theory.ts");
test("solubility: interpolated values, solvent scaling and cooling mass balance",()=>{
 assert.equal(m.solubilityAt(20),30);assert.equal(m.solubilityAt(80),80);assert.equal(m.solubilityAt(30),37.5);
 assert.equal(m.dissolvedMass(80,50),40);assert.equal(m.dissolvedMass(80,200),160);
 assert.equal(m.crystalMass(80,20,100),50);assert.equal(m.crystalMass(80,20,50),25);assert.equal(m.crystalMass(80,20,200),100);assert.equal(m.crystalMass(20,80,100),0);
});
test("vapor model: pressure and inverse boiling temperature are consistent",()=>{
 assert.equal(m.vaporPressureAt(100),101.325);assert.equal(m.boilingTemperature(101.325),100);
 for(const p of [30,60,101.325,150,200])assert.ok(Math.abs(m.vaporPressureAt(m.boilingTemperature(p))-p)<1e-8);
 assert.ok(m.boilingTemperature(60)<100);assert.ok(m.boilingTemperature(150)>100);assert.ok(m.vaporPressureAt(80)<m.vaporPressureAt(100));assert.throws(()=>m.boilingTemperature(0),RangeError);
});
test("Henry model uses amount at fixed temperature and solvent amount, proportional to partial pressure",()=>{
 assert.equal(m.henryAmount(0),0);assert.equal(m.henryAmount(1),2);assert.equal(m.henryAmount(3),6);assert.equal(m.henryAmount(1.5),3);
});
test("Cartesian scales map axes to the fixed printable frame",()=>{const x=m.graphScale([0,100],[135,970]),y=m.graphScale([0,120],[345,65]);assert.equal(x(0),135);assert.equal(x(100),970);assert.equal(y(0),345);assert.equal(y(120),65);assert.equal(x(50),552.5);});
for(const lesson of theoryLessons)test(`${lesson.slug}: stable phrase IDs and explicit question categories`,()=>{
 const fields=Object.values(theoryFields[lesson.slug]),ids=fields.map(f=>f.id);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(m.createTheoryExercise(lesson.slug,"learn").blankIds,[]);assert.deepEqual(m.createTheoryExercise(lesson.slug,"all").blankIds,ids);
 const concepts=m.createTheoryExercise(lesson.slug,"concepts").blankIds,calcs=m.createTheoryExercise(lesson.slug,"calculations").blankIds;
 assert.ok(concepts.length>0);assert.ok(calcs.length>0);assert.equal(concepts.some(id=>calcs.includes(id)),false);
 for(const f of fields)assert.ok(f.text.length>10);
});
