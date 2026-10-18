import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { illustratedLessons } from "@/data/illustrated/types";
import { IllustratedLesson } from "@/components/illustrated/IllustratedLesson";
import "@/components/separation/separation.css";
import "@/components/illustrated/illustrated.css";

export const dynamicParams=false;
export function generateStaticParams() {return illustratedLessons.map(l=>({slug:l.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params;return {title:illustratedLessons.find(l=>l.slug===slug)?.title??"図で理解する化学"};
}
export default async function IllustratedPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const lesson=illustratedLessons.find(l=>l.slug===slug);
  if(!lesson)notFound();
  return <main className="page-container illustrated-page"><IllustratedLesson slug={lesson.slug}/></main>;
}
