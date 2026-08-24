"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { ChemistryUnit } from "@/data/chemistry";
import { ChemicaLogo } from "@/components/ChemicaLogo";
import { ColoredChemText } from "@/components/ColoredChemText";
import { dailyIons, dailyPrecipitates, dailyReactions, localDateSeed } from "@/data/dailyChemistry";

function DailyQuestionCard({id,title,prompt,answer,tone,searchQuery,className=""}:{id:string;title:string;prompt:ReactNode;answer:ReactNode;tone:string;searchQuery:string;className?:string}){
  const [revealed,setRevealed]=useState(false),answerId=`${id}-answer`;
  return <article className={`daily-card daily-question-card ${revealed?"is-revealed":""} ${className}`} style={{"--daily-accent":tone} as CSSProperties}>
    <small>{title}</small><div className="daily-prompt">{prompt}</div>
    <button type="button" className="daily-answer-button" aria-expanded={revealed} aria-controls={answerId} onClick={()=>setRevealed(value=>!value)}>{revealed?"答えを隠す":"答えを見る"}</button>
    <div className="daily-answer" id={answerId} hidden={!revealed}>{answer}<Link href={`/search?q=${encodeURIComponent(searchQuery)}`}>関連知識を見る</Link></div>
  </article>;
}

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
  const mainSlugs=new Set(["theory-chemistry","inorganic-reactions","organic-reactions"]);
  const mainUnits=regularUnits.filter(unit=>mainSlugs.has(unit.slug));
  const crossUnits=regularUnits.filter(unit=>!mainSlugs.has(unit.slug));

  return <>
    <section className="hero home-hero home-dashboard-hero">
      <div className="home-brand-center"><ChemicaLogo variant="hero" showTagline /></div>
      <section className="home-quick-start" aria-labelledby="quick-start-title">
        <div><p className="eyebrow">QUICK START</p><h1 id="quick-start-title">今すぐ使う</h1></div>
        <form className="home-dashboard-search" action="/search"><label htmlFor="home-knowledge-search">Chemica全体検索</label><div><input id="home-knowledge-search" name="q" type="search" placeholder="Fe³⁺、KMnO₄、ベンゼン…"/><button type="submit">検索</button></div></form>
        <div className="home-quick-actions">
          <Link href="/flashcards/review?flashcards=due"><strong>今日の復習</strong><span>期限の来た暗記カード</span></Link>
          <Link href="/quiz?unit=all&count=10"><strong>10問チャレンジ</strong><span>全分野から短時間テスト</span></Link>
          <a href="#fields"><strong>分野から学ぶ</strong><span>主要4分野を選ぶ</span></a>
        </div>
      </section>
    </section>

    <section className="home-daily-section" aria-labelledby="daily-title">
      <div className="section-heading"><div><p className="eyebrow">TODAY</p><h2 id="daily-title">今日の3問</h2></div><Link className="text-link" href="/flashcards/review?flashcards=due">今日の復習へ →</Link></div>
      <div className="daily-chemistry-grid">
        <DailyQuestionCard id="daily-ion" title="今日のイオン" tone={featuredIon.tone} searchQuery={featuredIon.formula} className="daily-color-question" prompt={<><strong><ColoredChemText>{featuredIon.formula}</ColoredChemText></strong><span>このイオンを含む水溶液の色は？</span></>} answer={<><strong><ColoredChemText>{featuredIon.color}</ColoredChemText></strong><span>{featuredIon.name}</span><i className="daily-color-chip" style={{background:featuredIon.tone}} aria-hidden="true"/></>}/>
        <DailyQuestionCard id="daily-reaction" title="今日の反応式" tone="#8bcfb8" searchQuery={featuredReaction.title} className="daily-reaction" prompt={<><strong>{featuredReaction.title}</strong><span>全体の反応式は？</span></>} answer={<><strong><ColoredChemText>{featuredReaction.equation}</ColoredChemText></strong>{featuredReaction.note&&<span>{featuredReaction.note}</span>}</>}/>
        <DailyQuestionCard id="daily-precipitate" title="今日の沈殿" tone={featuredPrecipitate.tone} searchQuery={featuredPrecipitate.formula} className="daily-precipitate daily-color-question" prompt={<><strong><ColoredChemText>{featuredPrecipitate.ionicEquation.split("→")[0].trim()}</ColoredChemText></strong><span>混ぜると生じる沈殿は？</span></>} answer={<><strong><ColoredChemText>{featuredPrecipitate.formula}</ColoredChemText></strong><span>{featuredPrecipitate.color}・{featuredPrecipitate.name}</span><em><ColoredChemText>{featuredPrecipitate.ionicEquation}</ColoredChemText></em><i className="daily-color-chip" style={{background:featuredPrecipitate.tone}} aria-hidden="true"/></>}/>
      </div>
    </section>

    <section className="section-block home-main-fields" id="fields">
      <div className="section-heading"><div><p className="eyebrow">MAIN FIELDS</p><h2>主要4分野から学ぶ</h2><p>初めてなら化学基礎、目的が決まっていれば分野を直接選べます。</p></div></div>
      <div className="home-main-field-grid">
        <article className="unit-card home-unit-card chemistry-basic-entry">
          <Link className="card-primary-link" href="/courses/chemistry-basic" aria-label="化学基礎コースを見る" />
          <div className="unit-card-top"><span className="unit-number">COURSE</span><span className="level-chip">化学基礎</span></div>
          <h3>化学基礎コース</h3>
          <p>物質の構成から酸化還元まで、基本を順序立てて学びます。</p>
          <div className="tag-row"><span>物質量</span><span>酸・塩基</span><span>酸化還元</span></div>
          <div className="card-actions"><span className="card-link-label">コースを見る <span>→</span></span><Link className="mini-button card-secondary-action" href="/quiz?unit=chemistry-basic-comprehensive&count=10">10問</Link></div>
        </article>
        {mainUnits.map(unit => <article className="unit-card home-unit-card" key={unit.slug}>
          <Link className="card-primary-link" href={`/units/${unit.slug}`} aria-label={`${unit.title}を学習する`} />
          <div className="unit-card-top"><span className="unit-number">{String(units.indexOf(unit) + 1).padStart(2, "0")}</span><span className="level-chip">{unit.level}</span></div>
          <h3>{unit.shortTitle}</h3><p>{unit.summary}</p>
          <div className="tag-row">{unit.keywords.slice(0, 3).map(keyword => <span key={keyword}>{keyword}</span>)}</div>
          <div className="card-actions"><span className="card-link-label">学習する <span>→</span></span><Link className="mini-button card-secondary-action" href={`/quiz?unit=${unit.slug}&count=5`}>5問テスト</Link></div>
        </article>)}
      </div>
    </section>
    <section className="section-block home-cross-tools" id="units">
      <div className="section-heading"><div><p className="eyebrow">FOCUSED TOOLS</p><h2>目的別・横断教材</h2><p>確認したいテーマへ直接移動できます。</p></div></div>
      <div className="home-cross-grid">{crossUnits.map(unit=><article className="home-cross-card" key={unit.slug}>
        <Link className="card-primary-link" href={`/units/${unit.slug}`} aria-label={`${unit.title}を開く`}/><span aria-hidden="true">{unit.icon}</span><div><h3>{unit.shortTitle}</h3><p>{unit.summary}</p></div><b aria-hidden="true">→</b>
      </article>)}</div>
    </section>
  </>;
}
