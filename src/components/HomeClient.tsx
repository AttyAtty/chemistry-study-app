"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { ChemistryUnit } from "@/data/chemistry";
import { ChemicaLogo } from "@/components/ChemicaLogo";
import { dailyIons, dailyPrecipitates, dailyReactions, localDateSeed } from "@/data/dailyChemistry";

export function HomeClient({ units }: { units: ChemistryUnit[] }) {
  const [daySeed, setDaySeed] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setDaySeed(localDateSeed()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const featuredIon = dailyIons[daySeed % dailyIons.length];
  const featuredReaction = dailyReactions[(daySeed * 3 + 1) % dailyReactions.length];
  const featuredPrecipitate = dailyPrecipitates[(daySeed * 5 + 2) % dailyPrecipitates.length];
  const regularUnits = units.filter(unit => !unit.slug.startsWith("chemistry-basic-"));

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
    <section className="section-block" id="units">
      <div className="section-heading home-unit-heading">
        <div><p className="eyebrow">STUDY UNITS</p><h2>学びたい単元を選ぶ</h2></div>
        <form className="search-box home-global-search" action="/search"><label htmlFor="home-knowledge-search">Chemica全体検索</label><div><input id="home-knowledge-search" name="q" type="search" placeholder="物質名・化学式・反応を検索"/><button type="submit">検索</button></div></form>
      </div>
      <div className="unit-grid home-unit-grid">
        <article className="unit-card home-unit-card chemistry-basic-entry">
          <Link className="card-primary-link" href="/courses/chemistry-basic" aria-label="化学基礎コースを見る" />
          <div className="unit-card-top"><span className="unit-number">COURSE</span><span className="level-chip">化学基礎</span></div>
          <h3>化学基礎コース</h3>
          <p>物質の構成、物質量と反応式、酸・塩基と酸化還元を、3単元の独立した学習経路で学びます。</p>
          <div className="tag-row"><span>文系受験</span><span>共通テスト</span><span>310問以上</span></div>
          <div className="card-actions"><span className="card-link-label">コースを見る <span>→</span></span><Link className="mini-button card-secondary-action" href="/quiz?unit=chemistry-basic-comprehensive&count=10">10問</Link></div>
        </article>
        {regularUnits.map(unit => <article className="unit-card home-unit-card" key={unit.slug}>
          <Link className="card-primary-link" href={`/units/${unit.slug}`} aria-label={`${unit.title}を学習する`} />
          <div className="unit-card-top"><span className="unit-number">{String(units.indexOf(unit) + 1).padStart(2, "0")}</span><span className="level-chip">{unit.level}</span></div>
          <h3>{unit.title}</h3><p>{unit.summary}</p>
          <div className="tag-row">{unit.keywords.slice(0, 3).map(keyword => <span key={keyword}>{keyword}</span>)}</div>
          <div className="card-actions"><span className="card-link-label">学習する <span>→</span></span><Link className="mini-button card-secondary-action" href={`/quiz?unit=${unit.slug}&count=5`}>5問テスト</Link></div>
        </article>)}
      </div>
    </section>
  </>;
}
