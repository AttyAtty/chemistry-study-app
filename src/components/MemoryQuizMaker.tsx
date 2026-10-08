"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { selectMemoryQuizQuestions, type MemoryQuizQuestion } from "@/lib/memoryQuiz";

const signature = (questions: MemoryQuizQuestion[]) => questions.map((question) => question.id).join("|");

function QuestionList({ questions, answers = false }: { questions: MemoryQuizQuestion[]; answers?: boolean }) {
  return <ol className={answers ? "memory-answer-list" : "memory-question-list"}>
    {questions.map((question) => <li className={`memory-quiz-item kind-${question.kind}`} key={question.id}>
      <div className="memory-question-copy">{question.prompt}</div>
      {answers ? <div className="memory-answer-copy"><strong>{question.answer}</strong>{question.note && <small>{question.note}</small>}</div> : <div className={`memory-answer-space lines-${question.answerLines} slots-${question.answerSlots ?? 1}`} aria-hidden="true">{Array.from({ length: question.answerSlots ?? 1 }, (_, slot) => <span key={slot}>{Array.from({ length: question.answerLines }, (_, line) => <i key={line} />)}</span>)}</div>}
    </li>)}
  </ol>;
}

export function MemoryQuizMaker({ candidates }: { candidates: MemoryQuizQuestion[] }) {
  const [seed, setSeed] = useState(1);
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState("all");
  const [count, setCount] = useState(10);
  const pool = useMemo(() => candidates.filter(item => (category === "all" || item.category === category) && (scope === "all" || item.sourceUnit === scope)), [candidates, category, scope]);
  const questions = useMemo(() => selectMemoryQuizQuestions(pool, count, seed), [pool, count, seed]);
  const answerRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    let previous = false;
    const before = () => { if (answerRef.current) { previous = answerRef.current.open; answerRef.current.open = true; } };
    const after = () => { if (answerRef.current) answerRef.current.open = previous; };
    window.addEventListener("beforeprint", before); window.addEventListener("afterprint", after);
    return () => { window.removeEventListener("beforeprint", before); window.removeEventListener("afterprint", after); };
  }, []);
  const categorySummary = useMemo(() => Object.entries(questions.reduce<Record<string, number>>((result, question) => ({ ...result, [question.categoryLabel]: (result[question.categoryLabel] ?? 0) + 1 }), {})), [questions]);

  const regenerate = () => {
    const currentSignature = signature(questions);
    let nextSeed = seed + 1;
    let next = selectMemoryQuizQuestions(pool, count, nextSeed);
    while (signature(next) === currentSignature && nextSeed < seed + 20) {
      nextSeed++;
      next = selectMemoryQuizQuestions(pool, count, nextSeed);
    }
    setSeed(nextSeed);
    if (answerRef.current) answerRef.current.open = false;
  };

  return <div className="memory-quiz-maker">
    <section className="memory-maker-intro" aria-labelledby="memory-maker-title">
      <p className="eyebrow">PRINTABLE MEMORY QUIZ</p>
      <h1 id="memory-maker-title">印刷小テスト</h1>
      <p>分野・範囲・問題数を選び、短い記述で答える問題を作成します。画面上の選択式演習とは別の、自己採点用の教材です。</p>
      <div className="memory-filters no-print">
        <label>分野<select aria-label="分野" value={category} onChange={e => { setCategory(e.target.value); setScope("all"); }}><option value="all">全分野</option>{[...new Map(candidates.map(item => [item.category, item.categoryLabel])).entries()].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>範囲<select aria-label="範囲" value={scope} onChange={e => setScope(e.target.value)}><option value="all">分野内のすべて</option>{[...new Set(candidates.filter(item => category === "all" || item.category === category).map(item => item.sourceUnit))].map(unit => <option key={unit}>{unit}</option>)}</select></label>
        <label>問題数<select aria-label="問題数" value={count} onChange={e => setCount(Number(e.target.value))}>{[5, 10, 20, 30].map(value => <option key={value} value={value}>{value}問</option>)}</select></label>
      </div>
      {questions.length < count && <p role="status">この範囲の候補数に合わせて{questions.length}問を作成しました。</p>}
      <div className="memory-maker-actions no-print">
        <button className="button secondary" type="button" onClick={regenerate}>問題を作り直す</button>
        <button className="button primary" type="button" onClick={() => window.print()}>印刷 / PDF</button>
      </div>
      <p className="memory-print-note no-print">印刷画面の送信先で「PDFに保存」を選ぶとPDFとして保存できます。印刷時も現在の問題セットを維持します。</p>
      <ul className="memory-category-summary" aria-label="現在の出題カテゴリ">
        {categorySummary.map(([label, count]) => <li key={label}><span>{label}</span><strong>{count}問</strong></li>)}
      </ul>
    </section>

    <div className="memory-quiz-print-area">
      <article className="memory-quiz-sheet memory-problem-sheet">
        <header className="memory-sheet-header"><div><small>Chemica</small><h2>印刷小テスト</h2></div><strong>{questions.length}問</strong></header>
        <div className="memory-student-meta"><span>名前：________________________</span><span>日付：______________</span><span>得点：______ / {questions.length}</span></div>
        <QuestionList questions={questions} />
      </article>
      <details className="memory-answer-disclosure" ref={answerRef}><summary className="no-print">解答を確認する</summary><article className="memory-quiz-sheet memory-answer-sheet">
        <header className="memory-sheet-header"><div><small>Chemica</small><h2>印刷小テスト　解答</h2></div><strong>{questions.length}問</strong></header>
        <QuestionList questions={questions} answers />
      </article></details>
    </div>
  </div>;
}
