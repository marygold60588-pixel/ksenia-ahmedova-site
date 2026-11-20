import { useMemo, useState } from "react";
import Noise from "@/components/bits/Noise";
import Footer from "@/components/layout/Footer";
import { site } from "@/content";
import { libraryArticles, LIBRARY_CLUSTER_LABELS } from "@/content/library/index.generated";
import { legacyArticles } from "@/content/library/legacy";
import { usePageMeta } from "@/lib/page-meta";

const articlesMeta = {
  title: "Статьи о психологии отношений — Ксения Ахмедова",
  description:
    "Психоаналитические статьи о страхе отказа, отвержении, просьбах и границах.",
  canonical: "https://ksenia-ahmedova.ru/articles",
  ogType: "website",
};

type CatalogItem = {
  href: string;
  title: string;
  description: string;
  cluster: string;
  clusterLabel: string;
  image?: string;
  imageAlt?: string;
  date?: string;
};

export default function ArticlesPage() {
  usePageMeta(articlesMeta);
  const [cluster, setCluster] = useState("all");

  const items = useMemo<CatalogItem[]>(() => {
    const library = libraryArticles.map((article) => ({
      href: `/${article.slug}`,
      title: article.h1,
      description: article.description,
      cluster: article.cluster,
      clusterLabel: article.clusterLabel,
      image: article.cover,
      imageAlt: article.coverAlt,
      date: article.date,
    }));
    return [...library, ...legacyArticles].sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || "")),
    );
  }, []);

  const clusters = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) map.set(item.cluster, item.clusterLabel);
    for (const [key, label] of Object.entries(LIBRARY_CLUSTER_LABELS)) {
      if (!map.has(key)) map.set(key, label);
    }
    return [...map.entries()];
  }, [items]);

  const visible = cluster === "all" ? items : items.filter((item) => item.cluster === cluster);

  return (
    <div className="article-page">
      <Noise />
      <main>
        <section className="article-hero library-catalog-hero">
          <div className="article-top">
            <a className="article-brand" href="/">
              <span>{site.identity.givenName}</span>{" "}
              <span className="article-brand-family">{site.identity.familyName}</span>
            </a>
            <a className="article-home" href="/">
              На главную
            </a>
          </div>
          <div className="article-hero-copy">
            <p className="kicker kicker-light">Библиотека</p>
            <h1 className="article-title">Статьи о психологии отношений</h1>
            <p>
              О том, как складываются повторяющиеся сценарии, почему трудно просить, отказывать и
              оставаться собой рядом с другим человеком.
            </p>
          </div>
        </section>

        <section className="library-catalog" aria-label="Список статей">
          <div className="library-filters" role="tablist" aria-label="Тематические кластеры">
            <button
              type="button"
              className={cluster === "all" ? "is-active" : ""}
              onClick={() => setCluster("all")}
            >
              Все темы
            </button>
            {clusters.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={cluster === id ? "is-active" : ""}
                onClick={() => setCluster(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="library-grid">
            {visible.map((article) => (
              <a key={article.href} className="library-card" href={article.href}>
                <div className="library-card-cover">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.imageAlt || article.title}
                      width={1600}
                      height={900}
                      loading="lazy"
                    />
                  ) : (
                    <div className="library-card-cover-fallback" aria-hidden="true" />
                  )}
                </div>
                <span className="library-card-kicker">Статья</span>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <span className="library-card-more">Читать статью →</span>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
