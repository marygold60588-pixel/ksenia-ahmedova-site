import { useEffect, useState, type FormEvent } from "react";
import Noise from "@/components/bits/Noise";
import Footer from "@/components/layout/Footer";
import { site } from "@/content";
import {
  NOTES_KEY,
  UNLOCK_KEY,
  automations,
  kogdaGovoryatNetMeta,
} from "@/content/lead-magnets/kogda-govoryat-net";
import { submitLead } from "@/lib/leads";
import { usePageMeta } from "@/lib/page-meta";

type Notes = {
  situation: string;
  fact: string;
  meaning: string;
  body: string;
  defense: string;
  next: string;
  split: string;
  step: string;
};

const emptyNotes: Notes = {
  situation: "",
  fact: "",
  meaning: "",
  body: "",
  defense: "",
  next: "",
  split: "",
  step: "",
};

function readUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function readNotes(): Notes {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return emptyNotes;
    return { ...emptyNotes, ...(JSON.parse(raw) as Partial<Notes>) };
  } catch {
    return emptyNotes;
  }
}

function blank(value: string) {
  const text = value.trim();
  return text ? <em>{text}</em> : <span className="magnet-chain-gap">______</span>;
}

function impulse(defense: string) {
  const map: Record<string, string> = {
    freeze: "замереть",
    please: "угодить",
    leave: "исчезнуть первым",
  };
  return blank(map[defense] ?? defense);
}

