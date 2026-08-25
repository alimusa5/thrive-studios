/**
 * Immediate notification that an audit request came in.
 *
 * SERVER ONLY — reads the Resend API key.
 *
 * This is the *notification*; `lib/leads.ts` is the *record*. They are
 * deliberately independent and run in parallel: neither waits on the other,
 * and neither can fail the other. See the contact route for why a submission
 * succeeds when either one of them lands.
 *
 * Plain `fetch` rather than an SDK, matching lib/leads.ts — one HTTP POST does
 * not justify a dependency, and it keeps the timeout explicit.
 */

import { contact, site } from "@/lib/content";

export type Notification = {
  name: string;
  email: string;
  instagram: string;
  message: string;
};

export type NotifyResult = "sent" | "unconfigured" | "failed";

/** Below the route's maxDuration, so a hung provider cannot eat the request. */
const SEND_TIMEOUT_MS = 8_000;

/** HTML only. A plain-text alternative must NOT be escaped — escape once per format. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendAuditRequestEmail(
  req: Notification,
): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  // `to` is checked here rather than defaulting to site.email. Falling back
  // meant that with a key and a from-address set but this one missing,
  // enquiries went to whatever placeholder sat in content.ts.
  if (!apiKey || !from || !to) return "unconfigured";

  const subject = `Audit request — ${req.name} (@${req.instagram})`;

  const text = [
    `Name: ${req.name}`,
    `Email: ${req.email}`,
    `Instagram: https://instagram.com/${req.instagram}`,
    "",
    "About their audience:",
    req.message,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#0b0d12;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#171a21;border:1px solid #1f232c">
<tr><td style="padding:28px 28px 8px">
  <div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8b8d94">Audit request</div>
  <div style="margin-top:10px;font-size:22px;font-weight:600;color:#f5f3ee">${escapeHtml(req.name)}</div>
</td></tr>
<tr><td style="padding:12px 28px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="padding:8px 0;font-size:13px;color:#8b8d94;width:110px">Email</td>
        <td style="padding:8px 0;font-size:14px"><a href="mailto:${escapeHtml(req.email)}" style="color:#c6ff4d;text-decoration:none">${escapeHtml(req.email)}</a></td></tr>
    <tr><td style="padding:8px 0;font-size:13px;color:#8b8d94">Instagram</td>
        <td style="padding:8px 0;font-size:14px"><a href="https://instagram.com/${encodeURIComponent(req.instagram)}" style="color:#c6ff4d;text-decoration:none">@${escapeHtml(req.instagram)}</a></td></tr>
  </table>
</td></tr>
<tr><td style="padding:8px 28px 28px">
  <div style="border-top:1px solid #1f232c;padding-top:18px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8b8d94">About their audience</div>
  <div style="margin-top:12px;font-size:15px;line-height:1.65;color:#f5f3ee;white-space:pre-wrap">${escapeHtml(req.message)}</div>
</td></tr>
<tr><td style="padding:0 28px 24px">
  <div style="border-top:1px solid #1f232c;padding-top:16px;font-size:12px;line-height:1.6;color:#8b8d94">
    Also saved to Supabase. Reply straight to this email to reach ${escapeHtml(req.name)} —
    it is addressed to them, not to ${escapeHtml(site.name)}.
  </div>
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
      // reply_to is the sender, so hitting reply reaches the creator directly.
      body: JSON.stringify({
        from,
        to,
        reply_to: req.email,
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(
        "[notify] Resend rejected the send:",
        res.status,
        await res.text().catch(() => "(no body)"),
      );
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("[notify] Send failed:", error);
    return "failed";
  }
}

/**
 * The thank-you that goes back to the person who submitted.
 *
 * Sent from the route inside `after()`, so it never delays the visitor's
 * response and only ever runs once the enquiry has actually been captured —
 * an auto-reply promising an audit for a submission that failed would be
 * worse than no auto-reply at all.
 *
 * ⚠️ This one sends to a STRANGER's address, which is the reason the Resend
 * domain must be verified. The shared `onboarding@resend.dev` sender can only
 * deliver to your own account address, so with it configured the owner
 * notification arrives and this silently does not.
 */
export async function sendAutoReply(req: Notification): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  // Replies must reach a person, not the branded sending address.
  const replyTo = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !replyTo) return "unconfigured";

  const firstName = req.name.trim().split(/\s+/)[0] || req.name.trim();
  const subject = `Your audience audit — ${site.name}`;

  const text = [
    `Thanks, ${firstName}.`,
    "",
    `I have got your request and I will go through @${req.instagram} myself.`,
    "",
    "What you get back:",
    ...contact.deliverables.map((d) => `  - ${d}`),
    "",
    contact.followUp,
    "",
    `If @${req.instagram} is not the right account, just reply to this email and tell me.`,
    "",
    "— Aon",
    site.name,
  ].join("\n");

  const bullets = contact.deliverables
    .map(
      (d) =>
        `<tr>
      <td valign="top" style="padding:0 10px 10px 0;width:14px">
        <div style="width:5px;height:5px;background:#c6ff4d;transform:rotate(45deg);margin-top:8px"></div>
      </td>
      <td valign="top" style="padding:0 0 10px;font-size:15px;line-height:1.6;color:#f5f3ee">${escapeHtml(d)}</td>
    </tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#0b0d12;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Your audience audit is on the way.</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#171a21;border:1px solid #1f232c">
<tr><td style="padding:32px 28px 8px">
  <div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8b8d94">Audience audit</div>
  <div style="margin-top:12px;font-size:26px;font-weight:600;color:#f5f3ee">Thanks, ${escapeHtml(firstName)}.</div>
  <div style="margin-top:14px;font-size:15px;line-height:1.65;color:#8b8d94">
    I have got your request and I will go through
    <a href="https://instagram.com/${encodeURIComponent(req.instagram)}" style="color:#c6ff4d;text-decoration:none">@${escapeHtml(req.instagram)}</a>
    myself.
  </div>
</td></tr>
<tr><td style="padding:20px 28px 4px">
  <div style="border-top:1px solid #1f232c;padding-top:20px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8b8d94">${escapeHtml(contact.deliverablesTitle)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px">${bullets}</table>
</td></tr>
<tr><td style="padding:8px 28px 28px">
  <div style="font-size:15px;line-height:1.65;color:#8b8d94">${escapeHtml(contact.followUp)}</div>
  <div style="margin-top:20px;padding-top:18px;border-top:1px solid #1f232c;font-size:13px;line-height:1.6;color:#8b8d94">
    Not the right account? Just reply to this email and tell me.
  </div>
  <div style="margin-top:20px;font-size:15px;line-height:1.6;color:#f5f3ee">— Aon<br>
    <span style="color:#8b8d94">${escapeHtml(site.name)}</span>
  </div>
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
      body: JSON.stringify({
        from,
        to: req.email,
        reply_to: replyTo,
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(
        "[notify] Auto-reply rejected:",
        res.status,
        await res.text().catch(() => "(no body)"),
      );
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("[notify] Auto-reply failed:", error);
    return "failed";
  }
}
