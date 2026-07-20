import React from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { Home } from "@/payload-types";

/**
 * Optional recognition list (ui-improvements Phase I). CMS-driven so it
 * ships empty and invisible until real entries are added in /backstage —
 * nothing is seeded.
 */
export function Awards({ home }: { home: Home }) {
  const awards = home.awards ?? [];
  if (awards.length === 0) return null;

  return (
    <section aria-labelledby="awards-heading" className="section-pad">
      <div className="container-site">
        <Reveal as="p" id="awards-heading" className="mono-label text-ink-muted">
          [ RECOGNITION ]
        </Reveal>

        <ul className="mt-8 divide-y divide-line border-y border-line">
          {awards.map((award) => (
            <Reveal
              as="li"
              key={award.id}
              className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="mono-label w-32 shrink-0 text-ink-muted">{award.date}</span>
              <div>
                <p className="font-medium text-ink">{award.title}</p>
                {award.description ? (
                  <p className="mt-1 text-ink-muted">{award.description}</p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
