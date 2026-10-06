import type { Metadata } from "next";
export const metadata:Metadata={title:"オフライン"};
export default function OfflinePage(){return <main className="page-container"><section className="page-intro compact"><p className="eyebrow">OFFLINE</p><h1>このページはオフラインでは開けません</h1><p>まだ保存されていないページ、または通信が必要なページです。オンラインに戻ってから開いてください。</p><p>保存済みの教材と学習記録は、この端末で利用できます。</p><div className="data-actions"><a className="button primary" href="/home">学習ホーム</a><a className="button secondary" href="/settings/data">バックアップ・データ管理</a></div></section></main>;}
