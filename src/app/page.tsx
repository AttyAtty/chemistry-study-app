import { HomeClient } from "@/components/HomeClient";
import { chemistryUnits } from "@/data/chemistry";

export default function Home() {
  return (
    <main className="page-container home-page">
      <HomeClient units={chemistryUnits} />
    </main>
  );
}
