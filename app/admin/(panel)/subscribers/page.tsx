"use client";

import { useEffect, useState } from "react";
import { adminFetch, ErrorMsg, PageHeader } from "@/components/admin/ui";

type Subscriber = { _id: string; email: string; createdAt: string };

export default function SubscribersAdmin() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    adminFetch<Subscriber[]>("/api/admin/subscribers").then(setSubs).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageHeader title={`Subscribers (${subs.length})`} />
      <ErrorMsg msg={error} />
      <div className="card divide-y divide-line-soft">
        {subs.map((s) => (
          <div key={s._id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="min-w-0 truncate font-semibold">{s.email}</span>
            <span className="shrink-0 text-xs text-muted">{new Date(s.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
        {subs.length === 0 && <div className="p-10 text-center text-muted">No subscribers yet.</div>}
      </div>
    </>
  );
}
