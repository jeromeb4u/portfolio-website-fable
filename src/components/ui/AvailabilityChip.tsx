import React from "react";
import { cn } from "@/lib/utils";

const dotColor: Record<string, string> = {
  available: "bg-green-600",
  open: "bg-green-600",
  unavailable: "bg-ink-muted",
};

/**
 * ID-card availability pill (plan/01 §5, R5). Extracted so Hero and the
 * footer contact hub render the exact same chip (ui-improvements Phase F —
 * employers who scroll to the end should hit the same signal again).
 */
export function AvailabilityChip({
  availability,
  note,
  tone = "light",
  className,
}: {
  availability: string;
  note: string;
  /** "light" = on the cream background (Hero); "dark" = on the inverted footer. */
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border py-2 pl-3 pr-4 backdrop-blur-sm",
        tone === "light" ? "border-line bg-bg/70" : "border-inverse-line bg-inverse-bg/60",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full animate-pulse-dot",
          dotColor[availability] ?? "bg-green-600",
        )}
      />
      <span className={cn("mono-label", tone === "light" ? "text-ink" : "text-inverse-text")}>
        {note}
      </span>
    </span>
  );
}
