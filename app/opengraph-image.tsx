import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name} — Turn attention into assets.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Fraunces, subsetted by Google to exactly the glyphs used below (5KB).
 *
 * Read from disk rather than `fetch(new URL(..., import.meta.url))`: the
 * bundler rewrites that import to `/_next/static/media/…`, and fetch cannot
 * parse a root-relative URL, which fails the build. This route has no dynamic
 * params, so Next prerenders the PNG during the build — the font is never
 * needed at runtime and `process.cwd()` is the project root when it is.
 *
 * ⚠️ The subset covers only "Turn attention into assets." and "thrive
 * studios". Any other string must use the default font or it renders blank.
 */
async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const buf = await readFile(join(process.cwd(), "app", "Fraunces-Display.ttf"));
    return buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength,
    ) as ArrayBuffer;
  } catch (error) {
    // Degrade to the default face rather than failing someone's deploy over a
    // social card. Loud, because a silently off-brand card is easy to miss.
    console.error("[opengraph-image] Display font unavailable:", error);
    return null;
  }
}

/** Mark geometry, scaled from the supplied logo. See components/Logo.tsx. */
const MARK_H = 84;
const S = MARK_H / 212.0703;
const BONE = "#F5F3EE";
const VOLT = "#C6FF4D";
const rect = (x: number, y: number, w: number, h: number, fill: string) => ({
  position: "absolute" as const,
  left: x * S,
  top: y * S,
  width: w * S,
  height: h * S,
  backgroundColor: fill,
});

export default async function OpengraphImage() {
  const fontData = await loadDisplayFont();
  const display = fontData ? "Fraunces" : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b0d12",
          padding: 72,
          position: "relative",
        }}
      >
        {/* A linear sweep, NOT the hero's radial bloom. Satori draws
            radial-gradient as banded concentric rings with a dark centre, and
            an inset shape leaves a visible seam at its bounding box — so this
            is full-bleed and linear, which renders clean. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(105deg, rgba(198,255,77,0) 40%, rgba(198,255,77,0.05) 72%, rgba(198,255,77,0.13) 100%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 210.3828 * S,
              height: MARK_H,
            }}
          >
            <div style={rect(0, 45.6641, 164.25, 28.668, BONE)} />
            <div style={rect(88.5586, 46.4141, 27.2617, 165.6563, BONE)} />
            <div style={rect(126.8672, 0, 83.5117, 23.5742, VOLT)} />
            <div style={rect(186.8125, 0.75, 23.5703, 83.5156, VOLT)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: display,
                fontSize: 30,
                color: BONE,
                letterSpacing: 6,
              }}
            >
              thrive
            </div>
            <div
              style={{
                fontSize: 15,
                color: VOLT,
                letterSpacing: 9,
                marginTop: 6,
              }}
            >
              STUDIOS
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 20,
              color: "#8b8d94",
              letterSpacing: 5,
              textTransform: "uppercase",
              marginBottom: 26,
            }}
          >
            Shadow operator for creators
          </div>
          <div
            style={{
              fontFamily: display,
              fontSize: 104,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: BONE,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>Turn attention</div>
            <div>into assets.</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Fraunces", data: fontData, style: "normal" as const, weight: 600 as const }]
        : [],
    },
  );
}
