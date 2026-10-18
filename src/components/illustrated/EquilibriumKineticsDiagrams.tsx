import type {BlankView} from "../separation/ExerciseField";
import {advancedTheoryFields as fields} from "@/data/illustrated/theoryAdvanced";
import {equilibriumAt,equilibriumAfterAddition,activationProfile} from "@/lib/theoryAdvancedModels";
import {Canvas,Arrow,Sheet} from "./DiagramParts";
import {TableField,isMasked} from "./LessonField";
import {CartesianPlot,plotCoordinates,InteractivePrintPair,type PlotSpec} from "./TheoryParts";
import {IonBox,TheoryAnswer} from "./AcidBaseDiagrams";

const concentrationSpec:PlotSpec={xDomain:[0,8],yDomain:[0,3],xTicks:[0,2,4,6,8],yTicks:[0,1,2,3],xLabel:"時間 [任意単位]",yLabel:"濃度 [任意単位]"};
const rateSpec:PlotSpec={xDomain:[0,8],yDomain:[0,1],xTicks:[0,2,4,6,8],yTicks:[0,.2,.4,.6,.8,1],xLabel:"時間 [任意単位]",yLabel:"反応速度 [任意単位]"};
const times=Array.from({length:81},(_,i)=>i/10);
function EquilibriumGraphs({view}:{view:BlankView}){
 const c=plotCoordinates(concentrationSpec),r=plotCoordinates(rateSpec),hidden=isMasked(view,fields.equilibrium.dynamic);
 return <><Canvas title="平衡へ向かう濃度：同じ値にはならない" height={435}><CartesianPlot spec={concentrationSpec} points={times.map(t=>[t,equilibriumAt(t).a])}>
  <polyline points={times.map(t=>`${c.x(t)},${c.y(equilibriumAt(t).c)}`).join(" ")} className="buffer-curve"/><polyline points={times.map(t=>`${c.x(t)},${c.y(equilibriumAt(t,true).a)}`).join(" ")} className="catalyst-curve"/>
  <text x={500} y={55}>実線：A・B ／ 破線：C・D ／ 点線：触媒ありのA・B</text>
 </CartesianPlot></Canvas><Canvas title="平衡へ向かう正反応と逆反応の速度" height={435}><CartesianPlot spec={rateSpec} points={times.map(t=>[t,equilibriumAt(t).forward])}>
  <polyline points={times.map(t=>`${r.x(t)},${r.y(equilibriumAt(t).reverse)}`).join(" ")} className="buffer-curve"/><text x={500} y={55}>実線：正反応 ／ 破線：逆反応</text>
  {!hidden&&<text x={950} y={r.y(.4)-16} textAnchor="end">同じ速さへ近づく</text>}
 </CartesianPlot></Canvas></>;
}
function AdditionDiagram({added}:{added:number}){
 const e=equilibriumAfterAddition(added),before=[2+added,2,1,1],after=[e.a,e.b,e.c,e.d];
 return <Canvas title="反応物Aを加えた直後と、新しい平衡" height={300}>
  {[before,after].map((counts,i)=><g key={i}><text x={260+i*580} y={30} textAnchor="middle">{i===0?"Aを加えた直後":"新しい平衡"}</text><IonBox x={90+i*580} y={55} width={340} height={155} ions={counts.map((n,j)=>({label:["A","B","C","D"][j],count:Math.round(n*2),tone:j<2?"#e2d4d0":"#d4e5ef"}))}/><text x={260+i*580} y={245} textAnchor="middle">{counts.map((n,j)=>`${["A","B","C","D"][j]} ${n.toFixed(2)}`).join(" / ")}</text></g>)}<Arrow x1={460} y1={135} x2={640} y2={135}/>
 </Canvas>;
}
export function EquilibriumLesson({view,added,onAdded,notes}:{view:BlankView;added:number;onAdded:(n:number)=>void;notes:string[]}){
 const f=fields.equilibrium,show=view.showAnswers||view.exercise.blankIds.length===0;
 return <><Sheet title="1. 正反応と逆反応 ― 速さと濃度は別のグラフ"><p className="illustrated-caption">A + B ⇄ C + D。初期はA・Bのみ。濃度の図と速さの図を縦に比較してください。</p><EquilibriumGraphs view={view}/><TheoryAnswer field={f.dynamic} view={view}/><TheoryAnswer field={f.constant} view={view}/><p className="illustrated-caption">可逆な素反応の模式モデル。</p>{show&&<p className="illustrated-caption">最終的にA = B = 2、C = D = 1で、濃度は同じではありません。触媒は正逆の速度定数を同じ倍率で大きくする例。点線は早く同じ濃度に到達します。</p>}</Sheet>
 <Sheet title="2. 条件を変えると、どちら向きに応答する？"><div className="theory-controls no-print"><h3>同じ体積で反応物Aだけを加え、直後と平衡後を比べる</h3><label htmlFor="equilibrium-added">加えるAの量 [濃度の任意単位]</label><select id="equilibrium-added" value={added} onChange={e=>onAdded(Number(e.target.value))}>{[0,1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select><output data-equilibrium-output="true">生成物C：{equilibriumAfterAddition(added).c.toFixed(2)} ／ Kc = 0.25</output></div>
 <InteractivePrintPair interactive={<AdditionDiagram added={added}/>} printable={<AdditionDiagram added={1}/>}/><TheoryAnswer field={f.concentration} view={view}/>
 <div className="illustrated-table-scroll"><table className="illustrated-table theory-comparison"><thead><tr><th>変化</th><th>応答の原理</th></tr></thead><tbody><tr><th>容器を圧縮（温度一定）</th><td><TableField field={f.pressure} view={view}/></td></tr><tr><th>加熱／冷却</th><td><TableField field={f.heat} view={view}/></td></tr><tr><th>触媒</th><td><TableField field={f.catalyst} view={view}/></td></tr></tbody></table></div>
 <Canvas title="アンモニア合成の圧力・温度変化" height={255}><text x={550} y={32} textAnchor="middle">N₂ + 3H₂ ⇄ 2NH₃ + 熱（発熱反応）</text><text x={220} y={70} textAnchor="middle">気体の係数の合計 4</text><Arrow x1={410} y1={111} x2={690} y2={111}/><text x={860} y={70} textAnchor="middle">気体の係数の合計 2</text>{["N₂","H₂","H₂","H₂"].map((s,i)=><g key={i}><circle cx={115+i*70} cy={111} r={24} fill="#e2eaf0" stroke="#617b91"/><text x={115+i*70} y={116} textAnchor="middle" className="ion-symbol">{s}</text></g>)}{[0,1].map(i=><g key={i}><circle cx={800+i*90} cy={111} r={24} fill="#e2eaf0" stroke="#617b91"/><text x={800+i*90} y={116} textAnchor="middle" className="ion-symbol">NH₃</text></g>)}{!isMasked(view,f.pressure)&&<text x={550} y={181} textAnchor="middle">圧縮 → 右が有利（少ない側）</text>}{!isMasked(view,f.heat)&&<text x={550} y={226} textAnchor="middle">加熱 → 左 ／ 冷却 → 右。吸熱反応では逆になる</text>}</Canvas>
 <p className="illustrated-caption">粒子数は濃度を丸めた模式記号。数値のKcは追加前後で同じです。圧力の規則は気体の係数で判断し、固体・液体は数えません。等しい気体量の反応では単純な圧縮で移動しません。一定体積で不活性気体だけを加える場合とも区別します。印刷はAを1追加。</p>{show&&<ul className="illustrated-notes theory-notes">{notes.map(n=><li key={n}>{n}</li>)}</ul>}</Sheet></>;
}

const energySpec:PlotSpec={xDomain:[0,1],yDomain:[0,90],xTicks:[0,.25,.5,.75,1],yTicks:[0,20,40,60,80],xLabel:"反応の進行 [任意単位、時間ではない]",yLabel:"エネルギー [任意単位]"};
function CollisionPanels({view}:{view:BlankView}){
 const f=fields.kinetics;
 return <Canvas title="衝突が起こりやすくなる条件" height={480}>
  {[{title:"濃度を上げる",count:12},{title:"温度を上げる",count:6},{title:"固体を細かくする",count:6}].map((s,i)=><g key={s.title} transform={`translate(${i*360} 0)`}><text x={180} y={30} textAnchor="middle">{s.title}</text><IonBox x={40} y={55} width={280} height={150} ions={[{label:"A",count:s.count/2,tone:"#e2d4d0"},{label:"B",count:s.count/2,tone:"#d4e5ef"}]}/>
   {i===0?<><text x={180} y={242} textAnchor="middle">同じ体積に多くの粒子</text><Arrow x1={100} y1={128} x2={160} y2={128}/><Arrow x1={245} y1={128} x2={190} y2={128}/></>:i===1?<><Arrow x1={70} y1={120} x2={165} y2={120}/><Arrow x1={295} y1={155} x2={195} y2={155}/><text x={180} y={242} textAnchor="middle">運動・エネルギー分布が変わる</text></>:<><rect x={60} y={250} width={48} height={48} fill="#c0a991"/>{Array.from({length:8},(_,j)=><rect key={j} x={195+(j%4)*26} y={250+Math.floor(j/4)*30} width={24} height={24} fill="#c0a991"/>)}<Arrow x1={125} y1={275} x2={175} y2={275}/><text x={180} y={329} textAnchor="middle">同じ体積・質量で表面が増える</text></>}
  </g>)}<text x={550} y={402} textAnchor="middle">衝突しても、必ず反応するわけではない</text><text x={550} y={445} textAnchor="middle">{isMasked(view,f.collision)?"何が反応成立の条件になる？":"十分なエネルギー ＋ 適切な向き → 有効な衝突"}</text>
 </Canvas>;
}
export function KineticsLesson({view,notes}:{view:BlankView;notes?:string[]}){
 const f=fields.kinetics,{x,y}=plotCoordinates(energySpec),samples=Array.from({length:101},(_,i)=>i/100);
 return <><Sheet title="1. 衝突の機会と、反応できる衝突を増やす"><CollisionPanels view={view}/><TheoryAnswer field={f.collision} view={view}/><TheoryAnswer field={f.concentration} view={view}/><TheoryAnswer field={f.temperature} view={view}/><TheoryAnswer field={f.surface} view={view}/><p className="illustrated-caption">模式記号の個数・矢印の長さは速度定数を表すものではありません。実際の濃度依存性は反応速度式で決まり、反応式の係数だけから指数は決めません。</p></Sheet>
 <Sheet title="2. 触媒は山を低くする ― 始点と終点は同じ"><Canvas title="触媒あり・なしの反応エネルギー図" height={490}><CartesianPlot spec={energySpec} points={samples.map(s=>[s,activationProfile(s)])}>
  <polyline data-catalyst-profile="true" points={samples.map(s=>`${x(s)},${y(activationProfile(s,true))}`).join(" ")} className="buffer-curve"/>
  <text x={x(.15)} y={y(20)-12}>反応物</text><text x={x(.9)} y={y(10)-15}>生成物</text><text x={x(.5)} y={y(75)-12} textAnchor="middle">遷移状態（山頂）</text>
  <line x1={x(0)} x2={x(.55)} y1={y(20)} y2={y(20)} className="plot-guide"/><line x1={x(.35)} x2={x(.5)} y1={y(75)} y2={y(75)} className="plot-guide"/><line x1={x(.5)} x2={x(.65)} y1={y(45)} y2={y(45)} className="plot-guide"/><Arrow x1={x(.35)} y1={y(20)} x2={x(.35)} y2={y(75)}/><Arrow x1={x(.65)} y1={y(20)} x2={x(.65)} y2={y(45)}/>
  {!isMasked(view,f.catalyst)&&<><text x={x(.02)} y={y(55)}>活性化エネルギー Ea</text><text x={x(.7)} y={y(40)}>触媒ありのEa</text></>}
  <text x={550} y={460} textAnchor="middle">実線：触媒なし ／ 破線：触媒あり</text>
 </CartesianPlot></Canvas><TheoryAnswer field={f.catalyst} view={view}/><TheoryAnswer field={f.heat} view={view}/><p className="illustrated-caption">発熱反応の模式例で、数値は任意単位です。単一の山は簡略化で、実際の触媒反応は複数段階になることがあります。</p>{(view.showAnswers||view.exercise.blankIds.length===0)&&<p className="illustrated-caption">反応物20、生成物10でエネルギー差は−10。山頂は75／45で、正反応の障壁は55／25。逆反応の障壁も65／35と下がります。触媒は平衡位置・反応のエネルギー差を変えません。</p>}{notes&&<p className="illustrated-caption">{notes.join(" ")}</p>}</Sheet></>;
}
