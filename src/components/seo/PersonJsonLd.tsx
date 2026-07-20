import React from "react";
import { absoluteUrl } from "@/lib/seo";

/**
 * Schema.org Person JSON-LD (portfolio-improvements Phase 3e). sameAs pulls
 * whatever LinkedIn/GitHub URLs exist in SiteSettings socials.
 */
export function PersonJsonLd({
  email,
  socialUrls,
}: {
  email: string;
  socialUrls: string[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jerome D'mello",
    jobTitle: "Frontend Engineer",
    knowsAbout: ["React", "Next.js", "Angular", "TypeScript", "AI tools"],
    knowsLanguage: ["English", "German"],
    email: `mailto:${email}`,
    url: absoluteUrl("/"),
    sameAs: socialUrls,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
