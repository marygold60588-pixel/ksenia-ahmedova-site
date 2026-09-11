import { useEffect } from "react";

export type PageMeta = {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: object;
};

function escapeJson(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function ensureNamedMeta(name: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  return el;
}

function ensurePropertyMeta(property: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  return el;
}

function ensureCanonical() {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  return el;
}

function ensureJsonLd(id: string) {
  let el = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  return el;
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    const robots = ensureNamedMeta("robots");
    const description = ensureNamedMeta("description");
    const canonical = ensureCanonical();
    const ogTitle = ensurePropertyMeta("og:title");
    const ogDescription = ensurePropertyMeta("og:description");
    const ogType = ensurePropertyMeta("og:type");
    const ogUrl = ensurePropertyMeta("og:url");
    const ogImage = ensurePropertyMeta("og:image");
    const twitterTitle = ensureNamedMeta("twitter:title");
    const twitterDescription = ensureNamedMeta("twitter:description");
    const twitterImage = ensureNamedMeta("twitter:image");
    const jsonLd = meta.jsonLd ? ensureJsonLd("route-jsonld") : null;

    const previous = {
      robots: robots.getAttribute("content"),
      description: description.getAttribute("content"),
      canonical: canonical.getAttribute("href"),
      ogTitle: ogTitle.getAttribute("content"),
      ogDescription: ogDescription.getAttribute("content"),
      ogType: ogType.getAttribute("content"),
      ogUrl: ogUrl.getAttribute("content"),
      ogImage: ogImage.getAttribute("content"),
      twitterTitle: twitterTitle.getAttribute("content"),
      twitterDescription: twitterDescription.getAttribute("content"),
      twitterImage: twitterImage.getAttribute("content"),
      jsonLd: jsonLd?.textContent ?? "",
    };

    document.title = meta.title;
    robots.setAttribute("content", meta.robots ?? "index, follow");
    description.setAttribute("content", meta.description);
    canonical.setAttribute("href", meta.canonical);
    ogTitle.setAttribute("content", meta.title);
    ogDescription.setAttribute("content", meta.description);
    ogType.setAttribute("content", meta.ogType ?? "article");
    ogUrl.setAttribute("content", meta.canonical);
    if (meta.ogImage) {
      ogImage.setAttribute("content", meta.ogImage);
      twitterImage.setAttribute("content", meta.ogImage);
    }
    twitterTitle.setAttribute("content", meta.title);
    twitterDescription.setAttribute("content", meta.description);
    if (jsonLd && meta.jsonLd) {
      jsonLd.textContent = escapeJson(meta.jsonLd);
    }

    return () => {
      document.title = previousTitle;
      robots.setAttribute("content", previous.robots ?? "index, follow");
      description.setAttribute("content", previous.description ?? "");
      canonical.setAttribute("href", previous.canonical ?? "https://ksenia-ahmedova.ru/");
      ogTitle.setAttribute("content", previous.ogTitle ?? "");
      ogDescription.setAttribute("content", previous.ogDescription ?? "");
      ogType.setAttribute("content", previous.ogType ?? "website");
      ogUrl.setAttribute("content", previous.ogUrl ?? "https://ksenia-ahmedova.ru/");
      ogImage.setAttribute("content", previous.ogImage ?? "");
      twitterTitle.setAttribute("content", previous.twitterTitle ?? "");
      twitterDescription.setAttribute("content", previous.twitterDescription ?? "");
      twitterImage.setAttribute("content", previous.twitterImage ?? "");
      if (jsonLd) {
        if (previous.jsonLd) jsonLd.textContent = previous.jsonLd;
        else jsonLd.remove();
      }
    };
  }, [meta]);
}
