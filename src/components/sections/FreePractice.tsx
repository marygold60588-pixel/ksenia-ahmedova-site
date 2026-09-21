import ScrollReveal from "@/components/bits/ScrollReveal";
import Button from "@/components/ui/Button";
import { site } from "@/content";

export default function FreePractice() {
  const { freePractice } = site;

  return (
    <section className="section home-practice" id="free-practice" aria-labelledby="free-practice-title">
      <div className="home-practice-inner">
        <p className="kicker">{freePractice.kicker}</p>
        <h2 id="free-practice-title">{freePractice.title}</h2>
        <ScrollReveal>
          <p className="section-lead">{freePractice.lead}</p>
        </ScrollReveal>
        <Button href={freePractice.href} variant="ghost">
          {freePractice.cta}
        </Button>
      </div>
    </section>
  );
}
