/** Individual facts shared by the existing color table and the visual matrix. */
export const precipitateFacts={
  agcl:{formula:"AgCl",color:"白色"},pbcl2:{formula:"PbCl₂",color:"白色"},
  caso4:{formula:"CaSO₄",color:"白色"},srso4:{formula:"SrSO₄",color:"白色"},baso4:{formula:"BaSO₄",color:"白色"},pbso4:{formula:"PbSO₄",color:"白色"},
  feoh2:{formula:"Fe(OH)₂",color:"緑白色"},
} as const;
export const precipitateAnswer=(id:keyof typeof precipitateFacts)=>`${precipitateFacts[id].formula}（${precipitateFacts[id].color}）`;
export const silverChlorideConfirmation="AgClはNH₃水に溶けて[Ag(NH₃)₂]⁺となり、HNO₃で酸性にするとAgClが再沈殿する。";
