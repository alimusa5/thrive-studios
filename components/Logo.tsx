/**
 * Brand marks.
 *
 * Geometry is lifted verbatim from the supplied Logo.svg — a redrawn logo is
 * the wrong logo. `Mark` is the four rectangles of the T and its corner;
 * `logo-stacked.svg` in /public is the primary stacked lockup, cropped by
 * viewBox alone so the artwork itself is untouched.
 *
 * The nav pairs the mark with live type instead of the stacked artwork on
 * purpose: at a 64px bar the outlined "STUDIOS" line renders about 5px tall
 * and reads as a smudge. The authentic lockup gets its proper showing in the
 * footer, where there is height for it.
 */

const BONE = "#F5F3EE";
const VOLT = "#C6FF4D";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 210.3828 212.0703"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* T crossbar */}
      <rect x="0" y="45.6641" width="164.25" height="28.668" fill={BONE} />
      {/* T stem */}
      <rect x="88.5586" y="46.4141" width="27.2617" height="165.6563" fill={BONE} />
      {/* accent corner, horizontal */}
      <rect x="126.8672" y="0" width="83.5117" height="23.5742" fill={VOLT} />
      {/* accent corner, vertical */}
      <rect x="186.8125" y="0.75" width="23.5703" height="83.5156" fill={VOLT} />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark className="h-8 w-auto shrink-0 sm:h-9" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.9375rem] font-normal tracking-[0.22em] text-bone">
          thrive
        </span>
        <span className="mt-[0.3rem] text-[0.5rem] font-medium uppercase tracking-[0.38em] text-volt">
          studios
        </span>
      </span>
    </span>
  );
}
