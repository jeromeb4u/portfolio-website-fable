import React from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import { cn } from "@/lib/utils";

/**
 * Shared lexical body renderer (portfolio-improvements Phase 6) — same prose
 * styling used by case studies and posts, defined once so both stay in sync.
 */
export function RichTextRenderer({
  data,
  className,
}: {
  data: DefaultTypedEditorState;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose-content space-y-6 text-body-lg text-ink",
        "[&_h2]:text-h3 [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:mt-12",
        "[&_h3]:font-semibold",
        "[&_img]:rounded-xl",
        "[&_a]:text-accent-strong [&_a]:underline-offset-4 hover:[&_a]:underline",
        className,
      )}
    >
      <RichText data={data} />
    </div>
  );
}
