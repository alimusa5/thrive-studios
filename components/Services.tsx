import DisplayLines from "./DisplayLines";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";
import { services } from "@/lib/content";

/**
 * A diamond, not an arrow. These cards are `<article>` — they describe a
 * service, they do not navigate anywhere, and an up-and-right arrow is the
 * universal "this opens something" affordance. It promised a destination the
 * one-page site does not have. The diamond is the site's own accent motif
 * (ticker, process nodes, fit list) and promises nothing.
 */
function AccentNode() {
  return (
    <span
      aria-hidden="true"
      className="mt-1 block h-[6px] w-[6px] shrink-0 rotate-45 bg-volt"
    />
  );
}

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="shell">
        <Reveal>
          <SectionLabel>{services.eyebrow}</SectionLabel>
        </Reveal>

        {/* Splits at lg. A 5-of-12 column is 257px at 768px, which sets the
            intro at roughly 32 characters a line. */}
        <div className="mt-7 grid gap-7 md:mt-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-6">
            <h2 className="text-h1 text-bone">
              <DisplayLines lines={services.headline} />
            </h2>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-6 lg:self-end">
            <p className="text-lead text-ash">{services.intro}</p>
          </Reveal>
        </div>

        {/* `gap-px` over a line-coloured ground draws the whole hairline grid —
            no per-cell border arithmetic to get wrong at the edges. */}
        <div className="mt-14 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
          {services.items.map((service, i) => (
            <article
              key={service.title}
              className="group relative bg-midnight p-7 transition-colors duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-graphite md:p-9"
            >
              {/* The reveal transform lives INSIDE the cell: moving the cell
                  itself would expose the hairline behind it mid-animation. */}
              <Reveal>
                <div className="flex items-start justify-between gap-4">
                  <span className="eyebrow transition-colors duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-volt">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <AccentNode />
                </div>

                <h3 className="mt-7 text-h3 text-bone md:mt-9">{service.title}</h3>

                <p className="mt-3.5 text-[0.9375rem] leading-[1.65] text-ash">
                  {service.body}
                </p>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
