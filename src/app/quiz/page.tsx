import type { Metadata } from "next";
import Link from "next/link";
import { QuizClient } from "@/components/QuizClient";
import { chemistryUnits, getAllQuestions, getUnit } from "@/data/chemistry";
import { chemistryBasicComprehensiveQuestions } from "@/data/chemistry-basic";

export const metadata: Metadata = { title: "テスト" };

function sampleQuestions<T>(items: T[], count: number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string; count?: string }>;
}) {
  const params = await searchParams;
  const unitSlug = params.unit ?? "all";
  const rawCount = Number(params.count ?? 10);
  const count = Number.isFinite(rawCount) ? Math.max(1, Math.min(rawCount, 50)) : 10;

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
            <p>すべての単元からランダムに出題します。</p>
            <div className="quiz-count-links">
              <Link className="button primary" href="/quiz?unit=all&count=10">10問</Link>
              <Link className="button secondary" href="/quiz?unit=all&count=20">20問</Link>
            </div>
          </article>
          {chemistryUnits.map((unit) => (
            <article className="quiz-select-card" key={unit.slug}>
              <span className="unit-icon">{unit.icon}</span>
              <h2>{unit.shortTitle}</h2>
              <p>{unit.questions.length}問の問題データがあります。</p>
              <div className="quiz-count-links">
                <Link className="mini-button" href={`/quiz?unit=${unit.slug}&count=5`}>5問</Link>
                <Link className="mini-button" href={`/quiz?unit=${unit.slug}&count=10`}>最大10問</Link>
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
        <QuizClient questions={sampleQuestions(getAllQuestions(), count)} unitSlug="all" unitTitle="総合テスト" />
      </main>
    );
  }

  if (unitSlug === "chemistry-basic-comprehensive") {
    return (
      <main className="page-container">
        <QuizClient
          questions={sampleQuestions(chemistryBasicComprehensiveQuestions, count)}
          unitSlug="chemistry-basic-comprehensive"
          unitTitle="化学基礎 総合テスト"
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
      <QuizClient questions={sampleQuestions(unit.questions, count)} unitSlug={unit.slug} unitTitle={unit.title} />
    </main>
  );
}
