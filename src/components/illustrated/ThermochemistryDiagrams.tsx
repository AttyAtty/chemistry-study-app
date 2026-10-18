import type {BlankView} from "../separation/ExerciseField";
import {Canvas,Arrow,Sheet} from "./DiagramParts";
import {TheoryAnswer} from "./AcidBaseDiagrams";
import {theoryFields} from "@/data/illustrated/theory";
import {formationEnthalpies as hf,bondEnergies as bonds} from "@/data/thermochemistry";
import {isMasked} from "./LessonField";

export function ThermochemistryLesson({view}:{view:BlankView}){
 const f=theoryFields.thermochemistry,show=view.showAnswers||view.exercise.blankIds.length===0;
 return <><Sheet title="1. 発熱・吸熱とエンタルピー ― 差と山を区別"><Canvas title="発熱反応と吸熱反応のエンタルピー図" height={340}>
  {[true,false].map((exo,i)=><g key={i} transform={`translate(${i*550} 0)`}><text x={275} y={30} textAnchor="middle">{exo?"発熱反応":"吸熱反応"}</text><Arrow x1={55} y1={285} x2={55} y2={65}/><text x={75} y={55}>H [模式単位]</text><line x1={100} x2={225} y1={exo?110:235} y2={exo?110:235} stroke="#466c83" strokeWidth={4}/><line x1={325} x2={465} y1={exo?235:110} y2={exo?235:110} stroke="#466c83" strokeWidth={4}/><text x={160} y={exo?95:270} textAnchor="middle">反応物</text><text x={395} y={exo?270:95} textAnchor="middle">生成物</text><Arrow x1={275} y1={exo?110:235} x2={275} y2={exo?235:110}/>{!isMasked(view,f.sign)&&<text x={325} y={183}>{exo?"ΔH < 0":"ΔH > 0"}</text>}</g>)}
 </Canvas><TheoryAnswer field={f.sign} view={view}/><TheoryAnswer field={f.definition} view={view}/><p className="illustrated-caption">定圧・膨張仕事以外を無視したとき、系が受け取った熱がΔH。発熱で外へ放出する熱量は正の大きさ、系のΔHは負です。活性化エネルギーは途中の障壁で、反応物と生成物の差とは異なります。</p>
 <Canvas title="反応式係数と標準生成エンタルピーの対応" height={290}><text x={550} y={35} textAnchor="middle">2H₂(g) + O₂(g) → 2H₂O(l)　25 ℃</text><text x={120} y={95}>反応物側</text><text x={610} y={95}>生成物側</text><text x={120} y={145}>2 × 0 + 1 × 0 = 0</text><text x={610} y={145}>2 × ({hf.waterLiquid}) = {(2*hf.waterLiquid).toFixed(1)} kJ</text><Arrow x1={310} y1={195} x2={790} y2={195}/><text x={550} y={245} textAnchor="middle">反応式の係数倍をそろえて、生成物側 − 反応物側</text></Canvas><TheoryAnswer field={f.formation} view={view}/><p className="illustrated-caption">ΔfH°は物質1 molの生成に対する値。基準状態の単体は0。標準圧力1 bar、温度を指定（表は通常298 K付近）。液体の水と水蒸気では値が違います。</p></Sheet>
 <Sheet title="2. 経路を足す ― ヘスの法則と結合エネルギー"><Canvas title="反応式を逆転して足すヘスの法則" height={370}>
  <text x={40} y={45}>① C(s) + O₂(g) → CO₂(g)</text><text x={800} y={45}>ΔH = {hf.carbonDioxide} kJ</text>
  <text x={40} y={105}>② CO(g) + ½O₂(g) → CO₂(g)</text><text x={800} y={105}>ΔH = {(hf.carbonDioxide-hf.carbonMonoxide).toFixed(1)} kJ</text>
  <Arrow x1={550} y1={125} x2={550} y2={165}/><text x={40} y={200}>②を逆転：CO₂(g) → CO(g) + ½O₂(g)</text><text x={800} y={200}>ΔH = +283.0 kJ</text>
  <line x1={40} y1={225} x2={1050} y2={225} stroke="#6c7f8e"/><text x={40} y={265}>① + 逆②：C(s) + ½O₂(g) → CO(g)</text><text x={800} y={265}>ΔH = −110.5 kJ</text><text x={550} y={330} textAnchor="middle">逆向き → 符号反転 ／ n倍 → ΔHもn倍 ／ 足し算 → ΔHも加算</text>
 </Canvas><TheoryAnswer field={f.hess} view={view}/>
 <Canvas title="結合の切断は吸収、形成は放出" height={250}><text x={60} y={40}>H–H + Cl–Cl</text><Arrow x1={310} y1={85} x2={500} y2={85}/><text x={550} y={40} textAnchor="middle">2H + 2Cl（気相の原子）</text><Arrow x1={700} y1={85} x2={900} y2={85}/><text x={990} y={40} textAnchor="middle">2H–Cl</text><text x={330} y={145} textAnchor="middle">切断：+{bonds.hh+bonds.clcl} kJ</text><text x={820} y={145} textAnchor="middle">形成：−{2*bonds.hcl} kJ</text>{show&&<text x={550} y={210} textAnchor="middle">概算ΔH ≈ {bonds.hh+bonds.clcl} − {2*bonds.hcl} = {bonds.hh+bonds.clcl-2*bonds.hcl} kJ</text>}</Canvas><TheoryAnswer field={f.bonds} view={view}/><p className="illustrated-caption">生成エンタルピーはOpenStaxの代表値。結合エネルギーは気相の平均値による概算で、気相以外の反応には状態変化の補正も必要です。公式・計算欄で代入を確認できます。</p></Sheet></>;
}
