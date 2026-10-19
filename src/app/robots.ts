import type { MetadataRoute } from "next";
import { absoluteAppUrl } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/settings/", "/progress", "/quiz", "/auth/", "/api/"] }, sitemap: absoluteAppUrl("/sitemap.xml") };
}
