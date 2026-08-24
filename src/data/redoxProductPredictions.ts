import type { QuizQuestion } from "@/data/chemistry";

export type RedoxMedium = "酸性" | "中性" | "塩基性" | "酸性（希硝酸に相当）" | "酸性（濃硝酸に相当）" | "条件によらない";
export type RedoxRole = "酸化剤" | "還元剤";

export type RedoxProductPrediction = {
  id: string;
  reactant: string;
  reactantName: string;
  product: string;
  productName: string;
  medium: RedoxMedium;
  role: RedoxRole;
  direction: "酸化" | "還元";
  element: string;
  oxidationStateBefore: string;
  oxidationStateAfter: string;
  skeleton: string;
  halfReaction: string;
  relatedHalfReactionId: string;
  importance: "core" | "standard";
  note?: string;
};

const p = (value: RedoxProductPrediction) => value;

export const redoxProductPredictions: RedoxProductPrediction[] = [
  p({id:"redox-product-mno4-acid",reactant:"MnO₄⁻",reactantName:"過マンガン酸イオン",product:"Mn²⁺",productName:"マンガン(II)イオン",medium:"酸性",role:"酸化剤",direction:"還元",element:"Mn",oxidationStateBefore:"+7",oxidationStateAfter:"+2",skeleton:"MnO₄⁻ → Mn²⁺",halfReaction:"MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O",relatedHalfReactionId:"half-mno4-acid",importance:"core"}),
  p({id:"redox-product-mno4-neutral",reactant:"MnO₄⁻",reactantName:"過マンガン酸イオン",product:"MnO₂",productName:"二酸化マンガン",medium:"中性",role:"酸化剤",direction:"還元",element:"Mn",oxidationStateBefore:"+7",oxidationStateAfter:"+4",skeleton:"MnO₄⁻ → MnO₂",halfReaction:"MnO₄⁻ + 2H₂O + 3e⁻ → MnO₂ + 4OH⁻",relatedHalfReactionId:"half-mno4-neutral",importance:"core"}),
  p({id:"redox-product-mno4-base",reactant:"MnO₄⁻",reactantName:"過マンガン酸イオン",product:"MnO₄²⁻",productName:"マンガン酸イオン",medium:"塩基性",role:"酸化剤",direction:"還元",element:"Mn",oxidationStateBefore:"+7",oxidationStateAfter:"+6",skeleton:"MnO₄⁻ → MnO₄²⁻",halfReaction:"MnO₄⁻ + e⁻ → MnO₄²⁻",relatedHalfReactionId:"half-mno4-base",importance:"standard",note:"強塩基性での代表的な一電子還元。条件によりMnO₂まで還元される場合もある。"}),
  p({id:"redox-product-dichromate-acid",reactant:"Cr₂O₇²⁻",reactantName:"二クロム酸イオン",product:"Cr³⁺",productName:"クロム(III)イオン",medium:"酸性",role:"酸化剤",direction:"還元",element:"Cr",oxidationStateBefore:"+6",oxidationStateAfter:"+3",skeleton:"Cr₂O₇²⁻ → Cr³⁺",halfReaction:"Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O",relatedHalfReactionId:"half-dichromate-acid",importance:"core"}),
  p({id:"redox-product-h2o2-oxidant",reactant:"H₂O₂",reactantName:"過酸化水素",product:"H₂O",productName:"水",medium:"酸性",role:"酸化剤",direction:"還元",element:"O",oxidationStateBefore:"−1",oxidationStateAfter:"−2",skeleton:"H₂O₂ → H₂O",halfReaction:"H₂O₂ + 2H⁺ + 2e⁻ → 2H₂O",relatedHalfReactionId:"half-h2o2-reduction",importance:"core"}),
  p({id:"redox-product-h2o2-reductant",reactant:"H₂O₂",reactantName:"過酸化水素",product:"O₂",productName:"酸素",medium:"酸性",role:"還元剤",direction:"酸化",element:"O",oxidationStateBefore:"−1",oxidationStateAfter:"0",skeleton:"H₂O₂ → O₂",halfReaction:"H₂O₂ → O₂ + 2H⁺ + 2e⁻",relatedHalfReactionId:"half-h2o2-oxidation",importance:"core"}),
  p({id:"redox-product-fe2",reactant:"Fe²⁺",reactantName:"鉄(II)イオン",product:"Fe³⁺",productName:"鉄(III)イオン",medium:"条件によらない",role:"還元剤",direction:"酸化",element:"Fe",oxidationStateBefore:"+2",oxidationStateAfter:"+3",skeleton:"Fe²⁺ → Fe³⁺",halfReaction:"Fe²⁺ → Fe³⁺ + e⁻",relatedHalfReactionId:"half-fe2-oxidation",importance:"core"}),
  p({id:"redox-product-fe3",reactant:"Fe³⁺",reactantName:"鉄(III)イオン",product:"Fe²⁺",productName:"鉄(II)イオン",medium:"条件によらない",role:"酸化剤",direction:"還元",element:"Fe",oxidationStateBefore:"+3",oxidationStateAfter:"+2",skeleton:"Fe³⁺ → Fe²⁺",halfReaction:"Fe³⁺ + e⁻ → Fe²⁺",relatedHalfReactionId:"half-fe3-reduction",importance:"core"}),
  p({id:"redox-product-sn2",reactant:"Sn²⁺",reactantName:"スズ(II)イオン",product:"Sn⁴⁺",productName:"スズ(IV)イオン",medium:"条件によらない",role:"還元剤",direction:"酸化",element:"Sn",oxidationStateBefore:"+2",oxidationStateAfter:"+4",skeleton:"Sn²⁺ → Sn⁴⁺",halfReaction:"Sn²⁺ → Sn⁴⁺ + 2e⁻",relatedHalfReactionId:"half-sn2-oxidation",importance:"core"}),
  p({id:"redox-product-sn4",reactant:"Sn⁴⁺",reactantName:"スズ(IV)イオン",product:"Sn²⁺",productName:"スズ(II)イオン",medium:"条件によらない",role:"酸化剤",direction:"還元",element:"Sn",oxidationStateBefore:"+4",oxidationStateAfter:"+2",skeleton:"Sn⁴⁺ → Sn²⁺",halfReaction:"Sn⁴⁺ + 2e⁻ → Sn²⁺",relatedHalfReactionId:"half-sn4-reduction",importance:"standard"}),
  p({id:"redox-product-cl2",reactant:"Cl₂",reactantName:"塩素",product:"Cl⁻",productName:"塩化物イオン",medium:"条件によらない",role:"酸化剤",direction:"還元",element:"Cl",oxidationStateBefore:"0",oxidationStateAfter:"−1",skeleton:"Cl₂ → Cl⁻",halfReaction:"Cl₂ + 2e⁻ → 2Cl⁻",relatedHalfReactionId:"half-cl2-reduction",importance:"core"}),
  p({id:"redox-product-chloride",reactant:"Cl⁻",reactantName:"塩化物イオン",product:"Cl₂",productName:"塩素",medium:"条件によらない",role:"還元剤",direction:"酸化",element:"Cl",oxidationStateBefore:"−1",oxidationStateAfter:"0",skeleton:"Cl⁻ → Cl₂",halfReaction:"2Cl⁻ → Cl₂ + 2e⁻",relatedHalfReactionId:"half-chloride-oxidation",importance:"core"}),
  p({id:"redox-product-iodide",reactant:"I⁻",reactantName:"ヨウ化物イオン",product:"I₂",productName:"ヨウ素",medium:"条件によらない",role:"還元剤",direction:"酸化",element:"I",oxidationStateBefore:"−1",oxidationStateAfter:"0",skeleton:"I⁻ → I₂",halfReaction:"2I⁻ → I₂ + 2e⁻",relatedHalfReactionId:"half-iodide-oxidation",importance:"core"}),
  p({id:"redox-product-iodine",reactant:"I₂",reactantName:"ヨウ素",product:"I⁻",productName:"ヨウ化物イオン",medium:"条件によらない",role:"酸化剤",direction:"還元",element:"I",oxidationStateBefore:"0",oxidationStateAfter:"−1",skeleton:"I₂ → I⁻",halfReaction:"I₂ + 2e⁻ → 2I⁻",relatedHalfReactionId:"half-iodine-reduction",importance:"core"}),
  p({id:"redox-product-so2",reactant:"SO₂",reactantName:"二酸化硫黄",product:"SO₄²⁻",productName:"硫酸イオン",medium:"酸性",role:"還元剤",direction:"酸化",element:"S",oxidationStateBefore:"+4",oxidationStateAfter:"+6",skeleton:"SO₂ → SO₄²⁻",halfReaction:"SO₂ + 2H₂O → SO₄²⁻ + 4H⁺ + 2e⁻",relatedHalfReactionId:"half-so2-oxidation",importance:"core"}),
  p({id:"redox-product-h2s",reactant:"H₂S",reactantName:"硫化水素",product:"S",productName:"硫黄",medium:"酸性",role:"還元剤",direction:"酸化",element:"S",oxidationStateBefore:"−2",oxidationStateAfter:"0",skeleton:"H₂S → S",halfReaction:"H₂S → S + 2H⁺ + 2e⁻",relatedHalfReactionId:"half-h2s-oxidation",importance:"core"}),
  p({id:"redox-product-nitrate-no",reactant:"NO₃⁻",reactantName:"硝酸イオン",product:"NO",productName:"一酸化窒素",medium:"酸性（希硝酸に相当）",role:"酸化剤",direction:"還元",element:"N",oxidationStateBefore:"+5",oxidationStateAfter:"+2",skeleton:"NO₃⁻ → NO",halfReaction:"NO₃⁻ + 4H⁺ + 3e⁻ → NO + 2H₂O",relatedHalfReactionId:"half-nitrate-no",importance:"core"}),
  p({id:"redox-product-nitrate-no2",reactant:"NO₃⁻",reactantName:"硝酸イオン",product:"NO₂",productName:"二酸化窒素",medium:"酸性（濃硝酸に相当）",role:"酸化剤",direction:"還元",element:"N",oxidationStateBefore:"+5",oxidationStateAfter:"+4",skeleton:"NO₃⁻ → NO₂",halfReaction:"NO₃⁻ + 2H⁺ + e⁻ → NO₂ + H₂O",relatedHalfReactionId:"half-nitrate-no2",importance:"core"}),
  p({id:"redox-product-thiosulfate",reactant:"S₂O₃²⁻",reactantName:"チオ硫酸イオン",product:"S₄O₆²⁻",productName:"テトラチオン酸イオン",medium:"条件によらない",role:"還元剤",direction:"酸化",element:"S",oxidationStateBefore:"混合酸化数",oxidationStateAfter:"混合酸化数",skeleton:"S₂O₃²⁻ → S₄O₆²⁻",halfReaction:"2S₂O₃²⁻ → S₄O₆²⁻ + 2e⁻",relatedHalfReactionId:"half-thiosulfate-oxidation",importance:"core",note:"ヨウ素滴定で頻出。硫黄原子は等価でないため平均酸化数だけで扱わない。"}),
  p({id:"redox-product-oxalate",reactant:"C₂O₄²⁻",reactantName:"シュウ酸イオン",product:"CO₂",productName:"二酸化炭素",medium:"酸性",role:"還元剤",direction:"酸化",element:"C",oxidationStateBefore:"+3",oxidationStateAfter:"+4",skeleton:"C₂O₄²⁻ → CO₂",halfReaction:"C₂O₄²⁻ → 2CO₂ + 2e⁻",relatedHalfReactionId:"half-oxalate-oxidation",importance:"core"}),
];

