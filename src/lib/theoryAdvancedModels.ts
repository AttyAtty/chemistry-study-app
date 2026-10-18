export const KW25=1e-14;
export function hydrogenAt(pH:number){return 10**-pH;}
export function hydroxideAt(pH:number){return KW25/hydrogenAt(pH);}
export type TitrationConfig={system:"strong-acid-strong-base";acidMolarity:number;acidVolumeMl:number;baseMolarity:number};
export const standardTitration:TitrationConfig={system:"strong-acid-strong-base",acidMolarity:.1,acidVolumeMl:25,baseMolarity:.1};
export function equivalenceVolume(c:TitrationConfig=standardTitration){return c.acidMolarity*c.acidVolumeMl/c.baseMolarity;}
/** Charge balance including water ionization. Ideal concentrations at 25 °C. */
export function titrationPH(volumeMl:number,c:TitrationConfig=standardTitration){
 if(volumeMl<0)throw new RangeError("Negative titrant volume");
 const excess=(c.acidMolarity*c.acidVolumeMl-c.baseMolarity*volumeMl)/(c.acidVolumeMl+volumeMl);
 const root=Math.sqrt(excess*excess+4*KW25);
 const h=excess>=0?(excess+root)/2:2*KW25/(root-excess);
 return -Math.log10(h);
}
export const titrationVolumes=[...Array.from({length:25},(_,i)=>i),24.5,24.9,24.99,24.999,25,25.001,25.01,25.1,25.5,...Array.from({length:25},(_,i)=>i+26)];
/** HA and A− initially 5 mmol each in 100 mL; small H+ additions, pKa=4.76 illustrative. */
export function bufferPH(acidMmol:number){if(Math.abs(acidMmol)>=5)throw new RangeError("Buffer component exhausted");return 4.76+Math.log10((5-acidMmol)/(5+acidMmol));}
export function waterWithAcidPH(acidMmol:number){const d=acidMmol/100,root=Math.sqrt(d*d+4*KW25);return -Math.log10(d>=0?(d+root)/2:2*KW25/(root-d));}
/** A+B⇄C+D with equal A/B and equal C/D, elementary illustrative reversible kinetics. */
export function equilibriumAt(time:number,catalyzed=false){const u=Math.exp(-1.2*(catalyzed?3:1)*time),c=3*(1-u)/(3+u),a=3-c,rate=catalyzed?3:1;return {a,b:a,c,d:c,forward:rate*.1*a*a,reverse:rate*.4*c*c};}
export function equilibriumAfterAddition(added:number){if(added<0)throw new RangeError("Add a non-negative amount");const b=12+added,shift=4*added/(Math.sqrt(b*b+24*added)+b);return {a:2+added-shift,b:2-shift,c:1+shift,d:1+shift,shift};}
export function activationProfile(progress:number,catalyzed=false){const peak=catalyzed?45:75,endpoint=progress<=.5?20:10;return endpoint+(peak-endpoint)*Math.sin(Math.PI*progress)**2;}
