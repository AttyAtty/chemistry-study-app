// One-time source editing. Never run this against user storage.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
if (fs.existsSync("src/data/learningIdMigrationMap.ts")) throw new Error("Fixed IDs already exist; never regenerate the released migration map.");
const files = ["src/data/chemistry.ts","src/data/theoryChemistry.ts","src/data/inorganicComplexes.ts","src/data/chemistry-basic/composition.ts","src/data/chemistry-basic/mole-and-reactions.ts","src/data/chemistry-basic/acid-base-redox.ts","src/data/chemistry-basic/questions-comprehensive.ts"];
const semantic = text => text.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"");
for (const file of files) {
 const source = fs.readFileSync(file,"utf8");
 const ast = ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
 const edits=[], seen = new Set(), groups=new Map();
 const props = node => new Map(node.properties.filter(ts.isPropertyAssignment).map(p=>[p.name.getText(ast).replace(/['"]/g,""),p.initializer]));
 function localId(label,group) { const key=group+":"+label; const number=(groups.get(key)??0)+1; groups.set(key,number); return semantic(label)+(number>1?"-"+number:""); }
 function row(node,group) {
  if (!ts.isArrayLiteralExpression(node) || !node.elements.length || !ts.isStringLiteralLike(node.elements[0]) || seen.has(node.pos)) return;
  seen.add(node.pos); const id=localId(node.elements[0].text,group);
  edits.push({ start:node.getStart(ast),end:node.getStart(ast),text:"learningRow("+JSON.stringify(id)+", " });
  edits.push({ start:node.end,end:node.end,text:")" });
 }
 function visit(node) {
  if (ts.isObjectLiteralExpression(node)) {
   const p=props(node);
   if (!p.has("learningId") && p.has("term") && p.has("definition") && ts.isStringLiteralLike(p.get("term"))) {
    edits.push({start:node.getStart(ast)+1,end:node.getStart(ast)+1,text:" learningId: "+JSON.stringify(localId(p.get("term").text,node.parent.pos))+", "});
   } else if (!p.has("learningId") && p.has("title") && (p.has("body") || p.has("nodes")) && ts.isStringLiteralLike(p.get("title"))) {
    edits.push({start:node.getStart(ast)+1,end:node.getStart(ast)+1,text:" learningId: "+JSON.stringify(localId(p.get("title").text,node.parent.pos))+", "});
   }
   if (p.has("rows") && ts.isArrayLiteralExpression(p.get("rows"))) for (const item of p.get("rows").elements) row(item,p.get("rows").pos);
  }
  if (ts.isCallExpression(node) && node.expression.getText(ast)==="table" && ts.isArrayLiteralExpression(node.arguments[4])) for (const item of node.arguments[4].elements) row(item,node.pos);
  ts.forEachChild(node,visit);
 }
 visit(ast);
 let changed=source;
 for(const e of edits.sort((a,b)=>b.start-a.start)) changed=changed.slice(0,e.start)+e.text+changed.slice(e.end);
 if(edits.some(e=>e.text.startsWith("learningRow("))) changed='import { learningRow } from "@/data/learningContentIds";\n'+changed;
 fs.writeFileSync(file,changed,"utf8");
 console.log(file+" fixed source identities: "+edits.length);
}
fs.writeFileSync("src/data/learningContentIds.ts",`/** IDs are fixed source literals. Keep them when editing display text. */
export type LearningRow = string[] & { learningId: string };
export function learningRow(learningId: string, cells: string[]): LearningRow {
  return Object.assign(cells, { learningId });
}
`,"utf8");
let file="src/data/inorganicKnowledge.ts", s=fs.readFileSync(file,"utf8");
s='import { learningRow } from "@/data/learningContentIds";\n'+s;
s=s.replace('map(x=>[x.name,x.formula,x.aliases?.join("・")||"—",x.properties?.join("・")||"—"])','map(x=>learningRow(x.id,[x.name,x.formula,x.aliases?.join("・")||"—",x.properties?.join("・")||"—"]))');
s=s.replace('map(r=>[r.processName!,r.reactants.join(" + "),r.products.join(" + "),[...(r.conditions??[]),r.catalyst?\x60触媒：\x24{r.catalyst}\x60:"",r.description??""].filter(Boolean).join("・")])','map(r=>learningRow(r.id,[r.processName!,r.reactants.join(" + "),r.products.join(" + "),[...(r.conditions??[]),r.catalyst?\x60触媒：\x24{r.catalyst}\x60:"",r.description??""].filter(Boolean).join("・")]))');
fs.writeFileSync(file,s,"utf8");
file="src/data/chemistry.ts"; s=fs.readFileSync(file,"utf8").replace('export type CardEntry = {','export type CardEntry = {\n  learningId?: string;').replace('export type FlowEntry = {','export type FlowEntry = {\n  learningId?: string;'); fs.writeFileSync(file,s,"utf8");
file="src/data/chemistry-basic/helpers.ts"; s=fs.readFileSync(file,"utf8").replace('export type BasicFact = {','export type BasicFact = {\n  learningId: string;');
s=s.replace('    const explanation =', '    if (!fact.learningId) throw new Error("Basic facts require a fixed learningId");\n    const explanation =');
s=s.replace('${prefix}-${index}-a','${prefix}-${fact.learningId}-definition').replace('${prefix}-${index}-b','${prefix}-${fact.learningId}-term').replace('${prefix}-${index}-c','${prefix}-${fact.learningId}-truth'); fs.writeFileSync(file,s,"utf8");
file="src/data/flashcards.ts";s=fs.readFileSync(file,"utf8");s='import type { LearningRow } from "@/data/learningContentIds";\n'+s;
s=s.replace('id: `\x24{unit.slug}-\x24{section.id}-card-\x24{index}`,','id: entry.learningId ? `flash-\x24{unit.slug}-\x24{section.id}-\x24{entry.learningId}` : `\x24{unit.slug}-\x24{section.id}-card-\x24{index}`,');
s=s.replace('        const label = row[0];','        const label = row[0];\n        const rowId = (row as LearningRow).learningId;\n        const cardId = rowId ? `flash-\x24{unit.slug}-\x24{section.id}-\x24{rowId}` : `\x24{unit.slug}-\x24{section.id}-row-\x24{index}`;');
s=s.replace('id: `\x24{unit.slug}-\x24{section.id}-row-\x24{index}`,','id: cardId,').replace('id: `\x24{unit.slug}-\x24{section.id}-row-\x24{index}-reverse`,','id: `\x24{cardId}-reverse`,');
s=s.replace('id: `\x24{unit.slug}-\x24{section.id}-flow-\x24{index}`,','id: flow.learningId ? `flash-\x24{unit.slug}-\x24{section.id}-\x24{flow.learningId}` : `\x24{unit.slug}-\x24{section.id}-flow-\x24{index}`,'); fs.writeFileSync(file,s,"utf8");
const cache=new Map();
function load(filename){const f=path.resolve(filename);if(cache.has(f))return cache.get(f);const exports={},loadedModule={exports};cache.set(f,exports); const code=ts.transpileModule(fs.readFileSync(f,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,module:loadedModule,require(id){const base=id.startsWith("@/")?path.resolve("src",id.slice(2)):path.resolve(path.dirname(f),id);return load(fs.existsSync(base+".ts")?base+".ts":path.join(base,"index.ts"));}},{filename:f});return loadedModule.exports;}
const baseline=JSON.parse(fs.readFileSync("docs/verification/phase1-id-baseline.json","utf8"));
const units=load("src/data/chemistry.ts").chemistryUnits, getCards=load("src/data/flashcards.ts").getFlashcardsForUnit;
const current=[...units.map(u=>({slug:u.slug,questions:u.questions,flashcards:getCards(u)})),{slug:"chemistry-basic-comprehensive",questions:load("src/data/chemistry-basic/index.ts").chemistryBasicComprehensiveQuestions,flashcards:[]}];
const maps={version:1,migrationId:"stable-learning-ids-v2",questionIds:{},questionHistory:{},flashcards:{},unitSlugs:{}};
for(const old of baseline.units){
 const now=current.find(u=>u.slug===old.slug);if(!now||now.questions.length!==old.questions.length||now.flashcards.length!==old.flashcards.length)throw Error("Curriculum count changed: "+old.slug);
 old.questions.forEach((q,i)=>{const n=now.questions[i];if(q.prompt!==n.prompt)throw Error("Question content changed");if(q.id!==n.id){maps.questionIds[q.id]=n.id;maps.questionHistory[q.historyKey]=old.slug+"::"+n.id;}});
 old.flashcards.forEach((c,i)=>{const n=now.flashcards[i];if(c.front!==n.front||c.back!==n.back)throw Error("Card content changed: "+c.id);if(c.id!==n.id)maps.flashcards[c.id]=n.id;});
}
const newIds=current.flatMap(u=>u.flashcards.map(c=>c.id));if(new Set(newIds).size!==newIds.length)throw Error("Duplicate stable card IDs");
fs.writeFileSync("src/data/learningIdMigrationMap.ts","/** Frozen Phase 1 -> Phase 2 aliases. Never regenerate from reordered content. */\nexport const learningIdMigrationMap = "+JSON.stringify(maps,null,2)+" as const;\n","utf8");
console.log(JSON.stringify({questions:Object.keys(maps.questionHistory).length,cards:Object.keys(maps.flashcards).length,remainingIndexCards:newIds.filter(id=>/-(card|row|flow)-[0-9]+(-reverse)?$/.test(id))}));
