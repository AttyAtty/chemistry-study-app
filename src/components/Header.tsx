import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">C</span>
          <span>
            <strong>Chemistry Trainer</strong>
            <small>高校化学・暗記演習</small>
          </span>
        </Link>
        <nav aria-label="メインナビゲーション">
          <Link href="/">単元一覧</Link>
          <Link href="/quiz">総合テスト</Link>
          <Link href="/progress">学習記録</Link>
        </nav>
      </div>
    </header>
  );
}
