# Thrive Studios

Single-page site for Thrive Studios — *I help creators convert their audience
into revenue.*

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

---

## Before you go live

| What | Where | Currently |
| --- | --- | --- |
| Lead storage | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | not connected |
| Email notification | `RESEND_API_KEY` + `CONTACT_TO_EMAIL` + `CONTACT_FROM_EMAIL` | not connected |
| Your live domain | `NEXT_PUBLIC_SITE_URL`, or `site.url` in `lib/content.ts` | assumed `https://thrivestudios.io` from the .io email — change it if the site lives elsewhere |

Every submission is captured **twice**: a row in Supabase and an email to you.
Set both up — but note the form keeps working on either one alone, so you can
ship with one configured and add the other later.

With neither connected the form does **not** fail silently: it returns a 503
and tells the visitor to email `contact@thrivestudios.io` instead.

---


## Editing the copy

**Every word on the site lives in [`lib/content.ts`](lib/content.ts).** The
components are pure layout. Change the file, save, done — no component edits
needed for wording, service names, list items, or button labels.

Two things to know:

- `hero.headline` and the section headlines are **arrays** — one entry per
  rendered line, so you control exactly where the line breaks.
- The type sizes are fitted to the current wording. If you make the hero
  headline much longer, re-check it at 320px wide; the clamps in
  `app/globals.css` have a comment explaining how they were derived.

---

## How a request reaches you

One submission, three outcomes. The two **captures** fire in parallel so
neither waits on the other; the thank-you goes out after the response:

```
                          ┌─→ INSERT into Supabase   (the durable record)
form → POST /api/contact ─┤
                          └─→ Resend → your inbox    (the immediate ping)
                                  │
                                  └─ after() ─→ thank-you to the sender
```

The thank-you runs inside Next's `after()`, so the visitor never waits on a
courtesy email — and it sits **below** the failure return, so a refused
submission can never trigger an auto-reply promising an audit. It greets them
by first name, confirms the handle you will be auditing (with an invitation to
correct it), lists the same three deliverables as the page, and sets
**Reply-To to your inbox** so a reply reaches you rather than the sending
address.

⚠️ **The auto-reply needs a VERIFIED Resend domain.** It sends to a stranger's
address, and `onboarding@resend.dev` only delivers to your own account email —
so with the test sender configured, your notification arrives and the visitor's
thank-you silently does not. It is logged when that happens.

The email is titled *Audit request — Name (@handle)*, carries the handle as a
clickable link, and sets **Reply-To to the sender** — so hitting reply reaches
the creator, not yourself. It lands in Google Workspace like any other mail;
Resend never becomes your mailbox, it only does the sending.

The row is what you work from afterwards. Open the Supabase **Table Editor**,
or run:

```sql
select created_at, name, email, instagram, message
from audit_requests
where status = 'new'
order by created_at desc;
```

### ⚠️ The success rule: did the lead survive *anywhere*?

Not "did everything work". This is the part worth understanding before you
change the route:

| Supabase | Email | Visitor sees | Why |
| --- | --- | --- | --- |
| ✅ | ✅ | "Got it." | Normal. |
| ✅ | ❌ | "Got it." | The lead is safe in the table. Failing here would push someone to send a duplicate and make a working site look broken. Logged loudly. |
| ❌ | ✅ | "Got it." | You have the email. Nothing is lost. Logged loudly. |
| ❌ | ❌ | 502 + `mailto:` | Nothing captured it. This is the one case that must never report success. |

So a Resend outage costs you the *ping*, not the lead; a Supabase outage costs
you the *record*, not the lead. Both would have to break together to lose
anything, which is what the `mailto:` on the page is for.

Every non-success is logged with the status of *both* sides and the exact env
vars to set, so a half-configured deploy is obvious in the Vercel logs rather
than silent.

### Want a Slack or Discord ping too?

No app change needed. In Supabase, **Database → Webhooks** fires on `INSERT`
into `audit_requests` and can POST to an incoming webhook.


### Worth revisiting

