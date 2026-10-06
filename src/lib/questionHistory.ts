import { LEARNING_KEYS } from "./learningStorage";
import { readRepositoryData as readLearningData, updateRepositoryData as updateLearningData } from "./learningRepository";
import { canonicalId } from "./learningIds";
export const QUESTION_HISTORY_KEY = LEARNING_KEYS[1];
export type QuestionHistoryItem = { attemptCount: number; correctCount: number; incorrectCount: number; lastAnsweredAt: string; needsReview: boolean };
export type QuestionHistory = Record<string, QuestionHistoryItem>;
const emptyItem = (): QuestionHistoryItem => ({ attemptCount: 0, correctCount: 0, incorrectCount: 0, lastAnsweredAt: "", needsReview: false });
export const questionHistoryKey = (unitSlug: string, questionId: string) => canonicalId(QUESTION_HISTORY_KEY, `${unitSlug}::${questionId}`);
export function readQuestionHistory(): QuestionHistory { return readLearningData<QuestionHistory>(QUESTION_HISTORY_KEY); }
export function recordQuestionAnswer(unitSlug: string, questionId: string, correct: boolean) {
  return updateLearningData<QuestionHistory>(QUESTION_HISTORY_KEY, history => {
    if (!unitSlug || !questionId || typeof correct !== "boolean") throw new Error("Invalid answer");
    const key = questionHistoryKey(unitSlug, questionId);
    const old = Object.prototype.hasOwnProperty.call(history, key) ? history[key] : emptyItem();
    return { ...history, [key]: { ...old, attemptCount: old.attemptCount + 1, correctCount: old.correctCount + (correct ? 1 : 0), incorrectCount: old.incorrectCount + (correct ? 0 : 1), lastAnsweredAt: new Date().toISOString(), needsReview: !correct } };
  });
}
export function getReviewQuestionCount(history = readQuestionHistory()) { return Object.values(history).filter(item => item.needsReview).length; }
