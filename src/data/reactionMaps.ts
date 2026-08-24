import { expandedInorganicReactionMaps } from "@/data/inorganicKnowledge";
import { expandedOrganicReactionMaps } from "@/data/organicReactionMaps";

export type ReactionNode = {
  name: string;
  formula: string;
  appearance?: string;
  appearanceColor?: string;
};

/**
 * A presentation-neutral breakdown of the information written above a reaction
 * arrow.  `condition` remains on ReactionStep for the compact graph label; the
 * structured fields are shared by tables, search and generated study content.
 */
export type ReactionConditionDetails = {
  reagents?: string[];
  catalysts?: string[];
  temperature?: string;
  pressure?: string;
  solvents?: string[];
  otherConditions?: string[];
  byproducts?: string[];
};

export type ReactionStep = {
  label: string;
  condition?: string;
  important?: boolean;
  scope?: "core" | "advanced" | "supplement" | "industrial";
  note?: string;
  details?: ReactionConditionDetails;
};

export type ReactionPath = { nodes: ReactionNode[]; steps: ReactionStep[] };

export type ReactionMap = {
  id: string;
  title: string;
  category: "organic" | "inorganic";
  paths: ReactionPath[];
  centerNode?: string;
  zones?: Record<string, "top" | "bottom" | "left" | "right">;
  canvas?: { width: number; height: number };
};

// The expanded data sets are the only source of truth.  The former legacy maps
// duplicated these reactions (and retained obsolete conditions), even though
// they were filtered out at runtime.
export const reactionMaps: ReactionMap[] = [
  ...expandedOrganicReactionMaps,
  ...expandedInorganicReactionMaps,
];
