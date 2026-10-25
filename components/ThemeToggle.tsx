"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Tip } from "@/components/Tooltip";

function currentIsDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

/** Light/dark switch: the knob slides to the active mode's icon. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(currentIsDark()), []);

  function toggle() {
    const next = !currentIsDark();
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem("freshora_theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Tip label={label}>
      <button
        type="button"
        role="switch"
        aria-checked={!!dark}
        aria-label="Dark mode"
        onClick={toggle}
        className={`relative flex h-11 w-[68px] shrink-0 items-center rounded-full ${className}`}
      >
        <span className="relative h-8 w-[60px] rounded-full border border-input-line bg-surface-alt transition-colors">
          <span className="absolute inset-y-0 left-2 flex items-center text-muted">
            <Icon name="sun" size={14} />
          </span>
          <span className="absolute inset-y-0 right-2 flex items-center text-muted">
            <Icon name="moon" size={14} />
          </span>
          <span className={`absolute left-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] shadow transition-transform duration-200 ${dark ? "translate-x-[28px]" : "translate-x-0"}`}>
            <Icon name={dark ? "moon" : "sun"} size={14} />
          </span>
        </span>
      </button>
    </Tip>
  );
}
