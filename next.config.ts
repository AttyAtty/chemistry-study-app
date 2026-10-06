import type { NextConfig } from "next";
import { PWA_BUILD_ID } from "./src/lib/pwaBuild";
const nextConfig: NextConfig = {
  generateBuildId: async () => PWA_BUILD_ID,
  async headers() { return [{ source: "/sw.js", headers: [
    { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
    { key: "Content-Type", value: "application/javascript; charset=utf-8" },
    { key: "Service-Worker-Allowed", value: "/" },
    { key: "X-Content-Type-Options", value: "nosniff" },
  ] }]; },
};
export default nextConfig;
