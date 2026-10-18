import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { illustratedLessons } from "@/data/illustrated/types";
import { IllustratedLesson } from "@/components/illustrated/IllustratedLesson";
import { inorganicLessons } from "@/data/illustrated/inorganicTypes";
import { inorganicMaterial } from "@/data/illustrated/inorganic";
import { InorganicLesson } from "@/components/illustrated/InorganicLesson";
import "@/components/separation/separation.css";
import "@/components/illustrated/illustrated.css";

export const dynamicParams=false;
export function generateStaticParams() {return [...illustratedLessons,...inorganicLessons].map(l=>({slug:l.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params;return {title:[...illustratedLessons,...inorganicLessons].find(l=>l.slug===slug)?.title??"図で理解する化学"};
}
export default async function IllustratedPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const inorganic=inorganicLessons.find(l=>l.slug===slug);
  if(inorganic)return <main className="page-container illustrated-page"><InorganicLesson data={inorganicMaterial(inorganic.slug)}/></main>;
  const lesson=illustratedLessons.find(l=>l.slug===slug);
  if(!lesson)notFound();
  return <main className="page-container illustrated-page"><IllustratedLesson slug={lesson.slug}/></main>;
}
