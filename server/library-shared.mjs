import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const SITE_ORIGIN = "https://ksenia-ahmedova.ru";

export const RESERVED_SLUGS = new Set([
  "",
  "articles",
  "legal",
  "privacy",
  "consent",
  "strah-otverzheniya",
  "boyus-prosit",
  "strah-otkaza-i-ugozhdenie",
  "posle-otkaza-hochu-ischeznut",
  "pochemu-ya-uchityvayu-chuzhie-zhelaniya",
  "pochemu-ya-zhdu-ot-muzha",
  "kogda-govoryat-net",
  "praktika-ne-otkazyvatsya-ot-sebya",
  "api",
  "media",
  "assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export const PRACTICE_HREF = {
  "kogda-net": "/kogda-govoryat-net",
  "otkaz-ot-sebya": "/praktika-ne-otkazyvatsya-ot-sebya",
  none: "",
};

export const CLUSTER_LABELS = {
  rejection: "Страх отвержения и отказа",
  asking: "Просьбы и границы",
  desires: "Желания и уступчивость",
  relationships: "Сценарии отношений",
  other: "Другое",
};

/** Author-facing cluster titles from SEO packages → internal keys */
export const CLUSTER_ALIASES = {
  "страх отказа и отвержения": "rejection",
  "страх отвержения и отказа": "rejection",
  "право хотеть и не отказываться от себя": "desires",
  "желания и уступчивость": "desires",
  "просьбы и границы": "asking",
  "сценарии отношений": "relationships",
};

export function parseFrontmatter(raw) {
  const text = String(raw || "").replace(/^\uFEFF/, "");
  if (!text.startsWith("---")) {
    return { data: {}, body: text };
  }
  const end = text.indexOf("\n---", 3);
  if (end < 0) return { data: {}, body: text };
  const fence = text.slice(3, end).trim();
  const body = text.slice(end + 4).replace(/^\r?\n/, "");
  const data = {};
  let listKey = null;
  for (const line of fence.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (listKey && trimmed.startsWith("- ")) {
      const item = trimmed.slice(2).trim().replace(/^["']|["']$/g, "");
      if (!Array.isArray(data[listKey])) data[listKey] = [];
      if (item) data[listKey].push(item);
      continue;
    }
    listKey = null;
    const idx = trimmed.indexOf(":");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((part) => part.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else if (value === "true" || value === "false") {
      data[key] = value === "true";
    } else if (value === "") {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = value;
    }
  }
  return { data, body };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function markdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = inlineMarkdown(paragraph.join(" ").trim());
    if (text) html.push(`<p>${text}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      flushList();
      html.push("<hr />");
      continue;
    }
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }
  flushParagraph();
  flushList();
  return html.join("\n");
}

function inlineMarkdown(text) {
  let out = escapeHtml(text);
  // Absolute URLs and same-site article paths: [text](https://...) or [text](/slug)
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[a-z0-9][a-z0-9\-\/]*)\)/gi,
    '<a href="$2">$1</a>',
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

export function normalizeArticle(data, body, fileName) {
  const slug = String(data.slug || fileName.replace(/\.md$/i, ""))
    .trim()
    .replace(/^\/+|\/+$/g, "");
  const status = String(data.status || "draft").trim().toLowerCase();
  const practiceRaw = String(data.practice || "none").trim();
  const practice = PRACTICE_HREF[practiceRaw] != null ? practiceRaw : "none";
  const rawCluster = String(data.cluster || "other").trim();
  const cluster =
    CLUSTER_LABELS[rawCluster]
      ? rawCluster
      : CLUSTER_ALIASES[rawCluster.toLowerCase()] || "other";
  const related = Array.isArray(data.related)
    ? data.related.map(String)
    : String(data.related || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

  return {
    slug,
    status,
    title: String(data.title || data.h1 || slug).trim(),
    h1: String(data.h1 || data.title || slug).trim(),
    description: String(data.description || "").trim(),
    author: String(data.author || "Ксения Ахмедова").trim(),
    date: String(data.date || "").trim(),
    updatedAt: String(data.updatedAt || data.date || "").trim(),
    sourceUrl: String(data.sourceUrl || "").trim(),
    cluster,
    clusterLabel: CLUSTER_LABELS[cluster] || CLUSTER_LABELS.other,
    related,
    practice,
    practiceHref: PRACTICE_HREF[practice] || "",
    cover: String(data.cover || "").trim(),
    coverAlt: String(data.coverAlt || data.title || "").trim(),
    bodyMarkdown: body.trim(),
    bodyHtml: markdownToHtml(body),
  };
}

export async function loadLibraryArticles(libraryDir) {
  let names = [];
  try {
    names = await readdir(libraryDir);
  } catch {
    return [];
  }
  const articles = [];
  for (const name of names) {
    if (!name.endsWith(".md") || name.toLowerCase() === "readme.md") continue;
    const raw = await readFile(path.join(libraryDir, name), "utf8");
    const { data, body } = parseFrontmatter(raw);
    articles.push(normalizeArticle(data, body, name));
  }
  return articles;
}

export function validateLibraryArticles(articles) {
  const errors = [];
  const seen = new Set();
  for (const article of articles) {
    if (!article.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(article.slug)) {
      errors.push(`Некорректный slug: ${article.slug || "(пусто)"}`);
    }
    if (RESERVED_SLUGS.has(article.slug)) {
      errors.push(`Slug конфликтует с существующим маршрутом: ${article.slug}`);
    }
    if (seen.has(article.slug)) {
      errors.push(`Дублирующийся slug: ${article.slug}`);
    }
    seen.add(article.slug);
    if (!["draft", "published"].includes(article.status)) {
      errors.push(`Некорректный status у ${article.slug}: ${article.status}`);
    }
    if (article.status === "published") {
      if (!article.title || !article.description || !article.cover || !article.date) {
        errors.push(`У published статьи ${article.slug} не хватает title/description/cover/date`);
      }
    }
  }
  return errors;
}

export function toSeoEntry(article) {
  const canonical = `${SITE_ORIGIN}/${article.slug}`;
  const image = article.cover.startsWith("http")
    ? article.cover
    : `${SITE_ORIGIN}${article.cover.startsWith("/") ? "" : "/"}${article.cover}`;
  return {
    title: article.title,
    description: article.description,
    canonical,
    ogType: "article",
    ogImage: image,
    robots: "index, follow",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.h1,
      description: article.description,
      inLanguage: "ru",
      datePublished: article.date,
      dateModified: article.updatedAt || article.date,
      mainEntityOfPage: canonical,
      url: canonical,
      image,
      author: {
        "@type": "Person",
        "@id": `${SITE_ORIGIN}/#person`,
        name: article.author,
        jobTitle: "врач-психотерапевт, психоаналитик",
        url: `${SITE_ORIGIN}/`,
      },
      publisher: { "@id": `${SITE_ORIGIN}/#person` },
    },
  };
}
