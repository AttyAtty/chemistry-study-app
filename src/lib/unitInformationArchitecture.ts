import type { ChemistryUnit } from "@/data/chemistry";

export type UnitPageArchitecture = {
  featuredSectionIds: string[];
  quickLinks?: Array<{ label:string; sectionId:string }>;
  featuredLabel?: string;
  detailLabel?: string;
};

const architectures:Record<string,UnitPageArchitecture>={
  "organic-reactions":{featuredSectionIds:["organic-reaction-map-studio","aliphatic-flow","functional-groups"],quickLinks:[{label:"反応系統図",sectionId:"organic-reaction-map-studio"},{label:"重要反応",sectionId:"aliphatic-flow"}],featuredLabel:"反応をつなげて理解する",detailLabel:"全反応・物質詳細"},
  "inorganic-reactions":{featuredSectionIds:["gas-generation","redox-patterns","inorganic-reaction-map-studio"],quickLinks:[{label:"気体発生",sectionId:"gas-generation"},{label:"酸化還元",sectionId:"redox-patterns"},{label:"反応系統図",sectionId:"inorganic-reaction-map-studio"}],featuredLabel:"問題で使う頻出知識",detailLabel:"元素別・全反応一覧"},
  "theory-chemistry":{featuredSectionIds:["mass-percent","solubility","equilibrium-examples","equilibrium"],quickLinks:[{label:"公式・定義",sectionId:"mass-percent"},{label:"溶解度",sectionId:"solubility"},{label:"平衡の代表例",sectionId:"equilibrium-examples"}],featuredLabel:"公式・考え方・代表例",detailLabel:"コロイド・界面活性剤・発展"},
  "batteries-electrolysis":{featuredSectionIds:["electrode-signs","battery-table","primary-batteries","electrolysis-pattern-table","electrolysis-workbench"],quickLinks:[{label:"電極の原理",sectionId:"electrode-signs"},{label:"電池比較",sectionId:"battery-table"},{label:"電気分解の生成物",sectionId:"electrolysis-pattern-table"}],featuredLabel:"電極で何が起こるか",detailLabel:"シミュレーター・計算・全電池"},
  "colors-and-tests":{featuredSectionIds:["solution-colors","precipitate-colors","complex-ion-reactions"],quickLinks:[{label:"イオンの色",sectionId:"solution-colors"},{label:"沈殿の色",sectionId:"precipitate-colors"}],featuredLabel:"色・沈殿の早見",detailLabel:"確認反応・系統分離・炎色反応"},
  "laboratory-gases":{featuredSectionIds:["gas-overview","gas-collection","gas-preparation-table","gas-detection"],quickLinks:[{label:"気体比較",sectionId:"gas-overview"},{label:"捕集方法",sectionId:"gas-collection"},{label:"製法",sectionId:"gas-preparation-table"}],featuredLabel:"比較・捕集・製法",detailLabel:"演習・反応・安全情報"},
  "industrial-processes":{featuredSectionIds:["industrial-table","industrial-flows"],quickLinks:[{label:"製法一覧",sectionId:"industrial-table"},{label:"工程の流れ",sectionId:"industrial-flows"}],featuredLabel:"主要製法を比較する",detailLabel:"工業反応の完全一覧"},
  "ionic-equations":{featuredSectionIds:["redox-product-prediction","redox-ionic","ionic-patterns","how-to-write"],quickLinks:[{label:"生成物予測",sectionId:"redox-product-prediction"},{label:"半反応式",sectionId:"redox-ionic"},{label:"頻出イオン式",sectionId:"ionic-patterns"}],featuredLabel:"生成物から反応式へ",detailLabel:"補足・詳細"},
  "complex-ions-qualitative-analysis":{featuredSectionIds:["insoluble-solid-colors","ammine-complexes","ammonia-reagent-table","sodium-hydroxide-table","sulfide-separation"],quickLinks:[{label:"沈殿早見",sectionId:"insoluble-solid-colors"},{label:"錯イオン",sectionId:"ammine-complexes"},{label:"系統分析",sectionId:"sulfide-separation"}],featuredLabel:"沈殿・錯イオン・試薬反応",detailLabel:"全錯イオン・溶解度・発展"},
};

const basicArchitecture:UnitPageArchitecture={featuredSectionIds:[],featuredLabel:"基本事項から例へ",detailLabel:"詳しい解説"};

export function getUnitPageArchitecture(unit:ChemistryUnit):UnitPageArchitecture{
  const configured=architectures[unit.slug]??(unit.slug.startsWith("chemistry-basic-")?basicArchitecture:undefined);
  if(!configured)return{featuredSectionIds:unit.sections.slice(0,Math.min(3,unit.sections.length)).map(section=>section.id),featuredLabel:"まず確認する",detailLabel:"すべての教材"};
  if(configured.featuredSectionIds.length)return configured;
  return{...configured,featuredSectionIds:unit.sections.slice(0,Math.min(2,unit.sections.length)).map(section=>section.id)};
}
