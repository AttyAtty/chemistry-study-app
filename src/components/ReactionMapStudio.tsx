"use client";

import { useMemo, useRef, useState } from "react";
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

type Point = { x: number; y: number };

function Diagram({ map, variant, randomSeed = 0, editable = false }: { map: ReactionMap; variant: Variant; randomSeed?: number; editable?: boolean }) {
  const graph = useMemo(() => {
    const nodeMap = new Map<string, ReactionNode>();
    const edges: Array<{ id: string; from: string; to: string; step: ReactionStep }> = [];
    map.paths.forEach((path, pi) => path.nodes.forEach((node, ni) => {
      const key = `${node.name}|${node.formula}`; nodeMap.set(key, node);
      if (path.steps[ni] && path.nodes[ni + 1]) edges.push({ id: `e-${pi}-${ni}`, from: key, to: `${path.nodes[ni + 1].name}|${path.nodes[ni + 1].formula}`, step: path.steps[ni] });
    }));
    return { nodes: [...nodeMap.entries()].map(([id,node]) => ({ id,node })), edges };
  }, [map]);
  const initial = useMemo(() => {
    const degree = new Map(graph.nodes.map(item => [item.id, 0]));
    graph.edges.forEach(edge => { degree.set(edge.from,(degree.get(edge.from)??0)+1); degree.set(edge.to,(degree.get(edge.to)??0)+1); });
    const center = [...graph.nodes].sort((a,b)=>(degree.get(b.id)??0)-(degree.get(a.id)??0))[0]?.id;
    const points: Record<string,Point> = {}; const others = graph.nodes.filter(item=>item.id!==center);
    if (center) points[center] = { x: 500, y: 270 };
    others.forEach((item,index) => {
      const angle = (-Math.PI / 2) + (Math.PI * 2 * index / Math.max(others.length,1));
      const radiusX = index % 2 === 0 ? 360 : 285; const radiusY = index % 2 === 0 ? 205 : 155;
      points[item.id] = { x: 500 + Math.cos(angle)*radiusX, y: 270 + Math.sin(angle)*radiusY };
    });
    return points;
  }, [graph]);
  const [positions, setPositions] = useState(initial);
  const boardRef = useRef<HTMLDivElement>(null);
  const hidden = (key: string) => variant === "random" && hash(`${key}-${randomSeed}`) % 3 === 0;
  const moveNode = (id: string, clientX: number, clientY: number) => {
    if (!editable || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setPositions(current => ({ ...current, [id]: { x: Math.max(85,Math.min(915,clientX-rect.left)), y: Math.max(48,Math.min(492,clientY-rect.top)) } }));
  };
  return <div className={`reaction-network ${editable ? "editing" : ""}`} ref={boardRef}>
    <svg className="reaction-edge-layer" viewBox="0 0 1000 540" preserveAspectRatio="none" aria-hidden="true">
      <defs><marker id={`arrow-${map.id}`} markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" /></marker></defs>
      {graph.edges.map(edge => { const a=positions[edge.from], b=positions[edge.to]; if(!a||!b)return null; const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1; const sx=a.x+dx/len*82,sy=a.y+dy/len*38,ex=b.x-dx/len*88,ey=b.y-dy/len*42; return <line key={edge.id} x1={sx} y1={sy} x2={ex} y2={ey} markerEnd={`url(#arrow-${map.id})`} />; })}
    </svg>
    {graph.edges.map(edge => { const a=positions[edge.from],b=positions[edge.to];if(!a||!b)return null;const hide=variant==="no-reactions"||variant==="names"||hidden(edge.id); return <div className={`network-edge-label ${edge.step.important?"important":""} ${hide?"blank-label":""}`} style={{left:`${(a.x+b.x)/2}px`,top:`${(a.y+b.y)/2}px`}} key={edge.id}>{hide ? "反応・条件" : <><b>{edge.step.label}</b>{edge.step.condition&&<small>{edge.step.condition}</small>}</>}</div>; })}
    {graph.nodes.map(({id,node}) => { const point=positions[id]; const hide=variant==="no-substances"||hidden(`node-${id}`); return <div draggable={editable} onDragEnd={e=>moveNode(id,e.clientX,e.clientY)} className={`network-node substance-box ${hide?"blank":""}`} style={{left:point.x,top:point.y}} key={id}>{!hide&&<><b>{node.name}</b>{variant!=="names"&&<span>{node.formula}</span>}</>}</div>; })}
    {editable && <button className="reset-layout no-print" onClick={()=>setPositions(initial)}>配置を元に戻す</button>}
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
  const [editable, setEditable] = useState(false);
  const [randomSeed, setRandomSeed] = useState(1);
  const map = maps.find(item => item.id === mapId) ?? maps[0];
  return <div className="reaction-map-studio">
    <div className="map-toolbar no-print">
      <label>系統図<select value={map.id} onChange={e=>{setMapId(e.target.value);setPuzzle(false);setEditable(false);}}>{maps.map(item=><option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
      <div className="variant-buttons">{variants.map(([value,label])=><button className={!puzzle&&variant===value?"active":""} onClick={()=>{setVariant(value);setPuzzle(false);if(value==="random")setRandomSeed(x=>x+1);}} key={value}>{label}</button>)}</div>
      <button className={puzzle?"puzzle-button active":"puzzle-button"} onClick={()=>setPuzzle(true)}>パズルモード</button>
      <button className={editable&&!puzzle?"layout-button active":"layout-button"} onClick={()=>{setPuzzle(false);setEditable(value=>!value);}}>配置編集</button>
      <button className="print-map-button" onClick={()=>window.print()}>この系統図を印刷</button>
    </div>
    <div className="reaction-map-print-area">
      <header className="map-title"><p>{category === "organic" ? "有機化学" : "無機化学"} 反応系統図</p><h3>{map.title}</h3><span>{puzzle ? "パズル" : variants.find(([v])=>v===variant)?.[1]}</span></header>
      {puzzle ? <Puzzle key={map.id} map={map}/> : <Diagram key={map.id} map={map} variant={variant} randomSeed={randomSeed} editable={editable}/>} 
    </div>
  </div>;
}
