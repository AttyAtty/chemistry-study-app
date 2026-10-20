import type {Metadata} from "next";
import {FormulaCatalogue} from "@/components/illustrated/FormulaCatalogue";
import "@/components/separation/separation.css";
import "@/components/illustrated/illustrated.css";
export const metadata:Metadata={alternates:{canonical:"/theory/formulas"},openGraph:{url:"/theory/formulas"},title:"理論化学 重要公式まとめ"};
export default function FormulasPage(){return <main className="page-container illustrated-page"><FormulaCatalogue/></main>;}
