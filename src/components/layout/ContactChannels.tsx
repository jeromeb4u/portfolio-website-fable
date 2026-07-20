import React from "react";
import { getTranslations } from "next-intl/server";

type Social = { platform: string; url: string; id?: string | null };

const handleFromUrl = (platform: string, url: string, email: string): string => {
  if (platform === "email") return email;
  try {
    const u = new URL(url);
    return u.pathname.replace(/\/$/, "").split("/").filter(Boolean).pop() ?? u.hostname;
  } catch {
    return url;
  }
};

/**
 * Footer contact hub (ui-improvements Phase F): labeled channel cards built
 * from SiteSettings socials + email, each with an action link.
 */
export async function ContactChannels({ socials, email }: { socials: Social[]; email: string }) {
  const t = await getTranslations("footer.channels");

  const channels = [
    { platform: "email", url: `mailto:${email}` },
    ...socials.filter((s) => s.platform !== "email"),
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => {
        const label = t.has(channel.platform) ? t(channel.platform) : t("generic");
        return (
          <a
            key={channel.platform}
            href={channel.url}
            target={channel.platform === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="link-underline group flex flex-col gap-1 border-t border-inverse-line pt-4"
          >
            <span className="mono-label text-inverse-muted">{channel.platform.toUpperCase()}</span>
            <span className="text-body-lg text-inverse-text">
              {handleFromUrl(channel.platform, channel.url, email)}
            </span>
            <span className="mono-label mt-1 text-inverse-muted transition-colors duration-300 group-hover:text-inverse-text">
              {label} ↗
            </span>
          </a>
        );
      })}
    </div>
  );
}
