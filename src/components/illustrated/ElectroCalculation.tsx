import {electrochemistryCards} from "@/data/electrochemistry";
import {formulasForLesson} from "@/data/illustrated/formulas";
import {charge,electronMoles,productMoles,depositMass,FARADAY_DISPLAY} from "@/lib/formulaCalculations";
import type {BlankView} from "../separation/ExerciseField";
import {Canvas,Arrow,Sheet} from "./DiagramParts";
import {isMasked} from "./LessonField";

export function ElectroCalculation({view}:{view:BlankView}){
 const source=electrochemistryCards.find(c=>c.id==="cuso4-pt")!;
 const battery=electrochemistryCards.find(c=>c.id==="daniel")!;
 const example=formulasForLesson("electrochemistry").find(f=>f.id==="faraday")!;
 const hidden=isMasked(view,example.example.solution)||isMasked(view,example.rhs);
 const values=[`${charge(2,965)} C`,`${electronMoles(charge(2,965)).toFixed(4)} mol e⁻`,`${productMoles(.0200,2).toFixed(4)} mol Cu`,`${depositMass(2,965,2,63.5).toFixed(3)} g Cu`];
 return <Sheet title="電気量から析出量へ ― 半反応式の比を使う"><p>別例：CuSO₄水溶液をPt電極で電気分解。2.00 Aを965 s流す。Cuのモル質量63.5 g/mol、F = {FARADAY_DISPLAY} C/mol。</p><Canvas title="電気量、電子、銅の物質量、質量を結ぶ計算手順" height={420}>
  {["電気量 Q","電子の物質量","銅の物質量","析出する質量"].map((label,i)=><g key={label}><rect className="inorganic-box" x={20+i*275} y={70} width={235} height={160} rx={8}/><text x={137+i*275} y={105} textAnchor="middle">{label}</text><text x={137+i*275} y={149} textAnchor="middle">{["I × t","Q ÷ F","n(e⁻) ÷ 2","n(Cu) × M"][i]}</text><text x={137+i*275} y={199} textAnchor="middle">{hidden?"［計算する］":values[i]}</text>{i<3&&<Arrow x1={255+i*275} y1={150} x2={290+i*275} y2={150}/>}</g>)}
  <text x={550} y={290} textAnchor="middle">{source.electrodes.find(e=>e.reactionType==="reduction")!.equation}</text><text x={550} y={330} textAnchor="middle">2 molの電子で1 molのCuが析出する</text><text x={550} y={380} textAnchor="middle">気体を求める場合：物質量 → 指定した温度・圧力で体積へ</text>
 </Canvas><p className="illustrated-caption">電子は溶液中をそのまま流れません。半反応式の係数比で、電子のmolと生成物のmolをつなぎます。計算・答えは下の例題で確認。</p>{(view.exercise.blankIds.length===0||view.showAnswers)&&<div className="formula-example"><strong>電池では両極の電子数をそろえて足す</strong>{battery.electrodes.map(e=><p key={e.electrodeRole}>{e.equation}</p>)}<p>2e⁻を両辺から消す → {battery.overallEquation}</p></div>}</Sheet>;
}
