export const FEEDBACK_TYPES = ["質問", "教材内容の誤り", "不具合報告", "改善提案", "感想・レビュー", "その他"] as const;
export type FeedbackType = typeof FEEDBACK_TYPES[number];

export const FEEDBACK_CONTENT_MIN = 10;
export const FEEDBACK_CONTENT_MAX = 4000;

export const isFeedbackType = (value: unknown): value is FeedbackType => typeof value === "string" && (FEEDBACK_TYPES as readonly string[]).includes(value);
export const isValidEmail = (value: string) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function normalizeSourceUrl(value: unknown) {
  if (typeof value !== "string" || !value || value.length > 1000) return "";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}
