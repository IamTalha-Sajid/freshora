"use client";

import { useEffect, useState } from "react";

export function Countdown({ end }: { end: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(end).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [end]);
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
        <div key={label} className="min-w-14 rounded-xl bg-navy px-2 py-1.5 text-center text-white">
          <div className="tabular font-display text-lg font-bold">{String(v).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-wide text-white/70">{label}</div>
        </div>
      ))}
    </div>
  );
}
