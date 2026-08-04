"use client";

import { useMemo, useState } from "react";
import { AromaticStructure, isAromaticCompound } from "@/components/AromaticStructure";
import { organicCompounds, organicReactions, type OrganicImportance } from "@/data/organicReactionMaps";

const filters:Array<["all"|OrganicImportance,string]>=[["all","すべて"],["core","基本・重要"],["advanced","発展"],["supplement","補足"],["industrial","工業的反応"]];
const labels:Record<OrganicImportance,string>={core:"基本・重要",advanced:"発展",supplement:"補足",industrial:"工業的反応"};

export function OrganicKnowledgeBrowser(){
  const [filter,setFilter]=useState<"all"|OrganicImportance>("all");
  const [query,setQuery]=useState("");
  const normalized=query.trim().toLowerCase();
  const compounds=useMemo(()=>organicCompounds.filter(compound=>!normalized||[compound.nameJa,compound.nameEn,compound.formula,...compound.aliases,...compound.classifications].filter(Boolean).some(value=>value!.toLowerCase().includes(normalized))).slice(0,24),[normalized]);
  const reactions=useMemo(()=>organicReactions.filter(reaction=>(filter==="all"||reaction.importance===filter)&&(!normalized||[reaction.source.name,reaction.target.name,reaction.reactionName,...reaction.conditions,...reaction.relatedMaps].some(value=>value.toLowerCase().includes(normalized)))),[filter,normalized]);
  return <div className="organic-knowledge-browser">
    <div className="organic-knowledge-tools no-print">
      <label>物質・反応を検索<input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="例：フェノール、H₂SO₄、付加重合"/></label>
      <div role="group" aria-label="知識の区分">{filters.map(([value,label])=><button className={filter===value?"active":""} onClick={()=>setFilter(value)} key={value}>{label}</button>)}</div>
    </div>
    {normalized&&<section className="organic-compound-results"><h3>物質</h3><div>{compounds.map(compound=><article key={compound.id}><div>{isAromaticCompound(compound.nameJa)&&<AromaticStructure name={compound.nameJa}/>}</div><h4>{compound.nameJa}</h4><b>{compound.formula}</b>{compound.nameEn&&<small>{compound.nameEn}</small>}<p>{compound.classifications.join("・")||"有機化合物"}</p><span>関連反応 {compound.relatedReactionIds.length}件</span></article>)}</div>{compounds.length===0&&<p>一致する物質はありません。</p>}</section>}
    <section className="organic-reaction-list" aria-live="polite"><h3>反応データ <small>{reactions.length}件</small></h3>
      {reactions.map(reaction=>{
        const body=<><div className="organic-reaction-route"><strong>{reaction.source.name}</strong><span>→</span><strong>{reaction.target.name}</strong></div><dl>{reaction.reagents.length>0&&<><dt>試薬</dt><dd>{reaction.reagents.join("・")}</dd></>}{reaction.catalysts.length>0&&<><dt>触媒</dt><dd>{reaction.catalysts.join("・")}</dd></>}{reaction.temperature&&<><dt>温度</dt><dd>{reaction.temperature}</dd></>}{reaction.pressure&&<><dt>圧力</dt><dd>{reaction.pressure}</dd></>}{reaction.byproducts.length>0&&<><dt>副生成物・現象</dt><dd>{reaction.byproducts.join("・")}</dd></>}{reaction.conditions.length>0&&<><dt>条件</dt><dd>{reaction.conditions.join("・")}</dd></>}{reaction.notes&&<><dt>注記</dt><dd>{reaction.notes}</dd></>}</dl></>;
        return reaction.importance==="core"?<article className={`organic-reaction-card scope-${reaction.importance}`} key={reaction.id}><header><span>{labels[reaction.importance]}</span><h4>{reaction.reactionName}</h4></header>{body}</article>:<details className={`organic-reaction-card scope-${reaction.importance}`} key={reaction.id}><summary><span>{labels[reaction.importance]}</span><b>{reaction.source.name} → {reaction.target.name}</b><small>{reaction.reactionName}</small></summary>{body}</details>;
      })}
      {reactions.length===0&&<p>条件に一致する反応はありません。</p>}
    </section>
  </div>;
}
