import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import ScrollReveal from "@/components/bits/ScrollReveal";
import BookReveal from "@/components/viz/BookReveal";
import { site } from "@/content";
import type { ContactChannel } from "@/content/types";
import { submitLead } from "@/lib/leads";

export default function PaperCard() {
  const { form, gift } = site;
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [channel, setChannel] = useState<ContactChannel>("email");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const gesture = useRef({ x: 0, y: 0, dragged: false });

  const sendMaterial = async (event: FormEvent) => {
    event.preventDefault();
    if (sending || sent || !contact.trim()) return;
    setSubmitError(false);
    setSending(true);
    const result = await submitLead({
      name: "Гайд",
      contact: contact.trim(),
      intent: "gift",
      contactChannel: channel,
      source: "paper-card",
    });
    setSending(false);
    if (!result.ok) {
      setSubmitError(true);
      return;
    }
    setSent(true);
  };

  return (
    <section className="section paper" id="material">
      <div className="paper-copy">
        <p className="kicker">{gift.kicker}</p>
        <ScrollReveal>
          <p className="section-lead">{gift.lead}</p>
        </ScrollReveal>
      </div>

      <div className={`instrument ${open ? "is-open" : ""}`}>
        <div
          className="instrument-toggle"
          role="button"
          tabIndex={0}
          aria-label={open ? "Закрыть карту сценария" : "Открыть карту сценария"}
          aria-expanded={open}
          aria-controls="instrument-reading"
          onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
            gesture.current = { x: event.clientX, y: event.clientY, dragged: false };
          }}
          onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
            if (event.buttons === 0) return;
            const dx = event.clientX - gesture.current.x;
            const dy = event.clientY - gesture.current.y;
            if (Math.hypot(dx, dy) > 8) gesture.current.dragged = true;
          }}
          onClick={() => {
            if (gesture.current.dragged) return;
            setOpen((value) => !value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((value) => !value);
            }
          }}
        >
          <BookReveal open={open} />
          {!open ? <span className="instrument-hint">{gift.hint}</span> : null}
        </div>

        <div className={`instrument-reading ${open ? "is-visible" : ""}`} id="instrument-reading">
          {open ? (
            <>
              <p className="instrument-format">{gift.item.format}</p>
              <h2 className="instrument-title">
                7 признаков, что вы снова попали
                <br />
                в старый сценарий отношений
              </h2>
              <p className="instrument-note">{gift.item.description}</p>
            </>
          ) : null}
        </div>

        <div className={`instrument-cta ${open ? "is-visible" : ""}`}>
          {open ? (
            sent ? (
              <p className="instrument-done">Материал можно будет получить на указанный контакт.</p>
            ) : (
              <form className="instrument-form" onSubmit={sendMaterial} onClick={(event) => event.stopPropagation()}>
                <fieldset>
                  <legend>Куда прислать</legend>
                  <div className="intent-row">
                    {form.channels.map((item) => (
                      <label key={item.value} className={channel === item.value ? "is-on" : ""}>
                        <input
                          type="radio"
                          name="instrument-channel"
                          value={item.value}
                          checked={channel === item.value}
                          onChange={() => setChannel(item.value)}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label htmlFor="instrument-contact">{form.channelHints[channel]}</label>
                <div className="instrument-form-row">
                  <input
                    id="instrument-contact"
                    type={channel === "email" ? "email" : "text"}
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder={form.channelHints[channel]}
                    required
                    disabled={sending}
                  />
                  <button type="submit" disabled={sending}>
                    {gift.cta}
                  </button>
                </div>
                {submitError ? (
                  <p className="instrument-note" role="alert">
                    Не удалось отправить. Попробуйте ещё раз.
                  </p>
                ) : null}
              </form>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
