import BlurText from "@/components/bits/BlurText";
import GradualBlur from "@/components/bits/GradualBlur";
import ScrollExpand from "@/components/bits/ScrollExpand";
import ScrollReveal from "@/components/bits/ScrollReveal";
import { site } from "@/content";
import { useReveal } from "@/hooks/useReveal";
import { assetUrl } from "@/lib/asset";

export default function WhoSees() {
  const { expert } = site;
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section expert reveal" id="expert" ref={ref}>
      <div className="expert-copy">
        <p className="kicker">{expert.kicker}</p>
        <BlurText text={expert.title} as="h2" className="section-title" />
        <p className="expert-name">{expert.name}</p>
        <ul className="credential-list">
          {expert.credentials.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ScrollReveal>
          <p className="section-lead">{expert.statement}</p>
          <p className="expert-note">{expert.forWhom}</p>
        </ScrollReveal>
      </div>

      <div className="expert-media">
        <ScrollExpand className="expert-still" intensity="soft">
          <figure>
            <img src={assetUrl(expert.image)} alt={expert.imageAlt} loading="lazy" decoding="async" />
            <GradualBlur />
          </figure>
        </ScrollExpand>
        <figure className="expert-film">
          <video autoPlay muted loop playsInline preload="none" poster={assetUrl(expert.image)}>
            <source src={assetUrl(expert.video)} type="video/mp4" />
          </video>
        </figure>
      </div>
    </section>
  );
}
