"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { reactionMaps, type ReactionMap, type ReactionNode, type ReactionStep } from "@/data/reactionMaps";
import { AromaticStructure, isAromaticCompound } from "@/components/AromaticStructure";
import { computeBoundingBox, computeLayout, computeScaleToFitA4, getBestPageOrientation, type LayoutNode } from "@/lib/reactionLayout";

type Variant = "full" | "no-substances" | "no-reactions" | "names" | "random";
type Token = { id: string; kind: "node" | "step"; text: string };

const variants: Array<[Variant, string]> = [
  ["full", "全情報"], ["no-substances", "物質を空欄"], ["no-reactions", "反応を空欄"],
  ["names", "物質名のみ"], ["random", "ランダム穴埋め"],
];

const nodeText = (node: ReactionNode) => `${node.name}\n${node.formula}${node.appearance ? `\n色：${node.appearance}` : ""}`;
const scopeLabels:Record<NonNullable<ReactionStep["scope"]>,string>={core:"基本",advanced:"発展",supplement:"補足",industrial:"工業的反応"};
const stepText = (step: ReactionStep) => `${step.label}${step.condition ? `｜${step.condition}` : ""}${step.scope&&step.scope!=="core"?`｜${scopeLabels[step.scope]}`:""}${step.note?`｜${step.note}`:""}`;
const hash = (value: string) => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);

function buildGraph(map:ReactionMap) {
  const nodeMap=new Map<string,ReactionNode>();const edges:Array<{id:string;from:string;to:string;step:ReactionStep}>=[];
  map.paths.forEach((path,pi)=>path.nodes.forEach((node,ni)=>{const id=`${node.name}|${node.formula}`;nodeMap.set(id,node);if(path.steps[ni]&&path.nodes[ni+1])edges.push({id:`edge-${pi}-${ni}`,from:id,to:`${path.nodes[ni+1].name}|${path.nodes[ni+1].formula}`,step:path.steps[ni]});}));
  return {nodes:[...nodeMap.entries()].map(([id,node])=>({id,node})),edges};
}

function layoutGraph(map:ReactionMap,graph:ReturnType<typeof buildGraph>) {
  const canvas=map.canvas??{width:1000,height:540};const degree=new Map(graph.nodes.map(item=>[item.id,0]));
  graph.edges.forEach(edge=>{degree.set(edge.from,(degree.get(edge.from)??0)+1);degree.set(edge.to,(degree.get(edge.to)??0)+1);});
  const centerId=graph.nodes.find(item=>item.node.name===map.centerNode)?.id??[...graph.nodes].sort((a,b)=>(degree.get(b.id)??0)-(degree.get(a.id)??0))[0]?.id;
  const layoutNodes:LayoutNode[]=graph.nodes.map(item=>({id:item.id,width:isAromaticCompound(item.node.name)?196:176,height:isAromaticCompound(item.node.name)?164:90,zone:item.id===centerId?"center":map.zones?.[item.node.name]}));
  const positions=computeLayout(layoutNodes,canvas.width,canvas.height);if(centerId)positions[centerId]={x:canvas.width/2,y:canvas.height/2};
  return {canvas,layoutNodes,positions,bbox:computeBoundingBox(layoutNodes,positions)};
}

type PrintConfig = { orientation:"portrait"|"landscape"; scale:number; rotate:boolean; offsetX:number; offsetY:number };

