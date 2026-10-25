"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Brand";
import { Loader } from "@/components/Loader";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError((await res.json()).error ?? "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-page px-4 text-fg">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6 sm:p-8">
        <Logo href={null} className="h-10" />
        <h1 className="text-2xl">Admin sign in</h1>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-danger-fg">{error}</p>}
        <button className="btn w-full" disabled={busy}>
          {busy && (
            <span data-theme="dark" className="flex">
              <Loader size={22} />
            </span>
          )}
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
