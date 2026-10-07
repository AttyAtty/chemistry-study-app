import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let client: SupabaseClient | undefined;

/**
 * Lazy initialization: importing this module never requires Supabase configuration
 * or a network connection. Local learning must not depend on this client.
 * Phase 4 foundation only: Auth session persistence and OAuth handling are disabled.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const { url, publishableKey } = getSupabaseConfig();
  client = createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}

let browserClient: SupabaseClient | undefined;
async function boundedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (init?.signal?.aborted) controller.abort();
  init?.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 15000);
  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store", credentials: "omit", redirect: "error" });
  } finally {
    clearTimeout(timer);
    init?.signal?.removeEventListener("abort", abort);
  }
}
/** Static public pages use browser Auth only; no session or user data in SSR HTML. */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") throw new Error("Browser Auth client is available in the browser only.");
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseConfig();
    browserClient = createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false,
        storageKey: "chemica-supabase-auth-v1", flowType: "pkce" },
      global: { fetch: boundedFetch },
    });
  }
  return browserClient;
}
/** Per-request captured user JWT; never reuse a server user's session singleton. */
export function getSupabaseRequestClient(accessToken: string): SupabaseClient {
  const { url, publishableKey } = getSupabaseConfig();
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    accessToken: async () => accessToken,
    global: { fetch: boundedFetch },
  });
}
