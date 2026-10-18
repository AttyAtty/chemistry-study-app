// Server-side adapters: existing lessons remain the source of chemistry facts.
import { chemistryUnits } from "../chemistry";
import { inorganicComplexesUnit } from "../inorganicComplexes";
import { gases } from "../gases";
import { electrochemistryCards, massLabels } from "../electrochemistry";
import { precipitateAnswer, silverChlorideConfirmation } from "../inorganicPrecipitates";
import { ionizationSeries } from "../ionizationSeries";
import type { LearningRow } from "../learningContentIds";
import { field, type AnswerCategory, type AnswerField } from "./types";
import type { InorganicMaterial, InorganicSlug } from "./inorganicTypes";

function tableRow(sectionId:string,rowId:string) {
  const section=inorganicComplexesUnit.sections.find(s=>s.id===sectionId);
  if(section?.kind!=="table")throw new Error(`Missing table ${sectionId}`);
  const row=section.rows.find(r=>(r as LearningRow).learningId===rowId);
  if(!row)throw new Error(`Missing source row ${sectionId}/${rowId}`);
  return row;
}
function card(sectionId:string,id:string) {
  const s=inorganicComplexesUnit.sections.find(s=>s.id===sectionId);
  if(s?.kind!=="cards")throw new Error(sectionId);
  const entry=s.entries.find(e=>e.learningId===id);if(!entry)throw new Error(id);return entry;
}

