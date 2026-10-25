"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { formatPKR } from "@/lib/pricing";

type Suggestion = { _id: string; name: string; slug: string; image?: string; price: number };

export function SearchBox({ autoFocus = false, onDone, className = "" }: { autoFocus?: boolean; onDone?: () => void; className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    setBusy(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setItems(Array.isArray(d) ? d : []);
          setOpen(true);
        })
        .catch(() => {})
        .finally(() => setBusy(false));
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const away = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  function go(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    onDone?.();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  }

  return (
    <div ref={wrap} className={`relative w-full ${className}`}>
      <form onSubmit={go} role="search" className="flex h-[46px] overflow-hidden rounded-lg border border-input-line bg-input-bg transition-shadow focus-within:border-mint focus-within:shadow-[0_0_0_3px_rgb(43_193_177/0.25)]">
        <label className="sr-only" htmlFor="site-search">
          Search products
        </label>
        <input
          id="site-search"
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          autoComplete="off"
          placeholder="Search toothpaste, brushes, floss…"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-fg outline-none placeholder:text-muted"
        />
        <button type="submit" aria-label="Search" className="flex w-[52px] items-center justify-center bg-[var(--btn-bg)] text-[var(--btn-fg)] transition-colors hover:bg-[var(--btn-bg-hover)]">
          <Icon name="search" size={18} strokeWidth={2.2} />
        </button>
      </form>
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-surface text-fg shadow-[0_16px_40px_rgb(6_20_27/0.18)] animate-rise">
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted">{busy ? "Searching…" : `No products found for “${q.trim()}”.`}</p>
          ) : (
            <ul>
              {items.map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onDone?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-alt"
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.image && <img src={p.image} alt="" className="h-full w-full object-contain" />}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
                    <span className="tabular text-sm text-muted">{formatPKR(p.price)}</span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-line-soft">
                <button onClick={go} className="w-full px-4 py-3 text-left text-sm font-bold text-link hover:bg-surface-alt">
                  See all results for “{q.trim()}” →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
