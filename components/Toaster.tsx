"use client";

import { Icon } from "@/components/Icon";
import { useStore } from "@/components/StoreProvider";

const TONE = {
  success: { icon: "check", chip: "bg-mint text-[#06141b]" },
  error: { icon: "alert", chip: "bg-danger text-white" },
  info: { icon: "info", chip: "bg-white/15 text-white" },
} as const;

/** Site-wide toasts (storefront and admin). Always dark navy so it reads on any page or theme. */
export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => {
        const tone = TONE[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex max-w-md animate-rise items-center gap-3 rounded-2xl border border-white/10 bg-[#0d2b3a] py-2.5 pl-2.5 pr-1.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgb(6_20_27/0.25)]"
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone.chip}`}>
              <Icon name={tone.icon} size={16} />
            </span>
            <span className="min-w-0 flex-1 py-0.5">{t.message}</span>
            <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white">
              <Icon name="close" size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
