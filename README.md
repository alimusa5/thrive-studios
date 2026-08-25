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

Four things are placeholders. All four are in **`lib/content.ts`** except the
last.

| What | Where | Currently |
| --- | --- | --- |
| Your inbox | `lib/content.ts` → `site.email` | `hello@thrivestudios.com` |
| Your Instagram handle | `lib/content.ts` → `site.instagram` | `thrivestudios` — set to `null` to hide the footer link |
| Your live domain | `NEXT_PUBLIC_SITE_URL` env var | falls back to `https://thrivestudios.com` |
| Contact form delivery | env vars — see below | not connected; the form says so honestly |

Until the form is connected it does **not** fail silently: it returns a 503 and
the page tells the visitor to email you directly, with a working `mailto:` link.

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

## Connecting the contact form

The form posts to `/api/contact`, which sends through
[Resend](https://resend.com). Set three environment variables:

```bash
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO_EMAIL=you@yourdomain.com
CONTACT_FROM_EMAIL="Thrive Studios <hello@yourdomain.com>"
```

Locally, put them in `.env.local` (copy `.env.example`). On Vercel, add them
under **Settings → Environment Variables**, then redeploy.

**All three are required.** If any one is missing the form refuses to send and
says so — it deliberately does *not* fall back to the address in
`lib/content.ts`, because that would quietly deliver real enquiries to a
placeholder domain while reporting success.

`CONTACT_FROM_EMAIL` must be an address on a domain you have verified in
Resend. Before your own domain is verified you can use
`Thrive Studios <onboarding@resend.dev>` to test.

Enquiries arrive with **Reply-To set to the sender**, so you can just hit reply.

The route also handles: server-side re-validation, a honeypot (bots get a
silent `200`), a per-IP rate limit of 5/minute, a 10s send timeout, refusal of
over-long messages rather than silent truncation, and a **no-JavaScript
fallback** — the form is a real `POST` to `/api/contact`, which answers a
browser submit with a plain branded confirmation page. The rate limit is per
serverless instance, so it is a speed bump rather than a guarantee; if the form
ever gets seriously targeted, swap it for Vercel KV / Upstash.

⚠️ **The honeypot field's name must stay meaningless.** Calling it `company`
with a `Company` label — the obvious choice — makes Chrome autofill it from a
saved address profile, so a real person's enquiry trips the trap and is
silently discarded. `autocomplete="off"` does not prevent this.

### Two choices worth revisiting

Both are one-line changes, called out because they are judgement calls rather
than requirements:

- **The Instagram handle is optional.** The brief asked to collect it, and an
  optional field still collects it — but requiring one turns away every creator
  whose audience is on YouTube, TikTok, or a newsletter. To make it required,
  drop the `handle.length > 0 &&` guard in `validate()` in
  `components/ContactSection.tsx` and re-add the check in the API route.
- **There is no reply-time promise.** An earlier draft said "within two
  business days" — that is a commitment only you can make, so it was removed
  rather than invented on your behalf. If you want one, it belongs in
  `contact.steps` and `contact.successBody` in `lib/content.ts`.

---

## Deploying

Push to GitHub, then import the repo at [vercel.com/new](https://vercel.com/new).
Framework detection, build command and output are all automatic. Add the
environment variables above before the first deploy if you want the form live
immediately.

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
```

## Checks

```bash
npm run typecheck
npm run build
```
