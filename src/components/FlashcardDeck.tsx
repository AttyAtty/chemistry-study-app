"use client";

import { useEffect, useMemo, useState } from "react";
import { ColoredChemText } from "@/components/ColoredChemText";
import type { Flashcard } from "@/data/flashcards";
import { FLASHCARD_SESSION_RETRY_LIMIT, getDueFlashcards, getForgottenFlashcards, getNewFlashcards, readFlashcardProgress, saveFlashcardStatus, type FlashcardProgressData, type FlashcardStatus } from "@/lib/flashcardProgress";

type ReviewMode = "all" | "due" | "new" | "review" | "known" | "random";

const answerColorSwatches: Array<[RegExp, string]> = [
  [/淡青紫色/, "#c9c4ef"], [/赤橙色/, "#e88b62"], [/黄褐色/, "#b68a45"], [/赤褐色/, "#a9523d"],
  [/濃青色/, "#2457a6"], [/青白色/, "#b8dff5"], [/淡緑色/, "#b9d8b1"], [/灰緑色/, "#819b82"],
  [/淡桃色/, "#efb7c8"], [/赤紫色/, "#a54c91"], [/血赤色/, "#a52b3b"], [/暗赤色/, "#8a3438"],
  [/淡黄色|淡黄/, "#f4e7a5"], [/黄緑色/, "#b9d96a"], [/黒褐色/, "#493a35"], [/暗褐色/, "#5d4037"],
  [/無色/, "transparent"], [/白色|白/, "#ffffff"], [/黒色|黒/, "#20242c"], [/青色|青/, "#5297d8"],
  [/緑色|緑/, "#65a77c"], [/黄色|黄/, "#ebc94f"], [/赤色|赤/, "#dc6670"], [/紫色|紫/, "#8665b8"],
  [/橙色|橙/, "#e99b5e"],
];