export default function KogdaGovoryatNetPage() {
  usePageMeta(kogdaGovoryatNetMeta);
  const { form } = site;
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [notes, setNotes] = useState<Notes>(emptyNotes);

  useEffect(() => {
    setUnlocked(readUnlocked());
    setNotes(readNotes());
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {
      /* ignore quota */
    }
  }, [notes, unlocked]);

  const onField = (key: keyof Notes) => (event: { target: { value: string } }) => {
    setNotes((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending || unlocked) return;
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setSubmitError(false);
    setSending(true);
    const result = await submitLead({
      name: name.trim(),
      contact: contact.trim(),
      intent: "gift",
      message: "Лид-магнит «Когда мне говорят нет»",
      source: "site-form",
    });
    setSending(false);
    if (!result.ok) {
      setSubmitError(true);
      return;
    }
    try {
      sessionStorage.setItem(UNLOCK_KEY, "1");
    } catch {
      /* ignore */
    }
    setUnlocked(true);
    window.ym?.(112330836, "reachGoal", "leadmagnet_otkaz");
    window.setTimeout(() => {
      document.getElementById("karta")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="article-page magnet-page">
      <Noise />
      <main>
        <header className="article-hero magnet-hero">
          <div className="article-top">
            <a className="article-brand" href="/">
              <span>{site.identity.givenName}</span>
              <span className="article-brand-family">{site.identity.familyName}</span>
            </a>
            <a className="article-home" href="/strah-otverzheniya">
              К статье
            </a>
          </div>
          <div className="article-hero-copy">
            <p className="kicker kicker-light">Рабочий материал</p>
            <h1 className="article-title">Когда мне говорят «нет»</h1>
            <p className="article-byline">
              {site.identity.fullName}
              <span aria-hidden="true"> · </span>
              карта реакции на отказ
            </p>
            <div className="article-lead">
              <p>
                Не упражнение на смелость и не способ «проработать страх». Это короткий разбор одного реального отказа:
                что случилось фактически, что вы мгновенно решили о себе, и какая защита включилась.
              </p>
            </div>
          </div>
        </header>

        <div className="article-body magnet-body">
          {!unlocked ? (
            <>
              <p>
                После статьи часто остаётся узнавание: да, это про меня. И всё ещё неясно, <em>как именно</em> это
                устроено у вас в одной конкретной сцене.
              </p>
              <p>
                Материал не ставит диагноз и не обещает, что страх исчезнет. Он помогает заметить цепочку, пока она ещё не
                стала «моим характером».
              </p>
              <h2>Что вы получите</h2>
              <ul className="magnet-preview">
                <li>разбор одного вашего реального отказа — не всей жизни;</li>
                <li>отличие факта «нет» от мысли «отвергли меня»;</li>
                <li>наблюдение: мысль, чувство, тело, что вы делаете дальше;</li>
                <li>один маленький шаг на ближайшую похожую сцену.</li>
              </ul>
              <p>
                Карта откроется на этой странице сразу после заявки. Это не рассылка курса, не видео и не обещание, что
                материал придёт в мессенджер.
              </p>

              <section className="magnet-gate" aria-labelledby="magnet-gate-title">
                <h2 id="magnet-gate-title">Чтобы открыть карту</h2>
                <form className="magnet-form" onSubmit={onSubmit}>
                  <label>
                    Имя
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      required
                      disabled={sending}
                    />
                  </label>
                  <label>
                    {form.contactLabel}
                    <input
                      type="text"
                      value={contact}
                      onChange={(event) => setContact(event.target.value)}
                      placeholder={form.contactHint}
                      autoComplete="off"
                      required
                      disabled={sending}
                    />
                  </label>
                  <div className="request-consent">
                    <label className="request-consent-label" htmlFor="magnet-consent">
                      <input
                        id="magnet-consent"
                        type="checkbox"
                        checked={consent}
                        aria-invalid={consentError}
                        aria-describedby={consentError ? "magnet-consent-error" : undefined}
                        onChange={(event) => {
                          setConsent(event.target.checked);
                          if (event.target.checked) setConsentError(false);
                        }}
                      />
                      <span className="request-consent-box" aria-hidden="true" />
                      <span className="request-consent-text">
                        Я даю{" "}
                        <a className="request-privacy-link" href="/legal/consent">
                          согласие на обработку персональных данных
                        </a>{" "}
                        и ознакомлен(а) с{" "}
                        <a className="request-privacy-link" href="/legal/privacy">
                          Политикой конфиденциальности
                        </a>
                      </span>
                    </label>
                    {consentError ? (
                      <p className="request-consent-error" id="magnet-consent-error" role="alert">
                        Чтобы открыть материал, отметьте согласие на обработку персональных данных.
                      </p>
                    ) : null}
                  </div>
                  <button className="btn btn-solid magnet-submit" type="submit" disabled={sending}>
                    {sending ? "Открываю…" : "Открыть карту"}
                  </button>
                  {submitError ? (
                    <p className="magnet-error" role="alert">
                      Не удалось отправить заявку. Попробуйте ещё раз.
                    </p>
                  ) : null}
                </form>
              </section>
            </>
          ) : (
            <section className="magnet-work" id="karta">
              <p className="magnet-open-note">Материал открыт на этом устройстве. Записи остаются только у вас.</p>

              <h2>Три частых автоматизма</h2>
              <p>
                Это не типы личности. В разные дни может включаться разное. Обычно один способ привычнее остальных.
              </p>
              <div className="magnet-automations">
                {automations.map((item) => (
                  <section key={item.id}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </section>
                ))}
              </div>

              <h2>Карта одного отказа</h2>
              <p>
                Возьмите не абстрактный страх, а один недавний случай. Не ответили на сообщение. Отказали в просьбе.
                Коротко ответили на работе. Перенесли встречу. Сказали «нет» вашей цене. Хватит малого.
              </p>
              <p>Пишите коротко. Здесь нет правильного ответа — есть точная картина.</p>

              <label className="magnet-field">
                Ситуация
                <span>Что это было, когда и с кем. Одна сцена, не вся жизнь.</span>
                <textarea value={notes.situation} onChange={onField("situation")} rows={3} />
              </label>
              <label className="magnet-field">
                Что произошло фактически
                <span>Только наблюдаемые факты. Без догадок о чужих чувствах и без «значит, я…».</span>
                <textarea value={notes.fact} onChange={onField("fact")} rows={3} />
              </label>
              <label className="magnet-field">
                Что я мгновенно решил(а) о себе
                <span>Какая мысль о себе возникла быстрее, чем объяснение. Например: я лишний, слишком много, меня не выбрали.</span>
                <textarea value={notes.meaning} onChange={onField("meaning")} rows={3} />
              </label>
              <label className="magnet-field">
                Чувство и тело
                <span>Стыд, пустота, злость, вина, желание провалиться. Где это в теле: горло, живот, грудь, руки.</span>
                <textarea value={notes.body} onChange={onField("body")} rows={3} />
              </label>

              <fieldset className="magnet-field">
                <legend>Какая защита включилась</legend>
                <p>Если не совпадает ни один — напишите свой вариант ниже.</p>
                <div className="magnet-defenses">
                  {automations.map((item) => (
                    <label key={item.id} className={notes.defense === item.id ? "is-on" : ""}>
                      <input
                        type="radio"
                        name="defense"
                        value={item.id}
                        checked={notes.defense === item.id}
                        onChange={onField("defense")}
                      />
                      {item.title}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="magnet-field">
                Что я сделал(а) дальше
                <span>Промолчали, согласились, написали ещё раз, исчезли, начали себя убеждать, напали первыми.</span>
                <textarea value={notes.next} onChange={onField("next")} rows={3} />
              </label>
              <label className="magnet-field">
                Отказ в предмете или «отвергли меня»?
                <span>
                  Отказ — «не сейчас», «выбрали другого», «мне это не близко». Отвержение — будто отказали в праве
                  просить, чувствовать, занимать место.
                </span>
                <textarea value={notes.split} onChange={onField("split")} rows={3} />
              </label>

              <section className="magnet-chain" aria-labelledby="magnet-chain-title">
                <h2 id="magnet-chain-title">Моя цепочка</h2>
                <p className="magnet-chain-line">
                  Когда произошло {blank(notes.situation)} → я решил(а) о себе {blank(notes.meaning)} → почувствовал(а){" "}
                  {blank(notes.body)} → захотелось {impulse(notes.defense)} → я {blank(notes.next)}.
                </p>
                <p>
                  Посмотрите на эту цепочку целиком. Между чужим «нет» и вашим действием есть несколько звеньев. Когда они
                  становятся видимыми, реакция уже не выглядит просто «моим характером».
                </p>
              </section>

              <h2>Один маленький шаг</h2>
              <p>
                В следующей похожей ситуации не нужно заставлять себя реагировать правильно. Попробуйте заметить самый
                первый момент, когда запускается именно ваша цепочка — желание замереть, угодить или уйти первым.
              </p>
              <label className="magnet-field">
                Какую ближайшую ситуацию я хочу просто заметить?
                <textarea value={notes.step} onChange={onField("step")} rows={3} />
              </label>

              <button className="btn btn-ghost magnet-print" type="button" onClick={() => window.print()}>
                Сохранить или распечатать
              </button>

              <p className="magnet-close">
                Если после карты стало видно, что реакция значительно сильнее самого отказа, возможно, здесь работает не
                только сегодняшняя ситуация. Такие автоматизмы можно исследовать глубже — не заставляя себя стать
                «смелее», а постепенно понимая, что именно делает чужое «нет» таким болезненным.
              </p>
            </section>
          )}

          <p className="article-disclaimer">
            Материал носит образовательный характер, не является медицинской диагностикой, не заменяет консультацию
            врача-психотерапевта и не обещает лечебного результата. Если состояние тяжёлое или вы не справляетесь в
            одиночку, обратитесь за очной помощью.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
