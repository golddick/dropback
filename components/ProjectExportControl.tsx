"use client";

import { useState } from "react";
import { ProjectExportModal } from "@/components/ProjectExportModal";

export function ProjectExportControl({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-surface border border-hairline text-sm px-4 py-2 rounded-lg hover:border-amber/50 transition"
      >
        Export records
      </button>
      <ProjectExportModal open={open} onClose={() => setOpen(false)} projectId={projectId} />
    </>
  );
}
