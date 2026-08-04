import { chemistryUnits, getAllQuestions } from "@/data/chemistry";
import { chemistryBasicComprehensiveQuestions } from "@/data/chemistry-basic";
import { getFlashcardsForUnit } from "@/data/flashcards";
import type { FlashcardProgressData } from "@/lib/flashcardProgress";
import { questionHistoryKey, type QuestionHistory } from "@/lib/questionHistory";

export const MIN_WEAK_UNIT_ATTEMPTED_QUESTIONS=3;

type UnitPerformance={unitSlug:string;unitTitle:string;attemptedQuestions:number;answerCount:number;correctCount:number;accuracy:number;needsReviewCount:number};
type FlashcardUnitProgress={unitSlug:string;unitTitle:string;knownCount:number;reviewCount:number};

const questionUnits=[
  ...chemistryUnits.map(unit=>({slug:unit.slug,title:unit.shortTitle,questions:unit.questions})),
  {slug:"chemistry-basic-comprehensive",title:"化学基礎 総合",questions:chemistryBasicComprehensiveQuestions},
];

export function getUnitPerformance(history:QuestionHistory):UnitPerformance[]{
  return questionUnits.map(unit=>{
    const entries=unit.questions.map(question=>history[questionHistoryKey(unit.slug,question.id)]).filter(Boolean);
    const attemptedQuestions=entries.filter(item=>item.attemptCount>0).length;
    const answerCount=entries.reduce((sum,item)=>sum+item.attemptCount,0);
    const correctCount=entries.reduce((sum,item)=>sum+item.correctCount,0);
    return {unitSlug:unit.slug,unitTitle:unit.title,attemptedQuestions,answerCount,correctCount,accuracy:answerCount?Math.round(correctCount/answerCount*100):0,needsReviewCount:entries.filter(item=>item.needsReview).length};
  });
}

export function getWeakUnits(history:QuestionHistory,minimum=MIN_WEAK_UNIT_ATTEMPTED_QUESTIONS){
  return getUnitPerformance(history).filter(unit=>unit.attemptedQuestions>=minimum).sort((a,b)=>a.accuracy-b.accuracy||b.needsReviewCount-a.needsReviewCount).slice(0,5);
}

export function getFlashcardUnitProgress(progress:FlashcardProgressData):FlashcardUnitProgress[]{
  return chemistryUnits.map(unit=>{
    const cards=getFlashcardsForUnit(unit);
    return {unitSlug:unit.slug,unitTitle:unit.shortTitle,knownCount:cards.filter(card=>progress[card.id]?.status==="known").length,reviewCount:cards.filter(card=>progress[card.id]?.status==="review").length};
  }).filter(unit=>unit.knownCount+unit.reviewCount>0);
}

export function getLearningInsights(history:QuestionHistory,flashProgress:FlashcardProgressData){
  const trackedQuestions=[...getAllQuestions(),...chemistryBasicComprehensiveQuestions.map(question=>({...question,unitSlug:"chemistry-basic-comprehensive"}))];
  const answeredQuestions=trackedQuestions.filter(question=>(history[questionHistoryKey(question.unitSlug??"all",question.id)]?.attemptCount??0)>0).length;
  const reviewQuestions=trackedQuestions.filter(question=>history[questionHistoryKey(question.unitSlug??"all",question.id)]?.needsReview===true).length;
  const flashcardUnits=getFlashcardUnitProgress(flashProgress);
  return {totalQuestions:trackedQuestions.length,answeredQuestions,unseenQuestions:Math.max(0,trackedQuestions.length-answeredQuestions),reviewQuestions,knownCards:flashcardUnits.reduce((sum,unit)=>sum+unit.knownCount,0),reviewCards:flashcardUnits.reduce((sum,unit)=>sum+unit.reviewCount,0),flashcardUnits,unitPerformance:getUnitPerformance(history),weakUnits:getWeakUnits(history)};
}
