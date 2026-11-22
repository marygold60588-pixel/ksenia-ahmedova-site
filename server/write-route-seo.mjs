import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyRouteSeo } from "./page-seo.mjs";
import {
  LIBRARY_ARTICLE_HTML,
  LIBRARY_PAGE_SEO,
  LIBRARY_PRACTICE_CTA,
  LIBRARY_PUBLISHED_SLUGS,
  LIBRARY_RELATED_CARDS,
} from "./library-seo.generated.mjs";

const DIST = path.resolve(process.cwd(), "dist");
const ROUTES = [
  "/articles",
  "/strah-otverzheniya",
  "/boyus-prosit",
  "/strah-otkaza-i-ugozhdenie",
  "/posle-otkaza-hochu-ischeznut",
  "/pochemu-ya-uchityvayu-chuzhie-zhelaniya",
  "/pochemu-ya-zhdu-ot-muzha",
  "/kogda-govoryat-net",
  "/praktika-ne-otkazyvatsya-ot-sebya",
  ...LIBRARY_PUBLISHED_SLUGS.map((slug) => `/${slug}`),
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function relatedHtml(slug) {
  const cards = LIBRARY_RELATED_CARDS[slug] || [];
  if (!cards.length) return "";
  return `
    <section class="library-related" aria-label="Возможно, вам будет интересно">
      <p class="kicker">Возможно, вам будет интересно</p>
      <div class="library-related-grid">
        ${cards
          .map(
            (item) => `<a class="library-related-card" href="/${escapeHtml(item.slug)}">
          <div class="library-related-cover">
            <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.coverAlt || item.h1)}" width="640" height="360" />
          </div>
          <h3>${escapeHtml(item.h1)}</h3>
        </a>`,
          )
          .join("")}
      </div>
    </section>`;
}

function practiceHtml(slug) {
  const cta = LIBRARY_PRACTICE_CTA[slug];
  if (!cta) return "";
  return `
    <section class="article-next">
      <p class="kicker">Дальше</p>
      <h2>Пройти бесплатную практику</h2>
      <p class="article-next-cta">
        <a class="btn btn-solid" href="${escapeHtml(cta.href)}">Пройти бесплатную практику</a>
      </p>
    </section>`;
}

function injectLibraryArticle(html, slug) {
  const seo = LIBRARY_PAGE_SEO[`/${slug}`];
  const body = LIBRARY_ARTICLE_HTML[slug];
  if (!seo || !body) return html;

  const cover = seo.ogImage.replace("https://ksenia-ahmedova.ru", "");
  const ssr = `
<article id="library-ssr" class="article-page library-ssr" data-slug="${escapeHtml(slug)}">
  <header class="article-hero">
    <div class="article-hero-copy">
      <p class="kicker kicker-light">Статья</p>
      <h1 class="article-title">${escapeHtml(seo.jsonLd.headline)}</h1>
      <p class="article-byline">${escapeHtml(seo.jsonLd.author.name)} · врач-психотерапевт</p>
      <div class="article-lead"><p>${escapeHtml(seo.description)}</p></div>
    </div>
  </header>
  <div class="article-body">
    <figure class="library-cover"><img src="${escapeHtml(cover)}" alt="" width="1600" height="900" /></figure>
    <div class="library-article-body">${body}</div>
    ${relatedHtml(slug)}
    ${practiceHtml(slug)}
  </div>
</article>`;

  if (html.includes('id="library-ssr"')) {
    return html.replace(/<article id="library-ssr"[\s\S]*?<\/article>/, ssr.trim());
  }
  return html.replace('<div id="root"></div>', `${ssr}\n    <div id="root"></div>`);
}

const html = await readFile(path.join(DIST, "index.html"), "utf8");

for (const route of ROUTES) {
  const slug = route.slice(1);
  const isLibrary = LIBRARY_PUBLISHED_SLUGS.includes(slug);
  let out = applyRouteSeo(html, route);
  if (isLibrary) out = injectLibraryArticle(out, slug);
  const dir = path.join(DIST, slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), out, "utf8");
}
