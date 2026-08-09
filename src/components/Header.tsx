import Link from "next/link";
import { ChemicaLogo } from "@/components/ChemicaLogo";

export function Header() {
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/home" aria-label="Chemica 学習ホーム"><ChemicaLogo /></Link>
    <nav aria-label="メインナビゲーション">
      <Link href="/home#units">単元</Link><Link href="/quiz">テスト</Link><Link href="/tools/memory-quiz">小テスト</Link><Link href="/progress">記録</Link>
    </nav>
  </div></header>;
}
