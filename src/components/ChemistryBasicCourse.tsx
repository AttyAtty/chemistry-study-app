"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChemistryUnit } from "@/data/chemistry";
import type { FormulaReference, GlossaryEntry } from "@/data/chemistry-basic";
import { readProgress, type ProgressData } from "@/lib/progress";

const accents = ["mint", "purple", "pink"] as const;

export function ChemistryBasicCourse({
  units,
  formulas,
  glossary,
  comprehensiveCount,
}: {
  units: ChemistryUnit[];
  formulas: FormulaReference[];
  glossary: GlossaryEntry[];
  comprehensiveCount: number;
}) {
  const [progress, setProgress] = useState<ProgressData>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(readProgress()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const completed = units.filter((unit) => (progress[unit.slug]?.bestPercent ?? 0) >= 70).length;
  const average = units.length
    ? Math.round(units.reduce((sum, unit) => sum + (progress[unit.slug]?.bestPercent ?? 0), 0) / units.length)
    : 0;
  const filteredGlossary = useMemo(() => {
    const word = query.trim().toLowerCase();
    return word
      ? glossary.filter((item) => `${item.term} ${item.definition} ${item.category}`.toLowerCase().includes(word))
      : glossary;
  }, [glossary, query]);

  return (
    <main className="page-container chemistry-basic-course chemistry-basic-print">
      <section className="basic-course-hero">
        <div>
          <p className="eyebrow">CHEMISTRY BASICS COURSE</p>
          <h1>化学基礎</h1>
          <p>高校化学基礎を学ぶ人、文系受験生、共通テスト対策をしたい人向け。物質の構成から酸化還元まで、3単元を順番に学べます。</p>
          <div className="hero-actions no-print">
            <Link className="button primary" href={`/units/${units[0]?.slug ?? ""}`}>最初から学ぶ</Link>
            <Link className="button secondary" href="/quiz?unit=chemistry-basic-comprehensive&count=50">総合テスト</Link>
          </div>
        </div>
        <div className="basic-progress-panel" aria-label="化学基礎の進捗">
          <strong>{average}%</strong><span>コース進捗</span>
          <div className="basic-progress-track"><i style={{ width: `${average}%` }} /></div>
          <small>{completed} / {units.length} 単元で70%以上</small>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">COURSE MAP</p><h2>3つの単元</h2></div></div>
        <div className="basic-unit-grid">
          {units.map((unit, index) => {
            const unitProgress = progress[unit.slug];
            return <article className={`basic-unit-card accent-${accents[index]}`} key={unit.slug}>
              <div className="basic-unit-order">{index + 1}</div>
              <span className="level-chip">{unit.questions.length}問</span>
              <h3>{unit.title}</h3><p>{unit.summary}</p>
              <div className="basic-progress-track"><i style={{ width: `${unitProgress?.bestPercent ?? 0}%` }} /></div>
              <small>最高得点 {unitProgress?.bestPercent ?? 0}%</small>
              <div className="card-actions no-print"><Link className="text-link" href={`/units/${unit.slug}`}>学習する <span>→</span></Link><Link className="mini-button" href={`/quiz?unit=${unit.slug}&count=10`}>10問</Link></div>
            </article>;
          })}
        </div>
      </section>

      <section className="basic-course-tools no-print">
        <Link href="/quiz?unit=chemistry-basic-comprehensive&count=50"><strong>総合テスト</strong><span>{comprehensiveCount}問から出題</span></Link>
        <a href="#glossary"><strong>復習カード</strong><span>重要語句を検索</span></a>
        <button type="button" onClick={() => window.print()}><strong>印刷教材</strong><span>公式・要点をA4/PDFへ</span></button>
      </section>

      <section className="section-block basic-formulas">
        <div className="section-heading"><div><p className="eyebrow">FORMULAS</p><h2>公式・重要事項一覧</h2></div></div>
        <div className="formula-grid">{formulas.map((item) => <article key={item.title}><h3>{item.title}</h3><code>{item.formula}</code><p>{item.meaning}</p>{item.condition && <small>{item.condition}</small>}</article>)}</div>
      </section>

      <section className="section-block basic-glossary" id="glossary">
        <div className="section-heading"><div><p className="eyebrow">GLOSSARY</p><h2>重要語句一覧</h2></div>
          <label className="search-box no-print"><span>用語を検索</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="例：酸化、物質量" /></label>
        </div>
        <div className="glossary-grid">{filteredGlossary.map((item) => <article key={item.term}><small>{item.category}</small><h3>{item.term}</h3><p>{item.definition}</p></article>)}</div>
      </section>

      <section className="section-block basic-related no-print">
        <div className="section-heading"><div><p className="eyebrow">NEXT STEP</p><h2>さらに学ぶ</h2></div></div>
        <div className="tag-row"><Link href="/home">気体・沈殿・錯イオン・電池・電気分解など、発展単元を見る →</Link></div>
      </section>
    </main>
  );
}
