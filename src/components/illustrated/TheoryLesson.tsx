"use client";
import { useState } from "react";
import { StudyLink } from "../StudyLink";
import { theoryLessons, theorySources, type TheorySlug } from "@/data/illustrated/theory";
import { createTheoryExercise, theoryModes } from "@/lib/theoryModels";
import { SolubilityLesson, VaporLesson, HenryLesson } from "./TheoryDiagrams";
import { AcidBaseLesson, TitrationLesson, IndicatorLesson, BufferLesson } from "./AcidBaseDiagrams";
import { EquilibriumLesson, KineticsLesson } from "./EquilibriumKineticsDiagrams";
import {ThermochemistryLesson} from "./ThermochemistryDiagrams";
import {FormulaSection} from "./FormulaSection";
import {EnergyMap} from "./EnergyMap";

export function TheoryLesson({slug,notes=[]}:{slug:TheorySlug;notes?:string[]}) {
 const [mode,setMode]=useState("learn"),[showAnswers,setShowAnswers]=useState(false),[zoom,setZoom]=useState(false),[preview,setPreview]=useState(false);
 const [solTemperature,setSolTemperature]=useState(20),[vaporTemperature,setVaporTemperature]=useState(80),[externalPressure,setExternalPressure]=useState(101.325),[henryPressure,setHenryPressure]=useState(3);
 const [titrationVolume,setTitrationVolume]=useState(0),[indicatorId,setIndicatorId]=useState("phenolphthalein"),[added,setAdded]=useState(1);
 const lesson=theoryLessons.find(l=>l.slug===slug)!,view={exercise:createTheoryExercise(slug,mode),showAnswers};
 return <><StudyLink className="back-link" href="/units/theory-chemistry">← 理論化学</StudyLink>
  <header className="unit-content-heading"><p className="eyebrow">VISUAL CHEMISTRY / THEORY</p><h1>{lesson.title}</h1><p>{lesson.description}</p></header>
  <nav className="illustrated-lesson-nav" aria-label="理論図解教材">{theoryLessons.map(l=><StudyLink key={l.slug} href={`/illustrated/${l.slug}`} aria-current={l.slug===slug?"page":undefined}>{l.title}</StudyLink>)}</nav>
  <div className="illustrated-tools"><label htmlFor="theory-mode">表示・問題形式</label><select id="theory-mode" value={mode} onChange={e=>{setMode(e.target.value);setShowAnswers(false);}}>{theoryModes.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select>
   <button className="button" disabled={mode==="learn"} onClick={()=>setShowAnswers(!showAnswers)}>{showAnswers?"問題に戻す":"答えを表示"}</button><button className="button" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?"全体表示":"拡大表示"}</button><button className="button" aria-pressed={preview} onClick={()=>setPreview(!preview)}>A4プレビュー</button><button className="button" onClick={()=>window.print()}>印刷</button>
   <p aria-live="polite">{mode==="learn"?"現象 → グラフ → 説明 → 数値例。模式図と条件を指定した計算モデルを区別して学びます。":`${view.exercise.blankIds.length}項目を意味のある句で出題します。`}</p>
  </div><div className={`illustrated-print-area theory-material ${zoom?"is-zoomed":""} ${preview?"is-a4-preview":""}`}>
   {slug==="solubility"&&<SolubilityLesson view={view} temperature={solTemperature} onTemperature={setSolTemperature} notes={notes}/>}
   {slug==="vapor-pressure"&&<VaporLesson view={view} temperature={vaporTemperature} pressure={externalPressure} onTemperature={setVaporTemperature} onPressure={setExternalPressure}/>}
   {slug==="henry"&&<HenryLesson view={view} pressure={henryPressure} onPressure={setHenryPressure}/>}
   {slug==="acid-base"&&<AcidBaseLesson view={view}/>}
   {slug==="titration"&&<TitrationLesson view={view} volume={titrationVolume} onVolume={setTitrationVolume}/>}
   {slug==="indicators"&&<IndicatorLesson view={view} indicatorId={indicatorId} onIndicator={setIndicatorId}/>}
   {slug==="buffers"&&<BufferLesson view={view}/>}
   {slug==="equilibrium"&&<EquilibriumLesson view={view} added={added} onAdded={setAdded} notes={notes}/>}
   {slug==="kinetics"&&<KineticsLesson view={view}/>}
   {slug==="thermochemistry"&&<ThermochemistryLesson view={view}/>}
   {slug==="energy-map"&&<EnergyMap view={view}/>}
   <FormulaSection lesson={slug} view={view}/>
  </div><details className="illustrated-sources no-print"><summary>数値・図の扱いと確認資料</summary><p>図・粒子数は模式表現。溶解度A・蒸気圧B・ヘンリーの定数とエネルギー図は説明用の模式値です。滴定などの計算は各図に温度・濃度・近似条件を明記しています。指示薬の変色域は代表値です。資料へのリンクを開かずに操作・出題・印刷できます。</p>{theorySources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></p>)}</details>
 </>;
}
