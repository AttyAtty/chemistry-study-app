import type { QuizQuestion } from "@/data/chemistry";
import type { QuestionHistory } from "@/lib/questionHistory";
import { questionHistoryKey } from "@/lib/questionHistory";

export type QuizMode="random"|"review"|"unseen";
export type QuizCount=5|10|20|30|"all";
export type TestCategory="theory"|"inorganic"|"organic"|"other";
export type QuizQuestionWithUnit=QuizQuestion&{unitSlug?:string;unitTitle?:string};

export const TOTAL_TEST_CATEGORY_WEIGHTS:Record<TestCategory,number>={theory:3,inorganic:3,organic:3,other:1};
const categoryByUnit:Record<string,TestCategory>={
  "organic-reactions":"organic",
  "inorganic-reactions":"inorganic","laboratory-gases":"inorganic","colors-and-tests":"inorganic","complex-ions-qualitative-analysis":"inorganic",
  "batteries-electrolysis":"theory","ionic-equations":"theory","chemistry-basic-composition":"theory","chemistry-basic-mole-reactions":"theory","chemistry-basic-acid-base-redox":"theory",
  "industrial-processes":"other","chemistry-basic-comprehensive":"other",
};
export const getQuestionCategory=(question:QuizQuestionWithUnit,fallbackUnit:string):TestCategory=>categoryByUnit[question.unitSlug??fallbackUnit]??"other";
const shuffle=<T,>(items:T[])=>{const copy=[...items];for(let index=copy.length-1;index>0;index--){const randomIndex=Math.floor(Math.random()*(index+1));[copy[index],copy[randomIndex]]=[copy[randomIndex],copy[index]];}return copy;};

export function filterQuestionsByMode(pool:QuizQuestionWithUnit[],mode:QuizMode,history:QuestionHistory,fallbackUnit:string){
  if(mode==="random")return pool;
  return pool.filter(question=>{const item=history[questionHistoryKey(question.unitSlug??fallbackUnit,question.id)];return mode==="review"?item?.needsReview===true:!item||item.attemptCount===0;});
}

export function selectQuizQuestions(pool:QuizQuestionWithUnit[],count:QuizCount,mode:QuizMode,history:QuestionHistory,fallbackUnit:string,balanced:boolean){
  const eligible=filterQuestionsByMode(pool,mode,history,fallbackUnit);
  if(count==="all")return shuffle(eligible);
  const target=Math.min(count,eligible.length);
  if(!balanced)return shuffle(eligible).slice(0,target);
  const categories=Object.keys(TOTAL_TEST_CATEGORY_WEIGHTS) as TestCategory[],weightTotal=categories.reduce((sum,category)=>sum+TOTAL_TEST_CATEGORY_WEIGHTS[category],0);
  const groups=Object.fromEntries(categories.map(category=>[category,shuffle(eligible.filter(question=>getQuestionCategory(question,fallbackUnit)===category))])) as Record<TestCategory,QuizQuestionWithUnit[]>;
  const quotas=Object.fromEntries(categories.map(category=>[category,Math.floor(target*TOTAL_TEST_CATEGORY_WEIGHTS[category]/weightTotal)])) as Record<TestCategory,number>;
  let assigned=Object.values(quotas).reduce((sum,value)=>sum+value,0);
  for(const category of categories.sort((a,b)=>TOTAL_TEST_CATEGORY_WEIGHTS[b]-TOTAL_TEST_CATEGORY_WEIGHTS[a])){if(assigned>=target)break;quotas[category]++;assigned++;}
  const selected=categories.flatMap(category=>groups[category].splice(0,Math.min(quotas[category],groups[category].length)));
  const remainder=shuffle(categories.flatMap(category=>groups[category])).slice(0,target-selected.length);
  return shuffle([...selected,...remainder]);
}
