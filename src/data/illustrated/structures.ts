import type { Atom, MolecularDrawing } from "./types";

/** Authored molecular graphs. Coordinates and chemistry live outside React. */
function graph(id:string,width:number,height:number): MolecularDrawing { return {id,width,height,atoms:[],bonds:[]}; }
function atom(g:MolecularDrawing,id:string,label:string,x:number,y:number,role?:Atom["role"]) {
  g.atoms.push({id,label,x,y,role}); return id;
}
function bond(g:MolecularDrawing,from:string,to:string,order:1|2|3=1) { g.bonds.push({id:`${from}-${to}`,from,to,order}); }
function chain(g:MolecularDrawing,items:[string,number,number,Atom["role"]?][],orders:(1|2|3)[] = []) {
  items.forEach(([label,x,y,role],i)=>{atom(g,`c${i}`,label,x,y,role);if(i)bond(g,`c${i-1}`,`c${i}`,orders[i-1]??1);});
}
function benzene(g:MolecularDrawing,prefix:string,cx:number,cy:number,r:number,rotation=0) {
  for(let i=0;i<6;i++) { const angle=rotation+i*Math.PI/3; atom(g,`${prefix}${i}`,"",cx+r*Math.cos(angle),cy+r*Math.sin(angle)); }
  for(let i=0;i<6;i++) bond(g,`${prefix}${i}`,`${prefix}${(i+1)%6}`,i%2===0 ? 2 : 1);
}
export function vinyl(id:string,substituent:string,repeat=false,fluorinated=false) {
  const g=graph(id,320,220);
  chain(g,[[fluorinated ? "CF₂" : "CH₂",95,65],[fluorinated ? "CF₂" : substituent ? "CH" : "CH₂",205,65]],[repeat?1:2]);
  if(substituent === "phenyl") { benzene(g,"ring",205,157,35,-Math.PI/2); bond(g,"c1","ring0"); }
  else if(substituent) {atom(g,"sub",substituent,205,135);bond(g,"c1","sub");}
  if(repeat) {
    atom(g,"start","",5,65);atom(g,"end","",305,65);bond(g,"start","c0");bond(g,"c1","end");
    g.repeat={left:35,right:275,top:28,bottom:substituent==="phenyl" ? 205 : 160};
  }
  return g;
}
export const terephthalicAcid=graph("terephthalic-acid-structure",420,145);
benzene(terephthalicAcid,"ring",210,80,44);
for(const [side,x,ring,hydroxyX] of [["left",110,"ring3",30],["right",310,"ring0",390]] as const) {
  atom(terephthalicAcid,side,"C",x,80,"reactive");atom(terephthalicAcid,`${side}-o`,"O",x,20,"reactive");
  atom(terephthalicAcid,`${side}-oh`,side==="left" ? "HO" : "OH",hydroxyX,80,"reactive");
  bond(terephthalicAcid,ring,side);bond(terephthalicAcid,side,`${side}-o`,2);bond(terephthalicAcid,side,`${side}-oh`);
}
export const ethyleneGlycol=graph("ethylene-glycol-structure",420,145);
chain(ethyleneGlycol,[["HO",35,80,"reactive"],["CH₂",145,80],["CH₂",265,80],["OH",385,80,"reactive"]]);
export const adipicAcid=graph("adipic-acid-structure",420,145);
chain(adipicAcid,[["HO",30,80,"reactive"],["C",105,80,"reactive"],["(CH₂)₄",210,80],["C",315,80,"reactive"],["OH",390,80,"reactive"]]);
for(const [id,x] of [["c1",105],["c3",315]] as const) {atom(adipicAcid,`${id}-o`,"O",x,20,"reactive");bond(adipicAcid,id,`${id}-o`,2);}
export const hexamethylenediamine=graph("hexamethylenediamine-structure",420,145);
chain(hexamethylenediamine,[["H₂N",35,80,"reactive"],["(CH₂)₆",210,80],["NH₂",385,80,"reactive"]]);
export const petRepeat=graph("pet-repeat",650,160);
chain(petRepeat,[["",5,80],["O",60,80,"linkage"],["CH₂",125,80],["CH₂",195,80],["O",260,80,"linkage"],["C",315,80,"linkage"]]);
benzene(petRepeat,"ring",420,80,44);bond(petRepeat,"c5","ring3");
atom(petRepeat,"carbonyl","C",530,80,"linkage");bond(petRepeat,"ring0","carbonyl");
atom(petRepeat,"end","",645,80);bond(petRepeat,"carbonyl","end");
for(const [id,x] of [["c5",315],["carbonyl",530]] as const) {atom(petRepeat,`${id}-o`,"O",x,20,"linkage");bond(petRepeat,id,`${id}-o`,2);}
petRepeat.repeat={left:30,right:610,top:5,bottom:145};
export const nylon66Repeat=graph("nylon66-repeat",650,160);
chain(nylon66Repeat,[["",5,80],["NH",60,80,"linkage"],["(CH₂)₆",165,80],["NH",260,80,"linkage"],["C",335,80,"linkage"],["(CH₂)₄",435,80],["C",540,80,"linkage"],["",645,80]]);
for(const [id,x] of [["c4",335],["c6",540]] as const) {atom(nylon66Repeat,`${id}-o`,"O",x,20,"linkage");bond(nylon66Repeat,id,`${id}-o`,2);}
nylon66Repeat.repeat={left:30,right:610,top:5,bottom:145};
export const phenol=graph("phenol-structure",260,220);
benzene(phenol,"ring",130,125,50,-Math.PI/2);atom(phenol,"hydroxy","OH",130,25,"reactive");bond(phenol,"hydroxy","ring0");
export const formaldehyde=graph("formaldehyde-structure",260,150);
chain(formaldehyde,[["H",35,85],["C",130,85,"reactive"],["H",225,85]]);atom(formaldehyde,"oxygen","O",130,20,"reactive");bond(formaldehyde,"c1","oxygen",2);
export const urea=graph("urea-structure",300,150);
chain(urea,[["H₂N",35,85,"reactive"],["C",150,85],["NH₂",265,85,"reactive"]]);atom(urea,"oxygen","O",150,20);bond(urea,"c1","oxygen",2);
export const melamine=graph("melamine-structure",320,240);
for(let i=0;i<6;i++) {const a=-Math.PI/2+i*Math.PI/3;atom(melamine,`ring${i}`,i%2 ? "N" : "C",160+55*Math.cos(a),120+55*Math.sin(a));}
for(let i=0;i<6;i++)bond(melamine,`ring${i}`,`ring${(i+1)%6}`,i%2 ? 1:2);
for(const i of [0,2,4]) { const a=-Math.PI/2+i*Math.PI/3;atom(melamine,`amino${i}`,"NH₂",160+108*Math.cos(a),120+108*Math.sin(a),"reactive");bond(melamine,`ring${i}`,`amino${i}`); }
export const caprolactam=graph("caprolactam-structure",320,240);
for(let i=0;i<7;i++) {const a=-Math.PI/2+i*2*Math.PI/7;atom(caprolactam,`ring${i}`,i===0 ? "C" : i===1 ? "NH" : "CH₂",160+75*Math.cos(a),135+75*Math.sin(a),i<2?"reactive":undefined);}
for(let i=0;i<7;i++)bond(caprolactam,`ring${i}`,`ring${(i+1)%7}`);
atom(caprolactam,"oxygen","O",160,15,"reactive");bond(caprolactam,"ring0","oxygen",2);
export const nylon6Repeat=graph("nylon6-repeat",420,150);
chain(nylon6Repeat,[["",5,80],["NH",65,80,"linkage"],["(CH₂)₅",195,80],["C",315,80,"linkage"],["",415,80]]);atom(nylon6Repeat,"oxygen","O",315,20,"linkage");bond(nylon6Repeat,"c3","oxygen",2);nylon6Repeat.repeat={left:30,right:385,top:5,bottom:140};
export function diene(id:string,isoprene:boolean,repeat=false) {
  const g=graph(id,420,180);
  chain(g,[["CH₂",65,90],[isoprene?"C":"CH",165,90],["CH",265,90],["CH₂",365,90]],repeat?[1,2,1]:[2,1,2]);
  if(isoprene){atom(g,"methyl","CH₃",165,25);bond(g,"c1","methyl");}
  if(repeat){atom(g,"start","",5,90);atom(g,"end","",415,90);bond(g,"start","c0");bond(g,"c3","end");g.repeat={left:30,right:390,top:5,bottom:155};}
  return g;
}
