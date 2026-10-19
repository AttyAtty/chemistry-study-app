import type { Metadata } from "next";
import "@/components/separation/separation.css";
import { notFound } from "next/navigation";
import { StudyLink } from "@/components/StudyLink";
import { SeparationDiagram } from "@/components/separation/SeparationDiagram";
import { separationDiagrams } from "@/data/separation/diagrams";

export const dynamicParams = false;
export function generateStaticParams() { return separationDiagrams.map(diagram=>({slug:diagram.id})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params;
  return { title: slug, alternates: { canonical: "/separation/" + slug }, openGraph: { url: "/separation/" + slug } };
}
export default async function SeparationPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const diagram=separationDiagrams.find(diagram=>diagram.id===slug);
  if(!diagram) notFound();
  const organic=diagram.id==="aromatic-separation";
  return <main className="page-container separation-page">
    <StudyLink className="back-link" href={`/units/${organic?"organic-reactions":"inorganic-reactions"}`}>← {organic?"有機化学":"無機化学"}の教材へ</StudyLink>
    <header className="unit-content-heading"><p className="eyebrow">SEPARATION / ANALYSIS</p><h1>{diagram.title}</h1><p>{diagram.description}</p></header>
    <div className="separation-practice-entry"><StudyLink className="button primary" href={`/separation/practice?diagram=${diagram.id}`}>練習問題を作る</StudyLink></div>
    <SeparationDiagram diagram={diagram}/>
  </main>;
}
