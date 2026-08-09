import type { TestCategory } from "@/lib/quizSelection";

export type MemoryQuestionKind = "short" | "formula" | "equation" | "color";

export type MemoryQuizQuestion = {
  id: string;
  knowledgeKey: string;
  category: TestCategory;
  categoryLabel: string;
  prompt: string;
  answer: string;
  note?: string;
  kind: MemoryQuestionKind;
  answerLines: 1 | 2;
  sourceUnit: string;
};

export const MEMORY_QUIZ_CATEGORY_WEIGHTS: Record<TestCategory, number> = {
  theory: 2,
  inorganic: 3,
  organic: 3,
  other: 2,
};

const hashSeed = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T,>(items: T[], random: () => number) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
};

export function selectMemoryQuizQuestions(pool: MemoryQuizQuestion[], count = 10, seed = 1) {
  const random = hashSeed(seed);
  const unique = [...new Map(pool.map((question) => [question.knowledgeKey, question])).values()];
  const target = Math.min(count, unique.length);
  const categories = Object.keys(MEMORY_QUIZ_CATEGORY_WEIGHTS) as TestCategory[];
  const totalWeight = Object.values(MEMORY_QUIZ_CATEGORY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const groups = Object.fromEntries(categories.map((category) => [category, shuffle(unique.filter((item) => item.category === category), random)])) as Record<TestCategory, MemoryQuizQuestion[]>;
  const quotas = Object.fromEntries(categories.map((category) => [category, Math.floor(target * MEMORY_QUIZ_CATEGORY_WEIGHTS[category] / totalWeight)])) as Record<TestCategory, number>;
  let assigned = Object.values(quotas).reduce((sum, value) => sum + value, 0);
  for (const category of [...categories].sort((a, b) => MEMORY_QUIZ_CATEGORY_WEIGHTS[b] - MEMORY_QUIZ_CATEGORY_WEIGHTS[a])) {
    if (assigned >= target) break;
    quotas[category]++;
    assigned++;
  }
  const selected = categories.flatMap((category) => groups[category].splice(0, Math.min(quotas[category], groups[category].length)));
  const remainder = shuffle(categories.flatMap((category) => groups[category]), random).slice(0, target - selected.length);
  return shuffle([...selected, ...remainder], random);
}
