import { useLayoutEffect, useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ArticleLayout, { ArticleNext } from "@/components/article/ArticleLayout";
import { getLibraryArticle, libraryArticles } from "@/content/library/index.generated";
import { metrikaGoals, reachGoal } from "@/lib/metrika";
import { SITE_ORIGIN } from "@/content/articles/strah-otverzheniya";

const DISCLAIMER =
  "Статья носит образовательный характер, не является медицинской диагностикой, не заменяет консультацию врача-психотерапевта и не обещает лечебного результата. Если состояние тяжёлое или вы не справляетесь в одиночку, обратитесь за очной помощью.";

function practiceCopy(practice: string) {
  if (practice === "kogda-net") {
    return {
      title: "Разобрать свою реакцию на отказ в бесплатной практике «Когда мне говорят нет»",
      label: "Пройти бесплатную практику",
      body: "Коротко, без обещания, что страх исчезнет. Можно начать с одной конкретной сцены.",
    };
  }
  if (practice === "otkaz-ot-sebya") {
    return {
      title: "Если вы часто отказываетесь от своих желаний ради близких",
      label: "Пройти бесплатную практику",
      body: "Приглашаю пройти бесплатную практику «Почему я снова отказываюсь от себя?»",
    };
  }
  return null;
}

export default function LibraryArticlePage() {
  const { slug = "" } = useParams();
  const article = getLibraryArticle(slug);

  useLayoutEffect(() => {
    document.getElementById("library-ssr")?.remove();
  }, [slug]);

  const meta = useMemo(() => {
    if (!article) return null;
    const canonical = `${SITE_ORIGIN}/${article.slug}`;
    const image = article.cover.startsWith("http")
      ? article.cover
      : `${SITE_ORIGIN}${article.cover.startsWith("/") ? "" : "/"}${article.cover}`;
    return {
      title: article.title,
      description: article.description,
      canonical,
      robots: "index, follow",
      ogType: "article",
      ogImage: image,
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
  }, [article]);

  if (!article || !meta) {
    return <Navigate to="/articles" replace />;
  }

  const related = article.related
    .map((item) => libraryArticles.find((entry) => entry.slug === item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 3);
  const practice = practiceCopy(article.practice);

  return (
    <ArticleLayout
      meta={meta}
      title={article.h1}
      lead={<p>{article.description}</p>}
      next={
        practice && article.practiceHref ? (
          <ArticleNext
            title={practice.title}
            href={article.practiceHref}
            linkLabel={practice.label}
            onCtaClick={() =>
              reachGoal(metrikaGoals.articleToPractice, {
                article: article.slug,
                practice: article.practice,
              })
            }
          >
            <p>{practice.body}</p>
          </ArticleNext>
        ) : (
          <section className="article-next">
            <p className="kicker">Дальше</p>
            <h2>Смотрите другие статьи</h2>
            <p>
              <Link className="article-next-link" to="/articles">
                Перейти в каталог
              </Link>
            </p>
          </section>
        )
      }
      disclaimer={DISCLAIMER}
    >
      {article.cover ? (
        <figure className="library-cover">
          <img src={article.cover} alt={article.coverAlt} width={1600} height={900} />
        </figure>
      ) : null}
      <div className="library-article-body" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
      {related.length ? (
        <section className="library-related" aria-label="Возможно, вам будет интересно">
          <p className="kicker">Возможно, вам будет интересно</p>
          <div className="library-related-grid">
            {related.map((item) => (
              <a key={item.slug} className="library-related-card" href={`/${item.slug}`}>
                <div className="library-related-cover">
                  {item.cover ? (
                    <img src={item.cover} alt={item.coverAlt || item.h1} width={640} height={360} loading="lazy" />
                  ) : (
                    <div className="library-card-cover-fallback" aria-hidden="true" />
                  )}
                </div>
                <h3>{item.h1}</h3>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </ArticleLayout>
  );
}
