/**
 * The site copy.
 *
 * Every headline, paragraph, list item and button label on the page comes
 * from here, so wording changes need no component edits. Two things do NOT
 * live here and are worth knowing about: the form field labels and their
 * validation messages (components/ContactSection.tsx), and the errors the
 * server shows a visitor (app/api/contact/route.ts).
 */

export const site = {
  name: "Thrive Studios",
  /**
   * Used for canonical URLs and social cards. Assumed from the .io email
   * address — set NEXT_PUBLIC_SITE_URL if the site lives somewhere else.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thrivestudios.io",
  oneLiner: "I help creators convert their audience into revenue.",
  description:
    "Thrive Studios builds the revenue infrastructure behind creators and online businesses — monetization strategy, digital products, funnels and launches, run end to end so you can keep creating.",
  email: "aonraza@thrivestudios.io",
  /** Set to null to remove the footer link entirely. */
  instagram: "aonraza_k",
} as const;

export const nav = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Who It's For", href: "#audience" },
  { label: "Contact", href: "#contact" },
] as const;

export const hero = {
  eyebrow: "Growth marketer for creators",
  headline: ["Turn attention", "into assets."],
  body: "I help creators turn engaged audiences into profitable digital product businesses. From strategy to execution, I build the systems that turn attention into revenue.",
  primaryCta: { label: "Get my free audit", href: "#contact" },
  secondaryCta: { label: "See what I do", href: "#services" },
  /** The pipeline, shown as a band on the fold line. */
  ticker: ["Audience", "Offer", "Product", "Funnel", "Launch", "Revenue"],
} as const;

export const services = {
  eyebrow: "What I Do",
  headline: ["The business behind", "the content."],
  intro:
    "You built the audience. I build the machine behind it — so your influence becomes income without you becoming a manager.",
  items: [
    {
      title: "Monetization Strategy",
      body: "The audit shows you where the revenue is. This is the plan that goes after it — pricing, sequencing, and what to build in what order.",
    },
    {
      title: "Ideal Offer Creation",
      body: "A vague idea becomes an offer with a clear promise, an obvious buyer, a reason to act now, and a price that holds up.",
    },
    {
      title: "Digital Product Creation",
      body: "Course, template, toolkit, membership — built end to end, from outline and content to delivery and the checkout that sells it.",
    },
    {
      title: "Funnel Strategy",
      body: "The path from a post to a purchase: hooks, landing page, email sequence and checkout, wired together so nothing leaks.",
    },
    {
      title: "Product Launch",
      body: "A launch runway with the sequencing, assets and week-of execution handled — run for you, not handed to you as a checklist.",
    },
    {
      title: "Growth Strategy",
      body: "What happens after launch: repeat buyers, back-end offers and the compounding revenue that makes this a business, not a spike.",
    },
  ],
} as const;

export const howItWorks = {
  eyebrow: "How It Works",
  headline: ["Three moves.", "One outcome."],
  steps: [
    {
      title: "Uncover",
      body: "We identify the monetization opportunities hidden within your audience.",
    },
    {
      title: "Build",
      body: "I handle the offer, product, funnel, systems, and launch, so you can stay focused on creating.",
    },
    {
      title: "Collect",
      body: "You collect the results while I stay invisible.",
    },
  ],
} as const;

export const manifesto = {
  quote: ["You keep creating.", "I build the revenue."],
  body: "No team to hire, no tools to learn, no second job running the back end. Just the offer, the product and the funnel — built, launched, and handed over working.",
} as const;

export const audience = {
  eyebrow: "Who This Is For",
  headline: "Micro-creators with momentum.",
  body: "You have a niche audience that genuinely engages, and you are ready to stop relying on brand deals alone. I uncover the monetization opportunities already sitting within your audience and turn them into digital products and revenue that scales.",
  fit: {
    title: "This is for you if",
    items: [
      "You have an engaged niche audience — the trust matters more than the follower count.",
      "The same question keeps showing up in your comments and DMs.",
      "Brand deals pay the bills, and you want income you actually own.",
      "You want to keep creating, not become an operations manager.",
    ],
  },
  notFit: {
    title: "Probably not yet if",
    items: [
      "You are still finding the niche and building the first audience.",
      "You want someone to grow the following rather than monetize it.",
      "You want to hand over a brief and never discuss it again — I run the build, but the offer has to sound like you.",
    ],
  },
} as const;

/**
 * This section is a LEAD MAGNET, not a "contact us" box. The visitor trades
 * their handle for an audience audit, and the audit is the pitch. Keep the
 * offer, the deliverable and the follow-up explicit — a bare "get in touch"
 * converts far worse than a named thing you receive.
 *
 * The Instagram handle is REQUIRED here for the same reason: it is the thing
 * being audited and the second contact channel, not a nice-to-have.
 */
export const contact = {
  eyebrow: "Free Audience Audit",
  headline: "See what your audience is worth.",
  body: "Send me your handle and a little about who follows you. I will go through your audience and come back with an audit: the revenue opportunities I can see in it, and what I would build first.",
  deliverablesTitle: "What you get back",
  deliverables: [
    "The offers your audience is already asking you for.",
    "A realistic view of what each one could be worth, and what it takes to build.",
    "Which single one to start with — and why that one.",
  ],
  followUp:
    "It is a short written breakdown, not a sales call. It arrives by email first; if it lands, I will follow up in your DMs and we can take it to a call from there.",
  privacy:
    "Your details are used only to prepare your audit and follow it up with you. Nothing is shared, sold, or added to a mailing list.",
  submitLabel: "Request my audit",
  submittingLabel: "Sending",
  successTitle: "Got it.",
  successBody:
    "I will go through your audience and email your audit over. Worth keeping an eye on your DMs too.",
} as const;

export const footer = {
  tagline: site.oneLiner,
  note: "An independent operator, built for creators who would rather own their revenue than rent it from a brand deal.",
} as const;
