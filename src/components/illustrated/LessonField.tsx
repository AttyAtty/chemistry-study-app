import type { AnswerField } from "@/data/illustrated/types";
import { ExerciseText, HtmlExerciseField, type BlankView } from "@/components/separation/ExerciseField";

export function SvgField({field,x,y,width=320,view,anchor="middle"}:{field:AnswerField;x:number;y:number;width?:number;view:BlankView;anchor?:"start"|"middle"}) {
  return <ExerciseText fieldId={field.id} text={field.text} x={x} y={y} maxWidth={width} anchor={anchor} kind="phrase" fontSize={19} view={view}/>;
}
export function TableField({field,view}:{field:AnswerField;view:BlankView}) {return <HtmlExerciseField fieldId={field.id} text={field.text} view={view}/>;}
export function isMasked(view:BlankView,field:AnswerField) {return !view.showAnswers && view.exercise.blankIds.includes(field.id);}
