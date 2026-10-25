import type { CSSProperties } from "react";

const MASK: CSSProperties = {
  WebkitMaskImage: "url(/brand/icon.png)",
  maskImage: "url(/brand/icon.png)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

const BUBBLES: [number, number, number][] = [
  [0.18, 0.14, 0],
  [0.72, 0.1, 0.5],
  [0.46, 0.08, 1],
];

/** The F mark fills with a rising teal rinse while bubbles float up. */
export function Loader({ size = 88, label = "", layout = "stacked", speed = 1.8, className = "" }: { size?: number; label?: string; layout?: "stacked" | "inline"; speed?: number; className?: string }) {
  const inline = layout === "inline";
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
      className={`inline-flex items-center ${inline ? "flex-row" : "flex-col"} ${className}`}
      style={{ gap: inline ? Math.max(8, size * 0.4) : Math.max(10, size * 0.22) }}
    >
      <span aria-hidden className="relative block shrink-0" style={{ width: size, height: size }}>
        <span className="absolute inset-0 bg-line" style={MASK} />
        <span className="absolute inset-0 overflow-hidden" style={MASK}>
          <span
            data-fr-anim=""
            className="absolute left-0 top-0 h-[200%] w-[200%] rounded-[42%]"
            style={{ background: "linear-gradient(160deg,#4fd3c4 0%,#2bc1b1 35%,#0f6f78 70%,#12435c 100%)", animation: `fr-fill ${speed}s cubic-bezier(.45,.05,.35,1) infinite alternate` }}
          />
        </span>
        {size >= 48 &&
          BUBBLES.map(([x, s, d], i) => (
            <span
              key={i}
              data-fr-anim=""
              className="absolute rounded-full"
              style={{
                left: size * x,
                bottom: size * 0.05,
                width: size * s,
                height: size * s,
                border: `${Math.max(1, size / 60)}px solid #2bc1b1`,
                background: "rgba(43,193,177,.12)",
                animation: `fr-bubble ${speed * 1.1}s ease-out ${d * speed * 0.6}s infinite`,
              }}
            />
          ))}
      </span>
      {label && (
        <span className="font-bold tracking-[0.02em] text-muted" style={{ fontSize: inline ? 14 : Math.max(13, Math.min(16, size * 0.17)) }}>
          {label}
        </span>
      )}
    </div>
  );
}
