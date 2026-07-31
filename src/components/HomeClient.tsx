"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ChemistryUnit } from "@/data/chemistry";

export function HomeClient({ units }: { units: ChemistryUnit[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const word = query.trim().toLowerCase();
    return word ? units.filter(unit => [unit.title, unit.summary, ...unit.keywords].join(" ").toLowerCase().includes(word)) : units;
  }, [query, units]);

  return <>
    <section className="hero home-hero">
      <div className="home-hero-main">
        <p className="eyebrow">CHEMICA</p>
        <h1>高校化学を、<br />見て、解いて、定着。</h1>
        <p className="hero-copy">反応・色・構造を図で理解し、そのまま問題演習へ。</p>
        <div className="hero-actions">
          <a className="button primary" href="#units">単元を選ぶ</a>
          <Link className="button secondary" href="/quiz?unit=all&count=10">10問チャレンジ</Link>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <span className="formula formula-a">Cu²⁺</span>
        <span className="formula formula-b">e⁻</span>
        <span className="formula formula-c">C₆H₆</span>
        <div className="molecule"><i /><i /><i /><i /><i /><i /></div>
      </div>
      <div className="hero-features" aria-label="このサイトでできること">
        <span><b>01</b> 図で理解</span>
        <span><b>02</b> カードで暗記</span>
        <span><b>03</b> 問題で確認</span>
        <span><b>04</b> A4で印刷</span>
      </div>
    </section>

    <section className="section-block" id="units">
      <div className="section-heading home-unit-heading">
        <div><p className="eyebrow">STUDY UNITS</p><h2>学びたい単元を選ぶ</h2></div>
        <label className="search-box"><span>単元を検索</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="例：電池、気体、ベンゼン" /></label>
      </div>
      <div className="unit-grid home-unit-grid">
        {filtered.map(unit => <article className="unit-card home-unit-card" key={unit.slug}>
          <div className="unit-card-top"><span className="unit-number">{String(units.indexOf(unit) + 1).padStart(2, "0")}</span><span className="level-chip">{unit.level}</span></div>
          <h3>{unit.title}</h3>
          <p>{unit.summary}</p>
          <div className="tag-row">{unit.keywords.slice(0, 3).map(keyword => <span key={keyword}>{keyword}</span>)}</div>
          <div className="card-actions"><Link className="text-link" href={`/units/${unit.slug}`}>学習する <span>→</span></Link><Link className="mini-button" href={`/quiz?unit=${unit.slug}&count=5`}>5問テスト</Link></div>
        </article>)}
      </div>
      {filtered.length === 0 && <div className="empty-state">該当する単元がありません。別の言葉で検索してください。</div>}
    </section>
  </>;
}
