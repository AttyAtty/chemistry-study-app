import type { Metadata } from "next";
import Link from "next/link";
import { KnowledgeSearchResults } from "@/components/KnowledgeSearchResults";
import { searchKnowledge } from "@/lib/knowledgeSearch";

export const metadata:Metadata={title:"Chemica全体検索"};
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const query=(await searchParams).q?.trim()??"",results=searchKnowledge(query);
  return <main className="page-container search-page"><header className="search-page-header"><p className="eyebrow">KNOWLEDGE SEARCH</p><h1>Chemica全体検索</h1><p>物質名、化学式、反応、重要事項から横断して探せます。</p><form className="global-search-form" action="/search"><label htmlFor="knowledge-search">化学知識を検索</label><div><input id="knowledge-search" name="q" type="search" defaultValue={query} placeholder="例：Cu²⁺、アンモニア、ベンゼン" autoFocus/><button type="submit">検索</button></div></form></header>
    {!query?<div className="search-empty"><p>物質名・化学式・反応などを入力してください。</p><div><Link href="/search?q=Cu2%2B">Cu²⁺</Link><Link href="/search?q=NH3">NH₃</Link><Link href="/search?q=ベンゼン">ベンゼン</Link></div></div>:results.length?<><p className="search-count"><strong>{results.length}</strong>件の知識が見つかりました</p><KnowledgeSearchResults items={results}/></>:<div className="search-empty"><h2>該当する知識が見つかりませんでした。</h2><p>化学式の上付き文字を通常の数字へ変えるなど、別の表記でもお試しください。</p><Link className="button secondary" href="/home#units">単元一覧を見る</Link></div>}
  </main>;
}
