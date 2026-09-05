/** Resolves public files against Vite `base` so `/media/...` works after deploy. */
export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith("data:")) return path;
  const relative = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${relative}`;
}
