"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { hero, nav } from "@/lib/content";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu is mobile-only. If the viewport grows past the breakpoint while it is
  // open the panel disappears but the scroll lock would survive — so close it.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && close();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // The panel covers the viewport but the header sits above it, so this is
    // not a true modal and a hand-rolled focus trap would fight the close
    // button. Marking the page behind it inert is the same guarantee with
    // none of that: nothing back there is tabbable or in the a11y tree.
    const behind = [
      document.getElementById("main"),
      document.querySelector("footer"),
    ].filter(Boolean) as HTMLElement[];
    behind.forEach((el) => el.setAttribute("inert", ""));

    // Move focus in, and put it back on the trigger when the menu closes —
    // otherwise focus is left on a button that is no longer expanded.
    const firstLink = panelRef.current?.querySelector("a");
    firstLink?.focus();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open, close]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-volt focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-midnight"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50">
        <div
          className={`border-b transition-[background-color,border-color,backdrop-filter] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled || open
              ? "border-line bg-midnight/85 backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <div className="shell flex h-16 items-center justify-between gap-4 sm:h-20">
            <a
              href="#top"
              onClick={close}
              aria-label="Thrive Studios — back to top"
              className="shrink-0 rounded-sm"
            >
              <Logo />
            </a>

            <nav
              aria-label="Primary"
              className="hidden items-center gap-9 md:flex"
            >
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="link-underline text-sm text-ash transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-bone"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={hero.primaryCta.href}
                className="btn btn-primary hidden !min-h-11 !py-2.5 !text-[0.8125rem] md:inline-flex"
              >
                {hero.primaryCta.label}
              </a>

              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-sm text-bone md:hidden"
              >
                <span className="relative block h-3.5 w-6" aria-hidden="true">
                  <span
                    className={`absolute left-0 block h-px w-full bg-current transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open ? "top-1.5 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-px w-full bg-current transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open ? "top-1.5 -rotate-45" : "top-3"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Panel sits below the bar (z-40 vs z-50) so the close button stays
          hit-able.

          Kept MOUNTED and faded rather than toggled with `hidden`: going
          straight from display:none to flex gives the staggered link entrance
          no start frame to transition from, so it never ran. `inert` when
          closed does what `hidden` did for tab order and the a11y tree, and
          `pointer-events-none` keeps the invisible sheet from swallowing
          clicks on the page underneath. */}
      <div
        ref={panelRef}
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-midnight pt-16 transition-opacity sm:pt-20 duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* `mt-auto` on the first child and `mb-auto` on the last centres the
            group when there is room and collapses to 0 when there is not —
            auto margins only absorb POSITIVE free space. `justify-center`
            here overflowed in both directions on a landscape phone, putting
            the first nav item above the scroll origin where nothing could
            reach it. */}
        <nav
          aria-label="Mobile"
          className="flex flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-6 py-8 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto"
        >
          {nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              style={{ transitionDelay: `${60 + i * 45}ms` }}
              className={`py-3 font-serif text-[2rem] leading-tight tracking-[-0.02em] text-bone transition-[opacity,translate] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="border-t border-line px-6 py-6">
          <a
            href={hero.primaryCta.href}
            onClick={close}
            className="btn btn-primary w-full"
          >
            {hero.primaryCta.label}
          </a>
        </div>
      </div>
    </>
  );
}
