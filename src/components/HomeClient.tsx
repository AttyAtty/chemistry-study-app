"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { ChemistryUnit } from "@/data/chemistry";
import { ChemicaLogo } from "@/components/ChemicaLogo";

const coloredMetalIons = [
  { formula: "Cr³⁺", name: "クロム(III)イオン", color: "緑色", tone: "#73c49b" },
  { formula: "Mn²⁺", name: "マンガン(II)イオン", color: "淡桃色", tone: "#efb2c4" },
  { formula: "Fe²⁺", name: "鉄(II)イオン", color: "淡緑色", tone: "#a8d79d" },
  { formula: "Fe³⁺", name: "鉄(III)イオン", color: "黄褐色", tone: "#d9a953" },
  { formula: "Co²⁺", name: "コバルト(II)イオン", color: "赤色", tone: "#e28c9d" },
  { formula: "Ni²⁺", name: "ニッケル(II)イオン", color: "緑色", tone: "#62bd8e" },
  { formula: "Cu²⁺", name: "銅(II)イオン", color: "青色", tone: "#68afe6" },
] as const;

const features: { number: string; title: string; description: string; icon: ReactNode }[] = [
  { number: "01", title: "図で理解", description: "反応や構造を視覚的に整理", icon: <><circle cx="12" cy="12" r="3"/><path d="m4 18 5-5m6-2 5-5M6 6h6v6m0 0h6v6"/></> },
  { number: "02", title: "カードで暗記", description: "色・反応式・性質を効率よく確認", icon: <><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 8h8M8 12h6M8 16h4"/></> },
  { number: "03", title: "問題で確認", description: "クイズやテストで理解度をチェック", icon: <><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.2 2.3c-.9.4-.9 1.2-.9 1.7m0 3h.01"/></> },
  { number: "04", title: "A4で印刷", description: "小テストや教材をPDFで保存", icon: <><path d="M7 8V3h10v5M7 17H5V9h14v8h-2"/><path d="M7 14h10v7H7z"/></> },
];

export function HomeClient({ units }: { units: ChemistryUnit[] }) {
  const [query, setQuery] = useState("");
  const [ionIndex, setIonIndex] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setIonIndex(Math.floor(Math.random() * coloredMetalIons.length)), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const featuredIon = coloredMetalIons[ionIndex];
  const filtered = useMemo(() => {
    const word = query.trim().toLowerCase();
    return word ? units.filter(unit => [unit.title, unit.summary, ...unit.keywords].join(" ").toLowerCase().includes(word)) : units;
  }, [query, units]);

  return <>
    <section className="hero home-hero">
      <div className="home-hero-main">
        <p className="eyebrow">CHEMICA LEARNING</p>
        <h1>化学を、<br /><span>もっと身近に。</span></h1>
        <p className="hero-copy">反応・色・構造・実験を、図と問題でつなげて学べる高校化学学習アプリ。</p>
        <div className="hero-actions">
          <a className="button primary" href="#units">単元を選ぶ</a>
          <Link className="button secondary" href="/quiz?unit=all&count=10">10問チャレンジ</Link>
        </div>
      </div>
      <div className="hero-visual">
        <ChemicaLogo variant="hero" showTagline />
        <span className="hero-orb orb-a" aria-hidden="true"/><span className="hero-orb orb-b" aria-hidden="true"/><span className="hero-hexagon" aria-hidden="true"/>
        <div className="featured-ion" style={{ "--ion-color": featuredIon.tone } as CSSProperties}>
          <small>今日のイオン</small><strong>{featuredIon.formula}</strong><span>{featuredIon.color}</span><em>{featuredIon.name}</em>
        </div>
        <span className="hero-float-card float-map">反応系統図</span><span className="hero-float-card float-memory">暗記カード</span>
      </div>
    </section>

    <section className="home-feature-grid" aria-label="Chemicaでできること">
      {features.map(feature => <article className="home-feature-card" key={feature.number}>
        <div className="feature-card-top"><span>{feature.number}</span><svg viewBox="0 0 24 24" aria-hidden="true">{feature.icon}</svg></div>
        <h2>{feature.title}</h2><p>{feature.description}</p>
      </article>)}
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
