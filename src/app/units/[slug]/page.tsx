import type { Metadata } from "next";
import { StudyLink as Link } from "@/components/StudyLink";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { StudySection } from "@/components/StudySection";
import { chemistryUnits, getUnit } from "@/data/chemistry";
import { getFlashcardsForUnit } from "@/data/flashcards";
import { getUnitPageArchitecture } from "@/lib/unitInformationArchitecture";

export function generateStaticParams() {
  return chemistryUnits.map((unit) => ({ slug: unit.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const unit = getUnit(slug);
  return { title: unit ? unit.title : "単元" };
}

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = getUnit(slug);
  if (!unit) notFound();
  const isBasic = unit.slug.startsWith("chemistry-basic-");
  const flashcards = getFlashcardsForUnit(unit);
  const architecture=getUnitPageArchitecture(unit);
  const sectionById=new Map(unit.sections.map(section=>[section.id,section]));
  const featuredSections=architecture.featuredSectionIds.map(id=>sectionById.get(id)).filter((section):section is NonNullable<typeof section>=>Boolean(section));
  const featuredIds=new Set(featuredSections.map(section=>section.id));
  const detailSections=unit.sections.filter(section=>!featuredIds.has(section.id));
  const advancedSections=detailSections.filter(section=>/advanced|発展|補足|安全/.test(`${section.id}${section.title}${section.description??""}`));
  const standardDetailSections=detailSections.filter(section=>!advancedSections.includes(section));


  return (
    <main className={`page-container${isBasic ? " chemistry-basic-print chemistry-basic-unit" : ""}`}>
      <section className="unit-hero">
        <div>
          <Link className="back-link no-print" href={isBasic ? "/courses/chemistry-basic" : "/home#fields"} scroll={isBasic}>← {isBasic ? "化学基礎コース" : "単元一覧"}</Link>
          <p className="eyebrow">{isBasic ? "CHEMISTRY BASICS" : "STUDY UNIT"}</p>
          <h1><span aria-hidden="true">{unit.icon}</span>{unit.title}</h1>
          <p>{unit.summary}</p>
          <div className="tag-row">{unit.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
        </div>
      </section>
      <nav className="unit-quick-actions no-print" aria-label="単元の学習方法">
        <a href="#unit-material">教材</a>
        {flashcards.length>0&&<a href="#flashcards">暗記カード</a>}
        <Link href={`/quiz?unit=${unit.slug}&count=5`}>問題演習（{unit.questions.length}問収録）</Link>
        {isBasic && <PrintButton />}
      </nav>
      <details className="material-toc no-print"><summary>教材内の目次</summary>
        <nav className="section-nav" aria-label="教材内の目次">
          {unit.sections.map(section=><a href={`#${section.id}`} key={section.id}>{section.title}</a>)}
        </nav>
      </details>
      <div id="unit-material" />
      <header className="unit-content-heading"><p className="eyebrow">START HERE</p><h2>{architecture.featuredLabel}</h2></header>
      {featuredSections.map((section) => <div key={section.id}><StudySection section={section}/>{architecture.flashcardAfterSectionId===section.id&&flashcards.length>0&&<FlashcardDeck cards={flashcards} unitId={unit.slug}/>}</div>)}

      {!architecture.flashcardAfterSectionId&&flashcards.length > 0 && <FlashcardDeck cards={flashcards} unitId={unit.slug} />}

      {standardDetailSections.length>0&&<details className="unit-detail-disclosure" id="unit-details">
        <summary><span><small>DETAILS / ALL CONTENT</small><strong>{architecture.detailLabel}</strong></span><b>{standardDetailSections.length}セクション</b></summary>
        <div className="unit-detail-content">{standardDetailSections.map(section=><StudySection section={section} key={section.id}/>)}</div>
      </details>}
      {advancedSections.length>0&&<details className="unit-detail-disclosure is-advanced" id="unit-advanced">
        <summary><span><small>ADVANCED / NOTES</small><strong>発展・補足</strong></span><b>{advancedSections.length}セクション</b></summary>
        <div className="unit-detail-content">{advancedSections.map(section=><StudySection section={section} key={section.id}/>)}</div>
      </details>}

      <section className="bottom-cta no-print">
        <div><p className="eyebrow">CHECK</p><h2>覚えた内容を問題で確認</h2></div>
        <Link className="button primary" href={`/quiz?unit=${unit.slug}&count=10`}>演習を始める</Link>
      </section>
      <div className="content-report no-print"><Link href={`/feedback?type=${encodeURIComponent("教材内容の誤り")}&source=${encodeURIComponent(`/units/${unit.slug}`)}`}>この内容について報告</Link></div>
    </main>
  );
}
