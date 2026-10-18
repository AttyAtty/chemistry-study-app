import type { AnswerCategory, AnswerField } from "../data/illustrated/types";
export const inorganicModes:{id:string;label:string;categories:AnswerCategory[]}[]=[
  {id:"learn",label:"通常表示",categories:[]}, {id:"all",label:"全体穴埋め",categories:[]},
  {id:"names",label:"元素・物質・電極",categories:["element","species","electrode"]},
  {id:"properties",label:"色・反応範囲・酸化還元",categories:["color","range","redox"]},
  {id:"process",label:"試薬・製法・捕集・電子移動",categories:["reagent","collection","preparation","detection","electron","half-reaction"]},
];
export function createInorganicExercise(fields:AnswerField[],mode:string) {
  const selected=inorganicModes.find(m=>m.id===mode);
  return {blankIds:fields.filter(f=>f.blankable&&mode!=="learn"&&!!selected&&(mode==="all"||selected.categories.includes(f.blankCategory))).map(f=>f.id)};
}