const distractors = ["Mn²⁺","MnO₂","MnO₄²⁻","Cr³⁺","H₂O","O₂","Fe²⁺","Fe³⁺","Sn²⁺","Sn⁴⁺","Cl⁻","Cl₂","I⁻","I₂","SO₄²⁻","S","NO","NO₂","S₄O₆²⁻","CO₂"];
export const redoxProductQuestions: QuizQuestion[] = redoxProductPredictions.map((item) => {
  const choices = [item.product, ...distractors.filter(value => value !== item.product && value !== item.reactant).slice(Math.abs([...item.id].reduce((n,c)=>n+c.charCodeAt(0),0)) % 8, 20)].slice(0,4);
  const rotated = [...choices.slice(1), choices[0]];
  const medium = item.medium === "条件によらない" ? "" : `${item.medium}で、`;
  return {id:`quiz-${item.id}`,prompt:`${medium}${item.reactantName} ${item.reactant} が${item.direction}されると、主に何になる？`,choices:rotated,answerIndex:rotated.indexOf(item.product),explanation:`${item.skeleton}。${item.role}として働き、自身は${item.direction}される。${item.element}の酸化数は ${item.oxidationStateBefore} → ${item.oxidationStateAfter}。`,tags:["酸化還元生成物予測",item.medium,item.role]};
});
