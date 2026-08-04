export const QUESTION_HISTORY_KEY = "chemistry-question-history-v1";

export type QuestionHistoryItem = {
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  lastAnsweredAt: string;
  needsReview: boolean;
};
export type QuestionHistory = Record<string, QuestionHistoryItem>;

const emptyItem=():QuestionHistoryItem=>({attemptCount:0,correctCount:0,incorrectCount:0,lastAnsweredAt:"",needsReview:false});
export const questionHistoryKey=(unitSlug:string,questionId:string)=>`${unitSlug}::${questionId}`;

export function readQuestionHistory():QuestionHistory {
  if(typeof window==="undefined")return {};
  try{
    const parsed=JSON.parse(window.localStorage.getItem(QUESTION_HISTORY_KEY)??"{}");
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return {};
    return Object.fromEntries(Object.entries(parsed).filter(([,value])=>value&&typeof value==="object").map(([key,value])=>{
      const item=value as Partial<QuestionHistoryItem>;
      return [key,{attemptCount:Number.isFinite(item.attemptCount)?Math.max(0,item.attemptCount!):0,correctCount:Number.isFinite(item.correctCount)?Math.max(0,item.correctCount!):0,incorrectCount:Number.isFinite(item.incorrectCount)?Math.max(0,item.incorrectCount!):0,lastAnsweredAt:typeof item.lastAnsweredAt==="string"?item.lastAnsweredAt:"",needsReview:item.needsReview===true}];
    }));
  }catch{return {};}
}

export function recordQuestionAnswer(unitSlug:string,questionId:string,correct:boolean){
  if(typeof window==="undefined")return;
  const history=readQuestionHistory(),key=questionHistoryKey(unitSlug,questionId),old=history[key]??emptyItem();
  history[key]={attemptCount:old.attemptCount+1,correctCount:old.correctCount+(correct?1:0),incorrectCount:old.incorrectCount+(correct?0:1),lastAnsweredAt:new Date().toISOString(),needsReview:!correct};
  window.localStorage.setItem(QUESTION_HISTORY_KEY,JSON.stringify(history));
}

export function getReviewQuestionCount(history=readQuestionHistory()){return Object.values(history).filter(item=>item.needsReview).length;}
