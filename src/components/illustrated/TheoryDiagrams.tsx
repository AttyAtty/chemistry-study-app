import type { BlankView } from "../separation/ExerciseField";
import { theoryFields, solubilityPoints } from "@/data/illustrated/theory";
import { solubilityAt, vaporPressureAt, boilingTemperature, henryAmount } from "@/lib/theoryModels";
import { Canvas, Sheet, Arrow } from "./DiagramParts";
import { SvgField, TableField, isMasked } from "./LessonField";
import { CartesianPlot, ParticleVessel, InteractivePrintPair, plotCoordinates, type PlotSpec } from "./TheoryParts";

const solSpec:PlotSpec={xDomain:[0,100],yDomain:[0,120],xTicks:[0,20,40,60,80,100],yTicks:[0,30,60,90,120],xLabel:"温度 [℃]",yLabel:"水100 gに溶ける溶質の質量 [g]"};
const vaporSpec:PlotSpec={xDomain:[20,130],yDomain:[0,300],xTicks:[20,40,60,80,100,120,130],yTicks:[0,50,100,150,200,250,300],xLabel:"温度 [℃]",yLabel:"飽和蒸気圧 [kPa]"};
const henrySpec:PlotSpec={xDomain:[0,4],yDomain:[0,8],xTicks:[0,1,2,3,4],yTicks:[0,2,4,6,8],xLabel:"溶ける気体の分圧 p [atm]",yLabel:"一定量の液体に溶ける気体 n [mmol]"};
const solved=(view:BlankView)=>view.showAnswers||view.exercise.blankIds.length===0;

function SolubilityGraph({temperature,recrystallization=false}:{temperature:number;recrystallization?:boolean}) {
 const {x,y}=plotCoordinates(solSpec),s=solubilityAt(temperature);
 return <Canvas title="模式物質Aの溶解度曲線" height={440}><CartesianPlot spec={solSpec} points={solubilityPoints.map(([a,b])=>[a,b])}>
  <line x1={x(temperature)} y1={345} x2={x(temperature)} y2={y(s)} className="plot-guide"/><line x1={135} y1={y(s)} x2={x(temperature)} y2={y(s)} className="plot-guide"/>
  <circle data-solubility-point="true" data-temperature={temperature} data-solubility={s.toFixed(1)} cx={x(temperature)} cy={y(s)} r={7} className="plot-point"/>
  {recrystallization&&<><circle cx={x(80)} cy={y(80)} r={7} className="plot-point"/><circle cx={x(20)} cy={y(30)} r={7} className="plot-point"/>
   <path d={`M${x(80)} ${y(80)} H${x(90)} V${y(30)} H${x(20)}`} className="plot-guide"/><text x={x(55)} y={y(30)+28}>冷却後に溶けていられる量</text><text x={x(70)} y={y(80)-17}>80 ℃：80 g</text><text x={x(5)} y={y(30)-17}>20 ℃：30 g</text>
  </>}
 </CartesianPlot></Canvas>;
}
export function SolubilityLesson({view,temperature,onTemperature,notes}:{view:BlankView;temperature:number;onTemperature:(n:number)=>void;notes:string[]}) {
 const f=theoryFields.solubility,show=solved(view);
 return <><Sheet title="1. 溶ける限界を、粒子とグラフで見る">
  <Canvas title="同じ温度・同じ水量での溶け方の比較" height={345}>
   {[8,16,24].map((n,i)=><g key={n}><ParticleVessel x={55+i*350} y={35} width={270} height={190} liquidParticles={n}/><SvgField field={[f.unsaturated,f.saturated,f.supersaturated][i]} x={190+i*350} y={270} width={330} view={view}/></g>)}
   <SvgField field={f.basis} x={550} y={322} width={1030} view={view}/>
  </Canvas>
  <p className="illustrated-caption">同じ温度・同じ水量。点は溶けた溶質の模式記号で、個数は分子数やgを表しません。右端も溶質が溶けた均一な状態です。</p>
  <div className="theory-controls no-print"><label htmlFor="sol-temperature">温度 [℃]</label><input id="sol-temperature" type="range" min={0} max={100} step={1} value={temperature} onChange={e=>onTemperature(Number(e.target.value))}/><output data-solubility-output="true">{temperature} ℃：水100 gに{solubilityAt(temperature).toFixed(1)} g</output></div>
  <InteractivePrintPair interactive={<SolubilityGraph temperature={temperature}/>} printable={<SolubilityGraph temperature={20}/>}/>
  <p className="illustrated-caption">模式物質Aの説明用データ（実測値ではありません）。温度間は折線補間。印刷は20 ℃の代表状態です。</p>
  {show&&<p className="illustrated-caption">曲線上：飽和。下：不飽和。上：その量がすべて溶けていれば過飽和。上の量を加えただけなら、通常は飽和溶液と未溶解の固体に分かれます。飽和溶液は固体が見えなくても成立します。</p>}
 </Sheet><Sheet title="2. 冷却で余った分を取り出す ― 再結晶の計算">
  <Canvas title="高温で溶かして冷却し結晶を得る" height={280}>
   <ParticleVessel x={55} y={25} width={240} height={175} liquidParticles={24}/><Arrow x1={330} y1={110} x2={700} y2={110}/><text x={515} y={80} textAnchor="middle">80 ℃ → 20 ℃へ冷却</text>
   <ParticleVessel x={760} y={25} width={240} height={175} liquidParticles={9} crystals={8}/><text x={175} y={238} textAnchor="middle">水100 g + 溶質80 g</text><text x={880} y={238} textAnchor="middle">溶けた30 g + 結晶</text>
  </Canvas><SvgAnswer field={f.recrystallization} view={view}/><SolubilityGraph temperature={20} recrystallization/>
  <div className="theory-answer-line"><TableField field={f.result} view={view}/></div>
  <p className="illustrated-caption">縦方向の差80 − 30が、同じ水100 gに対する析出量。水の蒸発なし・結晶水を含まない溶質を仮定します。</p>
  <div className="theory-scaling"><span>同じ温度で溶解度40 g（別の模式例）</span><b>水50 g → 溶質20 g</b><b>水100 g → 溶質40 g</b><b>水200 g → 溶質80 g</b></div>
  <div className="theory-answer-line"><TableField field={f.scale} view={view}/></div>
  {show&&<ul className="illustrated-notes theory-notes">{notes.map(n=><li key={n}>{n}</li>)}</ul>}
 </Sheet></>;
}
function SvgAnswer({field,view}:{field:typeof theoryFields.solubility.basis;view:BlankView}){return <div className="theory-answer-line"><TableField field={field} view={view}/></div>;}

