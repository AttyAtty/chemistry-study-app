import type { ChemistryUnit } from "@/data/chemistry";
import { electrochemistryCards } from "@/data/electrochemistry";
import { densityLabels, gases, solubilityLabels } from "@/data/gases";
import { organicReactions } from "@/data/organicReactionMaps";
import { inorganicKnowledgeFlashcards } from "@/data/inorganicKnowledge";

export type Flashcard = {
  id: string;
  unitId: string;
  category?: string;
  front: string;
  back: string;
  note?: string;
  tags?: string[];
  answerType?: "text" | "color" | "formula" | "equation";
};

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

export function getGasFlashcards(): Flashcard[] {
  return gases.flatMap((gas) => [
    { id: `gas-${gas.id}-formula`, unitId: "laboratory-gases", category: "名称・化学式", front: `${gas.name}の化学式`, back: gas.formula, tags: [gas.name, "化学式"] },
    { id: `gas-${gas.id}-identity`, unitId: "laboratory-gases", category: "名称・化学式", front: gas.formula, back: gas.name, note: `${gas.color}・${gas.odor}`, tags: [gas.name, "双方向"] },
    { id: `gas-${gas.id}-color`, unitId: "laboratory-gases", category: "色", front: `${gas.name}（${gas.formula}）の色は？`, back: gas.color, note: "表面は答えを示さない中立色で表示します。", tags: [gas.name, "色"], answerType: "color" },
    { id: `gas-${gas.id}-collection`, unitId: "laboratory-gases", category: "捕集法", front: `${gas.name}の捕集法`, back: gas.collectionMethods.join("、"), note: `${solubilityLabels[gas.waterSolubility]}／${densityLabels[gas.relativeDensity]}`, tags: [gas.name, "捕集法"] },
    { id: `gas-${gas.id}-preparation`, unitId: "laboratory-gases", category: "製法", front: `${gas.name}の実験室的製法`, back: gas.preparation[0].equation, note: gas.preparation[0].reagents.join(" + "), tags: [gas.name, "反応式"] },
    { id: `gas-${gas.id}-detection`, unitId: "laboratory-gases", category: "検出・性質", front: `${gas.name}の確認・検出方法`, back: gas.detectionMethods[0].description, note: gas.detectionMethods[0].equation, tags: [gas.name, "検出"] },
  ]);
}

export function getElectrochemistryFlashcards(unitId = "batteries-electrolysis"): Flashcard[] {
  return electrochemistryCards.flatMap((card) => {
    const anode = card.electrodes.find((item) => item.electrodeRole === "anode")!;
    const cathode = card.electrodes.find((item) => item.electrodeRole === "cathode")!;
    return [
      { id: `ec-${card.id}-anode`, unitId, category: "電極反応", front: `${card.name}：陽極（酸化）の反応`, back: anode.equation, note: `${anode.label}・${anode.material}`, tags: [card.name, "酸化"] },
      { id: `ec-${card.id}-cathode`, unitId, category: "電極反応", front: `${card.name}：陰極（還元）の反応`, back: cathode.equation, note: `${cathode.label}・${cathode.material}`, tags: [card.name, "還元"] },
      { id: `ec-${card.id}-overall`, unitId, category: "全反応", front: `${card.name}の全体反応式`, back: card.overallEquation, tags: [card.name, "反応式"] },
      { id: `ec-${card.id}-flow`, unitId, category: "電子・変化", front: `${card.name}の電子の流れ`, back: card.electronFlow, note: card.solutionChanges.join("／"), tags: [card.name, "電子"] },
    ];
  });
}

