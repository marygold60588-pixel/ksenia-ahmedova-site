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
        <div style={{marginTop:32,padding:24,border:"1px solid rgba(185,154,103,.45)",borderRadius:18}}>
          <p className="kicker">ЕЩЁ ОДНА БЕСПЛАТНАЯ ПРАКТИКА</p>
          <h3 style={{fontSize:"clamp(22px,3vw,32px)",margin:"12px 0"}}>Почему я снова отказываюсь от себя?</h3>
          <p className="section-lead">Шесть вопросов о том, почему бывает трудно говорить о собственных желаниях. Личная карта наблюдений и дневник. Бесплатный тестовый доступ для посетителей сайта.</p>
          <Button href="/praktika-ne-otkazyvatsya-ot-sebya" variant="ghost">Пройти бесплатно</Button>
          <p style={{fontSize:13,opacity:.75,marginTop:12}}>Без оплаты и регистрации. Личные записи остаются в вашем браузере.</p>
        </div>
      </div>
    </section>
  );
}
