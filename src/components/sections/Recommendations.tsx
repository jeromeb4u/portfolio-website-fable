import React from "react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import type { Home } from "@/payload-types";
import { cn } from "@/lib/utils";

type Entry = NonNullable<NonNullable<Home["recommendations"]>["entries"]>[number];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Renders ONLY consent-confirmed quotes (filtered by the page). ui-improvements Phase E. */
export async function Recommendations({ home, entries }: { home: Home; entries: Entry[] }) {
  if (entries.length === 0) return null;
  const [t, tSections] = await Promise.all([
    getTranslations("recommendations"),
    getTranslations("sections"),
  ]);
  const linkedinUrl = home.recommendations?.linkedinRecommendationsUrl;
  const gridLayout = entries.length >= 3;

  return (
    <section id="recommendations" aria-labelledby="recommendations-heading" className="section-pad bg-surface">
      <div className="container-site">
        <SectionEyebrow label={tSections("recommendations")} />
        <Reveal as="h2" variant="clip" id="recommendations-heading" className="font-serif text-h2 text-ink">
          {home.recommendations?.heading}
        </Reveal>

        <div className={cn("mt-14 grid gap-x-10", gridLayout ? "gap-y-10 md:grid-cols-2" : "gap-y-14")}>
          {entries.map((entry) => (
            <Reveal
              as="blockquote"
              key={entry.id}
              className={gridLayout ? "" : "max-w-3xl"}
            >
              <p
                className={cn(
                  "serif-italic leading-snug text-ink",
                  gridLayout ? "text-h3/tight" : "text-h3",
                )}
              >
                <span aria-hidden="true" className="mr-1 text-accent">
                  &ldquo;
                </span>
                {entry.quote}
                <span aria-hidden="true" className="ml-1 text-accent">
                  &rdquo;
                </span>
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="mono-label flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-ink"
                >
                  {initials(entry.authorName)}
                </span>
                <div>
                  <p className="font-medium text-ink">{entry.authorName}</p>
                  <p className="mono-label mt-0.5 text-ink-muted">
                    {entry.authorTitle} · {entry.authorCompany}
                  </p>
                </div>
              </footer>
              {entry.sourceUrl ? (
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono-label link-underline mt-2 inline-block text-accent-strong"
                >
                  LINKEDIN ↗
                </a>
              ) : null}
            </Reveal>
          ))}
        </div>

        {linkedinUrl ? (
          <Reveal delay={0.1} className="mt-12">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label link-underline text-ink"
            >
              {t("moreOnLinkedin")} ↗
            </a>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
