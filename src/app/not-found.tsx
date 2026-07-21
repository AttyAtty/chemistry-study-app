import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container">
      <div className="empty-state">
        <h1>ページが見つかりません</h1>
        <p>URLか単元データを確認してください。</p>
        <Link className="button primary" href="/">トップへ戻る</Link>
      </div>
    </main>
  );
}
