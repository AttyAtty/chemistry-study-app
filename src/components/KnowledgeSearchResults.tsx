import Link from "next/link";
import { ColoredChemText } from "@/components/ColoredChemText";
import { getRelatedKnowledge, searchTypeLabels, type SearchItem } from "@/lib/knowledgeSearch";

export function KnowledgeSearchResults({items}:{items:SearchItem[]}){
  return <div className="knowledge-search-results">{items.map(item=>{const related=getRelatedKnowledge(item);return <article className="search-result-card" id={`result-${item.id}`} key={item.id}>
    <div className="search-result-main"><span className="search-type-label">{searchTypeLabels[item.type]}</span><h2><Link href={item.href}><ColoredChemText>{item.title}</ColoredChemText></Link></h2>{item.formula&&<div className="search-formula"><ColoredChemText>{item.formula}</ColoredChemText></div>}{item.description&&<p><ColoredChemText>{item.description}</ColoredChemText></p>}<Link className="search-detail-link" href={item.href}>{item.type==="compound"?"反応系統図で見る":"教材で確認する"} →</Link></div>
    {related.length>0&&<aside className="related-knowledge" aria-label={`${item.title}の関連知識`}><h3>関連知識</h3><div>{related.map(link=><Link href={link.href} key={link.id}><small>{searchTypeLabels[link.type]}</small><span><ColoredChemText>{link.title}</ColoredChemText></span>{link.formula&&<em><ColoredChemText>{link.formula}</ColoredChemText></em>}</Link>)}</div></aside>}
  </article>})}</div>;
}
