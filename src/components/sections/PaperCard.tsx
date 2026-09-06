import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import ScrollReveal from "@/components/bits/ScrollReveal";
import BookReveal from "@/components/viz/BookReveal";
import { site } from "@/content";
import { submitLead } from "@/lib/leads";

export default function PaperCard() {
  const { gift } = site;
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const gesture = useRef({ x: 0, y: 0, dragged: false });

  const sendMaterial = async (event: FormEvent) => {
    event.preventDefault();
    if (!contact.trim()) return;
    await submitLead({
      name: "Гайд",
      contact: contact.trim(),
      intent: "gift",
      source: "paper-card",
    });
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
                <label htmlFor="instrument-contact">Куда прислать</label>
                <div className="instrument-form-row">
                  <input
                    id="instrument-contact"
                    type="text"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="Почта или Telegram"
                    required
                  />
                  <button type="submit">{gift.cta}</button>
                </div>
              </form>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
