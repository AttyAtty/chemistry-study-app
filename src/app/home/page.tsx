import { HomeClient } from "@/components/HomeClient";
import { chemistryUnits } from "@/data/chemistry";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "学習ホーム", alternates: { canonical: "/home" }, openGraph: { url: "/home" } };

export default function LearningHome() {
  return <main className="page-container home-page"><HomeClient units={chemistryUnits}/></main>;
}
