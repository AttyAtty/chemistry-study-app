"use client";
import { StudyLink as Link } from "@/components/StudyLink";
import { useEffect, useState } from "react";
import { getLearningInsights } from "@/lib/learningInsights";
import { readQuestionHistory } from "@/lib/questionHistory";
import { readFlashcardProgress } from "@/lib/flashcardProgress";
import { readProgress } from "@/lib/progress";
import { subscribeLearningChanges } from "@/lib/learningStorage";

export function HomeStudyActions() {
  const [study, setStudy] = useState({ returning: false, due: 0, last: "" });
  useEffect(() => {
    const refresh = () => {
      const history = readQuestionHistory(), cards = readFlashcardProgress(), progress = readProgress();
      const insights = getLearningInsights(history, cards);
      let last = "";
      try {
        localStorage.setItem("chemica-visited", "1");
        const saved = localStorage.getItem("chemica-last-material");
        if (saved && /^\/units\/[a-z0-9-]+(?:#[a-z0-9-]+)?$/.test(saved)) last = saved;
        const quiz = sessionStorage.getItem("chemica-active-quiz");
        if (quiz?.startsWith("/quiz?") && !/[\\\u0000-\u0020]/.test(quiz)) last = quiz;
      } catch {}
      setStudy({ returning: Boolean(last) || Object.keys(history).length + Object.keys(cards).length + Object.keys(progress).length > 0, due: insights.dueCards, last });
    };
    const timer = setTimeout(refresh, 0), stop = subscribeLearningChanges(refresh);
    return () => { clearTimeout(timer); stop(); };
  }, []);
  return <div className="home-quick-actions">
    {study.returning ? <>
      <Link href={study.last || "/home#fields"} scroll={Boolean(study.last)}><strong>前回の続き</strong><span>{study.last.startsWith("/quiz?") ? "このタブで中断した演習へ" : study.last ? "前回開いた教材へ" : "単元を選んで続ける"}</span></Link>
      <Link href={study.due ? "/flashcards/review?flashcards=due" : "/flashcards/review?flashcards=new"}><strong>{study.due ? `今日の復習 ${study.due}枚` : "新しいカードへ"}</strong><span>{study.due ? "期限の来た暗記カード" : "今日の復習は0枚です"}</span></Link>
    </> : <>
      <Link href="/courses/chemistry-basic"><strong>化学基礎から始める</strong><span>3つの単元を順番に学ぶ</span></Link>
      <Link href="/quiz?unit=all&count=5"><strong>まず5問</strong><span>選択式の問題演習を試す</span></Link>
    </>}
    <Link href={study.returning ? "/quiz?unit=all&count=5" : "/home#fields"} scroll={study.returning}><strong>{study.returning ? "5問演習" : "分野から学ぶ"}</strong><span>{study.returning ? "短時間で理解を確認" : "主要4分野を選ぶ"}</span></Link>
  </div>;
}
