import React from "react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { CaseStudyCard } from "@/components/work/CaseStudyCard";
import type { CaseStudy } from "@/payload-types";

/** Full case-study archive at /work (ui-improvements Phase B) — every published study, not just featured. */
export async function WorkArchive({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const t = await getTranslations("work");

  return (
    <section className="pt-40 section-pad">
      <div className="container-site">
        <Reveal as="h1" variant="clip" className="font-serif text-display text-ink">
          {t("workArchiveTitle")}
        </Reveal>
        <Reveal as="p" delay={0.15} className="mt-6 max-w-xl text-body-lg text-ink-muted">
          {t("workArchiveDescription")}
        </Reveal>

        {caseStudies.length > 0 ? (
          <Reveal as="ul" stagger className="mt-14 grid gap-8 md:grid-cols-2">
            {caseStudies.map((cs, i) => (
              <CaseStudyCard key={cs.id} cs={cs} index={i} />
            ))}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
