import DisplayLines from "./DisplayLines";
import Reveal from "./Reveal";
import { hero } from "@/lib/content";

function Diamond() {
  return (
    <span
      aria-hidden="true"
      /* Hidden while the band wraps: on a phone a separator would lead
         each wrapped line. Already aria-hidden, so nothing is lost. */
      className="hidden h-[5px] w-[5px] shrink-0 rotate-45 bg-volt sm:block"
    />
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      /* NOT `min-h-[100svh]`. The header is `position: sticky`, which stays in
         normal flow, so a full-viewport hero starts BELOW the bar and pushes
         its own bottom edge off screen — measured at 1440x900, the band below
         sat at y=930 against a 900px fold, i.e. invisible at load. Subtract
         the bar's height (h-16 / sm:h-20) plus its 1px bottom border. */
      className="relative flex min-h-[calc(100svh-4rem-1px)] flex-col justify-between overflow-hidden pt-14 sm:min-h-[calc(100svh-5rem-1px)] sm:pt-20 md:pt-28"
    >
      {/* A single soft bloom behind the headline. Radial gradient rather than a
          blurred block — same result, a fraction of the paint cost. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[18%] left-1/2 h-[70vw] w-[110vw] -translate-x-1/2 md:left-[62%] md:w-[75vw]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(198,255,77,0.11), rgba(198,255,77,0.03) 55%, transparent 100%)",
        }}
      />

      <div className="shell relative z-10 flex flex-1 flex-col justify-center py-8 sm:py-14">
        <Reveal immediate>
          <p className="eyebrow flex items-center gap-4">
            <span
              aria-hidden="true"
              className="block h-px w-10 shrink-0 bg-volt"
            />
            {hero.eyebrow}
          </p>
        </Reveal>

        <Reveal immediate delay={90}>
          <h1 className="mt-7 text-hero text-bone md:mt-9">
            <DisplayLines lines={hero.headline} />
          </h1>
        </Reveal>

        {/* Splits at lg, not md. A 5-of-12 CTA column is 257px at 768px while
            the two buttons need 316px, so they stacked inside a narrow right
            column — worse than simply sitting under the paragraph. Below lg
            the row is one column with the copy held to a readable measure. */}
        <Reveal immediate delay={200}>
          <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:mt-11 sm:pt-9 lg:mt-14 lg:grid-cols-12 lg:gap-10 lg:pt-10">
            <p className="max-w-[54ch] text-lead text-ash lg:col-span-6">
              {hero.body}
            </p>

            {/* The switch is at 420px, not `sm` (640px). The two buttons need
                315px side by side and .btn is whitespace-nowrap, so they
                cannot shrink: below ~365px of content box they must stack. A
                420px viewport leaves 372px, comfortably clear. Waiting for
                `sm` would stretch a single button across 590px on a large
                phone in landscape. */}
            <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-end lg:col-span-5 lg:col-start-8 lg:justify-end">
              <a
                href={hero.primaryCta.href}
                className="btn btn-primary w-full min-[420px]:w-auto"
              >
                {hero.primaryCta.label}
              </a>
              <a
                href={hero.secondaryCta.href}
                className="btn btn-ghost w-full min-[420px]:w-auto"
              >
                {hero.secondaryCta.label}
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* The pipeline, as a static band on the fold line.

          This was a marquee. It is not any more, and that is deliberate:
          continuous auto-starting motion needs a pause mechanism under WCAG
          2.2.2 (Level A), and hover/focus is not one — a phone never hovers,
          and the band held nothing focusable for :focus-within to catch. The
          honest options were a pause button inside a decorative strip or no
          motion; static also lets the six words be REAL content instead of
          twenty-four aria-hidden repetitions padded out to fill the loop. If
          the movement is ever wanted back, it needs a real Pause control. */}
      <div className="relative z-10 border-y border-line">
        <div className="shell flex flex-wrap items-center justify-center gap-x-5 gap-y-3 py-4 sm:gap-x-8">
          {hero.ticker.map((word, i) => (
            /* Diamond and word wrap as ONE item. As siblings, a wrap could
               land the separator alone at the start of the next line. */
            <span
              key={word}
              className="flex items-center gap-x-5 whitespace-nowrap sm:gap-x-8"
            >
              {i > 0 ? <Diamond /> : null}
              <span className="eyebrow">{word}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
