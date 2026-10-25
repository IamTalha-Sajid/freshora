"use client";

import { Icon } from "@/components/Icon";

export function BackToTop() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e3c4b] text-[#e6f4f2] transition-colors hover:border-mint hover:text-[#4fd3c4]"
    >
      <Icon name="arrow-up" size={16} strokeWidth={2.4} />
    </button>
  );
}
