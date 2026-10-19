import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();
function resolveLocal(from, id) {
  const base = id.startsWith("@/") ? path.resolve("src", id.slice(2)) : path.resolve(path.dirname(from), id);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  return null;
}
function loadTs(file) {
  const absolute = path.resolve(file);
  if (moduleCache.has(absolute)) return moduleCache.get(absolute).exports;
  const loadedModule = { exports: {} };
  moduleCache.set(absolute, loadedModule);
  const js = ts.transpileModule(fs.readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const localRequire = (id) => { const resolved = resolveLocal(absolute, id); return resolved ? loadTs(resolved) : nativeRequire(id); };
  vm.runInNewContext(js, { exports: loadedModule.exports, module: loadedModule, require: localRequire, console, process, URL, URLSearchParams, setTimeout, clearTimeout }, { filename: absolute });
  return loadedModule.exports;
}

const { chemistryUnits } = loadTs("src/data/chemistry.ts");
const { theoryLessons } = loadTs("src/data/illustrated/theory.ts");
const { inorganicLessons } = loadTs("src/data/illustrated/inorganicTypes.ts");
const { illustratedLessons } = loadTs("src/data/illustrated/types.ts");
const { chemistryBasicComprehensiveQuestions } = loadTs("src/data/chemistry-basic/questions-comprehensive.ts");
const { getMemoryQuizCandidates } = loadTs("src/data/memoryQuizCandidates.ts");
const { diagramHubEntries } = loadTs("src/data/illustrated/hub.ts");
const { searchKnowledge } = loadTs("src/lib/knowledgeSearch.ts");
const errors = [];
let questionCount = 0;
function auditQuestions(label, questions) {
  const ids = new Set();
  for (const [index, question] of questions.entries()) {
    const prefix = `${label}/${question?.id ?? `index-${index}`}`;
    if (!question?.id || ids.has(question.id)) errors.push(`${prefix}: missing or duplicate question id`);
    ids.add(question?.id);
    if (!question?.prompt?.trim()) errors.push(`${prefix}: empty question`);
    if (!Array.isArray(question?.choices) || question.choices.length < 2 || question.choices.some((choice) => !String(choice).trim())) errors.push(`${prefix}: choices are incomplete`);
    if (!Number.isInteger(question?.answerIndex) || question.answerIndex < 0 || question.answerIndex >= (question.choices?.length ?? 0)) errors.push(`${prefix}: answer index is missing or out of range`);
    else if (/^(?:—|–|-|空欄|未設定)$/.test(String(question.choices[question.answerIndex]).trim())) errors.push(`${prefix}: answer is a placeholder`);
    if (!question?.explanation?.trim()) errors.push(`${prefix}: explanation is empty`);
  }
  questionCount += questions.length;
}

for (const unit of chemistryUnits) {
  const sectionIds = new Set();
  for (const section of unit.sections) {
    if (sectionIds.has(section.id)) errors.push(`${unit.slug}: duplicate section id ${section.id}`);
    sectionIds.add(section.id);
  }
  auditQuestions(unit.slug, unit.questions);
}
auditQuestions("chemistry-basic-comprehensive", chemistryBasicComprehensiveQuestions);
const memory = getMemoryQuizCandidates();
const memoryIds = new Set();
for (const question of memory) {
  if (!question.id || memoryIds.has(question.id)) errors.push(`memory-quiz/${question.id}: duplicate or empty id`);
  memoryIds.add(question.id);
  if (!question.prompt?.trim()) errors.push(`memory-quiz/${question.id}: empty question`);
  if (!question.answer?.trim() || /^(?:—|–|-|空欄|未設定)$/.test(question.answer.trim())) errors.push(`memory-quiz/${question.id}: empty or placeholder answer`);
}
const hubIds = new Set();
const knownHubTargets = new Set([
  ...[...theoryLessons, ...inorganicLessons, ...illustratedLessons].map((lesson) => `/illustrated/${lesson.slug}`),
  "/separation/metal-analysis", "/separation/aromatic-separation",
]);
for (const entry of diagramHubEntries) {
  if (!entry.id || hubIds.has(entry.id)) errors.push(`diagram hub: duplicate id ${entry.id}`);
  hubIds.add(entry.id);
  if (!entry.title?.trim() || !entry.description?.trim()) errors.push(`diagram hub/${entry.id}: missing title or description`);
  if (!knownHubTargets.has(entry.href)) errors.push(`diagram hub/${entry.id}: dangling target ${entry.href}`);
}
for (const term of ["高分子", "糖", "溶解度", "蒸気圧", "系統分析", "炎色反応", "イオン化傾向", "滴定", "エンタルピー", "電池", "ヘンリーの法則"]) {
  if (!searchKnowledge(term).some((item) => item.type === "illustrated")) errors.push(`search/${term}: diagram lesson is not indexed`);
}

console.log(`Study material audit: units=${chemistryUnits.length}, quiz questions=${questionCount}, print candidates=${memory.length}, diagram entries=${diagramHubEntries.length}`);
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log("Question answers, IDs, hub references, and printable prompts passed.");
