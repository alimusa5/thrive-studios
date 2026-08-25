"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";
import { contact, site } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";
type Field = "name" | "email" | "instagram" | "message";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Mirrors the server cap so a long message is refused, never silently cut. */
const MESSAGE_MAX = 5000;

function validate(values: Record<Field, string>) {
  const errors: Partial<Record<Field, string>> = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!EMAIL.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  // Required, unlike an ordinary contact form: the handle IS the thing being
  // audited, and it is the second follow-up channel. Without it there is no
  // audit to send.
  if (values.instagram.trim().replace(/^@/, "").length < 2)
    errors.instagram = "I need your handle to review your audience.";
  if (values.message.trim().length < 10)
    errors.message = "A sentence or two is enough — who follows you, and what do they ask for?";
  return errors;
}

export default function ContactSection() {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    email: "",
    instagram: "",
    message: "",
  });
  const successRef = useRef<HTMLDivElement>(null);

  // On success the form unmounts and focus would fall to <body>, leaving a
  // keyboard or screen-reader user with no idea anything happened.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const set = (field: Field) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear a field's error as soon as the person starts fixing it.
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`${id}-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const form = new FormData(event.currentTarget);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          instagram: values.instagram.trim().replace(/^@/, ""),
          // Honeypot: bots fill it, people never see it.
          ts_hp: String(form.get("ts_hp") ?? ""),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  const busy = status === "submitting";

  return (
    <section id="contact" className="section border-t border-line">
      <div className="shell">
        {/* Splits at lg, not md. At 768px a 5/7 split leaves the form block
            381px wide, and after its padding the side-by-side Name/Email
            inputs measured 133px each — an email address is unreadable in
            that. Stacked until 1024px, they get 292px. */}
        <div className="grid gap-12 sm:gap-14 lg:grid-cols-12 lg:gap-x-14">
          {/* --- Left: the offer ----------------------------------------- */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel>{contact.eyebrow}</SectionLabel>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-6 text-h1 text-bone sm:mt-7 md:mt-8">
                {contact.headline}
              </h2>
            </Reveal>

            <Reveal delay={150}>
              <p className="mt-6 text-lead text-ash sm:mt-7">{contact.body}</p>
            </Reveal>

            <Reveal delay={210}>
              {/* The deliverable, itemised. This is what the form is trading
                  for — a named thing you receive converts far better than an
                  invitation to get in touch. */}
              <div className="mt-9 border-t border-line pt-8 sm:mt-10">
                <h3 className="eyebrow">{contact.deliverablesTitle}</h3>
                <ul className="mt-6 space-y-4">
                  {contact.deliverables.map((item) => (
                    <li key={item} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-[0.55rem] h-[5px] w-[5px] shrink-0 rotate-45 bg-volt"
                      />
                      <span className="text-[0.9375rem] leading-[1.6] text-bone">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 max-w-[46ch] text-[0.9375rem] leading-[1.6] text-ash">
                {contact.followUp}
              </p>

              {/* The one path that bypasses the form, so it has to ask for
                  the handle itself — otherwise an emailed enquiry arrives
                  with nothing to audit. */}
              <p className="mt-6 text-[0.9375rem] leading-[1.6] text-ash">
                Prefer email?{" "}
                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent(
                    "Audience audit request",
                  )}`}
                  className="link-underline break-words text-bone"
                >
                  {site.email}
                </a>{" "}
                — include your handle.
              </p>
            </Reveal>
          </div>

          {/* --- Right: the form ----------------------------------------- */}
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              {status === "success" ? (
                <div
                  ref={successRef}
                  role="status"
                  tabIndex={-1}
                  className="flex min-h-[20rem] flex-col items-start justify-center border border-line bg-graphite p-6 sm:min-h-[22rem] sm:p-8 md:p-12"
                >
                  <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-volt" />
                  <h3 className="mt-6 text-h2 text-bone">
                    {contact.successTitle}
                  </h3>
                  <p className="mt-4 max-w-[46ch] text-lead text-ash">
                    {contact.successBody}
                  </p>
                </div>
              ) : (
                /* method + action are the no-JS path. Without them a submit
                   before hydration does a GET to the current URL, which loses
                   the enquiry AND puts the whole message in the address bar.
                   The route accepts form-encoded posts and answers with a
                   plain confirmation page. */
                <form
                  onSubmit={onSubmit}
                  method="post"
                  action="/api/contact"
                  noValidate
                  className="relative border border-line bg-graphite p-5 sm:p-8 md:p-10"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <TextField
                      id={`${id}-name`}
                      name="name"
                      label="Name"
                      placeholder="Your name"
                      autoComplete="name"
                      required
                      value={values.name}
                      onChange={set("name")}
                      error={errors.name}
                      disabled={busy}
                    />
                    <TextField
                      id={`${id}-email`}
                      name="email"
                      label="Email"
                      type="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      value={values.email}
                      onChange={set("email")}
                      error={errors.email}
                      disabled={busy}
                    />
                  </div>

                  <div className="mt-6">
                    <label className="field-label" htmlFor={`${id}-instagram`}>
                      Instagram handle
                    </label>
                    <div className="relative">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash"
                      >
                        @
                      </span>
                      <input
                        id={`${id}-instagram`}
                        name="instagram"
                        className="field pl-9"
                        placeholder="yourhandle"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        maxLength={80}
                        required
                        disabled={busy}
                        value={values.instagram}
                        onChange={(e) => set("instagram")(e.target.value)}
                        aria-invalid={errors.instagram ? "true" : undefined}
                        aria-describedby={
                          errors.instagram
                            ? `${id}-instagram-hint ${id}-instagram-error`
                            : `${id}-instagram-hint`
                        }
                      />
                    </div>
                    <p
                      id={`${id}-instagram-hint`}
                      className="mt-2 text-[0.8125rem] text-ash"
                    >
                      This is the account I will audit.
                    </p>
                    <FieldError id={`${id}-instagram-error`}>
                      {errors.instagram}
                    </FieldError>
                  </div>

                  <div className="mt-6">
                    <label className="field-label" htmlFor={`${id}-message`}>
                      About your audience
                    </label>
                    <textarea
                      id={`${id}-message`}
                      name="message"
                      rows={5}
                      maxLength={MESSAGE_MAX}
                      className="field"
                      /* Deliberately does NOT ask for niche or follower count:
                         both are on the profile whose handle they just gave,
                         so asking is friction that buys nothing. Ask only for
                         what the account cannot show. */
                      placeholder="What they keep asking you for, and anything you have already tried selling them..."
                      required
                      disabled={busy}
                      value={values.message}
                      onChange={(e) => set("message")(e.target.value)}
                      aria-invalid={errors.message ? "true" : undefined}
                      aria-describedby={
                        errors.message
                          ? `${id}-message-hint ${id}-message-error`
                          : `${id}-message-hint`
                      }
                    />
                    {/* States the minimum before submit rather than after. */}
                    <p
                      id={`${id}-message-hint`}
                      className="mt-2 text-[0.8125rem] text-ash"
                    >
                      A sentence or two is plenty — it just points me in the right
                      direction.
                    </p>
                    <FieldError id={`${id}-message-error`}>
                      {errors.message}
                    </FieldError>
                  </div>

                  {/* Honeypot. Off-screen rather than display:none so bots
                      that skip hidden inputs still fill it.

                      ⚠️ The name and label must stay MEANINGLESS. Called
                      "company" with a "Company" label — the obvious choice —
                      Chrome matches it against a saved address profile and
                      autofills it, so a real person's submission trips the
                      trap and is silently dropped with a 200. `autocomplete
                      ="off"` does not save you: Chrome ignores it on fields
                      it recognises as address fields. */}
                  <div
                    aria-hidden="true"
                    className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden"
                  >
                    <label htmlFor={`${id}-hp`}>Leave this field empty</label>
                    <input
                      id={`${id}-hp`}
                      name="ts_hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      className="btn btn-primary w-full sm:w-auto"
                      disabled={busy}
                    >
                      {busy ? contact.submittingLabel : contact.submitLabel}
                    </button>

                    {/* Static, so it does NOT live in the live region — an
                        aria-live node holding marketing copy announces itself
                        on load for no reason. */}
                    <p className="mt-4 max-w-[46ch] text-[0.8125rem] leading-[1.6] text-ash">
                      {contact.privacy}
                    </p>
                  </div>

                  <p aria-live="polite" className="sr-only">
                    {busy ? "Sending your details." : ""}
                  </p>

                  {serverError ? (
                    <p
                      role="alert"
                      className="mt-6 border-l-2 border-[#f87171] bg-[#f87171]/5 px-4 py-3 text-[0.875rem] text-bone"
                    >
                      {serverError}{" "}
                      <a
                        href={`mailto:${site.email}`}
                        className="link-underline text-volt"
                      >
                        Email me instead
                      </a>
                      .
                    </p>
                  ) : null}
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-[0.8125rem] text-[#f87171]">
      {children}
    </p>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  disabled,
  required,
  type = "text",
  ...rest
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  /* The form carries noValidate, so this never triggers the browser's own
     bubble — it exists purely so assistive tech announces the field as
     required, which nothing else on the page conveyed. */
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "email" | "text";
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="field"
        maxLength={200}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
