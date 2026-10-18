/** Representative aqueous transition ranges; temperature/solvent and references cause small differences. */
export const acidBaseIndicators=[
 {id:"methyl-orange",learningId:"メチルオレンジ",name:"メチルオレンジ",low:3.1,high:4.4,acid:"赤",base:"黄",neutral:"黄",acidPaint:"#c95657",basePaint:"#e7c84d"},
 {id:"methyl-red",learningId:"メチルレッド",name:"メチルレッド",low:4.4,high:6.2,acid:"赤",base:"黄",neutral:"黄",acidPaint:"#c95657",basePaint:"#e7c84d"},
 {id:"btb",learningId:"BTB",name:"ブロモチモールブルー（BTB）",low:6,high:7.6,acid:"黄",base:"青",neutral:"緑",acidPaint:"#e7c84d",basePaint:"#4f81b7"},
 {id:"phenolphthalein",learningId:"フェノールフタレイン",name:"フェノールフタレイン",low:8.2,high:10,acid:"無色",base:"赤〜赤紫",neutral:"無色",acidPaint:"#f5f7fa",basePaint:"#c76b99"},
] as const;
export function indicatorLegacyCells(id:string){const i=acidBaseIndicators.find(i=>i.id===id)!;return [i.learningId,i.acid,i.neutral,`${i.base}（pH ${i.low.toFixed(1)}–${i.high.toFixed(1)}）`];}
