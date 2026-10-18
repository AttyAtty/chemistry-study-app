import { field } from "./types";
export const theoryLessons=[
 {slug:"solubility",title:"溶解度・再結晶を図で理解",description:"溶ける限界、温度による変化、析出量の計算をつなげる。"},
 {slug:"vapor-pressure",title:"蒸気圧と沸騰を図で理解",description:"蒸発と凝縮から動的平衡、外圧と沸点へ。"},
 {slug:"henry",title:"ヘンリーの法則を図で理解",description:"気体の分圧と溶解量を、粒子・グラフ・炭酸飲料で見る。"},
] as const;
export type TheorySlug=typeof theoryLessons[number]["slug"];
// All numerical curves are deliberately schematic, not measured substance data.
export const solubilityPoints=[[0,20],[20,30],[40,45],[60,60],[80,80],[100,105]] as const;
export const theoryFields={
 solubility:{
  basis:field("solubility:basis","水（溶媒）100 gが基準。溶液100 gではない","concept"),
  unsaturated:field("solubility:unsaturated","不飽和：さらに溶質を溶かせる","concept"),
  saturated:field("solubility:saturated","飽和：その温度で溶ける限界","concept"),
  supersaturated:field("solubility:supersaturated","過飽和：限界を超えて溶けた不安定な状態","concept"),
  recrystallization:field("solubility:recrystallization","冷却で溶解度が下がり、余った溶質が結晶として析出する（再結晶）","concept"),
  result:field("solubility:result","80 − 30 = 50 g 析出","calculation"),
  scale:field("solubility:scale","実際の溶解量 = 溶解度 × 水の質量 / 100","calculation"),
 },
 "vapor-pressure":{
  evaporation:field("vapor:evaporation","蒸発：液面から分子が気相へ出る","concept"),
  condensation:field("vapor:condensation","凝縮：気相の分子が液体へ戻る","concept"),
  equilibrium:field("vapor:equilibrium","動的平衡：蒸発速度と凝縮速度が等しく、両方が続く","concept"),
  saturation:field("vapor:saturation","飽和蒸気圧：液体と動的平衡にある蒸気の圧力","concept"),
  boiling:field("vapor:boiling","飽和蒸気圧 = 外圧 → 沸騰開始","calculation"),
  pressure:field("vapor:pressure","外圧低下で沸点低下、外圧上昇で沸点上昇","concept"),
  example:field("vapor:example","1 atm = 101.325 kPa。模式液体Bの通常の沸点は100 ℃","calculation"),
 },
 henry:{
  law:field("henry:law","一定温度・一定量の液体では、溶解する気体の量はその気体の分圧に比例する","concept"),
  formula:field("henry:formula","n = k p（温度・液体量一定）","calculation"),
  example:field("henry:example","1.0 atmで2.0 mmol → 3.0 atmで6.0 mmol","calculation"),
  release:field("henry:release","開栓 → CO₂分圧低下 → 平衡で溶ける量が減る → 気泡として放出","concept"),
  solid:field("henry:solid","固体：多くは温度上昇で溶解度が増える（例外あり）","concept"),
  gas:field("henry:gas","気体：一般に温度上昇で溶けにくく、分圧上昇で溶けやすい","concept"),
 },
};
export const theorySources=[
 {title:"OpenStax：溶解度・ヘンリーの法則",url:"https://openstax.org/books/chemistry-2e/pages/11-3-solubility"},
 {title:"OpenStax：相変化・蒸気圧・沸騰",url:"https://openstax.org/books/chemistry-2e/pages/10-3-phase-transitions"},
];
