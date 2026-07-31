import { electrochemistryCards } from "@/data/electrochemistry";

export type DailyIon = { formula: string; name: string; color: string; tone: string; note?: string };
export type DailyReaction = { equation: string; title: string; note?: string };
export type DailyPrecipitate = { formula: string; name: string; color: string; tone: string; ionicEquation: string };

export const dailyIons: DailyIon[] = [
  { formula:"Cr³⁺", name:"クロム(III)イオン", color:"緑色", tone:"#73c49b" },
  { formula:"Mn²⁺", name:"マンガン(II)イオン", color:"淡桃色", tone:"#efb2c4" },
  { formula:"Fe²⁺", name:"鉄(II)イオン", color:"淡緑色", tone:"#a8d79d" },
  { formula:"Fe³⁺", name:"鉄(III)イオン", color:"黄褐色", tone:"#d9a953" },
  { formula:"Co²⁺", name:"コバルト(II)イオン", color:"赤色", tone:"#e28c9d" },
  { formula:"Ni²⁺", name:"ニッケル(II)イオン", color:"緑色", tone:"#62bd8e" },
  { formula:"Cu²⁺", name:"銅(II)イオン", color:"青色", tone:"#68afe6" },
];

const reactionCardIds = ["volta","daniel","lead-discharge","fuel-acid","water-electrolysis","cuso4-pt","nacl-aq","cucl2-aq"];
export const dailyReactions: DailyReaction[] = reactionCardIds.flatMap(id => {
  const card = electrochemistryCards.find(item => item.id === id);
  return card ? [{ equation:card.overallEquation, title:card.name, note:card.keyPoints[0] }] : [];
});

export const dailyPrecipitates: DailyPrecipitate[] = [
  { formula:"AgCl↓", name:"塩化銀", color:"白色", tone:"#d8e3ee", ionicEquation:"Ag⁺ + Cl⁻ → AgCl↓" },
  { formula:"AgBr↓", name:"臭化銀", color:"淡黄色", tone:"#eadc91", ionicEquation:"Ag⁺ + Br⁻ → AgBr↓" },
  { formula:"AgI↓", name:"ヨウ化銀", color:"黄色", tone:"#e3c952", ionicEquation:"Ag⁺ + I⁻ → AgI↓" },
  { formula:"Fe(OH)₃↓", name:"水酸化鉄(III)", color:"赤褐色", tone:"#c88064", ionicEquation:"Fe³⁺ + 3OH⁻ → Fe(OH)₃↓" },
  { formula:"Cu(OH)₂↓", name:"水酸化銅(II)", color:"青白色", tone:"#82c7e9", ionicEquation:"Cu²⁺ + 2OH⁻ → Cu(OH)₂↓" },
  { formula:"BaCrO₄↓", name:"クロム酸バリウム", color:"黄色", tone:"#e5ca55", ionicEquation:"Ba²⁺ + CrO₄²⁻ → BaCrO₄↓" },
  { formula:"Ag₂CrO₄↓", name:"クロム酸銀", color:"暗赤色", tone:"#b96c70", ionicEquation:"2Ag⁺ + CrO₄²⁻ → Ag₂CrO₄↓" },
  { formula:"CdS↓", name:"硫化カドミウム", color:"黄色", tone:"#e2c84a", ionicEquation:"Cd²⁺ + S²⁻ → CdS↓" },
];

export function localDateSeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}
