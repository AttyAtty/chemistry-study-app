import type {
  CardEntry,
  ChemistryUnit,
  QuizQuestion,
  StudySection,
} from "@/data/chemistry";

export type BasicFact = {
  term: string;
  definition: string;
  distractors: string[];
  explanation?: string;
  tags?: string[];
};

export const cards = (
  id: string,
  title: string,
  description: string,
  entries: CardEntry[],
): StudySection => ({ id, title, description, kind: "cards", entries });

export const table = (
  id: string,
  title: string,
  description: string,
  columns: string[],
  rows: string[][],
): StudySection => ({ id, title, description, kind: "table", columns, rows });

function rotate<T>(items: T[], offset: number): T[] {
  if (items.length === 0) return items;
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

export function factQuestions(prefix: string, facts: BasicFact[]): QuizQuestion[] {
  return facts.flatMap((fact, index) => {
    const explanation = fact.explanation ?? `${fact.term}：${fact.definition}`;
    const tags = fact.tags ?? [fact.term];
    const definitionChoices = rotate(
      [fact.definition, ...fact.distractors].slice(0, 4),
      index % 4,
    );
    const otherTerms = Array.from({ length: Math.min(3, facts.length - 1) }, (_, step) =>
      facts[(index + step + 1) % facts.length].term,
    );
    const termChoices = rotate([fact.term, ...otherTerms], (index + 1) % 4);

    return [
      {
        id: `${prefix}-${index}-a`,
        prompt: `「${fact.term}」の説明として最も適切なものはどれですか。`,
        choices: definitionChoices,
        answerIndex: definitionChoices.indexOf(fact.definition),
        explanation,
        tags,
      },
      {
        id: `${prefix}-${index}-b`,
        prompt: `「${fact.definition}」に当てはまる用語・物質はどれですか。`,
        choices: termChoices,
        answerIndex: termChoices.indexOf(fact.term),
        explanation,
        tags,
      },
      {
        id: `${prefix}-${index}-c`,
        prompt: `次の記述は正しいですか。「${fact.term}は、${fact.definition}」`,
        choices: index % 2 === 0 ? ["正しい", "誤り"] : ["誤り", "正しい"],
        answerIndex: index % 2 === 0 ? 0 : 1,
        explanation,
        tags: [...tags, "正誤"],
      },
    ];
  });
}

export function makeBasicUnit(data: {
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  summary: string;
  keywords: string[];
  sections: StudySection[];
  questions: QuizQuestion[];
}): ChemistryUnit {
  return { ...data, level: "化学基礎" };
}
