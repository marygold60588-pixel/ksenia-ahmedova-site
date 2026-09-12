import { useEffect, useState, type FormEvent } from "react";
import Noise from "@/components/bits/Noise";
import Footer from "@/components/layout/Footer";
import { site } from "@/content";
import {
  NOTES_KEY,
  UNLOCK_KEY,
  kogdaGovoryatNetMeta,
  reactions,
} from "@/content/lead-magnets/kogda-govoryat-net";
import { submitLead } from "@/lib/leads";
import { usePageMeta } from "@/lib/page-meta";

type Notes = {
  situation: string;
  meaning: string;
  felt: string;
  reaction: string;
  otherReaction: string;
  action: string;
  outside: string;
  inside: string;
};

const emptyNotes: Notes = {
  situation: "",
  meaning: "",
  felt: "",
  reaction: "",
  otherReaction: "",
  action: "",
  outside: "",
  inside: "",
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
    const saved = JSON.parse(raw) as Partial<Notes> & {
      body?: string;
      defense?: string;
      next?: string;
      fact?: string;
      split?: string;
    };
    return {
      ...emptyNotes,
      situation: saved.situation ?? "",
      meaning: saved.meaning ?? "",
      felt: saved.felt ?? saved.body ?? "",
      reaction: saved.reaction ?? saved.defense ?? "",
      otherReaction: saved.otherReaction ?? "",
      action: saved.action ?? saved.next ?? "",
      outside: saved.outside ?? saved.fact ?? "",
      inside: saved.inside ?? saved.split ?? "",
    };
  } catch {
    return emptyNotes;
  }
}

function show(value: string) {
  const text = value.trim();
  return text || "—";
}

