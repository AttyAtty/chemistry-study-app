"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { ChemistryUnit } from "@/data/chemistry";
import { ChemicaLogo } from "@/components/ChemicaLogo";
import { dailyIons, dailyPrecipitates, dailyReactions, localDateSeed } from "@/data/dailyChemistry";

const features: { number: string; title: string; description: string; icon: ReactNode }[] = [
  { number: "01", title: "図で理解", description: "反応や構造を視覚的に整理", icon: <><circle cx="12" cy="12" r="3"/><path d="m4 18 5-5m6-2 5-5M6 6h6v6m0 0h6v6"/></> },
  { number: "02", title: "カードで暗記", description: "色・反応式・性質を効率よく確認", icon: <><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 8h8M8 12h6M8 16h4"/></> },
  { number: "03", title: "問題で確認", description: "クイズやテストで理解度をチェック", icon: <><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.2 2.3c-.9.4-.9 1.2-.9 1.7m0 3h.01"/></> },
  { number: "04", title: "印刷", description: "教材や小テストをPDFで出力", icon: <><path d="M7 8V3h10v5M7 17H5V9h14v8h-2"/><path d="M7 14h10v7H7z"/></> },
];

export function HomeClient({ units }: { units: ChemistryUnit[] }) {
  const [query, setQuery] = useState("");
  const [daySeed, setDaySeed] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setDaySeed(localDateSeed()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const featuredIon = dailyIons[daySeed % dailyIons.length];
  const featuredReaction = dailyReactions[(daySeed * 3 + 1) % dailyReactions.length];
  const featuredPrecipitate = dailyPrecipitates[(daySeed * 5 + 2) % dailyPrecipitates.length];
  const filtered = useMemo(() => {
    const word = query.trim().toLowerCase();
    return word ? units.filter(unit => [unit.title, unit.summary, ...unit.keywords].join(" ").toLowerCase().includes(word)) : units;
  }, [query, units]);

  return <>
    <section className="hero home-hero">
      <div className="home-brand-center"><ChemicaLogo variant="hero" showTagline /></div>
      <div className="daily-chemistry-grid">
        <article className="daily-card daily-ion" style={{ "--daily-accent":featuredIon.tone } as CSSProperties}><small>今日のイオン</small><strong>{featuredIon.formula}</strong><span>{featuredIon.color}</span><em>{featuredIon.name}</em></article>
        <article className="daily-card daily-reaction"><small>今日の反応式</small><strong>{featuredReaction.equation}</strong><span>{featuredReaction.title}</span></article>
        <article className="daily-card daily-precipitate" style={{ "--daily-accent":featuredPrecipitate.tone } as CSSProperties}><small>今日の沈殿</small><strong>{featuredPrecipitate.formula}</strong><span>{featuredPrecipitate.color}・{featuredPrecipitate.name}</span><em>{featuredPrecipitate.ionicEquation}</em></article>
      </div>
      <div className="hero-actions"><a className="button primary" href="#units">単元を選ぶ</a><Link className="button secondary" href="/quiz?unit=all&count=10">10問チャレンジ</Link></div>
    </section>

    <section className="memory-manifesto"><h2>化学は、暗記だ。</h2><p>覚えるべき重要事項と、参考書では散らばりがちな知識を整理し、ひと目で確認できるようにするためのアプリです。</p></section>
    <section className="home-capabilities" aria-label="Chemicaでできること">
      <div className="home-feature-grid">
        {features.map(feature => <article className="home-feature-card" key={feature.number}>
          <div className="feature-card-top"><span>{feature.number}</span><svg viewBox="0 0 24 24" aria-hidden="true">{feature.icon}</svg></div>
          <h3>{feature.title}</h3><p>{feature.description}</p>
        </article>)}
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
          <h3>{unit.title}</h3><p>{unit.summary}</p>
          <div className="tag-row">{unit.keywords.slice(0, 3).map(keyword => <span key={keyword}>{keyword}</span>)}</div>
          <div className="card-actions"><Link className="text-link" href={`/units/${unit.slug}`}>学習する <span>→</span></Link><Link className="mini-button" href={`/quiz?unit=${unit.slug}&count=5`}>5問テスト</Link></div>
        </article>)}
      </div>
      {filtered.length === 0 && <div className="empty-state">該当する単元がありません。別の言葉で検索してください。</div>}
    </section>
  </>;
}
