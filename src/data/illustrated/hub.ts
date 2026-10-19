import { theoryLessons } from "./theory";
import { inorganicLessons } from "./inorganicTypes";
import { illustratedLessons } from "./types";
import { metalAnalysis, aromaticSeparation } from "../separation/diagrams";

export type DiagramCategory = "theory" | "inorganic" | "organic" | "experiment" | "reaction-map";
export const diagramCategoryLabels: Record<DiagramCategory, string> = {
  theory: "理論", inorganic: "無機", organic: "有機", experiment: "実験・操作", "reaction-map": "反応マップ",
};
export type DiagramHubEntry = {
  id: string; title: string; description: string; href: string;
  categories: DiagramCategory[]; primary: DiagramCategory; searchTerms?: string[];
};

const searchTerms: Record<string, string[]> = {
  "solubility": ["溶解度", "再結晶", "飽和", "過飽和"], "vapor-pressure": ["蒸気圧", "飽和蒸気圧", "沸騰", "沸点"],
  "henry": ["ヘンリーの法則", "炭酸飲料"], "acid-base": ["酸", "塩基", "pH"], "titration": ["中和滴定", "当量点"],
  "indicators": ["指示薬", "変色域"], "buffers": ["緩衝液", "緩衝作用"], "equilibrium": ["化学平衡", "ルシャトリエ"],
  "kinetics": ["反応速度", "活性化エネルギー", "触媒"], "thermochemistry": ["熱化学", "エンタルピー", "ヘスの法則"],
  "ionization": ["イオン化傾向"], "flame-tests": ["炎色反応"], "precipitates": ["沈殿", "確認反応"],
  "gases": ["気体", "捕集法", "気体の製法"], "electrochemistry": ["電池", "電気分解", "電極反応"],
  "polymers": ["高分子", "合成樹脂", "重合"], "carbohydrates": ["糖", "糖類", "グルコース"],
  "metal-analysis": ["金属イオン", "系統分析"], "aromatic-separation": ["芳香族", "系統分離", "酸塩基抽出"],
};
const termsFor = (href: string) => searchTerms[href.split("/").at(-1) ?? ""] ?? [];

const theoryEntries: DiagramHubEntry[] = theoryLessons.map((lesson) => ({
  id: `theory-${lesson.slug}`, title: lesson.title, description: lesson.description,
  href: `/illustrated/${lesson.slug}`, categories: ["theory"], primary: "theory",
}));
const inorganicEntries: DiagramHubEntry[] = inorganicLessons.map((lesson) => ({
  id: `inorganic-${lesson.slug}`, title: lesson.title, description: lesson.description,
  href: `/illustrated/${lesson.slug}`,
  categories: lesson.slug === "gases" ? ["inorganic", "experiment"] : ["inorganic"], primary: "inorganic",
}));
const organicEntries: DiagramHubEntry[] = illustratedLessons.map((lesson) => ({
  id: `organic-${lesson.slug}`, title: lesson.title, description: lesson.description,
  href: `/illustrated/${lesson.slug}`,
  categories: lesson.slug === "polymers" ? ["organic", "reaction-map"] : ["organic"], primary: "organic",
}));

const baseEntries: DiagramHubEntry[] = [
  ...theoryEntries, ...inorganicEntries, ...organicEntries,
  { id: "operation-metal-analysis", title: metalAnalysis.title, description: metalAnalysis.description,
    href: "/separation/metal-analysis", categories: ["inorganic", "experiment"], primary: "inorganic" },
  { id: "operation-aromatic-separation", title: aromaticSeparation.title, description: aromaticSeparation.description,
    href: "/separation/aromatic-separation", categories: ["organic", "experiment"], primary: "experiment" },
];
export const diagramHubEntries: DiagramHubEntry[] = baseEntries.map((entry) => ({ ...entry, searchTerms: termsFor(entry.href) }));
