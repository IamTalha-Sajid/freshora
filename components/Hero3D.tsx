"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

/** Interactive 3D molar, toothbrush and bubbles. three.js loads lazily, after first paint. */
type Scene = { dispose(): void; tint(rim: number, bubble: number): void };

/** Phones on a data saver or with little memory get a static stage instead of a WebGL scene. */
function lowPower() {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return !!n.connection?.saveData || (n.deviceMemory !== undefined && n.deviceMemory <= 2);
}

export function Hero3D({ className = "", tint }: { className?: string; tint?: { rim: number; bubble: number } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const tintRef = useRef(tint);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    tintRef.current = tint;
    if (tint) sceneRef.current?.tint(tint.rim, tint.bubble);
  }, [tint]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    let scene: Scene | undefined;
    (lowPower() ? Promise.reject(new Error("low power")) : import("@/lib/hero3d"))
      .then((m) => m.mount(canvas, { autorotate: true, brush: false, bubbles: true }))
      .then((s) => {
        if (cancelled) s.dispose();
        else {
          scene = s;
          sceneRef.current = s;
          if (tintRef.current) s.tint(tintRef.current.rim, tintRef.current.bubble);
        }
      })
      .catch(() => {
        if (!cancelled) setFallback(true); // no WebGL or data saver: a still tooth instead
      });
    return () => {
      cancelled = true;
      sceneRef.current = null;
      scene?.dispose();
    };
  }, []);

  if (fallback)
    return (
      <div aria-hidden className={`${className} flex items-center justify-center`}>
        <span className="flex aspect-square h-[70%] items-center justify-center rounded-full bg-white/10 text-mint shadow-[inset_0_0_60px_rgb(79_211_196/0.25)]">
          <Icon name="tooth" size={120} strokeWidth={1.2} />
        </span>
      </div>
    );
  return <canvas ref={ref} aria-hidden className={className} />;
}
