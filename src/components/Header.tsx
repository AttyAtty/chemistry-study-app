import Link from "next/link";
import { ChemicaLogo } from "@/components/ChemicaLogo";

export function Header() {
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="Chemica ホーム"><ChemicaLogo /></Link>
    <nav aria-label="メインナビゲーション">
      <Link href="/#units">単元</Link><Link href="/quiz">テスト</Link><Link href="/progress">記録</Link>
    </nav>
  </div></header>;
}
