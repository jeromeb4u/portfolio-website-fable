import React from "react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { JourneyProgress } from "@/components/motion/JourneyProgress";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import type { Home } from "@/payload-types";

/**
 * Narrative timeline (ui-improvements Phase C): vertical line + dot markers,
 * mono eyebrow (COMPANY · ROLE), narrative headline per stop, then the
 * description. Tells the career arc (enterprise Angular → freelance React +
 * AI → Germany) rather than reading as a flat numbered list.
 *
 * Layout mirrors the reference site: the eyebrow/heading/lede and a
 * FOUNDATIONS→TODAY progress rail sit in a sticky left column while the
 * timeline scrolls past on the right.
 */
export async function Experience({ home }: { home: Home }) {
  const exp = home.experience;
  const t = await getTranslations("sections");

  return (
    <section id="experience" aria-labelledby="experience-heading" className="section-pad bg-surface">
      <div className="container-site grid gap-x-16 gap-y-12 md:grid-cols-[minmax(0,20rem)_1fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <SectionEyebrow label={t("experience")} />
          <Reveal as="h2" variant="clip" id="experience-heading" className="font-serif text-h2 text-ink">
            {exp?.heading}
          </Reveal>
          <Reveal as="p" className="mt-5 max-w-sm text-body-lg text-ink-muted">
            {t("experienceLede")}
          </Reveal>
          <JourneyProgress
            className="mt-10"
            startLabel={t("experienceStart")}
            endLabel={t("experienceEnd")}
          />
        </div>

        <ol className="relative border-l border-line pl-8 sm:pl-10">
          {(exp?.entries ?? []).map((entry) => (
            <Reveal as="li" key={entry.id} delay={0.05} className="relative pb-14 last:pb-0">
              {/* dot on the line */}
              <span
                aria-hidden="true"
                className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-bg sm:-left-[calc(2.5rem+5px)]"
              />

              <p className="mono-label text-ink-muted">
                {entry.company}
                {entry.clientNote ? ` · ${entry.clientNote}` : ""}
              </p>
              <p className="mono-label mt-1 text-ink-muted/70">
                {entry.dateStart} — {entry.dateEnd}
              </p>

              {entry.narrativeHeadline ? (
                <h3 className="mt-3 font-serif text-h3 text-ink">{entry.narrativeHeadline}</h3>
              ) : (
                <h3 className="mt-3 text-h3 font-medium text-ink">{entry.role}</h3>
              )}
              {entry.narrativeHeadline ? (
                <p className="mt-1.5 text-ink-muted">{entry.role}</p>
              ) : null}

              <ul className="mt-5 max-w-2xl space-y-2.5">
                {(entry.bullets ?? []).map((bullet) => (
                  <li key={bullet.id} className="flex gap-3 text-ink-muted">
                    <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {bullet.text}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
