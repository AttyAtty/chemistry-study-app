import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchRoute } from "@/components/SearchRoute";
export const metadata: Metadata = { title: "全体検索" };
export default function SearchPage() { return <Suspense fallback={<main className="page-container"><p role="status">検索を準備しています</p></main>}><SearchRoute /></Suspense>; }
