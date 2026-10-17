import { FileText, MapPin, Phone } from "lucide-react";
import { contact, socials } from "@/content/lab";
import { ContactForm } from "../contact-form";
import { CopyEmail } from "../copy-email";
import { LabFooter } from "../footer";

/**
 * The resolution. The camera settles low on the horizon and the core waits,
 * warm, at the end of the path — framed between the title above and the two
 * ways to reach out below: the email (fastest), and the form.
 */
export function Contact() {
  return (
    <section
      id="contact"
      data-anchor="contact"
      className="l-sec l-contact"
      aria-labelledby="contact-title"
    >
      <div className="l-wrap l-contact-inner">
        <div className="l-contact-top">
          <p className="l-label" data-reveal>
            <span className="l-ember">06</span>
            <span>Contact</span>
          </p>
          <h2
            id="contact-title"
            className="l-display l-contact-title"
            data-reveal="lines"
          >
            {contact.title.map((w, i) => (
              <span
                key={w}
                className="l-line"
                style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
              >
                <span>{w}</span>
              </span>
            ))}
            <span
              className="l-line"
              style={{ "--d": "0.16s" } as React.CSSProperties}
            >
              <span>
                <em className="l-serif">{contact.accentWord}</em>
              </span>
            </span>
          </h2>
        </div>

        {/* the space between is the world's final composition: the core on the horizon */}
        <div className="l-contact-bottom" data-reveal>
          <div className="l-contact-card l-scrim">
            <p className="l-lead l-contact-line">{contact.line}</p>

            <div className="l-contact-cta">
              <a href={`mailto:${contact.email}`} className="l-email">
                {contact.email}
              </a>
              <CopyEmail email={contact.email} />
            </div>

            <ul className="l-contact-links">
              {socials
                .filter((s) => s.href.startsWith("http"))
                .map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      <s.icon aria-hidden="true" size={16} strokeWidth={2} />
                      {s.label}
                      <span className="l-sr"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              <li>
                <a
                  href={contact.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText aria-hidden="true" size={16} strokeWidth={2} />
                  Résumé
                  <span className="l-sr"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                  <Phone aria-hidden="true" size={16} strokeWidth={2} />
                  {contact.phone}
                </a>
              </li>
              <li>
                <span>
                  <MapPin aria-hidden="true" size={16} strokeWidth={2} />
                  {contact.location}
                </span>
              </li>
            </ul>
          </div>

          <ContactForm email={contact.email} />
        </div>
      </div>

      <LabFooter />
    </section>
  );
}
