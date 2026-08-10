import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newEventId } from "@/lib/ids";

export async function PATCH(req: Request, { params }: { params: { recordId: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const recordId = params.recordId;
  const body = await req.json();

  const record = await prisma.testRecord.findUnique({ where: { id: recordId } });
  if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });
  if (record.reporterId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates: any = {};
  if (Object.prototype.hasOwnProperty.call(body, "url")) {
    updates.url = body.url;
  }

  const noteProvided = Object.prototype.hasOwnProperty.call(body, "note");
  const attachment = body.attachment && typeof body.attachment === "object" ? body.attachment : null;

  const queries: any[] = [];
  if (Object.keys(updates).length > 0) {
    queries.push(prisma.testRecord.update({ where: { id: recordId }, data: updates }));
  }

  if (noteProvided) {
    const noteText = typeof body.note === "string" ? body.note : "";
    const existingNote = await prisma.recordEvent.findFirst({
      where: { recordId, type: { in: ["note", "comment"] } },
      orderBy: { createdAt: "asc" },
    });

    if (existingNote) {
      queries.push(
        prisma.recordEvent.update({
          where: { id: existingNote.id },
          data: { payload: { text: noteText } },
        })
      );
    } else {
      queries.push(
        prisma.recordEvent.create({
          data: {
            id: newEventId(),
            recordId,
            actorId: userId,
            type: "note",
            payload: { text: noteText },
          },
        })
      );
    }
  }

  if (attachment && attachment.url) {
    const existingAttachment = await prisma.recordEvent.findFirst({
      where: { recordId, type: { in: ["screenshot", "video"] } },
      orderBy: { createdAt: "asc" },
    });

    if (existingAttachment) {
      queries.push(
        prisma.recordEvent.update({
          where: { id: existingAttachment.id },
          data: {
            type: attachment.kind,
            payload: { url: attachment.url },
          },
        })
      );
    } else {
      queries.push(
        prisma.recordEvent.create({
          data: {
            id: newEventId(),
            recordId,
            actorId: userId,
            type: attachment.kind,
            payload: { url: attachment.url },
          },
        })
      );
    }
  }

  if (queries.length > 0) {
    await prisma.$transaction(queries);
  }

  return NextResponse.json({ ok: true });
}
