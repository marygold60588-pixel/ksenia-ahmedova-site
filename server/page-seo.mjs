const ARTICLE_SEO = {
  "/strah-otverzheniya": {
    title: "Страх отвержения: почему отказ ощущается как «меня нет»",
    description:
      "Чем страх отказа отличается от страха отвержения. Почему можно понимать, что ничего страшного не случилось, и всё равно реагировать стыдом, тревогой или желанием исчезнуть.",
    canonical: "https://ksenia-ahmedova.ru/strah-otverzheniya",
    ogType: "article",
    ogImage: "https://ksenia-ahmedova.ru/media/portraits/gaze-sage.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Страх отвержения: почему отказ ощущается как «меня нет»",
      description:
        "Чем страх отказа отличается от страха отвержения. Почему можно понимать, что ничего страшного не случилось, и всё равно реагировать стыдом, тревогой или желанием исчезнуть.",
      inLanguage: "ru",
      datePublished: "2026-09-11",
      dateModified: "2026-09-11",
      mainEntityOfPage: "https://ksenia-ahmedova.ru/strah-otverzheniya",
      url: "https://ksenia-ahmedova.ru/strah-otverzheniya",
      image: "https://ksenia-ahmedova.ru/media/portraits/gaze-sage.png",
      author: {
        "@type": "Person",
        "@id": "https://ksenia-ahmedova.ru/#person",
        name: "Ксения Ахмедова",
        jobTitle: "врач-психотерапевт, психоаналитик",
        url: "https://ksenia-ahmedova.ru/",
      },
      publisher: {
        "@id": "https://ksenia-ahmedova.ru/#person",
      },
    },
  },
};

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function replaceNamedMeta(html, name, content) {
  const namedFirst = new RegExp(
    `(<meta\\b[^>]*\\bname=["']${name}["'][^>]*\\bcontent=)(["'])[\\s\\S]*?\\2`,
    "i",
  );
  if (namedFirst.test(html)) {
    return html.replace(namedFirst, `$1$2${escapeAttr(content)}$2`);
  }
  const contentFirst = new RegExp(
    `(<meta\\b[^>]*\\bcontent=)(["'])[\\s\\S]*?\\2([^>]*\\bname=["']${name}["'])`,
    "i",
  );
  if (contentFirst.test(html)) {
    return html.replace(contentFirst, `$1$2${escapeAttr(content)}$2$3`);
  }
  return html;
}

function replacePropertyMeta(html, property, content) {
  const re = new RegExp(
    `(<meta\\b[^>]*\\bproperty=["']${property}["'][^>]*\\bcontent=)(["'])[\\s\\S]*?\\2`,
    "i",
  );
  if (re.test(html)) {
    return html.replace(re, `$1$2${escapeAttr(content)}$2`);
  }
  return html;
}

export function normalizePathname(urlPath) {
  const raw = String(urlPath || "/").split("?")[0].split("#")[0];
  if (raw.length > 1 && raw.endsWith("/")) return raw.slice(0, -1);
  return raw || "/";
}

export function applyRouteSeo(html, urlPath) {
  const pathname = normalizePathname(urlPath);
  const seo = ARTICLE_SEO[pathname];
  if (!seo) return html;

  let next = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(seo.title)}</title>`);
  next = replaceNamedMeta(next, "description", seo.description);
  next = replaceNamedMeta(next, "robots", "index, follow");
  next = replaceNamedMeta(next, "twitter:title", seo.title);
  next = replaceNamedMeta(next, "twitter:description", seo.description);
  next = replaceNamedMeta(next, "twitter:image", seo.ogImage);
  next = replacePropertyMeta(next, "og:title", seo.title);
  next = replacePropertyMeta(next, "og:description", seo.description);
  next = replacePropertyMeta(next, "og:type", seo.ogType);
  next = replacePropertyMeta(next, "og:url", seo.canonical);
  next = replacePropertyMeta(next, "og:image", seo.ogImage);
  next = next.replace(
    /(<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=)(["'])[\s\S]*?\2/i,
    `$1$2${escapeAttr(seo.canonical)}$2`,
  );

  if (!next.includes('id="route-jsonld"')) {
    const json = JSON.stringify(seo.jsonLd).replace(/</g, "\\u003c");
    next = next.replace(
      "</head>",
      `    <script type="application/ld+json" id="route-jsonld">${json}</script>\n  </head>`,
    );
  }

  return next;
}
