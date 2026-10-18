import { field, type Monomer, type Polymer } from "./types";
import { adipicAcid, caprolactam, diene, ethyleneGlycol, formaldehyde, hexamethylenediamine,
  melamine, nylon6Repeat, nylon66Repeat, petRepeat, phenol, terephthalicAcid, urea, vinyl } from "./structures";

const monomer=(id:string,name:string,structure:Monomer["structure"]):Monomer=>({id,name:field(`monomer:${id}`,name,"monomer"),structure});
const additionSpecs = [
  ["pe","ポリエチレン","ethylene","エチレン","","軽く、耐水性・耐薬品性がある","包装フィルム・容器"],
  ["pp","ポリプロピレン","propylene","プロピレン","CH₃","軽く、比較的耐熱性がある","食品容器・繊維"],
  ["pvc","ポリ塩化ビニル","vinyl-chloride","塩化ビニル","Cl","硬質・軟質の製品に加工できる","水道管・電線被覆"],
  ["ps","ポリスチレン","styrene","スチレン","phenyl","硬く、発泡させると軽い断熱材になる","発泡スチロール・容器"],
  ["pan","ポリアクリロニトリル","acrylonitrile","アクリロニトリル","C≡N","繊維にしやすく、耐候性がある","アクリル繊維・炭素繊維の原料"],
  ["ptfe","ポリテトラフルオロエチレン","tetrafluoroethylene","テトラフルオロエチレン","","耐熱・耐薬品性、非粘着性が高い","フッ素樹脂加工・シール材"],
] as const;
export const polymers:Polymer[] = additionSpecs.map(([id,name,monomerId,monomerName,sub,properties,uses])=>({
  id,name:field(`${id}:name`,name,"polymer"),monomers:[monomer(monomerId,monomerName,vinyl(`${monomerId}-structure`,sub,false,id==="ptfe"))],
  method:field(`${id}:method`,"付加重合","polymerization"),family:"addition",
  repeat:vinyl(`${id}-repeat`,sub,true,id==="ptfe"),repeatDescription:"C=Cのπ結合が開き、炭素鎖が伸びる",
  functionalGroups:"炭素間二重結合",byproduct:"なし",thermal:id==="pan" ? "通常は単純な溶融成形が難しい" : "熱可塑性",
  properties,uses,note:"繰り返し単位の左右の結合は、隣の単位へ続く。末端基は省略している。",
}));
polymers.push({
  id:"pet",name:field("pet:name","PET（ポリエチレンテレフタラート）","polymer"),
  monomers:[monomer("terephthalic-acid","テレフタル酸",terephthalicAcid),monomer("ethylene-glycol","エチレングリコール",ethyleneGlycol)],
  method:field("pet:method","縮合重合","polymerization"),family:"condensation",repeat:petRepeat,
  repeatDescription:"エステル結合 −COO− をもつポリエステル",functionalGroups:"−COOH と −OH → エステル結合",
  byproduct:"連結1か所ごとにH₂Oが脱離",thermal:"熱可塑性",properties:"丈夫で透明、繊維にも成形できる",uses:"飲料ボトル・ポリエステル繊維",
  note:"ここではテレフタル酸からの直接重合を示す。テレフタル酸ジメチルから作る経路ではメタノールが脱離する。",
},{
  id:"nylon66",name:field("nylon66:name","ナイロン66","polymer"),
  monomers:[monomer("adipic-acid","アジピン酸",adipicAcid),monomer("hexamethylenediamine","ヘキサメチレンジアミン",hexamethylenediamine)],
  method:field("nylon66:method","縮合重合","polymerization"),family:"condensation",repeat:nylon66Repeat,
  repeatDescription:"アミド結合 −CONH− をもつポリアミド",functionalGroups:"−COOH と −NH₂ → アミド結合",
  byproduct:"連結1か所ごとにH₂Oが脱離",thermal:"熱可塑性",properties:"丈夫で摩耗に強い",uses:"衣料繊維・ロープ・工業部品",
  note:"66は、ジアミンとジカルボン酸がそれぞれ炭素数6であることを表す。",
});
const networkSpecs=[
  ["phenolic","フェノール樹脂",monomer("phenol","フェノール",phenol),"耐熱性・電気絶縁性が高い","電気部品・接着剤","主にメチレン橋 −CH₂− で芳香環が連結"],
  ["urea-resin","尿素樹脂",monomer("urea","尿素",urea),"硬く、着色しやすい","木材用接着剤","窒素原子などを介して架橋した網目"],
  ["melamine-resin","メラミン樹脂",monomer("melamine","メラミン",melamine),"硬く、耐熱性・耐水性がある","食器・化粧板","多官能性の原料から三次元網目を形成"],
] as const;
for(const [id,name,first,properties,uses,description] of networkSpecs) polymers.push({
  id,name:field(`${id}:name`,name,"polymer"),monomers:[first,monomer("formaldehyde","ホルムアルデヒド",formaldehyde)],
  method:field(`${id}:method`,"付加縮合","polymerization"),family:"network",repeatDescription:description,
  functionalGroups:"多官能性の原料が架橋点を作る",byproduct:"縮合の過程でH₂Oなどが脱離",thermal:"熱硬化性",
  properties,uses,note:"網目構造は模式図で示す。架橋位置や反応段階は一定でなく、単一の直鎖状繰り返し単位にはしていない。",
});
polymers.push({
  id:"nylon6",name:field("nylon6:name","ナイロン6","polymer"),monomers:[monomer("caprolactam","ε-カプロラクタム",caprolactam)],
  method:field("nylon6:method","開環重合","polymerization"),family:"ring-opening",repeat:nylon6Repeat,
  repeatDescription:"環状アミドが開いてできるポリアミド",functionalGroups:"環内のアミド部分が開環",byproduct:"連結ごとの小分子脱離なし",thermal:"熱可塑性",
  properties:"丈夫で耐摩耗性がある",uses:"合成繊維・釣り糸",note:"ナイロン66との違いは原料と重合形式。原料の炭素数は6で、環を作る原子数は7。",
},{
  id:"natural-rubber",name:field("natural-rubber:name","天然ゴム","polymer"),monomers:[monomer("isoprene","イソプレン",diene("isoprene-structure",true))],
  method:field("natural-rubber:method","付加重合（生合成）","polymerization"),family:"rubber",repeat:diene("natural-rubber-repeat",true,true),
  repeatDescription:"cis-1,4-ポリイソプレン",functionalGroups:"共役ジエンの1,4-付加",byproduct:"重合では小分子脱離なし",thermal:"加硫で架橋し、弾性を調整",
  properties:"伸縮性が大きい",uses:"タイヤ・ゴム製品",note:"繰り返し単位は結合順を示す略構造で、cis配置は省略。硫黄による加硫は鎖どうしの架橋であり、縮合重合とは別。",
},{
  id:"br",name:field("br:name","ブタジエンゴム（BR）","polymer"),monomers:[monomer("butadiene","1,3-ブタジエン",diene("butadiene-structure",false))],
  method:field("br:method","付加重合","polymerization"),family:"rubber",repeat:diene("br-repeat",false,true),
  repeatDescription:"1,4-付加した単位の例（C=Cが残る）",functionalGroups:"共役ジエンの付加",byproduct:"なし",thermal:"架橋後は単純な熱可塑性ではない",
  properties:"反発弾性・耐摩耗性がある",uses:"タイヤ・靴底",note:"触媒や条件でcis・transや1,2-付加の割合が変わる。図は1,4-付加の結合順のみ。",
},{
  id:"sbr",name:field("sbr:name","スチレン−ブタジエンゴム（SBR）","polymer"),
  monomers:[monomer("styrene","スチレン",vinyl("styrene-structure","phenyl")),monomer("butadiene","1,3-ブタジエン",diene("butadiene-structure",false))],
  method:field("sbr:method","付加共重合","polymerization"),family:"rubber",repeatDescription:"スチレン由来単位とブタジエン由来単位が共存",
  functionalGroups:"異なるモノマーの二重結合を使って連結",byproduct:"なし",thermal:"加硫して弾性を調整",properties:"耐摩耗性が高い",uses:"自動車タイヤ",
  note:"共重合体の配列は一定とは限らないため、単一の周期的な繰り返し単位にはしていない。",
});
export const polymerNotes=[
  "付加重合はC=Cのπ結合を使って鎖を伸ばす。炭素間の結合が全部なくなるわけではない。単純なビニルモノマーの付加重合では小分子は脱離しない。",
  "縮合重合では二つ以上の官能基をもつ原料をつなぐ。PETはエステル結合、ナイロン66はアミド結合に注目する。図のH₂Oは連結ごとの脱離を示し、末端を含む厳密な係数は省略。",
  "熱可塑性／熱硬化性は重合形式そのものではなく、高分子の構造と架橋の程度に関係する。網目構造をもつ熱硬化性樹脂は、加熱しても簡単には溶融しない。",
  "既存の有機反応マップには、酢酸ビニル → ポリ酢酸ビニル → ポリビニルアルコール → ビニロン、アクリロニトリル → NBRなどの関連経路もある。",
];
export const polymerSources=[
  {title:"OpenStax：アルケンの重合",url:"https://openstax.org/books/organic-chemistry/pages/8-10-radical-additions-to-alkenes-chain-growth-polymers"},
  {title:"OpenStax：ポリアミドとポリエステル",url:"https://openstax.org/books/organic-chemistry/pages/21-9-polyamides-and-polyesters-step-growth-polymers"},
  {title:"ACS：メラミンと熱硬化性樹脂",url:"https://www.acs.org/molecule-of-the-week/archive/m/melamine.html"},
];
