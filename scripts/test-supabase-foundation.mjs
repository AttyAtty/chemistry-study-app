import test from "node:test";
import assert from "node:assert/strict";
import { loadSupabaseFoundation } from "./lib/load-supabase-foundation.mjs";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};
const healthy = () => Promise.resolve(new Response(JSON.stringify({ name: "GoTrue", version: "test" })));
function harness(options = {}) {
  const calls = [];
  const foundation = loadSupabaseFoundation({
    env: { ...valid }, fetch: healthy,
    createClient: (...args) => { calls.push(args); return { fixture: true }; },
    Response, ...options,
  });
  return { ...foundation, calls };
}

test("import is safe without environment variables; failure names only missing variables", async () => {
  let networkCalls = 0;
  const h = harness({ env: {}, fetch: () => { networkCalls++; throw new Error("unexpected"); } });
  assert.equal(h.calls.length, 0);
  assert.throws(() => h.client.getSupabaseClient(), /NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  const result = await h.connection.checkSupabaseConnection();
  assert.equal(result.code, "configuration");
  assert.equal(result.clientInitialized, false);
  assert.equal(networkCalls, 0);
});

test("only HTTPS project origin and Publishable key are accepted", () => {
  for (const url of ["broken", "http://project.supabase.co", "https://user:password@project.supabase.co",
    "https://project.supabase.co/api", "https://project.supabase.co?key=unsafe", "https://project.supabase.co/#token"]) {
    const h = harness({ env: { ...valid, NEXT_PUBLIC_SUPABASE_URL: url } });
    assert.throws(() => h.config.getSupabaseConfig(), /NEXT_PUBLIC_SUPABASE_URL/);
    assert.equal(h.calls.length, 0);
  }
  for (const key of ["sb_secret_private", "eyJservice_role", "eyJanon", "invalid", "sb_publishable_"]) {
    const h = harness({ env: { ...valid, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key } });
    assert.throws(() => h.client.getSupabaseClient(), /Publishable key/);
    assert.equal(h.calls.length, 0);
  }
});

test("valid client is lazy, reused, and has Auth persistence/refresh/OAuth disabled", () => {
  const h = harness();
  assert.equal(h.calls.length, 0);
  assert.equal(h.client.getSupabaseClient(), h.client.getSupabaseClient());
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0][0], valid.NEXT_PUBLIC_SUPABASE_URL);
  assert.equal(h.calls[0][1], valid.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0][2])), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
});

test("real SDK initializes without creating a session or requiring network", async () => {
  const h = loadSupabaseFoundation({ env: { ...valid } });
  const client = h.client.getSupabaseClient();
  assert.equal(client, h.client.getSupabaseClient());
  const { data, error } = await client.auth.getSession();
  assert.equal(error, null);
  assert.equal(data.session, null);
});

test("health check is read-only and uses apikey without Authorization or credentials", async () => {
  let request;
  const h = harness({ fetch: async (url, options) => { request = { url, options }; return healthy(); } });
  const result = await h.connection.checkSupabaseConnection();
  assert.equal(result.ok, true);
  assert.equal(request.url, "https://project.supabase.co/auth/v1/health");
  assert.equal(request.options.method, "GET");
  assert.equal(request.options.headers.apikey, valid.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  assert.equal(request.options.headers.Authorization, undefined);
  assert.equal(request.options.credentials, "omit");
  assert.equal(request.options.cache, "no-store");
  assert.equal(request.options.redirect, "error");
});

test("network and HTTP failures return safe results, never raw upstream errors/keys", async () => {
  const samples = [
    { fetch: async () => { throw new Error(valid.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }, code: "network" },
    { fetch: async () => new Response(valid.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { status: 401 }), code: "http" },
    { fetch: async () => new Response(JSON.stringify({ name: "wrong-service" })), code: "response" },
    { createClient: () => { throw new Error(valid.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }, code: "initialization" },
  ];
  for (const { code, ...options } of samples) {
    const result = await harness(options).connection.checkSupabaseConnection();
    assert.equal(result.ok, false);
    assert.equal(result.code, code);
    assert.ok(!JSON.stringify(result).includes(valid.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));
  }
});

test("timeout aborts the request and returns a recoverable failure", async () => {
  const h = harness({
    setTimeout: callback => setTimeout(callback, 1),
    fetch: (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("abort")))),
  });
  const result = await h.connection.checkSupabaseConnection();
  assert.equal(result.code, "timeout");
  assert.equal(result.clientInitialized, true);
});

test("diagnostic route does not cache or expose URL/key, and returns 503 on configuration failure", async () => {
  for (const env of [{ ...valid }, {}]) {
    const h = harness({ env });
    const response = await h.route.GET();
    assert.equal(response.status, env.NEXT_PUBLIC_SUPABASE_URL ? 200 : 503);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const text = await response.text();
    assert.ok(!text.includes(valid.NEXT_PUBLIC_SUPABASE_URL));
    assert.ok(!text.includes(valid.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));
  }
});
