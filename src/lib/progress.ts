import { LEARNING_KEYS, readLearningData, updateLearningData } from "./learningStorage";
export const PROGRESS_KEY = LEARNING_KEYS[2];
export type UnitProgress = { attempts: number; correct: number; total: number; bestPercent: number; lastStudied: string };
export type ProgressData = Record<string, UnitProgress>;
export function readProgress(): ProgressData { return readLearningData<ProgressData>(PROGRESS_KEY); }
export function saveQuizResult(unitSlug: string, correct: number, total: number) {
  return updateLearningData<ProgressData>(PROGRESS_KEY, current => {
    if (!unitSlug || !Number.isSafeInteger(correct) || !Number.isSafeInteger(total) || correct < 0 || total < 0 || correct > total) throw new Error("Invalid result");
    const old = Object.prototype.hasOwnProperty.call(current, unitSlug) ? current[unitSlug] : { attempts: 0, correct: 0, total: 0, bestPercent: 0, lastStudied: "" };
    const percent = total === 0 ? 0 : Math.round(correct / total * 100);
    return { ...current, [unitSlug]: { ...old, attempts: old.attempts + 1, correct: old.correct + correct, total: old.total + total, bestPercent: Math.max(old.bestPercent, percent), lastStudied: new Date().toISOString() } };
  });
}
// Phase 1 intentionally offers no reset/remove operation.
