import { field, type Sugar, type SugarRing, type SugarRingAtom, type SugarRingGroup } from "./types";

// Standard Haworth orientation: ring O at the back, front C–C bonds drawn thicker.
const hexagon=(firstCarbon:number):SugarRingAtom[]=>[
  {id:"o",label:"O",x:250,y:105},
  ...[[300,185],[240,255],[130,255],[70,185],[130,105]].map(([x,y],i)=>({id:`c${firstCarbon+i}`,label:"C" as const,x,y,carbonNumber:firstCarbon+i})),
];
const group=(carbon:number,label:SugarRingGroup["label"],direction:SugarRingGroup["direction"],x:number,y:number,carbonNumber?:number):SugarRingGroup=>({
  id:`c${carbon}-${direction}`,from:`c${carbon}`,label,direction,x,y,carbonNumber,
});
function aldopyranose(id:"glucose"|"galactose"):Sugar["cyclic"] {
  const galactose=id==="galactose";
  const groups=[
    group(1,"H","up",300,125),group(1,"OH","down",300,247),
    group(2,"H","up",240,195),group(2,"OH","down",240,323),
    group(3,"OH","up",130,195),group(3,"H","down",130,323),
    group(4,galactose?"OH":"H","up",70,125),group(4,galactose?"H":"OH","down",70,247),
    group(5,"CH₂OH","up",130,38,6),group(5,"H","down",130,151),
  ];
  const differenceId=galactose?"c4-up":"c4-down";
  groups.find(g=>g.id===differenceId)!.answer=field(`${id}:group:c4-oh`,"OH","structure-label");
  return {
    primary:{id:`${id}-alpha-pyranose`,ringSize:6,form:"pyranose",anomer:"α",atoms:hexagon(1),groups,
      frontEdges:[["c4","c3"],["c3","c2"]],anomericAtomId:"c1",highlightedAtoms:["c4"],highlightedGroups:[differenceId]},
    configuration:field(`${id}:configuration`,galactose?"C4のOHは上":"C4のOHは下","stereochemistry"),
    anomericPosition:field(`${id}:anomeric-position`,"C1","anomeric-position"),
  };
}
const fructoseOh=field("fructose:group:c2-oh","OH","structure-label");
const fructoseFuranose:SugarRing={
  id:"fructose-beta-furanose",ringSize:5,form:"furanose",anomer:"β",
  atoms:[{id:"o",label:"O",x:195,y:95},{id:"c2",label:"C",carbonNumber:2,x:290,y:165},{id:"c3",label:"C",carbonNumber:3,x:245,y:255},{id:"c4",label:"C",carbonNumber:4,x:125,y:255},{id:"c5",label:"C",carbonNumber:5,x:80,y:165}],
  groups:[
    {...group(2,"OH","up",290,102),answer:fructoseOh},group(2,"CH₂OH","down",330,235,1),
    group(3,"OH","up",245,195),group(3,"H","down",245,323),
    group(4,"H","up",125,195),group(4,"OH","down",125,323),
    group(5,"CH₂OH","up",80,90,6),group(5,"H","down",80,227),
  ],
  frontEdges:[["c4","c3"]],anomericAtomId:"c2",highlightedAtoms:["c2"],highlightedGroups:["c2-up","c2-down","c5-up"],
};
const fructosePyranose:SugarRing={
  id:"fructose-beta-pyranose",ringSize:6,form:"pyranose",anomer:"β",atoms:hexagon(2),
  groups:[
    {...group(2,"OH","up",300,125),answer:fructoseOh},group(2,"CH₂OH","down",330,247,1),
    group(3,"OH","up",240,195),group(3,"H","down",240,323),
    group(4,"H","up",130,195),group(4,"OH","down",130,323),
    group(5,"H","up",70,125),group(5,"OH","down",70,247),
    group(6,"H","up",130,38),group(6,"H","down",130,151),
  ],frontEdges:[["c5","c4"],["c4","c3"]],anomericAtomId:"c2",highlightedAtoms:["c2"],highlightedGroups:["c2-up","c2-down"],
};
export const sugarCyclicStructures:Record<string,NonNullable<Sugar["cyclic"]>>={
  glucose:aldopyranose("glucose")!,galactose:aldopyranose("galactose")!,
  fructose:{primary:fructoseFuranose,alternative:fructosePyranose,
    configuration:field("fructose:configuration","C2のOHは上（β形）","stereochemistry"),
    anomericPosition:field("fructose:anomeric-position","C2","anomeric-position")},
};
export const defaultSugarStructureOptions={showCarbonNumbers:true,showDifferenceHints:true,fructoseRing:"furanose" as const};
export function selectedSugarRing(sugar:Sugar,variant:"furanose"|"pyranose"="furanose") {
  return sugar.cyclic?.alternative?.form===variant ? sugar.cyclic.alternative : sugar.cyclic?.primary;
}
