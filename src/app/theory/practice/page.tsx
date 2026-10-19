import type { Metadata } from "next";
import { TheoryPractice } from "@/components/illustrated/TheoryPractice";
import "@/components/illustrated/illustrated.css";
import "@/components/illustrated/theory-practice.css";

export const metadata: Metadata = { title: "理論化学 典型例題・練習問題" };
export default function TheoryPracticePage(){return <TheoryPractice/>;}
