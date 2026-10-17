"use client";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";

/** Button with the signature "bubble pop" burst when clicked. */
export function PopButton({ children, className = "btn", onClick, ...rest }: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const [pops, setPops] = useState(0);
  return (
    <button
      {...rest}
      className={`relative ${className} ${pops ? "animate-pop" : ""}`}
      onClick={(e) => {
        setPops((n) => n + 1);
        setTimeout(() => setPops(0), 600);
        onClick?.(e);
      }}
    >
      {children}
      {pops > 0 && (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {[-18, -6, 8, 20].map((x, i) => (
            <span
              key={`${pops}-${i}`}
              className="absolute left-1/2 top-0 h-2.5 w-2.5 rounded-full bg-mint/80"
              style={{ ["--bx" as string]: `${x}px`, marginLeft: x / 2, animation: `bubble 0.6s ease-out ${i * 40}ms both` }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
