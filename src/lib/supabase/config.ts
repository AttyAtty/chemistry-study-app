export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseConfig() {
  // Direct references are required for Next.js to inline public browser variables.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !publishableKey && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ].filter(Boolean);
  if (missing.length) {
    throw new SupabaseConfigurationError(
      `Supabase接続設定が未設定です: ${missing.join(", ")}。ローカルは.env.local、本番はVercelの環境変数を確認してください。`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url!);
  } catch {
    throw new SupabaseConfigurationError("NEXT_PUBLIC_SUPABASE_URLには有効なHTTPSのプロジェクトURLを設定してください。");
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
      parsed.search || parsed.hash || parsed.pathname !== "/") {
    throw new SupabaseConfigurationError("NEXT_PUBLIC_SUPABASE_URLには認証情報やパスを含まないHTTPSのプロジェクトURLを設定してください。");
  }
  // Reject secret keys and legacy JWTs (including service_role and anon).
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey!)) {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYにはsb_publishable_で始まるPublishable keyのみ使用できます。Secret key / service role keyは使用できません。",
    );
  }
  return { url: parsed.origin, publishableKey: publishableKey! };
}
