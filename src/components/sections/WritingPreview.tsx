import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { readTimeMinutes } from "@/lib/readtime";
import type { Post } from "@/payload-types";
import type { Locale } from "@/i18n/routing";

/**
 * Homepage writing preview (ui-improvements Phase H). Renders nothing when
 * there are zero published posts — a sparse blog must never look abandoned
 * or half-built on the homepage.
 */
export async function WritingPreview({ posts, locale }: { posts: Post[]; locale: Locale }) {
  if (posts.length === 0) return null;
  const t = await getTranslations("writing");
  const latest = posts.slice(0, 3);

  return (
    <section aria-labelledby="writing-heading" className="section-pad bg-surface">
      <div className="container-site">
        <Reveal as="h2" variant="clip" id="writing-heading" className="font-serif text-h2 text-ink">
          {t("title")}
        </Reveal>

        <Reveal as="ul" stagger className="mt-14 grid gap-8 md:grid-cols-3">
          {latest.map((post) => (
            <li key={post.id}>
              <Link href={`/writing/${post.slug}`} locale={locale} className="group block">
                <p className="mono-label text-ink-muted">
                  {new Date(post.publishedDate).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                  })}
                  {" · "}
                  {readTimeMinutes(post.body)} {t("minRead")}
                </p>
                <h3 className="link-underline mt-3 font-serif text-h3 text-ink">{post.title}</h3>
                <p className="mt-2 text-ink-muted">{post.summary}</p>
              </Link>
            </li>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <Link href="/writing" locale={locale} className="mono-label link-underline text-ink">
            {t("allWriting")} →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