export function inorganicMaterial(slug:InorganicSlug):InorganicMaterial {
  const fields:AnswerField[]=[];
  const f=(id:string,text:string,category:AnswerCategory)=>{const a=field(`${slug}-${id}`,text,category);fields.push(a);return a;};
  const material:InorganicMaterial={slug,fields,notes:[]};
  if(slug==="ionization") {
    // Missing structured knowledge, authored here once; positions encode rank, not measured spacing.
    material.elements=ionizationSeries.map((s,i)=>f(`rank-${i}`,s,"element"));
    material.bands=[
      {id:"cold",start:0,end:3,answer:f("cold","常温の水と反応してH₂を発生","range"),note:"Li・K・Ca・Na。反応の速さの順とイオン化傾向の順は同じとは限らない。"},
      {id:"hot",start:4,end:4,answer:f("hot","熱水と反応：Mg","range"),note:"Mgは常温の水とはごくゆっくり反応。熱水では水酸化物、水蒸気では酸化物を生じる。"},
      {id:"steam",start:5,end:7,answer:f("steam","高温の水蒸気と反応：Al・Zn・Fe","range"),note:"Mgも水蒸気と反応する。Alでは酸化皮膜の影響を考える。"},
      {id:"acid",start:0,end:10,answer:f("acid","Hより左：希酸からH₂を発生する側","range"),note:"希塩酸・希硫酸が基本。反応速度・皮膜に注意。Li等は水とも反応し、Pbは難溶性塩の皮膜で反応が抑えられる。"},
    ];
    material.notes=["左ほど電子を失って陽イオンになりやすい。間隔は反応性の大きさを数量的に表さない。(H)は比較基準で金属ではない。",...material.bands.map(b=>b.note),"硝酸・熱濃硫酸は酸化性の酸なので、Hより右の金属にも反応するものがあり、通常H₂は発生しない。濃硝酸によるFe・Al等の不動態にも注意。","置換反応の例：Zn + Cu²⁺ → Zn²⁺ + Cu。水溶液でLi・K・Na等を加える場合は水との反応が優先し、この規則だけで金属析出を判断しない。"];
  } else if(slug==="flame-tests") {
    const section=chemistryUnits.flatMap(u=>u.sections).find(s=>s.id==="flame-tests");
    if(section?.kind!=="cards")throw new Error("Missing flame source");
    const names:Record<string,string>={Li:"リチウム",Na:"ナトリウム",K:"カリウム",Cu:"銅",Ca:"カルシウム",Sr:"ストロンチウム",Ba:"バリウム"};
    const paints:Record<string,string>={Li:"#da334d",Na:"#f0bb20",K:"#ab74ce",Cu:"#39a49c",Ca:"#ee7040",Sr:"#bd2450",Ba:"#a0bf35"};
    material.flames=section.entries.map(e=>({id:e.learningId!,element:f(`${e.learningId}-element`,`${e.title} / ${names[e.title]}`,"element"),color:f(`${e.learningId}-color`,e.body,"color"),paint:paints[e.title]}));
    material.notes=["炎は発光色の模式図で、実際の炎の形や明るさを再現するものではない。色名と元素を組にして覚える。",...section.entries.flatMap(e=>e.note?[e.note]:[]),"色名を問う問題では炎も無彩色にする。元素を問う問題では炎の色を手掛かりに答える。"];
  } else if(slug==="precipitates") {
    material.reagents=["Cl⁻","SO₄²⁻","OH⁻（少量）","S²⁻","CO₃²⁻"].map((s,i)=>f(`reagent-${i}`,s,"reagent"));
    const ions=["Ag⁺","Pb²⁺","Cu²⁺","Fe²⁺","Fe³⁺","Al³⁺","Zn²⁺","Ca²⁺","Ba²⁺"];
    material.matrix=ions.map((ion,i)=>({id:`ion-${i}`,ion:f(`ion-${i}`,ion,"species"),cells:material.reagents!.map((_,j)=>({id:`${i}-${j}`,status:"not-covered",source:"本教材では未掲載"}))}));
    const set=(i:number,j:number,text:string,source:string,note?:string)=>{material.matrix![i].cells[j]={id:`${i}-${j}`,status:"precipitate",answer:f(`cell-${i}-${j}`,text,"species"),source,note};};
    // Whole answer phrases come from existing source cells. No formula/color string parsing.
    [[0,"Ag"],[1,"Pb2"],[2,"Cu2"],[4,"Fe3"],[5,"Al3"],[6,"Zn2"]].forEach(([i,id])=>set(Number(i),2,tableRow("sodium-hydroxide-table",String(id))[1],`sodium-hydroxide-table/${id}`));
    set(3,2,precipitateAnswer("feoh2"),"inorganicPrecipitates/feoh2","空気中で酸化され、赤褐色に変わる。");
    [[0,"Ag2S"],[1,"PbS"],[2,"CuS"],[3,"FeS"],[6,"ZnS"]].forEach(([i,id])=>{const r=tableRow("sulfide-colors",String(id));set(Number(i),3,`${r[0]}（${r[1]}）`,`sulfide-colors/${id}`,r[2]);});
    // Existing grouped color rows lack individual records: references identify the source fact.
    set(0,0,precipitateAnswer("agcl"),"inorganicPrecipitates/agcl");set(1,0,precipitateAnswer("pbcl2"),"inorganicPrecipitates/pbcl2","熱水に溶ける。濃度・温度によって沈殿量が変わる。");
    for(const [i,id] of [[1,"pbso4"],[7,"caso4"],[8,"baso4"]] as const)set(i,1,precipitateAnswer(id),`inorganicPrecipitates/${id}`,i===7?"CaSO₄はやや溶け、濃度によっては沈殿しない。":undefined);
    for(const [i,id] of [[7,"Ca2-CO32-CaCO3"],[8,"Ba2-CO32-BaCO3"]] as const){const r=tableRow("chromates-carbonates",id);set(i,4,`${r[0]} / ${r[1]}`,`chromates-carbonates/${id}`);}
    for(let i=2;i<9;i++)material.matrix[i].cells[0]={id:`${i}-0`,status:"none",source:"solubility-rules/規則II-ハロゲン化物"};
    for(const i of [2,3,4,5,6])material.matrix[i].cells[1]={id:`${i}-1`,status:"none",source:"solubility-rules/規則II-硫酸塩"};
    material.matrix[8].cells[2]={id:"8-2",status:"none",source:"Ba(OH)₂は可溶"};
    material.confirmations=[
      {id:"fe-scn",input:f("confirm-fe-input","Fe³⁺","species"),operation:f("confirm-fe-op","SCN⁻を加える","reagent"),result:f("confirm-fe-result",tableRow("other-ligands","SCN-チオシアン酸").slice(1).join(" / "),"species")},
      {id:"cu-nh3",input:f("confirm-cu-input",tableRow("ammonia-reagent-table","Cu2")[0],"species"),operation:f("confirm-cu-op","NH₃水を少量 → 過剰に加える","reagent"),result:f("confirm-cu-result",tableRow("ammonia-reagent-table","Cu2").slice(1).join(" → "),"species")},
      {id:"ag-nh3",input:f("confirm-ag-input","AgCl","species"),operation:f("confirm-ag-op","過剰NH₃水 → HNO₃で酸性にする","reagent"),result:f("confirm-ag-result",silverChlorideConfirmation,"species")},
    ];
    material.notes=["—：通常の希薄水溶液で沈殿しない。未掲載：沈殿しないという意味ではなく、この表で扱わない組合せ。濃度・pH・温度で結果は変わる。","OH⁻は少量添加時。Al・Zn・Pbの水酸化物は過剰NaOHに溶ける。Ag⁺では不安定なAgOHではなくAg₂Oが生じる。","S²⁻欄は硫化物の代表例。FeS・ZnSは中性〜塩基性、Ag₂S・PbS・CuSは酸性でも沈殿。Fe³⁺とH₂Sは酸化還元を伴うため単純な硫化物沈殿として掲載しない。",card("solubility-rules","個別例外").body];
  } else if(slug==="gases") {
    const ids=["hydrogen","oxygen","carbon-dioxide","ammonia","hydrogen-chloride","chlorine","hydrogen-sulfide","sulfur-dioxide"];
    material.gases=ids.map(id=>{const g=gases.find(g=>g.id===id);if(!g)throw new Error(id);const p=g.preparation[0];return {source:g,name:f(`${id}-name`,`${g.name} ${g.formula}`,"species"),collection:f(`${id}-collection`,g.collectionMethods.join(" / "),"collection"),preparation:f(`${id}-preparation`,[p.reagents.join(" + "),p.catalyst?`触媒：${p.catalyst}`:"",p.conditions?.join("・"),p.equation].filter(Boolean).join(" / "),"preparation"),detection:f(`${id}-detection`,g.detectionMethods.map(d=>d.description).join(" / "),"detection"),method:(g.waterSolubility==="insoluble"?"water":g.relativeDensity==="lighter"?"up":"down") as "water"|"up"|"down",heated:p.conditions?.includes("加熱")??false};});
    material.notes=["水上置換は水に溶けにくく、水と反応しにくい気体に適する。溶ける気体では密度を比べる。CO₂は水にも溶けるので下方置換が基本だが、水上置換も可能。","上方置換は空気より軽い気体を逆さの容器に集める。下方置換は重い気体を立てた容器に集める。名称は集める気体の移動方向。","装置は捕集原理の模式図。乾燥・逆流防止・排気吸収などの付帯装置は省略。特に有害な気体は実際の捕集を勧めるものではない。",...material.gases.flatMap(g=>g.source.specialCollectionNote?[g.source.specialCollectionNote]:[])];
  } else {
    material.cells=["daniel","water-electrolysis"].map(id=>{const c=electrochemistryCards.find(c=>c.id===id);if(!c)throw new Error(id);return {source:c,electron:f(`${id}-electron`,c.electronFlow,"electron"),ions:c.ionMovement.map((s,i)=>f(`${id}-ion-${i}`,s,"electron")),electrodes:c.electrodes.map((e,i)=>({label:f(`${id}-${i}-label`,`${e.label} / ${e.material} / ${e.polarity==="negative"?"−":"＋"}`,"electrode"),redox:f(`${id}-${i}-redox`,e.reactionType==="oxidation"?"酸化（電子を放出）":"還元（電子を受容）","redox"),equation:f(`${id}-${i}-equation`,e.equation,"half-reaction"),mass:f(`${id}-${i}-mass`,massLabels[e.massChange],"electrode")}))};});
    material.notes=["酸化は電子を失う反応、還元は電子を受け取る反応。電池でも電気分解でもこの定義は共通。","電池：負極で酸化・正極で還元。電気分解：陽極（＋）で酸化・陰極（−）で還元。電気分解の電極の符号は接続した電源の端子で決まる。",...material.cells.flatMap(c=>c.source.commonMistakes),"水の電気分解は希硫酸と不活性電極の例。電解質・電極を変えると生成物も変わる。"];
  }
  return material;
}

