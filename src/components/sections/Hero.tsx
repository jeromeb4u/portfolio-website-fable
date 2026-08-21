import React from "react";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { BilingualFlip } from "@/components/motion/BilingualFlip";
import { HeroParticleScene } from "@/components/motion/HeroParticleScene";
import { buttonClasses } from "@/components/ui/Button";
import { ResumePanel } from "@/components/ui/ResumePanel";
import { Link } from "@/i18n/navigation";
import type { Home, SiteSetting } from "@/payload-types";

/**
 * Editorial hero: the copy set over a particle portrait that fills the whole
 * section and bleeds off the right edge, dissolved into the page by three
 * stacked scrims (a left-to-right base wash, a vertical fade, and a warm
 * rust bloom behind the head).
 *
 * The portrait is not a boxed panel — the canvas is `inset-0` behind
 * everything and is pointer-events-none, so the copy column stays clickable
 * while hover/click still drive the reveal. Scrolling sinks and disperses the
 * cloud, handing the viewport to the next section.
 *
 * Entrance is one orchestrated HeroSequence timeline; the eyebrow runs the
 * bilingual decode on an ambient loop — the site's only self-playing motion.
 */
export function Hero({
  home,
  settings,
  contactFallbackLabel,
  scrollCueLabel,
  altEyebrow,
  viewWorkLabel,
  resumeLabels,
}: {
  home: Home;
  settings: SiteSetting;
  contactFallbackLabel: string;
  scrollCueLabel: string;
  altEyebrow?: string;
  viewWorkLabel: string;
  resumeLabels: {
    trigger: string;
    panel: string;
    download: string;
    openTab: string;
    close: string;
  };
}) {
  const hero = home.hero;

  // The CV is a static asset rather than a Payload upload on purpose. Payload
  // serves uploads from /api/media/file/<name>, which needs both the file and
  // its database row present on the server — but `/media` and `dev.db` are
  // gitignored, so neither reaches the cPanel box and the route would 404
  // there. Shipping it under public/ makes it part of the deployed artifact.
  // To replace it: drop a new PDF at this path and redeploy.
  const CV_URL = "/resume/Jerome_Dmello_CV.pdf";

  return (
    <section
      id="hero"
      aria-label="Intro"
      className="relative flex min-h-[84svh] flex-col justify-center overflow-hidden py-24"
    >
      {/* The canvas (or its masked-photo fallback) fills the section and
          bleeds right; it sits under every scrim and the copy. */}
      <div className="absolute inset-0 z-0">
        <HeroParticleScene src="/images/portrait.png" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-bg via-bg/65 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-bg/50 via-transparent to-bg/30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[8%] top-1/4 z-[1] h-[60vh] w-[60vh] rounded-full opacity-20 blur-[120px]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)",
        }}
      />

      <div className="container-site relative z-10">
        <HeroSequence className="max-w-2xl">
          {/* Eyebrow stack: where he is, then what he does — two mono lines
              above the name, exactly the reference's opening move. */}
          <div data-seq="1" data-reveal className="mb-7 flex max-w-[24rem] flex-col gap-2">
            {settings.location ? (
              <p className="mono-label text-ink-muted">
                <BilingualFlip once text={settings.location} altText={settings.location} />
              </p>
            ) : null}
            {hero?.eyebrow ? (
              <p className="mono-label text-ink-faint">
                <BilingualFlip once text={hero.eyebrow} altText={altEyebrow ?? hero.eyebrow} />
              </p>
            ) : null}
          </div>

          {/* The heading is the name, nothing else. */}
          <h1 className="font-display text-[clamp(3.25rem,6vw,5.4rem)] font-normal leading-[1.02] tracking-[-0.01em] text-ink">
            <span data-seq="2" data-reveal="clip" className="block">
              {hero?.headingLine1}
            </span>
            {hero?.headingLine2 ? (
              <span data-seq="3" data-reveal="clip" className="block text-ink-muted">
                {hero.headingLine2}
              </span>
            ) : null}
          </h1>

          {hero?.subheading ? (
            <p
              data-seq="4"
              data-reveal
              className="mt-8 max-w-xl text-balance text-body-lg text-ink-muted"
            >
              {hero.subheading}
            </p>
          ) : null}

          {hero?.body ? (
            <p data-seq="5" data-reveal className="mt-5 max-w-xl text-sm leading-relaxed text-ink-muted">
              {hero.body}
            </p>
          ) : null}

          {/* Three CTAs: the work index (a real route), the contact section at
              the foot of the homepage, and the resume slide-over. */}
          <div data-seq="6" data-reveal className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/work" className={buttonClasses("primary")}>
              {viewWorkLabel}
            </Link>
            <a href="#contact" className={buttonClasses("ghost")}>
              {contactFallbackLabel}
            </a>
            <ResumePanel
              url={CV_URL}
              filename="Jerome_Dmello_CV.pdf"
              triggerLabel={resumeLabels.trigger}
              panelLabel={resumeLabels.panel}
              downloadLabel={resumeLabels.download}
              openTabLabel={resumeLabels.openTab}
              closeLabel={resumeLabels.close}
            />
          </div>

          {/* Scroll cue: hands the eye to the next section, which is where the
              particle cloud disperses to. */}
          <a
            href="#work"
            data-seq="7"
            data-reveal
            className="mono-label mt-14 inline-flex items-center gap-3 text-ink-muted transition-colors hover:text-accent-strong"
          >
            <span className="h-10 w-px animate-pulse bg-line" aria-hidden="true" />
            {scrollCueLabel}
          </a>
        </HeroSequence>
      </div>
    </section>
  );
}
