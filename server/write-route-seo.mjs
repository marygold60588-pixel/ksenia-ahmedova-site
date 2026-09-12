import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyRouteSeo } from "./page-seo.mjs";

const DIST = path.resolve(process.cwd(), "dist");
const ROUTES = ["/strah-otverzheniya", "/kogda-govoryat-net"];

const html = await readFile(path.join(DIST, "index.html"), "utf8");

for (const route of ROUTES) {
  const out = applyRouteSeo(html, route);
  const dir = path.join(DIST, route.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), out, "utf8");
}
