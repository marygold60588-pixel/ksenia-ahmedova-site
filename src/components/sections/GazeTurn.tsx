import BlurText from "@/components/bits/BlurText";
import GradualBlur from "@/components/bits/GradualBlur";
import ScrollExpand from "@/components/bits/ScrollExpand";
import ScrollReveal from "@/components/bits/ScrollReveal";
import Portrait from "@/components/ui/Portrait";
import OrbitField from "@/components/viz/OrbitField";
import { site } from "@/content";
import { useReveal } from "@/hooks/useReveal";

export default function GazeTurn() {
  const { turn } = site;
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section turn reveal" id="turn" ref={ref}>
      <div className="turn-media">
        <p className="kicker">{turn.kicker}</p>
        <OrbitField className="turn-orbit" />
        <ScrollExpand intensity="soft">
          <div className="turn-photo-frame">
            <Portrait src={turn.image} alt={turn.imageAlt} className="turn-photo" />
            <GradualBlur />
          </div>
        </ScrollExpand>
      </div>

      <div className="turn-copy">
        <BlurText text={turn.title} as="h2" className="section-title" />
        <ScrollReveal>
          <p className="section-lead">{turn.lead}</p>
          <p className="turn-shift">{turn.shift}</p>
        </ScrollReveal>
        <ul className="phrase-list">
          {turn.phrases.map((phrase, index) => (
            <ScrollReveal key={phrase} as="li" delay={index * 60}>
              {phrase}
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
