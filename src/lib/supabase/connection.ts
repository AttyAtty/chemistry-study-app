import { getSupabaseClient } from "./client";
import { getSupabaseConfig, SupabaseConfigurationError } from "./config";

export type SupabaseConnectionResult =
  | { ok: true; configured: true; clientInitialized: true }
  | { ok: false; configured: boolean; clientInitialized: boolean;
      code: "configuration" | "initialization" | "http" | "response" | "timeout" | "network";
      message: string; upstreamStatus?: number };

/** Explicit, read-only project health check. No table, user, session, or sync writes. */
export async function checkSupabaseConnection(): Promise<SupabaseConnectionResult> {
  let config: ReturnType<typeof getSupabaseConfig>;
  try {
    config = getSupabaseConfig();
  } catch (error) {
    return {
      ok: false, configured: false, clientInitialized: false, code: "configuration",
      message: error instanceof SupabaseConfigurationError ? error.message : "Supabase接続設定を読み込めませんでした。",
    };
  }
  try {
    getSupabaseClient();
  } catch {
    return { ok: false, configured: true, clientInitialized: false, code: "initialization",
      message: "Supabase clientを初期化できませんでした。ローカル学習は引き続き利用できます。" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${config.url}/auth/v1/health`, {
      method: "GET",
      headers: { apikey: config.publishableKey, Accept: "application/json" },
      credentials: "omit", cache: "no-store", redirect: "error", signal: controller.signal,
    });
    if (!response.ok) {
      return { ok: false, configured: true, clientInitialized: true, code: "http",
        upstreamStatus: response.status,
        message: "Supabase projectへの接続を確認できませんでした。URL・Publishable key・プロジェクトの稼働状態を確認してください。" };
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("name" in data) || data.name !== "GoTrue") {
      return { ok: false, configured: true, clientInitialized: true, code: "response",
        message: "Supabase projectから期待した接続確認応答を取得できませんでした。" };
    }
    return { ok: true, configured: true, clientInitialized: true };
  } catch {
    return { ok: false, configured: true, clientInitialized: true,
      code: controller.signal.aborted ? "timeout" : "network",
      message: controller.signal.aborted ? "Supabase接続確認がタイムアウトしました。ローカル学習は引き続き利用できます。" :
        "Supabaseに接続できませんでした。ローカル学習は引き続き利用できます。" };
  } finally {
    clearTimeout(timer);
  }
}