function cardsFromSections(unit: ChemistryUnit): Flashcard[] {
  const result: Flashcard[] = [];
  unit.sections.forEach((section) => {
    if (section.kind === "cards") {
      section.entries.forEach((entry, index) => result.push({
        id: `${unit.slug}-${section.id}-card-${index}`,
        unitId: unit.slug,
        category: section.title,
        front: entry.title,
        back: normalize([entry.body, entry.equation].filter(Boolean).join("\n")),
        note: entry.note,
        tags: unit.keywords,
        answerType: (/色|炎色|呈色/.test(section.title) && /色/.test(entry.body)) ? "color" : "text",
      }));
    }
    if (section.kind === "table") {
      section.rows.forEach((row, index) => {
        if (row.length < 2) return;
        const label = row[0];
        const answer = row.slice(1).map((cell, cellIndex) => `${section.columns[cellIndex + 1] ?? "要点"}：${cell}`).join("\n");
        const asksForColor = section.columns.slice(1).some((column) => /色|炎色/.test(column));
        result.push({ id: `${unit.slug}-${section.id}-row-${index}`, unitId: unit.slug, category: section.title, front: label, back: answer, tags: [section.title], answerType: asksForColor ? "color" : "text" });
        if (row.length === 2 && label.length <= 30 && row[1].length <= 45) {
          result.push({ id: `${unit.slug}-${section.id}-row-${index}-reverse`, unitId: unit.slug, category: section.title, front: row[1], back: label, tags: [section.title, "双方向"] });
        }
      });
    }
    if (section.kind === "flow") {
      section.flows.forEach((flow, index) => result.push({
        id: `${unit.slug}-${section.id}-flow-${index}`,
        unitId: unit.slug,
        category: section.title,
        front: flow.title,
        back: flow.nodes.join(" → "),
        note: flow.note,
        tags: [section.title, "反応"],
      }));
    }
  });
  return result;
}

function cardsFromQuestions(unit: ChemistryUnit, existing: Flashcard[]): Flashcard[] {
  const fronts = new Set(existing.map((card) => card.front));
  return unit.questions
    .filter((question) => !fronts.has(question.prompt))
    .slice(0, Math.max(0, 24 - existing.length))
    .map((question) => ({
      id: `${unit.slug}-question-${question.id}`,
      unitId: unit.slug,
      category: question.tags[0] ?? "重要問題",
      front: question.prompt,
      back: question.choices[question.answerIndex],
      note: question.explanation,
      tags: question.tags,
      answerType: /色|呈色|炎色/.test(question.prompt) ? "color" : "text",
    }));
}

export function getFlashcardsForUnit(unit: ChemistryUnit): Flashcard[] {
  if (unit.slug === "laboratory-gases") return getGasFlashcards();
  if (unit.slug === "batteries-electrolysis") return getElectrochemistryFlashcards(unit.slug);
  const sectionCards = cardsFromSections(unit);
  if (unit.slug === "inorganic-reactions") {
    return [...inorganicKnowledgeFlashcards, ...sectionCards, ...cardsFromQuestions(unit, [...inorganicKnowledgeFlashcards, ...sectionCards])];
  }
  if (unit.slug === "organic-reactions") {
    const reactionCards = organicReactions.filter((reaction) => reaction.importance === "core" || (
      reaction.importance === "industrial" && /クメン|Wacker|SOHIO|重合|Kolbe|Dow|発酵/.test(`${reaction.reactionName}${reaction.conditions.join(" ")}`)
    )).slice(0, 72).map((reaction) => {
      return {
        id: `organic-${reaction.id}`,
        unitId: unit.slug,
        category: reaction.importance === "industrial" ? "工業的反応" : "重要反応",
        front: `${reaction.source.name} → ${reaction.target.name} の反応・条件`,
        back: `${reaction.reactionName}${reaction.conditions.length ? `：${reaction.conditions.join("・")}` : ""}`,
        note: reaction.notes,
        tags: [...reaction.relatedMaps, reaction.importance],
        answerType: "equation" as const,
      };
    });
    return [...reactionCards, ...sectionCards, ...cardsFromQuestions(unit, [...reactionCards, ...sectionCards])];
  }
  return [...sectionCards, ...cardsFromQuestions(unit, sectionCards)];
}
