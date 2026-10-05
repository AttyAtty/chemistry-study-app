import type { Metadata } from "next";
import { LearningDataSettings } from "@/components/LearningDataSettings";
export const metadata: Metadata = { title: "学習データのバックアップ" };
export default function DataSettingsPage() { return <LearningDataSettings />; }
