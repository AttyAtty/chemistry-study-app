import type { Metadata } from "next";
import { LearningDataSettings } from "@/components/LearningDataSettings";
export const metadata: Metadata = { title: "ログイン・データ保存" };
export default function DataSettingsPage() { return <LearningDataSettings />; }
