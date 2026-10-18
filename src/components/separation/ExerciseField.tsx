import type { SeparationExercise } from "@/lib/separationExercise";
import type { DiagramTextPart } from "@/data/separation/types";

export type ExerciseView = { exercise: SeparationExercise; showAnswers: boolean };
function textWidth(text:string,fontSize:number) {
  return [...text].reduce((sum,c)=>sum+(c.charCodeAt(0)>255 ? fontSize : fontSize*.58),0);
}

export function SvgBlank({ fieldId, x, y, width, anchor = "start", view }: {
  fieldId: string; x: number; y: number; width: number; anchor?: "start" | "middle" | "end"; view: ExerciseView;
}) {
  const number = view.exercise.blankIds.indexOf(fieldId) + 1;
  const start = anchor === "middle" ? x-width/2 : anchor === "end" ? x-width : x;
  return <g data-blank-id={fieldId} role="img" aria-label={`空欄${number}`} className="separation-blank">
    <title>空欄{number}</title>
    <text x={start+2} y={y-4} className="separation-blank-number">{number}</text>
    <path d={`M${start},${y+3} h${width}`} />
  </g>;
}

export function ExerciseText({ fieldId, x, y, text, className, fontSize=18, maxWidth, anchor="start", view, kind }: {
  fieldId: string; x: number; y: number; text: string; className?: string; fontSize?: number;
  maxWidth?: number; anchor?: "start" | "middle" | "end"; view?: ExerciseView; kind?: string;
}) {
  const selected = view?.exercise.blankIds.includes(fieldId) ?? false;
  // Width comes only from presentation size, never from answer matching/classification.
  const width = kind === "phrase" ? maxWidth ?? 240 : Math.min(maxWidth ?? 240, Math.max(25, textWidth(text,fontSize)));
  if (selected && view && !view.showAnswers) return <SvgBlank fieldId={fieldId} x={x} y={y} width={width} anchor={anchor} view={view}/>;
  return <text style={kind === "phrase" ? {fontSize} : undefined}
    textLength={kind === "phrase" && textWidth(text,fontSize)>width ? width : undefined} lengthAdjust="spacingAndGlyphs"
    data-field-id={fieldId} data-field-kind={kind} data-revealed-id={selected ? fieldId : undefined}
    className={`${className ?? ""}${selected ? " separation-answer" : ""}`} x={x} y={y} textAnchor={anchor}>{text}</text>;
}

export function ExerciseTextParts({parts,x,y,view}:{parts:DiagramTextPart[];x:number;y:number;view:ExerciseView}) {
  return <ExerciseText fieldId={parts[0].id} text={parts.map(part=>part.text).join("")} x={x} y={y} anchor="middle" maxWidth={250} view={view}/>;
}

export function ExerciseHeading({fieldId,parts,x,y,view,hideHint=false}:{fieldId:string;parts:{prefix:string;answer:string;suffix:string};x:number;y:number;view:ExerciseView;hideHint?:boolean}) {
  const width=90, prefixWidth=textWidth(parts.prefix,17), suffixWidth=textWidth(parts.suffix,17);
  const start=x-(prefixWidth+width+suffixWidth)/2;
  return <g className="separation-problem-heading" style={{fontSize:17}}>
    <text x={start} y={y}>{parts.prefix}</text>
    {hideHint && !view.showAnswers && !view.exercise.blankIds.includes(fieldId)
      ? <path data-masked-hint={fieldId} d={`M${start+prefixWidth+4},${y+3} h${width-8}`} stroke="#304b6d" strokeWidth={1.5}/>
      : <ExerciseText fieldId={fieldId} text={parts.answer} x={start+prefixWidth+width/2} y={y} anchor="middle" maxWidth={width-8} view={view}/>}
    <text x={start+prefixWidth+width} y={y}>{parts.suffix}</text>
  </g>;
}

export function HtmlExerciseField({ fieldId, text, view }: {fieldId:string; text:string; view:ExerciseView}) {
  const number = view.exercise.blankIds.indexOf(fieldId) + 1;
  if (number && !view.showAnswers) return <span className="separation-html-blank" data-blank-id={fieldId} aria-label={`空欄${number}`}><small>{number}</small><span aria-hidden="true">　　　　　　　　　</span></span>;
  return <span data-field-id={fieldId} data-revealed-id={number ? fieldId : undefined} className={number ? "separation-answer" : undefined}>{text}</span>;
}
