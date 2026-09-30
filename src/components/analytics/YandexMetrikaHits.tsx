import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { hit } from "@/lib/metrika";

function pageUrl(location: { pathname: string; search: string; hash: string }) {
  return `${location.pathname}${location.search}${location.hash}`;
}

/** Sends Metrika hits on client-side route changes. The first view is left to ym("init"). */
export default function YandexMetrikaHits() {
  const location = useLocation();
  const isFirstView = useRef(true);
  const previousUrl = useRef(pageUrl(location));

  useEffect(() => {
    const url = pageUrl(location);
    if (isFirstView.current) {
      isFirstView.current = false;
      previousUrl.current = url;
      return;
    }
    if (url === previousUrl.current) return;
    const referer = previousUrl.current;
    previousUrl.current = url;
    hit(url, { title: document.title, referer });
  }, [location.pathname, location.search, location.hash]);

  return null;
}
