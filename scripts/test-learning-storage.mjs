import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createContext, runInContext } from "node:vm";
import { randomUUID } from "node:crypto";
import test from "node:test";
import ts from "typescript";
class MemoryStorage {
  values = new Map(); writes = []; removes = []; fault = null; readFault = false;
  getItem(key) { if (this.readFault) throw new Error("SecurityError"); return this.values.get(key) ?? null; }
  setItem(key, value) { if (this.fault?.(key, value)) throw new Error("QuotaExceededError"); this.writes.push(key); this.values.set(key, String(value)); }
  removeItem(key) { if (this.fault?.(key, null)) throw new Error("SecurityError"); this.removes.push(key); this.values.delete(key); }
}
function harness() {
  const modules = new Map(), store = new MemoryStorage();
  const context = createContext({ console, queueMicrotask, crypto: { randomUUID }, window: { localStorage: store } });
  function load(path) {
    const file = resolve(path); if (modules.has(file)) return modules.get(file);
    const exports = {}; modules.set(file, exports);
    const code = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const execute = runInContext(`(function(exports,require,module){${code}\n})`, context, { filename: file });
    execute(exports, id => {
      const base = id.startsWith("@/") ? resolve("src", id.slice(2)) : resolve(dirname(file), id);
      return load(existsSync(base + ".ts") ? base + ".ts" : resolve(base, "index.ts"));
    }, { exports });
    return exports;
  }
  return { store, context, load, api: load("src/lib/learningStorage.ts"), flash: load("src/lib/flashcardProgress.ts"), question: load("src/lib/questionHistory.ts"), progress: load("src/lib/progress.ts") };
}
const K = ["chemica-flashcard-progress-v1", "chemistry-question-history-v1", "chemistry-study-progress-v1"];
const time = "2026-10-05T00:00:00.000Z";
function seed(store, legacy = false) {
  store.values.set(K[0], JSON.stringify({ "gas-h2-color": legacy ? { status: "known", lastReviewedAt: time, extra: { retained: true } } : { status: "review", lastReviewedAt: time, reviewStep: -1, nextReviewAt: time, lastResult: "forgot", rememberedCount: 2, forgotCount: 1, extra: { retained: true } } }));
  store.values.set(K[1], JSON.stringify({ "laboratory-gases::gas-1": { attemptCount: 3, correctCount: 2, incorrectCount: 1, lastAnsweredAt: time, needsReview: true, futureField: "keep" } }));
  store.values.set(K[2], JSON.stringify({ "laboratory-gases": { attempts: 1, correct: 2, total: 3, bestPercent: 67, lastStudied: time, futureField: "keep" } }));
}
const raw = store => K.map(key => store.getItem(key));
function target(h) {
  const backup = h.api.exportLearningBackup("0.2.0").value;
  backup.data[K[0]] = JSON.stringify({ "another-card": { status: "known", lastReviewedAt: time } });
  backup.data[K[1]] = JSON.stringify({ "other::q": { attemptCount: 1, correctCount: 1, incorrectCount: 0, lastAnsweredAt: time, needsReview: false } });
  backup.data[K[2]] = JSON.stringify({ other: { attempts: 1, correct: 1, total: 1, bestPercent: 100, lastStudied: time } });
  return JSON.stringify(backup);
}
test("existing records read without writes", () => {
  const h = harness(); seed(h.store); const before = raw(h.store);
  assert.equal(h.flash.readFlashcardProgress()["gas-h2-color"].status, "review");
  assert.equal(h.question.readQuestionHistory()["laboratory-gases::gas-1"].attemptCount, 3);
  assert.equal(h.progress.readProgress()["laboratory-gases"].attempts, 1);
  assert.deepEqual(raw(h.store), before); assert.equal(h.store.writes.length, 0);
});
test("legacy flashcard fields remain compatible without migration", () => {
  const h = harness(); seed(h.store, true);
  assert.equal(h.flash.readFlashcardProgress()["gas-h2-color"].reviewStep, undefined);
  assert.equal(h.flash.saveFlashcardStatus("gas-h2-color", "known").ok, true);
  const entry = JSON.parse(h.store.getItem(K[0]))["gas-h2-color"];
  assert.equal(entry.reviewStep, 0); assert.equal(entry.extra.retained, true);
});
test("no existing data: fallback does not initialize storage; valid first answer saves", () => {
  const h = harness();
  for (const reader of [h.flash.readFlashcardProgress, h.question.readQuestionHistory, h.progress.readProgress]) assert.equal(Object.keys(reader()).length, 0);
  assert.equal(h.store.writes.length, 0);
  assert.equal(h.question.recordQuestionAnswer("unit", "q", true).ok, true);
});
test("damaged JSON remains raw; export works; update is refused", () => {
  const h = harness(); seed(h.store); h.store.values.set(K[0], "{broken"); const before = raw(h.store);
  assert.equal(Object.keys(h.flash.readFlashcardProgress()).length, 0);
  assert.equal(h.flash.saveFlashcardStatus("new", "known").ok, false);
  assert.equal(h.api.exportLearningBackup("0.2.0").value.data[K[0]], "{broken");
  assert.deepEqual(raw(h.store), before); assert.equal(h.store.removes.length, 0);
});
test("invalid entries allow display fallback but cannot be silently dropped on save", () => {
  const h = harness(); seed(h.store); const r = JSON.parse(h.store.getItem(K[0])); r.bad = null;
  h.store.values.set(K[0], JSON.stringify(r)); const before = raw(h.store);
  assert.equal(Object.keys(h.flash.readFlashcardProgress()).length, 1);
  assert.equal(h.flash.saveFlashcardStatus("gas-h2-color", "known").ok, false);
  assert.deepEqual(raw(h.store), before);
});
test("normal writes retain unknown fields and IDs", () => {
  const h = harness(); seed(h.store);
  assert.equal(h.question.recordQuestionAnswer("laboratory-gases", "gas-1", true).ok, true);
  assert.equal(JSON.parse(h.store.getItem(K[1]))["laboratory-gases::gas-1"].futureField, "keep");
  assert.equal(h.progress.saveQuizResult("laboratory-gases", 1, 2).ok, true);
  assert.equal(JSON.parse(h.store.getItem(K[2]))["laboratory-gases"].futureField, "keep");
  assert.equal(h.flash.saveFlashcardStatus("new-card", "review").ok, true);
  assert.equal(JSON.parse(h.store.getItem(K[0]))["gas-h2-color"].forgotCount, 1);
});
test("backup contains schema/version/time and all raw keys, without writes", () => {
  const h = harness(); seed(h.store); const b = h.api.exportLearningBackup("0.2.0").value;
  assert.equal(b.schemaVersion, 1); assert.equal(b.appVersion, "0.2.0"); assert.ok(Date.parse(b.exportedAt));
  assert.deepEqual(K.map(key => b.data[key]), raw(h.store)); assert.equal(h.store.writes.length, 0);
});
test("restore verifies and archives before replacing; original bytes survive", () => {
  const h = harness(); seed(h.store); const before = raw(h.store), text = target(h);
  const p = h.api.prepareRestore(text, "0.2.0"); assert.equal(p.ok, true);
  assert.deepEqual(raw(h.store), before); assert.ok(h.store.writes[0].startsWith(h.api.BACKUP_KEY_PREFIX));
  assert.equal(h.api.applyRestore(p.value).ok, true);
  assert.deepEqual(raw(h.store), K.map(key => JSON.parse(text).data[key]));
  assert.deepEqual(K.map(key => JSON.parse(h.store.getItem(p.value.backupKey)).data[key]), before);
  assert.equal(JSON.parse(h.store.getItem(h.api.RESTORE_JOURNAL_KEY)).status, "committed");
  assert.equal(h.store.removes.length, 0);
});
for (const [name, change] of [
  ["invalid JSON", () => "{broken"],
  ["other format", b => { b.format = "other"; return JSON.stringify(b); }],
  ["schema mismatch", b => { b.schemaVersion = 2; return JSON.stringify(b); }],
  ["missing key", b => { delete b.data[K[1]]; return JSON.stringify(b); }],
  ["wrong raw type", b => { b.data[K[1]] = {}; return JSON.stringify(b); }],
  ["wrong entry type", b => { b.data[K[1]] = JSON.stringify({ bad: { attemptCount: "1" } }); return JSON.stringify(b); }],
  ["null record", b => { b.data[K[0]] = "null"; return JSON.stringify(b); }],
  ["invalid stage", b => { b.data[K[0]] = JSON.stringify({ bad: { status: "known", lastReviewedAt: time, reviewStep: 99 } }); return JSON.stringify(b); }],
  ["empty backup", b => { for (const key of K) b.data[key] = "{}"; return JSON.stringify(b); }],
]) test(`reject ${name} without any write`, () => {
  const h = harness(); seed(h.store); const before = raw(h.store);
  assert.equal(h.api.prepareRestore(change(h.api.exportLearningBackup("0.2.0").value), "0.2.0").ok, false);
  assert.deepEqual(raw(h.store), before); assert.equal(h.store.writes.length, 0);
});
test("empty/null source items keep current data", () => {
  const h = harness(); seed(h.store); const before = raw(h.store), b = JSON.parse(target(h)); b.data[K[1]] = null; b.data[K[2]] = "{}";
  const p = h.api.prepareRestore(JSON.stringify(b), "0.2.0");
  assert.equal(h.api.applyRestore(p.value).ok, true);
  assert.equal(h.store.getItem(K[1]), before[1]); assert.equal(h.store.getItem(K[2]), before[2]); assert.equal(h.store.removes.length, 0);
});
test("invalid updates, null/undefined, NaN, cycles and deletions never overwrite", () => {
  const h = harness(); seed(h.store); const before = raw(h.store);
  for (const update of [() => null, () => undefined, () => ({}), () => { throw new Error("failure"); },
    r => { r["gas-h2-color"].rememberedCount = NaN; return r; },
    r => { r["gas-h2-color"].extra = undefined; return r; },
    r => { r["gas-h2-color"].self = r; return r; }]) assert.equal(h.api.updateLearningData(K[0], update).ok, false);
  assert.deepEqual(raw(h.store), before);
  assert.equal(h.progress.saveQuizResult("unit", -1, 2).ok, false);
  assert.equal(h.flash.saveFlashcardStatus("new", "invalid").ok, false);
});
test("stringify failure cannot replace source", () => {
  const h = harness(); seed(h.store); const before = raw(h.store);
  runInContext('JSON.stringify = () => { throw new Error("failure"); }', h.context);
  assert.equal(h.question.recordQuestionAnswer("unit", "q", true).ok, false); assert.deepEqual(raw(h.store), before);
});
test("quota and private-mode failures preserve existing storage", () => {
  const h = harness(); seed(h.store); const before = raw(h.store); h.store.fault = () => true;
  assert.equal(h.flash.saveFlashcardStatus("new", "known").ok, false); assert.deepEqual(raw(h.store), before);
  h.store.readFault = true;
  assert.equal(Object.keys(h.progress.readProgress()).length, 0);
  assert.equal(h.question.recordQuestionAnswer("unit", "q", true).ok, false);
  assert.equal(h.api.exportLearningBackup("0.2.0").ok, false);
  h.store.readFault = false; assert.deepEqual(raw(h.store), before); assert.equal(h.store.removes.length, 0);
});
test("auto-backup failure aborts before touching learning data", () => {
  const h = harness(); seed(h.store); const text = target(h), before = raw(h.store);
  h.store.fault = key => key.startsWith(h.api.BACKUP_KEY_PREFIX);
  assert.equal(h.api.prepareRestore(text, "0.2.0").ok, false); assert.deepEqual(raw(h.store), before);
});
test("journal failure before applying leaves learning data unchanged", () => {
  const h = harness(); seed(h.store); const before = raw(h.store), p = h.api.prepareRestore(target(h), "0.2.0");
  h.store.fault = key => key === h.api.RESTORE_JOURNAL_KEY;
  assert.equal(h.api.applyRestore(p.value).ok, false); assert.deepEqual(raw(h.store), before);
});
test("mid-restore failure rolls back exact original bytes", () => {
  const h = harness(); seed(h.store); const before = raw(h.store), p = h.api.prepareRestore(target(h), "0.2.0"); let failed = false;
  h.store.fault = key => key === K[1] && !failed && (failed = true);
  assert.equal(h.api.applyRestore(p.value).ok, false); assert.deepEqual(raw(h.store), before); assert.equal(h.store.removes.length, 0);
});
test("commit failure rolls back instead of publishing partial data", () => {
  const h = harness(); seed(h.store); const before = raw(h.store), p = h.api.prepareRestore(target(h), "0.2.0");
  h.store.fault = (key, value) => key === h.api.RESTORE_JOURNAL_KEY && JSON.parse(value).status === "committed";
  assert.equal(h.api.applyRestore(p.value).ok, false); assert.deepEqual(raw(h.store), before);
});
test("rollback failure survives reload: reads original, blocks saves, exports and recovers original", () => {
  const h = harness(); seed(h.store); const before = raw(h.store), p = h.api.prepareRestore(target(h), "0.2.0"); let failed = false;
  h.store.fault = (key, value) => { if (key === K[1] && !failed) { failed = true; return true; } return failed && key === K[0] && value === before[0]; };
  assert.equal(h.api.applyRestore(p.value).ok, false);
  assert.equal(JSON.parse(h.store.getItem(h.api.RESTORE_JOURNAL_KEY)).status, "pending");
  const reloaded = harness(); reloaded.store.values = new Map(h.store.values);
  assert.equal(reloaded.flash.readFlashcardProgress()["gas-h2-color"].status, "review");
  assert.equal(reloaded.flash.saveFlashcardStatus("new", "known").ok, false);
  assert.equal(reloaded.api.exportLearningBackup("0.2.0").value.data[K[0]], before[0]);
  assert.equal(reloaded.api.recoverPendingRestore().ok, true); assert.deepEqual(raw(reloaded.store), before);
});
test("rollback only removes a newly created key, never a pre-existing key", () => {
  const h = harness(); const before = raw(h.store), p = h.api.prepareRestore(target(h), "0.2.0"); let failed = false;
  h.store.fault = key => key === K[1] && !failed && (failed = true);
  assert.equal(h.api.applyRestore(p.value).ok, false); assert.deepEqual(raw(h.store), before); assert.deepEqual(h.store.removes, [K[0]]);
});
test("change during user confirmation aborts without overwriting new data", () => {
  const h = harness(); seed(h.store); const p = h.api.prepareRestore(target(h), "0.2.0");
  assert.equal(h.question.recordQuestionAnswer("new", "q", true).ok, true); const before = raw(h.store);
  assert.equal(h.api.applyRestore(p.value).ok, false); assert.deepEqual(raw(h.store), before);
});
test("damaged original is archived verbatim before a valid restore", () => {
  const h = harness(); seed(h.store); const text = target(h); h.store.values.set(K[0], "{broken");
  const p = h.api.prepareRestore(text, "0.2.0"); assert.equal(h.api.applyRestore(p.value).ok, true);
  assert.equal(JSON.parse(h.store.getItem(p.value.backupKey)).data[K[0]], "{broken");
});
test("spaced repetition, due/new cards and needsReview remain functional", () => {
  const h = harness(), now = runInContext('new Date("2026-10-05T00:00:00Z")', h.context);
  const a = h.flash.scheduleFlashcardReview(undefined, "remembered", now);
  assert.equal(a.reviewStep, 0); assert.equal(a.rememberedCount, 1);
  const b = h.flash.scheduleFlashcardReview(a, "forgot", now);
  assert.equal(b.reviewStep, -1); assert.equal(h.flash.isFlashcardDue(b, now), true);
  assert.equal(h.flash.getNewFlashcards([{ id: "x" }], {}).length, 1);
  h.question.recordQuestionAnswer("u", "q", false); assert.equal(h.question.getReviewQuestionCount(), 1);
  h.question.recordQuestionAnswer("u", "q", true); assert.equal(h.question.getReviewQuestionCount(), 0);
});