function reactionTitle(notes: Notes) {
  return reactions.find((item) => item.id === notes.reaction)?.title ?? "—";
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
                <li>
                  один вопрос, который поможет заметить момент, когда чужое „нет“ начинает ощущаться как отвержение.
                </li>
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
                  <p className="magnet-contact-note">
                    Материал откроется сразу на этой странице. Контакт останется у Ксении, чтобы при необходимости можно
                    было прислать продолжение по этой теме. Никакой автоматической рассылки после этой формы нет.
                  </p>
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

              <ol className="magnet-steps">
                <li className="magnet-step">
                  <h2>Что случилось?</h2>
                  <p>
                    Вспомните одну недавнюю ситуацию, где вам сказали «нет» — или вы боялись услышать отказ и поэтому не
                    решились попросить, предложить, отказаться или проявиться.
                  </p>
                  <p>Опишите только одну сцену.</p>
                  <label className="magnet-field">
                    Что произошло?
                    <textarea value={notes.situation} onChange={onField("situation")} rows={3} />
                    <span className="magnet-examples">
                      «Хотела попросить начальника отпустить меня пораньше, но так и не подошла».
                      <br />
                      «Предложила встретиться, а человек ответил, что сегодня не может».
                    </span>
                  </label>
                </li>

                <li className="magnet-step">
                  <h2>Чего вы испугались на самом деле?</h2>
                  <p>Представьте это «нет». Что оно как будто говорит не о вашей просьбе, а о вас?</p>
                  <label className="magnet-field magnet-field-question">
                    Если мне откажут, это как будто значит, что я…
                    <textarea value={notes.meaning} onChange={onField("meaning")} rows={2} />
                    <span className="magnet-examples">
                      «Я навязываюсь». «Я слишком много хочу». «Я не важна». «Меня не выбирают». «Мои желания ничего не
                      значат».
                    </span>
                  </label>
                </li>

                <li className="magnet-step">
                  <h2>Что вы почувствовали — и что сделали?</h2>
                  <label className="magnet-field magnet-field-question">
                    Что вы почувствовали в этот момент?
                    <textarea value={notes.felt} onChange={onField("felt")} rows={2} />
                    <span className="magnet-examples">
                      Стыд, тревогу, злость, пустоту? Что произошло в теле — сжалось горло, стало тяжело в груди,
                      захотелось исчезнуть?
                    </span>
                  </label>

                  <fieldset className="magnet-field magnet-field-question">
                    <legend>А что вы сделали?</legend>
                    <div className="magnet-reactions">
                      {reactions.map((item) => (
                        <label key={item.id} className={notes.reaction === item.id ? "is-on" : ""}>
                          <input
                            type="radio"
                            name="reaction"
                            value={item.id}
                            checked={notes.reaction === item.id}
                            onChange={onField("reaction")}
                          />
                          <strong>{item.title}</strong>
                          {item.hint ? <span>{item.hint}</span> : null}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {notes.reaction === "other" ? (
                    <label className="magnet-field magnet-field-short">
                      Свой вариант
                      <textarea value={notes.otherReaction} onChange={onField("otherReaction")} rows={2} />
                    </label>
                  ) : null}

                  <label className="magnet-field magnet-field-short">
                    Что именно вы сделали?
                    <textarea value={notes.action} onChange={onField("action")} rows={2} />
                    <span className="magnet-examples">Необязательно. Коротко, если хочется уточнить.</span>
                  </label>
                </li>

                <li className="magnet-step">
                  <h2>А теперь разделите две вещи</h2>
                  <p>
                    Есть само «нет» — реальное или возможное. И есть то, что оно начинает означать внутри. Посмотрите,
                    совпадают ли эти две вещи.
                  </p>
                  <label className="magnet-field magnet-field-question">
                    Что произошло или могло произойти в реальности?
                    <textarea value={notes.outside} onChange={onField("outside")} rows={2} />
                    <span className="magnet-examples">
                      «Начальник мог сказать: сегодня не получится уйти раньше».
                      <br />
                      «Человек сказал: сегодня я не могу встретиться».
                    </span>
                  </label>
                  <label className="magnet-field magnet-field-question">
                    А что это «нет» стало означать про меня?
                    <textarea value={notes.inside} onChange={onField("inside")} rows={2} />
                    <span className="magnet-examples">
                      «Мои желания не важны». «Я навязываюсь». «Меня не хотят». «Я не имею права просить».
                    </span>
                  </label>
                </li>
              </ol>

              <section className="magnet-result" aria-labelledby="magnet-result-title">
                <h2 id="magnet-result-title">Посмотрите на разницу</h2>
                <p className="magnet-result-label">Снаружи</p>
                <p className="magnet-result-value">{show(notes.outside)}</p>
                <p className="magnet-result-label">Внутри это прозвучало как</p>
                <p className="magnet-result-value">
                  {notes.inside.trim() ? `«${notes.inside.trim()}»` : "—"}
                </p>
                <p className="magnet-result-label">И вашей первой реакцией было</p>
                <p className="magnet-result-value">{reactionTitle(notes)}</p>
                <p>
                  Возможно, болезненным оказалось не только само «нет», а то, что оно начало означать про вас.
                </p>
                <p>
                  Чужой отказ может относиться к просьбе, встрече, цене, времени или возможностям другого человека. Но
                  внутри иногда переживается гораздо шире — как сообщение о собственной ценности, нужности или праве
                  занимать место.
                </p>
                <p>Если вы увидели эту разницу в своей ситуации, задача этой карты уже выполнена.</p>
              </section>

              <section className="magnet-next">
                <h2>В следующий раз</h2>
                <p>
                  Не нужно обещать себе, что теперь вы обязательно попросите, выдержите отказ или перестанете бояться.
                </p>
                <p>
                  Попробуйте поймать один момент: когда чужое реальное или возможное «нет» начинает превращаться внутри в
                  мысль о вас самих.
                </p>
                <p className="magnet-next-q">
                  «Мне сейчас отказали в чём-то — или я уже чувствую, будто отвергли меня целиком?»
                </p>
              </section>

              <button className="btn btn-ghost magnet-print" type="button" onClick={() => window.print()}>
                Сохранить или распечатать
              </button>

              <p className="magnet-close">
                Одного такого наблюдения недостаточно, чтобы изменить привычную реакцию — и от вас этого здесь не
                требуется. Но теперь между чужим «нет» и ощущением «со мной что-то не так» может появиться ещё один
                вопрос: что произошло на самом деле — и что этот отказ заставил меня почувствовать о себе?
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
