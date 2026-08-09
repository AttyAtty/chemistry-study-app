import { chemistryUnits } from "@/data/chemistry";
import { electrochemistryCards } from "@/data/electrochemistry";
import { getFlashcardsForUnit, type Flashcard } from "@/data/flashcards";
import { gases } from "@/data/gases";
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
const naturalQuestion = (front: string) => {
  const value = front.trim();
  if (/[？?]$/.test(value)) return value.replace(/は[？?]$/, "を答えよ。").replace(/[？?]$/, "。" );
  if (/何ですか。?$/.test(value)) return value.replace(/何ですか。?$/, "何か答えよ。");
  if (/ですか。?$/.test(value)) return value.replace(/ですか。?$/, "か答えよ。");
  if (/答え|書き|示せ|述べよ|何か/.test(value)) return /[。.]$/.test(value) ? value : `${value}。`;
  if (/の(?:化学式|名称|色|捕集法|実験室的製法|確認・検出方法|全体反応式|電子の流れ)$/.test(value)) return `${value}を答えよ。`;
  return undefined;
};

const formulaLike = (value: string) => /^[A-Z[(]|[₀-₉⁰-⁹]|→|⇄/.test(value);
const vagueField = /要点|説明|特徴|重要事項|ポイント|注意|補足|理由/;
const supportedField = /色|物質名|名称|反応式|イオン式|半反応式|化学式|分子式|示性式|触媒|試薬|原料|反応物|条件|温度|圧力|製法|工程|捕集|官能基|配位子|配位数|立体構造|形|酸化数|溶解性|性質|液性|生成物|沈殿|目的物|酸性|中性|塩基性|少量|過剰|^[A-Z][a-z]?$/;
const splitFields = (answer: string) => answer.split("\n").map((line) => {
  const match = line.match(/^([^：]{1,24})：(.+)$/);
  return match ? { label: match[1].trim(), value: match[2].trim() } : undefined;
}).filter((field): field is { label: string; value: string } => Boolean(field));

const fieldKind = (label: string): MemoryQuestionKind => {
  if (/触媒/.test(label) && /条件|温度|圧力/.test(label)) return "condition";
  if (/色|炎色/.test(label)) return "color";
  if (/物質名|名称/.test(label)) return "name";
  if (/反応式|イオン式|半反応式/.test(label)) return "reaction";
  if (/化学式|分子式|示性式/.test(label)) return "formula";
  if (/触媒/.test(label)) return "catalyst";
  if (/試薬|原料|反応物/.test(label)) return "reagent";
  if (/条件|温度|圧力/.test(label)) return "condition";
  if (/製法|工程/.test(label)) return "production";
  if (/性質|溶解性|液性/.test(label)) return "property";
  if (/官能基/.test(label)) return "functional-group";
  return "short";
};

const fieldPrompt = (subject: string, label: string) => {
  if (/酸性|中性|塩基性/.test(label)) return `${subject}が${label.replace(/色$/,"")}で示す色を答えよ。`;
  if (/炎色/.test(label)) return `${subject}の炎色反応の色を答えよ。`;
  if (/沈殿.*色|色/.test(label)) return /↓|→/.test(subject) ? `${subject}で生じる沈殿の色を答えよ。` : `${subject}${/イオン|[⁺⁻]/.test(subject) ? "を含む水溶液" : ""}の色を答えよ。`;
  if (/物質名|名称/.test(label)) return `${subject}の物質名を答えよ。`;
  if (/イオン反応式|正味イオン/.test(label)) return `${subject}で表される反応を、イオン反応式で書け。`;
  if (/反応式|半反応式/.test(label)) return `${subject}の反応を化学反応式で書け。`;
  if (/化学式|分子式|示性式/.test(label)) return `${subject}の${label}を書け。`;
  if (/触媒/.test(label) && /条件|温度|圧力/.test(label)) return `${subject}で用いる触媒と反応条件をそれぞれ答えよ。`;
  if (/触媒/.test(label)) return `${subject}で用いる触媒を答えよ。`;
  if (/加える試薬/.test(label)) return `${subject}に加える試薬を答えよ。`;
  if (/試薬|原料|反応物/.test(label)) return `${subject}で用いる${label}を答えよ。`;
  if (/温度/.test(label)) return `${subject}の反応温度を答えよ。`;
  if (/条件|圧力/.test(label)) return `${subject}の${label}を答えよ。`;
  if (/製法.*名称|製法名/.test(label)) return `${subject}の工業的製法の名称を答えよ。`;
  if (/製法|工程/.test(label)) return `${subject}の${label}を答えよ。`;
  if (/捕集/.test(label)) return `${subject}の捕集方法を答えよ。`;
  if (/官能基/.test(label)) return `${subject}がもつ官能基の名称を答えよ。`;
  if (/配位子/.test(label)) return `${subject}の配位子を答えよ。`;
  if (/配位数/.test(label)) return `${subject}の配位数を答えよ。`;
  if (/立体構造|形/.test(label)) return `${subject}の立体構造を答えよ。`;
  if (/酸化数/.test(label)) return `${subject}中の指定された元素の酸化数を答えよ。`;
  if (/^[A-Z][a-z]?$/.test(label)) return `${subject}中の${label}の酸化数を答えよ。`;
  if (/溶解性/.test(label)) return `${subject}の水への溶解性を答えよ。`;
  if (/性質|液性/.test(label)) return `${subject}の${label}を答えよ。`;
  if (/生成物|沈殿/.test(label)) return `${subject}から生じる${label}を、名称または化学式で答えよ。`;
  if (/NaOH|NH₃/.test(label)) return `${subject}に${label.replace(/・/g,"を")}加えたときに生じる物質を、名称または化学式で答えよ。`;
  if (/目的物/.test(label)) return `${subject}で得られる主な目的物を答えよ。`;
  return undefined;
};

function categoryPrompt(card: Flashcard) {
  const subject = card.front.trim(), category = card.category ?? "";
  if (/水溶液.*色|イオン.*色|沈殿の色|硫化物の色/.test(category)) return `${subject}${/[⁺⁻]|イオン/.test(subject) ? "を含む水溶液" : ""}の色を答えよ。`;
  if (/炎色反応/.test(category)) return `${subject}の炎色反応の色を答えよ。`;
  if (/酸化数/.test(category)) return `${subject}中の各元素の酸化数を、元素記号とともに答えよ。`;
  if (/名称・化学式/.test(category)) return formulaLike(subject) ? `${subject}の物質名を答えよ。` : `${subject}の化学式を書け。`;
  if (/気体の発生法|製法/.test(category)) return `${subject}を生成する化学反応式を書け。`;
  if (/確認|検出/.test(category)) return `${subject}を確認・検出する方法を1つ答えよ。`;
  if (/性質/.test(category)) return `${subject}の代表的な性質を1つ答えよ。`;
  if (/反応式|イオン反応/.test(category) && /→|\+|[⁺⁻]|[A-Z][a-z]?[₀-₉0-9]*/.test(subject)) return `${subject}の反応を化学反応式で書け。`;
  return undefined;
}

function adaptFlashcard(card: Flashcard, category: TestCategory, unitTitle: string): MemoryQuizQuestion[] {
  if (/確認・性質/.test(card.front)) return [];
  const fields = splitFields(card.back).filter((field) => !vagueField.test(field.label) && !/代表例・性質|生成定数|^K$/.test(field.label) && supportedField.test(field.label));
  const base = { category, categoryLabel: categoryLabels[category], sourceUnit: unitTitle };
  if (fields.length) return fields.slice(0, 4).flatMap((field, index) => {
    const prompt = fieldPrompt(card.front, field.label);
    if (!prompt) return [];
    return [{
    ...base,
    id: `flash-${card.id}-field-${index}`,
    knowledgeKey: `flash:${card.id.replace(/-reverse$/, "")}:${field.label}`,
    prompt,
    answer: field.value,
    kind: fieldKind(field.label),
    answerLines: /反応式|条件|性質/.test(field.label) ? 2 : 1,
    answerSlots: /2つ|二つ|2種類/.test(field.label) || (/触媒/.test(field.label) && /条件|温度|圧力/.test(field.label)) ? 2 : 1,
    } satisfies MemoryQuizQuestion];
  });
  const prompt = naturalQuestion(card.front) ?? categoryPrompt(card);
  if (!prompt) return [];
  const kind: MemoryQuestionKind = card.answerType === "color" ? "color" : /反応式/.test(prompt) ? "reaction" : /化学式/.test(prompt) ? "formula" : /物質名/.test(prompt) ? "name" : "short";
  return [{ ...base, id:`flash-${card.id}`, knowledgeKey:`flash:${card.id.replace(/-reverse$/, "")}`, prompt, answer:card.back, note:card.note&&card.note.length<=55?card.note:undefined, kind, answerLines:kind==="reaction"?2:1, answerSlots:1 }];
}

function flashcardCandidates(): MemoryQuizQuestion[] {
  return chemistryUnits.flatMap((unit) => {
    if (unit.slug === "batteries-electrolysis" || unit.slug === "organic-reactions" || unit.slug === "laboratory-gases") return [];
    const category = getTestCategoryForUnit(unit.slug);
    return getFlashcardsForUnit(unit).filter((card) => {
      const text = `${card.front}${card.back}`;
      return !card.id.endsWith("-reverse") && !card.id.includes("-question-") && card.front.length <= 80 && card.back.length <= 90 && !/最も適切|どれですか|組合せ|誤っている/.test(text);
    }).flatMap((card) => adaptFlashcard(card, category, unit.shortTitle));
  });
}

function gasCandidates(): MemoryQuizQuestion[] {
  return gases.flatMap((gas) => {
    const preparation = gas.preparation[0];
    return [
      { id:`memory-gas-${gas.id}-formula`, knowledgeKey:`gas:${gas.id}:formula`, category:"inorganic", categoryLabel:categoryLabels.inorganic, prompt:`${gas.name}の化学式を書け。`, answer:gas.formula, kind:"formula", answerLines:1, answerSlots:1, sourceUnit:"気体" },
      { id:`memory-gas-${gas.id}-collection`, knowledgeKey:`gas:${gas.id}:collection`, category:"inorganic", categoryLabel:categoryLabels.inorganic, prompt:`${gas.name}の適切な捕集方法を答えよ。`, answer:gas.collectionMethods.join("、"), kind:"property", answerLines:1, answerSlots:1, sourceUnit:"気体" },
      { id:`memory-gas-${gas.id}-preparation-reagents`, knowledgeKey:`gas:${gas.id}:preparation-reagents`, category:"inorganic", categoryLabel:categoryLabels.inorganic, prompt:`${gas.name}の実験室的製法で用いる物質を${preparation.reagents.length}つ答えよ。`, answer:preparation.reagents.join("、"), kind:"reagent", answerLines:1, answerSlots:Math.min(3, preparation.reagents.length) as 1|2|3, sourceUnit:"気体" },
      { id:`memory-gas-${gas.id}-preparation-equation`, knowledgeKey:`gas:${gas.id}:preparation-equation`, category:"inorganic", categoryLabel:categoryLabels.inorganic, prompt:`${gas.name}を実験室で発生させる化学反応式を書け。`, answer:preparation.equation, note:preparation.catalyst?`触媒：${preparation.catalyst}`:undefined, kind:"reaction", answerLines:2, answerSlots:1, sourceUnit:"気体" },
      ...(gas.color!=="無色"?[{ id:`memory-gas-${gas.id}-color`, knowledgeKey:`gas:${gas.id}:color`, category:"inorganic" as const, categoryLabel:categoryLabels.inorganic, prompt:`${gas.name}（${gas.formula}）の色を答えよ。`, answer:gas.color, kind:"color" as const, answerLines:1 as const, answerSlots:1 as const, sourceUnit:"気体" }]:[]),
    ] satisfies MemoryQuizQuestion[];
  });
}

function organicCandidates(): MemoryQuizQuestion[] {
  return organicReactions.filter((reaction) => (reaction.importance === "core" || reaction.importance === "industrial") && reaction.step.important !== false && !/副生成物|併産/.test(`${reaction.reactionName}${reaction.conditions.join(" ")}`)).map((reaction) => {
    const conditions = reaction.conditions.length ? reaction.conditions.join("・") : reaction.reactionName;
    return {
      id: `memory-organic-${reaction.id}`,
      knowledgeKey: `organic:${reaction.id}`,
      category: "organic",
      categoryLabel: categoryLabels.organic,
      prompt: `${reaction.source.name}（${reaction.source.formula}）を「${conditions}」の条件で反応させたときの主生成物を、名称または化学式で答えよ。`,
      answer: `${reaction.target.name}（${reaction.target.formula}）`,
      note: reaction.reactionName && reaction.reactionName !== conditions ? `反応：${reaction.reactionName}` : undefined,
      kind: "reaction",
      answerLines: 1,
      sourceUnit: "有機化学",
    } satisfies MemoryQuizQuestion;
  });
}

function electrochemistryCandidates(): MemoryQuizQuestion[] {
  return electrochemistryCards.flatMap((card) => {
    const battery = card.mode === "galvanic-cell";
    if (card.mode === "charging") return [];
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
      kind: "electrode-reaction",
      answerLines: 2,
      sourceUnit: "電池・電気分解",
    } satisfies MemoryQuizQuestion];
  });
}

export function getMemoryQuizCandidates() {
  const candidates = [...flashcardCandidates(), ...gasCandidates(), ...organicCandidates(), ...electrochemistryCandidates()];
  return [...new Map(candidates.map((question) => [question.id, { ...question, answer: normalize(question.answer) }])).values()];
}
