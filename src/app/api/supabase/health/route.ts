import { checkSupabaseConnection } from "@/lib/supabase/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// On-demand diagnostic only. Do not call from the learning startup/offline path.
export async function GET() {
  const result = await checkSupabaseConnection();
  return Response.json(result, {
    status: result.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
