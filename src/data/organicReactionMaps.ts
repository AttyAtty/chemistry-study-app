import type { ReactionMap, ReactionNode, ReactionStep } from "@/data/reactionMaps";

type Scope = NonNullable<ReactionStep["scope"]>;
const nodeCatalog = new Map<string,ReactionNode>();
const n = (name:string,formula:string,appearance?:string,appearanceColor?:string):ReactionNode => {
  const key=`${name}|${formula}`,existing=nodeCatalog.get(key);
  if (existing) return existing;
  const node={name,formula,appearance,appearanceColor};nodeCatalog.set(key,node);return node;
};
const s = (label:string,condition?:string,scope:Scope="core",important=true,note?:string):ReactionStep => ({label,condition,scope,important,note});

const organicMapDefinitions:ReactionMap[] = [
  {id:"toluene",title:"トルエン",category:"organic",centerNode:"トルエン",canvas:{width:1500,height:1040},paths:[
    {nodes:[n("ベンゼン","C₆H₆"),n("トルエン","C₆H₅CH₃")],steps:[s("Friedel–Craftsアルキル化","CH₃Cl・無水AlCl₃","core")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("o-ニトロトルエン","o-CH₃C₆H₄NO₂")],steps:[s("ニトロ化（主にo,p体）","濃HNO₃＋濃H₂SO₄・加熱","core")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("p-ニトロトルエン","p-CH₃C₆H₄NO₂")],steps:[s("ニトロ化（主にo,p体）","濃HNO₃＋濃H₂SO₄・加熱","core")]},
    {nodes:[n("o-ニトロトルエン","o-CH₃C₆H₄NO₂"),n("2,4-ジニトロトルエン","CH₃C₆H₃(NO₂)₂")],steps:[s("追加ニトロ化","濃HNO₃＋濃H₂SO₄","advanced")]},
    {nodes:[n("2,4-ジニトロトルエン","CH₃C₆H₃(NO₂)₂"),n("2,4,6-トリニトロトルエン（TNT）","CH₃C₆H₂(NO₂)₃")],steps:[s("追加ニトロ化","濃HNO₃＋濃H₂SO₄","advanced")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("o-クロロトルエン","o-ClC₆H₄CH₃")],steps:[s("核塩素化","Cl₂・FeCl₃（暗所）","advanced")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("p-クロロトルエン","p-ClC₆H₄CH₃")],steps:[s("核塩素化","Cl₂・FeCl₃（暗所）","advanced")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("塩化ベンジル","C₆H₅CH₂Cl"),n("塩化ベンザル","C₆H₅CHCl₂"),n("ベンゾトリクロリド","C₆H₅CCl₃")],steps:[s("側鎖塩素化","Cl₂・光","advanced"),s("側鎖塩素化","Cl₂・光","advanced"),s("側鎖塩素化","Cl₂・光","advanced")]},
    {nodes:[n("塩化ベンジル","C₆H₅CH₂Cl"),n("ベンジルアルコール","C₆H₅CH₂OH"),n("ベンズアルデヒド","C₆H₅CHO"),n("安息香酸","C₆H₅COOH")],steps:[s("加水分解","NaOH水溶液・加熱","advanced"),s("穏やかな酸化","酸化剤・脱水素","advanced"),s("酸化","K₂Cr₂O₇/H⁺など","core")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("安息香酸","C₆H₅COOH")],steps:[s("側鎖酸化","KMnO₄・加熱→酸処理","core")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("安息香酸","C₆H₅COOH")],steps:[s("液相空気酸化","O₂・Co/Mn塩触媒・高温高圧","industrial")]},
    {nodes:[n("安息香酸","C₆H₅COOH"),n("安息香酸カリウム","C₆H₅COOK"),n("ベンゼン","C₆H₆")],steps:[s("中和","KOH","core"),s("脱炭酸","ソーダ石灰・加熱（NaOH/CaO）","core")]},
    {nodes:[n("安息香酸","C₆H₅COOH"),n("安息香酸ナトリウム","C₆H₅COONa")],steps:[s("中和","NaOH、またはNaHCO₃・CO₂発生","core")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("エチルベンゼン","C₆H₅CH₂CH₃")],steps:[s("同族体・構造比較","側鎖炭素数の比較","supplement",false)]},
    {nodes:[n("o-キシレン","o-C₆H₄(CH₃)₂"),n("フタル酸","o-C₆H₄(COOH)₂"),n("無水フタル酸","C₆H₄(CO)₂O")],steps:[s("側鎖酸化","KMnO₄","advanced"),s("分子内脱水","加熱（H₂O脱離）","advanced")]},
    {nodes:[n("トルエン","C₆H₅CH₃"),n("o-キシレン","o-C₆H₄(CH₃)₂")],steps:[s("Friedel–Craftsアルキル化","CH₃Cl・無水AlCl₃（p体も生成）","advanced")]},
    {nodes:[n("m-キシレン","m-C₆H₄(CH₃)₂"),n("イソフタル酸","m-C₆H₄(COOH)₂")],steps:[s("側鎖酸化","KMnO₄","advanced")]},
    {nodes:[n("p-キシレン","p-C₆H₄(CH₃)₂"),n("テレフタル酸","p-C₆H₄(COOH)₂"),n("PET","[−OCH₂CH₂OCOC₆H₄CO−]ₙ")],steps:[s("側鎖酸化","KMnO₄または工業的空気酸化","industrial"),s("縮合重合","エチレングリコール・脱水","industrial")]},
    {nodes:[n("ナフタレン","C₁₀H₈"),n("無水フタル酸","C₆H₄(CO)₂O")],steps:[s("接触酸化","O₂・V₂O₅触媒","industrial")]},
    {nodes:[n("無水フタル酸","C₆H₄(CO)₂O"),n("フタル酸","o-C₆H₄(COOH)₂")],steps:[s("加水分解","H₂O","advanced")]},
    {nodes:[n("フタル酸","o-C₆H₄(COOH)₂"),n("フタル酸モノメチル","o-C₆H₄(COOH)(COOCH₃)"),n("フタル酸ジメチル","o-C₆H₄(COOCH₃)₂")],steps:[s("一段階目のエステル化","CH₃OH・酸触媒・加熱","advanced"),s("二段階目のエステル化","CH₃OH・酸触媒・加熱","advanced")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("アントラセン","C₁₄H₁₀")],steps:[s("多段階合成","画像ではAlCl₃を伴う経路として簡略化","supplement",false,"単純なベンゼンと塩化ベンジルの一段階反応では主にジフェニルメタンが生じるため、アントラセン生成は多段階反応として扱います。")]},
  ]},
  {id:"phenol",title:"フェノール",category:"organic",centerNode:"フェノール",canvas:{width:1350,height:980},paths:[
    {nodes:[n("ベンゼンスルホン酸","C₆H₅SO₃H"),n("ベンゼンスルホン酸ナトリウム","C₆H₅SO₃Na"),n("ナトリウムフェノキシド","C₆H₅ONa"),n("フェノール","C₆H₅OH")],steps:[s("中和","NaOH水溶液","core"),s("アルカリ融解","固体NaOH・加熱","core"),s("酸析出","HClなど","core")]},
    {nodes:[n("クロロベンゼン","C₆H₅Cl"),n("ナトリウムフェノキシド","C₆H₅ONa")],steps:[s("Dow法","NaOH・高温高圧","industrial")]},
    {nodes:[n("フェノール","C₆H₅OH"),n("ナトリウムフェノキシド","C₆H₅ONa")],steps:[s("弱酸の塩形成","NaOH（またはNa・H₂発生）","core")]},
    {nodes:[n("ナトリウムフェノキシド","C₆H₅ONa"),n("フェノール","C₆H₅OH")],steps:[s("弱酸の遊離","CO₂＋H₂O（H₂CO₃）","core")]},
    {nodes:[n("フェノール","C₆H₅OH"),n("o-ニトロフェノール","o-NO₂C₆H₄OH")],steps:[s("ニトロ化","希HNO₃","advanced")]},
    {nodes:[n("フェノール","C₆H₅OH"),n("p-ニトロフェノール","p-NO₂C₆H₄OH")],steps:[s("ニトロ化","希HNO₃","advanced")]},
    {nodes:[n("フェノール","C₆H₅OH"),n("2,4-ジニトロフェノール","2,4-(NO₂)₂C₆H₃OH")],steps:[s("追加ニトロ化","濃HNO₃","advanced")]},
    {nodes:[n("フェノール","C₆H₅OH"),n("2,6-ジニトロフェノール","2,6-(NO₂)₂C₆H₃OH")],steps:[s("追加ニトロ化","濃HNO₃","advanced")]},
    {nodes:[n("フェノール","C₆H₅OH"),n("2,4,6-トリニトロフェノール（ピクリン酸）","C₆H₂(NO₂)₃OH")],steps:[s("強いニトロ化","濃HNO₃＋濃H₂SO₄","advanced")]},
    {nodes:[n("フェノール","C₆H₅OH"),n("2,4,6-トリブロモフェノール","C₆H₂Br₃OH","白色沈殿","#d8dde5")],steps:[s("臭素化","3Br₂水・白色沈殿","core")]},
    {nodes:[n("フェノール","C₆H₅OH"),n("酢酸フェニル","C₆H₅OCOCH₃"),n("酢酸","CH₃COOH")],steps:[s("アセチル化","無水酢酸 (CH₃CO)₂O","advanced"),s("副生成物","アセチル化で生成","supplement",false)]},
    {nodes:[n("フェノール","C₆H₅OH"),n("サリチル酸ナトリウム","o-HOC₆H₄COONa"),n("サリチル酸","o-HOC₆H₄COOH")],steps:[s("Kolbe–Schmitt反応","NaOH→CO₂・高温高圧","industrial"),s("酸析出","希H₂SO₄","core")]},
    {nodes:[n("サリチル酸","o-HOC₆H₄COOH"),n("サリチル酸メチル","o-HOC₆H₄COOCH₃")],steps:[s("エステル化","CH₃OH・濃H₂SO₄・加熱","core")]},
    {nodes:[n("サリチル酸","o-HOC₆H₄COOH"),n("アセチルサリチル酸","o-CH₃COOC₆H₄COOH")],steps:[s("アセチル化","無水酢酸・濃H₂SO₄触媒","advanced")]},
    {nodes:[n("クメン","C₆H₅CH(CH₃)₂"),n("クメンヒドロペルオキシド","C₆H₅C(CH₃)₂OOH"),n("フェノール","C₆H₅OH"),n("アセトン","(CH₃)₂CO")],steps:[s("空気酸化","O₂・高温高圧","industrial"),s("酸分解","H₂SO₄","industrial"),s("併産","クメン法の副生成物","industrial",false)]},
  ]},
  {id:"formaldehyde",title:"ホルムアルデヒド・ギ酸",category:"organic",centerNode:"ホルムアルデヒド",canvas:{width:1300,height:850},paths:[
    {nodes:[n("メタノール","CH₃OH"),n("ホルムアルデヒド","HCHO")],steps:[s("酸化","CuO・加熱（Cu、H₂O生成）","core")]},
    {nodes:[n("ホルムアルデヒド","HCHO"),n("パラホルムアルデヒド","HO(CH₂O)ₙH")],steps:[s("重合","放置","advanced")]},
    {nodes:[n("パラホルムアルデヒド","HO(CH₂O)ₙH"),n("ホルムアルデヒド","HCHO")],steps:[s("熱分解","加熱","advanced")]},
    {nodes:[n("ホルムアルデヒド","HCHO"),n("ギ酸","HCOOH"),n("二酸化炭素","CO₂")],steps:[s("酸化","酸化剤","core"),s("酸化","酸化剤","core")]},
    {nodes:[n("一酸化炭素","CO"),n("ギ酸ナトリウム","HCOONa"),n("ギ酸","HCOOH")],steps:[s("加圧反応","NaOH・高温高圧","industrial"),s("酸遊離","H₂SO₄","core")]},
    {nodes:[n("ギ酸","HCOOH"),n("銀","Ag")],steps:[s("銀鏡反応","[Ag(NH₃)₂]⁺・銀析出","core",true,"ギ酸は酸化されてCO₂となり、銀(I)イオンを還元します。")]},
    {nodes:[n("ホルムアルデヒド","HCHO"),n("ノボラック","フェノール樹脂・線状"),n("ベークライト","架橋フェノール樹脂")],steps:[s("縮合","フェノール・酸触媒・加熱","industrial"),s("架橋硬化","ヘキサメチレンテトラミン・加熱加圧","industrial")]},
    {nodes:[n("ホルムアルデヒド","HCHO"),n("レゾール","フェノール樹脂・初期縮合物"),n("ベークライト","架橋フェノール樹脂")],steps:[s("縮合","フェノール・塩基触媒・加熱","industrial"),s("架橋硬化","加熱加圧","industrial")]},
    {nodes:[n("ホルムアルデヒド","HCHO"),n("尿素樹脂","尿素−ホルムアルデヒド樹脂")],steps:[s("付加縮合","尿素 (NH₂)₂CO","industrial")]},
    {nodes:[n("ホルムアルデヒド","HCHO"),n("メラミン樹脂","メラミン−ホルムアルデヒド樹脂")],steps:[s("付加縮合","メラミン C₃N₃(NH₂)₃","industrial")]},
  ]},
  {id:"ethylene",title:"エチレン",category:"organic",centerNode:"エチレン",canvas:{width:1650,height:1100},paths:[
    {nodes:[n("アセチレン","HC≡CH"),n("エチレン","CH₂=CH₂"),n("エタン","CH₃CH₃")],steps:[s("水素付加","H₂・Ni/Pt/Pd","core"),s("水素付加","H₂・Ni/Pt","core")]},
    {nodes:[n("エタノール","C₂H₅OH"),n("エチレン","CH₂=CH₂")],steps:[s("分子内脱水","濃H₂SO₄・160〜170 ℃ またはAl₂O₃・約350 ℃","core")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("エタノール","C₂H₅OH")],steps:[s("工業的水和","H₂O・H₃PO₄触媒・高温高圧","industrial")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("硫酸水素エチル","C₂H₅OSO₃H"),n("エタノール","C₂H₅OH")],steps:[s("付加","濃H₂SO₄","advanced"),s("加水分解","H₂O・加熱（H₂SO₄再生）","advanced")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("1,2-ジブロモエタン","CH₂BrCH₂Br")],steps:[s("臭素付加","Br₂/CCl₄または臭素水・脱色","core")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("1,2-ジクロロエタン","CH₂ClCH₂Cl"),n("塩化ビニル","CH₂=CHCl"),n("ポリ塩化ビニル","[−CH₂−CHCl−]ₙ")],steps:[s("塩素付加","Cl₂・FeCl₃を用いない","advanced"),s("脱塩化水素","加熱","industrial"),s("付加重合","開始剤","industrial")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("クロロエタン","CH₃CH₂Cl")],steps:[s("塩化水素付加","HCl","advanced")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("アセトアルデヒド","CH₃CHO")],steps:[s("Wacker酸化","O₂・PdCl₂/CuCl₂","industrial")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("エチレングリコール","HOCH₂CH₂OH"),n("シュウ酸","(COOH)₂"),n("二酸化炭素","CO₂")],steps:[s("穏やかな酸化","希薄・冷・塩基性KMnO₄（脱色）","advanced"),s("酸化","酸化剤","advanced"),s("酸化","K₂Cr₂O₇/H⁺","advanced")]},
    {nodes:[n("エチレングリコール","HOCH₂CH₂OH"),n("PET","[−OCH₂CH₂OCOC₆H₄CO−]ₙ")],steps:[s("縮合重合","テレフタル酸・脱水","industrial")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("酢酸ビニル","CH₂=CHOCOCH₃"),n("ポリ酢酸ビニル","[−CH₂−CH(OCOCH₃)−]ₙ"),n("ポリビニルアルコール","[−CH₂−CH(OH)−]ₙ"),n("ビニロン","PVA−ホルムアルデヒド架橋体")],steps:[s("酸化的付加","CH₃COOH・O₂・Pd触媒","industrial"),s("付加重合","開始剤","industrial"),s("けん化","NaOH・CH₃OH","industrial"),s("アセタール化","HCHO","industrial")]},
    {nodes:[n("ポリ酢酸ビニル","[−CH₂−CH(OCOCH₃)−]ₙ"),n("酢酸メチル","CH₃COOCH₃")],steps:[s("エステル交換・けん化副生成物","CH₃OH・NaOH","supplement")]},
    {nodes:[n("ポリビニルアルコール","[−CH₂−CH(OH)−]ₙ"),n("塩析したPVA","PVA↓")],steps:[s("塩析","Na₂SO₄水溶液","supplement")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("ポリエチレン","[−CH₂−CH₂−]ₙ")],steps:[s("付加重合","開始剤（高圧法／触媒法）","industrial")]},
  ]},
  {id:"ethanol",title:"エタノール",category:"organic",centerNode:"エタノール",canvas:{width:1350,height:1000},paths:[
    {nodes:[n("グルコース","C₆H₁₂O₆"),n("エタノール","C₂H₅OH")],steps:[s("アルコール発酵","酵母・約30 ℃・CO₂副生","industrial")]},
    {nodes:[n("エタノール","C₂H₅OH"),n("ヨードホルム","CHI₃","黄色沈殿","#d6b53f")],steps:[s("ヨードホルム反応","I₂・NaOH（HCOONa、NaI、H₂O副生）","core")]},
    {nodes:[n("エタノール","C₂H₅OH"),n("ナトリウムエトキシド","C₂H₅ONa")],steps:[s("Naとの反応","Na・H₂発生","core")]},
    {nodes:[n("エタノール","C₂H₅OH"),n("ジエチルエーテル","C₂H₅OC₂H₅")],steps:[s("分子間脱水","濃H₂SO₄・約130〜140 ℃","core")]},
    {nodes:[n("エタノール","C₂H₅OH"),n("エチレン","CH₂=CH₂")],steps:[s("分子内脱水","濃H₂SO₄・160〜170 ℃ またはP₄O₁₀・加熱","core")]},
    {nodes:[n("エタノール","C₂H₅OH"),n("アセトアルデヒド","CH₃CHO"),n("酢酸","CH₃COOH")],steps:[s("酸化","K₂Cr₂O₇/H⁺ またはCu・加熱","core"),s("酸化","K₂Cr₂O₇/H⁺","core")]},
    {nodes:[n("エチレン","CH₂=CH₂"),n("アセトアルデヒド","CH₃CHO")],steps:[s("Wacker酸化","O₂・PdCl₂/CuCl₂","industrial")]},
    {nodes:[n("ビニルアルコール","CH₂=CHOH"),n("アセトアルデヒド","CH₃CHO")],steps:[s("ケト–エノール互変異性","速やかにアセトアルデヒドへ","advanced")]},
    {nodes:[n("酢酸","CH₃COOH"),n("酢酸エチル","CH₃COOC₂H₅"),n("酢酸ナトリウム","CH₃COONa")],steps:[s("エステル化","エタノール・濃H₂SO₄・加熱","core"),s("けん化","NaOH・加熱（エタノール副生）","core")]},
    {nodes:[n("酢酸ナトリウム","CH₃COONa"),n("メタン","CH₄")],steps:[s("脱炭酸","NaOH/CaO（ソーダ石灰）・加熱","advanced")]},
    {nodes:[n("酢酸","CH₃COOH"),n("無水酢酸","(CH₃CO)₂O")],steps:[s("脱水","P₄O₁₀","advanced")]},
    {nodes:[n("酢酸カルシウム","(CH₃COO)₂Ca"),n("アセトン","(CH₃)₂CO")],steps:[s("乾留","加熱・CaCO₃副生","advanced")]},
  ]},
  {id:"benzene",title:"ベンゼン",category:"organic",centerNode:"ベンゼン",canvas:{width:1650,height:1150},paths:[
    {nodes:[n("アセチレン","HC≡CH"),n("ベンゼン","C₆H₆")],steps:[s("環化三量化","赤熱した鉄管・約500 ℃","core")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("ニトロベンゼン","C₆H₅NO₂")],steps:[s("ニトロ化","濃HNO₃＋濃H₂SO₄・約60 ℃","core")]},
    {nodes:[n("ニトロベンゼン","C₆H₅NO₂"),n("m-ジニトロベンゼン","m-C₆H₄(NO₂)₂")],steps:[s("追加ニトロ化","濃HNO₃＋濃H₂SO₄・95 ℃以上","advanced")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("ベンゼンスルホン酸","C₆H₅SO₃H"),n("ベンゼンスルホン酸ナトリウム","C₆H₅SO₃Na"),n("ナトリウムフェノキシド","C₆H₅ONa"),n("フェノール","C₆H₅OH")],steps:[s("スルホン化","濃H₂SO₄・加熱","core"),s("中和","NaOH水溶液","core"),s("アルカリ融解","固体NaOH・加熱","core"),s("酸析出","HCl","core")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("クロロベンゼン","C₆H₅Cl"),n("ナトリウムフェノキシド","C₆H₅ONa")],steps:[s("塩素化","Cl₂・FeCl₃","core"),s("Dow法","NaOH・高温高圧","industrial")]},
    {nodes:[n("クロロベンゼン","C₆H₅Cl"),n("p-ジクロロベンゼン","p-C₆H₄Cl₂")],steps:[s("追加塩素化","Cl₂・FeCl₃（p体約55%）","advanced")]},
    {nodes:[n("クロロベンゼン","C₆H₅Cl"),n("o-ジクロロベンゼン","o-C₆H₄Cl₂")],steps:[s("追加塩素化","Cl₂・FeCl₃（o体約39%）","advanced")]},
    {nodes:[n("クロロベンゼン","C₆H₅Cl"),n("m-ジクロロベンゼン","m-C₆H₄Cl₂")],steps:[s("異性体（少量）","直接置換では少量・画像値約6%","supplement",false)]},
    {nodes:[n("ベンゼン","C₆H₆"),n("ベンゼンヘキサクロリド（BHC）","C₆H₆Cl₆")],steps:[s("光付加","3Cl₂・紫外線","advanced")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("シクロヘキサン","C₆H₁₂"),n("アジピン酸","HOOC(CH₂)₄COOH"),n("ナイロン66","[−NH(CH₂)₆NHCO(CH₂)₄CO−]ₙ")],steps:[s("水素化","3H₂・Ni・高温高圧","industrial"),s("酸化開環","O₃等・工業的多段階酸化","supplement"),s("縮合重合","ヘキサメチレンジアミン","industrial")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("クメン","C₆H₅CH(CH₃)₂"),n("フェノール","C₆H₅OH")],steps:[s("Friedel–Craftsアルキル化","プロペン・酸触媒","industrial"),s("クメン法","O₂→酸分解（アセトン併産）","industrial")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("トルエン","C₆H₅CH₃"),n("安息香酸","C₆H₅COOH")],steps:[s("Friedel–Craftsアルキル化","CH₃Cl・AlCl₃","core"),s("側鎖酸化","KMnO₄・加熱","core")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("エチルベンゼン","C₆H₅CH₂CH₃"),n("スチレン","C₆H₅CH=CH₂")],steps:[s("Friedel–Craftsアルキル化","C₂H₅Cl・AlCl₃","advanced"),s("脱水素","Fe₂O₃・加熱","industrial")]},
    {nodes:[n("ベンゼン","C₆H₆"),n("アセトフェノン","C₆H₅COCH₃")],steps:[s("Friedel–Craftsアシル化","CH₃COCl・AlCl₃","advanced")]},
  ]},
  {id:"acetylene",title:"アセチレン",category:"organic",centerNode:"アセチレン",canvas:{width:1800,height:1250},paths:[
    {nodes:[n("炭化カルシウム","CaC₂"),n("アセチレン","HC≡CH")],steps:[s("加水分解","2H₂O・Ca(OH)₂副生","core")]},
    {nodes:[n("メタン","CH₄"),n("アセチレン","HC≡CH")],steps:[s("熱分解","高温・2CH₄→C₂H₂+3H₂","industrial")]},
    {nodes:[n("アセチレン","HC≡CH"),n("エチレン","CH₂=CH₂"),n("エタン","CH₃CH₃")],steps:[s("部分水素化","H₂・Ni/Pt/Pd","core"),s("水素化","H₂・Ni/Pt/Pd","core")]},
    {nodes:[n("アセチレン","HC≡CH"),n("1,2-ジブロモエチレン","CHBr=CHBr"),n("1,1,2,2-テトラブロモエタン","CHBr₂CHBr₂")],steps:[s("臭素付加","Br₂","core"),s("臭素付加","Br₂","core")]},
    {nodes:[n("アセチレン","HC≡CH"),n("二酸化炭素","CO₂")],steps:[s("完全燃焼","O₂・酸素アセチレン炎","core")]},
    {nodes:[n("アセチレン","HC≡CH"),n("ポリアセチレン","[−CH=CH−]ₙ")],steps:[s("重合","Ziegler–Natta系触媒","advanced")]},
    {nodes:[n("アセチレン","HC≡CH"),n("ベンゼン","C₆H₆")],steps:[s("環化三量化","赤熱鉄管","core")]},
    {nodes:[n("アセチレン","HC≡CH"),n("銀アセチリド","AgC≡CAg","白色沈殿","#d8dde5")],steps:[s("末端アルキン検出","アンモニア性硝酸銀水溶液・NH₃副生","core")]},
    {nodes:[n("アセチレン","HC≡CH"),n("銅(I)アセチリド","CuC≡CCu","赤褐色沈殿","#9b4d38")],steps:[s("末端アルキン検出","アンモニア性塩化銅(I)水溶液・NH₃副生","core")]},
    {nodes:[n("アセチレン","HC≡CH"),n("ビニルアルコール","CH₂=CHOH"),n("アセトアルデヒド","CH₃CHO"),n("酢酸","CH₃COOH")],steps:[s("水付加","H₂SO₄・HgSO₄","core"),s("互変異性","速やかに変化","core"),s("酸化","O₂/Mn塩またはK₂Cr₂O₇","core")]},
    {nodes:[n("酢酸","CH₃COOH"),n("無水酢酸","(CH₃CO)₂O")],steps:[s("脱水","P₄O₁₀","advanced")]},
    {nodes:[n("酢酸","CH₃COOH"),n("酢酸ビニル","CH₂=CHOCOCH₃")],steps:[s("付加","アセチレン・酢酸亜鉛触媒","industrial")]},
    {nodes:[n("アセチレン","HC≡CH"),n("アクリロニトリル","CH₂=CHCN"),n("ポリアクリロニトリル","[−CH₂−CH(CN)−]ₙ")],steps:[s("シアン化水素付加","HCN・CuCl/NH₄Cl触媒","industrial"),s("付加重合","開始剤","industrial")]},
    {nodes:[n("アクリロニトリル","CH₂=CHCN"),n("アクリルアミド","CH₂=CHCONH₂"),n("アクリル酸","CH₂=CHCOOH"),n("アクリル酸ナトリウム","CH₂=CHCOONa"),n("吸水性高分子","[−CH₂−CH(COONa)−]ₙ")],steps:[s("部分加水分解","H₂O","advanced"),s("加水分解","H₂O・酸/塩基","advanced"),s("中和","NaOH","core"),s("架橋共重合","少量の架橋剤","industrial")]},
    {nodes:[n("アクリロニトリル","CH₂=CHCN"),n("NBR","ブタジエン−アクリロニトリル共重合体")],steps:[s("付加共重合","1,3-ブタジエン","industrial")]},
    {nodes:[n("プロペン","CH₂=CHCH₃"),n("アクリロニトリル","CH₂=CHCN"),n("アセトニトリル","CH₃CN")],steps:[s("SOHIO法（アンモ酸化）","NH₃＋O₂・触媒（HCN、CO₂等も副生）","industrial"),s("副生成物","工業的アンモ酸化で少量併産","supplement",false,"画像のアクリロニトリルからアセトニトリルへの直接変換ではなく、プロペンのアンモ酸化における併産として整理しています。")]},
    {nodes:[n("アセチレン","HC≡CH"),n("ビニルアセチレン","CH₂=CHC≡CH"),n("1,3-ブタジエン","CH₂=CHCH=CH₂"),n("ブタジエンゴム（BR）","[−CH₂−CH=CH−CH₂−]ₙ")],steps:[s("二量化","CuCl/NH₄Cl触媒","industrial"),s("部分水素化","H₂・Lindlar触媒","advanced"),s("付加重合","開始剤","industrial")]},
    {nodes:[n("1,3-ブタジエン","CH₂=CHCH=CH₂"),n("SBR","スチレン−ブタジエン共重合体")],steps:[s("付加共重合","スチレン","industrial")]},
    {nodes:[n("アセチレン","HC≡CH"),n("塩化ビニル","CH₂=CHCl"),n("ポリ塩化ビニル","[−CH₂−CHCl−]ₙ")],steps:[s("HCl付加","HCl・HgCl₂触媒","industrial"),s("付加重合","開始剤","industrial")]},
    {nodes:[n("塩化ビニル","CH₂=CHCl"),n("塩化ビニリデン","CH₂=CCl₂"),n("ポリ塩化ビニリデン","[−CH₂−CCl₂−]ₙ")],steps:[s("塩素化・脱HCl","Cl₂付加後に脱塩化水素","industrial"),s("付加重合","開始剤","industrial")]},
  ]},
  {id:"aniline",title:"アニリン",category:"organic",centerNode:"アニリン",canvas:{width:1400,height:950},paths:[
    {nodes:[n("ニトロベンゼン","C₆H₅NO₂"),n("アニリン塩酸塩","C₆H₅NH₃Cl"),n("アニリン","C₆H₅NH₂")],steps:[s("還元","Sn＋濃HCl・加熱","core"),s("遊離","NaOH水溶液","core")]},
    {nodes:[n("ニトロベンゼン","C₆H₅NO₂"),n("アニリン","C₆H₅NH₂")],steps:[s("接触還元","H₂・Ni触媒・加圧","industrial")]},
    {nodes:[n("アニリン","C₆H₅NH₂"),n("アニリン塩酸塩","C₆H₅NH₃Cl")],steps:[s("塩形成","希HCl","core")]},
    {nodes:[n("アニリン","C₆H₅NH₂"),n("アニリン硫酸水素塩","[C₆H₅NH₃]HSO₄")],steps:[s("塩形成","希H₂SO₄","advanced")]},
    {nodes:[n("アニリン","C₆H₅NH₂"),n("塩化ベンゼンジアゾニウム","C₆H₅N₂Cl")],steps:[s("ジアゾ化","NaNO₂＋希HCl・0〜5 ℃","core")]},
    {nodes:[n("塩化ベンゼンジアゾニウム","C₆H₅N₂Cl"),n("フェノール","C₆H₅OH")],steps:[s("加水分解","H₂O・5 ℃より高温・N₂発生","core")]},
    {nodes:[n("塩化ベンゼンジアゾニウム","C₆H₅N₂Cl"),n("p-フェニルアゾフェノール","p-HOC₆H₄N=NC₆H₅","橙黄色","#d78314")],steps:[s("ジアゾカップリング","フェノール＋NaOH","core")]},
    {nodes:[n("アニリン","C₆H₅NH₂"),n("プソイドモーベイン","酸化色素","紫色","#7c3da5")],steps:[s("さらし粉反応","CaCl(ClO)水溶液・紫色","core")]},
    {nodes:[n("アニリン","C₆H₅NH₂"),n("アニリンブラック","酸化重合体","黒色","#111827")],steps:[s("酸化重合","K₂Cr₂O₇・硫酸酸性・加熱","advanced")]},
    {nodes:[n("アニリン","C₆H₅NH₂"),n("アセトアニリド","C₆H₅NHCOCH₃"),n("酢酸","CH₃COOH")],steps:[s("アセチル化","無水酢酸 (CH₃CO)₂O","core"),s("副生成物","アセチル化で生成","supplement",false)]},
    {nodes:[n("アセトアニリド","C₆H₅NHCOCH₃"),n("アニリン","C₆H₅NH₂")],steps:[s("加水分解","酸または塩基・加熱","advanced")]},
  ]},
];

