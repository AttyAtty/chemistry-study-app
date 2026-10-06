import fs from "node:fs";
import { randomUUID } from "node:crypto";
const file="src/lib/pwaBuild.ts";
if(!process.argv.includes("--check")||!fs.existsSync(file)){
 const id=process.argv.includes("--dev")?"development":randomUUID();
 fs.writeFileSync(file,'// Generated before build; never use for learning-data schema.\nexport const PWA_BUILD_ID = '+JSON.stringify(id)+';\n');
}
