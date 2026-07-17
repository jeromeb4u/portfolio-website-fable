import React from "react";
import { Reveal } from "@/components/motion/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { ModelViewer } from "@/components/three/ModelViewer";
import type { Home, SiteSetting, Media } from "@/payload-types";

// Served from public/models/ for now. Swap to the jsdelivr CDN URL once
// confirmed rendering correctly:
// "https://cdn.jsdelivr.net/gh/jeromeb4u/jerome-dmello-portfolio-3d-assets@main/Meshy_AI_Interwoven_Torus_Knot_0716125940_texture.glb"
const MODEL_SRC = "/models/torus-knot.glb";

const availabilityDot: Record<string, string> = {
  available: "bg-green-600",
  open: "bg-green-600",
  unavailable: "bg-ink-muted",
};

/**
 * Hero (plan/05 A1–A3, plan/01 §5): orange glow field, Instrument Serif display,
 * ID-card availability chip. The 3D slot is RESERVED — renders the CMS poster if
 * set, otherwise a labeled placeholder. Spline mounts here in a later phase.
 */
export function Hero({
  home,
  settings,
}: {
  home: Home;
  settings: SiteSetting;
}) {
  const hero = home.hero;
  const poster = hero?.splinePosterImage as Media | null | undefined;

  return (
    <section
      id="hero"
      aria-label="Intro"
      className="grain relative flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <div className="glow-field opacity-90" aria-hidden="true" />

      {/* 3D slot — right side on desktop. GLB rendered via <model-viewer>;
          swap MODEL_SRC to the CDN URL once confirmed working locally. */}
      <div
        className="absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center lg:flex"
        aria-hidden="true"
      >
        <div className="h-[60svh] w-[80%]">
          <ModelViewer
            src={MODEL_SRC}
            alt="3D model"
            poster={poster?.url ?? undefined}
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="container-site relative z-10 pb-[clamp(4rem,10vh,7rem)] pt-40">
        {hero?.eyebrow ? (
          <Reveal as="p" delay={0.1} className="mono-label mb-6 text-ink-muted">
            {hero.eyebrow}
          </Reveal>
        ) : null}

        <Reveal
          as="h1"
          variant="clip"
          className="max-w-5xl font-serif text-display text-ink"
        >
          {hero?.headingLine1}
          {hero?.headingLine2 ? (
            <>
              <br />
              <em className="serif-italic">{hero.headingLine2}</em>
            </>
          ) : null}
        </Reveal>

        {hero?.subheading ? (
          <Reveal
            as="p"
            delay={0.25}
            className="mt-8 max-w-xl text-body-lg text-ink-muted"
          >
            {hero.subheading}
          </Reveal>
        ) : null}

        <Reveal delay={0.4} className="mt-10 flex flex-wrap items-center gap-4">
          {hero?.primaryCtaLabel ? (
            <a href="#work" className={buttonClasses("primary")}>
              {hero.primaryCtaLabel}
            </a>
          ) : null}
          {hero?.secondaryCtaLabel ? (
            <a href="#contact" className={buttonClasses("ghost")}>
              {hero.secondaryCtaLabel}
            </a>
          ) : null}

          {/* ID-card availability chip (R5) */}
          {settings.availabilityNote ? (
            <span className="ml-0 inline-flex items-center gap-2.5 rounded-full border border-line bg-bg/70 py-2 pl-3 pr-4 backdrop-blur-sm sm:ml-2">
              <span
                className={`h-2 w-2 rounded-full animate-pulse-dot ${availabilityDot[settings.availability] ?? "bg-green-600"}`}
              />
              <span className="mono-label text-ink">
                {settings.availabilityNote}
              </span>
            </span>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
