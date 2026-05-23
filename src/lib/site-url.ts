/**
 * Resolves the public site URL for metadata and JSON-LD.
 * Accepts values with or without a scheme; bare hostnames get https://.
 */
export function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

/** metadataBase / canonical URLs — throws if the resolved value is still invalid. */
export function siteMetadataBase(): URL {
  return new URL(resolveSiteUrl());
}
