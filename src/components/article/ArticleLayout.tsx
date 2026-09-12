import type { ReactNode } from "react";
import Noise from "@/components/bits/Noise";
import Footer from "@/components/layout/Footer";
import { site } from "@/content";
import { usePageMeta, type PageMeta } from "@/lib/page-meta";

type ArticleLayoutProps = {
  meta: PageMeta;
  title: string;
  lead: ReactNode;
  children: ReactNode;
  next: ReactNode;
  disclaimer: ReactNode;
};

export function ArticleNext({
  title,
  children,
  href,
  linkLabel,
}: {
  title: string;
  children: ReactNode;
  href: string;
  linkLabel: string;
}) {
  return (
    <section className="article-next" aria-labelledby="article-next-title">
      <p className="kicker">Дальше</p>
      <h2 id="article-next-title">{title}</h2>
      {children}
      <a className="article-next-link" href={href}>
        {linkLabel}
      </a>
    </section>
  );
}

export default function ArticleLayout({
  meta,
  title,
  lead,
  children,
  next,
  disclaimer,
}: ArticleLayoutProps) {
  usePageMeta(meta);

  return (
    <div className="article-page">
      <Noise />
      <article itemScope itemType="https://schema.org/Article">
        <header className="article-hero">
          <div className="article-top">
            <a className="article-brand" href="/">
              <span>{site.identity.givenName}</span>
              <span className="article-brand-family">{site.identity.familyName}</span>
            </a>
            <a className="article-home" href="/">
              На главную
            </a>
          </div>

          <div className="article-hero-copy">
            <p className="kicker kicker-light">Статья</p>
            <h1 className="article-title" itemProp="headline">
              {title}
            </h1>
            <p className="article-byline">
              <span itemProp="author">{site.identity.fullName}</span>
              <span aria-hidden="true"> · </span>
              врач-психотерапевт
            </p>
            <div className="article-lead">{lead}</div>
          </div>
        </header>

        <div className="article-body" itemProp="articleBody">
          {children}
          {next}
          <p className="article-disclaimer">{disclaimer}</p>
        </div>
      </article>
      <Footer />
    </div>
  );
}
