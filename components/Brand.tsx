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
    <Link href={href} aria-label="Freshora home" className="flex min-h-11 shrink-0 items-center">
      {img}
    </Link>
  ) : (
    <span className="flex items-center">{img}</span>
  );
}
