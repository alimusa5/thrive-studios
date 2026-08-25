import Reveal from "./Reveal";
import { manifesto } from "@/lib/content";

/**
 * A short full-bleed band between Process and Who This Is For. It exists for
 * rhythm — six sections of the same ground and the page reads as one long
 * scroll — and it states the positioning that the third step only implies.
 */
export default function Manifesto() {
  return (
    <section className="border-y border-line bg-graphite">
      <div className="shell py-20 text-center md:py-28">
        <Reveal>
          <p className="mx-auto max-w-[20ch] font-serif text-statement text-bone">
            <span className="block">{manifesto.quote[0]} </span>
            <span className="block text-volt">{manifesto.quote[1]}</span>
          </p>
        </Reveal>

        <Reveal delay={130}>
          <p className="mx-auto mt-8 max-w-[52ch] text-lead text-ash">
            {manifesto.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
