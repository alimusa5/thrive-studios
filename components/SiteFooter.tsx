import Image from "next/image";
import { footer, nav, site } from "@/lib/content";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            {/* The primary stacked lockup, at a size where the STUDIOS line
                is actually readable. `unoptimized` keeps the SVG out of the
                image optimizer, which refuses SVG by default. */}
            <Image
              src="/logo-stacked.svg"
              alt="Thrive Studios"
              width={538}
              height={434}
              unoptimized
              priority={false}
              className="h-24 w-auto"
            />
            <p className="mt-8 max-w-[22ch] font-serif text-h3 text-bone">
              {footer.tagline}
            </p>
            <p className="mt-4 max-w-[40ch] text-[0.875rem] leading-[1.65] text-ash">
              {footer.note}
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
            <p className="eyebrow">Navigate</p>
            <ul className="mt-6 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="tap-y link-underline text-[0.9375rem] text-ash transition-colors duration-[180ms] ease-out hover:text-bone"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3 md:col-start-10">
            <p className="eyebrow">Contact</p>
            <ul className="mt-6 space-y-3">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="tap-y link-underline text-[0.9375rem] text-ash transition-colors duration-[180ms] ease-out hover:text-bone"
                >
                  {site.email}
                </a>
              </li>
              {site.instagram ? (
                <li>
                  <a
                    href={`https://instagram.com/${site.instagram}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="tap-y link-underline text-[0.9375rem] text-ash transition-colors duration-[180ms] ease-out hover:text-bone"
                  >
                    @{site.instagram}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 md:mt-16">
          <p className="text-[0.8125rem] text-ash">
            © {year} {site.name}. All rights reserved.
          </p>
          <a
            href="#top"
            className="tap-y link-underline text-[0.8125rem] text-ash transition-colors duration-[180ms] ease-out hover:text-bone"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
