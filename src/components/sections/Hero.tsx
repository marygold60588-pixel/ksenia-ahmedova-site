import BlurText from "@/components/bits/BlurText";
import GradualBlur from "@/components/bits/GradualBlur";
import ScrollReveal from "@/components/bits/ScrollReveal";
import Button from "@/components/ui/Button";
import { site } from "@/content";
import { assetUrl } from "@/lib/asset";

export default function Hero() {
  const { hero } = site;

  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="hero-name">{site.identity.fullName}</p>
        <h1 className="hero-title">
          <BlurText text={hero.lineOne} as="span" />
          <BlurText text={hero.lineTwo} as="span" className="hero-italic" delay={160} />
          <BlurText text={hero.lineThree} as="span" delay={320} />
        </h1>
        <ScrollReveal delay={420}>
          <p className="hero-lead">{hero.lead}</p>
        </ScrollReveal>
        <div className="hero-actions">
          <Button href={hero.primaryCta.href} variant="light">
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant="ghost">
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>

      <div className="hero-media">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={assetUrl(hero.image)}
          aria-hidden="true"
        >
          <source src={assetUrl(hero.mobileVideo)} type="video/mp4" />
        </video>
        <img
          className="hero-photo"
          src={assetUrl(hero.image)}
          alt={hero.imageAlt}
          fetchPriority="high"
          decoding="async"
        />
        <GradualBlur />
      </div>
    </section>
  );
}
