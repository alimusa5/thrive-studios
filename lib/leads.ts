/**
 * Durable record of every audit request.
 *
 * SERVER ONLY. This module reads the Supabase service-role key, which bypasses
 * Row Level Security — it must never be imported into a client component, and
 * its env vars must never be prefixed NEXT_PUBLIC_.
 *
 * Why plain `fetch` rather than @supabase/supabase-js: this is a single insert
 * against PostgREST, the same shape as the Resend call sitting beside it in the
 * contact route. Adding the SDK for one INSERT would pull a realtime client and
 * auth machinery into the server bundle for nothing. If you later want to
 * query, filter or subscribe, swap this one function for the SDK — nothing
 * else in the app touches the database.
 */

export type Lead = {
  name: string;
  email: string;
  instagram: string;
  message: string;
};

export type SaveResult = "saved" | "unconfigured" | "failed";

/** Below the route's maxDuration, so a slow database cannot eat the request. */
const SAVE_TIMEOUT_MS = 8_000;

export async function saveLead(lead: Lead): Promise<SaveResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Not configured is a legitimate state: the site is designed to work on
  // email alone, so a deploy without a database still takes enquiries.
  if (!url || !key) return "unconfigured";

  try {
    const res = await fetch(
      `${url.replace(/\/+$/, "")}/rest/v1/audit_requests`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          // Nothing reads the inserted row back, so do not pay for it.
          Prefer: "return=minimal",
        },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(SAVE_TIMEOUT_MS),
      },
    );

    if (!res.ok) {
      console.error(
        "[leads] Supabase rejected the insert:",
        res.status,
        await res.text().catch(() => "(no body)"),
      );
      return "failed";
    }
    return "saved";
  } catch (error) {
    console.error("[leads] Supabase insert failed:", error);
    return "failed";
  }
}
