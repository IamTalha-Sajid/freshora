"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Loader } from "@/components/Loader";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: new FormData(e.currentTarget).get("website") ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't subscribe. Try again.");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2.5 font-bold text-success" role="status">
        <Icon name="check" strokeWidth={2.6} />
        Thanks, you&apos;re subscribed.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        autoComplete="email"
        className="h-[50px] min-w-0 flex-[1_1_240px] rounded-lg border border-input-line bg-surface px-4 text-[15px] text-fg outline-none transition-shadow placeholder:text-muted focus:border-mint focus:shadow-[0_0_0_3px_rgb(43_193_177/0.25)]"
      />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button type="submit" disabled={state === "busy"} className="btn !h-[50px] !px-6 !text-[15px]">
        {state === "busy" && (
          <span data-theme="dark" className="flex">
            <Loader size={22} />
          </span>
        )}
        {state === "busy" ? "Subscribing…" : "Subscribe"}
      </button>
      {error && (
        <p role="alert" className="basis-full text-sm text-danger-fg">
          {error}
        </p>
      )}
    </form>
  );
}
