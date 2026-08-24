"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ColoredChemText } from "@/components/ColoredChemText";
import { redoxProductPredictions } from "@/data/redoxProductPredictions";

export function RedoxProductTrainer() {
  const [index,setIndex]=useState(0);
  const [revealed,setRevealed]=useState(false);
  const [showHalf,setShowHalf]=useState(false);
  const items=useMemo(()=>redoxProductPredictions.filter(item=>item.importance==="core"),[]);
  const item=items[index];
  const next=()=>{setIndex(value=>(value+1)%items.length);setRevealed(false);setShowHalf(false);};
  return <div className="redox-product-trainer">
    <div className="redox-step-strip" aria-label="学習ステップ"><span className="active">1 反応物</span><span className={revealed?"active":""}>2 生成物</span><span className={revealed?"active":""}>3 骨格</span><span className={showHalf?"active":""}>4 半反応式</span></div>
    <article className="redox-prediction-card">
      <div className="redox-condition-row"><span>{item.medium}</span><span>{item.direction}</span><small>{index+1} / {items.length}</small></div>
      <p>{item.medium!=="条件によらない"&&`${item.medium}で、`}{item.reactantName}が{item.direction}されると何になる？</p>
      <strong><ColoredChemText>{item.reactant}</ColoredChemText><b> → ?</b></strong>
      {!revealed?<button className="button primary" type="button" onClick={()=>setRevealed(true)}>答えを見る</button>:<div className="redox-reveal">
        <h3><ColoredChemText>{item.product}</ColoredChemText> <small>{item.productName}</small></h3>
        <div className="equation-box"><ColoredChemText>{item.skeleton}</ColoredChemText></div>
        <p>{item.role}として働き、自身は{item.direction}。{item.element}：{item.oxidationStateBefore} → {item.oxidationStateAfter}</p>
        {item.note&&<small>{item.note}</small>}
        {!showHalf?<button className="button secondary" type="button" onClick={()=>setShowHalf(true)}>半反応式を確認</button>:<div className="redox-half-reaction"><span>H₂O / H⁺ / OH⁻ / e⁻ を補う</span><strong><ColoredChemText>{item.halfReaction}</ColoredChemText></strong><Link href="/units/ionic-equations">イオン反応式の学習へ →</Link></div>}
      </div>}
      <button className="mini-button" type="button" onClick={next}>次の問題</button>
    </article>
  </div>;
}