- **The Instagram handle is required.** It is the account being audited and
  your second follow-up channel, so a submission without one is not actionable.
  The trade-off is real though: a creator whose audience lives on YouTube,
  TikTok or a newsletter cannot submit at all. To relax it, add a
  `handle.length > 0 &&` guard to the instagram check in `validate()`
  (`components/ContactSection.tsx`) and drop the matching check in
  `app/api/contact/route.ts`.
- **There is no reply-time promise.** An earlier draft said "within two
  business days" — that is a commitment only you can make, so it was removed
  rather than invented on your behalf. If you want one, it belongs in
  `contact.followUp` and `contact.successBody` in `lib/content.ts`.

---


## The contact section is a lead magnet

It is not a "get in touch" box, and the copy is built around that. The visitor
trades four details for a **free audience audit**, and the audit is the pitch:
you review their account, send it by email, follow up in their DMs, and take it
to a call from there. `lib/content.ts` → `contact` carries the offer
(`headline`, `body`), the deliverable (`deliverables`) and the follow-up
sequence (`followUp`).

That framing is why the **Instagram handle is required** — it is the thing being
audited — and why the submit button says "Send me my audit" rather than "Send".
An enquiry arrives in your inbox titled *Audit request — Name (@handle)*, with
the handle as a clickable link and Reply-To set to the sender.

If you ever change what you send them, change `deliverables` — three concrete
bullets is what makes the form worth filling in.

---

## Lead storage (Supabase)

The form emails you **and** writes a row to Supabase, so an email outage or an
archived inbox cannot lose a lead. It is optional — with the Supabase vars
unset the site still takes enquiries by email and logs a warning on each one.

**Setup, once:**

1. Create a Supabase project.
2. Open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql), Run.
3. Copy **Project URL** (Settings → Data API) and the **`service_role`** key
   (Settings → API keys) into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

You read the leads in the Supabase **Table Editor**. There is no admin page in
the app and deliberately so — one less surface to secure.

⚠️ **The `service_role` key bypasses Row Level Security.** Never prefix it
`NEXT_PUBLIC_`, never import `lib/leads.ts` into a client component. Anything
`NEXT_PUBLIC_` is compiled into the browser bundle, and that key would let
anyone read every lead.

⚠️ **The table has RLS enabled with no policies, which is deny-all — and that
is correct, not an oversight.** The anon key is public; this table holds
strangers' names, emails and what they told you about their business. The
service-role key used by the route bypasses RLS, so inserts still work. Do not
add a policy "so I can read it from the browser".

**If this write fails**, the email still carries the lead and the visitor is
told "Got it." — see *The success rule* above. It is only when both this and
the email fail that a submission is refused.

The status column tracks your funnel: `new → audit_sent → dm_sent →
call_booked → client` (or `declined`). It is a CHECK constraint, so a typo is
rejected at insert rather than becoming a silent new bucket — **widen the CHECK
in the schema if you add a status.**

---

## Deploying

**1. Supabase** — create a project, run [`supabase/schema.sql`](supabase/schema.sql)
in the SQL Editor, and copy the Project URL and `service_role` key.

**1b. Resend** — create the account, add `thrivestudios.io` as a domain, add the
DNS records it gives you at your registrar, then create an API key. You only
need *sending*; the site never receives email. Until the domain verifies, ship
with `Thrive Studios <onboarding@resend.dev>` as the sender.

⚠️ **Your domain already handles your Google Workspace mail.** Resend will ask
for an SPF record — **merge** it into your existing `v=spf1` record rather than
adding a second one. Two SPF records on one domain is invalid and can break
your own inbox. DKIM is a separate TXT record and adds cleanly alongside
Google's; MX records are untouched either way.

