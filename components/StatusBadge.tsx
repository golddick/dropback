import { RecordStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";

const COLOR_CLASSES: Record<string, string> = {
  "signal-red": "bg-signal-red/15 text-signal-red border-signal-red/30",
  amber: "bg-amber/15 text-amber border-amber/30",
  "signal-green": "bg-signal-green/15 text-signal-green border-signal-green/30",
  muted: "bg-muted/15 text-muted border-muted/30",
};

export function StatusBadge({ status }: { status: RecordStatus }) {
  const colorKey = STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-mono uppercase tracking-wide ${COLOR_CLASSES[colorKey]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
