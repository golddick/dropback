import { StatusBadge } from "@/components/StatusBadge";
import { RecordEventTimeline } from "@/components/RecordEventTimeline";
import { StatusControl } from "@/components/StatusControl";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireMembership } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { RecordEventsDisplay } from "@/components/RecordEventsDisplay";
import EditRecordButton from "../../../components/EditRecordButton";

export default async function RecordPage({ params }: { params: { recordId: string } }) {
  const recordId = params.recordId;

  const record = await prisma.testRecord.findUnique({
    where: { id: recordId },
    include: { reporter: true, events: { orderBy: { createdAt: "asc" } } },
  });

  if (!record) {
    return <main className="max-w-2xl mx-auto px-6 py-16">Record not found</main>;
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const isAuthenticated = Boolean(userId);

  if (isAuthenticated) {
    try {
      await requireMembership(record.projectId, userId);
    } catch {
      return <main className="max-w-2xl mx-auto px-6 py-16">You are not authorized to view this record.</main>;
    }
  }

  const firstNoteEvent = record.events.find((ev) => ev.type === "note" || ev.type === "comment");
  const firstAttachmentEvent = record.events.find((ev) => ev.type === "screenshot" || ev.type === "video");

  const events = record.events.map((e) => ({
    id: e.id,
    record_id: e.recordId,
    actor_id: e.actorId,
    type: e.type,
    payload: e.payload,
    created_at: e.createdAt.toISOString(),
  }));

  const currentNote =
    firstNoteEvent && typeof firstNoteEvent.payload === "object" && firstNoteEvent.payload !== null
      ? (firstNoteEvent.payload as any).text
      : "";

  const currentAttachment: { kind: "screenshot" | "video"; url: string } | null =
    firstAttachmentEvent && typeof firstAttachmentEvent.payload === "object" && firstAttachmentEvent.payload !== null
      ? {
          kind: firstAttachmentEvent.type as "screenshot" | "video",
          url: (firstAttachmentEvent.payload as any).url as string,
        }
      : null;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-6">
        <Link href={`/dashboard/${record.projectId}`} className="text-sm text-amber hover:underline inline-flex items-center gap-2">
          ← Back
        </Link>
      </div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs text-muted">{record.id}</p>
        <div className="flex items-center gap-3">
          <StatusBadge status={record.status} />
          {/* show edit button if current user is the reporter */}
          {isAuthenticated && userId === record.reporterId ? (
            // EditRecordButton is a client component that opens a modal to edit the record
            <EditRecordButton
              recordId={record.id}
              currentUrl={record.url ?? ""}
              currentNote={currentNote}
              currentAttachment={currentAttachment}
            />
          ) : null}
        </div>
      </div>
      {record.url && (
        <a href={record.url} className="text-amber text-sm font-mono block mb-8 hover:underline">
          {record.url}
        </a>
      )}

      <RecordEventsDisplay events={events} />

      <div className="mt-10 border-t border-hairline pt-6">
        <StatusControl recordId={record.id} currentStatus={record.status} />
      </div>
    </main>
  );
}
