"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";

const MAX_IMAGES = 5;

export function ReviewForm({ productId }: { productId: string }) {
  const [form, setForm] = useState({ name: "", email: "", rating: 5, comment: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, MAX_IMAGES - images.length - uploading);
    if (fileRef.current) fileRef.current.value = "";
    if (!picked.length) return;
    setError("");
    setUploading((n) => n + picked.length);
    await Promise.all(
      picked.map(async (file) => {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/reviews/upload", { method: "POST", body: fd });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error ?? "Upload failed");
          setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, data.url] : prev));
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setUploading((n) => n - 1);
        }
      })
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, images, product: productId }) });
    if (res.ok) setState("done");
    else {
      setError((await res.json()).error ?? "Something went wrong");
      setState("idle");
    }
  }

  if (state === "done")
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-5 text-sm">
        <Icon name="check" className="shrink-0 text-success" /> Thanks! Your review will appear once it has been approved.
      </div>
    );
  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <h3 className="text-lg">Write a review</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" aria-label="Your name" placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" aria-label="Email" type="email" placeholder="Email (optional, not shown)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="flex gap-0.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} role="radio" aria-checked={n === form.rating} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setForm({ ...form, rating: n })} className={`flex h-11 w-11 items-center justify-center ${n <= form.rating ? "text-warning" : "text-line"}`}>
            <Icon name="star" size={26} fill="currentColor" />
          </button>
        ))}
      </div>
      <textarea className="input" aria-label="Your review" rows={3} placeholder="Share your experience" required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
      <div>
        <div className="flex flex-wrap gap-2">
          {images.map((src) => (
            <div key={src} className="relative h-16 w-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Attached photo" className="h-full w-full rounded-lg object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => setImages(images.filter((i) => i !== src))} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#06141b] text-xs text-white">
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <div key={i} className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent text-xs text-muted">
              …
            </div>
          ))}
          {images.length + uploading < MAX_IMAGES && (
            <button type="button" onClick={() => fileRef.current?.click()} className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted hover:bg-accent">
              <span className="text-lg leading-none">+</span>Photo
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        <p className="mt-1 text-xs text-muted">Add up to {MAX_IMAGES} photos (optional, max 4MB each).</p>
      </div>
      {error && <p className="text-sm text-danger-fg">{error}</p>}
      <button className="btn" disabled={state === "sending" || uploading > 0}>
        {state === "sending" ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
