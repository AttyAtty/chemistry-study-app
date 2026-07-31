import Link from "next/link";
import { ChemicaLogo } from "@/components/ChemicaLogo";
import { ChemicaStartBackground } from "@/components/ChemicaStartBackground";

export function StartPage() {
  return <main className="start-page">
    <ChemicaStartBackground />
    <section className="start-content" aria-labelledby="start-title">
      <h1 id="start-title" className="start-logo"><ChemicaLogo variant="hero" showTagline /></h1>
      <Link className="start-button" href="/home">始める</Link>
    </section>
  </main>;
}
