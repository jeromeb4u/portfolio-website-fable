"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Animates the leading number in a stat value on scroll-into-view
 * (ui-improvements Phase D). "5.5 years @ Infosys" animates 0 → 5.5 and
 * keeps the trailing text static; "A1, actively learning" has no leading
 * number and renders as-is with no animation. No new dependency — plain
 * requestAnimationFrame with an ease-out curve.
 */
export function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  const match = value.match(/^(\d+(?:[.,]\d+)?)(.*)$/);

  useEffect(() => {
    if (!match) return; // non-numeric value — render statically
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    const target = parseFloat(match[1].replace(",", "."));
    const suffix = match[2];
    const decimals = match[1].includes(".") || match[1].includes(",") ? 1 : 0;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = target * eased;
          setDisplay(`${current.toFixed(decimals)}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [match, value, duration]);

  return <span ref={ref}>{match ? display : value}</span>;
}
