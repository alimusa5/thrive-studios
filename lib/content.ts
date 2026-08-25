/**
 * The site copy.
 *
 * Every headline, paragraph, list item and button label on the page comes
 * from here, so wording changes need no component edits. Two things do NOT
 * live here and are worth knowing about: the form field labels and their
 * validation messages (components/ContactSection.tsx), and the errors the
 * server shows a visitor (app/api/contact/route.ts).
 *
 * Anything marked TODO needs a real value before launch.
 */

export const site = {
  name: "Thrive Studios",
  /** Used for canonical URLs, sitemap and social cards. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thrivestudios.com",
  oneLiner: "I help creators convert their audience into revenue.",
  description:
    "Thrive Studios builds the revenue infrastructure behind creators and online businesses — monetization strategy, digital products, funnels and launches, run end to end so you can keep creating.",
  // TODO: replace with your real inbox before launch.
  email: "hello@thrivestudios.com",
  // TODO: replace with your real handle, or set to null to hide the link.
  instagram: "thrivestudios",
} as const;

export const nav = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Who It's For", href: "#audience" },
  { label: "Contact", href: "#contact" },
] as const;

export const hero = {
  eyebrow: "Shadow operator for creators",
  headline: ["Turn attention", "into assets."],
  body: "I help creators turn engaged audiences into profitable digital product businesses. From strategy to execution, I build the systems that turn attention into revenue.",
  primaryCta: { label: "Work with Me", href: "#contact" },
  secondaryCta: { label: "See what I do", href: "#services" },
  /** The pipeline, scrolling as a band under the fold. */
  ticker: ["Audience", "Offer", "Product", "Funnel", "Launch", "Revenue"],
} as const;

export const services = {
  eyebrow: "What I Do",
  headline: ["The systems that turn", "attention into revenue."],
  intro:
    "You built the audience. I build the machine behind it — so your influence becomes income without you becoming a manager.",
  items: [
    {
      title: "Monetization Strategy",
      body: "We map the revenue already sitting in your audience: what they would pay for, what they would pay, and which offer to build first.",
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
  quote: ["You stay the face.", "I stay the machine."],
  body: "No agency retainer, no team to manage, no logo on your work. Just the revenue infrastructure your audience has already earned you.",
} as const;

export const audience = {
  eyebrow: "Who This Is For",
  headline: "Micro-creators with momentum.",
  body: "Niche micro-creators with engaged audiences who are ready to move beyond relying solely on brand deals. I help uncover the monetization opportunities already sitting within their audience and turn them into digital products and scalable revenue.",
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
      "You want a finished product with no input on the offer behind it.",
    ],
  },
} as const;

export const contact = {
  eyebrow: "Contact",
  headline: "Ready to build? Let's talk.",
  body: "Tell me about your audience and where you are stuck. If I can help, you get an honest read on the opportunity — not a pitch deck.",
  steps: [
    "You send the form — two minutes, no discovery call required.",
    "I read it myself and reply with an honest view of the opportunity.",
    "If it is a fit, we scope the first build and get moving.",
  ],
  privacy:
    "Your details are used only to reply to this enquiry. Nothing is shared, sold, or added to a mailing list.",
  submitLabel: "Let's Talk",
  submittingLabel: "Sending",
  successTitle: "Message sent.",
  successBody:
    "Thanks — I have got it. I read every message myself and will come back to you personally.",
} as const;

export const footer = {
  tagline: site.oneLiner,
  note: "An independent operator, built for creators who would rather own their revenue than rent it from a brand deal.",
} as const;
