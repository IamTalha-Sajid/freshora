"use client";

import { useRef, useState } from "react";
import { notify } from "@/components/toast-bus";

export async function adminFetch<T = unknown>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }
  const data = await res.json().catch(() => ({}));
  const changes = method !== "GET";
  if (!res.ok) {
    if (changes) notify.error(data.error ?? "That didn't go through. Try again.");
    throw new Error(data.error ?? "Request failed");
  }
  if (changes) notify.success(method === "POST" ? "Created" : method === "DELETE" ? "Deleted" : "Changes saved");
  return data as T;
}

/** ISO string <-> value for <input type="datetime-local"> (local time). */
export const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
export const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : "");

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

export function ErrorMsg({ msg }: { msg: string }) {
  return msg ? <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-fg">{msg}</p> : null;
}

export function ImageUpload({ value, onChange, multiple = false }: { value: string[]; onChange: (v: string[]) => void; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        urls.push(data.url);
      }
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((u, i) => (
          <div key={u} className="relative h-20 w-20 overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button type="button" aria-label="Remove image" className="absolute right-0.5 top-0.5 rounded-full bg-black/70 px-1.5 text-xs text-white" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => upload(e.target.files)} />
      <button type="button" className="btn-outline" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Uploading…" : multiple ? "Upload images" : "Upload image"}
      </button>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="…or paste an image URL and press Enter"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const v = e.currentTarget.value.trim();
            if (v) onChange(multiple ? [...value, v] : [v]);
            e.currentTarget.value = "";
          }}
        />
      </div>
      <ErrorMsg msg={error} />
    </div>
  );
}
