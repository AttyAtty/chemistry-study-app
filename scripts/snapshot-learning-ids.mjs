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
fs.mkdirSync("docs/verification", { recursive: true });
fs.writeFileSync("docs/verification/phase1-id-baseline.json", JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ units: units.length, questions: units.reduce((n,u) => n + u.questions.length, 0), flashcards: ids.length, reactions: reactions.length, inorganicReactions: inorganicReactions.length, mapReferences: mapIds.length, duplicateFlashcardIds: output.duplicateFlashcardIds }));
