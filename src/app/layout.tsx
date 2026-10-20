import { Tutorial, TutorialLink } from "@/components/Tutorial";
import { DataSettingsLink } from "@/components/DataSettingsLink";
import { AccountRuntime } from "@/components/AccountRuntime";
import { PwaStatus } from "@/components/PwaStatus";
import { PWA_BUILD_ID } from "@/lib/pwaBuild";
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { NavigationRuntime } from "@/components/NavigationRuntime";
import { InstallPrompt, InstallRuntime } from "@/components/InstallPrompt";
import { SharePanel } from "@/components/SharePanel";
import { ChemicaAnimatedBackground } from "@/components/ChemicaAnimatedBackground";
import { FeedbackLink } from "@/components/FeedbackLink";
import { CHEMICA_VERSION_LABEL } from "@/lib/appVersion";
import { LearningStorageRuntime } from "@/components/LearningStorageRuntime";
import { StorageNotice } from "@/components/StorageNotice";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { APP_ORIGIN } from "@/lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(APP_ORIGIN),
  title: { default: "Chemica", template: "%s | Chemica" },
  applicationName: "Chemica",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon.ico", type: "image/x-icon" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Chemica",
    statusBarStyle: "default",
  },
  description: "理論・無機・有機化学を、体系的な単元、図解、公式計算、問題演習から学べるサイトです。",
  openGraph: { title: "Chemica", description: "理論・無機・有機化学を、単元・図解・公式計算から学ぶ高校化学Webアプリです。", type: "website", locale: "ja_JP" },
  twitter: { card: "summary", title: "Chemica", description: "化学をもっとわかりやすく。" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "Chemica", url: APP_ORIGIN, inLanguage: "ja-JP" };
  return <html lang="ja"><head><meta name="chemica-build" content={PWA_BUILD_ID} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} /></head><body>
    <ChemicaAnimatedBackground />
    <Header />
    <StorageNotice />
    <LearningStorageRuntime />
    <AccountRuntime />
    <PwaStatus />
    <NavigationRuntime />
    <InstallRuntime />
    {children}
    <MobileNavigation /><Tutorial />
    <footer className="site-footer">
      <p>Chemica <span className="beta-badge">Beta</span></p>
      <small>高校化学を、図・カード・問題演習で学べるサイト</small>
      <small className="beta-note">Chemicaは現在Beta版です。教材内容の誤りや使いづらい点があれば、お問い合わせからお知らせください。</small>
      <nav className="footer-links" aria-label="サポート"><TutorialLink /><FeedbackLink /><Link href="/privacy">プライバシーポリシー</Link><DataSettingsLink>ログイン・データ保存</DataSettingsLink><SharePanel /><InstallPrompt /></nav>
      <small className="site-version"><Link href="/about/changelog">{CHEMICA_VERSION_LABEL} · 更新履歴</Link></small>
      <span className="site-credit">Designed &amp; Created by <strong>Atty</strong></span>
    </footer>
    <Analytics />
  </body></html>;
}
