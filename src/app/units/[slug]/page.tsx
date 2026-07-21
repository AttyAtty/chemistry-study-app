import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StudySection } from "@/components/StudySection";
import { chemistryUnits, getUnit } from "@/data/chemistry";

export function generateStaticParams() {
  return chemistryUnits.map((unit) => ({ slug: unit.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const unit = getUnit(slug);
  return { title: unit?.title ?? "単元" };
}

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = getUnit(slug);
  if (!unit) notFound();

  return (
    <main className="page-container">
      <section className="unit-hero">
        <div>
          <Link className="back-link" href="/">← 単元一覧</Link>
          <p className="eyebrow">STUDY UNIT</p>
          <h1><span aria-hidden="true">{unit.icon}</span>{unit.title}</h1>
          <p>{unit.summary}</p>
          <div className="tag-row">{unit.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
        </div>
        <div className="unit-quiz-panel">
          <strong>{unit.questions.length}問収録</strong>
          <p>資料を確認したら、問題数を選んで定着度を確認します。</p>
          <div className="quiz-count-links">
            <Link className="button primary" href={`/quiz?unit=${unit.slug}&count=5`}>5問</Link>
            <Link className="button secondary" href={`/quiz?unit=${unit.slug}&count=10`}>最大10問</Link>
          </div>
        </div>
      </section>

      <nav className="section-nav" aria-label="ページ内メニュー">
        {unit.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}
      </nav>

      {unit.sections.map((section) => <StudySection section={section} key={section.id} />)}

      <section className="bottom-cta">
        <div><p className="eyebrow">CHECK</p><h2>覚えた内容を問題で確認</h2></div>
        <Link className="button primary" href={`/quiz?unit=${unit.slug}&count=10`}>テストを始める</Link>
      </section>
    </main>
  );
}
