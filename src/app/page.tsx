import { StartPage } from "@/components/StartPage";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/" } };

export default function Page() {
  return <StartPage />;
}
