"use client";

import { useState } from "react";

export function NewProjectModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (id: string) => void; }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"tester" | "developer">("developer");
  const [initialNote, setInitialNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, initialNote: initialNote || undefined }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    const json = await res.json();
    onClose();
    if (onCreated) onCreated(json.projectId || json.projectId);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="bg-surface border border-hairline rounded-xl p-6 w-full max-w-md z-10">
        <h2 className="font-display text-xl font-bold mb-4">New project</h2>
        <div className="mb-3">
          <label className="block text-sm text-muted mb-1">Project name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface border border-hairline rounded px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-sm text-muted mb-1">Role for creator</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "tester" | "developer")}
            className="w-full bg-surface border border-hairline rounded px-3 py-2"
          >
            <option value="developer">Developer</option>
            <option value="tester">Tester</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-muted mb-1">Initial report (optional)</label>
          <textarea value={initialNote} onChange={(e) => setInitialNote(e.target.value)} className="w-full bg-surface border border-hairline rounded px-3 py-2" rows={3} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border">Cancel</button>
          <button type="submit" disabled={submitting} className="bg-amber text-ink px-4 py-2 rounded-lg">{submitting? 'Creating…':'Create'}</button>
        </div>
      </form>
    </div>
  );
}
