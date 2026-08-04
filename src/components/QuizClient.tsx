"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { saveQuizResult } from "@/lib/progress";
import { readQuestionHistory, recordQuestionAnswer } from "@/lib/questionHistory";
import { filterQuestionsByMode, selectQuizQuestions, type QuizCount, type QuizMode, type QuizQuestionWithUnit } from "@/lib/quizSelection";

export function QuizClient({
  questionPool,
  unitSlug,
  unitTitle,
  initialCount=10,
  initialMode="random",
}: {
  questionPool: QuizQuestionWithUnit[];
  unitSlug: string;
  unitTitle: string;
  initialCount?:QuizCount;
  initialMode?:QuizMode;
}) {
  const [count,setCount]=useState<QuizCount>(initialCount);
  const [mode,setMode]=useState<QuizMode>(initialMode);
  const [history,setHistory]=useState(()=>readQuestionHistory());
  const [quizQuestions,setQuizQuestions]=useState<QuizQuestionWithUnit[]>([]);
  const [started,setStarted]=useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const current = quizQuestions[currentIndex];
  const percent = quizQuestions.length === 0 ? 0 : Math.round((correctCount / quizQuestions.length) * 100);
  const progressPercent = quizQuestions.length === 0 ? 0 : ((currentIndex + (completed ? 1 : 0)) / quizQuestions.length) * 100;
  const eligibleCount=filterQuestionsByMode(questionPool,mode,history,unitSlug).length;

  const resultMessage = useMemo(() => {
    if (percent >= 90) return "かなり定着しています。次は問題数を増やして確認しましょう。";
    if (percent >= 70) return "基本は押さえられています。間違えた反応だけ資料に戻りましょう。";
    if (percent >= 50) return "半分は取れています。表を眺めるだけでなく、反応理由も声に出すと改善します。";
    return "まだ知識が点で残っています。系統図でつなげ直してから再挑戦しましょう。";
  }, [percent]);

  const startQuiz=()=>{
    const latestHistory=readQuestionHistory();
    const selected=selectQuizQuestions(questionPool,count,mode,latestHistory,unitSlug,unitSlug==="all");
    setHistory(latestHistory);setQuizQuestions(selected);setCurrentIndex(0);setSelectedIndex(null);setAnswered(false);setCorrectCount(0);setCompleted(false);setStarted(true);
  };

  if(!started){
    return <div className="quiz-shell"><section className="quiz-setup" aria-labelledby="quiz-setup-title">
      <p className="eyebrow">QUIZ SETUP</p><h1 id="quiz-setup-title">{unitTitle}</h1>
      <div className="quiz-option-group"><h2>問題数</h2><div>{([5,10,20,30,"all"] as QuizCount[]).map(value=><button type="button" aria-pressed={count===value} className={count===value?"active":""} onClick={()=>setCount(value)} key={value}>{value==="all"?`全問（最大${eligibleCount}問）`:`${value}問`}</button>)}</div></div>
      <div className="quiz-option-group"><h2>出題</h2><div>{([['random','ランダム'],['review','間違えた問題'],['unseen','未出題問題']] as Array<[QuizMode,string]>).map(([value,label])=><button type="button" aria-pressed={mode===value} className={mode===value?"active":""} onClick={()=>setMode(value)} key={value}>{label}</button>)}</div></div>
      <p className="quiz-eligible-count">対象は <strong>{eligibleCount}問</strong>{count!=="all"&&eligibleCount<count?`です。選択数より少ないため${eligibleCount}問を出題します。`:""}</p>
      <button className="button primary" type="button" onClick={startQuiz} disabled={eligibleCount===0}>テストを始める</button>
      {eligibleCount===0&&<div className="empty-state">このモードに該当する問題はありません。</div>}
    </section></div>;
  }

  if (quizQuestions.length === 0 || !current) {
    return <div className="quiz-shell"><div className="empty-state">この条件に該当する問題はありません。</div></div>;
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
            <button className="button primary" type="button" onClick={() => {setStarted(false);setHistory(readQuestionHistory());}}>
              条件を選び直す
            </button>
            <Link className="button secondary" href={unitSlug === "all" ? "/quiz" : unitSlug === "chemistry-basic-comprehensive" ? "/courses/chemistry-basic" : `/units/${unitSlug}`}>
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
    const correct=index===current.answerIndex;
    if (correct) setCorrectCount((value) => value + 1);
    recordQuestionAnswer(current.unitSlug??unitSlug,current.id,correct);
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
