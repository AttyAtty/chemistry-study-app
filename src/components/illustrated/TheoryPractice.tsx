"use client";
import { useState } from "react";
import Link from "next/link";
import { formulaChoiceQuestions, practiceQuestions, workedExamples } from "@/data/theoryPractice";
import { formulas } from "@/data/illustrated/formulas";

function WorkedCard({item}:{item:(typeof workedExamples)[number]}) {
 const [variant,setVariant]=useState(-1); const v=variant<0?undefined:item.variants?.[variant];
 return <article id={item.id} className="practice-card worked-card"><p className="practice-eyebrow">典型例題・{item.topic}</p><h3>{item.title}</h3>
  <section><h4>問題</h4><p>{v?.problem??item.problem}</p></section>
  <section><h4>何を使う？</h4><p>{v?.formula??item.choose}</p></section>
  <section><h4>考え方</h4><p>{item.thinking}</p></section>
  <div className="practice-formula-block"><small>式</small><strong>{v?.formula??item.formula}</strong></div>
  <section><h4>代入</h4><p>{v?.substitution??item.substitution}</p></section>
  <section><h4>答え</h4><strong>{v?.answer??item.answer}</strong></section>
  <section><h4>この問題のポイント</h4><p>{item.point}</p></section><section><h4>条件が変わると？</h4><p>{item.variation}</p></section>
  <nav className="practice-links no-print"><Link href={`/theory/formulas#formula-${item.formulaId}`}>公式を確認する →</Link><Link href="/illustrated/thermochemistry">図解教材へ →</Link></nav>
  {item.variants?.length&&<button className="button secondary no-print" type="button" onClick={()=>setVariant((variant+1)%item.variants!.length)}>数値を変えた類題</button>}
 </article>;
}

export function TheoryPractice(){
 const [choiceAnswers,setChoiceAnswers]=useState<Record<string,boolean>>({});
 return <main className="page-container theory-practice-page"><header className="unit-content-heading"><p className="eyebrow">THEORY / WORKED EXAMPLES &amp; PRACTICE</p><h1>理論化学 典型例題・練習問題</h1><p>問題の条件から使う関係を選び、単位をそろえ、式・計算へ進みます。例題を読むだけでは学習記録に加算されません。</p><nav className="illustrated-lesson-nav"><Link href="/theory/formulas">重要公式まとめへ</Link><Link href="/units/theory-chemistry">理論化学の単元へ</Link><Link href="/illustrated/energy-map">エネルギー変化の総まとめ図へ</Link></nav></header>
  <section className="practice-choice-section"><h2>まず、使う公式を選ぶ</h2><p>条件を見て、解法を始める前に必要な関係を判断します。</p><div className="practice-choice-grid">{formulaChoiceQuestions.map(q=><article key={q.id}><h3>{q.prompt}</h3><div>{q.choices.map(choice=><button key={choice} type="button" className="button secondary" onClick={()=>setChoiceAnswers(s=>({...s,[q.id]:choice===q.answer}))}>{choice}</button>)}</div>{q.id in choiceAnswers&&<p role="status">{choiceAnswers[q.id]?"正解。":"確認："}{q.answer} — {q.reason}</p>}</article>)}</div></section>
  <section className="worked-examples" id="worked-examples"><h2>典型例題</h2><p>公式選択から計算・答えまでを追います。</p><nav className="formula-example-index no-print" aria-label="公式別の例題">{formulas.map(formula=>{const example=workedExamples.find(item=>item.formulaId===formula.id);const practice=practiceQuestions.find(item=>item.formulaId===formula.id);return <a id={`formula-${formula.id}`} key={formula.id} href={example?`#${example.id}`:practice?`#practice-${practice.id}`:"#worked-examples"}>{formula.title}の例題</a>;})}</nav><div className="worked-example-grid">{workedExamples.map(item=><WorkedCard item={item} key={item.id}/>)}</div></section>
  <section className="practice-questions"><h2>練習問題</h2><p>まず自分で解き、答え・考え方を開いて確認してください。各問は基本または標準の代表パターンです。</p><div className="practice-question-grid">{practiceQuestions.map(q=><article id={`practice-${q.id}`} className="practice-question-card" key={q.id}><small>{q.topic}・{q.level}</small><h3>{q.problem}</h3><p><strong>何を使う？</strong>　{q.choose}</p><details><summary>答え・解説を見る</summary><p><strong>{q.answer}</strong></p><p>{q.explanation}</p></details><Link href={`/theory/formulas#formula-${q.formulaId}`}>公式確認 →</Link></article>)}</div></section>
  <p className="practice-print-note">印刷時は問題の後に解答・解説が続きます。ブラウザーの印刷設定でA4を選択してください。</p>
 </main>;
}
