"use client";

import { useEffect, useState } from "react";

export function ShareProjectLink({ projectId }: { projectId: string }) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(`${window.location.origin}/dashboard/${projectId}`);
  }, [projectId]);

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted">
    
         <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-2 text-sm transition hover:border-amber/60"
      >
        <span aria-hidden="true">📋</span>
        <span>Copy link</span>
      </button>
      </div>
     
      {copied ? <span className="text-emerald-400 text-xs">Link copied!</span> : null}
    </div>
  );
}
