import Link from "next/link";
import type { ChemistryUnit } from "@/data/chemistry";
import type { UnitPageArchitecture } from "@/lib/unitInformationArchitecture";

export function UnitQuickActions({unit,architecture,hasFlashcards}:{unit:ChemistryUnit;architecture:UnitPageArchitecture;hasFlashcards:boolean}){
  return <nav className="unit-quick-actions no-print" aria-label={`${unit.shortTitle}のクイックアクション`}>
    {architecture.quickLinks?.map(item=><a href={`#${item.sectionId}`} key={item.sectionId}>{item.label}</a>)}
    {hasFlashcards&&<a href="#flashcards">暗記カード</a>}
    <Link href={`/quiz?unit=${unit.slug}&count=5`}>5問テスト</Link>
    <Link href={`/quiz?unit=${unit.slug}&count=10`}>10問テスト</Link>
  </nav>;
}
