"use client";

import { useConfirm } from "@/components/ConfirmProvider";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, ErrorMsg, PageHeader } from "@/components/admin/ui";

type Review = { _id: string; name: string; email?: string; rating: number; comment: string; images?: string[]; approved: boolean; createdAt: string; product: { name: string } | null };

export default function ReviewsAdmin() {
  const confirm = useConfirm();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => setReviews(await adminFetch<Review[]>("/api/admin/reviews")), []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  return (
    <>
      <PageHeader title="Reviews" />
      <ErrorMsg msg={error} />
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="card flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm">
                <b>{r.name}</b> on <span className="text-brand">{r.product?.name ?? "(deleted product)"}</span>{" "}
                <span className="text-warn-fg">{"★".repeat(r.rating)}</span>
                {!r.approved && <span className="ml-2 rounded bg-warn-bg px-2 py-0.5 text-xs font-semibold text-warn-fg">Pending</span>}
              </div>
              <p className="mt-1 text-muted">{r.comment}</p>
              {!!r.images?.length && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.images.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="Review photo" className="h-16 w-16 rounded-lg object-cover" />
                    </a>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted">{r.email} · {new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <button className={r.approved ? "btn-outline" : "btn"} onClick={async () => { await adminFetch(`/api/admin/reviews/${r._id}`, "PUT", { approved: !r.approved }); load(); }}>{r.approved ? "Unapprove" : "Approve"}</button>
              <button className="btn-danger" onClick={async () => { if (await confirm({ title: `Delete the review by ${r.name}?`, message: "This also updates the product's rating.", confirmLabel: "Delete review", tone: "danger" })) { await adminFetch(`/api/admin/reviews/${r._id}`, "DELETE").catch(() => {}); load(); } }}>Delete</button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div className="card p-10 text-center text-muted">No reviews yet.</div>}
      </div>
    </>
  );
}
