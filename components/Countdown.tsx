"use client";

import { useEffect, useState } from "react";

/** `compact` renders plain inline text ("2d 04:15:09") for use inside a pill. */
export function Countdown({ end, compact = false }: { end: string; compact?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(end).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [end]);
  if (compact) {
    if (left !== null && left <= 0) return null;
    const d = left === null ? 0 : Math.floor(left / 86400000);
    const hms = [Math.floor((left ?? 0) / 3600000) % 24, Math.floor((left ?? 0) / 60000) % 60, Math.floor((left ?? 0) / 1000) % 60].map((n) => String(n).padStart(2, "0")).join(":");
    return (
      <span className="tabular" role="timer" aria-label="Sale ends in">
        {left === null ? "--:--:--" : `${d > 0 ? `${d}d ` : ""}${hms}`}
      </span>
    );
  }
  if (left === null || left <= 0) return null;
  const parts = [
    ["Days", Math.floor(left / 86400000)],
    ["Hrs", Math.floor(left / 3600000) % 24],
    ["Min", Math.floor(left / 60000) % 60],
    ["Sec", Math.floor(left / 1000) % 60],
  ] as const;
  return (
    <div className="flex gap-1.5" role="timer" aria-label="Sale ends in">
      {parts.map(([label, v]) => (
        <div key={label} className="min-w-[60px] rounded-lg bg-[#0d2b3a] px-1.5 py-2 text-center text-white">
          <div className="tabular font-display text-2xl font-bold leading-[1.1]">{String(v).padStart(2, "0")}</div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#cfe3e6]">{label}</div>
        </div>
      ))}
    </div>
  );
}