export type OrganicImportance = "core" | "advanced" | "supplement" | "industrial";
export type OrganicCompound = { id:string; nameJa:string; nameEn?:string; formula:string; aliases:string[]; classifications:string[]; appearance?:string; appearanceColor?:string; relatedReactionIds:string[] };
export type OrganicReaction = { id:string; sourceId:string; targetId:string; source:ReactionNode; target:ReactionNode; additionalReactants:string[]; reagents:string[]; catalysts:string[]; conditions:string[]; temperature?:string; pressure?:string; reactionName:string; reactionType:string; byproducts:string[]; observation?:string; notes?:string; importance:OrganicImportance; relatedMaps:string[]; step:ReactionStep };

const preferredCompoundIds:Record<string,[string,string?]>={
  "ベンゼン":["benzene","benzene"],"トルエン":["toluene","toluene"],"フェノール":["phenol","phenol"],"アニリン":["aniline","aniline"],
  "ニトロベンゼン":["nitrobenzene","nitrobenzene"],"安息香酸":["benzoic-acid","benzoic acid"],"エチレン":["ethylene","ethylene"],
  "アセチレン":["acetylene","acetylene"],"エタノール":["ethanol","ethanol"],"アセトアルデヒド":["acetaldehyde","acetaldehyde"],
  "酢酸":["acetic-acid","acetic acid"],"ホルムアルデヒド":["formaldehyde","formaldehyde"],"ギ酸":["formic-acid","formic acid"],
  "スチレン":["styrene","styrene"],"エチルベンゼン":["ethylbenzene","ethylbenzene"],"クロロベンゼン":["chlorobenzene","chlorobenzene"],
};
const stableHash=(value:string)=>[...value].reduce((sum,char)=>(sum*31+char.charCodeAt(0))>>>0,7).toString(36);
const compoundId=(node:ReactionNode)=>preferredCompoundIds[node.name]?.[0]??`organic-${stableHash(`${node.name}|${node.formula}`)}`;
const splitCondition=(condition?:string)=>condition?condition.split(/[・、]/).map(value=>value.trim()).filter(Boolean):[];
const classifyCompound=(node:ReactionNode)=>[
  /ベンゼン|フェノール|アニリン|トルエン|キシレン|安息香|フタル|サリチル|スチレン|クメン/.test(`${node.name}${node.formula}`)&&"芳香族",
  /ポリ|樹脂|PET|PVC|PVA|NBR|SBR|BR|ナイロン|ビニロン/.test(node.name)&&"高分子",
  /酸|COOH/.test(`${node.name}${node.formula}`)&&"カルボン酸・誘導体",
  /アルコール|OH/.test(`${node.name}${node.formula}`)&&"アルコール・フェノール",
  /アルデヒド|CHO|HCHO/.test(`${node.name}${node.formula}`)&&"アルデヒド",
].filter((item):item is string=>Boolean(item));
const compoundStore=new Map<string,OrganicCompound>(),reactionStore=new Map<string,OrganicReaction>();
const reactionKey=(source:ReactionNode,target:ReactionNode,step:ReactionStep)=>`${compoundId(source)}|${compoundId(target)}|${step.label}|${step.condition??""}`;
for(const map of organicMapDefinitions) for(const path of map.paths){
  path.nodes.forEach(node=>{const id=compoundId(node);if(!compoundStore.has(id))compoundStore.set(id,{id,nameJa:node.name,nameEn:preferredCompoundIds[node.name]?.[1],formula:node.formula,aliases:[],classifications:classifyCompound(node),appearance:node.appearance,appearanceColor:node.appearanceColor,relatedReactionIds:[]});});
  path.steps.forEach((step,index)=>{const source=path.nodes[index],target=path.nodes[index+1];if(!source||!target)return;const key=reactionKey(source,target,step),existing=reactionStore.get(key);if(existing){if(!existing.relatedMaps.includes(map.id))existing.relatedMaps.push(map.id);return;}const parts=splitCondition(step.condition),id=`reaction-${stableHash(key)}`;const catalysts=parts.filter(value=>/触媒|AlCl₃|FeCl₃|Fe触媒|Ni|Pt|Pd|CuCl|HgSO₄|HgCl₂|V₂O₅|Fe₂O₃|H₃PO₄/.test(value));const temperature=parts.find(value=>/℃|高温|加熱|強熱|赤熱/.test(value));const pressure=parts.find(value=>/圧/.test(value));const byproducts=parts.filter(value=>/副生|生成|脱離|発生/.test(value));reactionStore.set(key,{id,sourceId:compoundId(source),targetId:compoundId(target),source,target,additionalReactants:parts.filter(value=>/^\+/.test(value)),reagents:parts.filter(value=>!catalysts.includes(value)&&value!==temperature&&value!==pressure&&!byproducts.includes(value)),catalysts,conditions:parts,temperature,pressure,reactionName:step.label,reactionType:step.label,byproducts,observation:target.appearance,notes:step.note,importance:step.scope??"core",relatedMaps:[map.id],step});compoundStore.get(compoundId(source))?.relatedReactionIds.push(id);compoundStore.get(compoundId(target))?.relatedReactionIds.push(id);});
}
export const organicCompounds=[...compoundStore.values()];
export const organicReactions=[...reactionStore.values()];
export const expandedOrganicReactionMaps:ReactionMap[]=organicMapDefinitions;

