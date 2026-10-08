import { DataSettingsLink } from "@/components/DataSettingsLink";
import { StudyLink as Link } from "@/components/StudyLink";
import { ChemicaLogo } from "@/components/ChemicaLogo";
import { FeedbackLink } from "@/components/FeedbackLink";

export function Header() {
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/home" aria-label="Chemica 学習ホーム"><ChemicaLogo /></Link>
    <nav className="main-nav" aria-label="メインナビゲーション">
      <Link href="/home#fields" scroll={false}>単元</Link><Link href="/quiz">問題演習</Link><Link href="/tools/memory-quiz">印刷小テスト</Link><Link href="/progress">記録</Link><DataSettingsLink>ログイン・保存</DataSettingsLink><FeedbackLink label="お問い合わせ" />
    </nav>
  </div></header>;
}
