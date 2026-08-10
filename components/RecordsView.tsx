"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

export function RecordsView({ records }: { records: { id: string; note: string; status: string; updatedAt: string }[] }) {
  const [view, setView] = useState<"table" | "cards">("cards");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button onClick={() => setView("cards")} className={`px-3 py-1 rounded ${view==='cards' ? 'bg-amber text-ink' : 'border'}`}>Cards</button>
          <button onClick={() => setView("table")} className={`px-3 py-1 rounded ${view==='table' ? 'bg-amber text-ink' : 'border'}`}>Table</button>
        </div>
      </div>

      {view === "table" ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-sm text-muted">
              <th className="py-2">Note</th>
              <th className="py-2">Updated</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? "bg-surface" : ""}>
                <td className="px-4 py-3">
                  <Link href={`/record/${r.id}`} className="hover:underline">{r.note}</Link>
                </td>
                <td className="px-4 py-3 text-muted text-sm">{r.updatedAt}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status as any} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Link key={record.id} href={`/record/${record.id}`} className="flex items-center justify-between bg-surface border border-hairline rounded-xl px-5 py-4 hover:border-amber/50 transition">
              <div>
                <p className="text-text">{record.note}</p>
                <p className="text-muted text-xs font-mono mt-1">updated {record.updatedAt}</p>
              </div>
              <StatusBadge status={record.status as any} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
