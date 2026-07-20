import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CardCover } from "@/components/work/CardCover";
import type { CaseStudy, Media } from "@/payload-types";

/**
 * Shared by the homepage Work grid and the /work archive (ui-improvements
 * Phase A + B). Leads with the first metric when one exists (reference
 * pattern), shows a confidential badge instead of omitting NDA'd work, and
 * uses the same 01–NN index system as the Experience timeline.
 */
export async function CaseStudyCard({ cs, index }: { cs: CaseStudy; index: number }) {
  const t = await getTranslations("work");
  const cover = cs.coverImage as Media;
  const firstMetric = (cs.metrics ?? [])[0];

  return (
    <li className="group">
      <Link href={`/work/${cs.slug}`} className="block">
        <CardCover
          url={cover?.url}
          alt={cover?.alt ?? cs.title}
          width={cover?.width ?? 960}
          height={cover?.height ?? 640}
          ctaLabel={t("cardCta")}
          confidential={cs.confidential}
          confidentialLabel={t("confidential")}
        />

        <div className="mt-5 flex items-baseline gap-3">
          <span className="mono-label text-accent-strong">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="text-h3 font-medium text-ink">{cs.title}</h3>
          <span className="mono-label ml-auto shrink-0 text-ink-muted">{cs.year}</span>
        </div>

        {firstMetric ? (
          <p className="mt-2 truncate">
            <span className="relative inline-block align-baseline">
              <span className="text-h3 text-accent-strong">{firstMetric.value}</span>
              {/* single underline sweep on card hover — one pass, no loop */}
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:hidden"
              />
            </span>{" "}
            <span className="text-ink-muted">{firstMetric.label}</span>
          </p>
        ) : (
          <p className="mt-2 max-w-md text-ink-muted">{cs.summary}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mono-label rounded-full border border-line px-3 py-1 text-accent-strong">
            {cs.projectType}
          </span>
          {(cs.stack ?? []).slice(0, 4).map((s) => (
            <span key={s.id} className="mono-label rounded-full border border-line px-3 py-1 text-ink-muted">
              {s.tech}
            </span>
          ))}
        </div>

        <span className="mono-label link-underline mt-5 inline-block text-ink">
          {t("view")} →
        </span>
      </Link>
    </li>
  );
}
