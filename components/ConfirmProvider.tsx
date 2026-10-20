"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

export type ConfirmOptions = {
  /** Say what is about to happen to what: `Delete "Mint Mouthwash"?` */
  title: string;
  message?: ReactNode;
  /** Verb-first, names the action: "Delete product", "Cancel order". */
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
};

type Ask = (opts: ConfirmOptions) => Promise<boolean>;
const Ctx = createContext<Ask | null>(null);

/** `const confirm = useConfirm(); if (!(await confirm({ title: "Delete…?", tone: "danger" }))) return;` */
export function useConfirm() {
  const ask = useContext(Ctx);
  if (!ask) throw new Error("useConfirm must be used within ConfirmProvider");
  return ask;
}

type Pending = { opts: ConfirmOptions; resolve: (ok: boolean) => void };

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const ask = useCallback<Ask>(
    (opts) =>
      new Promise<boolean>((resolve) => {
        pendingRef.current?.resolve(false); // a newer question replaces an unanswered one
        const p = { opts, resolve };
        pendingRef.current = p;
        setPending(p);
      }),
    []
  );

  const answer = useCallback((ok: boolean) => {
    pendingRef.current?.resolve(ok);
    pendingRef.current = null;
    setPending(null);
  }, []);

  return (
    <Ctx.Provider value={ask}>
      {children}
      {pending && <ConfirmDialog opts={pending.opts} onAnswer={answer} />}
    </Ctx.Provider>
  );
}

function ConfirmDialog({ opts, onAnswer }: { opts: ConfirmOptions; onAnswer: (ok: boolean) => void }) {
  const { title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "default" } = opts;
  const danger = tone === "danger";
  const panel = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancel.current?.focus(); // the safe choice is focused first, so Enter never destroys anything by accident
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        return onAnswer(false);
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>("button:not([disabled])")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onAnswer]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-[#06141b]/55" onClick={() => onAnswer(false)} aria-hidden />
      <div
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? bodyId : undefined}
        className="relative w-full max-w-sm animate-rise rounded-3xl border border-line bg-surface p-6 text-fg shadow-[0_16px_48px_rgb(6_20_27/0.2)]"
      >
        <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${danger ? "bg-danger/10 text-danger-fg" : "bg-accent text-link"}`}>
          <Icon name={danger ? "trash" : "info"} size={24} />
        </span>
        <h2 id={titleId} className="text-xl">
          {title}
        </h2>
        {message && (
          <div id={bodyId} className="mt-2 text-sm text-muted">
            {message}
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button ref={cancel} type="button" onClick={() => onAnswer(false)} className="btn-outline">
            {cancelLabel}
          </button>
          <button type="button" onClick={() => onAnswer(true)} className={danger ? "btn-danger-solid" : "btn"}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
