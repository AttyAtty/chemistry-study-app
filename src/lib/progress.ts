export const PROGRESS_KEY = "chemistry-study-progress-v1";

export type UnitProgress = {
  attempts: number;
  correct: number;
  total: number;
  bestPercent: number;
  lastStudied: string;
};

export type ProgressData = Record<string, UnitProgress>;

export function readProgress(): ProgressData {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ProgressData) : {};
  } catch {
    return {};
  }
}

export function saveQuizResult(unitSlug: string, correct: number, total: number) {
  const current = readProgress();
  const old = current[unitSlug] ?? {
    attempts: 0,
    correct: 0,
    total: 0,
    bestPercent: 0,
    lastStudied: "",
  };
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  current[unitSlug] = {
    attempts: old.attempts + 1,
    correct: old.correct + correct,
    total: old.total + total,
    bestPercent: Math.max(old.bestPercent, percent),
    lastStudied: new Date().toISOString(),
  };

  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
}

export function resetProgress() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PROGRESS_KEY);
  }
}
