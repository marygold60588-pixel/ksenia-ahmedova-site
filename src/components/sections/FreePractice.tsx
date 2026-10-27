import ScrollReveal from "@/components/bits/ScrollReveal";
import Button from "@/components/ui/Button";
import { site } from "@/content";
import "./FreePracticeAnimation.css";

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

        <div className="scenario-feature">
          <div className="scenario-feature-copy">
            <p className="kicker">КОГДА СЦЕНАРИЙ ПОВТОРЯЕТСЯ</p>
            <h3>Почему я снова отказываюсь от себя?</h3>
            <p className="section-lead">
              Иногда кажется, что ситуации совершенно разные. Но в какой-то момент вы замечаете:
              снова промолчали, уступили, отложили своё желание.
            </p>
            <p className="section-lead">
              Шесть вопросов помогут проследить этот привычный ход, заметить свои чувства
              и увидеть, где появляется возможность поступить иначе.
            </p>
            <div className="scenario-feature-cta">
              <Button href="/praktika-ne-otkazyvatsya-ot-sebya" variant="ghost">
                Пройти бесплатно
              </Button>
              <p>Без оплаты и регистрации. Личные записи остаются в вашем браузере.</p>
            </div>
          </div>
          <div className="scenario-feature-media">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              width="854"
              height="480"
              aria-label="Золотая книга: из спутанных линий проявляется повторяющийся сценарий, а затем новый путь"
            >
              <source src="/media/scenario-book-loop.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
