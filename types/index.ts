import type { Prisma } from "@prisma/client";

export type Role = "tester" | "developer";

export type JsonValue = Prisma.JsonValue;
export type JsonObject = Prisma.JsonObject;

export type RecordStatus =
  | "open"
  | "in_progress"
  | "fixed_pending_retest"
  | "verified"
  | "still_broken"
  | "closed";

export type EventType =
  | "screenshot"
  | "video"
  | "note"
  | "status_change"
  | "comment";

export interface Project {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface TestRecord {
  id: string;
  project_id: string;
  reporter_id: string;
  url: string | null;
  status: RecordStatus;
  created_at: string;
}

export interface RecordEvent {
  id: string;
  record_id: string;
  actor_id: string;
  type: EventType;
  payload: JsonValue;
  created_at: string;
}

export const STATUS_LABELS: Record<RecordStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  fixed_pending_retest: "Fixed — Pending Retest",
  verified: "Verified",
  still_broken: "Still Broken",
  closed: "Closed",
};

export const STATUS_COLORS: Record<RecordStatus, string> = {
  open: "signal-red",
  in_progress: "amber",
  fixed_pending_retest: "amber",
  verified: "signal-green",
  still_broken: "signal-red",
  closed: "muted",
};
