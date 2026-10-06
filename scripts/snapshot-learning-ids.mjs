// Capture current ID/content relationships without modifying source data.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import ts from "typescript";
const cache = new Map();
function load(filename) {
  const file = path.resolve(filename);
  if (cache.has(file)) return cache.get(file);
  const exports = {}, loadedModule = { exports };
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, module: loadedModule, require(id) {
    const base = id.startsWith("@/") ? path.resolve("src", id.slice(2)) : path.resolve(path.dirname(file), id);
    return load(fs.existsSync(base + ".ts") ? base + ".ts" : path.join(base, "index.ts"));
  } }, { filename: file });
  return loadedModule.exports;
}
const { chemistryUnits } = load("src/data/chemistry.ts");
const { getFlashcardsForUnit } = load("src/data/flashcards.ts");
const basic = load("src/data/chemistry-basic/index.ts").chemistryBasicComprehensiveQuestions;
const organic = load("src/data/organicReactionMaps.ts");
const fingerprint = data => createHash("sha256").update(JSON.stringify(data)).digest("hex");
const units = chemistryUnits.map(unit => ({
  slug: unit.slug,
  questions: unit.questions.map(q => ({ id: q.id, historyKey: `${unit.slug}::${q.id}`, prompt: q.prompt, fingerprint: fingerprint([q.prompt, q.choices, q.answerIndex]) })),
  flashcards: getFlashcardsForUnit(unit).map(c => ({ id: c.id, front: c.front, back: c.back, fingerprint: fingerprint([c.front, c.back]) })),
}));
units.push({ slug: "chemistry-basic-comprehensive", questions: basic.map(q => ({ id: q.id, historyKey: `chemistry-basic-comprehensive::${q.id}`, prompt: q.prompt, fingerprint: fingerprint([q.prompt, q.choices, q.answerIndex]) })), flashcards: [] });
const reactions = organic.organicReactions.map(r => ({ id: r.id, sourceId: r.sourceId, targetId: r.targetId, reactionName: r.reactionName, conditions: r.conditions }));
const inorganic = load("src/data/inorganicKnowledge.ts");
const inorganicReactions = inorganic.inorganicReactions.map(r => ({ id: r.id, reactants: r.reactants, products: r.products, conditions: r.conditions, fingerprint: fingerprint(r) }));
const inorganicSubstances = inorganic.inorganicSubstances.map(s => ({ id: s.id, fingerprint: fingerprint(s) }));
const compounds = organic.organicCompounds.map(c => ({ id: c.id, name: c.nameJa, formula: c.formula }));
const mapIds = [
  ...load("src/data/reactionMaps.ts").reactionMaps.map(m => ({ source: "reactionMaps", id: m.id, title: m.title, fingerprint: fingerprint(m) })),
  ...organic.expandedOrganicReactionMaps.map(m => ({ source: "organicReactionMaps", id: m.id, title: m.title, fingerprint: fingerprint(m) })),
  ...inorganic.expandedInorganicReactionMaps.map(m => ({ source: "inorganicKnowledge", id: m.id, title: m.title, fingerprint: fingerprint(m) })),
];
const ids = units.flatMap(u => u.flashcards.map(c => c.id));
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
const output = { schemaVersion: 1, purpose: "Phase 1 ID/content baseline; NOT user data", units, reactions, inorganicReactions, inorganicSubstances, compounds, mapIds, duplicateFlashcardIds: [...new Set(duplicates)] };

