/**
 * Renders an authored multi-line headline.
 *
 * The trailing space is not cosmetic. Rendering the lines as bare adjacent
 * `<span class="block">` made the h1's textContent read
 * "Turn attentioninto assets." — which is what a screen reader announces and
 * what a crawler indexes. A block span collapses the trailing space visually,
 * so the rendered line break is unchanged.
 */
export default function DisplayLines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={line} className="block">
          {line}
          {i < lines.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
