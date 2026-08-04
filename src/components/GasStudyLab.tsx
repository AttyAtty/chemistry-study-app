"use client";

import { useMemo, useState } from "react";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { getGasFlashcards } from "@/data/flashcards";
import { gases, solubilityLabels, type GasData } from "@/data/gases";

type Mode="cards"|"fill"|"classify";
type Classification="collection"|"solubility"|"color";
const collectionCategory=(gas:GasData)=>gas.specialCollectionNote?"特殊設備":gas.collectionMethods[0].startsWith("水上")?"水上置換":gas.collectionMethods[0].startsWith("上方")?"上方置換":"下方置換";
const categoryFor=(gas:GasData,type:Classification)=>type==="collection"?collectionCategory(gas):type==="solubility"?solubilityLabels[gas.waterSolubility]:gas.color==="無色"?"無色気体":"有色気体";
const categoriesFor=(type:Classification)=>type==="collection"?["水上置換","上方置換","下方置換","特殊設備"]:type==="solubility"?Object.values(solubilityLabels):["無色気体","有色気体"];

export function GasStudyLab(){
  const [mode,setMode]=useState<Mode>("cards");const [index,setIndex]=useState(0);
  const [revealed,setRevealed]=useState<string[]>([]);const [classification,setClassification]=useState<Classification>("collection");
  const [placed,setPlaced]=useState<Record<string,string>>({});const [dragged,setDragged]=useState<string|null>(null);const [checked,setChecked]=useState(false);
  const gas=gases[index];const categories=categoriesFor(classification);
  const score=useMemo(()=>gases.filter(item=>placed[item.id]===categoryFor(item,classification)).length,[classification,placed]);
  const changeGas=(next:number)=>{setIndex((next+gases.length)%gases.length);setRevealed([]);};
  const changeClassification=(value:Classification)=>{setClassification(value);setPlaced({});setChecked(false);};
  return <div className="gas-lab">
    <div className="gas-mode-tabs">{([['cards','気体カード'],['fill','穴埋め'],['classify','ドラッグ分類']] as Array<[Mode,string]>).map(([value,label])=><button className={mode===value?"active":""} onClick={()=>setMode(value)} key={value}>{label}</button>)}</div>
    {mode==="cards"&&<FlashcardDeck cards={getGasFlashcards()} unitId="laboratory-gases" title="気体の暗記カード" embedded />}
    {mode==="fill"&&<div className="gas-fill-mode"><div className="gas-selector"><label>気体<select value={index} onChange={event=>changeGas(Number(event.target.value))}>{gases.map((item,i)=><option value={i} key={item.id}>{item.order}. {item.name}</option>)}</select></label></div><h3>{gas.name} {gas.formula}</h3><p>空欄をタップして答えを確認してください。</p><div className="gas-fill-grid">{[
      ["color","色",gas.color],["odor","におい",gas.odor],["water","水への溶けやすさ",solubilityLabels[gas.waterSolubility]],["reagents","原料・試薬",gas.preparation[0].reagents.join("＋")],["equation","製法反応式",gas.preparation[0].equation],["collection","捕集方法",gas.collectionMethods.join("、")],["detection","検出",gas.detectionMethods[0].description]
    ].map(([id,label,value])=><button className={revealed.includes(id)?"revealed":""} onClick={()=>setRevealed(current=>current.includes(id)?current:[...current,id])} key={id}><span>{label}</span><b>{revealed.includes(id)?value:"？？？"}</b></button>)}</div></div>}
    {mode==="classify"&&<div className="gas-classify-mode"><div className="classification-toolbar"><label>分類テーマ<select value={classification} onChange={event=>changeClassification(event.target.value as Classification)}><option value="collection">捕集方法</option><option value="solubility">水への溶けやすさ</option><option value="color">有色・無色</option></select></label><button onClick={()=>setChecked(true)}>答え合わせ</button><button onClick={()=>{setPlaced({});setChecked(false);}}>リセット</button><b>{checked&&`正解 ${score} / 14`}</b></div><div className="gas-drop-zones">{categories.map(category=>{const place=()=>{if(dragged){setPlaced(current=>({...current,[dragged]:category}));setChecked(false);setDragged(null);}};return <section onClick={place} onDragOver={event=>event.preventDefault()} onDrop={place} key={category}><h4>{category}</h4>{gases.filter(item=>placed[item.id]===category).map(item=><button draggable onDragStart={()=>setDragged(item.id)} className={checked?(categoryFor(item,classification)===category?"correct":"wrong"):""} key={item.id}>{item.name} {item.formula}</button>)}</section>})}</div><div className="gas-token-bank">{gases.filter(item=>!placed[item.id]).map(item=><button draggable onDragStart={()=>setDragged(item.id)} onClick={()=>setDragged(item.id)} className={dragged===item.id?"selected":""} key={item.id}>{item.name} {item.formula}</button>)}</div>{dragged&&<p className="tap-classify">スマートフォンではカードを選択後、分類先をタップしてください。</p>}</div>}
  </div>;
}
