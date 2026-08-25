import DisplayLines from "./DisplayLines";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";
import { howItWorks } from "@/lib/content";

export default function Process() {
  return (
    <section id="process" className="section">
      <div className="shell">
        <Reveal>
          <SectionLabel>{howItWorks.eyebrow}</SectionLabel>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-7 text-h1 text-bone md:mt-8">
            <DisplayLines lines={howItWorks.headline} />
          </h2>
        </Reveal>

        {/* No x-gap on desktop so the three top rules read as one continuous
            line, with a node marking each step. */}
        {/* 3-up only from lg: at 768 three columns leave each step a ~184px
            measure, tighter than the same text gets on a phone. */}
        <ol className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-3 lg:gap-x-0 lg:gap-y-0">
          {howItWorks.steps.map((step, i) => (
            <li
              key={step.title}
              className="relative border-t border-line pt-8 lg:pr-10 lg:last:pr-0"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-[7px] w-[7px] -translate-y-1/2 rotate-45 bg-volt"
              />
              <Reveal delay={i * 110}>
                {/* /40, not /30: at 30% these measure 2.41:1 against the
                    ground, under the 3:1 floor for large text. 40% is 3.38:1
                    and still reads as ghosted. */}
                <span
                  aria-hidden="true"
                  className="block font-serif text-[3.25rem] leading-none tracking-[-0.03em] text-volt/40 md:text-[4rem]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-h3 text-bone">{step.title}</h3>
                <p className="mt-3.5 max-w-[38ch] text-[0.9375rem] leading-[1.65] text-ash">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
