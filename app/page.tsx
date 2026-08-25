import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Manifesto from "@/components/Manifesto";
import Audience from "@/components/Audience";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

// Rebuild daily. The only thing on the page that goes stale on its own is
// the footer copyright year, which a fully static render freezes at build time.
export const revalidate = 86400;

export default function Page() {
  return (
    <>
      <SiteHeader />
      {/* tabIndex -1 so the skip link actually moves focus here.
          Safari (and VoiceOver) will not focus a non-focusable target, so
          without it the skip link scrolls but leaves focus at the top. */}
      <main id="main" tabIndex={-1} className="relative outline-none">
        <Hero />
        <Services />
        <Process />
        <Manifesto />
        <Audience />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
