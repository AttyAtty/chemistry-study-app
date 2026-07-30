import { electrochemistryCards, type ElectrochemistryCard } from "@/data/electrochemistry";

export type SimulationEffect={type:"electron-flow"|"cation-flow"|"anion-flow"|"gas-bubbles"|"color-change"|"deposit-growth"|"electrode-dissolve"|"precipitation"|"mass-change"|"label";target:string;from?:string;to?:string;species?:string;colorFrom?:string;colorTo?:string;amountDirection?:"increase"|"decrease";note?:string};
export type ElectrochemistrySimulation={id:string;title:string;sourceCardId:string;initialState:{leftElectrodeLabel:string;rightElectrodeLabel:string;solutionLabel:string;solutionColorLeft:string;solutionColorRight:string};timeline:{step:number;description:string;effects:SimulationEffect[]}[]};
const gasNames=["H₂","O₂","Cl₂"];
const depositNames=["Cu","Ag","Na","Pb","PbO₂","PbSO₄"];
const simulationIds=new Set(["volta","daniel","lead-discharge","lead-charge","fuel-acid","water-electrolysis","cuso4-pt","cuso4-cu","nacl-aq","nacl-molten","cucl2-aq","agno3-aq","copper-refining"]);

function effectsFor(card:ElectrochemistryCard):SimulationEffect[]{
 const effects:SimulationEffect[]=[{type:"electron-flow",target:"wire",from:card.mode==="galvanic-cell"?"left":"power",to:card.mode==="galvanic-cell"?"right":"electrodes",note:card.electronFlow},{type:"cation-flow",target:"solution",species:"陽イオン",note:card.ionMovement.join("／")},{type:"anion-flow",target:"solution",species:"陰イオン",note:"電解液中ではイオンが電荷を運ぶ"}];
 card.electrodes.forEach((electrode,index)=>{const target=index===0?"left":"right";electrode.products.forEach(product=>{if(gasNames.some(gas=>product.includes(gas)))effects.push({type:"gas-bubbles",target,species:product,note:`${electrode.label}で${product}発生`});if(depositNames.some(name=>product===name||product.includes(name)))effects.push({type:product.includes("PbSO₄")?"precipitation":"deposit-growth",target,species:product,note:`${electrode.label}表面に${product}生成`});});if(electrode.massChange==="decrease")effects.push({type:"electrode-dissolve",target,amountDirection:"decrease",note:`${electrode.label}の質量減少`});if(electrode.massChange==="increase")effects.push({type:"mass-change",target,amountDirection:"increase",note:`${electrode.label}の質量増加`});});
 if(card.solutionChanges.some(text=>text.includes("青色")||text.includes("色が薄")))effects.push({type:"color-change",target:"solution",colorFrom:"#4aa7e8",colorTo:"#d8effc",amountDirection:"decrease",note:"Cu²⁺減少により青色が薄くなる"});
 if(card.solutionChanges.some(text=>text.includes("酸性")))effects.push({type:"color-change",target:"right-solution",colorFrom:"#d9efff",colorTo:"#ffd9dd",amountDirection:"increase",note:"H⁺が増え酸性が強くなる"});
 if(card.solutionChanges.some(text=>text.includes("塩基性")))effects.push({type:"color-change",target:"left-solution",colorFrom:"#d9efff",colorTo:"#dce6ff",amountDirection:"increase",note:"OH⁻が増え陰極側が塩基性になる"});
 if(card.id==="copper-refining")effects.push({type:"precipitation",target:"anode-bottom",species:"陽極泥（Ag・Auなど）",note:"イオン化しにくい不純物が下にたまる"});
 return effects;
}

export const electrochemistrySimulations:ElectrochemistrySimulation[]=electrochemistryCards.filter(card=>simulationIds.has(card.id)).map(card=>{
 const effects=effectsFor(card),anode=card.electrodes.find(item=>item.electrodeRole==="anode")!,cathode=card.electrodes.find(item=>item.electrodeRole==="cathode")!;
 const groups=[effects.filter(e=>e.type==="label"),effects.filter(e=>e.type==="electrode-dissolve"||e.type==="precipitation"),effects.filter(e=>e.type==="deposit-growth"||e.type==="gas-bubbles"),effects.filter(e=>e.type==="electron-flow"),effects.filter(e=>e.type==="cation-flow"||e.type==="anion-flow"),effects.filter(e=>e.type==="mass-change"||e.type==="color-change")];
 const descriptions=["回路または外部電源を接続する",`陽極で酸化開始：${anode.equation}`,`陰極で還元開始：${cathode.equation}`,"電子が外部回路を移動する","陽イオンと陰イオンが電解液中を移動する","生成物・質量・濃度・色の変化が進む"];
 return{id:`sim-${card.id}`,title:card.name,sourceCardId:card.id,initialState:{leftElectrodeLabel:card.electrodes[0].label,rightElectrodeLabel:card.electrodes[1].label,solutionLabel:card.electrolytes.join("／"),solutionColorLeft:card.id.includes("cuso4")||card.id==="daniel"?"#4aa7e8":"#d9efff",solutionColorRight:card.id.includes("cuso4")||card.id==="daniel"?"#4aa7e8":"#d9efff"},timeline:descriptions.map((description,index)=>({step:index+1,description,effects:groups[index]}))};
});
