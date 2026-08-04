import type { ElectrochemistryCard, ElectrodeReaction } from "@/data/electrochemistry";

export type PrintCompositionRow = { label: string; value: string };

const materialNames: Record<string, string> = {
  Zn: "亜鉛 Zn", Cu: "銅 Cu", Pb: "鉛 Pb", "PbO₂": "二酸化鉛 PbO₂", "PbSO₄": "硫酸鉛 PbSO₄",
  "Zn缶": "亜鉛缶 Zn", "MnO₂＋炭素棒": "二酸化マンガン MnO₂（正極活物質）・炭素棒",
  "MnO₂": "二酸化マンガン MnO₂", "触媒電極・H₂供給": "水素 H₂を供給する触媒電極",
  "触媒電極・O₂供給": "酸素 O₂を供給する触媒電極",
  "Liを吸蔵した黒鉛LiC₆（代表例）": "Liを吸蔵した黒鉛 LiC₆（代表例）",
  "CoO₂系材料（代表例）": "コバルト酸化物系正極 CoO₂（代表例）",
};

const electrolyteNames: Record<string, string> = {
  "希硫酸など": "希硫酸 H₂SO₄(aq) など",
  "ZnSO₄水溶液": "硫酸亜鉛水溶液 ZnSO₄(aq)",
  "CuSO₄水溶液": "硫酸銅(II)水溶液 CuSO₄(aq)",
  "塩橋または素焼き板": "塩橋または素焼き板",
  "希硫酸": "希硫酸 H₂SO₄(aq)",
  "希硫酸（充電により濃度上昇）": "希硫酸 H₂SO₄(aq)（充電により濃度上昇）",
  "酸性電解質": "酸性電解質（H⁺を伝導）",
  "NH₄Cl・ZnCl₂を含むペースト": "塩化アンモニウム NH₄Cl・塩化亜鉛 ZnCl₂を含むペースト",
  "KOH水溶液・ペースト": "水酸化カリウム KOH水溶液・ペースト",
  "有機電解液・Li塩": "Li塩を含む有機電解液",
};

export const describeMaterial = (material: string) => materialNames[material] ?? material;
export const describeElectrolyte = (electrolyte: string) => electrolyteNames[electrolyte] ?? electrolyte;

export function getBatteryCompositionRows(card: ElectrochemistryCard): PrintCompositionRow[] {
  const negative = card.electrodes.find((item) => item.polarity === "negative")!;
  const positive = card.electrodes.find((item) => item.polarity === "positive")!;
  const dryCell = card.id === "manganese" || card.id === "alkaline";
  const rows: PrintCompositionRow[] = [
    { label: dryCell ? "負極活物質" : "負極", value: describeMaterial(negative.material) },
  ];
  if (card.id === "daniel") {
    rows.push({ label: "負極側電解質", value: describeElectrolyte(card.electrolytes[0]) });
    rows.push({ label: dryCell ? "正極活物質" : "正極", value: describeMaterial(positive.material) });
    rows.push({ label: "正極側電解質", value: describeElectrolyte(card.electrolytes[1]) });
    rows.push({ label: "隔てるもの", value: describeElectrolyte(card.electrolytes[2]) });
    return rows;
  }
  rows.push({ label: dryCell ? "正極活物質" : "正極", value: describeMaterial(positive.material) });
  rows.push({ label: "電解質", value: card.electrolytes.map(describeElectrolyte).join("／") });
  return rows;
}

export const reactionReason = (electrode: ElectrodeReaction) => electrode.reactionType === "oxidation"
  ? `${describeMaterial(electrode.material)}側で電子を放出する酸化反応が起こります。`
  : `${describeMaterial(electrode.material)}側で電子を受け取る還元反応が起こります。`;
