export type ReactionNode = { name: string; formula: string; appearance?: string; appearanceColor?: string };
export type ReactionStep = { label: string; condition?: string; important?: boolean };
export type ReactionPath = { nodes: ReactionNode[]; steps: ReactionStep[] };
export type ReactionMap = { id: string; title: string; category: "organic" | "inorganic"; paths: ReactionPath[]; centerNode?:string; zones?:Record<string,"top"|"bottom"|"left"|"right">; canvas?: { width:number; height:number } };

const n = (name: string, formula: string): ReactionNode => ({ name, formula });
const colored = (name: string, formula: string, appearance: string, appearanceColor: string): ReactionNode => ({ name, formula, appearance, appearanceColor });
const s = (label: string, condition?: string, important = false): ReactionStep => ({ label, condition, important });

export const reactionMaps: ReactionMap[] = [
  { id: "ethylene", title: "エチレン", category: "organic", paths: [
    { nodes: [n("エタノール","C₂H₅OH"),n("エチレン","CH₂=CH₂"),n("1,2-ジブロモエタン","CH₂BrCH₂Br")], steps: [s("脱水","濃H₂SO₄・170 ℃",true),s("臭素付加","Br₂水（脱色）",true)] },
    { nodes: [n("エチレン","CH₂=CH₂"),n("エタノール","C₂H₅OH"),n("アセトアルデヒド","CH₃CHO"),n("酢酸","CH₃COOH")], steps: [s("水和","H₃PO₄触媒・高温高圧",true),s("穏やかな酸化","Cu・加熱"),s("酸化","K₂Cr₂O₇/H⁺",true)] },
    { nodes: [n("エチレン","CH₂=CH₂"),n("ポリエチレン","(−CH₂−CH₂−)ₙ")], steps: [s("付加重合","開始剤・高温高圧",true)] },
  ]},
  { id: "ethanol", title: "エタノール", category: "organic", paths: [
    { nodes: [n("グルコース","C₆H₁₂O₆"),n("エタノール","C₂H₅OH"),n("アセトアルデヒド","CH₃CHO"),n("酢酸","CH₃COOH")], steps: [s("アルコール発酵","酵母・約30 ℃",true),s("酸化","Cu・加熱"),s("酸化","酸化剤",true)] },
    { nodes: [n("エタノール","C₂H₅OH"),n("エチレン","CH₂=CH₂")], steps: [s("分子内脱水","濃H₂SO₄・170 ℃",true)] },
    { nodes: [n("エタノール 2分子","2C₂H₅OH"),n("ジエチルエーテル","C₂H₅OC₂H₅")], steps: [s("分子間脱水","濃H₂SO₄・130〜140 ℃",true)] },
  ]},
  { id: "acetaldehyde", title: "アルデヒド（アセトアルデヒド）", category: "organic", paths: [
    { nodes: [n("エタノール","C₂H₅OH"),n("アセトアルデヒド","CH₃CHO"),n("酢酸","CH₃COOH")], steps: [s("酸化・脱水素","Cu・加熱",true),s("酸化","銀鏡・フェーリング反応",true)] },
    { nodes: [n("アセチレン","HC≡CH"),n("アセトアルデヒド","CH₃CHO")], steps: [s("水付加","HgSO₄・H₂SO₄",true)] },
  ]},
  { id: "acetylene", title: "アセチレン", category: "organic", paths: [
    { nodes: [n("炭化カルシウム","CaC₂"),n("アセチレン","HC≡CH"),n("アセトアルデヒド","CH₃CHO")], steps: [s("加水分解","H₂O",true),s("水付加","HgSO₄・H₂SO₄",true)] },
    { nodes: [n("アセチレン","HC≡CH"),n("エチレン","CH₂=CH₂"),n("エタン","CH₃CH₃")], steps: [s("H₂付加","Ni触媒"),s("H₂付加","Ni触媒")] },
    { nodes: [n("アセチレン 3分子","3HC≡CH"),n("ベンゼン","C₆H₆")], steps: [s("環化三量化","赤熱した鉄管",true)] },
  ]},
  { id: "benzene", title: "ベンゼン", category: "organic", paths: [
    { nodes: [n("ベンゼン","C₆H₆"),n("ニトロベンゼン","C₆H₅NO₂"),n("アニリン","C₆H₅NH₂")], steps: [s("ニトロ化","濃HNO₃＋濃H₂SO₄・加熱",true),s("還元","Sn＋濃HCl → NaOH",true)] },
    { nodes: [n("ベンゼン","C₆H₆"),n("クロロベンゼン","C₆H₅Cl"),n("フェノール","C₆H₅OH")], steps: [s("塩素化","Cl₂・FeCl₃触媒",true),s("加水分解","NaOH・高温高圧 → 酸処理",true)] },
    { nodes: [n("ベンゼン","C₆H₆"),n("ベンゼンスルホン酸","C₆H₅SO₃H"),n("フェノール","C₆H₅OH")], steps: [s("スルホン化","濃H₂SO₄・加熱"),s("アルカリ融解","NaOH・融解 → 酸処理",true)] },
  ]},
  { id: "nitrobenzene", title: "ニトロベンゼン", category: "organic", paths: [
    { nodes: [n("ベンゼン","C₆H₆"),n("ニトロベンゼン","C₆H₅NO₂"),n("アニリン塩酸塩","C₆H₅NH₃Cl"),n("アニリン","C₆H₅NH₂")], steps: [s("ニトロ化","濃HNO₃＋濃H₂SO₄",true),s("還元","Sn＋濃HCl・加熱",true),s("遊離","NaOH水溶液")] },
  ]},
  { id: "aniline", title: "アニリン", category: "organic", canvas: {width:1120,height:792}, centerNode:"アニリン", zones: {
    "ニトロベンゼン":"top", "アニリン塩酸塩":"top", "アニリン硫酸水素塩":"left", "塩化ベンゼンジアゾニウム":"left",
    "フェノール":"left", "p-フェニルアゾフェノール":"left", "プソイドモーベイン":"right", "アニリンブラック":"right",
    "アセトアニリド":"bottom", "酢酸":"bottom",
  }, paths: [
    { nodes: [n("ニトロベンゼン","C₆H₅NO₂"),n("アニリン塩酸塩","C₆H₅NH₃Cl"),n("アニリン","C₆H₅NH₂")], steps: [s("還元","Sn、HCl",true),s("遊離","NaOH",true)] },
    { nodes: [n("ニトロベンゼン","C₆H₅NO₂"),n("アニリン","C₆H₅NH₂")], steps: [s("接触還元","H₂、Ni触媒、加圧",true)] },
    { nodes: [n("アニリン","C₆H₅NH₂"),n("アニリン塩酸塩","C₆H₅NH₃Cl")], steps: [s("塩形成","濃HCl")] },
    { nodes: [n("アニリン","C₆H₅NH₂"),n("アニリン硫酸水素塩","[C₆H₅NH₃]HSO₄")], steps: [s("塩形成","濃H₂SO₄")] },
    { nodes: [n("アニリン","C₆H₅NH₂"),n("塩化ベンゼンジアゾニウム","C₆H₅N₂Cl")], steps: [s("ジアゾ化","希HCl、NaNO₂、0〜5 ℃",true)] },
    { nodes: [n("塩化ベンゼンジアゾニウム","C₆H₅N₂Cl"),n("フェノール","C₆H₅OH")], steps: [s("加水分解","H₂O、加熱、N₂発生",true)] },
    { nodes: [n("塩化ベンゼンジアゾニウム","C₆H₅N₂Cl"),colored("p-フェニルアゾフェノール","p-HOC₆H₄−N=N−C₆H₅","橙黄色","#d78314")], steps: [s("ジアゾカップリング","フェノール、NaOH水溶液",true)] },
    { nodes: [n("アニリン","C₆H₅NH₂"),colored("プソイドモーベイン","酸化生成物","紫色","#7c3da5")], steps: [s("さらし粉反応・検出","さらし粉水溶液 CaCl(ClO)·H₂O",true)] },
    { nodes: [n("アニリン","C₆H₅NH₂"),colored("アニリンブラック","酸化重合体","黒色","#111827")], steps: [s("酸化重合","K₂Cr₂O₇、硫酸酸性、加熱",true)] },
    { nodes: [n("アニリン","C₆H₅NH₂"),n("アセトアニリド","C₆H₅NHCOCH₃")], steps: [s("アセチル化","無水酢酸 (CH₃CO)₂O",true)] },
    { nodes: [n("アニリン","C₆H₅NH₂"),n("酢酸","CH₃COOH")], steps: [s("アセチル化の副生成物","無水酢酸からCH₃COOH生成")] },
  ]},
  { id: "phenol", title: "フェノール", category: "organic", paths: [
    { nodes: [n("フェノール","C₆H₅OH"),n("ナトリウムフェノキシド","C₆H₅ONa"),n("サリチル酸ナトリウム","o-HOC₆H₄COONa"),n("サリチル酸","o-HOC₆H₄COOH")], steps: [s("中和","NaOH"),s("Kolbe-Schmitt反応","CO₂・高温高圧",true),s("酸析出","HCl")] },
    { nodes: [n("フェノール","C₆H₅OH"),n("2,4,6-トリブロモフェノール","C₆H₂Br₃OH")], steps: [s("臭素化","Br₂水・白色沈殿",true)] },
    { nodes: [n("フェノール","C₆H₅OH"),n("ピクリン酸","2,4,6-(NO₂)₃C₆H₂OH")], steps: [s("ニトロ化","濃HNO₃・濃H₂SO₄",true)] },
  ]},
  { id: "sulfur", title: "硫黄", category: "inorganic", paths: [
    { nodes: [n("硫化水素","H₂S"),n("硫黄","S"),n("二酸化硫黄","SO₂"),n("三酸化硫黄","SO₃"),n("硫酸","H₂SO₄")], steps: [s("不完全酸化","O₂不足"),s("燃焼","O₂"),s("接触酸化","V₂O₅・約450 ℃",true),s("吸収・希釈","濃H₂SO₄→発煙硫酸→H₂O",true)] },
  ]},
  { id: "iron", title: "鉄", category: "inorganic", paths: [
    { nodes: [n("鉄","Fe"),n("塩化鉄(II)","FeCl₂"),n("水酸化鉄(II)","Fe(OH)₂"),n("水酸化鉄(III)","Fe(OH)₃")], steps: [s("酸との反応","希HCl"),s("沈殿","NaOH水溶液"),s("空気酸化","O₂・H₂O",true)] },
    { nodes: [n("鉄","Fe"),n("塩化鉄(III)","FeCl₃"),n("水酸化鉄(III)","Fe(OH)₃"),n("酸化鉄(III)","Fe₂O₃")], steps: [s("塩素化","Cl₂・加熱",true),s("沈殿","NaOH"),s("加熱脱水","Δ")] },
  ]},
  { id: "phosphorus", title: "リン", category: "inorganic", paths: [
    { nodes: [n("リン","P₄"),n("十酸化四リン","P₄O₁₀"),n("リン酸","H₃PO₄"),n("リン酸カルシウム","Ca₃(PO₄)₂")], steps: [s("燃焼","O₂",true),s("水和","H₂O"),s("中和","Ca(OH)₂")] },
    { nodes: [n("リン鉱石","Ca₃(PO₄)₂"),n("リン","P₄")], steps: [s("還元","SiO₂＋C・電気炉",true)] },
  ]},
  { id: "calcium", title: "カルシウム", category: "inorganic", paths: [
    { nodes: [n("カルシウム","Ca"),n("酸化カルシウム","CaO"),n("水酸化カルシウム","Ca(OH)₂"),n("炭酸カルシウム","CaCO₃"),n("炭酸水素カルシウム","Ca(HCO₃)₂")], steps: [s("酸化","O₂"),s("消化","H₂O・発熱",true),s("CO₂検出","CO₂・白濁",true),s("過剰CO₂","CO₂＋H₂O・溶解")] },
    { nodes: [n("炭酸カルシウム","CaCO₃"),n("酸化カルシウム","CaO")], steps: [s("熱分解","強熱・CO₂発生",true)] },
  ]},
  { id: "nitrogen", title: "窒素", category: "inorganic", paths: [
    { nodes: [n("窒素","N₂"),n("アンモニア","NH₃"),n("一酸化窒素","NO"),n("二酸化窒素","NO₂"),n("硝酸","HNO₃")], steps: [s("Haber-Bosch法","3H₂・Fe触媒・高温高圧",true),s("接触酸化","O₂・Pt-Rh触媒・約900 ℃",true),s("酸化","O₂"),s("水に吸収","H₂O＋O₂",true)] },
    { nodes: [n("アンモニア","NH₃"),n("塩化アンモニウム","NH₄Cl"),n("アンモニア","NH₃")], steps: [s("白煙・塩形成","HCl"),s("弱塩基の遊離","Ca(OH)₂・加熱",true)] },
  ]},
];
