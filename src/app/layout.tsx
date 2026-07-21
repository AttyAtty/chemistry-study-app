import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "Chemistry Trainer",
    template: "%s | Chemistry Trainer",
  },
  description: "高校化学の反応系統、電池、色、工業的製法、イオン反応式を学ぶサイト",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <footer className="site-footer">
          <p>Chemistry Trainer</p>
          <small>教材内容は授業方針や教科書に合わせて確認・編集してください。</small>
        </footer>
      </body>
    </html>
  );
}
