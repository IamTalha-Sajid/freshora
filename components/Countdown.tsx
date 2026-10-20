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
    <div className="flex gap-2" role="timer" aria-label="Sale ends in">
      {parts.map(([label, v]) => (
        <div key={label} className="min-w-16 rounded-2xl border border-white/15 bg-white/10 px-2.5 py-2 text-center text-white">
          <div className="tabular font-display text-[26px] font-semibold leading-[1.1]">{String(v).padStart(2, "0")}</div>
          <div className="text-xs uppercase tracking-[0.08em] text-white/70">{label}</div>
        </div>
      ))}
    </div>
  );
}
