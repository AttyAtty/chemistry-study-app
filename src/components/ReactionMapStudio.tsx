"use client";

import { useMemo, useState } from "react";
import { reactionMaps, type ReactionMap, type ReactionNode, type ReactionStep } from "@/data/reactionMaps";

type Variant = "full" | "no-substances" | "no-reactions" | "names" | "random";
type Token = { id: string; kind: "node" | "step"; text: string };

const variants: Array<[Variant, string]> = [
  ["full", "全情報"], ["no-substances", "物質を空欄"], ["no-reactions", "反応を空欄"],
  ["names", "物質名のみ"], ["random", "ランダム穴埋め"],
];

const nodeText = (node: ReactionNode) => `${node.name}\n${node.formula}`;
const stepText = (step: ReactionStep) => `${step.label}${step.condition ? `｜${step.condition}` : ""}`;
const hash = (value: string) => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);

function Diagram({ map, variant, randomSeed = 0 }: { map: ReactionMap; variant: Variant; randomSeed?: number }) {
  const hidden = (key: string) => variant === "random" && hash(`${key}-${randomSeed}`) % 3 === 0;
  return <div className="reaction-path-list">
    {map.paths.map((path, pathIndex) => <div className="reaction-path" key={`${map.id}-${pathIndex}`}>
      {path.nodes.map((node, nodeIndex) => {
        const hideNode = variant === "no-substances" || hidden(`n-${pathIndex}-${nodeIndex}`);
        const step = path.steps[nodeIndex];
        const hideStep = variant === "no-reactions" || variant === "names" || hidden(`s-${pathIndex}-${nodeIndex}`);
        return <div className="reaction-fragment" key={`${node.name}-${nodeIndex}`}>
          <div className={`substance-box ${hideNode ? "blank" : ""}`}>
            {!hideNode && <><b>{node.name}</b>{variant !== "names" && <span>{node.formula}</span>}</>}
          </div>
          {step && <div className={`reaction-arrow ${step.important ? "important" : ""}`}>
            <span className="arrow-line">→</span>
            {!hideStep ? <span className="reaction-label"><b>{step.label}</b>{step.condition && <small>{step.condition}</small>}</span> : <span className="reaction-label blank-label">反応・条件</span>}
          </div>}
        </div>;
      })}
    </div>)}
  </div>;
}

function Puzzle({ map }: { map: ReactionMap }) {
  const tokens = useMemo<Token[]>(() => map.paths.flatMap((path, pi) => [
    ...path.nodes.map((node, ni) => ({ id: `n-${pi}-${ni}`, kind: "node" as const, text: nodeText(node) })),
    ...path.steps.map((step, si) => ({ id: `s-${pi}-${si}`, kind: "step" as const, text: stepText(step) })),
  ]).sort((a,b) => hash(`${map.id}-${a.id}`) - hash(`${map.id}-${b.id}`)), [map]);
  const [placed, setPlaced] = useState<Record<string,string>>({});
  const [dragged, setDragged] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const byId = new Map(tokens.map(token => [token.id, token]));
  const used = new Set(Object.values(placed));

  function put(slot: string, tokenId: string) {
    const requiredKind = slot.startsWith("n-") ? "node" : "step";
    if (byId.get(tokenId)?.kind !== requiredKind) return;
    setPlaced(current => ({ ...Object.fromEntries(Object.entries(current).filter(([, value]) => value !== tokenId)), [slot]: tokenId }));
    setChecked(false);
  }

  return <div className="reaction-puzzle">
    <p className="puzzle-help">下のカードを、薄い黒枠または矢印の上へドラッグしてください。カードを選んでから枠を押す方法でも置けます。</p>
    <div className="puzzle-board">
      {map.paths.map((path, pi) => <div className="reaction-path" key={pi}>{path.nodes.map((node, ni) => {
        const nodeSlot = `n-${pi}-${ni}`; const stepSlot = `s-${pi}-${ni}`; const step = path.steps[ni];
        return <div className="reaction-fragment" key={nodeSlot}>
          <button className={`puzzle-slot substance-box ${checked ? (placed[nodeSlot] === nodeSlot ? "correct" : "wrong") : ""}`} onDragOver={e=>e.preventDefault()} onDrop={()=>dragged&&put(nodeSlot,dragged)} onClick={()=>dragged&&put(nodeSlot,dragged)}>
            {placed[nodeSlot] ? byId.get(placed[nodeSlot])?.text.split("\n").map(x=><span key={x}>{x}</span>) : <span>{node.name.length > 7 ? "物質" : "物質名・化学式"}</span>}
          </button>
          {step && <button className={`puzzle-slot reaction-arrow puzzle-arrow ${checked ? (placed[stepSlot] === stepSlot ? "correct" : "wrong") : ""}`} onDragOver={e=>e.preventDefault()} onDrop={()=>dragged&&put(stepSlot,dragged)} onClick={()=>dragged&&put(stepSlot,dragged)}>
            <span className="arrow-line">→</span><span className="reaction-label">{placed[stepSlot] ? byId.get(placed[stepSlot])?.text : "反応・条件"}</span>
          </button>}
        </div>;
      })}</div>)}
    </div>
    <div className="token-bank">
      {tokens.filter(token=>!used.has(token.id)).map(token=><button draggable onDragStart={()=>setDragged(token.id)} onClick={()=>setDragged(token.id)} className={`${token.kind} ${dragged===token.id?"selected":""}`} key={token.id}>{token.text}</button>)}
    </div>
    <div className="puzzle-actions"><button onClick={()=>setChecked(true)}>答え合わせ</button><button onClick={()=>{setPlaced({});setChecked(false);}}>最初から</button><span>{checked && (tokens.every(t=>placed[t.id]===t.id) ? "完成！すべて正解です。" : checked ? "赤い場所を入れ替えてみましょう。" : "")}</span></div>
  </div>;
}

export function ReactionMapStudio({ category }: { category: "organic" | "inorganic" }) {
  const maps = reactionMaps.filter(map => map.category === category);
  const [mapId, setMapId] = useState(maps[0].id);
  const [variant, setVariant] = useState<Variant>("full");
  const [puzzle, setPuzzle] = useState(false);
  const [randomSeed, setRandomSeed] = useState(1);
  const map = maps.find(item => item.id === mapId) ?? maps[0];
  return <div className="reaction-map-studio">
    <div className="map-toolbar no-print">
      <label>系統図<select value={map.id} onChange={e=>{setMapId(e.target.value);setPuzzle(false);}}>{maps.map(item=><option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
      <div className="variant-buttons">{variants.map(([value,label])=><button className={!puzzle&&variant===value?"active":""} onClick={()=>{setVariant(value);setPuzzle(false);if(value==="random")setRandomSeed(x=>x+1);}} key={value}>{label}</button>)}</div>
      <button className={puzzle?"puzzle-button active":"puzzle-button"} onClick={()=>setPuzzle(true)}>パズルモード</button>
      <button className="print-map-button" onClick={()=>window.print()}>この系統図を印刷</button>
    </div>
    <div className="reaction-map-print-area">
      <header className="map-title"><p>{category === "organic" ? "有機化学" : "無機化学"} 反応系統図</p><h3>{map.title}</h3><span>{puzzle ? "パズル" : variants.find(([v])=>v===variant)?.[1]}</span></header>
      {puzzle ? <Puzzle key={map.id} map={map}/> : <Diagram map={map} variant={variant} randomSeed={randomSeed}/>} 
    </div>
  </div>;
}
