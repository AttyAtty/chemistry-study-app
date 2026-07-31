"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChemistryUnit } from "@/data/chemistry";

const coloredMetalIons = [
  { formula: "Cr³⁺", name: "クロム(III)イオン", color: "緑色", tone: "#73c49b" },
  { formula: "Mn²⁺", name: "マンガン(II)イオン", color: "淡桃色", tone: "#efb2c4" },
  { formula: "Fe²⁺", name: "鉄(II)イオン", color: "淡緑色", tone: "#a8d79d" },
  { formula: "Fe³⁺", name: "鉄(III)イオン", color: "黄褐色", tone: "#d9a953" },
  { formula: "Co²⁺", name: "コバルト(II)イオン", color: "赤色", tone: "#e28c9d" },
  { formula: "Ni²⁺", name: "ニッケル(II)イオン", color: "緑色", tone: "#62bd8e" },
  { formula: "Cu²⁺", name: "銅(II)イオン", color: "青色", tone: "#68afe6" },
] as const;

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
        <p className="eyebrow">CHEMICA</p>
        <h1>化学を、<br />つなげて覚える。</h1>
        <p className="hero-copy">反応も、色も、構造も。理解から演習までひとつに。</p>
        <div className="hero-actions">
          <a className="button primary" href="#units">単元を選ぶ</a>
          <Link className="button secondary" href="/quiz?unit=all&count=10">10問チャレンジ</Link>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <span className="formula formula-b">e⁻</span>
        <span className="formula formula-c">C₆H₆</span>
        <div className="molecule"><i /><i /><i /><i /><i /><i /></div>
        <div className="featured-ion" style={{ "--ion-color": featuredIon.tone } as React.CSSProperties}>
          <small>今日のイオン</small>
          <strong>{featuredIon.formula}</strong>
          <span>{featuredIon.color}</span>
          <em>{featuredIon.name}</em>
        </div>
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
