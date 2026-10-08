import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const modules = new Map();
function load(filename) {
  const file = path.resolve(filename);
  if (modules.has(file)) return modules.get(file);
  const exports = {}; modules.set(file, exports);
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("exports", "require", "module", source)(exports, id => {
    const base = id.startsWith("@/") ? path.resolve("src", id.slice(2)) : path.resolve(path.dirname(file), id);
    return load(fs.existsSync(base + ".ts") ? base + ".ts" : path.join(base, "index.ts"));
  }, { exports });
  return exports;
}
const candidates = load("src/data/memoryQuizCandidates.ts").getMemoryQuizCandidates();
test("oxidation-number questions name the exact elements from the source table", () => {
  const rows = load("src/data/chemistry.ts").chemistryUnits.flatMap(unit => unit.sections).filter(s => s.kind === "table" && s.columns.includes("注目元素")).flatMap(s => s.rows);
  assert.equal(rows.length, 7);
  for (const row of rows) {
    const question = candidates.find(q => q.prompt.startsWith(row[0] + "中の") && q.prompt.includes("酸化数"));
    assert.ok(question, row[0]);
    assert.ok(question.prompt.includes(row[1] + "の酸化数"), question.prompt);
    assert.equal(question.answer, row[2]);
  }
  assert.ok(candidates.some(q => q.prompt === "KMnO₄中のMnの酸化数を答えよ。" && q.answer === "+7"));
  assert.ok(!candidates.some(q => q.prompt.includes("指定された元素") || q.prompt.includes("各元素の酸化数")));
});
test("question totals distinguish the all-unit pool from the basic comprehensive pool", () => {
  const regular = load("src/data/chemistry.ts").getAllQuestions();
  const basic = load("src/data/chemistry-basic/index.ts").chemistryBasicComprehensiveQuestions;
  const insights = load("src/lib/learningInsights.ts").getLearningInsights({}, {});
  assert.equal(regular.length, 693); assert.equal(basic.length, 51); assert.equal(insights.totalQuestions, 744);
});
test("print quiz scope and count use real candidates without duplicate knowledge", () => {
  const select = load("src/lib/memoryQuiz.ts").selectMemoryQuizQuestions;
  for (const category of ["theory", "inorganic", "organic", "other"]) {
    const pool = candidates.filter(q => q.category === category);
    for (const count of [5, 10, 20, 30]) {
      const selected = select(pool, count, 3);
      assert.equal(selected.length, Math.min(count, new Set(pool.map(q => q.knowledgeKey)).size));
      assert.ok(selected.every(q => q.category === category));
      assert.equal(new Set(selected.map(q => q.knowledgeKey)).size, selected.length);
    }
  }
});
