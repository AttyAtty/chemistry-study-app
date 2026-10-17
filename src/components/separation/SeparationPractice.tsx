"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { StudyLink } from "@/components/StudyLink";
import { separationDiagrams } from "@/data/separation/diagrams";
import { createSeparationExercise, exerciseModes, nextSeparationExercise, type ExerciseMode,
  type SeparationExercise, type StructurePolicy } from "@/lib/separationExercise";
import { SeparationDiagram } from "./SeparationDiagram";

function PracticeForm({ initialDiagramId }: { initialDiagramId:string }) {
  const [diagramId,setDiagramId] = useState(initialDiagramId);
  const [mode,setMode] = useState<ExerciseMode>("all");
  const [rate,setRate] = useState(30);
  const [seed,setSeed] = useState("chemica-1");
  const [structurePolicy,setStructurePolicy] = useState<StructurePolicy>("hide");
  const [question,setQuestion] = useState<SeparationExercise | null>(null);
  const [showAnswers,setShowAnswers] = useState(false);
  const [error,setError] = useState("");
  const diagram = separationDiagrams.find(item=>item.id===diagramId)!;
  const previewDiagram = question ? separationDiagrams.find(item=>item.id===question.diagramId)! : null;
  function generate() {
    try {
      setQuestion(createSeparationExercise(diagram,{mode,rate,seed:mode === "random" ? seed : seed || "chemica-1",structurePolicy}));
      setShowAnswers(false); setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "問題を生成できませんでした。"); }
  }
  function next() {
    if (!question || !previewDiagram) return;
    try {
      const generated = nextSeparationExercise(previewDiagram,question);
      setQuestion(generated); setSeed(generated.seed); setShowAnswers(false); setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "別のseedを指定してください。"); }
  }
  return <>
    <StudyLink className="back-link" href={`/separation/${diagramId}`}>← 通常の系統図へ</StudyLink>
    <header className="unit-content-heading"><p className="eyebrow">SEPARATION PRACTICE</p><h1>系統分離の穴埋め練習</h1>
      <p>分野と形式を選んで問題を作ります。最初の混合物と図の枝・枠は残ります。</p></header>
    <form className="separation-practice-settings" onSubmit={event=>{event.preventDefault();generate();}}>
      <div className="separation-setting-grid">
        <div className="separation-setting"><label htmlFor="separation-field">分野</label><select id="separation-field" value={diagramId} onChange={event=>setDiagramId(event.target.value)}>
          {separationDiagrams.map(item=><option value={item.id} key={item.id}>{item.id === "metal-analysis" ? "無機：金属イオンの系統分析" : "有機：芳香族化合物の系統分離"}</option>)}
        </select></div>
        <div className="separation-setting"><label htmlFor="separation-mode">問題形式</label><select id="separation-mode" value={mode} onChange={event=>{const nextMode=event.target.value as ExerciseMode;setMode(nextMode);setStructurePolicy(nextMode === "species" ? "hint" : "hide");}}>
          {Object.entries(exerciseModes).map(([id,name])=><option key={id} value={id}>{name}</option>)}
        </select></div>
        {mode === "random" && <>
          <div className="separation-setting"><label htmlFor="separation-rate">穴埋め率</label><select id="separation-rate" value={rate} onChange={event=>setRate(Number(event.target.value))}>{[20,30,50,70].map(value=><option key={value} value={value}>{value}%</option>)}</select></div>
          <div className="separation-setting"><label htmlFor="separation-seed">seed</label><input id="separation-seed" required maxLength={128} value={seed} onChange={event=>setSeed(event.target.value)} autoCapitalize="off" spellCheck={false}/></div>
        </>}
      </div>
      {diagram.compounds && mode !== "procedure" && <label className="separation-structure-choice">
        <input type="checkbox" checked={structurePolicy === "hint"} onChange={event=>setStructurePolicy(event.target.checked ? "hint" : "hide")}/>
        構造式をヒントとして表示し、物質名を答える
      </label>}
      <button className="button primary" type="submit">問題を生成</button>
      <p>「全体」は主要情報を空欄に、「物質」は試薬・操作を残します。「試薬・操作」は物質と構造式を残します。</p>
    </form>
    {error && <p role="alert">{error}</p>}
    {question && previewDiagram && <section className="separation-exercise-preview" aria-label="問題プレビュー">
      <h2>{previewDiagram.title}：{exerciseModes[question.mode]}</h2>
      <p className="separation-question-status" role="status">空欄 {question.blankIds.length} 個{question.mode === "random" ? ` ／ ${question.rate}% ／ seed: ${question.seed}` : ""}</p>
      <div className="separation-question-actions">
        <button type="button" className="button primary" aria-pressed={showAnswers} onClick={()=>setShowAnswers(!showAnswers)}>{showAnswers ? "問題に戻す" : "答えを表示"}</button>
        {question.mode === "random" && <button type="button" className="button" onClick={next}>別の問題を生成</button>}
      </div>
      <p>{showAnswers ? "空欄にした箇所だけ、青色で答えを表示しています。" : "番号付きの下線に入る答えを考えてから、解答を確認してください。"}</p>
      <SeparationDiagram key={`${question.diagramId}:${question.mode}:${question.seed}:${question.rate}:${question.structurePolicy}`} diagram={previewDiagram} exercise={question} showAnswers={showAnswers}/>
    </section>}
  </>;
}

export function SeparationPractice() {
  const params = useSearchParams();
  const requested = params.get("diagram");
  const initial = separationDiagrams.find(item=>item.id===requested)?.id ?? separationDiagrams[0].id;
  return <PracticeForm key={initial} initialDiagramId={initial}/>;
}