function Diagram({ map, variant, randomSeed = 0, editable = false, printConfig }: { map: ReactionMap; variant: Variant; randomSeed?: number; editable?: boolean; printConfig:PrintConfig }) {
  const canvas = map.canvas ?? { width:1000, height:540 };
  const canvasStyle = {width:canvas.width,height:canvas.height,"--map-print-scale":printConfig.scale,"--map-print-x":`${printConfig.offsetX}px`,"--map-print-y":`${printConfig.offsetY}px`} as CSSProperties;
  const graph = useMemo(() => buildGraph(map),[map]);
  const initial = useMemo(() => layoutGraph(map,graph).positions,[graph,map]);
  const [positions, setPositions] = useState(initial);
  const [activeBlank, setActiveBlank] = useState<{ id:string; kind:"node"|"step"; correct:string } | null>(null);
  const [blankResults, setBlankResults] = useState<Record<string,{ correct:boolean; chosen:string }>>({});
  const boardRef = useRef<HTMLDivElement>(null);
  const hidden = (key: string) => variant === "random" && hash(`${key}-${randomSeed}`) % 3 === 0;
  const nodeById = new Map(graph.nodes.map(item=>[item.id,item.node]));
  const choices = activeBlank ? [...new Set([
    activeBlank.correct,
    ...(activeBlank.kind === "node" ? graph.nodes.map(item=>nodeText(item.node)) : graph.edges.map(edge=>stepText(edge.step))),
  ])].sort((a,b)=>hash(`${activeBlank.id}-${a}`)-hash(`${activeBlank.id}-${b}`)).slice(0,4) : [];
  if (activeBlank && !choices.includes(activeBlank.correct)) choices[choices.length-1]=activeBlank.correct;
  const moveNode = (id: string, clientX: number, clientY: number) => {
    if (!editable || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setPositions(current => ({ ...current, [id]: { x: Math.max(105,Math.min(canvas.width-105,clientX-rect.left)), y: Math.max(85,Math.min(canvas.height-85,clientY-rect.top)) } }));
  };
  return <div className={`reaction-network ${editable ? "editing" : ""}`} style={canvasStyle} ref={boardRef}>
    <svg className="reaction-edge-layer" viewBox={`0 0 ${canvas.width} ${canvas.height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs><marker id={`arrow-${map.id}`} markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" /></marker></defs>
      {graph.edges.map(edge => { const a=positions[edge.from], b=positions[edge.to]; if(!a||!b)return null; const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;const boundary=(node?:ReactionNode)=>{const hw=isAromaticCompound(node?.name??"")?98:88,hh=isAromaticCompound(node?.name??"")?82:45;return Math.min(Math.abs(ux)>0.001?hw/Math.abs(ux):Infinity,Math.abs(uy)>0.001?hh/Math.abs(uy):Infinity)+8;};const start=boundary(nodeById.get(edge.from)),end=boundary(nodeById.get(edge.to)); const sx=a.x+ux*start,sy=a.y+uy*start,ex=b.x-ux*end,ey=b.y-uy*end; return <line key={edge.id} x1={sx} y1={sy} x2={ex} y2={ey} markerEnd={`url(#arrow-${map.id})`} />; })}
    </svg>
    {graph.edges.map((edge,index) => { const a=positions[edge.from],b=positions[edge.to];if(!a||!b)return null;const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,side=index%2?1:-1,distance=24+(index%3)*9,labelX=(a.x+b.x)/2-dy/len*distance*side,labelY=(a.y+b.y)/2+dx/len*distance*side;const blank=variant==="no-reactions"||variant==="names"||hidden(edge.id);const solved=blankResults[edge.id]?.correct;const hide=blank&&!solved; return <div role={hide&&variant==="random"?"button":undefined} tabIndex={hide&&variant==="random"?0:undefined} onClick={()=>hide&&variant==="random"&&setActiveBlank({id:edge.id,kind:"step",correct:stepText(edge.step)})} className={`network-edge-label scope-${edge.step.scope??"core"} ${edge.step.important?"important":""} ${hide?"blank-label clickable-blank":""} ${blankResults[edge.id]?(blankResults[edge.id].correct?"blank-correct":"blank-wrong"):""}`} style={{left:labelX,top:labelY}} key={edge.id}>{hide ? "反応・条件" : <><b>{edge.step.label}</b>{edge.step.scope&&edge.step.scope!=="core"&&<em>{scopeLabels[edge.step.scope]}</em>}{edge.step.condition&&<small>{edge.step.condition}</small>}{edge.step.note&&<span className="reaction-note">{edge.step.note}</span>}</>}</div>; })}
    {graph.nodes.map(({id,node}) => { const point=positions[id];const resultKey=`node-${id}`;const blank=variant==="no-substances"||hidden(resultKey);const solved=blankResults[resultKey]?.correct;const hide=blank&&!solved; const aromatic=isAromaticCompound(node.name); return <div role={hide&&variant==="random"?"button":undefined} tabIndex={hide&&variant==="random"?0:undefined} onClick={()=>hide&&variant==="random"&&setActiveBlank({id:resultKey,kind:"node",correct:nodeText(node)})} draggable={editable} onDragEnd={e=>moveNode(id,e.clientX,e.clientY)} className={`network-node substance-box ${aromatic?"aromatic-node":""} ${hide?"blank clickable-blank":""} ${blankResults[resultKey]?(blankResults[resultKey].correct?"blank-correct":"blank-wrong"):""}`} style={{left:point.x,top:point.y}} key={id}>{!hide&&<><b>{node.name}</b>{variant!=="names"&&<><span>{node.formula}</span><AromaticStructure name={node.name}/>{node.appearance&&<em className="appearance-badge" style={{color:node.appearanceColor,borderColor:node.appearanceColor}}>● {node.appearance}</em>}</>}</>}</div>; })}
    {activeBlank && <div className="blank-choice-panel no-print"><b>空欄に入るものを選択</b><div>{choices.map(choice=><button onClick={()=>{const correct=choice===activeBlank.correct;setBlankResults(current=>({...current,[activeBlank.id]:{correct,chosen:choice}}));if(correct)setActiveBlank(null);}} key={choice}>{choice}</button>)}</div>{blankResults[activeBlank.id]&&!blankResults[activeBlank.id].correct&&<p><strong>不正解</strong>　正答：{activeBlank.correct}<br/><small>{activeBlank.kind==="node"?"物質名と化学式を、つながる反応から確認しましょう。":"反応名だけでなく、試薬・触媒・温度条件までセットで確認しましょう。"}</small></p>}<button className="close-panel" onClick={()=>setActiveBlank(null)}>閉じる</button></div>}
    {editable && <button className="reset-layout no-print" onClick={()=>setPositions(initial)}>配置を元に戻す</button>}
  </div>;
}

function Puzzle({ map, printConfig }: { map: ReactionMap; printConfig:PrintConfig }) {
  const canvas = map.canvas ?? { width:1000, height:540 };
  const canvasStyle = {width:canvas.width,height:canvas.height,"--map-print-scale":printConfig.scale,"--map-print-x":`${printConfig.offsetX}px`,"--map-print-y":`${printConfig.offsetY}px`} as CSSProperties;
  const graph = useMemo(()=>buildGraph(map),[map]);
  const positions = useMemo(()=>layoutGraph(map,graph).positions,[graph,map]);
  const tokens = useMemo<Token[]>(() => [
    ...graph.nodes.map(item=>({id:`node:${item.id}`,kind:"node" as const,text:nodeText(item.node)})),
    ...graph.edges.map(edge=>({id:`step:${edge.id}`,kind:"step" as const,text:stepText(edge.step)})),
  ].sort((a,b)=>hash(`${map.id}-${a.id}`)-hash(`${map.id}-${b.id}`)),[graph,map]);
  const [placed, setPlaced] = useState<Record<string,string>>({});
  const [dragged, setDragged] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const startedAt = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const byId = new Map(tokens.map(token => [token.id, token]));
  const used = new Set(Object.values(placed));

  function put(slot: string, tokenId: string, eventTime: number) {
    if (startedAt.current === null) startedAt.current = eventTime;
    const requiredKind = slot.startsWith("node:") ? "node" : "step";
    if (byId.get(tokenId)?.kind !== requiredKind) return;
    if (slot !== tokenId) {
      const label = byId.get(slot)?.text.split("\n")[0] ?? "未特定の箇所";
      setMistakes(current => current.includes(label) ? current : [...current,label]);
    }
    const next = { ...Object.fromEntries(Object.entries(placed).filter(([, value]) => value !== tokenId)), [slot]: tokenId };
    setPlaced(next);
    if (tokens.every(token => next[token.id] === token.id)) {
      setChecked(true);
      setElapsedSeconds(Math.max(1,Math.round((eventTime-startedAt.current)/1000)));
    } else setChecked(false);
  }

  function checkPuzzle(eventTime: number) {
    setChecked(true);
    const wrong = tokens.filter(token => placed[token.id] !== token.id);
    if (wrong.length === 0) setElapsedSeconds(Math.max(1,Math.round((eventTime-(startedAt.current??eventTime))/1000)));
    else setMistakes(current => [...new Set([...current,...wrong.filter(token=>placed[token.id]).map(token=>token.text.split("\n")[0])])]);
  }

  function resetPuzzle() {
    setPlaced({}); setChecked(false); setDragged(null); setMistakes([]); setElapsedSeconds(null); startedAt.current=null;
  }

  return <div className="reaction-puzzle network-puzzle">
    <p className="puzzle-help">下のカードを、薄い黒枠または矢印の上へドラッグしてください。カードを選んでから枠を押す方法でも置けます。</p>
    <div className="puzzle-network" style={canvasStyle}>
      <svg className="reaction-edge-layer" viewBox={`0 0 ${canvas.width} ${canvas.height}`} preserveAspectRatio="none"><defs><marker id={`puzzle-arrow-${map.id}`} markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z"/></marker></defs>{graph.edges.map(edge=>{const a=positions[edge.from],b=positions[edge.to];return <line key={edge.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} markerEnd={`url(#puzzle-arrow-${map.id})`}/>;})}</svg>
      {graph.nodes.map(item=>{const slot=`node:${item.id}`,point=positions[item.id];return <button style={{left:point.x,top:point.y}} className={`puzzle-slot network-node substance-box ${checked?(placed[slot]===slot?"correct":"wrong"):""}`} onDragOver={e=>e.preventDefault()} onDrop={e=>dragged&&put(slot,dragged,e.timeStamp)} onClick={e=>dragged&&put(slot,dragged,e.timeStamp)} key={slot}>{placed[slot]?byId.get(placed[slot])?.text.split("\n").map(x=><span key={x}>{x}</span>):<span>物質名・化学式</span>}</button>;})}
      {graph.edges.map((edge,index)=>{const slot=`step:${edge.id}`,a=positions[edge.from],b=positions[edge.to];const offset=(index%2?18:-18);return <button style={{left:(a.x+b.x)/2,top:(a.y+b.y)/2+offset}} className={`puzzle-slot network-edge-label ${checked?(placed[slot]===slot?"correct":"wrong"):""}`} onDragOver={e=>e.preventDefault()} onDrop={e=>dragged&&put(slot,dragged,e.timeStamp)} onClick={e=>dragged&&put(slot,dragged,e.timeStamp)} key={slot}>{placed[slot]?byId.get(placed[slot])?.text:"反応・条件"}</button>;})}
    </div>
    <div className="token-bank">
      {tokens.filter(token=>!used.has(token.id)).map(token=><button draggable onDragStart={()=>setDragged(token.id)} onClick={()=>setDragged(token.id)} className={`${token.kind} ${dragged===token.id?"selected":""}`} key={token.id}>{token.text}</button>)}
    </div>
    <div className="puzzle-actions"><button onClick={e=>checkPuzzle(e.timeStamp)}>答え合わせ</button><button onClick={resetPuzzle}>最初から</button><span>{checked && (tokens.every(t=>placed[t.id]===t.id) ? "完成！すべて正解です。" : checked ? "赤い場所を入れ替えてみましょう。" : "")}</span></div>
    {elapsedSeconds!==null&&<section className="puzzle-result"><h4>系統図完成！</h4><div><p><span>正解数</span><b>{tokens.length} / {tokens.length}</b></p><p><span>所要時間</span><b>{Math.floor(elapsedSeconds/60)}分 {elapsedSeconds%60}秒</b></p><p><span>間違えた箇所</span><b>{mistakes.length}か所</b></p></div>{mistakes.length>0?<ul>{mistakes.map(item=><li key={item}>{item}</li>)}</ul>:<p className="perfect-result">一度も間違えずに完成しました。</p>}</section>}
  </div>;
}

export function ReactionMapStudio({ category }: { category: "organic" | "inorganic" }) {
  const maps = reactionMaps.filter(map => map.category === category);
  const [mapId, setMapId] = useState(maps[0].id);
  const [variant, setVariant] = useState<Variant>("full");
  const [puzzle, setPuzzle] = useState(false);
  const [editable, setEditable] = useState(false);
  const [randomSeed, setRandomSeed] = useState(1);
  const [printDirection, setPrintDirection] = useState<"auto"|"portrait"|"landscape"|"rotate">("auto");
  const [printSizing, setPrintSizing] = useState<"fit"|"actual">("fit");
  const [screenZoom,setScreenZoom]=useState(1);
  const viewportRef=useRef<HTMLDivElement>(null);
  const map = maps.find(item => item.id === mapId) ?? maps[0];
  const printLayout = layoutGraph(map,buildGraph(map));
  const bestOrientation=getBestPageOrientation(printLayout.bbox),rotate=printDirection==="rotate";
  const orientation=printDirection==="auto"?bestOrientation:printDirection==="landscape"?"landscape":"portrait";
  const scaleBox=rotate?{width:printLayout.bbox.height,height:printLayout.bbox.width}:printLayout.bbox;
  const scale=computeScaleToFitA4(scaleBox,orientation,printSizing==="fit"),safe=orientation==="landscape"?{width:1040,height:700}:{width:700,height:1040};
  const offsetX=rotate?(safe.width-printLayout.bbox.height*scale)/2+printLayout.bbox.maxY*scale:(safe.width-printLayout.bbox.width*scale)/2-printLayout.bbox.minX*scale;
  const offsetY=rotate?(safe.height-printLayout.bbox.width*scale)/2-printLayout.bbox.minX*scale:(safe.height-printLayout.bbox.height*scale)/2-printLayout.bbox.minY*scale;
  const printConfig:PrintConfig={orientation,rotate,scale,offsetX,offsetY};
  const printOrientation = orientation==="landscape" ? "map-landscape" : "map-portrait";
  return <div className="reaction-map-studio">
    <div className="map-toolbar no-print">
      <label>系統図<select value={map.id} onChange={e=>{setMapId(e.target.value);setPuzzle(false);setEditable(false);}}>{maps.map(item=><option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
      <div className="variant-buttons">{variants.map(([value,label])=><button className={!puzzle&&variant===value?"active":""} onClick={()=>{setVariant(value);setPuzzle(false);if(value==="random")setRandomSeed(x=>x+1);}} key={value}>{label}</button>)}</div>
      <button className={puzzle?"puzzle-button active":"puzzle-button"} onClick={()=>setPuzzle(true)}>パズルモード</button>
      <button className={editable&&!puzzle?"layout-button active":"layout-button"} onClick={()=>{setPuzzle(false);setEditable(value=>!value);}}>配置編集</button>
      <label>印刷方向<select value={printDirection} onChange={e=>setPrintDirection(e.target.value as typeof printDirection)}><option value="auto">自動</option><option value="portrait">縦</option><option value="landscape">横</option><option value="rotate">縦へ90°回転</option></select></label>
      <label>印刷倍率<select value={printSizing} onChange={e=>setPrintSizing(e.target.value as typeof printSizing)}><option value="fit">ページに合わせる</option><option value="actual">100%</option></select></label>
      <button className="print-map-button" onClick={()=>window.print()}>この系統図を印刷</button>
    </div>
    <div className={`reaction-map-print-area ${printOrientation} ${rotate?"print-rotate":""}`}>
      <header className="map-title"><p>{category === "organic" ? "有機化学" : "無機化学"} 反応系統図</p><h3>{map.title}</h3><span>{puzzle ? "パズル" : variants.find(([v])=>v===variant)?.[1]}</span></header>
      {category==="organic"&&<div className="reaction-scope-legend no-print"><span className="core">基本</span><span className="advanced">発展</span><span className="supplement">補足</span><span className="industrial">工業的反応</span></div>}
      <div className="map-screen-controls no-print"><button aria-label="系統図を縮小" onClick={()=>setScreenZoom(value=>Math.max(.55,value-.1))}>−</button><output>{Math.round(screenZoom*100)}%</output><button aria-label="系統図を拡大" onClick={()=>setScreenZoom(value=>Math.min(1.4,value+.1))}>＋</button><button onClick={()=>{const element=viewportRef.current;if(element){element.scrollTo({left:(element.scrollWidth-element.clientWidth)/2,top:(element.scrollHeight-element.clientHeight)/2,behavior:"smooth"});}}}>中心物質へ戻る</button></div>
      <div className="reaction-map-viewport" ref={viewportRef}><div className="reaction-map-screen-scale" style={{transform:`scale(${screenZoom})`,transformOrigin:"top left",width:`${100/screenZoom}%`}}>
        {puzzle ? <Puzzle key={map.id} map={map} printConfig={printConfig}/> : <Diagram key={map.id} map={map} variant={variant} randomSeed={randomSeed} editable={editable} printConfig={printConfig}/>} 
      </div></div>
    </div>
  </div>;
}
