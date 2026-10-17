/** Stable IDs and field-level blankability are shared by the viewer and future exercises. */
export const blankCategoryLabels = {
  species: "物質", reagent: "試薬", condition: "条件", operation: "操作方法",
  amount: "加え方・程度", action: "操作手順", result: "反応結果",
} as const;
export type BlankCategory = keyof typeof blankCategoryLabels;
export type Blankable = { blankable: boolean; blankCategory?: BlankCategory };
export type DiagramTextPart = Blankable & { id: string; text: string; blankCategory: BlankCategory };
export type Note = { id: string; text: string; blankable?: boolean; blankCategory?: BlankCategory };
export type Reagent = Blankable & { id: string; label: string; formula?: string; alternatives?: string[]; role?: "chemical" | "process" };
export type Condition = Blankable & { id: string; label: string };
export type QualitativeAmount = Blankable & {
  id: string; label: string; kind: "small-portions" | "excess" | "sufficient";
};
export type OperationAction = Blankable & {
  id: string; label: string; practiceSupplement?: boolean; practiceLabel?: string;
};
export type Operation = Blankable & {
  id: string; label: string; amount?: QualitativeAmount; actions: OperationAction[]; notes: Note[];
};
export type InstructionLabel = {
  fieldId: string; kind: "reagent" | "condition" | "operation" | "amount" | "action" | "note";
  text: string; x: number; y: number;
};
export type Layer = { id: string; label: string; kind: "aqueous" | "ether" };
export type AromaticCompound = {
  id: string; name: string; substituent: string; category: string;
  ionic?: boolean;
};
export type SeparationNode = Blankable & {
  id: string; label: string; formula: string; kind: "mixture" | "precipitate" | "solution" | "product";
  lines: string[]; notes: Note[]; color?: string; colorLabel?: string; layerId?: string;
  x: number; y: number; width: number; height: number;
  /** Compact textbook presentation; full chemistry remains in label/formula/notes. */
  display?: {
    label: string; lines: string[]; caption?: string; hidden?: boolean; unboxed?: boolean;
    tone?: string; compounds?: string[]; showCompoundNames?: boolean;
    labelBlankCategory?: BlankCategory; lineBlankCategories?: BlankCategory[];
    lineParts?: DiagramTextPart[][];
  };
};
export type SeparationEdge = Blankable & {
  id: string; from: string; to: string; reagent?: Reagent; condition?: Condition; note?: Note;
  operation?: Operation;
  labelX: number; labelY: number;
  /** Orthogonal route, authored per separation template; retains the original edge ID. */
  display?: {
    points: [number, number][]; hideLabel?: boolean; condition?: string;
    reagentLines?: string[]; tone?: string;
    conditionPosition?: { x: number; y: number };
    /** Short labels reference independently maskable source fields, without moving branches. */
    instructions?: InstructionLabel[];
  };
};
export type Group = { id: string; label: string; nodeIds: string[] };
export type Diagram = {
  id: string; title: string; description: string; width: number; height: number;
  nodes: SeparationNode[]; edges: SeparationEdge[]; groups: Group[]; layers: Layer[]; notes: Note[];
  sources: { title: string; url: string }[];
  compounds?: AromaticCompound[];
  readingHint?: string;
  variant?: "metal-staircase" | "organic-staircase";
};
