/** Stable IDs and field-level blankability are shared by the viewer and future exercises. */
export type Blankable = { blankable: boolean };
export type Note = { id: string; text: string };
export type Reagent = Blankable & { id: string; label: string; formula?: string };
export type Condition = Blankable & { id: string; label: string };
export type Layer = { id: string; label: string; kind: "aqueous" | "ether" };
export type SeparationNode = Blankable & {
  id: string; label: string; formula: string; kind: "mixture" | "precipitate" | "solution" | "product";
  lines: string[]; notes: Note[]; color?: string; colorLabel?: string; layerId?: string;
  x: number; y: number; width: number; height: number;
};
export type SeparationEdge = Blankable & {
  id: string; from: string; to: string; reagent?: Reagent; condition?: Condition; note?: Note;
  labelX: number; labelY: number;
};
export type Group = { id: string; label: string; nodeIds: string[] };
export type Diagram = {
  id: string; title: string; description: string; width: number; height: number;
  nodes: SeparationNode[]; edges: SeparationEdge[]; groups: Group[]; layers: Layer[]; notes: Note[];
  sources: { title: string; url: string }[];
};
