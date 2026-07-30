import type { ChemistryUnit, QuizQuestion } from "@/data/chemistry";
import { densityLabels, gases, solubilityLabels } from "@/data/gases";

const pickAlternatives=(index:number,values:string[],correct:string,count=3)=>{
  const unique=[...new Set(values.filter(value=>value!==correct))];
  return Array.from({length:Math.min(count,unique.length)},(_,offset)=>unique[(index*3+offset*5)%unique.length]);
};
const shuffledChoices=(correct:string,alternatives:string[],index:number)=>{
  const choices=[correct,...alternatives].slice(0,4);const shift=index%choices.length;
  const rotated=[...choices.slice(shift),...choices.slice(0,shift)];return {choices:rotated,answerIndex:rotated.indexOf(correct)};
};

const gasQuestions:QuizQuestion[]=gases.flatMap((gas,index)=>{
  const formula=shuffledChoices(gas.formula,pickAlternatives(index,gases.map(item=>item.formula),gas.formula),index);
  const solubility=shuffledChoices(solubilityLabels[gas.waterSolubility],pickAlternatives(index,Object.values(solubilityLabels),solubilityLabels[gas.waterSolubility]),index+1);
  const collection=shuffledChoices(gas.collectionMethods[0],pickAlternatives(index,["水上置換法","上方置換法","下方置換法","通常の生徒実験では捕集しない"],gas.collectionMethods[0]),index+2);
  const equation=shuffledChoices(gas.preparation[0].equation,pickAlternatives(index,gases.map(item=>item.preparation[0].equation),gas.preparation[0].equation),index+3);
  const detection=shuffledChoices(gas.detectionMethods[0].description,pickAlternatives(index,gases.map(item=>item.detectionMethods[0].description),gas.detectionMethods[0].description),index+4);
  return [
    {id:`gas-${gas.id}-formula`,prompt:`${gas.name}の化学式はどれですか。`,...formula,explanation:`${gas.name}の化学式は${gas.formula}です。`,tags:[gas.name,"化学式"]},
    {id:`gas-${gas.id}-solubility`,prompt:`${gas.formula}の水への溶けやすさとして適切なものはどれですか。`,...solubility,explanation:`${gas.formula}は「${solubilityLabels[gas.waterSolubility]}」に分類します。${gas.waterReaction?`水中では ${gas.waterReaction} も考えます。`:""}`,tags:[gas.name,"溶解性"]},
    {id:`gas-${gas.id}-collection`,prompt:`${gas.name}の捕集方法として最も適切なものはどれですか。`,...collection,explanation:`${gas.name}は${gas.collectionMethods.join("、")}で扱います。水への溶解性と空気に対する密度から判断します。`,tags:[gas.name,"捕集法"]},
    {id:`gas-${gas.id}-preparation`,prompt:`${gas.name}の代表的な実験室的製法の反応式はどれですか。`,...equation,explanation:`代表式は ${gas.preparation[0].equation} です。${gas.preparation[0].catalyst?`${gas.preparation[0].catalyst}は触媒です。`:""}`,tags:[gas.name,"製法"]},
    {id:`gas-${gas.id}-detection`,prompt:`${gas.name}の確認・検出として最も適切な説明はどれですか。`,...detection,explanation:`${gas.detectionMethods[0].description}${gas.detectionMethods[0].equation?`（${gas.detectionMethods[0].equation}）`:""}`,tags:[gas.name,"検出"]},
  ];
});

