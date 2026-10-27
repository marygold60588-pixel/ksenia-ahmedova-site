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
        <div className="home-practice-pilot" style={{marginTop:"32px",padding:"24px",border:"1px solid rgba(185,154,103,.45)",borderRadius:"18px"}}>
          <p className="kicker">ЕЩЁ ОДНА БЕСПЛАТНАЯ ПРАКТИКА · ТЕСТОВЫЙ ДОСТУП</p>
          <h3 style={{fontSize:"clamp(22px,3vw,32px)",margin:"12px 0"}}>Почему я снова отказываюсь от себя?</h3>
          <p className="section-lead">Когда хочется сказать о своём желании, но вы соглашаетесь, уступаете или молчите. Шесть вопросов, личная карта наблюдений и дневник. Сейчас доступ бесплатный: нам важна обратная связь от обычных посетителей сайта.</p>
          <Button href="/praktika-ne-otkazyvatsya-ot-sebya" variant="ghost">Пройти бесплатно →</Button>
          <p style={{fontSize:"13px",opacity:".75",marginTop:"12px"}}>Без оплаты и регистрации. Личные записи сохраняются в вашем браузере.</p>
        </div>
      </div>
    </section>
  );
}
