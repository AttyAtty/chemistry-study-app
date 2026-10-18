import type { AnswerCategory, AnswerField, LessonSlug, Polymer, Sugar } from "../data/illustrated/types";

export function collectLessonFields(items:(Polymer|Sugar)[]):AnswerField[] {
  const fields=new Map<string,AnswerField>();
  const add=(item:AnswerField)=>{if(item.blankable)fields.set(item.id,item);};
  for(const item of items) {
    add(item.name);
    if("monomers" in item) {item.monomers.forEach(m=>add(m.name));add(item.method);}
    else {
      add(item.composition);add(item.reducing);add(item.hydrolysis);
      if(item.cyclic) {
        add(item.cyclic.configuration);add(item.cyclic.anomericPosition);
        for(const group of item.cyclic.primary.groups)if(group.answer)add(group.answer);
      }
    }
  }
  return [...fields.values()];
}
export const lessonModes:Record<LessonSlug,{id:string;label:string;categories:AnswerCategory[]}[]>={
  polymers:[
    {id:"learn",label:"学習表示",categories:[]},
    {id:"monomer",label:"モノマーを答える",categories:["monomer"]},
    {id:"polymer",label:"高分子名を答える",categories:["polymer"]},
    {id:"polymerization",label:"重合形式を答える",categories:["polymerization"]},
    {id:"all",label:"まとめて穴埋め",categories:["monomer","polymer","polymerization"]},
  ],
  carbohydrates:[
    {id:"learn",label:"学習表示",categories:[]},
    {id:"sugar",label:"糖名を答える",categories:["sugar","composition","hydrolysis"]},
    {id:"carbonyl",label:"アルドース・ケトースを答える",categories:["carbonyl-type"]},
    {id:"configuration",label:"OHの配置を答える（構造ヒントあり）",categories:["stereochemistry"]},
    {id:"structure",label:"構造ラベル・アノマー位置を答える",categories:["structure-label","anomeric-position"]},
    {id:"composition",label:"構成単糖を答える",categories:["composition","hydrolysis"]},
    {id:"reducing",label:"還元性を答える",categories:["reducing"]},
    {id:"hydrolysis",label:"加水分解生成物を答える",categories:["hydrolysis","composition"]},
    {id:"all",label:"まとめて穴埋め",categories:["sugar","composition","reducing","hydrolysis","carbonyl-type","stereochemistry","structure-label","anomeric-position"]},
  ],
};
/** Explicit categories, shared IDs across figures/tables; no string or chemical-name matching. */
export function createLessonExercise(fields:AnswerField[],slug:LessonSlug,mode:string) {
  const selected=lessonModes[slug].find(item=>item.id===mode);
  if(!selected)throw new Error("問題形式を選んでください。");
  return {schemaVersion:1 as const,lessonId:slug,mode,
    blankIds:fields.filter(f=>f.blankable && selected.categories.includes(f.blankCategory)).map(f=>f.id)};
}
