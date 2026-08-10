"use client";

import { useState } from "react";

export function ProjectMembersButton({
  members,
}: {
  members: Array<{ projectId: string; userId: string; role: string; user: { email: string } }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2  px-4 py-2 text-sm font-medium text-text hover:text-amber transition"
      >
        View members ({members.length})
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-surface border border-hairline  px-5 py-4 hover:border-amber/50 transition shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold">Project members</h2>
                <p className="text-sm text-muted">{members.length} member{members.length === 1 ? "" : "s"}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted">Close</button>
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div key={`${member.projectId}-${member.userId}`} >
                  <p className="font-medium text-text">{member.user.email}</p>
                  <p className="text-muted text-sm">{member.role}</p>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm text-muted">No members have joined this project yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
