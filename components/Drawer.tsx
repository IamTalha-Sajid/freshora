"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "right" | "left" | "center";
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
};

/** Glass slide-over (or centered modal) with backdrop, Esc to close, scroll lock and focus return. */
export function Drawer({ open, onClose, title, side = "right", children, footer, width = "max-w-md" }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const pos =
    side === "center"
      ? "left-1/2 top-1/2 max-h-[88vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl animate-rise"
      : side === "right"
        ? "right-0 top-0 h-full w-full animate-slide-in-right sm:right-3 sm:top-3 sm:h-[calc(100%-1.5rem)] sm:rounded-3xl"
        : "left-0 top-0 h-full w-[88%] animate-slide-in-left sm:left-3 sm:top-3 sm:h-[calc(100%-1.5rem)] sm:rounded-3xl";
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 animate-fade-in bg-[#06141b]/45" onClick={onClose} aria-hidden />
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`glass-strong absolute flex flex-col outline-none ${width} ${pos}`}>
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <h2 className="text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent">
            <Icon name="close" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line/70 p-5">{footer}</div>}
      </div>
    </div>
  );
}
