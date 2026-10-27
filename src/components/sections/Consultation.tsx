import BlurText from "@/components/bits/BlurText";
import GlassSurface from "@/components/bits/GlassSurface";
import ScrollReveal from "@/components/bits/ScrollReveal";
import Button from "@/components/ui/Button";
import { getProduct, site } from "@/content";
import { assetUrl } from "@/lib/asset";

export default function Consultation() {
  const { consultation } = site;
  const consult = getProduct("consultation");

  if (!consult || consult.status !== "active") return null;

  return (
    <section className="consult" id="consult">
      <figure className="consult-photo">
        <img src={assetUrl(consultation.image)} alt={consultation.imageAlt} loading="lazy" decoding="async" />
      </figure>

      <GlassSurface className="consult-glass">
        <p className="kicker">{consult.kicker}</p>
        <BlurText text={consult.name} as="h2" className="section-title" />
        <ScrollReveal>
          <p className="consult-lead">{consult.description}</p>
          <p className="consult-closing">{consultation.closing}</p>
          <p className="consult-closing">Врач-психотерапевт, психиатр. Более 20 лет в профессии, частная практика с 2014 года.</p>
        </ScrollReveal>
        <div className="consult-actions">
          <Button href={site.form.assistantHref} variant="solid">Связаться с ассистентом в Telegram</Button>
          <Button href="#request" variant="ghost">{consultation.cta}</Button>
        </div>
      </GlassSurface>
    </section>
  );
}
