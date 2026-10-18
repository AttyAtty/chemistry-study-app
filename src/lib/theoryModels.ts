import { solubilityPoints, theoryFields, type TheorySlug } from "../data/illustrated/theory";
import {formulaTargetsForLesson} from "../data/illustrated/formulas";
export function solubilityAt(temperature:number) {
 const t=Math.max(0,Math.min(100,temperature));
 for(let i=1;i<solubilityPoints.length;i++){const [x,y]=solubilityPoints[i], [px,py]=solubilityPoints[i-1];if(t<=x)return py+(y-py)*(t-px)/(x-px);}
 return solubilityPoints.at(-1)![1];
}
export function dissolvedMass(temperature:number,waterMass:number){return solubilityAt(temperature)*waterMass/100;}
export function crystalMass(hot:number,cold:number,waterMass:number){return Math.max(0,dissolvedMass(hot,waterMass)-dissolvedMass(cold,waterMass));}
/** Illustrative monotone curve anchored at 1 atm and 100 °C; NOT water vapor-pressure data. */
export function vaporPressureAt(temperature:number){return 101.325*Math.exp((temperature-100)/30);}
export function boilingTemperature(externalPressure:number){if(externalPressure<=0)throw new RangeError("Pressure must be positive");return 100+30*Math.log(externalPressure/101.325);}
/** A fixed illustrative solvent sample at fixed temperature: k = 2 mmol/atm. */
export function henryAmount(partialPressure:number){return 2*partialPressure;}
export function graphScale(domain:[number,number],range:[number,number]){return (value:number)=>range[0]+(value-domain[0])*(range[1]-range[0])/(domain[1]-domain[0]);}
export const theoryModes=[{id:"learn",label:"通常表示"},{id:"all",label:"全体穴埋め"},{id:"concepts",label:"現象・用語を確認"},{id:"calculations",label:"計算・関係式を確認"}] as const;
export function createTheoryExercise(slug:TheorySlug,mode:string){return {blankIds:[...Object.values(theoryFields[slug]),...formulaTargetsForLesson(slug)].filter(f=>mode==="all"||(mode==="concepts"&&f.blankCategory==="concept")||(mode==="calculations"&&f.blankCategory==="calculation")).map(f=>f.id)};}
