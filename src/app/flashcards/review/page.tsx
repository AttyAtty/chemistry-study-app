import type { Metadata } from "next";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { chemistryUnits } from "@/data/chemistry";
import { getFlashcardsForUnit } from "@/data/flashcards";

export const metadata: Metadata = { title: "今日の暗記カード復習" };

const allFlashcards = chemistryUnits.flatMap((unit) => getFlashcardsForUnit(unit));

export default function FlashcardReviewPage() {
  return <main className="page-container unit-page">
    <header className="unit-hero compact-hero">
      <p className="eyebrow">TODAY&apos;S REVIEW</p>
      <h1>今日の暗記カード復習</h1>
      <p>復習日を迎えたカードを、単元をまたいで確認します。</p>
    </header>
    <FlashcardDeck cards={allFlashcards} unitId="all-units" title="今日の復習" />
  </main>;
}
