"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/data/chemistry";
import { saveQuizResult } from "@/lib/progress";

type QuizQuestionWithUnit = QuizQuestion & {
  unitSlug?: string;
  unitTitle?: string;
};

export function QuizClient({
  questions,
  unitSlug,
  unitTitle,
}: {
  questions: QuizQuestionWithUnit[];
  unitSlug: string;
  unitTitle: string;
}) {
  const quizQuestions = questions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const current = quizQuestions[currentIndex];
  const percent = quizQuestions.length === 0 ? 0 : Math.round((correctCount / quizQuestions.length) * 100);
  const progressPercent = quizQuestions.length === 0 ? 0 : ((currentIndex + (completed ? 1 : 0)) / quizQuestions.length) * 100;

  const resultMessage = useMemo(() => {
    if (percent >= 90) return "かなり定着しています。次は問題数を増やして確認しましょう。";
    if (percent >= 70) return "基本は押さえられています。間違えた反応だけ資料に戻りましょう。";
    if (percent >= 50) return "半分は取れています。表を眺めるだけでなく、反応理由も声に出すと改善します。";
    return "まだ知識が点で残っています。系統図でつなげ直してから再挑戦しましょう。";
  }, [percent]);

  if (quizQuestions.length === 0 || !current) {
    return <div className="quiz-shell"><div className="empty-state">問題を準備しています。</div></div>;
  }

  if (completed) {
    return (
      <div className="quiz-shell">
        <section className="result-card">
          <p className="eyebrow">RESULT</p>
          <h1>{correctCount} / {quizQuestions.length} 問正解</h1>
          <div className="score-circle"><strong>{percent}</strong><span>%</span></div>
          <p>{resultMessage}</p>
          <div className="result-actions">
            <button className="button primary" type="button" onClick={() => window.location.reload()}>
              同じ条件でもう一度
            </button>
            <Link className="button secondary" href={unitSlug === "all" ? "/" : `/units/${unitSlug}`}>
              資料に戻る
            </Link>
            <Link className="text-link" href="/progress">学習記録を見る →</Link>
          </div>
        </section>
      </div>
    );
  }

  const selectChoice = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    setAnswered(true);
    if (index === current.answerIndex) setCorrectCount((value) => value + 1);
  };

  const nextQuestion = () => {
    if (currentIndex >= quizQuestions.length - 1) {
      saveQuizResult(unitSlug, correctCount, quizQuestions.length);
      setCompleted(true);
      return;
    }
    setCurrentIndex((value) => value + 1);
    setSelectedIndex(null);
    setAnswered(false);
  };

  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <div>
          <p className="eyebrow">QUIZ</p>
          <h1>{unitTitle}</h1>
        </div>
        <strong>{currentIndex + 1} / {quizQuestions.length}</strong>
      </div>
      <div className="progress-track"><span style={{ width: `${progressPercent}%` }} /></div>

      <section className="question-card">
        {current.unitTitle && unitSlug === "all" && <span className="question-unit">{current.unitTitle}</span>}
        <h2>{current.prompt}</h2>
        <div className="choice-list">
          {current.choices.map((choice, index) => {
            const isCorrect = answered && index === current.answerIndex;
            const isWrong = answered && selectedIndex === index && index !== current.answerIndex;
            return (
              <button
                className={`choice-button ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                type="button"
                key={choice}
                onClick={() => selectChoice(index)}
                disabled={answered}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {choice}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`feedback-box ${selectedIndex === current.answerIndex ? "correct" : "wrong"}`}>
            <strong>{selectedIndex === current.answerIndex ? "正解" : "不正解"}</strong>
            <p>{current.explanation}</p>
          </div>
        )}

        <div className="question-footer">
          <span>現在の正解数：{correctCount}</span>
          <button className="button primary" type="button" onClick={nextQuestion} disabled={!answered}>
            {currentIndex === quizQuestions.length - 1 ? "結果を見る" : "次の問題"}
          </button>
        </div>
      </section>
    </div>
  );
}