const quizCandidates=organicReactions.filter(reaction=>reaction.importance==="core"||(reaction.importance==="industrial"&&/クメン|Wacker|SOHIO|重合|Kolbe|Dow|発酵/.test(`${reaction.reactionName}${reaction.conditions.join(" ")}`))).slice(0,64);
const allConditions = [...new Set(quizCandidates.map((reaction) => `${reaction.reactionName}${reaction.conditions.length ? `（${reaction.conditions.join("・")}）` : ""}`))];
export const expandedOrganicQuestions = quizCandidates.map((reaction, reactionIndex) => {
  const correct = `${reaction.reactionName}${reaction.conditions.length ? `（${reaction.conditions.join("・")}）` : ""}`;
  const distractors = allConditions.filter((item) => item !== correct).filter((_, index) => index % 7 === reactionIndex % 7).slice(0, 3);
  const rawChoices = [correct, ...distractors].slice(0, 4), shift = reactionIndex % rawChoices.length;
  const choices = [...rawChoices.slice(shift), ...rawChoices.slice(0, shift)];
  return {
    id: `organic-${reaction.id}`,
    prompt: `${reaction.source.name}から${reaction.target.name}へ変換する反応・条件として最も適切なものはどれですか。`,
    choices,
    answerIndex: choices.indexOf(correct),
    explanation: `${reaction.source.name} → ${reaction.target.name} は、${correct}です。${reaction.notes ? ` ${reaction.notes}` : ""}`,
    tags: [...reaction.relatedMaps, reaction.importance === "industrial" ? "工業的反応" : "基本"],
  };
});
