import Link from "next/link";

export function Header() {
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="Chemica ホーム">
      <span className="brand-mark">CT</span>
      <span><strong>Chemica</strong><small>化学をもっとわかりやすく</small></span>
    </Link>
    <nav aria-label="メインナビゲーション">
      <Link href="/">単元</Link>
      <Link href="/quiz">テスト</Link>
      <Link href="/progress">記録</Link>
    </nav>
  </div></header>;
}
