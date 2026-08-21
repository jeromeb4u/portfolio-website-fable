"use client";

import React from "react";
import { createPortal } from "react-dom";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Resume slide-over: a right-hand panel holding the CV in the browser's own
 * PDF viewer, with the page behind it blurred back.
 *
 * The panel is portalled to <body> rather than rendered in place — the hero
 * is `overflow-hidden`, which would clip a fixed child and trap it under the
 * hero's own scrims in the stacking order.
 *
 * The blur lives on the backdrop only. `backdrop-filter` affects what is
 * painted *behind* an element, so the panel must be a sibling of the scrim,
 * never a child of it, or the PDF blurs along with the page.
 */
const subscribeNever = () => () => {};

export function ResumePanel({
  url,
  filename,
  triggerLabel,
  panelLabel,
  downloadLabel,
  openTabLabel,
  closeLabel,
}: {
  url: string;
  filename?: string;
  triggerLabel: string;
  panelLabel: string;
  downloadLabel: string;
  openTabLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // "Has this hydrated yet" — read through useSyncExternalStore rather than a
  // setState in an effect, which costs an extra render pass and trips
  // react-hooks/set-state-in-effect. Server snapshot false, client true.
  const mounted = React.useSyncExternalStore(subscribeNever, () => true, () => false);

  // Esc closes; Tab is trapped inside the panel while it is open.
  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Lock the page behind the panel, compensating for the scrollbar so the
  // blurred hero does not shift sideways as the panel opens.
  React.useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gap = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [open]);

  // Move focus into the panel on open, and hand it back to the trigger on
  // close so keyboard users do not get dropped at the top of the document.
  React.useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    } else if (mounted) {
      triggerRef.current?.focus();
    }
    // `mounted` guard keeps the initial render from stealing focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={buttonClasses("ghost")}
      >
        {triggerLabel}
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[100]">
              {/* Scrim: blurs and darkens the page. Sibling of the panel. */}
              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => setOpen(false)}
                className="absolute inset-0 h-full w-full cursor-default bg-bg/70 backdrop-blur-md motion-safe:animate-[fadeIn_200ms_ease-out]"
              />

              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={panelLabel}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex w-full flex-col bg-[#141413] shadow-[0_0_60px_rgba(0,0,0,0.5)] outline-none lg:w-[52vw] motion-safe:animate-[slideInRight_260ms_cubic-bezier(0.22,1,0.36,1)]"
              >
                <header className="flex shrink-0 items-center justify-between gap-4 px-5 py-4">
                  <p className="mono-label text-ink-faint">{panelLabel}</p>

                  <div className="flex items-center gap-2">
                    <a
                      href={url}
                      download={filename}
                      className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors duration-300 hover:border-ink"
                    >
                      {downloadLabel}
                    </a>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors duration-300 hover:border-ink"
                    >
                      {openTabLabel}
                    </a>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label={closeLabel}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-ink"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 1l12 12M13 1L1 13"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </header>

                {/* The toolbar (zoom, paging, print) is the browser's own PDF
                    viewer chrome — embedding the file directly is what gives
                    the reference its native controls. */}
                <iframe
                  src={url}
                  title={panelLabel}
                  className="h-full w-full flex-1 border-0 bg-[#333]"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
