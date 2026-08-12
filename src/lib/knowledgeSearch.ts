import { chemistryUnits, type StudySection } from "@/data/chemistry";
import { chemistryBasicFormulas, chemistryBasicGlossary } from "@/data/chemistry-basic";
import { electrochemistryCards } from "@/data/electrochemistry";
import { gases } from "@/data/gases";
import { organicCompounds, organicReactions } from "@/data/organicReactionMaps";
import { inorganicReactions, inorganicSubstances } from "@/data/inorganicKnowledge";

export type SearchItemType = "unit" | "ion" | "compound" | "inorganic" | "reaction" | "precipitate" | "complex" | "gas" | "battery" | "industrial" | "basic";
export type SearchItem = {
  id:string; type:SearchItemType; title:string; formula?:string; aliases?:string[]; keywords?:string[];
  description?:string; category?:string; unitId?:string; href:string; relatedIds?:string[];
};

const superscriptMap:Record<string,string>={"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁺":"+","⁻":"-","₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9"};
export function normalizeChemicalSearchText(value:string){
  return value.normalize("NFKC").split("").map(char=>superscriptMap[char]??char).join("").toLowerCase().replace(/[\s　^・･]/g,"").replace(/[‐‑‒–—−]/g,"-");
}

const sectionType=(title:string):SearchItemType=>/錯イオン/.test(title)?"complex":/沈殿/.test(title)?"precipitate":/イオン/.test(title)?"ion":/工業|製法/.test(title)?"industrial":"basic";
const compact=(value:string|undefined,max=110)=>value&&value.length>max?`${value.slice(0,max)}…`:value;
const looksFormula=(value:string)=>/[A-Z][a-z]?\d|[⁺⁻+−-]|\[[A-Z]/.test(value);

function sectionItems(unitId:string,section:StudySection):SearchItem[]{
  const base=`/units/${unitId}#${section.id}`,type=sectionType(section.title);
  if(section.kind==="cards") return section.entries.map((entry,index)=>({id:`knowledge-${unitId}-${section.id}-${index}`,type,title:entry.title,formula:entry.equation,description:compact(entry.body),category:section.title,unitId,href:`${base}-item-${index}`,keywords:[entry.body,entry.note??""]}));
  if(section.kind==="table") return section.rows.map((row,index)=>({id:`knowledge-${unitId}-${section.id}-${index}`,type,title:row[0],formula:looksFormula(row[0])?row[0]:undefined,description:compact(row.slice(1).map((cell,i)=>`${section.columns[i+1]??"要点"}：${cell}`).join(" / ")),category:section.title,unitId,href:`${base}-row-${index}`,keywords:row.slice(1)}));
  if(section.kind==="flow") return section.flows.map((flow,index)=>({id:`knowledge-${unitId}-${section.id}-${index}`,type,title:flow.title,description:compact(flow.nodes.join(" → ")),category:section.title,unitId,href:`${base}-flow-${index}`,keywords:[flow.note??"",...flow.nodes]}));
  return [];
}

const explicitRelations:Record<string,string[]>={
  "Cu²⁺":["Cu(OH)₂","[Cu(NH₃)₄]²⁺","ダニエル電池","定性分析"],
  "NH₃":["NH₄⁺","[Cu(NH₃)₄]²⁺","ハーバー・ボッシュ法","錯イオン"],
  "Fe³⁺":["Fe(OH)₃","SCN⁻","定性分析"],
  "CaCO₃":["CaO","Ca(OH)₂","Ca(HCO₃)₂"],
  "CaC₂":["アセチレン","Ca(OH)₂"],
  "Fe²⁺":["Fe(OH)₂","[Fe(CN)₆]³⁻","鉄(III)イオン"],
  "NO₂":["N₂O₄","HNO₃","一酸化窒素"],
  "NaCl":["イオン交換膜法","NaOH","Cl₂"],
  "NaHCO₃":["アンモニアソーダ法","Na₂CO₃"],
  "P₄":["P₄O₁₀","赤リン"],
  "SiO₂":["Na₂SiO₃","水ガラス","シリカゲル"],
  "SO₂":["SO₃","H₂SO₄","接触法"],
  "Ag⁺":["AgCl","[Ag(NH₃)₂]⁺","定性分析"],
  "ベンゼン":["ニトロベンゼン","アニリン","フェノール","トルエン"],
  "エタノール":["アセトアルデヒド","酢酸","エチレン","酢酸エチル"],
};

function buildBaseIndex():SearchItem[]{
  const units:SearchItem[]=chemistryUnits.map(unit=>({id:`unit-${unit.slug}`,type:"unit",title:unit.title,description:unit.summary,keywords:unit.keywords,unitId:unit.slug,href:`/units/${unit.slug}`}));
  const knowledge=chemistryUnits.filter(unit=>unit.slug!=="organic-reactions").flatMap(unit=>unit.sections.filter(section=>!section.id.startsWith("inorganic-")).flatMap(section=>sectionItems(unit.slug,section)));
  const compounds:SearchItem[]=organicCompounds.map(compound=>{const reactions=organicReactions.filter(reaction=>reaction.sourceId===compound.id||reaction.targetId===compound.id),neighborIds=reactions.map(reaction=>reaction.sourceId===compound.id?reaction.targetId:reaction.sourceId);return{id:`compound-${compound.id}`,type:"compound",title:compound.nameJa,formula:compound.formula,aliases:[compound.nameEn??"",...compound.aliases].filter(Boolean),keywords:compound.classifications,description:[compound.classifications.join("・"),compound.appearance].filter(Boolean).join(" / "),category:"有機化合物",unitId:"organic-reactions",href:`/units/organic-reactions#organic-reaction-map-studio`,relatedIds:[...new Set([...neighborIds.map(id=>`compound-${id}`),...compound.relatedReactionIds.map(id=>`reaction-${id}`)])]};});
  const reactions:SearchItem[]=organicReactions.map(reaction=>({id:`reaction-${reaction.id}`,type:reaction.importance==="industrial"?"industrial":"reaction",title:reaction.reactionName||`${reaction.source.name} → ${reaction.target.name}`,formula:`${reaction.source.formula} → ${reaction.target.formula}`,description:compact([reaction.reagents.join("・"),reaction.catalysts.join("・"),reaction.conditions.join("・"),reaction.observation].filter(Boolean).join(" / ")),keywords:[reaction.reactionType,...reaction.additionalReactants,...reaction.byproducts],category:reaction.importance==="industrial"?"工業的反応":"有機反応",unitId:"organic-reactions",href:`/units/organic-reactions#organic-reaction-map-studio`,relatedIds:[`compound-${reaction.sourceId}`,`compound-${reaction.targetId}`]}));
  const inorganicItems:SearchItem[]=inorganicSubstances.map(item=>({id:`inorganic-${item.id}`,type:/イオン/.test(item.name)?"ion":"inorganic",title:item.name,formula:item.formula,aliases:item.aliases,keywords:[item.element,item.importance,...(item.properties??[])],description:[...(item.aliases??[]),...(item.properties??[])].join(" / "),category:`無機化学・${item.element}`,unitId:"inorganic-reactions",href:`/units/inorganic-reactions#inorganic-${item.element.toLowerCase()}-knowledge`,relatedIds:(item.relatedIds??[]).map(id=>id.startsWith("organic-")?`compound-${id.replace("organic-","")}`:`inorganic-${id}`)}));
  const inorganicReactionItems:SearchItem[]=inorganicReactions.map(item=>({id:`inorganic-reaction-${item.id}`,type:item.processName?"industrial":"reaction",title:item.processName??`${item.reactants.join(" + ")} → ${item.products.join(" + ")}`,formula:item.equation,description:compact([...(item.conditions??[]),item.catalyst?`触媒：${item.catalyst}`:"",item.description??""].filter(Boolean).join(" / ")),keywords:[item.element,...item.reactants,...item.products,...(item.byproducts??[])],category:item.processName?"工業的製法・定性分析":"無機反応",unitId:"inorganic-reactions",href:"/units/inorganic-reactions#inorganic-reaction-map-studio",relatedIds:[...item.reactants,...item.products].map(term=>inorganicSubstances.find(s=>s.formula===term||s.name===term)).filter((s):s is NonNullable<typeof s>=>Boolean(s)).map(s=>`inorganic-${s.id}`)}));
  const gasItems:SearchItem[]=gases.map(gas=>({id:`gas-${gas.id}`,type:"gas",title:gas.name,formula:gas.formula,description:`${gas.color}・${gas.odor} / ${gas.collectionMethods.join("・")}`,keywords:[gas.waterReaction??"",...gas.properties,...gas.preparation.flatMap(item=>[item.equation,...item.reagents])],category:"気体",unitId:"laboratory-gases",href:"/units/laboratory-gases#gas-study-lab"}));
  const batteries:SearchItem[]=electrochemistryCards.map(card=>({id:`battery-${card.id}`,type:"battery",title:card.name,formula:card.overallEquation,description:compact(`${card.electrolytes.join("・")} / ${card.electronFlow}`),keywords:[...card.keyPoints,...card.electrodes.flatMap(e=>[e.material,e.equation])],category:"電池・電気分解",unitId:"batteries-electrolysis",href:"/units/batteries-electrolysis#electrochemistry-lab"}));
  const glossary:SearchItem[]=chemistryBasicGlossary.map((entry,index)=>({id:`basic-glossary-${index}`,type:"basic",title:entry.term,description:entry.definition,category:entry.category,href:"/courses/chemistry-basic",keywords:[entry.category]}));
  const formulas:SearchItem[]=chemistryBasicFormulas.map((entry,index)=>({id:`basic-formula-${index}`,type:"basic",title:entry.title,formula:entry.formula,description:entry.meaning,category:"化学基礎・公式",href:"/courses/chemistry-basic",keywords:[entry.condition??""]}));
  return [...units,...compounds,...reactions,...inorganicItems,...inorganicReactionItems,...gasItems,...batteries,...glossary,...formulas,...knowledge];
}

const searchable=(item:SearchItem)=>[item.title,item.formula,...(item.aliases??[])].filter((value):value is string=>Boolean(value)).map(normalizeChemicalSearchText);
const findExact=(items:SearchItem[],term:string)=>{const normalized=normalizeChemicalSearchText(term);return items.find(item=>searchable(item).includes(normalized));};

export function createSearchIndex(){
  const raw=buildBaseIndex(),seen=new Set<string>();
  const deduped=raw.filter(item=>{const key=`${item.type}:${normalizeChemicalSearchText(item.formula||item.title)}`;if(seen.has(key))return false;seen.add(key);return true;});
  for(const item of deduped){
    const explicit:string[]=[],automatic=new Set(item.relatedIds??[]);
    if(item.unitId) automatic.add(`unit-${item.unitId}`);
    for(const [source,targets] of Object.entries(explicitRelations)) if(searchable(item).includes(normalizeChemicalSearchText(source))) for(const target of targets){const match=findExact(deduped,target);if(match)explicit.push(match.id);}
    item.relatedIds=[...new Set([...explicit,...automatic])].filter(id=>id!==item.id);
  }
  return deduped;
}

export const searchIndex=createSearchIndex();
export function searchKnowledge(query:string,limit=60){
  const needle=normalizeChemicalSearchText(query);if(!needle)return [];
  const score=(item:SearchItem)=>{const primary=normalizeChemicalSearchText(item.title),formula=normalizeChemicalSearchText(item.formula??""),aliases=(item.aliases??[]).map(normalizeChemicalSearchText),keywords=(item.keywords??[]).map(normalizeChemicalSearchText),description=normalizeChemicalSearchText(item.description??"");if(formula===needle)return 1000;if(primary===needle)return 980;if(aliases.includes(needle))return 950;if(formula.startsWith(needle))return 850;if(primary.startsWith(needle))return 820;if(aliases.some(value=>value.startsWith(needle)))return 780;if(formula.includes(needle)||primary.includes(needle))return 650;if(aliases.some(value=>value.includes(needle)))return 600;if(keywords.some(value=>value.includes(needle)))return 420;if(description.includes(needle))return 250;return 0;};
  return searchIndex.map(item=>({item,score:score(item)})).filter(result=>result.score>0).sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title,"ja")).slice(0,limit).map(result=>result.item);
}
export function getRelatedKnowledge(item:SearchItem,limit=8){const byId=new Map(searchIndex.map(candidate=>[candidate.id,candidate])),explicit:string[]=[];for(const [source,targets] of Object.entries(explicitRelations))if(searchable(item).includes(normalizeChemicalSearchText(source)))for(const target of targets){const match=findExact(searchIndex,target);if(match)explicit.push(match.id);}return [...new Set([...explicit,...(item.relatedIds??[])])].map(id=>byId.get(id)).filter((candidate):candidate is SearchItem=>candidate!==undefined&&candidate.id!==item.id).slice(0,limit);}
export const searchTypeLabels:Record<SearchItemType,string>={unit:"単元",ion:"イオン",compound:"有機化合物",inorganic:"無機物質",reaction:"反応",precipitate:"沈殿",complex:"錯イオン",gas:"気体",battery:"電池・電気分解",industrial:"工業的反応",basic:"重要事項"};
