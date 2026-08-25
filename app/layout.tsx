import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { site } from "@/lib/content";
import "./globals.css";

/**
 * Fraunces carries the display voice. `axes` requires that `weight` is NOT
 * set — setting it would load a static instance and drop opsz/SOFT/WONK,
 * which is where the high stroke contrast comes from. The axis values
 * themselves are applied in globals.css.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.oneLiner}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "creator monetization",
    "digital product strategy",
    "growth marketing",
    "product launch",
    "funnel strategy",
    "offer creation",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Turn attention into assets.`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Turn attention into assets.`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.email,
  slogan: site.oneLiner,
  areaServed: "Worldwide",
  serviceType: [
    "Monetization Strategy",
    "Ideal Offer Creation",
    "Digital Product Creation",
    "Funnel Strategy",
    "Product Launch",
    "Growth Strategy",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable}`}>
      <body className="grain antialiased">
        {/* Reveal animations start at opacity 0 and are switched on by JS.
            Without this, a visitor with JS disabled gets a blank page. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
