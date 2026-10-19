import type { BlankView } from "../separation/ExerciseField";
import { theoryFields } from "@/data/illustrated/theory";
import { Canvas, Arrow, Sheet } from "./DiagramParts";
import { TableField } from "./LessonField";
import { StudyLink } from "../StudyLink";

const f=theoryFields["energy-map"];
const State=({field,x,y,width=250,view}:{field:typeof f.solid;x:number;y:number;width?:number;view:BlankView})=><g><line x1={x} x2={x+width} y1={y} y2={y} className="energy-level"/><foreignObject x={x} y={y+5} width={width} height={48}><div className="energy-state-label"><TableField field={field} view={view}/></div></foreignObject></g>;
const Step=({field,x,y,up=true,view}:{field:typeof f.fusion;x:number;y:number;up?:boolean;view:BlankView})=><g><Arrow x1={x} y1={y+(up?45:-5)} x2={x} y2={y+(up?-18:70)}/><foreignObject x={x+12} y={y+4} width={285} height={76}><div className="energy-step-label"><TableField field={field} view={view}/></div></foreignObject></g>;

export function EnergyMap({view}:{view:BlankView}) {
 const show=view.showAnswers||view.exercise.blankIds.length===0;
 return <div className="energy-map-material">
  <Sheet title="1. エネルギー変化の総まとめ ― 状態と経路">
   <Canvas title="状態変化・結合・イオン化に伴うエネルギー変化の模式図" height={600}>
    <text x={55} y={45} className="diagram-small">高エネルギー</text><Arrow x1={45} y1={95} x2={45} y2={530}/><text x={30} y={570} className="diagram-small">低エネルギー</text>
    <text x={145} y={70}>分子・相の変化（例：水）</text>
    <State field={f.gas} x={130} y={140} view={view}/><text x={140} y={175}>H₂O(g)</text><State field={f.liquid} x={130} y={300} view={view}/><text x={140} y={335}>H₂O(l)</text><State field={f.solid} x={130} y={460} view={view}/><text x={140} y={495}>H₂O(s)</text>
    <Step field={f.vaporization} x={430} y={185} view={view}/><Step field={f.condensation} x={760} y={185} up={false} view={view}/>
    <Step field={f.fusion} x={430} y={345} view={view}/><Step field={f.freezing} x={760} y={345} up={false} view={view}/>
    <text x={145} y={555}>固体→気体：<TableField field={f.sublimation} view={view}/></text>
    <text x={640} y={80}>気体分子 → 原子 → イオン</text>
    <text x={655} y={130}>分子</text><text x={655} y={200}>原子</text><Step field={f.bond} x={785} y={130} view={view}/>
    <text x={655} y={300}>陽イオン + e⁻</text><Step field={f.ionization} x={785} y={220} view={view}/>
    <text x={655} y={405}>陰イオン</text><Step field={f.affinity} x={785} y={330} up={false} view={view}/>
    <text x={655} y={510}>イオン結晶</text><Step field={f.lattice} x={785} y={430} up={false} view={view}/>
   </Canvas>
   <p className="illustrated-caption">模式図です。異なる物質の状態を一つの共通尺度に置いた順位図ではありません。個別の経路で、上向きは吸熱（ΔH&gt;0）、下向きは発熱（ΔH&lt;0）。矢印を逆にたどるとΔHの符号も反転します。</p>
  </Sheet>
  <Sheet title="2. Born–Haber型の経路 ― NaCl(s)ができるまで">
   <Canvas title="NaClの生成エンタルピーとBorn–Haber cycleの模式図" height={560}>
    <text x={35} y={38}>エネルギー（模式図・縮尺なし）</text>
    <State field={f.solid} x={65} y={430} width={340} view={view}/><text x={75} y={465}>Na(s) + ½Cl₂(g)</text>
    <State field={f.atom} x={65} y={340} width={340} view={view}/><text x={75} y={375}>Na(g) + Cl(g)</text>
    <State field={f.ion} x={65} y={245} width={340} view={view}/><text x={75} y={280}>Na⁺(g) + e⁻ + Cl(g)</text>
    <State field={f.gas} x={65} y={145} width={340} view={view}/><text x={75} y={180}>Na⁺(g) + Cl⁻(g)</text>
    <State field={f.solid} x={65} y={485} width={340} view={view}/><text x={75} y={520}>NaCl(s)</text>
    <Arrow x1={455} y1={424} x2={455} y2={350}/><foreignObject x={470} y={368} width={260} height={75}><div className="energy-step-label">Naの昇華 ＋ ½Cl₂の解離（吸熱）</div></foreignObject>
    <Arrow x1={455} y1={333} x2={455} y2={255}/><foreignObject x={470} y={275} width={260} height={65}><div className="energy-step-label"><TableField field={f.ionization} view={view}/></div></foreignObject>
    <Arrow x1={455} y1={238} x2={455} y2={155}/><foreignObject x={470} y={175} width={260} height={65}><div className="energy-step-label"><TableField field={f.affinity} view={view}/></div></foreignObject>
    <Arrow x1={760} y1={145} x2={760} y2={485}/><foreignObject x={775} y={265} width={300} height={80}><div className="energy-step-label"><TableField field={f.lattice} view={view}/></div></foreignObject>
    <Arrow x1={1100} y1={430} x2={1100} y2={485}/><foreignObject x={820} y={440} width={270} height={55}><div className="energy-step-label">標準生成エンタルピー ΔfH°</div></foreignObject>
    <text x={470} y={75}>中間状態の変化を加えると、直接生成と同じ始状態・終状態になる。</text>
    <text x={470} y={105}>そのため経路のΔHの和は、直接経路のΔfH°に等しい（ヘスの法則）。</text>
   </Canvas>
   <p className="illustrated-caption">電子親和力は Cl(g)+e⁻→Cl⁻(g) の変化として示しています。表や教科書で「電子親和力」を放出エネルギーの正の大きさとして定義する場合は、エンタルピー変化では負符号になります。</p>
   <p className="energy-links"><StudyLink href="/theory/formulas#formula-formation">生成エンタルピー公式 →</StudyLink>　<StudyLink href="/theory/formulas#formula-hess">ヘスの法則公式 →</StudyLink></p>
  </Sheet>
  <Sheet title="3. NaClの溶解 ― 格子分解と水和">
   <Canvas title="NaClの格子分解・水和・溶解熱の関係" height={390}>
    <State field={f.solid} x={90} y={280} width={250} view={view}/><text x={100} y={315}>NaCl(s)</text>
    <State field={f.ion} x={430} y={80} width={300} view={view}/><text x={445} y={115}>Na⁺(g) + Cl⁻(g)</text>
    <State field={f.aqueous} x={810} y={250} width={270} view={view}/><text x={825} y={285}>Na⁺(aq) + Cl⁻(aq)</text>
    <Arrow x1={330} y1={265} x2={450} y2={150}/><foreignObject x={210} y={145} width={250} height={68}><div className="energy-step-label"><TableField field={f.latticeReverse} view={view}/></div></foreignObject>
    <Arrow x1={720} y1={155} x2={820} y2={245}/><foreignObject x={620} y={170} width={235} height={70}><div className="energy-step-label"><TableField field={f.hydration} view={view}/></div></foreignObject>
    <Arrow x1={340} y1={300} x2={810} y2={300}/><foreignObject x={450} y={310} width={360} height={65}><div className="energy-step-label"><TableField field={f.dissolution} view={view}/></div></foreignObject>
   </Canvas>
   <p className="illustrated-caption">格子分解は吸熱、水和は発熱。溶解熱は両過程の和で、物質・温度により符号や大きさが異なります。状態準位の上下は模式的で、実測値を表すものではありません。</p>
   <p className="energy-links"><StudyLink href="/theory/formulas#formula-enthalpy">反応エンタルピー →</StudyLink>　<StudyLink href="/theory/practice#hess">熱化学の典型例題 →</StudyLink></p>
  </Sheet>
  <Sheet title="4. 使い分けと注意">
   <div className="energy-term-grid">{([f.formation,f.combustion,f.neutralization,f.reaction] as const).map(term=><div key={term.id}><TableField field={term} view={view}/></div>)}</div>
   <ul className="energy-notes"><li>融解・蒸発・昇華は吸熱。凝固・凝縮は逆過程なので発熱。</li><li>結合を切るにはエネルギーが必要。結合形成ではエネルギーが放出される。</li><li>格子エネルギーは、結晶を気体イオンへ分解する向きを正に定義する資料もあります。この図では結晶生成方向を発熱として明示しました。</li><li>単体の標準生成エンタルピーが0なのは基準状態の単体です。Na(g)など気体原子の状態は0ではありません。</li><li>燃焼熱・中和熱・生成エンタルピーも反応経路のΔHとして扱えます。始状態と終状態が同じなら、経路によらずΔHは同じです。</li></ul>
   {show&&<p className="illustrated-caption">読み方：式を逆にする → ΔHの符号反転。式をn倍する → ΔHもn倍。経路を加える → ΔHを加算。</p>}
  </Sheet>
 </div>;
}
