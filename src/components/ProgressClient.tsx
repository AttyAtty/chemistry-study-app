"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { chemistryUnits } from "@/data/chemistry";
import { readFlashcardProgress, type FlashcardProgressData } from "@/lib/flashcardProgress";
import { getLearningInsights, MIN_WEAK_UNIT_ATTEMPTED_QUESTIONS } from "@/lib/learningInsights";
import { readProgress, resetProgress, type ProgressData } from "@/lib/progress";
import { readQuestionHistory, type QuestionHistory } from "@/lib/questionHistory";

export function ProgressClient() {
  const [progress,setProgress]=useState<ProgressData>({});
  const [questionHistory,setQuestionHistory]=useState<QuestionHistory>({});
  const [flashProgress,setFlashProgress]=useState<FlashcardProgressData>({});

  useEffect(()=>{const frameId=window.requestAnimationFrame(()=>{setProgress(readProgress());setQuestionHistory(readQuestionHistory());setFlashProgress(readFlashcardProgress());});return()=>window.cancelAnimationFrame(frameId);},[]);

  const summary=useMemo(()=>{const values=Object.values(progress),attempts=values.reduce((sum,item)=>sum+item.attempts,0),correct=values.reduce((sum,item)=>sum+item.correct,0),total=values.reduce((sum,item)=>sum+item.total,0);return{attempts,correct,total,percent:total?Math.round(correct/total*100):0};},[progress]);
  const insights=useMemo(()=>getLearningInsights(questionHistory,flashProgress),[questionHistory,flashProgress]);
  const hasHistory=summary.attempts>0||insights.answeredQuestions>0||insights.knownCards+insights.reviewCards>0;

  const handleReset=()=>{if(!window.confirm("単元別の受験回数・得点集計を削除しますか？ 問題別の復習履歴と暗記カード記録は残ります。"))return;resetProgress();setProgress({});};

  return <main className="page-container progress-page">
    <section className="page-intro compact"><p className="eyebrow">PROGRESS</p><h1>学習記録</h1><p>次に復習する内容と、これまでの成績を確認できます。</p></section>

    {!hasHistory&&<section className="progress-empty-welcome"><h2>まだ学習記録がありません</h2><p>単元を選んで学習するか、10問チャレンジから始めましょう。</p><div><Link className="button primary" href="/home#units">単元を選ぶ</Link><Link className="button secondary" href="/quiz?unit=all&count=10">10問チャレンジ</Link></div></section>}

    <section className="today-review" aria-labelledby="today-review-title"><div className="section-heading"><div><p className="eyebrow">NEXT STUDY</p><h2 id="today-review-title">今日の復習</h2></div></div><div className="review-action-grid">
      <article><span>間違えた問題</span><strong>{insights.reviewQuestions}<small>問</small></strong>{insights.reviewQuestions>0?<Link className="button primary" href="/quiz?unit=all&mode=review&count=all">間違えた問題を復習</Link>:<p>現在、復習が必要な問題はありません。</p>}</article>
      <article><span>今日の暗記カード</span><strong>{insights.dueCards}<small>枚</small></strong>{insights.dueCards>0?<Link className="button secondary" href="/flashcards/review?flashcards=due">カードを復習</Link>:<p>今日復習するカードはありません。</p>}</article>
    </div></section>

    <section className="weak-unit-section"><div className="section-heading"><div><p className="eyebrow">REVIEW PRIORITY</p><h2>苦手単元</h2></div>{insights.reviewQuestions>0&&<Link className="mini-button" href="/quiz?unit=all&mode=review&count=all">苦手だけ復習</Link>}</div>
      {insights.weakUnits.length>0?<div className="weak-unit-grid">{insights.weakUnits.map((unit,index)=><article key={unit.unitSlug}><span className="weak-rank">{index+1}</span><div><h3>{unit.unitTitle}</h3><p>正答率 <strong>{unit.accuracy}%</strong>・回答した問題 {unit.attemptedQuestions}問・復習 {unit.needsReviewCount}問</p></div><Link className="mini-button" href={unit.needsReviewCount>0?`/quiz?unit=${unit.unitSlug}&mode=review&count=all`:`/quiz?unit=${unit.unitSlug}`}>{unit.needsReviewCount>0?"復習する":"テストする"}</Link></article>)}</div>:<div className="empty-state">{insights.answeredQuestions<MIN_WEAK_UNIT_ATTEMPTED_QUESTIONS?`苦手判定には、同じ単元で${MIN_WEAK_UNIT_ATTEMPTED_QUESTIONS}問以上の回答が必要です。`:"現在、苦手単元として表示する項目はありません。"}</div>}
    </section>

    <section className="learning-status"><div className="section-heading"><div><p className="eyebrow">LEARNING STATUS</p><h2>学習状況</h2></div></div><div className="learning-status-grid"><div><span>解答した問題</span><strong>{insights.answeredQuestions}<small>問</small></strong></div><div><span>未出題</span><strong>{insights.unseenQuestions}<small>問</small></strong></div><div><span>復習が必要</span><strong>{insights.reviewQuestions}<small>問</small></strong></div><div><span>暗記カード</span><strong>{insights.knownCards}<small>枚 覚えた</small></strong><em>まだ {insights.reviewCards}枚</em></div></div></section>

    <section className="past-results"><div className="section-heading"><div><p className="eyebrow">RESULTS</p><h2>これまでの成績</h2></div><button className="danger-link" type="button" onClick={handleReset}>成績集計をリセット</button></div><section className="summary-grid"><div><span>受験回数</span><strong>{summary.attempts}</strong></div><div><span>総正解数</span><strong>{summary.correct}</strong></div><div><span>総問題数</span><strong>{summary.total}</strong></div><div><span>総合正答率</span><strong>{summary.percent}%</strong></div></section>
      <div className="progress-list">{chemistryUnits.map(unit=>{const item=progress[unit.slug],performance=insights.unitPerformance.find(value=>value.unitSlug===unit.slug),accuracy=item?.total?Math.round(item.correct/item.total*100):0;return <article className="progress-item" key={unit.slug}><span className="unit-icon small" aria-hidden="true">{unit.icon}</span><div className="progress-item-main"><div><h3>{unit.shortTitle}</h3><span>{item?`${item.attempts}回受験`:"未受験"}</span></div><div className="progress-track slim" role="progressbar" aria-label={`${unit.shortTitle}の正答率`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={accuracy}><span style={{width:`${accuracy}%`}}/></div></div><div className="progress-numbers"><strong>{accuracy}%</strong><small>最高 {item?.bestPercent??0}%</small></div><Link className="mini-button" href={performance?.needsReviewCount?`/quiz?unit=${unit.slug}&mode=review&count=all`:`/quiz?unit=${unit.slug}`}>{performance?.needsReviewCount?"復習":"解く"}</Link></article>;})}</div>
    </section>
  </main>;
}
