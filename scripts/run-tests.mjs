import fs from "node:fs";
import { spawnSync } from "node:child_process";

const tests = fs.readdirSync("scripts").filter((file) => /^test-.*\.mjs$/.test(file)).sort().map((file) => `scripts/${file}`);
const result = spawnSync(process.execPath, ["--test", ...tests], { stdio: "inherit", shell: false });
process.exitCode = result.status ?? 1;
