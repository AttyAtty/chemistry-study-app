"use client";

import { electrochemistryCards, type ElectrochemistryCard } from "@/data/electrochemistry";
import { getBatteryCompositionRows, reactionReason, type PrintCompositionRow } from "@/lib/electrochemistryPrint";

type WorksheetBattery = {
  id: string;
  name: string;
  composition: PrintCompositionRow[];
  negativeReaction: string;
  positiveReaction: string;
  overallReaction: string;
  negativeReason: string;
  positiveReason: string;
};

const fromCard = (card: ElectrochemistryCard): WorksheetBattery => {
  const negative = card.electrodes.find((item) => item.polarity === "negative")!;
  const positive = card.electrodes.find((item) => item.polarity === "positive")!;
  return {
    id: card.id,
    name: card.name,
    composition: getBatteryCompositionRows(card),
    negativeReaction: negative.equation,
    positiveReaction: positive.equation,
    overallReaction: card.overallEquation,
    negativeReason: reactionReason(negative),
    positiveReason: reactionReason(positive),
  };
};

// 本体カード未収録の電池も、従来の総合プリントから落とさないための補足データ。
const supplementalBatteries: WorksheetBattery[] = [
  { id:"silver-oxide", name:"酸化銀電池", composition:[{label:"負極活物質",value:"亜鉛 Zn"},{label:"正極活物質",value:"酸化銀 Ag₂O"},{label:"電解質",value:"水酸化カリウム KOH などのアルカリ性電解質"}], negativeReaction:"Zn + 2OH⁻ → ZnO + H₂O + 2e⁻", positiveReaction:"Ag₂O + H₂O + 2e⁻ → 2Ag + 2OH⁻", overallReaction:"Zn + Ag₂O → ZnO + 2Ag", negativeReason:"亜鉛が電子を放出して酸化されます。", positiveReason:"酸化銀が電子を受け取って銀へ還元されます。" },
  { id:"zinc-air", name:"空気亜鉛電池", composition:[{label:"負極活物質",value:"亜鉛 Zn"},{label:"正極活物質",value:"空気中の酸素 O₂"},{label:"電解質",value:"水酸化カリウム KOH などのアルカリ性電解質"}], negativeReaction:"2Zn + 4OH⁻ → 2ZnO + 2H₂O + 4e⁻", positiveReaction:"O₂ + 2H₂O + 4e⁻ → 4OH⁻", overallReaction:"2Zn + O₂ → 2ZnO", negativeReason:"亜鉛が電子を放出して酸化されます。", positiveReason:"空気中の酸素が電子を受け取って還元されます。" },
  { id:"nickel-cadmium", name:"ニッケル・カドミウム電池", composition:[{label:"負極活物質",value:"カドミウム Cd"},{label:"正極活物質",value:"オキシ水酸化ニッケル NiO(OH)"},{label:"電解質",value:"水酸化カリウム KOH水溶液"}], negativeReaction:"Cd + 2OH⁻ → Cd(OH)₂ + 2e⁻", positiveReaction:"2NiO(OH) + 2H₂O + 2e⁻ → 2Ni(OH)₂ + 2OH⁻", overallReaction:"Cd + 2NiO(OH) + 2H₂O → Cd(OH)₂ + 2Ni(OH)₂", negativeReason:"カドミウムが電子を放出して酸化されます。", positiveReason:"オキシ水酸化ニッケルが電子を受け取って還元されます。" },
  { id:"nickel-metal-hydride", name:"ニッケル水素電池", composition:[{label:"負極活物質",value:"水素吸蔵合金 MH"},{label:"正極活物質",value:"オキシ水酸化ニッケル NiO(OH)"},{label:"電解質",value:"水酸化カリウム KOH水溶液"}], negativeReaction:"MH + OH⁻ → M + H₂O + e⁻", positiveReaction:"NiO(OH) + H₂O + e⁻ → Ni(OH)₂ + OH⁻", overallReaction:"MH + NiO(OH) → M + Ni(OH)₂", negativeReason:"水素吸蔵合金側が電子を放出して酸化されます。", positiveReason:"オキシ水酸化ニッケルが電子を受け取って還元されます。" },
  { id:"fuel-alkaline", name:"水素燃料電池（アルカリ性）", composition:[{label:"負極側供給物質",value:"水素 H₂"},{label:"正極側供給物質",value:"酸素 O₂"},{label:"電解質",value:"アルカリ性電解質（OH⁻を伝導）"}], negativeReaction:"2H₂ + 4OH⁻ → 4H₂O + 4e⁻", positiveReaction:"O₂ + 2H₂O + 4e⁻ → 4OH⁻", overallReaction:"2H₂ + O₂ → 2H₂O", negativeReason:"水素が電子を放出して酸化されます。", positiveReason:"酸素が電子を受け取って還元されます。" },
];

const batteryCards = electrochemistryCards
  .filter((card) => card.mode === "galvanic-cell")
  .map(fromCard);
const batteries = [...batteryCards, ...supplementalBatteries];

function Composition({ rows }: { rows: PrintCompositionRow[] }) {
  return <dl className="worksheet-composition">{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>;
}

export function BatteryReactionWorksheet() {
  return <div className="worksheet-shell">
    <div className="worksheet-toolbar"><p>構成から反応粒子を判断し、電極反応式を書く基本問題です。印刷時は解答が別ページになります。</p><button onClick={() => window.print()}>このプリントを印刷</button></div>
    <div className="worksheet-page worksheet-questions">
      <h3>電池の電極反応式 総合演習</h3><p className="worksheet-meta">氏名　　　　　　　　　　　　日付　　　　　　　　</p>
      {batteries.map((battery) => <div className="worksheet-item" key={battery.id}><b>{battery.name}</b><Composition rows={battery.composition}/><p>負極反応：　　　　　　　　　　　　　　　　　　　　　　　</p><p>正極反応：　　　　　　　　　　　　　　　　　　　　　　　</p><p>全体反応：　　　　　　　　　　　　　　　　　　　　　　　</p></div>)}
    </div>
    <div className="worksheet-page worksheet-answers">
      <h3>解答・解説</h3>{batteries.map((battery) => <div className="worksheet-answer" key={battery.id}><b>{battery.name}</b><Composition rows={battery.composition}/><p>負極：{battery.negativeReaction}</p><small>{battery.negativeReason}</small><p>正極：{battery.positiveReaction}</p><small>{battery.positiveReason}</small><p>全体：{battery.overallReaction}</p><small>電池の放電では負極で酸化、正極で還元が起こり、電子は外部回路を負極から正極へ流れます。</small></div>)}
    </div>
  </div>;
}
