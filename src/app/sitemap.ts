import type { MetadataRoute } from "next";
import { chemistryUnits } from "@/data/chemistry";
import { theoryLessons } from "@/data/illustrated/theory";
import { inorganicLessons } from "@/data/illustrated/inorganicTypes";
import { illustratedLessons } from "@/data/illustrated/types";
import { absoluteAppUrl } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = ["/", "/home", "/illustrated", "/courses/chemistry-basic", "/search", "/theory/formulas", "/privacy"];
  const contentPaths = [
    ...chemistryUnits.map((unit) => `/units/${unit.slug}`),
    ...[...theoryLessons, ...inorganicLessons, ...illustratedLessons].map((lesson) => `/illustrated/${lesson.slug}`),
    "/separation/metal-analysis", "/separation/aromatic-separation",
  ];
  return [...new Set([...publicPaths, ...contentPaths])].map((path) => ({ url: absoluteAppUrl(path), changeFrequency: "monthly", priority: path === "/" || path === "/illustrated" ? 1 : 0.7 }));
}