function VaporGraph({temperature,pressure}:{temperature:number;pressure:number}) {
 const {x,y}=plotCoordinates(vaporSpec),p=vaporPressureAt(temperature),bp=boilingTemperature(pressure);
 return <Canvas title="模式液体Bの飽和蒸気圧曲線と外圧" height={445}>
  <CartesianPlot spec={vaporSpec} points={Array.from({length:111},(_,i)=>[20+i,vaporPressureAt(20+i)])}>
   <line x1={135} y1={y(101.325)} x2={970} y2={y(101.325)} className="plot-reference"/><text x={150} y={y(101.325)-10}>1 atm = 101.325 kPa</text>
   <line data-external-pressure={pressure} x1={135} y1={y(pressure)} x2={970} y2={y(pressure)} className="plot-external"/>
   <line x1={x(bp)} y1={y(pressure)} x2={x(bp)} y2={345} className="plot-guide"/><circle cx={x(bp)} cy={y(pressure)} r={7} className="plot-intersection"/>
   <circle data-vapor-point="true" data-temperature={temperature} data-vapor-pressure={p.toFixed(1)} cx={x(temperature)} cy={y(p)} r={7} className="plot-point"/>
   <text x={970} y={55} textAnchor="end">実線：外圧 ／ 交点：沸点</text>
  </CartesianPlot>
 </Canvas>;
}
export function VaporLesson({view,temperature,pressure,onTemperature,onPressure}:{view:BlankView;temperature:number;pressure:number;onTemperature:(n:number)=>void;onPressure:(n:number)=>void}) {
 const f=theoryFields["vapor-pressure"],show=solved(view);
 return <><Sheet title="1. 液面では何が起こる？ ― 蒸発と動的平衡">
  <Canvas title="開放容器から分子が出ていく" height={240}><ParticleVessel x={70} y={15} width={260} height={170} liquidParticles={24} gasParticles={4} evaporating/><Arrow x1={260} y1={30} x2={390} y2={10}/><text x={575} y={60}>開放容器：分子が周囲へ拡散</text><SvgField field={f.evaporation} x={700} y={120} width={600} view={view}/></Canvas>
  <Canvas title="密閉容器の時間経過：5段階" height={330}>
   {[0,4,8,10,10].map((n,i)=><g key={i} transform={`translate(${i*218} 0)`}><text x={109} y={25} textAnchor="middle">STEP {i+1}</text><ParticleVessel x={16} y={45} width={185} height={160} liquidParticles={24-n} gasParticles={n} closed evaporating={i>0} condensing={i>=2} condensationFraction={i===2?.4:1}/><text x={109} y={239} textAnchor="middle" className="theory-stage-caption">{["封入直後","気相の分子が増える","戻る分子も増える",isMasked(view,f.equilibrium)?"矢印を比べよう":"蒸発と凝縮","見かけは一定"][i]}</text><text x={109} y={263} textAnchor="middle" className="theory-stage-caption">{["","","",isMasked(view,f.equilibrium)?"":"速さが等しい",isMasked(view,f.equilibrium)?"何が続く？":"交換は続く"][i]}</text>{i<4&&<Arrow x1={195} y1={120} x2={225} y2={120}/>}</g>)}
   <SvgField field={f.equilibrium} x={550} y={300} width={1050} view={view}/>
  </Canvas>
  <SvgAnswer field={f.condensation} view={view}/><SvgAnswer field={f.saturation} view={view}/>
  <p className="illustrated-caption">同じ温度、液体が残る密閉容器。粒子数は定性的な記号です。封入直後は理想化した初期状態。平衡でも粒子の往復は止まりません。</p>
  {show&&<p className="illustrated-caption">蒸気＝気相にあるその物質。蒸気圧＝その蒸気が示す圧力（混合気体では分圧）。飽和蒸気圧＝液体と平衡にあるときの値で、純液体では温度で決まります。密閉しても液体が全て気化した場合は飽和に達するとは限りません。</p>}
 </Sheet><Sheet title="2. 温度・蒸気圧・外圧の交点が沸点を決める">
  <div className="theory-controls no-print"><label htmlFor="vapor-temperature">温度 [℃]</label><input id="vapor-temperature" type="range" min={20} max={130} value={temperature} onChange={e=>onTemperature(Number(e.target.value))}/><output data-vapor-output="true">{temperature} ℃：{vaporPressureAt(temperature).toFixed(1)} kPa</output><label htmlFor="vapor-external">外圧 [kPa]</label><input id="vapor-external" type="range" min={30} max={200} step="any" value={pressure} onChange={e=>onPressure(Number(e.target.value))}/><output data-boiling-output="true">外圧{pressure.toFixed(3)} kPa：沸点{boilingTemperature(pressure).toFixed(1)} ℃</output></div>
  <InteractivePrintPair interactive={<VaporGraph temperature={temperature} pressure={pressure}/>} printable={<VaporGraph temperature={100} pressure={101.325}/>}/>
  <p className="illustrated-caption">模式液体Bの説明用曲線。実在物質の実測値・物性推算式ではありません。青点は指定温度での平衡値で、常にその状態で液体を保てるという意味ではありません。印刷は100 ℃・1 atm。</p>
  <SvgAnswer field={f.boiling} view={view}/>
  <Canvas title="液面の蒸発と液体内部の沸騰の比較" height={230}>
   <ParticleVessel x={50} y={20} width={240} height={155} liquidParticles={20} evaporating/><text x={170} y={213} textAnchor="middle">液面で気化・沸点以下でも起こる</text>
   <ParticleVessel x={705} y={20} width={240} height={155} liquidParticles={20} evaporating bubbles/><text x={825} y={213} textAnchor="middle">液体内部でも気化・気泡が成長</text>
   <g data-boiling-logic="true">{isMasked(view,f.boiling)?<><text x={490} y={94} textAnchor="middle">左右の図を比べて</text><text x={490} y={143} textAnchor="middle">気泡が成長する条件を答えよう</text></>:<><text x={490} y={65} textAnchor="middle">蒸気圧 ＜ 外圧</text><text x={490} y={94} textAnchor="middle">蒸気の気泡は維持しにくい</text><text x={490} y={143} textAnchor="middle">蒸気圧が外圧に達する</text><text x={490} y={172} textAnchor="middle">沸騰を開始（高校化学の近似）</text></>}</g>
  </Canvas><SvgAnswer field={f.pressure} view={view}/><SvgAnswer field={f.example} view={view}/>
  {show&&<p className="illustrated-caption">高山：外圧が低く沸点も低い。圧力鍋：外圧が高く沸点も高い。実際の気泡には深さによる圧力や表面張力、核形成も影響します。沸騰前の加熱で出る小さな泡には、溶存空気が含まれる場合もあります。</p>}
 </Sheet></>;
}

