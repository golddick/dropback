"use client";

import { useState } from "react";

export function InviteMemberForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"tester" | "developer">("tester");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage("");
    const res = await fetch(`/api/projects/${projectId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setSending(false);
    if (res.ok) {
      setMessage(`Invite sent to ${email}.`);
      setEmail("");
    } else {
      const { error } = await res.json();
      setMessage(error ?? "Couldn't send that invite.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-amber text-sm font-mono underline"
      >
        + Invite a member
      </button>
    );
  }

  return (
    <form onSubmit={handleInvite} className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        required
        placeholder="teammate@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-surface border border-hairline rounded-lg px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-amber"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "tester" | "developer")}
        className="bg-surface border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber"
      >
        <option value="tester">Tester</option>
        <option value="developer">Developer</option>
      </select>
      <button
        type="submit"
        disabled={sending}
        className="bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {sending ? "Sending…" : "Send invite"}
      </button>
      {message && <p className="text-muted text-xs font-mono w-full">{message}</p>}
    </form>
  );
}
