import { field, type Sugar } from "./types";
import { sugarCyclicStructures } from "./sugarRings";
const make=(id:string,name:string,category:Sugar["category"],composition:string,units:Sugar["units"],reducingKind:Sugar["reducingKind"],hydrolysis:string,products:Sugar["units"],linkage:string,reaction:string,note:string,fischer?:Sugar["fischer"]):Sugar=>({
  id,name:field(`${id}:name`,name,"sugar"),category,composition:field(`${id}:composition`,composition,category==="mono"?"carbonyl-type":"composition"),units,
  formula:category==="mono" ? "C₆H₁₂O₆" : category==="di" ? "C₁₂H₂₂O₁₁" : "(C₆H₁₀O₅)ₙ",
  reducing:field(`${id}:reducing`,reducingKind==="yes" ? "あり" : reducingKind==="no" ? "なし" : "通常、示さない","reducing"),reducingKind,
  hydrolysis:field(`${id}:hydrolysis`,hydrolysis,"hydrolysis"),hydrolysisProducts:products,linkage,reaction,note,fischer,cyclic:sugarCyclicStructures[id],
});
export const sugars:Sugar[]=[
  make("glucose","グルコース","mono","アルドヘキソース",["glucose"],"yes","これ以上の糖には加水分解されない",[],"鎖状ではアルデヒド基","銀鏡・フェーリング反応：陽性","α-D体の六員環を例示。水中ではα・β形と鎖状形が平衡。",{carbonyl:"aldehyde",ohSides:["right","left","right","right"]}),
  make("fructose","フルクトース","mono","ケトヘキソース",["fructose"],"yes","これ以上の糖には加水分解されない",[],"鎖状ではケトン基","銀鏡・フェーリング反応：陽性","五員環・六員環が存在。塩基性条件で異性化し還元性を示す。",{carbonyl:"ketone",ohSides:["left","right","right"]}),
  make("galactose","ガラクトース","mono","アルドヘキソース",["galactose"],"yes","これ以上の糖には加水分解されない",[],"鎖状ではアルデヒド基","銀鏡・フェーリング反応：陽性","グルコースのC4エピマー。比較は両方をα-D体で表示。",{carbonyl:"aldehyde",ohSides:["right","left","left","right"]}),
  make("maltose","マルトース","di","グルコース ＋ グルコース",["glucose","glucose"],"yes","グルコース ＋ グルコース",["glucose","glucose"],"α(1→4)結合","銀鏡・フェーリング反応：陽性","片方のアノマー炭素が遊離しており、開環できる。"),
  make("sucrose","スクロース","di","グルコース ＋ フルクトース",["glucose","fructose"],"no","グルコース ＋ フルクトース",["glucose","fructose"],"α(1↔2)β結合","加水分解前：銀鏡・フェーリング反応は陰性","両単糖のアノマー炭素が結合に使われる。加水分解後の混合物は還元性を示す。"),
  make("lactose","ラクトース","di","ガラクトース ＋ グルコース",["galactose","glucose"],"yes","ガラクトース ＋ グルコース",["galactose","glucose"],"β(1→4)結合","銀鏡・フェーリング反応：陽性","ガラクトースのC1とグルコースのC4が結合し、グルコース側のアノマー炭素が遊離。"),
  make("starch","デンプン","poly","α-グルコース",["glucose"],"negligible","完全加水分解でグルコース",["glucose"],"主鎖α(1→4)、分岐α(1→6)","ヨウ素反応：青紫色（主にアミロース）","アミロースはらせん状。アミロペクチンは枝分かれをもつ。加水分解途中にデキストリン・マルトースなどを生じる。"),
  make("glycogen","グリコーゲン","poly","α-グルコース",["glucose"],"negligible","完全加水分解でグルコース",["glucose"],"主鎖α(1→4)、多数のα(1→6)分岐","ヨウ素反応：赤褐色","動物の貯蔵多糖。アミロペクチンより分岐が多い。"),
  make("cellulose","セルロース","poly","β-グルコース",["glucose"],"negligible","完全加水分解でグルコース",["glucose"],"β(1→4)結合・直鎖状","ヨウ素反応：呈色しない","鎖間の水素結合で丈夫な繊維を作る。ヒトはセルラーゼをもたず消化できないが、酸やセルラーゼでは加水分解できる。"),
];
export const sugarCategoryLabels={mono:"単糖",di:"二糖",poly:"多糖"} as const;
export const sugarNotes=[
  "環状図はHaworth投影。グルコース・ガラクトースはα-D体の六員環、フルクトースはβ-D体の五員環または六員環の例を示す。環員数は環内原子（酸素を含む）の数で、炭素数ではない。3種とも炭素数6の六炭糖。",
  "同じD体・同じアノマーで比べると、グルコースとガラクトースはC4のOH配置だけが異なる。α形とβ形の違いはアノマー炭素の配置であり、C4の違いとは別の関係。",
  "アノマー炭素は鎖状形のカルボニル炭素に由来する。アルドースではC1、ここで扱うケトースではC2。フルクトースの五員環はC5のOH、六員環はC6のOHがC2に付加して生じる。",
  "二糖などの小さな環は単糖1個の代表的な環骨格の記号。置換基・立体配置と、単糖間をつなぐ酸素は省略しており、完全な二糖構造式ではない。結合位置は別のラベルで示す。",
  "還元糖は、通常の銀鏡反応で銀を析出させ、フェーリング液を加熱するとCu₂Oの赤色沈殿を生じる。フルクトースも塩基性条件で異性化するため陽性。",
  "スクロースは加水分解前には還元性を示さないが、加水分解後にできる単糖は還元性を示す。構成単糖が還元糖であっても、二糖全体が還元糖とは限らない。",
  "多糖にも還元末端はあるが、分子全体に対する割合が小さく、通常の高校化学の試験では還元性を示さないものとして扱う。加水分解後のグルコースは還元性を示す。",
  "加水分解の最終生成物は、十分な酸処理または適切な酵素を用いた場合。アミラーゼだけでデンプンが直ちにすべてグルコースになる、という意味ではない。",
];
export const sugarSources=[
  {title:"OpenStax：環状構造とアノマー、Fischer投影との対応",url:"https://openstax.org/books/organic-chemistry/pages/25-5-cyclic-structures-of-monosaccharides-anomers"},
  {title:"OpenStax：二糖と還元性",url:"https://openstax.org/books/organic-chemistry/pages/25-8-disaccharides"},
  {title:"OpenStax：多糖の結合と分岐",url:"https://openstax.org/books/organic-chemistry/pages/25-9-polysaccharides-and-their-synthesis"},
  {title:"OpenStax：単糖の反応",url:"https://openstax.org/books/organic-chemistry/pages/25-6-reactions-of-monosaccharides"},
];
