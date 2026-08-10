"use client";

import { useState } from "react";

const FIELDS = [
  { name: "id", label: "Record ID" },
  { name: "url", label: "URL" },
  { name: "status", label: "Status" },
  { name: "note", label: "Initial note" },
  { name: "created_at", label: "Created at" },
];

export function ProjectExportModal({
  open,
  onClose,
  projectId,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
}) {
  const [selected, setSelected] = useState<string[]>(["id", "status", "created_at"]);
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  function toggleField(field: string) {
    setSelected((current) =>
      current.includes(field) ? current.filter((item) => item !== field) : [...current, field]
    );
  }

  async function download() {
    setDownloading(true);
    const res = await fetch(`/api/projects/${projectId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: selected }),
    });
    setDownloading(false);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}-report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-surface border border-hairline rounded-xl p-6 w-full max-w-lg z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold">Export project records</h2>
            <p className="text-muted text-sm">Select the columns you want in the report.</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted text-sm">Close</button>
        </div>
        <div className="grid gap-3">
          {FIELDS.map((field) => (
            <label key={field.name} className="flex items-center gap-3 border border-hairline rounded-lg px-4 py-3">
              <input
                type="checkbox"
                checked={selected.includes(field.name)}
                onChange={() => toggleField(field.name)}
              />
              <span>{field.label}</span>
            </label>
          ))}
        </div>
        <p className="text-muted text-xs mt-3">Column mapping: <strong>Record ID</strong> → <em>test_records.id</em>; <strong>URL</strong> → <em>test_records.url</em>; <strong>Status</strong> → <em>test_records.status</em>; <strong>Initial note</strong> → <em>first note event payload.text</em>; <strong>Created at</strong> → <em>test_records.created_at</em>.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button type="button" onClick={download} disabled={downloading} className="bg-amber text-ink px-4 py-2 rounded-lg">
            {downloading ? "Downloading…" : "Export CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
