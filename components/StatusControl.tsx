"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { RecordStatus, STATUS_LABELS } from "@/types";

const NEXT_STATUSES: Record<RecordStatus, RecordStatus[]> = {
  open: ["in_progress"],
  in_progress: ["fixed_pending_retest"],
  fixed_pending_retest: ["verified", "still_broken"],
  still_broken: ["in_progress"],
  verified: ["closed"],
  closed: [],
};

export function StatusControl({
  recordId,
  currentStatus,
}: {
  recordId: string;
  currentStatus: RecordStatus;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [isMember, setIsMember] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      setIsMember(null);
      return;
    }
    fetch(`/api/records/${recordId}/membership`)
      .then((res) => res.json())
      .then((data) => setIsMember(data.isMember))
      .catch(() => setIsMember(false));
  }, [session, recordId]);

  if (sessionStatus === "loading" || (session && isMember === null)) {
    return <p className="text-muted text-sm font-mono">Checking access…</p>;
  }

  if (!session) {
    return (
      <p className="text-muted text-sm font-mono">
        <button onClick={() => signIn()} className="text-amber underline">
          Sign in
        </button>{" "}
        as a project member to update status or comment.
      </p>
    );
  }

  if (!isMember) {
    return (
      <p className="text-muted text-sm font-mono">
        You're signed in, but you're not a member of this project yet. Ask an
        existing member to invite you.
      </p>
    );
  }

  const options = NEXT_STATUSES[currentStatus];

  async function updateStatus(next: RecordStatus) {
    setUpdating(true);
    setError("");
    const res = await fetch(`/api/records/${recordId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setUpdating(false);
    if (res.ok) {
      window.location.reload();
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? "Couldn't update status.");
    }
  }

  if (options.length === 0) {
    return <p className="text-muted text-sm font-mono">This record is closed.</p>;
  }

  return (
    <div>
      <p className="text-muted text-sm font-mono mb-3">Update status:</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((next) => (
          <button
            key={next}
            onClick={() => updateStatus(next)}
            disabled={updating}
            className="border border-hairline hover:border-amber/50 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {STATUS_LABELS[next]}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-signal-red text-xs font-mono mt-2">{error}</p>
      )}
    </div>
  );
}
