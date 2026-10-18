"use client";
import { useState } from "react";
import { StudyLink } from "../StudyLink";
import { inorganicLessons, type InorganicMaterial } from "@/data/illustrated/inorganicTypes";
import { inorganicModes, createInorganicExercise } from "@/lib/inorganicExercise";
import { Sheet } from "./DiagramParts";
import { IonizationDiagram, FlameDiagram, PrecipitateDiagram, GasDiagrams, ElectrochemistryDiagrams } from "./InorganicDiagrams";
import {ElectroCalculation} from "./ElectroCalculation";
import {FormulaSection} from "./FormulaSection";
import {formulaTargetsForLesson} from "@/data/illustrated/formulas";

export function InorganicLesson({data}:{data:InorganicMaterial}) {
  const [mode,setMode]=useState("learn"),[showAnswers,setShowAnswers]=useState(false),[zoom,setZoom]=useState(false),[preview,setPreview]=useState(false);
  const lesson=inorganicLessons.find(l=>l.slug===data.slug)!;
  const modes=inorganicModes.filter(m=>m.id==="learn"||m.id==="all"||data.fields.some(f=>m.categories.includes(f.blankCategory)));
  const exercise=createInorganicExercise(data.fields,mode);
  if(mode==="all"||mode==="process")exercise.blankIds.push(...formulaTargetsForLesson(data.slug).map(f=>f.id));
  const view={exercise,showAnswers};
  return <><StudyLink className="back-link" href="/units/inorganic-reactions">← 無機化学</StudyLink>
    <header className="unit-content-heading"><p className="eyebrow">VISUAL CHEMISTRY / INORGANIC</p><h1>{lesson.title}</h1><p>{lesson.description}</p>{["electrochemistry","gases"].includes(data.slug)&&<StudyLink href="/units/theory-chemistry">理論化学の全体像・公式へ →</StudyLink>}</header>
    <nav className="illustrated-lesson-nav" aria-label="無機図解教材">{inorganicLessons.map(l=><StudyLink key={l.slug} href={`/illustrated/${l.slug}`} aria-current={l.slug===data.slug?"page":undefined}>{l.title}</StudyLink>)}</nav>
    <div className="illustrated-tools"><label htmlFor="inorganic-mode">表示・問題形式</label><select id="inorganic-mode" value={mode} onChange={e=>{setMode(e.target.value);setShowAnswers(false);}}>{modes.map(m=><option key={m.id} value={m.id}>{data.slug==="flame-tests"?({learn:"通常表示",all:"元素と色の両方",names:"元素を隠す",properties:"色を隠す"}[m.id]??m.label):m.label}</option>)}</select>
      <button className="button" disabled={mode==="learn"} onClick={()=>setShowAnswers(!showAnswers)}>{showAnswers?"問題に戻す":"答えを表示"}</button>
      <button className="button" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?"全体表示":"拡大表示"}</button><button className="button" aria-pressed={preview} onClick={()=>setPreview(!preview)}>A4プレビュー</button><button className="button" onClick={()=>window.print()}>印刷</button>
      <p aria-live="polite">{mode==="learn"?"図と補足で関係を確認できます。":`${view.exercise.blankIds.length}項目を出題。式・色、製法の操作文は意味のまとまりで隠します。`}</p>
    </div><div className={`illustrated-print-area ${zoom?"is-zoomed":""} ${preview?"is-a4-preview":""}`}>
      {data.slug==="ionization"&&<IonizationDiagram data={data} view={view}/>}{data.slug==="flame-tests"&&<FlameDiagram data={data} view={view}/>}{data.slug==="precipitates"&&<PrecipitateDiagram data={data} view={view}/>}{data.slug==="gases"&&<GasDiagrams data={data} view={view}/>}{data.slug==="electrochemistry"&&<ElectrochemistryDiagrams data={data} view={view}/>}
      {data.slug==="electrochemistry"&&<ElectroCalculation view={view}/>}
      <FormulaSection lesson={data.slug} view={view}/>
      {(mode==="learn"||showAnswers)&&<Sheet title="補足 ― 条件と例外"><ul className="illustrated-notes">{data.notes.map(n=><li key={n}>{n}</li>)}</ul><details className="illustrated-sources"><summary>既存教材・確認資料</summary><p>既存の気体・電池・錯イオン・色の教材データを参照して作図。表示・出題には外部通信を使いません。</p><p><a href="https://openstax.org/books/chemistry-2e/pages/17-2-galvanic-cells">OpenStax：電池と塩橋</a></p><p><a href="https://www.creative-chemistry.org.uk/documents/G-inorganic-05-05.pdf">Creative Chemistry：金属と水・酸の反応</a></p></details></Sheet>}
    </div></>;
}
