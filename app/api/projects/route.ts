import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newProjectId, newRecordId, newEventId } from "@/lib/ids";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: { records: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
  });

  console.log("projects", projects);
  console.log(userId, 'userid')

  const mapped = projects.map((p) => ({
    id: p.id,
    name: p.name,
    recordCount: p.records.length,
    verifiedCount: p.records.filter((r) => r.status === "verified").length,
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const name = body.name?.trim();
  const initialNote = body.initialNote?.trim();

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const projectId = newProjectId();
  const role = body.role === "tester" ? "tester" : body.role === "developer" ? "developer" : null;
  if (!role) {
    return NextResponse.json({ error: "role must be tester or developer" }, { status: 400 });
  }

  if (initialNote) {
    // create project + owner membership + initial record + note event in a transaction
    const recordId = newRecordId();
    const eventId = newEventId();

    await prisma.$transaction([
      prisma.project.create({
        data: { id: projectId, name, ownerId: userId },
      }),
      prisma.member.create({
        data: { projectId, userId, role },
      }),
      prisma.testRecord.create({
        data: { id: recordId, projectId, reporterId: userId },
      }),
      prisma.recordEvent.create({
        data: {
          id: eventId,
          recordId,
          actorId: userId,
          type: "note",
          payload: { text: initialNote },
        },
      }),
    ]);

    return NextResponse.json({ projectId, recordId });
  }

  await prisma.$transaction([
    prisma.project.create({
      data: { id: projectId, name, ownerId: userId },
    }),
    prisma.member.create({
      data: { projectId, userId, role },
    }),
  ]);

  return NextResponse.json({ projectId });
}
