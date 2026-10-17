/** Map links are validated locally; we never fetch a URL supplied by a user. */
const hosts = new Set(["www.google.com", "google.com", "maps.google.com"]);

function parse(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (value.length > 8192 || url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return null;
    return url;
  } catch { return null; }
}

export function normalizeMapEmbed(value: string): string | null {
  if (!value.trim()) return "";
  const source = value.trim().startsWith("<")
    ? value.match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, "&") ?? ""
    : value;
  const url = parse(source);
  return url && hosts.has(url.hostname) && url.pathname === "/maps/embed" && url.search.startsWith("?pb=")
    ? url.href : null;
}

export function normalizeMapsLink(value: string): string | null {
  if (!value.trim()) return "";
  const url = parse(value);
  if (!url) return null;
  const regular = hosts.has(url.hostname) && (url.pathname === "/maps" || url.pathname.startsWith("/maps/"));
  const short = url.hostname === "maps.app.goo.gl" || (url.hostname === "goo.gl" && url.pathname.startsWith("/maps/"));
  return regular || short ? url.href : null;
}

export function directionsUrl(address: string, mapsUrl?: string | null): string {
  return (mapsUrl && normalizeMapsLink(mapsUrl)) || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function safeWebsite(value?: string | null): string | undefined {
  if (!value) return undefined;
  const candidate = value.includes(":") ? value : `https://${value}`;
  return parse(candidate)?.href;
}
