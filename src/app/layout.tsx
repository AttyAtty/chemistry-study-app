import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { SharePanel } from "@/components/SharePanel";

export const metadata: Metadata = {
  title: { default: "Chemistry Trainer", template: "%s | Chemistry Trainer" },
  description: "高校化学の反応・暗記・問題演習をまとめて学べる学習サイトです。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>
    <Header />
    {children}
    <SharePanel />
    <footer className="site-footer">
      <p>Chemistry Trainer</p>
      <small>高校化学を、図・カード・問題演習で学べるサイト</small>
      <span className="site-credit">Designed &amp; Created by <strong>Atty</strong></span>
    </footer>
  </body></html>;
}
