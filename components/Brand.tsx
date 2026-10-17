import Link from "next/link";

/** Logo that swaps to the light-text version in dark mode (and over the dark hero). */
export function Logo({ className = "h-9", href = "/", onDark = false, lightOnly = false }: { className?: string; href?: string | null; onDark?: boolean; lightOnly?: boolean }) {
  const img = lightOnly ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/logo.png" alt="Freshora" className={`w-auto ${className}`} />
  ) : (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!onDark && <img src="/brand/logo.png" alt="Freshora" className={`logo-on-light w-auto ${className}`} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-dark.png" alt={onDark ? "Freshora" : ""} aria-hidden={!onDark} className={`${onDark ? "" : "logo-on-dark"} w-auto ${className}`} />
    </>
  );
  return href ? (
    <Link href={href} aria-label="Freshora home" className="flex shrink-0 items-center">
      {img}
    </Link>
  ) : (
    <span className="flex items-center">{img}</span>
  );
}

/** Soft blurred navy/teal/mint blobs. Place behind glass so the blur has color to pick up. */
export function Blobs({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -left-24 top-10 h-80 w-80 animate-float rounded-full bg-mint/30 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-96 w-96 animate-float rounded-full bg-teal/25 blur-3xl [animation-delay:-3s]" />
      <div className="absolute -bottom-20 left-1/3 h-80 w-80 animate-float rounded-full bg-navy/20 blur-3xl [animation-delay:-6s]" />
    </div>
  );
}
