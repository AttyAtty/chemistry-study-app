import type { Metadata } from "next";
import { DiagramHub } from "@/components/DiagramHub";
import "@/components/illustrated/illustrated.css";
import "@/components/illustrated/diagram-hub.css";

export const metadata: Metadata = {
  title: "図で理解する化学",
  description: "理論・無機・有機の図解教材を分野から探せます。",
  alternates: { canonical: "/illustrated" },
  openGraph: { url: "/illustrated" },
};

export default function IllustratedHubPage() { return <DiagramHub />; }
