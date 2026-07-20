import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { CaseStudyCard } from "@/components/work/CaseStudyCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import type { Home, CaseStudy } from "@/payload-types";
import type { Locale } from "@/i18n/routing";

/**
 * Work grid (plan/04, ui-improvements Phase A/B). Zero published case
 * studies → intro copy only, no placeholder cards, no "coming soon" (owner
 * rule). Homepage shows featured case studies; "All case studies →" only
 * renders when the archive holds more than what's shown here.
 */
export async function Work({
  home,
  caseStudies,
  showArchiveLink,
  archiveLinkLabel,
  locale,
}: {
  home: Home;
  caseStudies: CaseStudy[];
  showArchiveLink: boolean;
  archiveLinkLabel: string;
  locale: Locale;
}) {
  const t = await getTranslations("sections");
  return (
    <section id="work" aria-labelledby="work-heading" className="section-pad">
      <div className="container-site">
        <SectionEyebrow label={t("work")} />
        <Reveal as="h2" variant="clip" id="work-heading" className="font-serif text-h2 text-ink">
          {home.workIntro?.heading}
        </Reveal>
        {home.workIntro?.body ? (
          <Reveal as="p" delay={0.15} className="mt-6 max-w-xl text-body-lg text-ink-muted">
            {home.workIntro.body}
          </Reveal>
        ) : null}

        {caseStudies.length > 0 ? (
          <>
            <Reveal as="ul" stagger className="mt-14 grid gap-8 md:grid-cols-2">
              {caseStudies.map((cs, i) => (
                <CaseStudyCard key={cs.id} cs={cs} index={i} />
              ))}
            </Reveal>
            {showArchiveLink ? (
              <Reveal delay={0.1} className="mt-12">
                <Link href="/work" locale={locale} className="mono-label link-underline text-ink">
                  {archiveLinkLabel} →
                </Link>
              </Reveal>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
