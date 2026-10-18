/** 298 K representative values, kJ/mol. States are essential. OpenStax Chemistry 2e §5.3. */
export const formationEnthalpies={h2:0,o2:0,carbon:0,waterLiquid:-285.8,carbonMonoxide:-110.5,carbonDioxide:-393.5} as const;
/** Average gas-phase bond energies, kJ/mol of bonds: approximate, not formation enthalpies. */
export const bondEnergies={hh:436,clcl:243,hcl:432} as const;
export const thermoSources=[{title:"OpenStax：エンタルピーとヘスの法則",url:"https://openstax.org/books/chemistry-2e/pages/5-3-enthalpy"},{title:"OpenStax：結合エネルギー",url:"https://openstax.org/books/chemistry-2e/pages/7-5-strengths-of-ionic-and-covalent-bonds"}];
