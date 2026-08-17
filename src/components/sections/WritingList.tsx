import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { PageIntro } from "@/components/layout/PageIntro";
import { readTimeMinutes } from "@/lib/readtime";
import type { Post } from "@/payload-types";
import type { Locale } from "@/i18n/routing";

/** Full post archive at /writing (portfolio-improvements Phase 6). */
export async function WritingList({ posts, locale }: { posts: Post[]; locale: Locale }) {
  const [t, tPages] = await Promise.all([getTranslations("writing"), getTranslations("pages")]);

  return (
    <>
      <PageIntro
        eyebrow={tPages("writingEyebrow")}
        heading={t("title")}
        lede={tPages("writingLede")}
      />
      <section className="section-pad pt-8">
      <div className="container-site">
        <Reveal as="ul" stagger className="max-w-2xl divide-y divide-line border-y border-line">
          {posts.map((post) => (
            <li key={post.id} className="py-8 first:pt-0">
              <Link href={`/writing/${post.slug}`} locale={locale} className="group block">
                <p className="mono-label text-ink-muted">
                  {new Date(post.publishedDate).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                  })}
                  {" · "}
                  {readTimeMinutes(post.body)} {t("minRead")}
                </p>
                <h2 className="link-underline mt-3 font-serif text-h3 text-ink">{post.title}</h2>
                <p className="mt-2 text-ink-muted">{post.summary}</p>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
      </section>
    </>
  );
}
