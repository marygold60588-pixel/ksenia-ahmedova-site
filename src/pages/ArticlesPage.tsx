import Noise from "@/components/bits/Noise";
import Footer from "@/components/layout/Footer";
import { site } from "@/content";
import { usePageMeta } from "@/lib/page-meta";

const articles = [
  { href: "/strah-otverzheniya", title: "Страх отвержения: почему отказ ощущается как «меня нет»", description: "Когда чужое «нет» переживается как угроза собственной ценности." },
  { href: "/boyus-prosit", title: "Почему я боюсь просить", description: "Почему простая просьба может ощущаться как опасность и что стоит за этим страхом." },
  { href: "/strah-otkaza-i-ugozhdenie", title: "Почему я соглашаюсь, хотя не хочу", description: "О привычке говорить «да» раньше, чем удаётся услышать собственное желание." },
  { href: "/posle-otkaza-hochu-ischeznut", title: "Почему после отказа хочется исчезнуть", description: "Почему после отказа хочется отступить, замолчать и отказаться от того, что было важно." },
];

export default function ArticlesPage() {
  usePageMeta({ title: "Статьи о психологии отношений — Ксения Ахмедова", description: "Психоаналитические статьи о страхе отказа, отвержении, просьбах и границах." });
  return (
    <div className="article-page">
      <Noise />
      <main>
        <section className="article-hero" style={{ minHeight: "auto", paddingBottom: "3rem" }}>
          <div className="article-top">
            <a className="article-brand" href="/"><span>{site.identity.givenName}</span> <span className="article-brand-family">{site.identity.familyName}</span></a>
            <a className="article-home" href="/">На главную</a>
          </div>
          <div className="article-hero-copy">
            <p className="kicker kicker-light">Библиотека</p>
            <h1 className="article-title">Статьи о психологии отношений</h1>
            <p>О том, как складываются повторяющиеся сценарии, почему трудно просить, отказывать и оставаться собой рядом с другим человеком.</p>
          </div>
        </section>
        <section aria-label="Список статей" style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {articles.map((article) => (
              <a key={article.href} href={article.href} style={{ display: "block", padding: "2rem", border: "1px solid rgba(145,122,90,.28)", borderRadius: 18, color: "inherit", textDecoration: "none", background: "rgba(255,255,255,.06)" }}>
                <span style={{ display: "block", fontSize: ".8rem", letterSpacing: ".12em", textTransform: "uppercase", opacity: .7, marginBottom: ".7rem" }}>Статья</span>
                <h2 style={{ fontSize: "clamp(1.35rem, 3vw, 2rem)", lineHeight: 1.25, margin: "0 0 .8rem" }}>{article.title}</h2>
                <p style={{ lineHeight: 1.65, margin: "0 0 1rem" }}>{article.description}</p>
                <span style={{ textDecoration: "underline", textUnderlineOffset: 4 }}>Читать статью →</span>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
