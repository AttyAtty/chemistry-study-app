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

  return <>
    <section className="hero home-hero">
      <div className="home-brand-center"><ChemicaLogo variant="hero" showTagline /></div>
      <div className="daily-chemistry-grid">
        <DailyQuestionCard id="daily-ion" title="今日のイオン" tone={featuredIon.tone} searchQuery={featuredIon.formula} prompt={<><strong><ColoredChemText>{featuredIon.formula}</ColoredChemText></strong><span>このイオンを含む水溶液の色は？</span></>} answer={<><strong><ColoredChemText>{featuredIon.color}</ColoredChemText></strong><span>{featuredIon.name}</span><i className="daily-color-chip" style={{background:featuredIon.tone}} aria-hidden="true"/></>}/>
        <DailyQuestionCard id="daily-reaction" title="今日の反応式" tone="#8bcfb8" searchQuery={featuredReaction.title} className="daily-reaction" prompt={<><strong>{featuredReaction.title}</strong><span>全体の反応式は？</span></>} answer={<><strong><ColoredChemText>{featuredReaction.equation}</ColoredChemText></strong>{featuredReaction.note&&<span>{featuredReaction.note}</span>}</>}/>
        <DailyQuestionCard id="daily-precipitate" title="今日の沈殿" tone={featuredPrecipitate.tone} searchQuery={featuredPrecipitate.formula} className="daily-precipitate" prompt={<><strong><ColoredChemText>{featuredPrecipitate.ionicEquation.split("→")[0].trim()}</ColoredChemText></strong><span>混ぜると生じる沈殿は？</span></>} answer={<><strong><ColoredChemText>{featuredPrecipitate.formula}</ColoredChemText></strong><span>{featuredPrecipitate.color}・{featuredPrecipitate.name}</span><em><ColoredChemText>{featuredPrecipitate.ionicEquation}</ColoredChemText></em><i className="daily-color-chip" style={{background:featuredPrecipitate.tone}} aria-hidden="true"/></>}/>
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
