import { NextResponse } from "next/server";
import { contact, site } from "@/lib/content";

export const runtime = "nodejs";
export const maxDuration = 15;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 200, email: 200, instagram: 80, message: 5000 } as const;
/** Below `maxDuration`, so a hung provider still hits the friendly error. */
const SEND_TIMEOUT_MS = 10_000;

/**
 * Best-effort throttle. Serverless instances do not share this map, so it is
 * a speed bump rather than a guarantee — the honeypot does the real work.
 * Swap for Upstash/KV if the form ever gets seriously targeted.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function clamp(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** HTML only. The plain-text alternative must NOT be escaped. */
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
 * `CONTACT_TO_EMAIL`. Those can differ, and the env one is not something an
 * anonymous caller should be able to read back out of a failure response.
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
<a href="/" style="display:inline-block;padding:.875rem 1.75rem;background:#c6ff4d;color:#0b0d12;font-weight:600;text-decoration:none;border-radius:2px">Back to ${escapeHtml(site.name)}</a>
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
      ? htmlReply(200, "Message sent", "Thanks — I have got it.")
      : NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return reject(429, "That is a few messages in quick succession — try again in a minute.");
  }

  const name = clamp(body.name, LIMITS.name);
  const email = clamp(body.email, LIMITS.email);
  const instagram = clamp(body.instagram, LIMITS.instagram).replace(/^@/, "");
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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  // `to` is checked HERE, not defaulted to site.email. Falling back meant that
  // with a key and a from-address configured but this one missing, enquiries
  // were delivered to whatever placeholder was sitting in content.ts — a
  // domain the owner may not even control — and everything reported success.
  if (!apiKey || !from || !to) {
    console.error(
      "[contact] Email delivery is not configured. Need RESEND_API_KEY, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL.",
    );
    return reject(
      503,
      `The form is not connected to an inbox yet. Please email ${site.email} directly.`,
    );
  }

  const subject = `Audit request — ${name} (@${instagram})`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Instagram: https://instagram.com/${instagram}`,
    "",
    "About their audience:",
    message,
  ].join("\n");

  const handleRow = `<tr><td style="padding:8px 0;font-size:13px;color:#8b8d94">Instagram</td>
        <td style="padding:8px 0;font-size:14px"><a href="https://instagram.com/${encodeURIComponent(instagram)}" style="color:#c6ff4d;text-decoration:none">@${escapeHtml(instagram)}</a></td></tr>`;

  const html = `<!doctype html><html><body style="margin:0;background:#0b0d12;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#171a21;border:1px solid #1f232c">
<tr><td style="padding:28px 28px 8px">
  <div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8b8d94">Audit request</div>
  <div style="margin-top:10px;font-size:22px;font-weight:600;color:#f5f3ee">${escapeHtml(name)}</div>
</td></tr>
<tr><td style="padding:12px 28px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="padding:8px 0;font-size:13px;color:#8b8d94;width:110px">Email</td>
        <td style="padding:8px 0;font-size:14px"><a href="mailto:${escapeHtml(email)}" style="color:#c6ff4d;text-decoration:none">${escapeHtml(email)}</a></td></tr>
    ${handleRow}
  </table>
</td></tr>
<tr><td style="padding:8px 28px 28px">
  <div style="border-top:1px solid #1f232c;padding-top:18px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8b8d94">About their audience</div>
  <div style="margin-top:12px;font-size:15px;line-height:1.65;color:#f5f3ee;white-space:pre-wrap">${escapeHtml(message)}</div>
</td></tr>
</table>
</body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, reply_to: email, subject, text, html }),
      // Without this a hung provider runs out the whole function budget and
      // the caller gets a platform timeout instead of the friendly fallback.
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error("[contact] Resend rejected the send:", res.status, await res.text());
      return reject(502, `That did not send. Please email ${site.email} directly.`);
    }
  } catch (error) {
    console.error("[contact] Send failed:", error);
    return reject(502, `That did not send. Please email ${site.email} directly.`);
  }

  return isFormPost
    ? htmlReply(200, contact.successTitle.replace(/.$/, ""), contact.successBody)
    : NextResponse.json({ ok: true });
}
