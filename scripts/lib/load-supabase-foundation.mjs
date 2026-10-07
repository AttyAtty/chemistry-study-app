// Execute the actual TS foundation in Node without writing transpiled artifacts.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createClient as sdkCreateClient } from "@supabase/supabase-js";

export function loadSupabaseFoundation(overrides = {}) {
  const modules = new Map();
  const context = vm.createContext({
    process: { env: overrides.env ?? process.env },
    URL, AbortController, setTimeout, clearTimeout,
    fetch: globalThis.fetch, ...overrides,
  });
  function load(filename) {
    const file = path.resolve(filename);
    if (modules.has(file)) return modules.get(file);
    const exports = {};
    modules.set(file, exports);
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const execute = vm.runInContext("(function(exports,require,module){" + source + "\n})", context, { filename: file });
    execute(exports, id => {
      if (id === "@supabase/supabase-js") return { createClient: overrides.createClient ?? sdkCreateClient };
      const base = id.startsWith("@/") ? path.resolve("src", id.slice(2)) : path.resolve(path.dirname(file), id);
      return load(base + ".ts");
    }, { exports });
    return exports;
  }
  return {
    config: load("src/lib/supabase/config.ts"),
    client: load("src/lib/supabase/client.ts"),
    connection: load("src/lib/supabase/connection.ts"),
    route: load("src/app/api/supabase/health/route.ts"),
  };
}
