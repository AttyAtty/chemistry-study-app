import nextEnv from "@next/env";
import { loadSupabaseFoundation } from "./lib/load-supabase-foundation.mjs";
nextEnv.loadEnvConfig(process.cwd());

const foundation = loadSupabaseFoundation();
const result = await foundation.connection.checkSupabaseConnection();
// Never print environment values, headers, SDK objects, or upstream response bodies.
console.log(JSON.stringify({ environment: "local", ...result }));
if (!result.ok) process.exitCode = 1;

const index = process.argv.indexOf("--production-url");
if (index !== -1) {
  try {
    const url = new URL(process.argv[index + 1]);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("invalid-url");
    const response = await fetch(new URL("/api/supabase/health", url), {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000),
    });
    if (response.status === 404) {
      console.log(JSON.stringify({ environment: "production", ok: false, code: "not-deployed",
        message: "本番に接続確認APIがまだdeployされていません。" }));
      process.exitCode = 1;
    } else {
      const data = await response.json();
      const ok = response.ok && data.ok === true && data.configured === true && data.clientInitialized === true;
      console.log(JSON.stringify({ environment: "production", ok,
        configured: data.configured === true, clientInitialized: data.clientInitialized === true,
        httpStatus: response.status }));
      if (!ok) process.exitCode = 1;
    }
  } catch {
    console.log(JSON.stringify({ environment: "production", ok: false, code: "unverified",
      message: "本番の接続確認APIにアクセスできませんでした。" }));
    process.exitCode = 1;
  }
}
