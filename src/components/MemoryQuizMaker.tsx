"use client";

import { useMemo, useState } from "react";
import { selectMemoryQuizQuestions, type MemoryQuizQuestion } from "@/lib/memoryQuiz";

const signature = (questions: MemoryQuizQuestion[]) => questions.map((question) => question.id).join("|");

function QuestionList({ questions, answers = false }: { questions: MemoryQuizQuestion[]; answers?: boolean }) {
  return <ol className={answers ? "memory-answer-list" : "memory-question-list"}>
    {questions.map((question) => <li className={`memory-quiz-item kind-${question.kind}`} key={question.id}>
      <div className="memory-question-copy">{question.prompt}</div>
      {answers ? <div className="memory-answer-copy"><strong>{question.answer}</strong>{question.note && <small>{question.note}</small>}</div> : <div className={`memory-answer-space lines-${question.answerLines}`} aria-hidden="true">{Array.from({ length: question.answerLines }, (_, index) => <i key={index} />)}</div>}
    </li>)}
  </ol>;
}

export function MemoryQuizMaker({ candidates }: { candidates: MemoryQuizQuestion[] }) {
  const [seed, setSeed] = useState(1);
  const [questions, setQuestions] = useState(() => selectMemoryQuizQuestions(candidates, 10, 1));
  const categorySummary = useMemo(() => Object.entries(questions.reduce<Record<string, number>>((result, question) => ({ ...result, [question.categoryLabel]: (result[question.categoryLabel] ?? 0) + 1 }), {})), [questions]);

  const regenerate = () => {
    const currentSignature = signature(questions);
    let nextSeed = seed + 1;
    let next = selectMemoryQuizQuestions(candidates, 10, nextSeed);
    while (signature(next) === currentSignature && nextSeed < seed + 20) {
      nextSeed++;
      next = selectMemoryQuizQuestions(candidates, 10, nextSeed);
    }
    setSeed(nextSeed);
    setQuestions(next);
  };

  return <div className="memory-quiz-maker">
    <section className="memory-maker-intro" aria-labelledby="memory-maker-title">
      <p className="eyebrow">PRINTABLE MEMORY QUIZ</p>
      <h1 id="memory-maker-title">暗記小テストメーカー</h1>
      <p>Chemicaの既存教材から、短い記述で答える10問をカテゴリの偏りを抑えて作成します。</p>
      <div className="memory-maker-actions no-print">
        <button className="button secondary" type="button" onClick={regenerate}>別の10問を作る</button>
        <button className="button primary" type="button" onClick={() => window.print()}>印刷 / PDF</button>
      </div>
      <p className="memory-print-note no-print">印刷画面の送信先で「PDFに保存」を選ぶとPDFとして保存できます。印刷時も現在の問題セットを維持します。</p>
      <ul className="memory-category-summary" aria-label="現在の出題カテゴリ">
        {categorySummary.map(([label, count]) => <li key={label}><span>{label}</span><strong>{count}問</strong></li>)}
      </ul>
    </section>

    <div className="memory-quiz-print-area">
      <article className="memory-quiz-sheet memory-problem-sheet">
        <header className="memory-sheet-header"><div><small>Chemica</small><h2>暗記小テスト</h2></div><strong>10問</strong></header>
        <div className="memory-student-meta"><span>名前：________________________</span><span>日付：______________</span><span>得点：______ / 10</span></div>
        <QuestionList questions={questions} />
      </article>
      <article className="memory-quiz-sheet memory-answer-sheet">
        <header className="memory-sheet-header"><div><small>Chemica</small><h2>暗記小テスト　解答</h2></div><strong>10問</strong></header>
        <QuestionList questions={questions} answers />
      </article>
    </div>
  </div>;
}
