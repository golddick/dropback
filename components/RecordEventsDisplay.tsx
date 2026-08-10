"use client";

import { useState } from "react";
import { RecordEvent } from "@/types";
import { RecordEventTimeline } from "@/components/RecordEventTimeline";
import MediaViewer from "@/components/MediaViewer";

function eventDetail(event: RecordEvent) {
  const payload =
    typeof event.payload === "object" && event.payload !== null && !Array.isArray(event.payload)
      ? (event.payload as Record<string, unknown>)
      : {};

  switch (event.type) {
    case "screenshot":
    case "video":
      return payload.url as string | undefined;
    case "note":
    case "comment":
      return payload.text as string | undefined;
    case "status_change":
      return `${payload.from as string ?? ""} → ${payload.to as string ?? ""}`;
    default:
      return "";
  }
}

export function RecordEventsDisplay({ events }: { events: RecordEvent[] }) {
  const [view, setView] = useState<"table" | "timeline">("table");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | undefined>(undefined);
  const [viewerType, setViewerType] = useState<"screenshot" | "video" | undefined>(undefined);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-display text-xl font-bold">Record details</p>
          <p className="text-muted text-sm">Choose how to view events.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`rounded-lg px-3 py-2 border ${view === "table" ? "bg-amber text-ink" : "border-hairline"}`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setView("timeline")}
            className={`rounded-lg px-3 py-2 border ${view === "timeline" ? "bg-amber text-ink" : "border-hairline"}`}
          >
            Timeline
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto border border-hairline rounded-xl">
          <table className="min-w-full text-left">
            <thead className="bg-surface text-sm text-muted">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={event.id} className={index % 2 === 0 ? "bg-surface" : ""}>
                  <td className="px-4 py-3 font-medium">{event.type}</td>
                  <td className="px-4 py-3 text-sm break-words">
                    {event.type === "screenshot" || event.type === "video" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setViewerUrl((event.payload as any)?.url as string);
                            setViewerType(event.type === "video" ? "video" : "screenshot");
                            setViewerOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg border"
                        >
                          View
                        </button>
                        <span className="text-muted text-sm break-words max-w-xs">{(event.payload as any)?.url as string}</span>
                      </div>
                    ) : (
                      eventDetail(event) ?? "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{new Date(event.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <RecordEventTimeline events={events} />
      )}
      <MediaViewer open={viewerOpen} url={viewerUrl} type={viewerType} onClose={() => setViewerOpen(false)} />
    </section>
  );
}