function HenryGraph({pressure}:{pressure:number}) {
 const {x,y}=plotCoordinates(henrySpec),n=henryAmount(pressure);
 return <Canvas title="気体の分圧と平衡溶解量の比例グラフ" height={440}><CartesianPlot spec={henrySpec} points={[[0,0],[4,8]]}>
  <line x1={x(pressure)} y1={345} x2={x(pressure)} y2={y(n)} className="plot-guide"/><line x1={135} y1={y(n)} x2={x(pressure)} y2={y(n)} className="plot-guide"/>
  <circle data-henry-point="true" data-pressure={pressure} data-amount={n.toFixed(1)} cx={x(pressure)} cy={y(n)} r={7} className="plot-point"/>
 </CartesianPlot></Canvas>;
}
function HenryParticles({pressure}:{pressure:number}) {
 return <Canvas title="分圧が高いほど液体中に溶けた気体が多い" height={280}>
  <ParticleVessel x={80} y={20} width={260} height={180} liquidParticles={4} gasParticles={3} closed/>
  <text x={210} y={241} textAnchor="middle">比較：1.0 atm / 2.0 mmol</text><Arrow x1={390} y1={105} x2={650} y2={105}/>
  <g data-henry-particles="true"><ParticleVessel x={700} y={20} width={260} height={180} liquidParticles={Math.round(pressure*4)} gasParticles={Math.round(pressure*3)} closed/></g><text x={830} y={241} textAnchor="middle">{pressure.toFixed(1)} atm / {henryAmount(pressure).toFixed(1)} mmol</text>
 </Canvas>;
}
export function HenryLesson({view,pressure,onPressure}:{view:BlankView;pressure:number;onPressure:(n:number)=>void}) {
 const f=theoryFields.henry,show=solved(view);
 return <><Sheet title="1. 分圧を上げると、液体に溶ける気体も増える">
  <InteractivePrintPair interactive={<HenryParticles pressure={pressure}/>} printable={<HenryParticles pressure={3}/>}/>
  <p className="illustrated-caption">一定温度・同じ種類と量の液体・平衡状態。点は溶けた気体を表す模式記号。液体量は両容器で同じです。</p>
  <div className="theory-controls no-print"><label htmlFor="henry-pressure">気体の分圧 [atm]</label><input id="henry-pressure" type="range" min={0} max={4} step={.1} value={pressure} onChange={e=>onPressure(Number(e.target.value))}/><output data-henry-output="true">{pressure.toFixed(1)} atm：{henryAmount(pressure).toFixed(1)} mmol</output></div>
  <InteractivePrintPair interactive={<HenryGraph pressure={pressure}/>} printable={<HenryGraph pressure={3}/>}/><SvgAnswer field={f.law} view={view}/><SvgAnswer field={f.formula} view={view}/>
  <p className="illustrated-caption">模式例：一定の液体試料についてk = 2.0 mmol/atm。実在する気体の定数ではありません。印刷は1.0 atmと3.0 atmの比較。</p>
  {show&&<p className="illustrated-caption">pは溶ける気体自身の分圧です。他の気体を加えて全圧だけを上げても、目的気体の分圧が変わらなければその平衡溶解量は増えません。nはこの一定量の液体に溶ける物質量で、溶解した気体の体積ではありません。</p>}
 </Sheet><Sheet title="2. 炭酸飲料から、比例計算と温度の違いへ">
  <Canvas title="未開封の炭酸飲料と開栓後の気泡" height={270}>
   <ParticleVessel x={65} y={20} width={260} height={175} liquidParticles={24} gasParticles={12} closed/>
   <text x={195} y={237} textAnchor="middle">未開封：CO₂分圧が高い</text><Arrow x1={370} y1={100} x2={680} y2={100}/><text x={525} y={70} textAnchor="middle">開栓して圧力を下げる</text>
   <ParticleVessel x={735} y={20} width={260} height={175} liquidParticles={12} gasParticles={4} bubbles evaporating/><text x={865} y={237} textAnchor="middle">開栓直後：余分なCO₂が出る</text>
  </Canvas><SvgAnswer field={f.release} view={view}/><p className="illustrated-caption">右図は放出が進む途中。開栓と同時に瞬時に全てのCO₂が抜けるわけではありません。粒子数に定量的な意味はありません。</p>
  <div className="theory-answer-line"><TableField field={f.example} view={view}/></div>
  <p className="illustrated-caption">同じ温度・同じ液体量なら、分圧が3倍で物質量も3倍。グラフの原点を通る直線と対応します。</p>
  <div className="illustrated-table-scroll"><table className="illustrated-table theory-comparison"><thead><tr><th>溶質</th><th>温度の影響・圧力との関係</th><th>読み方</th></tr></thead><tbody><tr><th>固体</th><td><TableField field={f.solid} view={view}/></td><td>物質ごとの溶解度曲線を確認</td></tr><tr><th>気体</th><td><TableField field={f.gas} view={view}/></td><td>温度・液体量一定で分圧を比較</td></tr></tbody></table></div>
  {show&&<p className="illustrated-caption">ヘンリーの法則は、主に溶媒と強く反応しない気体の希薄溶液・高すぎない圧力での近似です。NH₃やHClのように水と反応・電離する気体には単純に適用しません。CO₂と水も反応を伴うため、炭酸飲料は分圧効果の定性的な例として扱います。一定圧力で測った気体の体積と、溶解時の圧力で換算した体積は区別します。</p>}
 </Sheet></>;
}