const baseline=JSON.parse(fs.readFileSync("docs/verification/phase1-id-baseline.json","utf8"));
const migration=load("src/data/learningIdMigrationMap.ts").learningIdMigrationMap;
if(units.length!==baseline.units.length)throw new Error("Unit count changed");
for(const before of baseline.units){
 const after=units.find(unit=>unit.slug===before.slug);
 if(!after||after.questions.length!==before.questions.length||after.flashcards.length!==before.flashcards.length)throw new Error("Curriculum count changed: "+before.slug);
 for(const collection of ["questions","flashcards"]){
  const current=new Map(after[collection].map(item=>[item.id,item]));
  if(current.size!==after[collection].length)throw new Error("Duplicate ID");
  for(const item of before[collection]){
   const newId=(collection==="questions"?migration.questionIds:migration.flashcards)[item.id]??item.id;
   if(current.get(newId)?.fingerprint!==item.fingerprint)throw new Error("Unexpected ID/content change: "+item.id);
  }
 }
}
for(const collection of ["reactions","inorganicReactions","inorganicSubstances","compounds","mapIds"])
 if(JSON.stringify(output[collection])!==JSON.stringify(baseline[collection]))throw new Error("Display/source identities changed: "+collection);
output.schemaVersion=2;output.purpose="Phase 2 ID comparison; Phase 1 baseline preserved";

fs.mkdirSync("docs/verification", { recursive: true });
fs.writeFileSync("docs/verification/phase2-id-baseline.json", JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ units: units.length, questions: units.reduce((n,u) => n + u.questions.length, 0), flashcards: ids.length, reactions: reactions.length, inorganicReactions: inorganicReactions.length, mapReferences: mapIds.length, duplicateFlashcardIds: output.duplicateFlashcardIds }));

const oldQuestions=baseline.units.flatMap(unit=>unit.questions.map(item=>item.historyKey));
const oldCards=baseline.units.flatMap(unit=>unit.flashcards.map(item=>item.id));
const classification={
 schemaVersion:1,purpose:"Phase 2 ID audit; categories overlap; not user data",
 A:{description:"Explicit source IDs retained; generated semantic IDs are literal learningId fields after this change",
 questions:oldQuestions.filter(id=>!Object.hasOwn(migration.questionHistory,id)&&!id.includes("organic-reaction-")),
 flashcards:oldCards.filter(id=>!Object.hasOwn(migration.flashcards,id)&&!id.startsWith("organic-reaction-")),
 },
 B:{description:"Baseline order-derived IDs replaced in the canonical view; original aliases are retained",
 questions:Object.keys(migration.questionHistory),flashcards:Object.keys(migration.flashcards)},
 C:{description:"Text-sensitive organic hashes retained this phase; fix graph source identities together in a later migration",
 reactions:baseline.reactions.map(item=>item.id),
 compounds:baseline.compounds.filter(item=>item.id.startsWith("organic-")).map(item=>item.id),
 questions:oldQuestions.filter(id=>id.includes("organic-reaction-")),
 flashcards:oldCards.filter(id=>id.startsWith("organic-reaction-"))},
 D:{description:"Slug/prefix/section names are frozen; any future rename needs aliases",
 units:baseline.units.map(unit=>unit.slug),questionHistoryFormat:"unitSlug::questionId",
 flashcardFormat:"unitSlug/section.id or unitSlug/question.id; explicit learningId suffix"},
 E:{description:"ID migration implemented as verified IndexedDB copy; localStorage IDs are preserved",migrationId:migration.migrationId,
 questionAliases:Object.keys(migration.questionHistory).length,flashcardAliases:Object.keys(migration.flashcards).length},
 F:{description:"No renaming of explicit IDs, organic graph hashes, display-only Reaction Map IDs or unsaved memory quiz IDs",
 mapIds:baseline.mapIds.map(item=>item.id),unsavedMemoryQuiz:"flash-card.id-field-index; no current persistent history"}
};
fs.writeFileSync("docs/verification/phase2-id-classification.json",JSON.stringify(classification,null,2)+"\n","utf8");
if(ids.some(id=>/-(card|row|flow)-[0-9]+(-reverse)?$/.test(id)))throw new Error("Order-derived flashcard ID remains");
console.log(JSON.stringify({questionAliases:classification.E.questionAliases,flashcardAliases:classification.E.flashcardAliases,unchangedHashQuestions:classification.C.questions.length}));
