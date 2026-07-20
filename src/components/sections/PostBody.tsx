import React from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { RichTextRenderer } from "@/components/richtext/RichTextRenderer";
import { readTimeMinutes } from "@/lib/readtime";
import type { Post, Media } from "@/payload-types";
import type { Locale } from "@/i18n/routing";

/** Post detail body (portfolio-improvements Phase 6). */
export async function PostBody({ post, locale }: { post: Post; locale: Locale }) {
  const t = await getTranslations("writing");
  const cover = post.coverImage as Media | null;

  return (
    <article className="pt-32">
      <div className="container-site max-w-3xl">
        <p className="mono-label text-ink-muted">
          {new Date(post.publishedDate).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {" · "}
          {readTimeMinutes(post.body)} {t("minRead")}
        </p>

        <Reveal as="h1" variant="clip" className="mt-6 font-serif text-display text-ink">
          {post.title}
        </Reveal>
        <Reveal as="p" delay={0.15} className="mt-6 text-body-lg text-ink-muted">
          {post.summary}
        </Reveal>
      </div>

      {cover?.url ? (
        <div className="container-site mt-14 max-w-3xl">
          <Image
            src={cover.url}
            alt={cover.alt ?? post.title}
            width={cover.width ?? 1200}
            height={cover.height ?? 630}
            priority
            className="w-full rounded-xl object-cover"
          />
        </div>
      ) : null}

      <div className="container-site section-pad">
        <RichTextRenderer data={post.body} className="mx-auto max-w-3xl" />
      </div>
    </article>
  );
}
