import { useState, type FormEvent } from "react";
import BlurText from "@/components/bits/BlurText";
import ScrollReveal from "@/components/bits/ScrollReveal";
import { site } from "@/content";
import type { LeadIntent } from "@/content/types";
import { submitLead } from "@/lib/leads";

export default function Request() {
  const { form } = site;
  const [intent, setIntent] = useState<LeadIntent>("consultation");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    await submitLead({
      name: name.trim(),
      contact: contact.trim(),
      intent,
      message: message.trim() || undefined,
      source: "site-form",
    });
    setSending(false);
    setDone(true);
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
            <label>
              {form.contactLabel}
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder={form.contactHint}
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
            <button className="btn btn-solid" type="submit" disabled={sending}>
              {form.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
