import type { Metadata } from "next";
import Link from "next/link";
import { QuizClient } from "@/components/QuizClient";
import { chemistryUnits, getAllQuestions, getUnit } from "@/data/chemistry";
import { chemistryBasicComprehensiveQuestions } from "@/data/chemistry-basic";
import type { QuizCount, QuizMode } from "@/lib/quizSelection";

export const metadata: Metadata = { title: "テスト" };

export default async function QuizPage({
  searchParams,
}: {
    searchParams: Promise<{ unit?: string; count?: string; mode?:string }>;
}) {
  const params = await searchParams;
  const unitSlug = params.unit ?? "all";
  const parsedCount=params.count==="all"?"all":Number(params.count??10);
  const count:QuizCount=parsedCount==="all"?"all":[5,10,20,30].includes(parsedCount)?parsedCount as QuizCount:10;
  const mode:QuizMode=params.mode==="review"||params.mode==="unseen"?params.mode:"random";

  if (!params.unit) {
    return (
      <main className="page-container">
        <section className="page-intro compact">
          <p className="eyebrow">QUIZ SELECT</p>
          <h1>テストを選ぶ</h1>
          <p>単元と問題数を選択してください。</p>
        </section>
        <div className="quiz-select-grid">
          <article className="quiz-select-card featured">
            <span className="unit-icon">🧠</span>
            <h2>総合テスト</h2>
            <p>カテゴリの偏りを抑えて、すべての単元から出題します。</p>
            <div className="quiz-count-links">
              <Link className="button primary" href="/quiz?unit=all">出題条件を選ぶ</Link>
            </div>
          </article>
          <article className="quiz-select-card">
            <span className="unit-icon">📝</span>
            <h2>暗記小テストメーカー</h2>
            <p>既存教材から記述式10問を作り、A4の問題・解答を印刷できます。</p>
            <div className="quiz-count-links"><Link className="button secondary" href="/tools/memory-quiz">小テストを作る</Link></div>
          </article>
          {chemistryUnits.map((unit) => (
            <article className="quiz-select-card" key={unit.slug}>
              <span className="unit-icon">{unit.icon}</span>
              <h2>{unit.shortTitle}</h2>
              <p>{unit.questions.length}問の問題データがあります。</p>
              <div className="quiz-count-links">
                <Link className="mini-button" href={`/quiz?unit=${unit.slug}`}>出題条件を選ぶ</Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    );
  }

  if (unitSlug === "all") {
    return (
      <main className="page-container">
        <QuizClient questionPool={getAllQuestions()} unitSlug="all" unitTitle="総合テスト" initialCount={count} initialMode={mode}/>
      </main>
    );
  }

  if (unitSlug === "chemistry-basic-comprehensive") {
    return (
      <main className="page-container">
        <QuizClient
          questionPool={chemistryBasicComprehensiveQuestions}
          unitSlug="chemistry-basic-comprehensive"
          unitTitle="化学基礎 総合テスト"
          initialCount={count}
          initialMode={mode}
        />
      </main>
    );
  }

  const unit = getUnit(unitSlug);
  if (!unit) {
    return <main className="page-container"><div className="empty-state">指定された単元が見つかりません。</div></main>;
  }

  return (
    <main className="page-container">
      <QuizClient questionPool={unit.questions} unitSlug={unit.slug} unitTitle={unit.title} initialCount={count} initialMode={mode}/>
    </main>
  );
}
