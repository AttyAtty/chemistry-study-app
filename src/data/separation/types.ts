/** Stable IDs and field-level blankability are shared by the viewer and future exercises. */
export type Blankable = { blankable: boolean };
export type Note = { id: string; text: string };
export type Reagent = Blankable & { id: string; label: string; formula?: string; alternatives?: string[] };
export type Condition = Blankable & { id: string; label: string };
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
  };
};
export type SeparationEdge = Blankable & {
  id: string; from: string; to: string; reagent?: Reagent; condition?: Condition; note?: Note;
  labelX: number; labelY: number;
  /** Orthogonal route, authored per separation template; retains the original edge ID. */
  display?: {
    points: [number, number][]; hideLabel?: boolean; condition?: string;
    reagentLines?: string[]; tone?: string;
    conditionPosition?: { x: number; y: number };
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
