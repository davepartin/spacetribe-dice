/** Prefix app paths with the GitHub Pages basePath when present. */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!path.startsWith("/")) return path;
  if (!base) return path;
  if (path === "/") return `${base}/`;
  return `${base}${path}`;
}

/** Absolute invite / share URL for the current origin + basePath. */
export function absoluteAppUrl(path: string): string {
  const prefixed = withBasePath(path);
  if (typeof window === "undefined") return prefixed;
  return `${window.location.origin}${prefixed}`;
}
