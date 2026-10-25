"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

/** Desktop: static sidebar. Mobile: the same (server-rendered) form inside a glass drawer. */
export function FilterShell({ children, activeCount }: { children: ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="btn-outline lg:hidden">
        <Icon name="filter" size={18} /> Filters{activeCount > 0 && <span className="chip">{activeCount}</span>}
      </button>
      {open && <div className="fixed inset-0 z-[60] animate-fade-in bg-[#06141b]/45 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside
        className={
          open
            ? "fixed inset-y-3 left-3 z-[61] flex w-[88%] max-w-sm animate-slide-in-left flex-col overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-[0_24px_48px_rgb(6_20_27/0.25)] lg:sticky lg:top-40 lg:z-auto lg:w-auto lg:max-w-none lg:animate-none lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
            : "hidden lg:sticky lg:top-40 lg:block"
        }
        aria-label="Filters"
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-bold">Filters</h2>
          <button onClick={() => setOpen(false)} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-alt">
            <Icon name="close" />
          </button>
        </div>
        <div>{children}</div>
      </aside>
    </div>
  );
}
