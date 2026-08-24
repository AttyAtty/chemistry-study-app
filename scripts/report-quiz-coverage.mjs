import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root=process.cwd(),cache=new Map();
function resolveModule(id,from){
  if(id.startsWith("@/"))return path.join(root,"src",id.slice(2));
  if(id.startsWith("."))return path.resolve(path.dirname(from),id);
  return undefined;
}
function load(file){
  const resolved=[file,`${file}.ts`,`${file}.tsx`,path.join(file,"index.ts")].find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());
  if(!resolved)return{};
  if(cache.has(resolved))return cache.get(resolved).exports;
  const loadedModule={exports:{}};cache.set(resolved,loadedModule);
  const source=fs.readFileSync(resolved,"utf8");
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const context={exports:loadedModule.exports,module:loadedModule,console,require:(id)=>{const target=resolveModule(id,resolved);return target?load(target):{}},process};
  vm.runInNewContext(code,context,{filename:resolved});
  return loadedModule.exports;
}

const {chemistryUnits}=load(path.join(root,"src/data/chemistry.ts"));
const report=chemistryUnits.map(unit=>{
  const tags=[...new Set(unit.questions.flatMap(question=>question.tags))];
  return{slug:unit.slug,title:unit.shortTitle,questions:unit.questions.length,categories:tags.length,tags:tags.join(" / "),sections:unit.sections.length};
});
const problems=[];
for(const unit of chemistryUnits){
  const ids=new Set(),prompts=new Set();
  for(const question of unit.questions){
    const normalized=question.prompt.normalize("NFKC").replace(/[\s？?。]/g,"");
    if(ids.has(question.id))problems.push(`${unit.slug}: duplicate id ${question.id}`);else ids.add(question.id);
    if(prompts.has(normalized))problems.push(`${unit.slug}: duplicate prompt ${question.prompt}`);else prompts.add(normalized);
    if(question.choices[question.answerIndex]===undefined)problems.push(`${unit.slug}: invalid answer ${question.id}`);
  }
}
console.table(report.map(({slug,title,questions,categories,sections})=>({slug,title,questions,categories,sections})));
for(const unit of report)console.log(`\n${unit.slug}\n  ${unit.tags}`);
if(problems.length){console.error(`\nCoverage audit errors:\n${problems.join("\n")}`);process.exitCode=1;}else console.log("\nQuiz IDs, prompts and answer indexes are valid.");
