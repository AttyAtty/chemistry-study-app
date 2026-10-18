import { field, type Sugar } from "./types";
const make=(id:string,name:string,category:Sugar["category"],composition:string,units:Sugar["units"],reducingKind:Sugar["reducingKind"],hydrolysis:string,products:Sugar["units"],linkage:string,reaction:string,note:string,fischer?:Sugar["fischer"]):Sugar=>({
  id,name:field(`${id}:name`,name,"sugar"),category,composition:field(`${id}:composition`,composition,"composition"),units,
  formula:category==="mono" ? "C₆H₁₂O₆" : category==="di" ? "C₁₂H₂₂O₁₁" : "(C₆H₁₀O₅)ₙ",
  reducing:field(`${id}:reducing`,reducingKind==="yes" ? "あり" : reducingKind==="no" ? "なし" : "通常、示さない","reducing"),reducingKind,
  hydrolysis:field(`${id}:hydrolysis`,hydrolysis,"hydrolysis"),hydrolysisProducts:products,linkage,reaction,note,fischer,
});
export const sugars:Sugar[]=[
  make("glucose","グルコース","mono","単糖（アルドヘキソース）",["glucose"],"yes","これ以上の糖には加水分解されない",[],"鎖状ではアルデヒド基","銀鏡・フェーリング反応：陽性","水溶液中では主に環状構造をとる。図はD体の鎖状Fischer投影。",{carbonyl:"aldehyde",ohSides:["right","left","right","right"]}),
  make("fructose","フルクトース","mono","単糖（ケトヘキソース）",["fructose"],"yes","これ以上の糖には加水分解されない",[],"鎖状ではケトン基","銀鏡・フェーリング反応：陽性","ケトースだが、試薬の塩基性条件でアルドースに異性化するため還元性を示す。",{carbonyl:"ketone",ohSides:["left","right","right"]}),
  make("galactose","ガラクトース","mono","単糖（アルドヘキソース）",["galactose"],"yes","これ以上の糖には加水分解されない",[],"鎖状ではアルデヒド基","銀鏡・フェーリング反応：陽性","D-グルコースとはC4のOHの配置が異なる。",{carbonyl:"aldehyde",ohSides:["right","left","left","right"]}),
  make("maltose","マルトース","di","グルコース ＋ グルコース",["glucose","glucose"],"yes","グルコース ＋ グルコース",["glucose","glucose"],"α(1→4)結合","銀鏡・フェーリング反応：陽性","片方のアノマー炭素が遊離しており、開環できる。"),
  make("sucrose","スクロース","di","グルコース ＋ フルクトース",["glucose","fructose"],"no","グルコース ＋ フルクトース",["glucose","fructose"],"α(1↔2)β結合","加水分解前：銀鏡・フェーリング反応は陰性","両単糖のアノマー炭素が結合に使われる。加水分解後の混合物は還元性を示す。"),
  make("lactose","ラクトース","di","ガラクトース ＋ グルコース",["galactose","glucose"],"yes","ガラクトース ＋ グルコース",["galactose","glucose"],"β(1→4)結合","銀鏡・フェーリング反応：陽性","ガラクトースのC1とグルコースのC4が結合し、グルコース側のアノマー炭素が遊離。"),
  make("starch","デンプン","poly","α-グルコース",["glucose"],"negligible","完全加水分解でグルコース",["glucose"],"主鎖α(1→4)、分岐α(1→6)","ヨウ素反応：青紫色（主にアミロース）","アミロースはらせん状。アミロペクチンは枝分かれをもつ。加水分解途中にデキストリン・マルトースなどを生じる。"),
  make("glycogen","グリコーゲン","poly","α-グルコース",["glucose"],"negligible","完全加水分解でグルコース",["glucose"],"主鎖α(1→4)、多数のα(1→6)分岐","ヨウ素反応：赤褐色","動物の貯蔵多糖。アミロペクチンより分岐が多い。"),
  make("cellulose","セルロース","poly","β-グルコース",["glucose"],"negligible","完全加水分解でグルコース",["glucose"],"β(1→4)結合・直鎖状","ヨウ素反応：呈色しない","鎖間の水素結合で丈夫な繊維を作る。ヒトはセルラーゼをもたず消化できないが、酸やセルラーゼでは加水分解できる。"),
];
export const sugarCategoryLabels={mono:"単糖",di:"二糖",poly:"多糖"} as const;
export const sugarNotes=[
  "G・F・Galの図形は単糖1個を表す模式記号で、環の立体構造や環員数を表すものではない。結合位置は別のラベルで示す。",
  "還元糖は、通常の銀鏡反応で銀を析出させ、フェーリング液を加熱するとCu₂Oの赤色沈殿を生じる。フルクトースも塩基性条件で異性化するため陽性。",
  "スクロースは加水分解前には還元性を示さないが、加水分解後にできる単糖は還元性を示す。構成単糖が還元糖であっても、二糖全体が還元糖とは限らない。",
  "多糖にも還元末端はあるが、分子全体に対する割合が小さく、通常の高校化学の試験では還元性を示さないものとして扱う。加水分解後のグルコースは還元性を示す。",
  "加水分解の最終生成物は、十分な酸処理または適切な酵素を用いた場合。アミラーゼだけでデンプンが直ちにすべてグルコースになる、という意味ではない。",
];
export const sugarSources=[
  {title:"OpenStax：二糖と還元性",url:"https://openstax.org/books/organic-chemistry/pages/25-8-disaccharides"},
  {title:"OpenStax：多糖の結合と分岐",url:"https://openstax.org/books/organic-chemistry/pages/25-9-polysaccharides-and-their-synthesis"},
  {title:"OpenStax：単糖の反応",url:"https://openstax.org/books/organic-chemistry/pages/25-6-reactions-of-monosaccharides"},
];
