/**
 * The small letterspaced label above every section.
 *
 * The volt node is the reason this is a component rather than a bare
 * `.eyebrow` paragraph: "What I Do" — the section the brief leads with, and
 * the tallest on the page — previously carried no accent colour at all until
 * you moused over a card. Threading the accent through every section label
 * puts the brand colour in each header without decorating anything.
 */
export default function SectionLabel({ children }: { children: string }) {
  return (
    <p className="eyebrow flex items-center gap-3">
      <span
        aria-hidden="true"
        className="block h-[5px] w-[5px] shrink-0 rotate-45 bg-volt"
      />
      {children}
    </p>
  );
}
