import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { illustratedLessons } from "@/data/illustrated/types";
import { IllustratedLesson } from "@/components/illustrated/IllustratedLesson";
import { inorganicLessons } from "@/data/illustrated/inorganicTypes";
import { inorganicMaterial } from "@/data/illustrated/inorganic";
import { InorganicLesson } from "@/components/illustrated/InorganicLesson";
import { theoryLessons } from "@/data/illustrated/theory";
import { theoryChemistryUnit } from "@/data/theoryChemistry";
import { TheoryLesson } from "@/components/illustrated/TheoryLesson";
import "@/components/separation/separation.css";
import "@/components/illustrated/illustrated.css";

export const dynamicParams=false;
export function generateStaticParams() {return [...illustratedLessons,...inorganicLessons,...theoryLessons].map(l=>({slug:l.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params;return {title:[...illustratedLessons,...inorganicLessons,...theoryLessons].find(l=>l.slug===slug)?.title??"図で理解する化学"};
}
export default async function IllustratedPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const theory=theoryLessons.find(l=>l.slug===slug);
  if(theory){const section=theoryChemistryUnit.sections.find(s=>s.id==="solubility");const notes=section?.kind==="cards"?section.entries.filter(e=>["再結晶と析出量","水和物の問題"].includes(e.learningId??"")).map(e=>e.body):[];return <main className="page-container illustrated-page"><TheoryLesson slug={theory.slug} notes={notes}/></main>;}
  const inorganic=inorganicLessons.find(l=>l.slug===slug);
  if(inorganic)return <main className="page-container illustrated-page"><InorganicLesson data={inorganicMaterial(inorganic.slug)}/></main>;
  const lesson=illustratedLessons.find(l=>l.slug===slug);
  if(!lesson)notFound();
  return <main className="page-container illustrated-page"><IllustratedLesson slug={lesson.slug}/></main>;
}
