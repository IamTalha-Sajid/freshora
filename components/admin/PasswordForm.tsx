"use client";

import { useState } from "react";
import { adminFetch, ErrorMsg, Field } from "@/components/admin/ui";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(false);
    setBusy(true);
    try {
      await adminFetch("/api/admin/password", "PUT", { current, next });
      setCurrent("");
      setNext("");
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-4 p-5">
      <h2 className="font-semibold">Change password</h2>
      <p className="text-sm text-muted">Changing it signs out every other device.</p>
      <ErrorMsg msg={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Current password"><input className="input" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
        <Field label="New password" hint="At least 10 characters"><input className="input" type="password" autoComplete="new-password" required minLength={10} value={next} onChange={(e) => setNext(e.target.value)} /></Field>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
        {done && <span className="text-sm font-semibold text-ok-fg">Password updated ✓</span>}
      </div>
    </form>
  );
}
