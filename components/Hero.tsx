import { Fragment } from "react";
import DisplayLines from "./DisplayLines";
import Reveal from "./Reveal";
import { hero } from "@/lib/content";

function Diamond() {
  return (
    <span
      aria-hidden="true"
      className="block h-[5px] w-[5px] shrink-0 rotate-45 bg-volt"
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
      className="relative flex min-h-[calc(100svh-4rem-1px)] flex-col justify-between overflow-hidden pt-24 sm:min-h-[calc(100svh-5rem-1px)] md:pt-28"
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

      <div className="shell relative z-10 flex flex-1 flex-col justify-center py-14">
        <Reveal immediate>
          <p className="eyebrow flex items-center gap-4">
            <span aria-hidden="true" className="block h-px w-10 bg-volt" />
            {hero.eyebrow}
          </p>
        </Reveal>

        <Reveal immediate delay={90}>
          <h1 className="mt-7 text-hero text-bone md:mt-9">
            <DisplayLines lines={hero.headline} />
          </h1>
        </Reveal>

        <Reveal immediate delay={200}>
          <div className="mt-11 grid gap-8 border-t border-line pt-9 md:mt-14 md:grid-cols-12 md:gap-10 md:pt-10">
            <p className="text-lead text-ash md:col-span-6 lg:col-span-5">
              {hero.body}
            </p>

            <div className="flex flex-wrap items-end gap-3 md:col-span-5 md:col-start-8 md:justify-end lg:col-span-4 lg:col-start-9">
              <a href={hero.primaryCta.href} className="btn btn-primary">
                {hero.primaryCta.label}
              </a>
              <a href={hero.secondaryCta.href} className="btn btn-ghost">
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
            <Fragment key={word}>
              {i > 0 ? <Diamond /> : null}
              <span className="eyebrow whitespace-nowrap">{word}</span>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
