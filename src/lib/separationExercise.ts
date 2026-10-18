import type { BlankCategory, Diagram } from "../data/separation/types";

export const exerciseModes = {
  all: "全体穴埋め", species: "物質穴埋め", procedure: "試薬・操作穴埋め", random: "ランダム穴埋め",
} as const;
export type ExerciseMode = keyof typeof exerciseModes;
export type StructurePolicy = "hint" | "hide";
export type BlankTarget = {
  id: string; blankCategory: BlankCategory; answer: string; location: "diagram" | "supplement";
  nodeId?: string; edgeId?: string;
  sourceIds?: string[];
};
export type ExerciseOptions = {
  mode: ExerciseMode; seed: string; rate: number; structurePolicy: StructurePolicy;
};
export type SeparationExercise = ExerciseOptions & {
  schemaVersion: 1; generatorVersion: 2; diagramId: string; targets: BlankTarget[]; blankIds: string[];
};

/** This registry uses typed source fields and presentation metadata, never chemical-name matching. */
export function collectBlankTargets(diagram: Diagram): BlankTarget[] {
  const targets = new Map<string, BlankTarget>();
  const add = (target: BlankTarget) => { if (!targets.has(target.id)) targets.set(target.id, target); };
  for (const node of diagram.nodes) {
    if (!node.blankable || node.kind === "mixture" || node.display?.hidden) continue;
    const view = node.display;
    if (view?.compounds) {
      const layer=diagram.layers.find(layer=>layer.id===node.layerId);
      if(layer) add({id:`${node.id}:layer`,nodeId:node.id,blankCategory:"result",answer:layer.kind==="aqueous" ? "水層" : "エーテル層",location:"diagram"});
      for (const compoundId of view.compounds) {
        const compound = diagram.compounds?.find(c => c.id === compoundId);
        if (compound) add({ id: `${node.id}:compound:${compoundId}`, nodeId: node.id,
          blankCategory: node.blankCategory ?? "species", answer: compound.name, location: "diagram" });
      }
    } else {
      const title = view?.label ?? node.label;
      if (title) add({ id: `${node.id}:label`, nodeId: node.id, blankCategory: view?.headingParts ? "species" : view?.labelBlankCategory ?? "result", answer: view?.headingParts?.answer ?? title, location: "diagram" });
      if (view?.lineParts) {
        for (const parts of view.lineParts) if(parts.some(part=>part.blankable)) add({id:parts[0].id,nodeId:node.id,blankCategory:"species",answer:parts.map(part=>part.text).join(""),sourceIds:parts.map(part=>part.id),location:"diagram"});
      } else (view?.lines ?? node.lines).forEach((line, i) => add({ id: `${node.id}:line:${i}`, nodeId: node.id,
        blankCategory: view?.lineBlankCategories?.[i] ?? node.blankCategory ?? "species", answer: line, location: "diagram" }));
      if (view?.caption) add({ id: `${node.id}:caption`, nodeId: node.id, blankCategory: "result", answer: view.caption, location: "diagram" });
    }
  }
  for (const edge of diagram.edges) {
    if (edge.display?.hideLabel) continue;
    const fields = new Map<string, { blankable?: boolean; blankCategory?: BlankCategory }>();
    if (edge.reagent) fields.set(edge.reagent.id, edge.reagent);
    if (edge.condition) fields.set(edge.condition.id, edge.condition);
    if (edge.operation) {
      fields.set(edge.operation.id, edge.operation);
      if (edge.operation.amount) fields.set(edge.operation.amount.id, edge.operation.amount);
      for (const item of [...edge.operation.actions, ...edge.operation.notes]) fields.set(item.id, item);
    }
    const phrases=edge.display?.problemPhrases;
    if(phrases) for(const phrase of phrases) add({id:phrase.id,edgeId:edge.id,blankCategory:phrase.blankCategory,answer:phrase.text,sourceIds:phrase.sourceIds,location:"diagram"});
    for (const instruction of phrases ? [] : edge.display?.instructions ?? []) {
      const source = fields.get(instruction.fieldId);
      if (source?.blankable !== true) continue;
      add({ id: instruction.fieldId, edgeId: edge.id, blankCategory: source.blankCategory ?? (instruction.kind === "note" ? "result" : instruction.kind),
        answer: instruction.text, location: "diagram" });
    }
    // Legacy diagrams without segmented instructions still use the same field IDs.
    if (!edge.display?.instructions) {
      if (edge.reagent?.blankable) add({ id: edge.reagent.id, edgeId: edge.id, blankCategory: edge.reagent.blankCategory ?? "reagent", answer: edge.reagent.label, location: "diagram" });
      if (edge.condition?.blankable) add({ id: edge.condition.id, edgeId: edge.id, blankCategory: edge.condition.blankCategory ?? "condition", answer: edge.condition.label, location: "diagram" });
    }
    for (const item of edge.operation?.actions ?? []) {
      if (item.blankable && item.practiceSupplement && !targets.has(item.id) && !phrases?.some(p=>p.sourceIds.includes(item.id))) add({ id: item.id, edgeId: edge.id,
        blankCategory: item.blankCategory ?? "action", answer: item.practiceLabel ?? item.label, location: "supplement" });
    }
  }
  return [...targets.values()];
}

function seededRandom(seed: string) {
  let state = 2166136261;
  for (let i=0; i<seed.length; i++) state = Math.imul(state ^ seed.charCodeAt(i), 16777619) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeparationExercise(diagram: Diagram, options: ExerciseOptions): SeparationExercise {
  if (!Object.hasOwn(exerciseModes,options.mode)) throw new Error("問題形式を選んでください。");
  if (!Number.isInteger(options.rate) || options.rate < 1 || options.rate > 99) throw new Error("穴埋め率は1〜99%で指定してください。");
  if (!options.seed || options.seed.length > 128) throw new Error("seedは1〜128文字で指定してください。");
  if (options.structurePolicy !== "hint" && options.structurePolicy !== "hide") throw new Error("構造式の表示方法を選んでください。");
  const targets = collectBlankTargets(diagram);
  let selected = targets.filter(target => options.mode === "all" || options.mode === "random"
    || (options.mode === "species" ? target.blankCategory === "species"
      : ["reagent","condition","operation","amount","action"].includes(target.blankCategory)));
  if (options.mode === "random") {
    const random = seededRandom(`v2:${diagram.id}:${options.seed}`);
    selected = [...selected].sort((a,b)=>a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    for (let i=selected.length-1; i>0; i--) {
      const j = Math.floor(random() * (i+1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }
    selected = selected.slice(0, Math.max(1, Math.round(selected.length * options.rate / 100)));
  }
  const ids = new Set(selected.map(target=>target.id));
  return { ...options, schemaVersion:1, generatorVersion:2, diagramId:diagram.id,
    targets, blankIds: targets.filter(target=>ids.has(target.id)).map(target=>target.id) };
}

/** Deterministically advance the seed, skipping an accidentally identical selection. */
export function nextSeparationExercise(diagram: Diagram, current: SeparationExercise) {
  for (let index=1; index<=128; index++) {
    const next = createSeparationExercise(diagram, {...current, seed:`${current.seed.slice(0,112)}#${index}`});
    if (next.blankIds.join("|") !== current.blankIds.join("|")) return next;
  }
  throw new Error("別のseedまたは穴埋め率を指定してください。");
}
