import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newEventId } from "@/lib/ids";
import { requireMembership } from "@/lib/access";
import { sendStatusChangeEmail } from "@/lib/dropaphi";
import { RecordStatus } from "@prisma/client";

const VALID_STATUSES: RecordStatus[] = [
  "open",
  "in_progress",
  "fixed_pending_retest",
  "verified",
  "still_broken",
  "closed",
];

export async function POST(
  req: NextRequest,
  { params }: { params: { recordId: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const record = await prisma.testRecord.findUnique({
    where: { id: params.recordId },
    include: { reporter: true },
  });
  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  try {
    // Non-members are blocked — they must be invited and accept first.
    await requireMembership(record.projectId, userId);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }

  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const previousStatus = record.status;

  const [updated] = await prisma.$transaction([
    prisma.testRecord.update({
      where: { id: record.id },
      data: { status },
    }),
    prisma.recordEvent.create({
      data: {
        id: newEventId(),
        recordId: record.id,
        actorId: userId,
        type: "status_change",
        payload: { from: previousStatus, to: status },
      },
    }),
  ]);

  // Send a notification only when the report is marked as fixed.
  if (status === "fixed_pending_retest" && record.reporter.email) {
    const firstNote = await prisma.recordEvent.findFirst({
      where: { recordId: record.id, type: "note" },
    });
    const noteText =
      (firstNote?.payload as any)?.text ?? "your reported bug";

    try {
      await sendStatusChangeEmail(record.reporter.email, {
        recordNote: noteText,
        newStatus: status,
        recordUrl: `${process.env.NEXTAUTH_URL}/record/${record.id}`,
      });
    } catch (e) {
      console.error("Status-change notification failed", e);
    }
  }

  return NextResponse.json(updated);
}
