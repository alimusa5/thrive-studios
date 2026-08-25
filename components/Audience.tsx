import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";
import { audience } from "@/lib/content";

function FitList({
  title,
  items,
  positive,
}: {
  title: string;
  items: readonly string[];
  positive: boolean;
}) {
  return (
    <>
      <h3 className="flex items-center gap-3 text-h3 text-bone">
        {positive ? (
          <span
            aria-hidden="true"
            className="block h-[6px] w-[6px] shrink-0 rotate-45 bg-volt"
          />
        ) : null}
        {title}
      </h3>
      <ul className="mt-7 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-4">
            {positive ? (
              <span
                aria-hidden="true"
                className="mt-[0.5rem] h-[5px] w-[5px] shrink-0 rotate-45 bg-volt"
              />
            ) : (
              <span
                aria-hidden="true"
                className="mt-[0.7rem] h-px w-[11px] shrink-0 bg-line-strong"
              />
            )}
            <span
              className={`text-[0.9375rem] leading-[1.65] ${
                positive ? "text-bone" : "text-ash"
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Audience() {
  return (
    <section id="audience" className="section">
      <div className="shell">
        <div className="text-center">
          <Reveal>
            <SectionLabel>{audience.eyebrow}</SectionLabel>
          </Reveal>

          {/* The heading gets a wider measure than the body copy: at the
              desktop size it needs ~911px to stay on one line, and a 3xl
              (768px) box would break it after "with". */}
          <Reveal delay={80}>
            <h2 className="mx-auto mt-7 max-w-5xl text-h1 text-bone md:mt-8">
              {audience.headline}
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-7 max-w-[62ch] text-lead text-ash md:mt-8">
              {audience.body}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-0">
          <Reveal className="md:pr-14">
            <FitList
              title={audience.fit.title}
              items={audience.fit.items}
              positive
            />
          </Reveal>

          <Reveal
            delay={110}
            className="border-t border-line pt-10 md:border-l md:border-t-0 md:pl-14 md:pt-0"
          >
            <FitList
              title={audience.notFit.title}
              items={audience.notFit.items}
              positive={false}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
