import type { AnswerField } from "./types";
import type { GasData } from "../gases";
import type { ElectrochemistryCard } from "../electrochemistry";

export const inorganicLessons = [
  {slug:"ionization",title:"イオン化傾向を図で理解",description:"序列と水・酸・金属イオンとの反応を結び付ける。"},
  {slug:"flame-tests",title:"炎色反応を図で理解",description:"元素・炎の色・色名を対応させて覚える。"},
  {slug:"precipitates",title:"沈殿・確認反応を図で理解",description:"陽イオンと試薬の組合せをマトリクスで比べる。"},
  {slug:"gases",title:"気体を図で理解",description:"溶解性・密度から捕集法を選び、製法につなげる。"},
  {slug:"electrochemistry",title:"電池・電気分解を図で理解",description:"電極の反応と電子・イオンの移動を追う。"},
] as const;
export type InorganicSlug=typeof inorganicLessons[number]["slug"];
export type ReactionBand={id:string;start:number;end:number;answer:AnswerField;note:string};
export type Flame={id:string;element:AnswerField;color:AnswerField;paint:string};
export type PrecipitateCell={id:string;status:"precipitate"|"none"|"not-covered";answer?:AnswerField;note?:string;source:string};
export type MatrixRow={id:string;ion:AnswerField;cells:PrecipitateCell[]};
export type GasLesson={source:GasData;name:AnswerField;collection:AnswerField;preparation:AnswerField;detection:AnswerField;method:"water"|"up"|"down";heated:boolean};
export type CellLesson={source:ElectrochemistryCard;electron:AnswerField;ions:AnswerField[];electrodes:{label:AnswerField;redox:AnswerField;equation:AnswerField;mass:AnswerField}[]};
export type InorganicMaterial={slug:InorganicSlug;fields:AnswerField[];notes:string[];elements?:AnswerField[];bands?:ReactionBand[];flames?:Flame[];matrix?:MatrixRow[];reagents?:AnswerField[];confirmations?:{id:string;input:AnswerField;operation:AnswerField;result:AnswerField}[];gases?:GasLesson[];cells?:CellLesson[]};
