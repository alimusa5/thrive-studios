import { after, NextResponse } from "next/server";
import { contact, site } from "@/lib/content";
import { saveLead } from "@/lib/leads";
import { sendAuditRequestEmail, sendAutoReply } from "@/lib/notify";

export const runtime = "nodejs";
export const maxDuration = 15;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 200, email: 200, instagram: 80, message: 5000 } as const;

/**
 * Best-effort throttle. Serverless instances do not share this map, so it is
 * a speed bump rather than a guarantee — the honeypot does the real work.
 * Swap for Upstash/KV if the form ever gets seriously targeted.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function recentHits(key: string, now: number): number[] {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.set(key, recent);
  return recent;
}

/** Peek. Does NOT count the attempt — see recordAttempt. */
function overLimit(key: string): boolean {
  return recentHits(key, Date.now()).length >= MAX_PER_WINDOW;
}

/**
 * Counts one attempt. Called only once a submission has passed validation and
 * is about to be stored: counting rejected submissions instead meant someone
 * fixing two typos spent three of their five attempts and got locked out of
 * the form mid-correction.
 */
function recordAttempt(key: string): void {
  const now = Date.now();
  const recent = recentHits(key, now);
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
}

/**
 * People paste a profile URL as often as they type a handle, and the field's
 * decorative "@" prefix does not stop them. Left alone,
 * "https://instagram.com/name" survived every check and was stored verbatim,
 * so the handle you audit against would not resolve.
 * Normalising beats rejecting here: a 422 turns a salvageable lead away.
 */
function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@/, "");
}

function clamp(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Errors name `site.email` — the address already printed on the page — never
 * `CONTACT_TO_EMAIL`. The two can differ, and an environment value is not
 * something an anonymous caller should be able to read out of a failure.
 */
function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** The no-JS path gets a page, not JSON. */
function htmlReply(status: number, heading: string, body: string) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(heading)} — ${escapeHtml(site.name)}</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0d12;color:#f5f3ee;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif">
<main style="max-width:34rem;padding:2rem">
<div style="width:8px;height:8px;background:#c6ff4d;transform:rotate(45deg)"></div>
<h1 style="margin:1.5rem 0 0;font-size:2rem;font-weight:600;letter-spacing:-.02em">${escapeHtml(heading)}</h1>
<p style="margin:1rem 0 2rem;font-size:1rem;line-height:1.65;color:#8b8d94">${escapeHtml(body)}</p>
<a href="/#contact" style="display:inline-block;padding:.875rem 1.75rem;background:#c6ff4d;color:#0b0d12;font-weight:600;text-decoration:none;border-radius:2px">Back to the form</a>
</main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function POST(request: Request) {
  // A form-encoded body means the browser submitted natively — i.e. JS never
  // hydrated. Same processing, but the answer has to be a page.
  const contentType = request.headers.get("content-type") ?? "";
  const isFormPost =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  let body: Record<string, unknown>;
  try {
    if (isFormPost) {
      body = Object.fromEntries(await request.formData());
    } else {
      body = ((await request.json()) ?? {}) as Record<string, unknown>;
    }
  } catch {
    return isFormPost
      ? htmlReply(400, "That did not go through", `Please try again, or email ${site.email} directly.`)
      : fail(400, "Could not read that submission.");
  }

  const reject = (status: number, message: string) =>
    isFormPost ? htmlReply(status, "That did not go through", message) : fail(status, message);

  // Honeypot. Answer 200 so a bot cannot tell it was caught.
  // Field name is deliberately meaningless — see the comment in
  // ContactSection.tsx for why it must never be called "company".
  if (clamp(body.ts_hp, 200).length > 0) {
    return isFormPost
      ? htmlReply(200, contact.successTitle.replace(/\.$/, ""), contact.successBody)
      : NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (overLimit(ip)) {
    return reject(429, "That is a few messages in quick succession — try again in a minute.");
  }

  const name = clamp(body.name, LIMITS.name);
  const email = clamp(body.email, LIMITS.email);
  const instagram = normalizeHandle(clamp(body.instagram, LIMITS.instagram));
  const rawMessage = typeof body.message === "string" ? body.message.trim() : "";

  // Re-validated server side: the client checks are for the person filling
  // the form, never for us.
  if (name.length < 2) return reject(422, "Please include your name.");
  if (!EMAIL.test(email)) return reject(422, "Please include a valid email address.");
  // Required, unlike an ordinary contact form: without a handle there is no
  // audience to audit and no second channel to follow up on.
  if (instagram.length < 2) return reject(422, "Please include your Instagram handle.");
  if (rawMessage.length < 10) return reject(422, "Please include a little more detail.");
  // Refuse an over-long message rather than silently truncating it — a lead
  // that arrives with its last paragraph missing is worse than one told to
  // trim. The client sets the same cap via maxLength.
  if (rawMessage.length > LIMITS.message) {
    return reject(422, `That message is a little long — please keep it under ${LIMITS.message} characters.`);
  }
  const message = rawMessage;

  // Valid and about to be stored — now it counts against the window.
  recordAttempt(ip);

  /**
   * Two independent captures, in PARALLEL — the database row is the durable
   * record, the email is the immediate ping. Neither waits on the other, so
   * "right away" stays right away rather than costing two round trips.
   *
   * ⚠️ The success rule is: DID THE LEAD SURVIVE ANYWHERE? Not "did everything
   * work". Insisting on both would turn a Resend blip into a failure message
   * for an enquiry that is sitting safely in the table — pushing the visitor
   * to send a duplicate and making a working site look broken. Insisting on
   * neither would let a total outage swallow an enquiry while saying "Got it",
   * which is the one outcome that must never happen.
   *
   * Neither helper throws; both catch and report a status.
   */
  const [saved, emailed] = await Promise.all([
    saveLead({ name, email, instagram, message }),
    sendAuditRequestEmail({ name, email, instagram, message }),
  ]);

  if (saved !== "saved") {
    console.error(
      `[contact] NOT stored (${saved}). Email status: ${emailed}.`,
      saved === "unconfigured"
        ? "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        : "",
    );
  }
  if (emailed !== "sent") {
    console.error(
      `[contact] NOT emailed (${emailed}). Stored status: ${saved}.`,
      emailed === "unconfigured"
        ? "Set RESEND_API_KEY, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL."
        : "",
    );
  }

  // Both failed: nothing captured this enquiry anywhere. Say so.
  if (saved !== "saved" && emailed !== "sent") {
    console.error(
      "[contact] THIS ENQUIRY WAS LOST — neither the database nor the email accepted it.",
    );
    return reject(
      saved === "unconfigured" && emailed === "unconfigured" ? 503 : 502,
      `That did not go through. Please email ${site.email} directly.`,
    );
  }

  /**
   * The thank-you back to the sender, in `after()` — it runs once the response
   * has been sent, so the visitor never waits on a courtesy email.
   *
   * Placed BELOW the failure return on purpose: an auto-reply promising an
   * audit for a submission that was just refused would be worse than none.
   * Nothing here can change what the visitor already saw.
   */
  after(async () => {
    const replied = await sendAutoReply({ name, email, instagram, message });
    if (replied !== "sent") {
      console.error(
        `[contact] Auto-reply NOT sent (${replied}) to ${email}.`,
        replied === "unconfigured"
          ? "Set RESEND_API_KEY, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL."
          : "Note this one needs a VERIFIED Resend domain — onboarding@resend.dev only delivers to your own address.",
      );
    }
  });

  return isFormPost
    ? htmlReply(200, contact.successTitle.replace(/\.$/, ""), contact.successBody)
    : NextResponse.json({ ok: true });
}
