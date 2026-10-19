"use client";
import { useState } from "react";
import { formulas,formulaCategories } from "@/data/illustrated/formulas";
import { StudyLink } from "../StudyLink";
import { FormulaExpression,FormulaCard } from "./FormulaSection";
import { isMasked,TableField } from "./LessonField";
import { MathText } from "./MathExpression";
import { Sheet } from "./DiagramParts";

export function FormulaCatalogue(){
 const [mode,setMode]=useState("learn"),[showAnswers,setShowAnswers]=useState(false),[category,setCategory]=useState("all"),[detail,setDetail]=useState("");
 const selected=formulas.find(f=>f.id===detail),view={exercise:{blankIds:mode==="learn"?[]:formulas.flatMap(f=>[f.rhs.id,f.example.solution.id])},showAnswers};
 return <>
  <StudyLink href="/units/theory-chemistry" className="back-link">← 理論化学の全体へ</StudyLink>
  <header className="unit-content-heading"><p className="eyebrow">FORMULAS / CALCULATIONS</p><h1>理論化学 重要公式まとめ</h1><p>式を先に見て、記号・単位・使いどころ・計算例へ進めます。</p><nav className="illustrated-lesson-nav"><StudyLink href="/theory/practice">典型例題・練習問題 →</StudyLink><StudyLink href="/illustrated/energy-map">エネルギー変化の総まとめ図 →</StudyLink></nav></header>
  <div className="illustrated-tools"><label htmlFor="formula-category">カテゴリ</label><select id="formula-category" value={category} onChange={e=>{setCategory(e.target.value);setDetail("");}}><option value="all">すべて</option>{formulaCategories.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><label htmlFor="formula-mode">表示・問題形式</label><select id="formula-mode" value={mode} onChange={e=>{setMode(e.target.value);setShowAnswers(false);}}><option value="learn">通常表示</option><option value="all">公式・計算穴埋め</option></select><button className="button" disabled={mode==="learn"} onClick={()=>setShowAnswers(!showAnswers)}>{showAnswers?"問題に戻す":"答えを表示"}</button><button className="button" onClick={()=>setDetail("")}>まとめ表示</button><button className="button" onClick={()=>window.print()}>印刷</button><p>カテゴリごとにA4印刷できます。mL→L、℃→K、分→秒に直し、Rと単位をそろえます。</p></div>
  <div className="illustrated-print-area formula-catalogue">
   {selected?<Sheet title={`重要公式・計算 ― ${selected.title}`} className="formula-sheet"><FormulaCard formula={selected} view={view}/></Sheet>:formulaCategories.filter(c=>category==="all"||c.id===category).map(c=><Sheet key={c.id} id={`formula-category-${c.id}`} title={`理論化学重要公式 ― ${c.title}`} className="formula-summary-sheet"><div className="illustrated-table-scroll"><table className="illustrated-table formula-summary"><thead><tr><th>公式</th><th>記号・単位・使う場面</th><th>短い計算例</th></tr></thead><tbody>{formulas.filter(f=>f.category===c.id).map(f=><tr key={f.id} id={`formula-${f.id}`} data-summary-formula={f.id}>
    <td><strong>{f.title}</strong><div className="formula-block"><FormulaExpression formula={f} view={view}/></div><div className="no-print"><button className="button" onClick={()=>setDetail(f.id)}>解説</button> <StudyLink href={f.href}>図へ →</StudyLink> <StudyLink href={`/theory/practice#formula-${f.id}`}>例題 →</StudyLink></div></td>
    <td>{f.symbols.map(s=><div key={s.symbol}><strong>{s.symbol}</strong>：{s.meaning}<small>［{s.unit}］</small></div>)}<small>{f.use}</small><small>注意：{f.mistake}</small></td>
    <td><p>{f.example.question}</p>{isMasked(view,f.example.solution)?<div className="theory-answer-line"><TableField field={f.example.solution} view={view}/></div>:<div className="formula-summary-calculation"><MathText text={f.example.substitution}/><strong><MathText text={f.example.answer}/></strong></div>}</td>
   </tr>)}</tbody></table></div><p className="formula-unit-note">mL ÷ 1000 → L ／ ℃ + 273.15 → K ／ 分 × 60 → s。指定された定数と有効数字を優先。</p></Sheet>)}</div>
 </>;
}