test("safe-count overflow is refused without overwriting", () => {
  const h = harness(); seed(h.store);
  const r = JSON.parse(h.store.getItem(K[1])); r["laboratory-gases::gas-1"].attemptCount = Number.MAX_SAFE_INTEGER;
  h.store.values.set(K[1], JSON.stringify(r)); const before = raw(h.store);
  assert.equal(h.question.recordQuestionAnswer("laboratory-gases", "gas-1", true).ok, false);
  assert.deepEqual(raw(h.store), before);
});
test("prototype-like IDs and unknown fields survive normal writes", () => {
  const h = harness();
  assert.equal(h.flash.saveFlashcardStatus("__proto__", "known").ok, true);
  assert.equal(h.flash.saveFlashcardStatus("constructor", "review").ok, true);
  const r = JSON.parse(h.store.getItem(K[0]));
  assert.equal(Object.hasOwn(r, "__proto__"), true);
  assert.equal(r.__proto__.status, "known"); assert.equal(r.constructor.status, "review");
});
test("malformed journal blocks writes without altering legacy values", () => {
  const h = harness(); seed(h.store); const before = raw(h.store), text = target(h);
  h.store.values.set(h.api.RESTORE_JOURNAL_KEY, "{broken");
  assert.equal(h.progress.saveQuizResult("unit", 1, 1).ok, false);
  assert.equal(h.api.prepareRestore(text, "0.2.0").ok, false);
  assert.deepEqual(raw(h.store), before);
});
test("rollback does not overwrite a concurrent external edit", () => {
  const h = harness(); seed(h.store); const p = h.api.prepareRestore(target(h), "0.2.0"); let failed = false;
  const concurrent = JSON.stringify({ external: { attempts: 1, correct: 1, total: 1, bestPercent: 100, lastStudied: time } });
  h.store.fault = key => {
    if (key === K[1] && !failed) { failed = true; h.store.values.set(K[2], concurrent); return true; }
    return false;
  };
  assert.equal(h.api.applyRestore(p.value).ok, false);
  assert.equal(h.api.recoverPendingRestore().ok, false);
  assert.equal(h.store.getItem(K[2]), concurrent);
  assert.ok(h.store.getItem(p.value.backupKey));
});

test("real curriculum insights retain today's review, unseen and weak-unit calculations", () => {
  const h = harness();
  const { chemistryUnits } = h.load("src/data/chemistry.ts");
  const { getFlashcardsForUnit } = h.load("src/data/flashcards.ts");
  const { getLearningInsights } = h.load("src/lib/learningInsights.ts");
  const unit = chemistryUnits.find(u => u.questions.length >= 3 && getFlashcardsForUnit(u).length);
  for (const question of unit.questions.slice(0, 3)) {
    assert.equal(h.question.recordQuestionAnswer(unit.slug, question.id, false).ok, true);
  }
  const card = getFlashcardsForUnit(unit)[0];
  assert.equal(h.flash.saveFlashcardStatus(card.id, "review").ok, true);
  const insights = getLearningInsights(h.question.readQuestionHistory(), h.flash.readFlashcardProgress());
  assert.equal(insights.answeredQuestions, 3);
  assert.equal(insights.unseenQuestions, insights.totalQuestions - 3);
  assert.equal(insights.reviewQuestions, 3);
  assert.equal(insights.dueCards, 1);
  assert.ok(insights.weakUnits.some(u => u.unitSlug === unit.slug && u.accuracy === 0));
});
