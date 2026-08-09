import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { FEEDBACK_CONTENT_MAX, FEEDBACK_CONTENT_MIN, isFeedbackType, isValidEmail, normalizeSourceUrl } from "@/lib/feedback";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;
const attempts = new Map<string, number[]>();

const getClientKey = (request: NextRequest) => {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return createHash("sha256").update(forwarded || request.headers.get("x-real-ip") || "unknown").digest("hex");
};

const isRateLimited = (key: string, now: number) => {
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return true;
  attempts.set(key, [...recent, now]);
  if (attempts.size > 1000) for (const [entry, times] of attempts) if (!times.some((time) => now - time < WINDOW_MS)) attempts.delete(entry);
  return false;
};

const jsonError = (message: string, status: number) => NextResponse.json({ ok: false, message }, { status });

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("入力内容を確認してください。", 400);
  }

  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const now = Date.now();
  const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
  if (!startedAt || now - startedAt < 1500 || now - startedAt > 24 * 60 * 60 * 1000) return jsonError("入力内容を確認してください。", 400);
  if (isRateLimited(getClientKey(request), now)) return jsonError("短時間に複数回送信されています。時間をおいて再度お試しください。", 429);

  const type = body.type;
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const sourceUrl = normalizeSourceUrl(body.sourceUrl);
  if (!isFeedbackType(type)) return jsonError("問い合わせ種類を選択してください。", 400);
  if (content.length < FEEDBACK_CONTENT_MIN || content.length > FEEDBACK_CONTENT_MAX) return jsonError(`内容は${FEEDBACK_CONTENT_MIN}～${FEEDBACK_CONTENT_MAX}文字で入力してください。`, 400);
  if (email && !isValidEmail(email)) return jsonError("メールアドレスの形式を確認してください。", 400);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CHEMICA_FEEDBACK_TO_EMAIL;
  const from = process.env.CHEMICA_FEEDBACK_FROM_EMAIL;
  if (!apiKey || !to || !from) return jsonError("送信できませんでした。時間をおいて再度お試しください。", 503);

  const sentAt = new Date().toISOString();
  const text = ["Chemica フィードバック", "", `種類：\n${type}`, "", `内容：\n${content}`, "", `返信先：\n${email || "なし"}`, "", `対象ページ：\n${sourceUrl || "不明"}`, "", `送信日時：\n${sentAt}`].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": randomUUID() },
      body: JSON.stringify({ from, to: [to], subject: `[Chemica] ${type}`, text, ...(email ? { reply_to: email } : {}) }),
      cache: "no-store",
    });
    if (!response.ok) return jsonError("送信できませんでした。時間をおいて再度お試しください。", 502);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("送信できませんでした。時間をおいて再度お試しください。", 502);
  }
}