**2. Vercel** — import the repo at [vercel.com/new](https://vercel.com/new).
Framework, build command and output all auto-detect. Add every variable from
`.env.example` under **Settings → Environment Variables** before the first
deploy.

**3. Domain** — add it in Vercel and follow their DNS instructions.

**4. Check it end to end** — submit the form as a visitor would. You should get
the email *and* see a matching row in the Supabase Table Editor. If only one
arrives, the Vercel logs name which side failed and which variables to set.

⚠️ **`NEXT_PUBLIC_SITE_URL` is inlined at build time.** Add or change it after
deploying and you must **redeploy**, or your canonical URL and social-card links
keep pointing at the old value. The other variables are read per request and
take effect immediately.

---

## The design system

`app/globals.css` is the single source of truth for colour, type, spacing and
motion. Read it before styling anything.

**Palette** — five brand colours, defined once in `@theme`:

| Token | Hex | Role | Contrast on midnight |
| --- | --- | --- | --- |
| `midnight` | `#0B0D12` | page ground | — |
| `graphite` | `#171A21` | raised surface (cards, form) | — |
| `bone` | `#F5F3EE` | primary text | 17.6:1 |
| `volt` | `#C6FF4D` | the single accent | 16.5:1 |
| `ash` | `#8B8D94` | secondary text | 5.87:1 |

Plus `line` / `line-strong` for hairlines, derived from the same family.

Everything on the page has been measured against WCAG AA — body text ≥ 4.5:1,
large text ≥ 3:1 — including the ghosted step numerals and the input
placeholders, both of which needed lifting from their first values.

**Type** — [Fraunces](https://fonts.google.com/specimen/Fraunces) for display
(variable, with `opsz 144 / SOFT 0 / WONK 0` for high stroke contrast and clean
letterforms) and
[Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) for
everything you read. Both self-hosted automatically by `next/font`, so there is
no request to Google at runtime.

Display sizes are fluid `clamp()` curves with a **non-zero intercept**, not a
flat floor. This is deliberate and the comment in `globals.css` says why: a flat
floor pins every phone to the same size, and at the obvious value
"Turn attention" measured exactly 272.0px against 272px of available width at a
320px viewport — so it wrapped and orphaned "Turn".

**Motion** is progressive enhancement only. The static page is already finished:
scroll reveals are switched on by JS, `prefers-reduced-motion` forces everything
visible, and a `<noscript>` block in the root layout does the same when JS is
off.

---

## Assets

| File | What it is |
| --- | --- |
| `public/logo-full.svg` / `.png` | the logo exactly as supplied, untouched |
| `public/logo-stacked.svg` | the same artwork cropped to its content by **viewBox alone** — no geometry changed. Used in the footer |
| `public/mark.svg` | just the T and its accent corner |
| `app/icon.svg` | favicon: the mark on a midnight rounded square, so it survives a light browser tab |
| `public/grain.svg` | the fine film grain over the whole page |

The header pairs the mark with **live type** rather than the stacked artwork.
That is a deliberate call, not a shortcut: in a 64px bar the outlined `STUDIOS`
line renders about 5px tall and reads as a smudge. The authentic lockup gets its
proper showing in the footer, where there is height for it. If you would rather
have the real artwork in the header too, swap `<Logo />` in
`components/SiteHeader.tsx` for an `<Image src="/logo-stacked.svg" />` and give
the bar more height.

---

## Structure

```
app/
  layout.tsx          fonts, metadata, JSON-LD, <noscript> reveal fallback
  page.tsx            section order — this is the whole page
  globals.css         the design system
  icon.svg            favicon
  api/contact/route.ts
components/
  SiteHeader.tsx      sticky bar + mobile menu
  Hero.tsx            headline, CTAs, the pipeline band
  Services.tsx        the six services, hairline grid
  Process.tsx         the three steps
  Manifesto.tsx       the full-bleed band between sections
  Audience.tsx        who it is for, plus fit / not-yet-a-fit lists
  ContactSection.tsx  the form (client component)
  SiteFooter.tsx
  Reveal.tsx          scroll-triggered entrance
  Logo.tsx            the mark, drawn from the supplied geometry
lib/content.ts        ALL copy
lib/leads.ts          Supabase insert (server only)
lib/notify.ts         Resend: your notification + the sender auto-reply (server only)
supabase/schema.sql   run this once in the SQL Editor
```

## Checks

```bash
npm run typecheck
npm run build
```
