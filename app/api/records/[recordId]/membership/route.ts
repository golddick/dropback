import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/access";

export async function GET(
  req: NextRequest,
  { params }: { params: { recordId: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ isMember: false });

  const record = await prisma.testRecord.findUnique({
    where: { id: params.recordId },
  });
  if (!record) return NextResponse.json({ isMember: false });

  const membership = await getMembership(record.projectId, userId);
  return NextResponse.json({ isMember: !!membership });
}
