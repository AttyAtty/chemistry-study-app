import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { StudySection } from "@/components/StudySection";
import { chemistryUnits, getUnit } from "@/data/chemistry";
import { getFlashcardsForUnit } from "@/data/flashcards";

export function generateStaticParams() {
  return chemistryUnits.map((unit) => ({ slug: unit.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const unit = getUnit(slug);
  return { title: unit ? `${unit.title} | Chemica` : "単元 | Chemica" };
}

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = getUnit(slug);
  if (!unit) notFound();
  const isBasic = unit.slug.startsWith("chemistry-basic-");
  const flashcards = getFlashcardsForUnit(unit);

  return (
    <main className={`page-container${isBasic ? " chemistry-basic-print chemistry-basic-unit" : ""}`}>
      <section className="unit-hero">
        <div>
          <Link className="back-link no-print" href={isBasic ? "/courses/chemistry-basic" : "/home"}>← {isBasic ? "化学基礎コース" : "単元一覧"}</Link>
          <p className="eyebrow">{isBasic ? "CHEMISTRY BASICS" : "STUDY UNIT"}</p>
          <h1><span aria-hidden="true">{unit.icon}</span>{unit.title}</h1>
          <p>{unit.summary}</p>
          <div className="tag-row">{unit.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
        </div>
        <div className="unit-quiz-panel">
          <strong>{unit.questions.length}問収録</strong>
          <p>教材を確認したら、問題数を選んで定着度を確認しましょう。</p>
          <div className="quiz-count-links no-print">
            <Link className="button primary" href={`/quiz?unit=${unit.slug}&count=10`}>10問</Link>
            <Link className="button secondary" href={`/quiz?unit=${unit.slug}&count=30`}>30問</Link>
            {isBasic && <PrintButton />}
          </div>
        </div>
      </section>

      {flashcards.length > 0 && <FlashcardDeck cards={flashcards} unitId={unit.slug} />}

      <nav className="section-nav no-print" aria-label="ページ内メニュー">
        {unit.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}
        <a href="#flashcards">暗記カード</a>
      </nav>

      {unit.sections.map((section) => <StudySection section={section} key={section.id} />)}

      <section className="bottom-cta no-print">
        <div><p className="eyebrow">CHECK</p><h2>覚えた内容を問題で確認</h2></div>
        <Link className="button primary" href={`/quiz?unit=${unit.slug}&count=10`}>テストを始める</Link>
      </section>
      <div className="content-report no-print"><Link href={`/feedback?type=${encodeURIComponent("教材内容の誤り")}&source=${encodeURIComponent(`/units/${unit.slug}`)}`}>この内容について報告</Link></div>
    </main>
  );
}
