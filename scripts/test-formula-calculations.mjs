import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadPureTypeScript} from './helpers/pure-typescript.mjs';
const c=await loadPureTypeScript('src/lib/formulaCalculations.ts');
const {formulas,formulaCategories,formulaTargetsForLesson}=await loadPureTypeScript('src/data/illustrated/formulas.ts');
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} ≠ ${expected}`);
test('units, amount, concentration and ideal gas use litres, kelvin and matching R',()=>{
 near(c.mlToL(250),.250);near(c.celsiusToKelvin(27),300.15);near(c.molesFromMass(9,18),.5);near(c.concentration(.05,c.mlToL(250)),.2);near(c.idealGasVolume(1,300.15,100),24.942465);near(c.partialPressure(100,.2),20);
 assert.throws(()=>c.celsiusToKelvin(-274),RangeError);assert.throws(()=>c.concentration(1,0),RangeError);
});
test('solubility solvent scaling and Henry partial pressure proportions',()=>{
 near(c.solubilityMass(40,50),20);near(c.solubilityMass(40,200),80);near(c.precipitatedMass(80,30,50),25);near(c.precipitatedMass(30,80,100),0);near(c.henryScale(2,1,3),6);
});
test('pH logarithm, acid valence and stoichiometric titration volume',()=>{
 near(c.phFromConcentration(.001),3);near(c.phFromConcentration(.0001)-c.phFromConcentration(.001),1);near(c.neutralizationVolume(2,.1,10,1,.1),20);assert.throws(()=>c.phFromConcentration(0),RangeError);
});
test('equilibrium coefficients are exponents and rates share coefficient-scaled signs',()=>{
 near(c.equilibriumConstant([{concentration:3,coefficient:2}],[{concentration:2,coefficient:3}]),9/8);near(c.reactionRate(.8,.6,10,2,true),.01);near(c.reactionRate(.1,.2,10,1),.01);
});
test('enthalpy weights, Hess reversal/multiplication and bond breaking minus formation',()=>{
 near(c.reactionEnthalpy([{coefficient:2,formation:-285.8}],[{coefficient:2,formation:0},{coefficient:1,formation:0}]),-571.6);near(c.hessSum([{enthalpy:-393.5,multiplier:1},{enthalpy:-283,multiplier:-1}]),-110.5);near(c.hessSum([{enthalpy:-110.5,multiplier:2}]),-221);near(c.bondEstimate([436,243],[432,432]),-185);
});
test('Faraday electron stoichiometry and electrode reduction potential subtraction',()=>{
 near(c.charge(2,965),1930);near(c.electronMoles(1930),.0200);near(c.productMoles(.02,2),.01);near(c.productMoles(.04,4),.01);near(c.depositMass(2,965,2,63.5),.635);near(c.cellPotential(.34,-.76),1.10);
});
test('formula metadata covers six categories, complete examples and stable phrase targets',()=>{
 const ids=formulas.flatMap(f=>[f.rhs.id,f.example.solution.id]);assert.equal(new Set(ids).size,ids.length);
 for(const category of formulaCategories)assert.ok(formulas.some(f=>f.category===category.id));
 for(const f of formulas){for(const value of [f.rhs.text,f.use,f.diagram,f.mistake,f.example.question,f.example.substitution,f.example.answer])assert.ok(value.length>0);assert.ok(f.symbols.every(s=>s.symbol&&s.meaning&&s.unit));assert.ok(f.href.startsWith('/'));assert.ok(f.lessons.length>0);assert.equal(f.rhs.blankCategory,'calculation');assert.equal(f.example.solution.blankCategory,'calculation');}
 for(const lesson of ['solubility','vapor-pressure','henry','acid-base','titration','indicators','buffers','equilibrium','kinetics','thermochemistry','gases','electrochemistry'])assert.ok(formulaTargetsForLesson(lesson).length>=2);
});
