import { chemistryUnits } from "@/data/chemistry";
import { electrochemistryCards } from "@/data/electrochemistry";
import { getFlashcardsForUnit, type Flashcard } from "@/data/flashcards";
import { organicReactions } from "@/data/organicReactionMaps";
import { getBatteryCompositionRows, describeElectrolyte } from "@/lib/electrochemistryPrint";
import type { MemoryQuizQuestion, MemoryQuestionKind } from "@/lib/memoryQuiz";
import { getTestCategoryForUnit, type TestCategory } from "@/lib/quizSelection";

const categoryLabels: Record<TestCategory, string> = {
  theory: "化学基礎・理論",
  inorganic: "無機化学",
  organic: "有機化学",
  other: "電池・工業・その他",
};

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
const naturalPrompt = (front: string, category?: string) => {
  const value = front.trim();
  if (/[？?]$/.test(value)) return value.replace(/は[？?]$/, "を答えよ。").replace(/[？?]$/, "。" );
  if (/何ですか。?$/.test(value)) return value.replace(/何ですか。?$/, "何か答えよ。");
  if (/ですか。?$/.test(value)) return value.replace(/ですか。?$/, "か答えよ。");
  if (/答え|書き|示せ|述べよ|何か/.test(value)) return /[。.]$/.test(value) ? value : `${value}。`;
  if (/の(?:化学式|名称|色|捕集法|実験室的製法|確認・検出方法|全体反応式|電子の流れ)$/.test(value)) return `${value}を答えよ。`;
  return `「${value}」について、${category ? `「${category}」に関する` : "教材に示された"}要点を答えよ。`;
};

const kindFromCard = (card: Flashcard): MemoryQuestionKind => card.answerType === "color" ? "color" : card.answerType === "equation" ? "equation" : /反応式|化学式/.test(`${card.front}${card.category}`) ? "formula" : "short";

function flashcardCandidates(): MemoryQuizQuestion[] {
  return chemistryUnits.flatMap((unit) => {
    if (unit.slug === "batteries-electrolysis" || unit.slug === "organic-reactions") return [];
    const category = getTestCategoryForUnit(unit.slug);
    return getFlashcardsForUnit(unit).filter((card) => {
      const text = `${card.front}${card.back}`;
      return card.front.length <= 80 && card.back.length <= 90 && !/最も適切|どれですか|組合せ|誤っている/.test(text);
    }).map((card) => ({
      id: `flash-${card.id}`,
      knowledgeKey: `flash:${card.id.replace(/-reverse$/, "")}`,
      category,
      categoryLabel: categoryLabels[category],
      prompt: naturalPrompt(card.front, card.category),
      answer: card.back,
      note: card.note && card.note.length <= 55 ? card.note : undefined,
      kind: kindFromCard(card),
      answerLines: /反応式|製法|変化/.test(`${card.front}${card.category}`) || card.back.includes("\n") ? 2 : 1,
      sourceUnit: unit.shortTitle,
    } satisfies MemoryQuizQuestion));
  });
}

function organicCandidates(): MemoryQuizQuestion[] {
  return organicReactions.filter((reaction) => reaction.importance === "core" || reaction.importance === "industrial").map((reaction) => {
    const conditions = reaction.conditions.length ? reaction.conditions.join("・") : reaction.reactionName;
    return {
      id: `memory-organic-${reaction.id}`,
      knowledgeKey: `organic:${reaction.id}`,
      category: "organic",
      categoryLabel: categoryLabels.organic,
      prompt: `${reaction.source.name}（${reaction.source.formula}）を「${conditions}」の条件で反応させたときの主生成物を、名称または化学式で答えよ。`,
      answer: `${reaction.target.name}（${reaction.target.formula}）`,
      note: reaction.reactionName && reaction.reactionName !== conditions ? `反応：${reaction.reactionName}` : undefined,
      kind: "short",
      answerLines: 1,
      sourceUnit: "有機化学",
    } satisfies MemoryQuizQuestion;
  });
}

function electrochemistryCandidates(): MemoryQuizQuestion[] {
  return electrochemistryCards.flatMap((card) => {
    const battery = card.mode === "galvanic-cell" || card.mode === "charging";
    const target = battery
      ? card.electrodes.find((electrode) => electrode.polarity === "negative")!
      : card.electrodes.find((electrode) => electrode.electrodeRole === "cathode")!;
    const context = battery
      ? getBatteryCompositionRows(card).map((row) => `${row.label}：${row.value}`).join("\n")
      : `電解質：${card.electrolytes.map(describeElectrolyte).join("／")}\n電極：${card.electrodes.map((electrode) => `${electrode.label} ${electrode.material}`).join("／")}`;
    return [{
      id: `memory-electrochemistry-${card.id}`,
      knowledgeKey: `electrochemistry:${card.id}:${battery ? "negative" : "cathode"}`,
      category: "other",
      categoryLabel: categoryLabels.other,
      prompt: `${card.name}について、次の構成をもとに${battery ? "放電時の負極" : "陰極"}反応式を答えよ。\n${context}`,
      answer: target.equation,
      note: `${target.reactionType === "oxidation" ? "酸化" : "還元"}反応`,
      kind: "equation",
      answerLines: 2,
      sourceUnit: "電池・電気分解",
    } satisfies MemoryQuizQuestion];
  });
}

export function getMemoryQuizCandidates() {
  const candidates = [...flashcardCandidates(), ...organicCandidates(), ...electrochemistryCandidates()];
  return [...new Map(candidates.map((question) => [question.id, { ...question, answer: normalize(question.answer) }])).values()];
}
