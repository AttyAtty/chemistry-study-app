"use client";
import { useState } from "react";
import { StudyLink } from "../StudyLink";
import { theoryLessons, theorySources, type TheorySlug } from "@/data/illustrated/theory";
import { createTheoryExercise, theoryModes } from "@/lib/theoryModels";
import { SolubilityLesson, VaporLesson, HenryLesson } from "./TheoryDiagrams";

export function TheoryLesson({slug,notes=[]}:{slug:TheorySlug;notes?:string[]}) {
 const [mode,setMode]=useState("learn"),[showAnswers,setShowAnswers]=useState(false),[zoom,setZoom]=useState(false),[preview,setPreview]=useState(false);
 const [solTemperature,setSolTemperature]=useState(20),[vaporTemperature,setVaporTemperature]=useState(80),[externalPressure,setExternalPressure]=useState(101.325),[henryPressure,setHenryPressure]=useState(3);
 const lesson=theoryLessons.find(l=>l.slug===slug)!,view={exercise:createTheoryExercise(slug,mode),showAnswers};
 return <><StudyLink className="back-link" href="/units/theory-chemistry">← 理論化学</StudyLink>
  <header className="unit-content-heading"><p className="eyebrow">VISUAL CHEMISTRY / THEORY</p><h1>{lesson.title}</h1><p>{lesson.description}</p></header>
  <nav className="illustrated-lesson-nav" aria-label="理論図解教材">{theoryLessons.map(l=><StudyLink key={l.slug} href={`/illustrated/${l.slug}`} aria-current={l.slug===slug?"page":undefined}>{l.title}</StudyLink>)}</nav>
  <div className="illustrated-tools"><label htmlFor="theory-mode">表示・問題形式</label><select id="theory-mode" value={mode} onChange={e=>{setMode(e.target.value);setShowAnswers(false);}}>{theoryModes.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select>
   <button className="button" disabled={mode==="learn"} onClick={()=>setShowAnswers(!showAnswers)}>{showAnswers?"問題に戻す":"答えを表示"}</button><button className="button" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?"全体表示":"拡大表示"}</button><button className="button" aria-pressed={preview} onClick={()=>setPreview(!preview)}>A4プレビュー</button><button className="button" onClick={()=>window.print()}>印刷</button>
   <p aria-live="polite">{mode==="learn"?"現象 → グラフ → 説明 → 数値例。グラフは説明用の模式データです。":`${view.exercise.blankIds.length}項目を意味のある句で出題します。`}</p>
  </div><div className={`illustrated-print-area theory-material ${zoom?"is-zoomed":""} ${preview?"is-a4-preview":""}`}>
   {slug==="solubility"&&<SolubilityLesson view={view} temperature={solTemperature} onTemperature={setSolTemperature} notes={notes}/>}
   {slug==="vapor-pressure"&&<VaporLesson view={view} temperature={vaporTemperature} pressure={externalPressure} onTemperature={setVaporTemperature} onPressure={setExternalPressure}/>}
   {slug==="henry"&&<HenryLesson view={view} pressure={henryPressure} onPressure={setHenryPressure}/>}
  </div><details className="illustrated-sources no-print"><summary>数値・図の扱いと確認資料</summary><p>図・曲線・粒子数は説明用の模式表現です。実在物質の実測値ではありません。1 atm = 101.325 kPaは単位換算です。資料へのリンクを開かずに、閲覧・操作・問題化・印刷できます。</p>{theorySources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></p>)}</details>
 </>;
}
