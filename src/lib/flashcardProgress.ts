export const FLASHCARD_PROGRESS_KEY = "chemica-flashcard-progress-v1";

export type FlashcardStatus = "known" | "review";
export type FlashcardProgressEntry = { status: FlashcardStatus; lastReviewedAt: string };
export type FlashcardProgressData = Record<string, FlashcardProgressEntry>;

export function readFlashcardProgress(): FlashcardProgressData {
  if (typeof window === "undefined") return {};
  try {
    const value = window.localStorage.getItem(FLASHCARD_PROGRESS_KEY);
    return value ? JSON.parse(value) as FlashcardProgressData : {};
  } catch {
    return {};
  }
}

export function saveFlashcardStatus(cardId: string, status: FlashcardStatus): FlashcardProgressData {
  const progress = readFlashcardProgress();
  progress[cardId] = { status, lastReviewedAt: new Date().toISOString() };
  window.localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(progress));
  return progress;
}
