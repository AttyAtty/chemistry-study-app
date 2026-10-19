function originFrom(value: string): string {
  const candidate = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
  const url = new URL(candidate);
  if (url.protocol !== "https:" && url.hostname !== "localhost") throw new Error("Public app URL must use HTTPS outside localhost.");
  return url.origin;
}

/** Set NEXT_PUBLIC_APP_URL when the canonical production domain is ready. */
export const APP_ORIGIN = (() => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return originFrom(configured);
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return originFrom(vercelHost);
  return "http://localhost:3000";
})();

export function absoluteAppUrl(path = "/") {
  return new URL(path, `${APP_ORIGIN}/`).toString();
}
