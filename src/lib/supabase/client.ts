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
