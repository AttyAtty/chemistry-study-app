"use client";

import { useEffect, useMemo, useState } from "react";
import { ColoredChemText } from "@/components/ColoredChemText";
import type { Flashcard } from "@/data/flashcards";
import { readFlashcardProgress, saveFlashcardStatus, type FlashcardProgressData, type FlashcardStatus } from "@/lib/flashcardProgress";

type ReviewMode = "all" | "review" | "known" | "random";

const stableScore = (id: string, seed: number) => {
  let value = seed + 17;
  for (const character of id) value = (value * 31 + character.charCodeAt(0)) % 2147483647;
  return value;
};

export function FlashcardDeck({ cards, unitId, title = "暗記カードで復習", embedded = false }: { cards: Flashcard[]; unitId: string; title?: string; embedded?: boolean }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<ReviewMode>("all");
  const [category, setCategory] = useState("all");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [progress, setProgress] = useState<FlashcardProgressData>({});

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(readFlashcardProgress()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const categories = useMemo(() => [...new Set(cards.map((card) => card.category).filter(Boolean) as string[])], [cards]);
  const activeCards = useMemo(() => {
    let selected = category === "all" ? cards : cards.filter((card) => card.category === category);
    if (mode === "review") selected = selected.filter((card) => progress[card.id]?.status !== "known");
    if (mode === "known") selected = selected.filter((card) => progress[card.id]?.status === "known");
    if (mode === "random") selected = [...selected].sort((a, b) => stableScore(a.id, shuffleSeed) - stableScore(b.id, shuffleSeed));
    return selected;
  }, [cards, category, mode, progress, shuffleSeed]);
  const safeIndex = activeCards.length ? index % activeCards.length : 0;
  const card = activeCards[safeIndex];
  const knownCount = cards.filter((item) => progress[item.id]?.status === "known").length;
  const reviewCount = cards.filter((item) => progress[item.id]?.status !== "known").length;

  const move = (direction: number) => {
    if (!activeCards.length) return;
    setIndex((current) => (current + direction + activeCards.length) % activeCards.length);
    setFlipped(false);
  };
  const restart = () => { setIndex(0); setFlipped(false); };
  const changeMode = (next: ReviewMode) => { setMode(next); setIndex(0); setFlipped(false); if (next === "random") setShuffleSeed((seed) => seed + 1); };
  const changeCategory = (next: string) => { setCategory(next); setIndex(0); setFlipped(false); };
  const mark = (status: FlashcardStatus) => {
    if (!card) return;
    setProgress(saveFlashcardStatus(card.id, status));
    move(1);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input,select,textarea,button,a")) return;
      if (event.key === " " || event.key === "Enter") { event.preventDefault(); setFlipped((value) => !value); }
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return <section className={`flashcard-deck ${embedded ? "is-embedded" : ""}`} id="flashcards" data-unit={unitId} aria-labelledby={`${unitId}-flashcard-title`}>
    <header className="flashcard-deck-header">
      <div><p className="eyebrow">FLASHCARDS</p><h2 id={`${unitId}-flashcard-title`}>{title}</h2><p>{cards.length}枚から、覚えていないカードだけを繰り返し復習できます。</p></div>
      <div className="flashcard-summary" aria-label="暗記カードの進捗"><strong>{knownCount} / {cards.length}</strong><span>覚えた</span><small>まだ {reviewCount}枚</small></div>
    </header>

    <div className="flashcard-toolbar no-print">
      <div className="flashcard-mode-tabs" aria-label="復習モード">
        {([['all','すべて'],['review','まだ'],['known','覚えた'],['random','ランダム']] as Array<[ReviewMode,string]>).map(([value,label]) => <button className={mode === value ? "active" : ""} type="button" onClick={() => changeMode(value)} key={value}>{label}</button>)}
      </div>
      {categories.length > 1 && <label>カテゴリ<select value={category} onChange={(event) => changeCategory(event.target.value)}><option value="all">全部</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>}
      <button type="button" onClick={() => { setShuffleSeed((seed) => seed + 1); setMode("random"); restart(); }}>シャッフル</button>
      <button type="button" onClick={restart}>最初から</button>
      <button type="button" onClick={() => window.print()}>一覧を印刷</button>
    </div>

    {card ? <>
      <div className="flashcard-stage no-print">
        <button className="flashcard-nav" type="button" onClick={() => move(-1)} aria-label="前のカード">←</button>
        <button className={`universal-flashcard ${flipped ? "is-flipped" : ""}`} type="button" onClick={() => setFlipped((value) => !value)} aria-label={flipped ? "カードの表面を表示" : "カードの答えを表示"} aria-pressed={flipped}>
          <span className="flashcard-face flashcard-front"><small>{card.category ?? "重要事項"}</small><strong><ColoredChemText>{card.front}</ColoredChemText></strong><em>タップして答えを見る</em></span>
          <span className="flashcard-face flashcard-back"><small>ANSWER</small><strong><ColoredChemText>{card.back}</ColoredChemText></strong>{card.note && <em><ColoredChemText>{card.note}</ColoredChemText></em>}</span>
        </button>
        <button className="flashcard-nav" type="button" onClick={() => move(1)} aria-label="次のカード">→</button>
      </div>
      <div className="flashcard-position no-print"><span>{safeIndex + 1} / {activeCards.length}</span><div><i style={{ width: `${((safeIndex + 1) / activeCards.length) * 100}%` }} /></div></div>
      <div className="flashcard-judgement no-print">
        <button className="needs-review" type="button" disabled={!flipped} onClick={() => mark("review")}>まだ</button>
        <button className="known" type="button" disabled={!flipped} onClick={() => mark("known")}>覚えた</button>
      </div>
    </> : <div className="flashcard-empty">この条件に当てはまるカードはありません。「すべて」へ戻すと全カードを表示できます。</div>}

    <div className="flashcard-print-list">
      <h2>{title}</h2><table><thead><tr><th>カテゴリ</th><th>表面</th><th>裏面</th></tr></thead><tbody>{cards.map((item) => <tr key={item.id}><td>{item.category}</td><td><ColoredChemText>{item.front}</ColoredChemText></td><td><ColoredChemText>{item.back}</ColoredChemText>{item.note && <small>{item.note}</small>}</td></tr>)}</tbody></table>
    </div>
  </section>;
}
