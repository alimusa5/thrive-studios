/**
 * Line icons for the direct-contact links.
 *
 * Stroked in `currentColor` rather than brand colours on purpose: these sit in
 * a text link row, so they inherit ash → bone → volt with the label instead of
 * fighting it. Instagram's gradient in particular would be the only saturated
 * thing on a page whose whole system is one accent.
 *
 * Both are decorative — the label beside each says the same thing — so they
 * carry aria-hidden and never announce twice.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2.25" />
      <path d="M3.75 7.25 12 13l8.25-5.75" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" />
      <circle cx="12" cy="12" r="4.25" />
      {/* The lens dot is solid in the real mark, so it is filled, not stroked. */}
      <circle cx="17.45" cy="6.55" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}
