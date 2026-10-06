import { LEARNING_KEYS } from "./learningStorage";
import { readRepositoryData as readLearningData, updateRepositoryData as updateLearningData } from "./learningRepository";
import { canonicalId } from "./learningIds";
export const FLASHCARD_PROGRESS_KEY = LEARNING_KEYS[0];
export const FLASHCARD_REVIEW_INTERVAL_DAYS = [1,3,7,14] as const;
export const FLASHCARD_SESSION_RETRY_LIMIT = 2;

export type FlashcardStatus = "known" | "review";
export type FlashcardResult = "remembered" | "forgot";
export type FlashcardProgressEntry = {
  status: FlashcardStatus;
  lastReviewedAt: string;
  reviewStep?: number;
  nextReviewAt?: string;
  lastResult?: FlashcardResult;
  rememberedCount?: number;
  forgotCount?: number;
};
export type FlashcardProgressData = Record<string, FlashcardProgressEntry>;

export function readFlashcardProgress(): FlashcardProgressData { return readLearningData<FlashcardProgressData>(FLASHCARD_PROGRESS_KEY); }

export function addLocalDaysAtMidnight(now:Date,days:number){const result=new Date(now.getFullYear(),now.getMonth(),now.getDate()+days,0,0,0,0);return result;}
export function isFlashcardDue(entry:FlashcardProgressEntry|undefined,now=new Date()){
  if(!entry)return false;
  if(entry.status==="review"||entry.lastResult==="forgot")return true;
  return Boolean(entry.nextReviewAt)&&new Date(entry.nextReviewAt!).getTime()<=now.getTime();
}
export function getDueFlashcards<T extends {id:string}>(cards:T[],progress:FlashcardProgressData,now=new Date()){return cards.filter(card=>isFlashcardDue(progress[card.id],now));}
export function getNewFlashcards<T extends {id:string}>(cards:T[],progress:FlashcardProgressData){return cards.filter(card=>!progress[card.id]);}
export function getForgottenFlashcards<T extends {id:string}>(cards:T[],progress:FlashcardProgressData){return cards.filter(card=>progress[card.id]?.status==="review"||progress[card.id]?.lastResult==="forgot");}

export function scheduleFlashcardReview(previous:FlashcardProgressEntry|undefined,result:FlashcardResult,now=new Date()):FlashcardProgressEntry{
  const rememberedCount=(previous?.rememberedCount??0)+(result==="remembered"?1:0),forgotCount=(previous?.forgotCount??0)+(result==="forgot"?1:0);
  if(result==="forgot")return{...previous,status:"review",reviewStep:-1,lastReviewedAt:now.toISOString(),nextReviewAt:now.toISOString(),lastResult:result,rememberedCount,forgotCount};
  const previousStep=typeof previous?.reviewStep==="number"?previous.reviewStep:-1;
  const reviewStep=Math.min(previousStep+1,FLASHCARD_REVIEW_INTERVAL_DAYS.length-1);
  return{...previous,status:"known",reviewStep,lastReviewedAt:now.toISOString(),nextReviewAt:addLocalDaysAtMidnight(now,FLASHCARD_REVIEW_INTERVAL_DAYS[reviewStep]).toISOString(),lastResult:result,rememberedCount,forgotCount};
}

export function saveFlashcardStatus(cardId:string,status:FlashcardStatus,now=new Date()) {
  cardId = canonicalId(FLASHCARD_PROGRESS_KEY, cardId);
  return updateLearningData<FlashcardProgressData>(FLASHCARD_PROGRESS_KEY, progress => {
    if (!cardId || (status !== "known" && status !== "review") || Number.isNaN(now.getTime())) throw new Error("Invalid card result");
    const previous = Object.prototype.hasOwnProperty.call(progress, cardId) ? progress[cardId] : undefined;
    return { ...progress, [cardId]: scheduleFlashcardReview(previous, status === "known" ? "remembered" : "forgot", now) };
  });
}
