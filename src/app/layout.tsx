import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { SharePanel } from "@/components/SharePanel";
import { ChemicaAnimatedBackground } from "@/components/ChemicaAnimatedBackground";
import { FeedbackLink } from "@/components/FeedbackLink";
import { CHEMICA_VERSION_LABEL } from "@/lib/appVersion";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
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
  description: "高校化学の反応・暗記・問題演習をまとめて学べる学習サイトです。",
  openGraph: { title: "Chemica", description: "化学をもっとわかりやすく。高校化学の学習Webアプリです。", type: "website", locale: "ja_JP" },
  twitter: { card: "summary", title: "Chemica", description: "化学をもっとわかりやすく。" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>
    <ChemicaAnimatedBackground />
    <Header />
    {children}
    <MobileNavigation />
    <SharePanel />
    <footer className="site-footer">
      <p>Chemica</p>
      <small>高校化学を、図・カード・問題演習で学べるサイト</small>
      <nav className="footer-links" aria-label="サポート"><FeedbackLink /></nav>
      <small className="site-version">{CHEMICA_VERSION_LABEL}</small>
      <span className="site-credit">Designed &amp; Created by <strong>Atty</strong></span>
    </footer>
    <Analytics />
  </body></html>;
}
