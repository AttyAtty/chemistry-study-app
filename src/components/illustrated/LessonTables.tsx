import type { Polymer, Sugar } from "@/data/illustrated/types";
import { sugarCategoryLabels } from "@/data/illustrated/carbohydrates";
import type { BlankView } from "@/components/separation/ExerciseField";
import { ChemicalStructure } from "./ChemicalStructure";
import { isMasked, TableField } from "./LessonField";

export function PolymerTable({items,view}:{items:Polymer[];view:BlankView}) {
  return <div className="illustrated-table-scroll" tabIndex={0} role="region" aria-label="高分子比較表（横スクロール可）"><table className="illustrated-table polymer-table">
    <caption>原料・重合形式・構造・性質・用途の比較</caption>
    <thead><tr>{["高分子名","モノマー","重合形式","繰り返し単位・構造","主な性質・熱的性質","主な用途"].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
    <tbody>{items.map(p=><tr key={p.id} data-polymer-row={p.id}>
      <th scope="row"><TableField field={p.name} view={view}/></th>
      <td>{p.monomers.map((m,i)=><div key={m.id}>{i>0 && <span>＋ </span>}<TableField field={m.name} view={view}/></div>)}</td>
      <td><TableField field={p.method} view={view}/></td>
      <td>{p.repeat && <ChemicalStructure drawing={p.repeat} width={170} height={78}/>}<span>{p.repeatDescription}</span></td>
      <td>{p.properties}<small>{p.thermal}</small></td><td>{isMasked(view,p.name) ? "解答表示で確認" : p.uses}</td>
    </tr>)}</tbody>
  </table></div>;
}
export function SugarTable({items,view}:{items:Sugar[];view:BlankView}) {
  return <div className="illustrated-table-scroll" tabIndex={0} role="region" aria-label="糖類比較表（横スクロール可）"><table className="illustrated-table sugar-table">
    <caption>加水分解前の還元性と、加水分解後の生成物を区別する</caption>
    <thead><tr>{["名称","分類","構成単糖・種類","還元性","加水分解（最終）","代表的反応","補足"].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
    <tbody>{items.map(s=><tr key={s.id} data-sugar-row={s.id}>
      <th scope="row"><TableField field={s.name} view={view}/></th><td>{sugarCategoryLabels[s.category]}<small>{s.formula}</small></td>
      <td><TableField field={s.composition} view={view}/></td><td><TableField field={s.reducing} view={view}/></td>
      <td><TableField field={s.hydrolysis} view={view}/></td>
      <td>{isMasked(view,s.reducing) ? <span className="related-hint-hidden">還元性のヒントは解答表示で確認</span> : s.reaction}</td>
      <td>{view.exercise.blankIds.length && !view.showAnswers ? "補足は解答表示で確認" : s.note}</td>
    </tr>)}</tbody>
  </table></div>;
}
