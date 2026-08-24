import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadData(file, modules={}) {
  const source=fs.readFileSync(file,"utf8");
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  const context={exports,module:{exports},require:(id)=>modules[id]??{},console};
  vm.runInNewContext(code,context,{filename:file});
  return context.module.exports;
}

function duplicateIds(items) {
  const seen=new Set();
  return items.map(item=>item.id).filter(id=>seen.has(id)||!seen.add(id));
}

const organic=loadData("src/data/organicReactionMaps.ts").organicReactions;
const frequent=loadData("src/data/frequentReactionKnowledge.ts");
const coverage=loadData("src/data/coverageExpansionQuestions.ts");
const inorganic=loadData("src/data/inorganicKnowledge.ts",{"@/data/frequentReactionKnowledge":frequent,"@/data/coverageExpansionQuestions":coverage}).inorganicReactions;
const redox=loadData("src/data/redoxProductPredictions.ts").redoxProductPredictions;
const gases=loadData("src/data/gases.ts").gases;
const electrochemistry=loadData("src/data/electrochemistry.ts").electrochemistryCards;
const errors=[];

for(const [label,items] of [["organic",organic],["inorganic",inorganic],["redox",redox],["gas",gases],["electrochemistry",electrochemistry]]){
  const duplicates=duplicateIds(items);if(duplicates.length)errors.push(`${label}: duplicate ids ${duplicates.join(", ")}`);
}
for(const item of redox){
  if(item.reactant==="MnO₄⁻"&&item.medium==="条件によらない")errors.push(`${item.id}: MnO4 medium is ambiguous`);
  if(!item.product||!item.skeleton||!item.halfReaction||!item.relatedHalfReactionId)errors.push(`${item.id}: incomplete redox prediction`);
}
for(const reaction of organic){
  if(!reaction.sourceId||!reaction.targetId)errors.push(`${reaction.id}: missing endpoint`);
  if(reaction.reagents.some(value=>reaction.catalysts.includes(value)))errors.push(`${reaction.id}: reagent/catalyst overlap`);
  if(reaction.temperature?.includes("触媒"))errors.push(`${reaction.id}: catalyst in temperature`);
}
for(const reaction of inorganic){
  if(!reaction.reactants.length||!reaction.products.length||!reaction.equation)errors.push(`${reaction.id}: incomplete inorganic reaction`);
}
for(const gas of gases){
  for(const [index,preparation] of gas.preparation.entries())if(!preparation.reagents.length||!preparation.equation)errors.push(`${gas.id}: incomplete preparation ${index}`);
}
for(const card of electrochemistry){
  const anode=card.electrodes.find(item=>item.electrodeRole==="anode"),cathode=card.electrodes.find(item=>item.electrodeRole==="cathode");
  if(!anode||anode.reactionType!=="oxidation")errors.push(`${card.id}: invalid anode`);
  if(!cathode||cathode.reactionType!=="reduction")errors.push(`${card.id}: invalid cathode`);
  if(!card.overallEquation)errors.push(`${card.id}: missing overall equation`);
}

console.log(`Chemistry audit: organic=${organic.length}, inorganic=${inorganic.length}, redox=${redox.length}, gases=${gases.length}, electrochemistry=${electrochemistry.length}`);
if(errors.length){console.error(errors.join("\n"));process.exitCode=1;}else console.log("Chemistry data integrity checks passed.");
