import { createElement, type ReactNode } from "react";
import type { AnswerField } from "@/data/illustrated/types";
import type { BlankView } from "../separation/ExerciseField";

const m=(tag:string,children?:ReactNode,props:Record<string,unknown>={})=>createElement(tag,props,...(Array.isArray(children)?children:[children]));

function topLevelIndex(source: string, tokens: string[]) {
  let round = 0, square = 0;
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "(") round++;
    else if (source[i] === ")") round--;
    else if (source[i] === "[") square++;
    else if (source[i] === "]") square--;
    if (round === 0 && square === 0) {
      const token = tokens.find((candidate) => source.startsWith(candidate, i));
      if (token && i > 0) return { index: i, token };
    }
  }
  return undefined;
}

function matchingOuterParentheses(source: string) {
  if (!source.startsWith("(") || !source.endsWith(")")) return false;
  let depth = 0;
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "(") depth++;
    if (source[i] === ")" && --depth === 0 && i < source.length - 1) return false;
  }
  return depth === 0;
}

function parseMath(source: string): ReactNode {
  const text = source.trim();
  if (!text) return null;
  if (matchingOuterParentheses(text)) return m("mfenced",m("mrow",parseMath(text.slice(1, -1))));

  const relation = topLevelIndex(text, [" = ", " ≈ ", " ⇄ ", " → "]);
  if (relation) return m("mrow",[parseMath(text.slice(0, relation.index)),m("mo",relation.token.trim()),parseMath(text.slice(relation.index + relation.token.length))]);

  const clause = topLevelIndex(text, ["、"]);
  if (clause) return m("mrow",[parseMath(text.slice(0, clause.index)),m("mo","、"),parseMath(text.slice(clause.index + clause.token.length))]);

  if(text.startsWith("√(")&&text.endsWith(")")){
    const body=text.slice(2,-1);
    if(matchingOuterParentheses(`(${body})`))return m("msqrt",m("mrow",parseMath(body)));
  }

  const fraction = topLevelIndex(text, ["/"]);
  if (fraction) return m("mfrac",[m("mrow",parseMath(text.slice(0, fraction.index))),m("mrow",parseMath(text.slice(fraction.index + 1)))]);

  const power = /(\[[^\]]+\]|\([^()]+\)|[A-Za-zΑ-ωΔ]+|\d+)\^([A-Za-zΑ-ωΔ0-9+-]+)/.exec(text);
  if (power && power.index !== undefined) {
    const before = text.slice(0, power.index), after = text.slice(power.index + power[0].length);
    return m("mrow",[parseMath(before),m("msup",[m("mrow",parseMath(power[1])),m("mrow",m("mi",power[2]))]),parseMath(after)]);
  }

  const constant=/p?K[acw]/.exec(text);
  if(constant&&constant.index!==undefined){
    const before=text.slice(0,constant.index),after=text.slice(constant.index+constant[0].length),isP=constant[0].startsWith("p"),sub=constant[0].at(-1)!;
    return m("mrow",[parseMath(before),m("msub",[m("mrow",[isP?m("mi","p"):null,m("mi","K")]),m("mi",sub)]),parseMath(after)]);
  }
  return m("mtext",text);
}

export function MathText({ text, className, display = false }: { text: string; className?: string; display?: boolean }) {
  return m("math",m("mrow",parseMath(text)),{xmlns:"http://www.w3.org/1998/Math/MathML",display:display?"block":"inline",className,"aria-label":text});
}

export function MathField({ prefix = "", field, view }: { prefix?: string; field: AnswerField; view: BlankView }) {
  const number = view.exercise.blankIds.indexOf(field.id) + 1;
  const blank = number > 0 && !view.showAnswers;
  const rhs=blank?m("mtext","＿＿＿＿",{"data-blank-id":field.id,"aria-label":`空欄${number}`,className:"math-blank"}):m("mrow",parseMath(field.text),{"data-field-id":field.id,"data-revealed-id":number?field.id:undefined,className:number?"separation-answer":undefined});
  return m("math",m("mrow",[parseMath(prefix),rhs]),{xmlns:"http://www.w3.org/1998/Math/MathML",display:"block",className:"formula-expression","aria-label":`${prefix}${blank?`空欄${number}`:field.text}`});
}
