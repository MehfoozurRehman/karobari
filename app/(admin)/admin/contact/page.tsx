"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDateTime } from "@/lib/dates";
import { toast } from "sonner";

export default function AdminContact() {
  const { isAuthenticated } = useConvexAuth();
  const queries = useQuery(
    api.contact.listForAdmin,
    isAuthenticated ? {} : "skip",
  );
  const setStatus = useMutation(api.contact.setStatus);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold">Contact Queries</h1>
      <div className="space-y-3">
        {queries?.length === 0 && (
          <p className="rounded-2xl border border-stone-800 py-10 text-center text-sm text-stone-500">
            No contact queries.
          </p>
        )}
        {queries?.map((q) => (
          <div
            key={q._id}
            className="space-y-2 rounded-2xl border border-stone-800 bg-stone-900/50 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold">
                  {q.name}
                  {q.businessName ? (
                    <span className="ml-2 text-xs font-medium text-stone-500">
                      ({q.businessName})
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-stone-500">
                  {q.email}
                  {q.phone ? ` · ${q.phone}` : ""} ·{" "}
                  {formatDateTime(q._creationTime)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                    q.status === "new"
                      ? "bg-blue-500/15 text-blue-400"
                      : q.status === "replied"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-stone-500/15 text-stone-400"
                  }`}
                >
                  {q.status}
                </span>
                {q.status !== "closed" && (
                  <>
                    {q.status === "new" && (
                      <button
                        className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400"
                        onClick={async () => {
                          await setStatus({ id: q._id, status: "replied" });
                          toast.success("Marked replied");
                        }}
                      >
                        Mark Replied
                      </button>
                    )}
                    <button
                      className="rounded-full bg-stone-500/15 px-3 py-1 text-xs font-semibold text-stone-400"
                      onClick={async () => {
                        await setStatus({ id: q._id, status: "closed" });
                        toast.success("Closed");
                      }}
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-stone-300">{q.message}</p>
            {q.phone && (
              <a
                href={`https://wa.me/${q.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-semibold text-emerald-400 hover:underline"
              >
                Reply on WhatsApp →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