export const gasUnit:ChemistryUnit={
  slug:"laboratory-gases",
  title:"気体の実験室的製法と性質",
  shortTitle:"気体の製法・性質",
  icon:"🫧",
  summary:"14種類の気体を、溶解性・捕集法・製法・検出・反応・安全性まで体系的に比較します。",
  level:"高校化学・大学受験",
  keywords:["気体","実験室的製法","捕集法","水上置換","検出反応","乾燥剤","安全"],
  sections:[
    {id:"gas-study-lab",title:"気体カード・穴埋め・分類演習",description:"14種類を指定順に確認し、カード、穴埋め、ドラッグ分類で反復します。",kind:"gasLab"},
    {id:"gas-overview",title:"14種類の気体・総合一覧",description:"横にスクロールして比較できます。色名は文字とバッジの両方で示します。",kind:"table",columns:["順番","気体・式","水への溶けやすさ","色／におい","空気との密度","捕集方法","代表的製法","主な性質","危険性"],rows:gases.map(gas=>[String(gas.order),`${gas.name} ${gas.formula}`,solubilityLabels[gas.waterSolubility]+(gas.waterReaction?"（水と反応）":""),`${gas.color}／${gas.odor}`,densityLabels[gas.relativeDensity],gas.collectionMethods.join("、"),gas.preparation[0].reagents.join("＋"),gas.properties.join("・"),gas.hazards.join("／")])},
    {id:"gas-solubility",title:"水への溶けやすさ早見表",kind:"table",columns:["4段階分類","該当する気体","水との反応"],rows:(Object.keys(solubilityLabels) as Array<keyof typeof solubilityLabels>).map(key=>[solubilityLabels[key],gases.filter(gas=>gas.waterSolubility===key).map(gas=>gas.formula).join("、"),gases.filter(gas=>gas.waterSolubility===key&&gas.waterReaction).map(gas=>`${gas.formula}: ${gas.waterReaction}`).join("／")||"—"])},
    {id:"gas-collection",title:"捕集方法の判断",kind:"cards",entries:[
      {title:"水上置換法",body:"水に溶けにくく、水と反応しにくい気体に使います。空気が混ざりにくく比較的純粋です。H₂、O₂、N₂、CO、NOが代表。"},
      {title:"上方置換法",body:"水に溶けやすく、空気より軽い気体に使います。代表はNH₃です。"},
      {title:"下方置換法",body:"水に溶ける・水と反応する、または水上置換を避け、空気より重い気体に使います。Cl₂、NO₂、CO₂、SO₂、H₂S、HClが代表。"},
      {title:"特殊な安全設備が必要",body:"O₃とHFは危険性・反応性が高く、通常の生徒実験で大量捕集しません。教員管理下でも専門設備・十分な安全対策が必要です。"},
    ]},
    {id:"gas-preparation-table",title:"全14種類の実験室的製法",kind:"table",columns:["気体","原料・試薬","加熱・条件","触媒","反応式","捕集","精製・乾燥・注意"],rows:gases.map(gas=>[`${gas.name} ${gas.formula}`,gas.preparation.map(item=>item.reagents.join("＋")).join("／"),gas.preparation.map(item=>item.conditions?.join("・")||"不要または指定なし").join("／"),gas.preparation.map(item=>item.catalyst||"—").join("／"),gas.preparation.map(item=>item.equation).join("／"),gas.collectionMethods.join("、"),[gas.dryingAgent?`乾燥：${gas.dryingAgent}`:"",...(gas.preparation.flatMap(item=>item.notes||[])),gas.specialCollectionNote||""].filter(Boolean).join("。")||"—"])},
    {id:"gas-water-reactions",title:"水に溶けた後の反応",kind:"table",columns:["気体","反応式","液性・要点"],rows:gases.filter(gas=>gas.waterReaction).map(gas=>[`${gas.name} ${gas.formula}`,gas.waterReaction!,gas.properties.join("・")])},
    {id:"gas-detection",title:"検出・確認反応",kind:"table",columns:["気体","検出方法","関係する反応式"],rows:gases.map(gas=>[`${gas.name} ${gas.formula}`,gas.detectionMethods.map(item=>item.description).join("／"),gas.detectionMethods.map(item=>item.equation).filter(Boolean).join("／")||"—"])},
    {id:"gas-reactions",title:"代表的な性質と反応式",kind:"cards",entries:gases.map(gas=>({title:`${gas.order}. ${gas.name} ${gas.formula}`,body:gas.properties.join("・"),equation:gas.representativeReactions.map(item=>`${item.title}：${item.equation}`).join("\n"),note:gas.representativeReactions.map(item=>item.description).filter(Boolean).join("／")||undefined}))},
    {id:"gas-safety",title:"安全上の最重要事項",description:"実験を促す手順ではありません。危険な気体は教員管理・ドラフト・適切な保護具を前提とし、生徒が単独で実施しません。",kind:"cards",entries:gases.map(gas=>({title:`${gas.name} ${gas.formula} ⚠`,body:gas.hazards.join("。"),note:gas.specialCollectionNote}))},
  ],
  questions:gasQuestions,
};