const getAnswerSwatch = (card: Flashcard) => card.answerType === "color"
  ? answerColorSwatches.find(([pattern]) => pattern.test(card.back))?.[1]
  : undefined;

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
  const [sessionProgress,setSessionProgress]=useState<FlashcardProgressData>({});
  const [retryIds,setRetryIds]=useState<string[]>([]);
  const [retryCounts,setRetryCounts]=useState<Record<string,number>>({});
  const [sessionResult,setSessionResult]=useState({remembered:0,forgot:0});

  useEffect(() => {
    const timer = window.setTimeout(() => {const loaded=readFlashcardProgress(),requested=new URLSearchParams(window.location.search).get("flashcards");setProgress(loaded);setSessionProgress(loaded);if(requested==="due"||requested==="review"||requested==="new")setMode(requested);}, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const categories = useMemo(() => [...new Set(cards.map((card) => card.category).filter(Boolean) as string[])], [cards]);
  const baseCards = useMemo(() => {
    let selected = category === "all" ? cards : cards.filter((card) => card.category === category);
    if (mode === "due") selected=getDueFlashcards(selected,sessionProgress);
    if (mode === "new") selected=getNewFlashcards(selected,sessionProgress);
    if (mode === "review") selected=getForgottenFlashcards(selected,sessionProgress);
    if (mode === "known") selected = selected.filter((card) => sessionProgress[card.id]?.status === "known");
    if (mode === "random") selected = [...selected].sort((a, b) => stableScore(a.id, shuffleSeed) - stableScore(b.id, shuffleSeed));
    return selected;
  }, [cards, category, mode, sessionProgress, shuffleSeed]);
  const activeCards=useMemo(()=>[...baseCards,...retryIds.map(id=>cards.find(card=>card.id===id)).filter((card):card is Flashcard=>Boolean(card))],[baseCards,cards,retryIds]);
  const safeIndex = activeCards.length ? Math.min(index,activeCards.length-1) : 0;
  const card = activeCards[index];
  const answerSwatch = card ? getAnswerSwatch(card) : undefined;
  const knownCount = cards.filter((item) => progress[item.id]?.status === "known").length;
  const reviewCount = getForgottenFlashcards(cards,progress).length;
  const dueCount=getDueFlashcards(cards,progress).length;
  const newCount=getNewFlashcards(cards,progress).length;

  const move = (direction: number) => {
    if (!activeCards.length) return;
    setIndex((current) => Math.max(0,Math.min(activeCards.length-1,current+direction)));
    setFlipped(false);
  };
  const restartSession=()=>{setIndex(0);setFlipped(false);setRetryIds([]);setRetryCounts({});setSessionResult({remembered:0,forgot:0});setSessionProgress(progress);};
  const changeMode = (next: ReviewMode) => { setMode(next); restartSession(); if (next === "random") setShuffleSeed((seed) => seed + 1); };
  const changeCategory = (next: string) => { setCategory(next); restartSession(); };
  const mark = (status: FlashcardStatus) => {
    if (!card) return;
    setProgress(saveFlashcardStatus(card.id, status));
    if(status==="review"&&(retryCounts[card.id]??0)<FLASHCARD_SESSION_RETRY_LIMIT){setRetryIds(current=>[...current,card.id]);setRetryCounts(current=>({...current,[card.id]:(current[card.id]??0)+1}));}
    setSessionResult(current=>({...current,[status==="known"?"remembered":"forgot"]:current[status==="known"?"remembered":"forgot"]+1}));
    setIndex(current=>current+1);setFlipped(false);
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
      <div><p className="eyebrow">FLASHCARDS</p><h2 id={`${unitId}-flashcard-title`}>{title}</h2><p>今日の復習と新しいカードを分けて学習できます。</p></div>
      <div className="flashcard-summary" aria-label="暗記カードの進捗"><strong>今日 {dueCount}枚</strong><span>新しいカード {newCount}枚</span><small>覚えた {knownCount}・まだ {reviewCount}</small></div>
    </header>

    <div className="flashcard-toolbar no-print">
      <div className="flashcard-mode-tabs" aria-label="復習モード">
        {([['due',`今日の復習 ${dueCount}`],['new',`新しいカード ${newCount}`],['all','すべて'],['review','まだ'],['known','覚えた']] as Array<[ReviewMode,string]>).map(([value,label]) => <button className={mode === value ? "active" : ""} type="button" onClick={() => changeMode(value)} key={value}>{label}</button>)}
      </div>
      {categories.length > 1 && <label>カテゴリ<select value={category} onChange={(event) => changeCategory(event.target.value)}><option value="all">全部</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>}
      <button type="button" onClick={() => { setShuffleSeed((seed) => seed + 1); setMode("random"); restartSession(); }}>シャッフル</button>
      <button type="button" onClick={restartSession}>最初から</button>
      <button type="button" onClick={() => window.print()}>一覧を印刷</button>
    </div>

    {card ? <>
      <div className="flashcard-stage no-print">
        <button className="flashcard-nav" type="button" onClick={() => move(-1)} aria-label="前のカード">←</button>
        <button className={`universal-flashcard ${card.answerType === "color" ? "is-color-answer" : ""} ${flipped ? "is-flipped" : ""}`} type="button" onClick={() => setFlipped((value) => !value)} aria-label={flipped ? "カードの表面を表示" : "カードの答えを表示"} aria-pressed={flipped}>
          <span className="flashcard-face flashcard-front"><small>{card.category ?? "重要事項"}</small><strong>{card.answerType === "color" ? card.front : <ColoredChemText>{card.front}</ColoredChemText>}</strong><em>タップして答えを見る</em></span>
          <span className="flashcard-face flashcard-back"><small>ANSWER</small><strong><ColoredChemText>{card.back}</ColoredChemText></strong>{answerSwatch && <i className="flashcard-color-swatch" style={{ background: answerSwatch }} aria-hidden="true" />}{card.note && <em><ColoredChemText>{card.note}</ColoredChemText></em>}</span>
        </button>
        <button className="flashcard-nav" type="button" onClick={() => move(1)} aria-label="次のカード">→</button>
      </div>
      <div className="flashcard-position no-print"><span>{Math.min(safeIndex + 1,baseCards.length)} / {baseCards.length}{retryIds.length>0&&`（再確認 ${retryIds.length}）`}</span><div><i style={{ width: `${baseCards.length?Math.min(100,((safeIndex + 1) / baseCards.length) * 100):0}%` }} /></div></div>
      <div className="flashcard-judgement no-print">
        <button className="needs-review" type="button" disabled={!flipped} onClick={() => mark("review")}>まだ</button>
        <button className="known" type="button" disabled={!flipped} onClick={() => mark("known")}>覚えた</button>
      </div>
    </> : baseCards.length>0?<div className="flashcard-session-result"><h3>{mode==="due"?"今日の復習 完了":"暗記カード 完了"}</h3><strong>{baseCards.length}枚</strong><p>覚えた {sessionResult.remembered}回・まだ {sessionResult.forgot}回</p><button type="button" onClick={restartSession}>もう一度</button></div>:<div className="flashcard-empty">{mode==="due"?"今日復習するカードはありません。":mode==="new"?"新しいカードはありません。":"この条件に当てはまるカードはありません。「すべて」へ戻すと全カードを表示できます。"}</div>}

    <div className="flashcard-print-list">
      <h2>{title}</h2><table><thead><tr><th>カテゴリ</th><th>表面</th><th>裏面</th></tr></thead><tbody>{cards.map((item) => <tr key={item.id}><td>{item.category}</td><td><ColoredChemText>{item.front}</ColoredChemText></td><td><ColoredChemText>{item.back}</ColoredChemText>{item.note && <small>{item.note}</small>}</td></tr>)}</tbody></table>
    </div>
  </section>;
}
