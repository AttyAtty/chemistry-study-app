import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { SharePanel } from "@/components/SharePanel";
import { ChemicaBackground } from "@/components/ChemicaBackground";

export const metadata: Metadata = {
  title: { default: "Chemica", template: "%s | Chemica" },
  applicationName: "Chemica",
  description: "高校化学の反応・暗記・問題演習をまとめて学べる学習サイトです。",
  openGraph: { title: "Chemica", description: "化学をもっとわかりやすく。高校化学の学習Webアプリです。", type: "website", locale: "ja_JP" },
  twitter: { card: "summary", title: "Chemica", description: "化学をもっとわかりやすく。" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>
    <ChemicaBackground />
    <Header />
    {children}
    <SharePanel />
    <footer className="site-footer">
      <p>Chemica</p>
      <small>高校化学を、図・カード・問題演習で学べるサイト</small>
      <span className="site-credit">Designed &amp; Created by <strong>Atty</strong></span>
    </footer>
  </body></html>;
}
