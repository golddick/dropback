import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newRecordId, newEventId } from "@/lib/ids";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const { projectId, url, attachment, note } = body;
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const recordId = newRecordId();

  const events: any[] = [];
  if (attachment && attachment.url) {
    events.push({
      id: newEventId(),
      recordId,
      actorId: userId,
      type: attachment.kind === "video" ? "video" : "screenshot",
      payload: { url: attachment.url },
    });
  }

  if (note) {
    events.push({
      id: newEventId(),
      recordId,
      actorId: userId,
      type: "note",
      payload: { text: note },
    });
  }

  await prisma.$transaction([
    prisma.testRecord.create({ data: { id: recordId, projectId, reporterId: userId, url } }),
    ...events.map((e) => prisma.recordEvent.create({ data: e })),
  ]);

  return NextResponse.json({ recordId });
}
