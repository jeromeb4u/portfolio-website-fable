import React from "react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { PageIntro } from "@/components/layout/PageIntro";
import { CaseStudyCard } from "@/components/work/CaseStudyCard";
import type { CaseStudy } from "@/payload-types";

/** Full case-study archive at /work (ui-improvements Phase B) — every published study, not just featured. */
export async function WorkArchive({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const [t, tSections] = await Promise.all([
    getTranslations("work"),
    getTranslations("sections"),
  ]);

  return (
    <>
      <PageIntro
        eyebrow={tSections("work")}
        heading={t("workArchiveTitle")}
        lede={t("workArchiveDescription")}
      />
      {caseStudies.length > 0 ? (
        <section className="section-pad pt-8">
          <div className="container-site">
            <Reveal as="ul" stagger className="grid gap-8 md:grid-cols-2">
              {caseStudies.map((cs, i) => (
                <CaseStudyCard key={cs.id} cs={cs} index={i} />
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}
    </>
  );
}
