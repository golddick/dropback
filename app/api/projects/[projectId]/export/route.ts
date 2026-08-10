import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireMembership } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const VALID_FIELDS = new Set(["id", "url", "status", "note", "created_at"]);

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    await requireMembership(params.projectId, userId);
  } catch (error) {
    return NextResponse.json({ error: "You are not a member of this project." }, { status: 403 });
  }

  const body = (await req.json()) as { fields?: unknown };
  const fields = Array.isArray(body.fields)
    ? body.fields.filter((f: unknown): f is string => typeof f === "string" && VALID_FIELDS.has(f))
    : ["id", "status", "created_at"];

  const records = await prisma.testRecord.findMany({
    where: { projectId: params.projectId },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  const rows = records.map((record) => {
    const noteEvent = record.events.find((event) => event.type === "note" || event.type === "comment");
    const note = noteEvent?.payload && typeof noteEvent.payload === "object" && !Array.isArray(noteEvent.payload)
      ? (noteEvent.payload as Record<string, unknown>).text
      : "";
    return {
      id: record.id,
      url: record.url ?? "",
      status: record.status,
      note: typeof note === "string" ? note : "",
      created_at: record.createdAt.toISOString(),
    };
  });

  const header = fields.join(",");
  const csv = [header, ...rows.map((row) => fields.map((field) => JSON.stringify(row[field as keyof typeof row] ?? "")).join(","))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${params.projectId}-report.csv"`,
    },
  });
}
