import {StudyLink} from "../StudyLink";
import type {BlankView} from "../separation/ExerciseField";
import {formulasForLesson,type FormulaRecord} from "@/data/illustrated/formulas";
import {TableField,isMasked} from "./LessonField";
import {Sheet} from "./DiagramParts";

export function FormulaExpression({formula,view}:{formula:FormulaRecord;view:BlankView}){return <span className="formula-expression">{formula.prefix}<TableField field={formula.rhs} view={view}/></span>;}
export function FormulaCard({formula:f,view}:{formula:FormulaRecord;view:BlankView}){
 const masked=isMasked(view,f.rhs)||isMasked(view,f.example.solution);
 return <article className="formula-card" id={`formula-${f.id}`} data-formula-id={f.id}><h3>{f.title}</h3><div className="theory-answer-line"><FormulaExpression formula={f} view={view}/></div>
  <dl className="formula-symbols">{f.symbols.map(s=><div key={s.symbol}><dt>{s.symbol}</dt><dd>{s.meaning} <span>［{s.unit}］</span></dd></div>)}</dl>
  <p><strong>使う場面：</strong>{f.use}</p><p><strong>図との対応：</strong>{f.diagram}</p>
  <div className="formula-example"><strong>例</strong><p>{f.example.question}</p><p><strong>使う式：</strong><FormulaExpression formula={f} view={view}/></p>
   {masked?<div className="theory-answer-line"><strong>代入・答え：</strong><TableField field={f.example.solution} view={view}/></div>:<div data-revealed-id={view.exercise.blankIds.includes(f.example.solution.id)?f.example.solution.id:undefined}><p><strong>代入：</strong>{f.example.substitution}</p><p><strong>答え：</strong>{f.example.answer}</p></div>}
  </div>{!masked&&<p className="formula-mistake"><strong>よくある間違い：</strong>{f.mistake}</p>}
  <StudyLink className="no-print" href={f.href}>対応する教材・図へ →</StudyLink>
 </article>;
}
export function FormulaSection({lesson,view}:{lesson:string;view:BlankView}){
 const items=formulasForLesson(lesson);
 return <>{Array.from({length:Math.ceil(items.length/2)},(_,index)=><Sheet title={`重要公式・計算${items.length>2?` ${index+1}`:""}`} className="formula-sheet" key={index}>{items.slice(index*2,index*2+2).map(f=><FormulaCard key={f.id} formula={f} view={view}/>)}<p className="formula-unit-note">単位を先に統一：mL ÷ 1000 → L ／ ℃ + 273.15 → K ／ 分 × 60 → s</p></Sheet>)}</>;
}
