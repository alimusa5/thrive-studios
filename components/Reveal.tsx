"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger, in ms. Feeds the --reveal-delay custom property. */
  delay?: number;
  /**
   * Use for anything in the first viewport. It renders shown and never
   * observes — otherwise above-the-fold content ships at opacity 0 and
   * waits on an observer callback that has already missed its moment.
   */
  immediate?: boolean;
  as?: ElementType;
};

/**
 * Scroll-triggered entrance. Progressive enhancement only: the static page
 * is already finished, and `prefers-reduced-motion` plus the <noscript>
 * override in the root layout both force the shown state.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  immediate = false,
  as,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(immediate);

  useEffect(() => {
    if (immediate) return;
    const el = ref.current;
    if (!el) return;

    // Nothing to observe with: show rather than hide forever.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      ref={ref}
      data-shown={shown ? "true" : "false"}
      className={className ? `reveal ${className}` : "reveal"}
      style={
        delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined
      }
    >
      {children}
    </Tag>
  );
}
