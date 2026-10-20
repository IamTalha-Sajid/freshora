import type { ReactNode } from "react";

/**
 * Real tooltip for icon-only controls (the native `title` attribute never shows on keyboard focus or touch).
 * Shows on hover and on keyboard focus; hidden on touch devices where there is no hover. The label should
 * match the control's aria-label.
 */
export function Tip({ label, children, side = "bottom", className = "inline-flex" }: { label: string; children: ReactNode; side?: "bottom" | "top" | "left"; className?: string }) {
  const pos = side === "bottom" ? "left-1/2 top-full mt-2 -translate-x-1/2" : side === "top" ? "bottom-full left-1/2 mb-2 -translate-x-1/2" : "right-full top-1/2 mr-2 -translate-y-1/2";
  return (
    <span className={`group/tip relative ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-[80] hidden whitespace-nowrap rounded-lg bg-[#06141b] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-[0_4px_12px_rgb(6_20_27/0.2)] transition-opacity duration-150 [@media(hover:hover)]:block group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${pos}`}
      >
        {label}
      </span>
    </span>
  );
}
