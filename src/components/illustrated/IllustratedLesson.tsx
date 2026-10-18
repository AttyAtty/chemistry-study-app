"use client";

import { useState } from "react";
import { StudyLink } from "@/components/StudyLink";
import { illustratedLessons, type LessonSlug } from "@/data/illustrated/types";
import { polymers, polymerNotes, polymerSources } from "@/data/illustrated/polymers";
import { sugars, sugarNotes, sugarSources } from "@/data/illustrated/carbohydrates";
import { collectLessonFields, createLessonExercise, lessonModes } from "@/lib/illustratedExercise";
import type { BlankView } from "@/components/separation/ExerciseField";
import { PolymerMechanisms, PolymerRows, CondensationMap } from "./PolymerDiagrams";
import { SugarClassification, MonosaccharideStructures, DisaccharideHydrolysis, PolysaccharideComparison } from "./CarbohydrateDiagrams";
import { PolymerTable, SugarTable } from "./LessonTables";
import { Sheet } from "./DiagramParts";

export function IllustratedLesson({slug}:{slug:LessonSlug}) {
  const [mode,setMode]=useState("learn"),[showAnswers,setShowAnswers]=useState(false);
  const [zoom,setZoom]=useState(false),[preview,setPreview]=useState(false);
  const lesson=illustratedLessons.find(l=>l.slug===slug)!;
  const exercise=createLessonExercise(collectLessonFields(slug==="polymers" ? polymers : sugars),slug,mode);
  const view:BlankView={exercise,showAnswers};
  const notes=slug==="polymers" ? polymerNotes : sugarNotes;
  const sources=slug==="polymers" ? polymerSources : sugarSources;
  const addition=polymers.filter(p=>p.family==="addition"),condensation=polymers.filter(p=>p.family==="condensation");
  const mono=sugars.filter(s=>s.category==="mono"),di=sugars.filter(s=>s.category==="di"),poly=sugars.filter(s=>s.category==="poly");
  return <>
    <StudyLink className="back-link" href="/units/organic-reactions">← 有機化学の反応系統</StudyLink>
    <header className="unit-content-heading"><p className="eyebrow">VISUAL CHEMISTRY / ORGANIC</p><h1>{lesson.title}</h1><p>{lesson.description}</p></header>
    <nav className="illustrated-lesson-nav" aria-label="有機図解教材">{illustratedLessons.map(l=><StudyLink key={l.slug} href={`/illustrated/${l.slug}`} aria-current={l.slug===slug ? "page" : undefined}>{l.title}</StudyLink>)}</nav>
    <div className="illustrated-tools">
      <label htmlFor="illustrated-mode">表示・問題形式</label>
      <select id="illustrated-mode" value={mode} onChange={e=>{setMode(e.target.value);setShowAnswers(false);}}>{lessonModes[slug].map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select>
      {mode!=="learn" && <button type="button" className="button primary" aria-pressed={showAnswers} onClick={()=>setShowAnswers(!showAnswers)}>{showAnswers ? "問題に戻す" : "答えを表示"}</button>}
      <button type="button" className="button" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom ? "全体を表示" : "図を拡大"}</button>
      <button type="button" className="button" aria-pressed={preview} onClick={()=>setPreview(!preview)}>{preview ? "通常表示に戻す" : "A4印刷プレビュー"}</button>
      <button type="button" className="button" onClick={()=>window.print()}>印刷</button>
      <p role="status">{mode==="learn" ? "図 → 比較表 → 補足の順に確認できます。" : `空欄 ${exercise.blankIds.length} 種類。同じ番号は同じ答えです。構造式はヒントとして残します。`}</p>
      {mode!=="learn" && <p>{slug==="carbohydrates" ? "構成単糖と加水分解生成物は答えが重なるため、両方を連動して隠します。" : "モノマー名・高分子名・重合形式を、図と表で共通の番号にしています。"}補足にある直接的なヒントも問題表示では伏せます。</p>}
      <p>スマホでは全体を縮小表示します。拡大した図と比較表は横にスクロールできます。印刷では現在の問題／解答を出力します。</p>
    </div>
    <div className={`illustrated-print-area${zoom ? " is-zoomed" : ""}${preview ? " is-a4-preview" : ""}`} data-lesson-id={slug}>
      <div className="illustrated-print-title">Chemica ／ {lesson.title} ／ {mode==="learn" ? "教材" : showAnswers ? "解答" : "問題"}</div>
      {slug==="polymers" ? <>
        <Sheet title="1. 二重結合から鎖へ ― 反応マップ①"><PolymerMechanisms/><PolymerRows items={addition.slice(0,3)} view={view}/></Sheet>
        <Sheet title="2. 側鎖の違いと繰り返し単位 ― 反応マップ②"><PolymerRows items={addition.slice(3)} view={view}/><p className="illustrated-caption">π結合を使って連結し、側鎖は残る。繰り返し括弧を横切る結合は隣の単位へ続く。</p></Sheet>
        <Sheet title="3. 両端の官能基からつなぐ ― 反応マップ③">{condensation.map(p=><CondensationMap key={p.id} polymer={p} view={view}/>)}<p className="illustrated-caption">橙：反応する官能基 ／ 青：新しくできる結合を含む部分。色だけでなく原子記号でも区別しています。</p></Sheet>
        <Sheet title="4. 鎖を架橋して網目にする ― 合成樹脂"><PolymerRows items={polymers.filter(p=>p.family==="network")} view={view}/><p className="illustrated-caption">右側は架橋の模式図。反応の詳細や単一の化学構造式を表すものではありません。</p></Sheet>
        <Sheet title="5. 環を開く・ジエンをつなぐ ― 繊維とゴム"><PolymerRows items={polymers.filter(p=>p.family==="ring-opening"||p.family==="rubber")} view={view}/><p className="illustrated-caption">ゴムの式は結合順を示す略構造。天然ゴムのcis配置、共重合体の配列は模式化しています。加硫は重合後の鎖間架橋です。</p></Sheet>
        <Sheet title="6. 高分子比較表① ― 二重結合からつくる高分子"><PolymerTable items={polymers.slice(0,6)} view={view}/></Sheet>
        <Sheet title="7. 高分子比較表② ― 官能基でつなぐ・網目にする"><PolymerTable items={polymers.slice(6,11)} view={view}/></Sheet>
        <Sheet title="8. 高分子比較表③ ― 繊維とゴム"><PolymerTable items={polymers.slice(11)} view={view}/></Sheet>
      </> : <>
        <Sheet title="1. 糖の分類 ― 単位数で全体を見る"><SugarClassification items={sugars} view={view}/><p className="illustrated-caption">丸は単糖単位の模式記号で、実際の環の形ではありません。G＝グルコース、F＝フルクトース、Gal＝ガラクトース。</p></Sheet>
        <Sheet title="2. 単糖の構造を比べる"><MonosaccharideStructures items={mono} view={view}/><p className="illustrated-caption">D系列の鎖状Fischer投影。横の結合は手前、縦の結合は奥を向く。水溶液中では主に環状構造をとります。</p>
          <div className="illustrated-concept-flow"><span>鎖状のカルボニル基</span><b> ⇄ </b><span>環状構造</span><b> → </b><span>開環・異性化の可否が還元性に関係</span></div>
          {(mode==="learn"||showAnswers) && <p>グルコースとガラクトースはC4のOH配置が異なります。フルクトースはケトースですが、塩基性条件で異性化するため銀鏡・フェーリング反応で陽性になります。</p>}
        </Sheet>
        <Sheet title="3. 二糖を分ける ― 構成単糖と還元性"><DisaccharideHydrolysis items={di} view={view}/><p className="illustrated-caption">矢印は加水分解。逆向きに脱水して結合する関係も確認できます。還元性は加水分解前の糖について示しています。</p></Sheet>
        <Sheet title="4. 多糖を比べる ― らせん・分岐・直鎖"><PolysaccharideComparison items={poly} view={view}/><p className="illustrated-caption">丸はグルコース単位、点線は鎖間の水素結合の模式図。分岐間隔・鎖長は実際の比率ではありません。</p></Sheet>
        <Sheet title="5. 糖類比較表① ― 単糖・二糖"><SugarTable items={sugars.slice(0,6)} view={view}/></Sheet>
        <Sheet title="6. 糖類比較表② ― 多糖"><SugarTable items={poly} view={view}/></Sheet>
      </>}
      {(mode==="learn"||showAnswers) && <Sheet title="補足 ― 図と合わせて確認すること">
        <ol className="illustrated-notes">{notes.map(note=><li key={note}>{note}</li>)}</ol>
        {slug==="polymers" && <StudyLink className="no-print" href="/units/organic-reactions">関連する有機反応マップへ →</StudyLink>}
        <details className="illustrated-sources"><summary>内容の確認に用いた資料</summary><p>構造と反応を教材用に作図しています。本文・画像の転載ではありません。教材の表示に外部通信は不要です。</p>{sources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></p>)}</details>
      </Sheet>}
    </div>
  </>;
}
