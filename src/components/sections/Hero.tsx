import React from "react";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { BilingualFlip } from "@/components/motion/BilingualFlip";
import { HeroParticleScene } from "@/components/motion/HeroParticleScene";
import { buttonClasses } from "@/components/ui/Button";
import { AvailabilityChip } from "@/components/ui/AvailabilityChip";
import type { Home, SiteSetting, Media } from "@/payload-types";
import type { Locale } from "@/i18n/routing";

/**
 * Typography-led hero. No imagery: the display setting IS the image — full
 * container width, serif with an italic second line. The availability chip
 * sits alone above the eyebrow (a status, not a button), and a mono meta row
 * anchors the bottom of the viewport with the one fact that frames the whole
 * site: where Jerome is and where he's going.
 *
 * Entrance is one orchestrated HeroSequence timeline; the eyebrow runs the
 * bilingual decode on an ambient loop — the site's only self-playing motion.
 */
export function Hero({
  home,
  settings,
  locale,
  contactFallbackLabel,
  altEyebrow,
}: {
  home: Home;
  settings: SiteSetting;
  locale: Locale;
  contactFallbackLabel: string;
  altEyebrow?: string;
}) {
  const hero = home.hero;

  // CV download (portfolio-improvements Phase 1): locale-appropriate file,
  // English fallback. With no CV uploaded the button must never claim to be
  // a download — it scrolls to Contact under a label that says so.
  const cvDe = settings.cvDe as Media | null | undefined;
  const cvEn = settings.cvEn as Media | null | undefined;
  const cv = locale === "de" ? cvDe ?? cvEn : cvEn;

  return (
    <section
      id="hero"
      aria-label="Intro"
      className="grain relative flex min-h-svh flex-col justify-center pt-24"
    >
      <div className="container-site grid w-full items-center gap-x-12 gap-y-14 lg:grid-cols-[1.05fr_0.95fr]">
      <HeroSequence className="w-full">
        {settings.availabilityNote ? (
          <div data-seq="0" data-reveal className="mb-10">
            <AvailabilityChip
              availability={settings.availability}
              note={settings.availabilityNote}
            />
          </div>
        ) : null}

        {hero?.eyebrow ? (
          <p data-seq="1" data-reveal className="mono-label mb-6 text-ink-muted">
            {altEyebrow ? (
              <BilingualFlip ambient text={hero.eyebrow} altText={altEyebrow} />
            ) : (
              hero.eyebrow
            )}
          </p>
        ) : null}

        <h1 className="max-w-[22ch] font-serif text-[clamp(3rem,6.5vw,6.5rem)] leading-[0.98] tracking-[-0.02em] text-ink">
          <span data-seq="2" data-reveal="clip" className="block">
            {hero?.headingLine1}
          </span>
          {hero?.headingLine2 ? (
            <span data-seq="3" data-reveal="clip" className="block">
              <em className="serif-italic text-ink-muted">{hero.headingLine2}</em>
            </span>
          ) : null}
        </h1>

        <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            {hero?.subheading ? (
              <p data-seq="4" data-reveal className="text-body-lg text-ink-muted">
                {hero.subheading}
              </p>
            ) : null}

            <div data-seq="5" data-reveal className="mt-8 flex flex-wrap items-center gap-4">
              {hero?.primaryCtaLabel ? (
                <a href="#work" className={buttonClasses("primary")}>
                  {hero.primaryCtaLabel}
                </a>
              ) : null}
              {cv?.url ? (
                <a href={cv.url} download className={buttonClasses("ghost")}>
                  {hero?.secondaryCtaLabel}
                </a>
              ) : (
                <a href="#contact" className={buttonClasses("ghost")}>
                  {contactFallbackLabel}
                </a>
              )}
            </div>
          </div>

          {settings.location ? (
            <p data-seq="6" data-reveal className="mono-label shrink-0 text-ink-muted">
              {settings.location}
            </p>
          ) : null}
        </div>
      </HeroSequence>

        {/* Particle portrait — mouse-repulsion lens over a dotted likeness.
            Sits directly on the site's starfield (no panel) like the reference. */}
        <div
          className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-[5/6]"
        >
          {/* warm rust glow bleeding from behind the head */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 55% 42%, rgba(157,60,17,0.28), rgba(14,14,13,0) 70%)",
            }}
          />
          <HeroParticleScene src="/images/portrait.png" className="relative z-10 h-full w-full" />
          <p className="mono-label pointer-events-none absolute bottom-4 right-5 z-20 text-[0.65rem] text-inverse-muted">
            Hover to reveal · Click for full view
          </p>
        </div>
      </div>
    </section>
  );
}
