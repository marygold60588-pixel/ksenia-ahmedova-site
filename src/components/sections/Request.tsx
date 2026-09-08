import { useRef, useState, type FormEvent } from "react";
import BlurText from "@/components/bits/BlurText";
import ScrollReveal from "@/components/bits/ScrollReveal";
import { site } from "@/content";
import type { ContactChannel, LeadIntent } from "@/content/types";
import { submitLead } from "@/lib/leads";

export default function Request() {
  const { form } = site;
  const [intent, setIntent] = useState<LeadIntent>("consultation");
  const [channel, setChannel] = useState<ContactChannel>("telegram");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const goalSent = useRef(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending || done) return;
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
      intent,
      contactChannel: channel,
      message: message.trim() || undefined,
      source: "site-form",
    });
    setSending(false);
    if (!result.ok) {
      setSubmitError(true);
      return;
    }
    setDone(true);
    if (!goalSent.current) {
      goalSent.current = true;
      window.ym?.(112330836, "reachGoal", "form_submit_success");
    }
  };

  return (
    <section className="section request-wrap" id="request">
      <div className="request">
        <div className="request-copy">
          <p className="kicker">{form.kicker}</p>
          <BlurText text={form.title} as="h2" className="section-title" />
          <ScrollReveal>
            <p className="section-lead">{form.lead}</p>
          </ScrollReveal>
        </div>

        {done ? (
          <p className="request-success">{form.success}</p>
        ) : (
          <form className="request-form" onSubmit={onSubmit}>
            <label>
              {form.nameLabel}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </label>
            <fieldset>
              <legend>{form.channelLabel}</legend>
              <div className="intent-row">
                {form.channels.map((item) => (
                  <label key={item.value} className={channel === item.value ? "is-on" : ""}>
                    <input
                      type="radio"
                      name="contactChannel"
                      value={item.value}
                      checked={channel === item.value}
                      onChange={() => setChannel(item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label>
              {form.contactLabel}
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder={form.channelHints[channel]}
                type={channel === "email" ? "email" : "text"}
                autoComplete={channel === "email" ? "email" : "off"}
                required
              />
            </label>
            <fieldset>
              <legend>{form.intentLabel}</legend>
              <div className="intent-row">
                {form.intents.map((item) => (
                  <label key={item.value} className={intent === item.value ? "is-on" : ""}>
                    <input
                      type="radio"
                      name="intent"
                      value={item.value}
                      checked={intent === item.value}
                      onChange={() => setIntent(item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="request-message">
              {form.messageLabel}
              <textarea
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>
            <div className="request-consent">
              <label className="request-consent-label" htmlFor="request-consent">
                <input
                  id="request-consent"
                  type="checkbox"
                  checked={consent}
                  aria-invalid={consentError}
                  aria-describedby={consentError ? "request-consent-error" : undefined}
                  onChange={(event) => {
                    setConsent(event.target.checked);
                    if (event.target.checked) setConsentError(false);
                  }}
                />
                <span className="request-consent-box" aria-hidden="true" />
                <span className="request-consent-text">
                  Я согласна на обработку персональных данных и принимаю{" "}
                  <a
                    className="request-privacy-link"
                    href="#request"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Политику конфиденциальности
                  </a>
                </span>
              </label>
              {consentError ? (
                <p className="request-consent-error" id="request-consent-error" role="alert">
                  Чтобы отправить заявку, отметьте согласие на обработку персональных данных.
                </p>
              ) : null}
              {submitError ? (
                <p className="request-consent-error" role="alert">
                  Не удалось отправить заявку. Попробуйте ещё раз.
                </p>
              ) : null}
            </div>
            <button className="btn btn-solid" type="submit" disabled={sending}>
              {form.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
